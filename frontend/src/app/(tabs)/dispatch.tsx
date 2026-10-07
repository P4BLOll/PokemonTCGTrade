import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  ScrollView,
  Platform,
  useWindowDimensions,
} from "react-native";
import { useLocalSearchParams, router, useFocusEffect } from "expo-router";
import { DesignTokens } from "@/constants/Tokens";
import { Header } from "@/components/header";
import { AeroIcon } from "@/components/AeroIcon";
import { useAuth } from "@/context/AuthContext";
import {
  DockedAsset,
  DispatchProposal,
  dockService,
  dispatchService,
} from "@/services/api";
import { INITIAL_DISPATCH_QUEUE, DispatchReservation } from "@/services/hangarData";
import { PixelShipView, getShipClassColor } from "@/components/PixelShipView";

const MISSION_ROUTES = [
  { id: "ROTA_ALPHA_PATRULHA", label: "ROTA ALPHA // PATRULHA DE DEFESA ORBITAL", cr: 450, risk: "BAIXO" },
  { id: "ROTA_KUIPER_MINERACAO", label: "ROTA KUIPER // EXTRAÇÃO DE MINÉRIO PESADO", cr: 820, risk: "MÉDIO" },
  { id: "ROTA_KRONOS_ESCOLTA", label: "ROTA KRONOS // ESCOLTA DE CARGUEIRO ESTELAR", cr: 1200, risk: "ALTO" },
  { id: "ROTA_DEEP_VOID_RECON", label: "ROTA DEEP VOID // RECONHECIMENTO FURTIVO ULTRA-ALCANCE", cr: 2400, risk: "EXTREMO" },
];

// Tela de Despacho: exibe naves alocadas, ordens pendentes e o laboratório de concorrência RabbitMQ
export default function DispatchScreen() {
  const { user, isAdmin } = useAuth();
  const { width } = useWindowDimensions();
  const isDesktop = width >= DesignTokens.breakpoints.desktop;
  const params = useLocalSearchParams();

  // Controla as abas internas do console:
  // Para ADMIN: Fila de Despacho ("queueBuffer") e Histórico Global ("history")
  // Para PILOTO: Minhas Naves ("myAllocated") e Histórico Pessoal ("history")
  const [activeConsoleTab, setActiveConsoleTab] = useState<
    "myAllocated" | "queueBuffer" | "history"
  >(isAdmin ? "queueBuffer" : "myAllocated");

  useEffect(() => {
    if (isAdmin && activeConsoleTab === "myAllocated") {
      setActiveConsoleTab("queueBuffer");
    } else if (!isAdmin && activeConsoleTab === "queueBuffer") {
      setActiveConsoleTab("myAllocated");
    }
  }, [isAdmin]);

  // Naves do hangar central, naves na baía do piloto logado e histórico de propostas
  const [stationFleet, setStationFleet] = useState<DockedAsset[]>([]);
  const [myDocks, setMyDocks] = useState<DockedAsset[]>([]);
  const [allOrders, setAllOrders] = useState<DispatchProposal[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal de Requisição de Nave da Estação
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStationShip, setSelectedStationShip] = useState<DockedAsset | null>(null);
  const [selectedRoute, setSelectedRoute] = useState(MISSION_ROUTES[0]);
  const [actionLoading, setActionLoading] = useState(false);
  const [terminalMessage, setTerminalMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  // Buffer da Fila de Despacho (apenas ordens reais em processamento)
  const [dispatchQueue, setDispatchQueue] = useState<DispatchReservation[]>([]);

  const showTerminalMsg = (text: string, type: "success" | "error" | "info" = "success") => {
    setTerminalMessage({ type, text });
    setTimeout(() => setTerminalMessage(null), 7000);
  };

  const loadData = async (silent = false) => {
    if (!user) return;
    try {
      if (!silent) setLoading(true);
      const ordersPromise = isAdmin
        ? dispatchService.getAllOrders().catch(() => dispatchService.getMyOrders(user).catch(() => []))
        : dispatchService.getMyOrders(user).catch(() => []);

      const [stationData, myDockData, ordersData, pendingOrders] = await Promise.all([
        dispatchService.getStationFleet().catch(() => ({ id: "", officerUsername: "station_alpha_7", assets: [], ships: [], cards: [] })),
        dockService.getDock(user).catch(() => ({ id: "", officerUsername: user, assets: [], ships: [], cards: [] })),
        ordersPromise,
        dispatchService.getPending().catch(() => []),
      ]);

      const sortedOrders = (ordersData || []).slice().sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });

      // Mapeia ordens pendentes reais em tempo real para a fila de despacho operacional
      const liveQueue: DispatchReservation[] = (pendingOrders || []).map((p, idx) => {
        const rawName = p.offeredInstanceId?.replace(/^inst-/, "").replace(/^station-/, "");
        return {
          id: p.id || `live-pend-${idx}`,
          position: idx + 1,
          shipCode: p.offeredInstanceId?.toUpperCase() || "ORDEM",
          shipName: rawName ? rawName.toUpperCase() : "VETOR EM DESPACHO",
          pilotCallsign: `@${(p.receiverUsername || p.senderUsername || "PILOTO").toUpperCase()}`,
          status: "PROCESSING_LOCK",
          targetSector: p.requestedInstanceId || "ROTA ALPHA // DEFESA ORBITAL",
          submittedAt: p.createdAt ? new Date(p.createdAt).toLocaleTimeString("pt-BR") : "AO VIVO",
          holdTimeSeconds: 45,
        };
      });

      setStationFleet(stationData.ships || stationData.assets || []);
      setMyDocks(isAdmin ? [] : (myDockData.ships || myDockData.assets || []));
      setAllOrders(sortedOrders);
      setDispatchQueue(liveQueue);
    } catch (e) {
      console.warn("Hangar API offline:", e);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const timer = setInterval(() => {
      loadData(true);
    }, 4000);
    return () => clearInterval(timer);
  }, [user, isAdmin]);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [user, isAdmin])
  );

  useEffect(() => {
    if (params?.requisitar && typeof params.requisitar === "string") {
      router.push("/(tabs)/docks");
    }
  }, [params?.requisitar]);

  // Transmitir requisição de nave à Estação Central
  const handleRequestShip = async () => {
    if (!selectedStationShip) {
      showTerminalMsg("[!] ERRO: SELECIONE UMA NAVE DISPONÍVEL NA ESTAÇÃO CENTRAL.", "error");
      return;
    }
    if (!user) return;
    if (isAdmin) {
      showTerminalMsg("[!] AVISO: ADMINISTRADORES NÃO RESERVAM NAVES. APENAS SUPERVISIONAM.", "info");
      setModalVisible(false);
      return;
    }
    setActionLoading(true);
    try {
      await dispatchService.requestShipFromStation(
        user,
        selectedStationShip.instanceId,
        selectedRoute.id
      );
      const shipName = selectedStationShip.assetName || selectedStationShip.name || "NAVE";
      showTerminalMsg(
        `[+] SUCESSO: NAVE [${shipName}] REQUISITADA À ESTAÇÃO CENTRAL COM SUCESSO!`
      );
      setModalVisible(false);
      setSelectedStationShip(null);
      await loadData();
      // Re-sincroniza com as filas do RabbitMQ após a liquidação
      setTimeout(() => loadData(true), 700);
      setTimeout(() => loadData(true), 1500);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "FALHA NO DESPACHO DA ESTAÇÃO.";
      showTerminalMsg(`[!] BLOQUEIO DE DESPACHO: ${msg}`, "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Devolver nave alocada de volta para a Estação Central
  const handleReturnShip = async (instanceId: string, shipName: string) => {
    if (!user) return;
    setActionLoading(true);
    try {
      await dispatchService.returnShipToStation(instanceId, user);
      showTerminalMsg(
        `[⮌] NAVE [${shipName}] RETORNADA COM SUCESSO À DOCA DA ESTAÇÃO CENTRAL ALPHA-7.`,
        "info"
      );
      setMyDocks((prev) => prev.filter((s) => s.instanceId !== instanceId));
      await loadData();
      // Re-sincroniza com a liberação de docas
      setTimeout(() => loadData(true), 700);
      setTimeout(() => loadData(true), 1500);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "FALHA AO DEVOLVER NAVE.";
      showTerminalMsg(`[!] ERRO NA DEVOLUÇÃO: ${msg}`, "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Cancelar ou revogar ordem pendente
  const handleAbortOrder = async (orderId: string) => {
    if (!user) return;
    setActionLoading(true);
    try {
      await dispatchService.cancel(orderId, user);
      showTerminalMsg(`[-] ORDEM DE DESPACHO CANCELADA. VETOR LIBERADO.`);
      await loadData();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "FALHA AO CANCELAR.";
      showTerminalMsg(`[!] ERRO AO CANCELAR: ${msg}`, "error");
    } finally {
      setActionLoading(false);
    }
  };



  const currentUser = user?.toLowerCase() || "";

  return (
    <View style={styles.container}>
      <Header
        title={isAdmin ? "[03 // SUPERVISÃO_ESTAÇÃO_CENTRAL]" : "[03 // CENTRAL_STATION_DISPATCH]"}
        subtitle={
          isAdmin
            ? "ESTAÇÃO CENTRAL ORBITAL ALPHA-7 // AUDITORIA DA FILA DE DESPACHO E HISTÓRICO GLOBAL"
            : "ESTAÇÃO CENTRAL ORBITAL ALPHA-7 // TERMINAL DE ALOCAÇÃO DE FROTA & DESPACHO"
        }
        badgeText={isAdmin ? "MODO SUPERVISOR [ADMIN]" : "DEPOT CENTRAL [ONLINE]"}
      />

      {/* TERMINAL STATUS BAR */}
      <View style={styles.statusBarWrapper}>
        <View style={styles.statusCluster}>
          <Text style={styles.statusLabel}>DEPOT:</Text>
          <Text style={styles.statusValue}>ESTAÇÃO_CENTRAL_ALPHA_7</Text>
        </View>
        <View style={styles.statusCluster}>
          <Text style={styles.statusLabel}>STATUS:</Text>
          <Text style={styles.statusValue}>OPERACIONAL [ONLINE]</Text>
        </View>
        <View style={styles.statusCluster}>
          <Text style={styles.statusLabel}>FUNÇÃO:</Text>
          <Text style={[styles.statusValue, { color: isAdmin ? DesignTokens.colors.amber : DesignTokens.colors.textPrimary }]}>
            {isAdmin ? "SUPERVISÃO_E_FILA [AUDITORIA]" : "CENTRAL_AO_PILOTO"}
          </Text>
        </View>
        <View style={styles.statusCluster}>
          <Text style={styles.statusLabel}>CANAL_COMANDO:</Text>
          <Text style={[styles.statusValue, { color: DesignTokens.colors.textPrimary }]}>
            SEGURO [ATIVO]
          </Text>
        </View>
      </View>

      {/* FEEDBACK TERMINAL NOTIFICATION */}
      {terminalMessage && (
        <View
          style={[
            styles.terminalAlert,
            terminalMessage.type === "error"
              ? styles.alertError
              : terminalMessage.type === "info"
              ? styles.alertInfo
              : styles.alertSuccess,
          ]}
        >
          <AeroIcon
            name={
              terminalMessage.type === "error"
                ? "warning"
                : terminalMessage.type === "info"
                ? "info"
                : "checkmark"
            }
            size={16}
            color={
              terminalMessage.type === "error"
                ? DesignTokens.colors.alert
                : terminalMessage.type === "info"
                ? DesignTokens.colors.textPrimary
                : DesignTokens.colors.amber
            }
            style={{ marginRight: 8 }}
          />
          <Text style={styles.alertText}>{terminalMessage.text}</Text>
        </View>
      )}

      {/* CONSOLE NAVIGATION TABS */}
      <View style={styles.tabsRow}>
        {!isAdmin && (
          <TouchableOpacity
            style={[styles.tabButton, activeConsoleTab === "myAllocated" && styles.tabButtonActive]}
            onPress={() => setActiveConsoleTab("myAllocated")}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeConsoleTab === "myAllocated" ? styles.tabButtonTextActive : styles.tabButtonTextInactive,
              ]}
            >
              [ 01 // MINHAS_NAVES_ALOCADAS ({myDocks.length}) ]
            </Text>
          </TouchableOpacity>
        )}

        {isAdmin && (
          <TouchableOpacity
            style={[styles.tabButton, activeConsoleTab === "queueBuffer" && styles.tabButtonActive]}
            onPress={() => setActiveConsoleTab("queueBuffer")}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeConsoleTab === "queueBuffer" ? styles.tabButtonTextActive : styles.tabButtonTextInactive,
              ]}
            >
              [ 01 // FILA_GLOBAL_ESTAÇÃO ({dispatchQueue.length}) ]
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.tabButton, activeConsoleTab === "history" && styles.tabButtonActive]}
          onPress={() => setActiveConsoleTab("history")}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeConsoleTab === "history" ? styles.tabButtonTextActive : styles.tabButtonTextInactive,
            ]}
          >
            [ {isAdmin ? "02 // HISTÓRICO_GLOBAL_MISSÕES" : "02 // MINHAS_ORDENS_E_MISSÕES"} ({allOrders.length}) ]
          </Text>
        </TouchableOpacity>
      </View>

      {/* MAIN CONSOLE BODY */}
      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        {/* TOP ACTIONS ROW */}
        <View style={styles.actionsBar}>
          {!isAdmin ? (
            <TouchableOpacity
              style={styles.primaryActionButton}
              onPress={() => router.push("/(tabs)/docks")}
              activeOpacity={0.8}
            >
              <AeroIcon name="add" size={16} color={DesignTokens.colors.bgDeep} />
              <Text style={styles.primaryActionText}>
                + REQUISITAR NAVE NO HANGAR (DOCK_BAYS)
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.adminSupervisorBadge}>
              <AeroIcon name="shield" size={14} color={DesignTokens.colors.amber} />
              <Text style={styles.adminSupervisorText}>
                MODO SUPERVISOR // AUDITORIA DA FILA E HISTÓRICO GLOBAL
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.refreshButton, loading && { opacity: 0.6 }]}
            onPress={() => loadData(false)}
            activeOpacity={0.8}
            disabled={loading}
          >
            <AeroIcon name="refresh" size={14} color={DesignTokens.colors.amber} />
            <Text style={styles.refreshButtonText}>
              {loading ? "SINCRONIZANDO..." : "⟳ ATUALIZAR STATUS"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── TAB 01: MINHAS NAVES ALOCADAS (DOCAS PESSOAIS) ── */}
        {activeConsoleTab === "myAllocated" && (
          <View style={styles.allocatedContainer}>
            {myDocks.length > 0 ? (
              <View style={styles.allocatedBanner}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.allocatedBannerTitle}>
                    FROTA ALOCADA PARA O PILOTO @{currentUser.toUpperCase()} [{myDocks.length} VETORES ATIVOS]
                  </Text>
                  <Text style={styles.allocatedBannerDesc}>
                    Naves requisitadas da Estação Central operando atualmente sob sua coordenação. Devolva a nave quando concluir sua rota para disponibilizá-la a outros oficiais.
                  </Text>
                </View>
              </View>
            ) : (
              <View style={[styles.allocatedBanner, { borderColor: DesignTokens.colors.amberDim, backgroundColor: "transparent" }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.allocatedBannerTitle, { color: DesignTokens.colors.amber }]}>
                    DOCA PESSOAL // NENHUM VETOR EM OPERAÇÃO
                  </Text>
                  <Text style={styles.allocatedBannerDesc}>
                    O oficial @{currentUser.toUpperCase()} não possui nenhuma nave alocada no momento. Acesse a planta do Hangar (DOCK_BAYS) para inspecionar e requisitar um vetor.
                  </Text>
                </View>
              </View>
            )}

            {myDocks.length === 0 ? (
              <View style={styles.emptyNoticeCard}>
                <AeroIcon name="airplane" size={36} color={DesignTokens.colors.amberMid} />
                <Text style={styles.emptyTitle}>NENHUMA NAVE ALOCADA NESTA DOCA</Text>
                <Text style={styles.emptySubtitle}>
                  Acesse o Hangar Central (DOCK_BAYS) para inspecionar os protótipos e emitir uma ordem de despacho via RabbitMQ.
                </Text>
                <TouchableOpacity
                  style={[styles.primaryActionButton, { marginTop: 16 }]}
                  onPress={() => router.push("/(tabs)/docks")}
                >
                  <AeroIcon name="arrow-back" size={14} color={DesignTokens.colors.bgDeep} />
                  <Text style={styles.primaryActionText}>IR PARA O HANGAR (DOCK_BAYS)</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={[styles.shipsGrid, isDesktop && styles.shipsGridDesktop]}>
                {myDocks.map((ship) => {
                  const shipName = ship.assetName || ship.name || "NAVE";
                  const shipId = ship.assetId || "";
                  const isRare =
                    ship.rarity === "SECRET_RARE" ||
                    shipId.includes("proto") ||
                    shipName.toUpperCase().includes("PROTO") ||
                    shipName.toUpperCase().includes("STARHAWK");
                  const shipColor = getShipClassColor(ship.type, isRare, shipName);

                  return (
                    <View
                      key={ship.instanceId}
                      style={[
                        styles.myShipCard,
                        {
                          borderTopColor: shipColor,
                          borderTopWidth: 1,
                          borderLeftColor: shipColor,
                          borderLeftWidth: 1,
                          borderColor: `${shipColor}55`,
                        },
                      ]}
                    >
                      <View style={styles.stationShipHeader}>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.shipCardCode, { color: shipColor }]}>{ship.instanceId.toUpperCase()}</Text>
                          <Text style={[styles.shipCardName, { color: shipColor }]}>{shipName}</Text>
                        </View>
                        <View style={[styles.availabilityBadge, { borderColor: shipColor, backgroundColor: `${shipColor}1F` }]}>
                          <Text style={[styles.availabilityText, { color: shipColor }]}>
                            ALOCADA ATIVA
                          </Text>
                        </View>
                      </View>

                      <View
                        style={[
                          styles.shipVisualBox,
                          { borderColor: `${shipColor}4D`, backgroundColor: `${shipColor}08` },
                        ]}
                      >
                        <PixelShipView shipClass={ship.type as any} color={shipColor} size={64} showBlueprintGrid />
                        {isRare && (
                          <View style={[styles.prototypeRibbon, { borderColor: shipColor, backgroundColor: `${shipColor}26` }]}>
                            <Text style={[styles.prototypeRibbonText, { color: shipColor }]}>PROTÓTIPO</Text>
                          </View>
                        )}
                      </View>

                      <View style={styles.shipSpecsRow}>
                        <View style={styles.specItem}>
                          <Text style={styles.specLabel}>VETOR:</Text>
                          <Text style={[styles.specValue, { color: shipColor }]}>{ship.type}</Text>
                        </View>
                        <View style={styles.specItem}>
                          <Text style={styles.specLabel}>OFICIAL:</Text>
                          <Text style={[styles.specValue, { color: DesignTokens.colors.textPrimary }]}>
                            @{currentUser.toUpperCase()}
                          </Text>
                        </View>
                      </View>

                      {/* BOTÃO DE DEVOLUÇÃO À ESTAÇÃO CENTRAL */}
                      <TouchableOpacity
                        style={styles.returnBtn}
                        disabled={actionLoading}
                        onPress={() => handleReturnShip(ship.instanceId, shipName)}
                      >
                        <AeroIcon name="arrow-back" size={14} color={DesignTokens.colors.textPrimary} />
                        <Text style={styles.returnBtnText}>
                          DEVOLVER À ESTAÇÃO CENTRAL
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* ── TAB 02: FILA DE DESPACHO (EXCLUSIVO ROLE_ADMIN) ── */}
        {activeConsoleTab === "queueBuffer" && isAdmin && (
          <View style={styles.concurrencyLabContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>
                [ ORDENS DE VOO // FILA DE DESPACHO OPERACIONAL ]
              </Text>
              <Text style={styles.sectionSubtitle}>
                Acompanhamento em tempo real da sequência de descolagem e liberação de docas
              </Text>
            </View>

            {/* STATUS OVERVIEW */}
            <View style={styles.depotBanner}>
              <View style={{ flex: 1 }}>
                <Text style={styles.depotBannerTitle}>
                  CENTRAL DE DESPACHO // ESTAÇÃO ALPHA-7
                </Text>
                <Text style={styles.depotBannerDesc}>
                  Ordens de voo processadas sequencialmente por ordem de autorização e disponibilidade.
                </Text>
              </View>
              <View style={[styles.depotCountBadge, { borderColor: DesignTokens.colors.amber }]}>
                <Text style={[styles.depotCountNum, { color: DesignTokens.colors.textPrimary }]}>
                  {dispatchQueue.length}
                </Text>
                <Text style={styles.depotCountLabel}>ORDENS NA FILA</Text>
              </View>
            </View>

            {/* QUEUE TABLE SNAPSHOT */}
            <View style={styles.queueTableCard}>
              <Text style={styles.queueTableTitle}>
                [ ESTADO ATUAL DA FILA DE DESPACHO ]
              </Text>
              {dispatchQueue.length === 0 ? (
                <View style={{ padding: 24, alignItems: "center" }}>
                  <Text style={[styles.queueSubInfo, { textAlign: "center", color: DesignTokens.colors.textSecondary }]}>
                    NENHUMA ORDEM PENDENTE NA FILA DE DESPACHO OPERACIONAL.
                  </Text>
                </View>
              ) : (
                dispatchQueue.map((item) => (
                  <View key={item.id} style={styles.queueRowItem}>
                    <View style={styles.queuePosBadge}>
                      <Text style={styles.queuePosText}>#{item.position}</Text>
                    </View>
                    <View style={{ flex: 1, paddingHorizontal: 12 }}>
                      <Text style={styles.queueShipCode}>
                        {item.shipCode} — {item.shipName}
                      </Text>
                      <Text style={styles.queueSubInfo}>
                        REQUISITANTE: {item.pilotCallsign} // ORIGEM: ESTAÇÃO CENTRAL ALPHA-7
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.queueStatusBadge,
                        item.status === "PROCESSING_LOCK"
                          ? styles.statusBadgeLock
                          : styles.statusBadgeWaiting,
                      ]}
                    >
                      <Text
                        style={[
                          styles.queueStatusText,
                          item.status === "PROCESSING_LOCK"
                            ? { color: DesignTokens.colors.amber }
                            : { color: DesignTokens.colors.textSecondary },
                        ]}
                      >
                        {item.status === "PROCESSING_LOCK" ? "EM LIBERAÇÃO" : "AGUARDANDO"}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>
        )}

        {/* ── TAB 04: LOGS DE MISSÃO & AUDITORIA ── */}
        {activeConsoleTab === "history" && (
          <View style={styles.directivesList}>
            {allOrders.length === 0 ? (
              <View style={styles.emptyNoticeCard}>
                <AeroIcon name="file-tray" size={36} color={DesignTokens.colors.amberDim} />
                <Text style={styles.emptyTitle}>NENHUM HISTÓRICO DE DESPACHO REGISTRADO</Text>
                <Text style={styles.emptySubtitle}>
                  Requisições e devoluções de naves aparecerão aqui para auditoria.
                </Text>
              </View>
            ) : (
              allOrders.map((order) => {
                const isStationDispatch = order.senderUsername?.toLowerCase() === "station_alpha_7";
                const isStationReturn = order.receiverUsername?.toLowerCase() === "station_alpha_7";
                const orderTime = order.createdAt ? new Date(order.createdAt).getTime() : 0;
                const isRecent = orderTime > 0 && (Date.now() - orderTime) < 180000;

                const formatOrderDate = (iso?: string) => {
                  if (!iso) return "--:--:--";
                  try {
                    const dt = new Date(iso);
                    if (isNaN(dt.getTime())) return iso;
                    return `${dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })} às ${dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`;
                  } catch {
                    return iso;
                  }
                };

                return (
                  <View
                    key={order.id}
                    style={[
                      styles.directiveCard,
                      isStationReturn && styles.directiveCardReturn,
                      isStationDispatch && styles.directiveCardDispatch,
                    ]}
                  >
                    <View style={styles.cardHeaderBar}>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                          <Text style={styles.directiveIdText}>ORDEM_DESPACHO #{order.id.slice(-6).toUpperCase()}</Text>
                          {isStationReturn && (
                            <View style={styles.typeBadgeReturn}>
                              <Text style={styles.typeBadgeReturnText}>[ ⮌ DEVOLUÇÃO À ESTAÇÃO ]</Text>
                            </View>
                          )}
                          {isStationDispatch && (
                            <View style={styles.typeBadgeDispatch}>
                              <Text style={styles.typeBadgeDispatchText}>[ ➔ ALOCAÇÃO / REQUISIÇÃO ]</Text>
                            </View>
                          )}
                          {!isStationReturn && !isStationDispatch && (
                            <View style={styles.typeBadgePeer}>
                              <Text style={styles.typeBadgePeerText}>[ ⇄ CESSÃO ENTRE OFICIAIS ]</Text>
                            </View>
                          )}
                          {isRecent && (
                            <View style={styles.recentBadge}>
                              <Text style={styles.recentBadgeText}>● RECÉM-ATUALIZADO</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.timestampText}>
                          DATA/HORA: {formatOrderDate(order.createdAt)}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.dispatchStatusPill,
                          order.status === "PENDING"
                            ? styles.statusPillPending
                            : order.status === "ACCEPTED"
                            ? styles.statusPillAccepted
                            : styles.statusPillCancelled,
                        ]}
                      >
                        <Text style={styles.dispatchStatusText}>
                          {order.status === "ACCEPTED" ? "CONCLUÍDO / LIQUIDADO" : order.status}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.manifestSlip}>
                      <View style={styles.slipHalf}>
                        <Text style={styles.slipSideLabel}>[ ORIGEM DO VETOR ]</Text>
                        <Text style={styles.slipPilotName}>
                          {isStationDispatch ? "ESTAÇÃO CENTRAL ALPHA-7" : `@${order.senderUsername.toUpperCase()}`}
                        </Text>
                        <Text style={styles.assetCodeText}>NAVE / ATIVO: {order.offeredInstanceId}</Text>
                      </View>

                      <View style={styles.exchangeIndicator}>
                        <AeroIcon
                          name={isStationReturn ? "arrow-back" : "arrow-forward"}
                          size={20}
                          color={isStationReturn ? "#00ffff" : DesignTokens.colors.amber}
                        />
                        <Text style={[styles.exchangeText, isStationReturn && { color: "#00ffff" }]}>
                          {isStationReturn ? "RETORNO" : "DESPACHO"}
                        </Text>
                      </View>

                      <View style={styles.slipHalf}>
                        <Text style={styles.slipSideLabel}>[ DESTINATÁRIO / ROTA ]</Text>
                        <Text style={styles.slipPilotName}>
                          {isStationReturn ? "ESTAÇÃO CENTRAL ALPHA-7 (DEVOLVIDA)" : `@${order.receiverUsername.toUpperCase()}`}
                        </Text>
                        <Text style={styles.assetCodeText}>ROTA / DESTINO: {order.requestedInstanceId}</Text>
                      </View>
                    </View>

                    {order.status === "PENDING" && (
                      <View style={styles.cardActionsRow}>
                        <TouchableOpacity
                          style={styles.cancelButton}
                          onPress={() => handleAbortOrder(order.id)}
                          disabled={actionLoading}
                        >
                          <AeroIcon name="close" size={16} color={DesignTokens.colors.alert} />
                          <Text style={styles.cancelButtonText}>REVOGAR ORDEM</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </View>
        )}
      </ScrollView>

      {/* ── MODAL: REQUISITAR NAVE DA ESTAÇÃO CENTRAL ── */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                [ + REQUISIÇÃO DE NAVE // ESTAÇÃO CENTRAL ALPHA-7 ]
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <AeroIcon name="close" size={20} color={DesignTokens.colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* ORIGEM E DESTINO */}
              <View style={styles.modalDepotInfoRow}>
                <View style={styles.modalDepotCol}>
                  <Text style={styles.modalSubLabel}>DEPOT DE ORIGEM:</Text>
                  <Text style={styles.modalHighlightText}>ESTAÇÃO CENTRAL ALPHA-7</Text>
                </View>
                <AeroIcon name="arrow-forward" size={18} color={DesignTokens.colors.amber} />
                <View style={styles.modalDepotCol}>
                  <Text style={styles.modalSubLabel}>OFICIAL REQUISITANTE:</Text>
                  <Text style={[styles.modalHighlightText, { color: DesignTokens.colors.textPrimary }]}>
                    @{currentUser.toUpperCase()}
                  </Text>
                </View>
              </View>

              {/* VETOR SELECIONADO PARA DESPACHO */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>VETOR SELECIONADO PARA DESPACHO:</Text>
                {selectedStationShip && (() => {
                  const shipName = selectedStationShip.assetName || selectedStationShip.name || "NAVE";
                  const shipId = selectedStationShip.assetId || "";
                  const isModalRare =
                    selectedStationShip.rarity === "SECRET_RARE" ||
                    shipId.includes("proto") ||
                    shipName.toUpperCase().includes("PROTO") ||
                    shipName.toUpperCase().includes("STARHAWK");
                  const modalShipColor = getShipClassColor(
                    selectedStationShip.type,
                    isModalRare,
                    shipName
                  );

                  return (
                    <View
                      style={[
                        styles.selectedShipPreview,
                        {
                          borderLeftColor: modalShipColor,
                          borderLeftWidth: 1,
                          borderColor: `${modalShipColor}66`,
                          backgroundColor: `${modalShipColor}0A`,
                        },
                      ]}
                    >
                      <PixelShipView shipClass={selectedStationShip.type as any} color={modalShipColor} size={70} showBlueprintGrid />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={[styles.previewName, { color: modalShipColor }]}>{shipName}</Text>
                        <Text style={[styles.previewCode, { color: modalShipColor }]}>{selectedStationShip.instanceId.toUpperCase()}</Text>
                        <Text style={styles.previewSpecs}>
                          CLASSE: {selectedStationShip.type} | RARIDADE: {selectedStationShip.rarity}
                        </Text>
                      </View>
                    </View>
                  );
                })()}
              </View>

              {/* SELEÇÃO DA ROTA / MISSÃO */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>OBJETIVO / ROTA OPERACIONAL:</Text>
                {MISSION_ROUTES.map((route) => {
                  const isSelected = selectedRoute.id === route.id;
                  return (
                    <TouchableOpacity
                      key={route.id}
                      style={[styles.routeItem, isSelected && styles.routeItemSelected]}
                      onPress={() => setSelectedRoute(route)}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.routeLabel, isSelected && { color: DesignTokens.colors.textPrimary }]}>
                          {route.label}
                        </Text>
                        <Text style={styles.routeMeta}>
                          RISCO: {route.risk} // SUBSÍDIO DE MISSÃO: {route.cr} CR
                        </Text>
                      </View>
                      <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]} />
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* TERMO DE ALOCAÇÃO CENTRAL */}
              <View style={styles.directiveSummaryBox}>
                <Text style={styles.summaryTitle}>[ TERMO DE DESPACHO DA ESTAÇÃO CENTRAL ]</Text>
                <Text style={styles.summaryText}>
                  A Estação Central alocará este vetor espacial para a sua doca de operações. Quando concluir a missão, devolva o vetor para liberação das baias centrais.
                </Text>
              </View>
            </ScrollView>

            {/* MODAL FOOTER */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[
                  styles.modalSubmitButton,
                  (actionLoading || !selectedStationShip) && styles.modalSubmitButtonDisabled,
                ]}
                onPress={handleRequestShip}
                disabled={actionLoading || !selectedStationShip}
              >
                {actionLoading ? (
                  <ActivityIndicator size="small" color={DesignTokens.colors.bgDeep} />
                ) : (
                  <>
                    <AeroIcon name="send" size={16} color={selectedStationShip ? DesignTokens.colors.bgDeep : DesignTokens.colors.amberMid} />
                    <Text
                      style={[
                        styles.modalSubmitText,
                        !selectedStationShip && styles.modalSubmitTextDisabled,
                      ]}
                    >
                      CONFIRMAR REQUISIÇÃO DE NAVE
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignTokens.colors.bgDeep,
  },
  statusBarWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: "transparent",
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.amberDim,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 16,
  },
  statusCluster: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusLabel: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 11,
    color: DesignTokens.colors.textSecondary,
  },
  statusValue: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 11,
    color: DesignTokens.colors.textPrimary,
    fontWeight: "bold",
  },
  terminalAlert: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  alertSuccess: {
    backgroundColor: "transparent",
    borderBottomColor: DesignTokens.colors.amber,
  },
  alertError: {
    backgroundColor: "transparent",
    borderBottomColor: DesignTokens.colors.alert,
  },
  alertInfo: {
    backgroundColor: "transparent",
    borderBottomColor: DesignTokens.colors.textSecondary,
  },
  alertText: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 11,
    color: DesignTokens.colors.textPrimary,
    flex: 1,
  },
  tabsRow: {
    flexDirection: "row",
    backgroundColor: "transparent",
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.amberDim,
    flexWrap: "wrap",
    padding: 8,
    gap: 6,
  },
  tabButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: DesignTokens.colors.amberDim,
    backgroundColor: "transparent",
  },
  tabButtonActive: {
    backgroundColor: DesignTokens.colors.amber, // Fundo sólido #FFB000
    borderColor: DesignTokens.colors.amber,
  },
  tabButtonText: {
    fontFamily: DesignTokens.typography.fonts.pixel,
    fontSize: 12,
    letterSpacing: 0.5,
  },
  tabButtonTextInactive: {
    color: DesignTokens.colors.textPrimary, // Luminoso para leitura
  },
  tabButtonTextActive: {
    color: DesignTokens.colors.bgDeep, // Contraste escuro #050200
    fontWeight: "bold",
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 90,
  },
  actionsBar: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  primaryActionButton: {
    backgroundColor: DesignTokens.colors.amber,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  primaryActionText: {
    fontFamily: DesignTokens.typography.fonts.pixel,
    fontSize: 12,
    color: DesignTokens.colors.bgDeep,
    fontWeight: "bold",
  },
  secondaryActionButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: DesignTokens.colors.amberDim,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  secondaryActionText: {
    fontFamily: DesignTokens.typography.fonts.pixel,
    fontSize: 12,
    color: DesignTokens.colors.textPrimary,
  },
  refreshButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: DesignTokens.colors.amber,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  refreshButtonText: {
    fontFamily: DesignTokens.typography.fonts.pixel,
    fontSize: 12,
    color: DesignTokens.colors.amber,
    fontWeight: "bold",
  },
  adminSupervisorBadge: {
    backgroundColor: "rgba(255, 176, 0, 0.08)",
    borderWidth: 1,
    borderColor: DesignTokens.colors.amber,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  adminSupervisorText: {
    fontFamily: DesignTokens.typography.fonts.pixel,
    fontSize: 11,
    color: DesignTokens.colors.amber,
    letterSpacing: 0.5,
  },
  directiveCardReturn: {
    borderLeftWidth: 3,
    borderLeftColor: "#00ffff",
  },
  directiveCardDispatch: {
    borderLeftWidth: 3,
    borderLeftColor: DesignTokens.colors.amber,
  },
  typeBadgeReturn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: "#00ffff",
    backgroundColor: "rgba(0, 255, 255, 0.1)",
  },
  typeBadgeReturnText: {
    fontFamily: DesignTokens.typography.fonts.pixel,
    fontSize: 10,
    color: "#00ffff",
    fontWeight: "bold",
  },
  typeBadgeDispatch: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: DesignTokens.colors.amber,
    backgroundColor: "rgba(255, 176, 0, 0.1)",
  },
  typeBadgeDispatchText: {
    fontFamily: DesignTokens.typography.fonts.pixel,
    fontSize: 10,
    color: DesignTokens.colors.amber,
    fontWeight: "bold",
  },
  typeBadgePeer: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: DesignTokens.colors.textSecondary,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  typeBadgePeerText: {
    fontFamily: DesignTokens.typography.fonts.pixel,
    fontSize: 10,
    color: DesignTokens.colors.textSecondary,
  },
  recentBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: "#39ff14",
    backgroundColor: "rgba(57, 255, 20, 0.12)",
  },
  recentBadgeText: {
    fontFamily: DesignTokens.typography.fonts.pixel,
    fontSize: 10,
    color: "#39ff14",
    fontWeight: "bold",
  },
  stationDepotContainer: {
    gap: 16,
  },
  depotBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: DesignTokens.colors.amberDim,
    padding: 14,
    gap: 12,
  },
  depotBannerTitle: {
    fontFamily: DesignTokens.typography.fonts.pixel,
    fontSize: 13,
    color: DesignTokens.colors.textPrimary,
  },
  depotBannerDesc: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 11,
    color: DesignTokens.colors.textSecondary,
    marginTop: 4,
  },
  depotCountBadge: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: DesignTokens.colors.amberDim,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  depotCountNum: {
    fontFamily: DesignTokens.typography.fonts.pixel,
    fontSize: 20,
    color: DesignTokens.colors.textPrimary,
  },
  depotCountLabel: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 11,
    color: DesignTokens.colors.textSecondary,
  },
  shipsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  shipsGridDesktop: {
    justifyContent: "flex-start",
  },
  stationShipCard: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: DesignTokens.colors.amberDim,
    padding: 14,
    width: "100%",
    maxWidth: 360,
  },
  stationShipCardLocked: {
    borderColor: DesignTokens.colors.alert,
    opacity: 0.85,
  },
  stationShipCardPrototype: {
    borderColor: DesignTokens.colors.amber,
  },
  stationShipHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  shipCardCode: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 11,
    color: DesignTokens.colors.textSecondary,
  },
  shipCardName: {
    fontFamily: DesignTokens.typography.fonts.pixel,
    fontSize: 13,
    color: DesignTokens.colors.textPrimary,
    marginTop: 2,
  },
  availabilityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    backgroundColor: "transparent",
  },
  badgeAvailable: {
    borderColor: DesignTokens.colors.amber,
  },
  badgeLocked: {
    borderColor: DesignTokens.colors.alert,
  },
  badgeAssigned: {
    borderColor: DesignTokens.colors.textSecondary,
  },
  availabilityText: {
    fontFamily: DesignTokens.typography.fonts.pixel,
    fontSize: 11,
  },
  shipVisualBox: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: DesignTokens.colors.amberDim,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    position: "relative",
  },
  prototypeRibbon: {
    position: "absolute",
    top: 6,
    right: 6,
    borderWidth: 1,
    borderColor: DesignTokens.colors.amber,
    backgroundColor: "transparent",
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  prototypeRibbonText: {
    fontFamily: DesignTokens.typography.fonts.pixel,
    fontSize: 11,
    color: DesignTokens.colors.textPrimary,
  },
  shipSpecsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: DesignTokens.colors.amberDim,
    paddingTop: 8,
    marginBottom: 12,
  },
  specItem: {
    flexDirection: "row",
    gap: 4,
  },
  specLabel: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 11,
    color: DesignTokens.colors.textSecondary,
  },
  specValue: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 11,
    color: DesignTokens.colors.textPrimary,
  },
  requisitionBtn: {
    backgroundColor: DesignTokens.colors.amber,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 6,
  },
  requisitionBtnDisabled: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: DesignTokens.colors.amberDim,
    opacity: 0.4,
  },
  requisitionBtnText: {
    fontFamily: DesignTokens.typography.fonts.pixel,
    fontSize: 11,
    color: DesignTokens.colors.bgDeep,
    fontWeight: "bold",
  },
  allocatedContainer: {
    gap: 16,
  },
  allocatedBanner: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: DesignTokens.colors.amberDim,
    padding: 14,
  },
  allocatedBannerTitle: {
    fontFamily: DesignTokens.typography.fonts.pixel,
    fontSize: 13,
    color: DesignTokens.colors.textPrimary,
  },
  allocatedBannerDesc: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 11,
    color: DesignTokens.colors.textSecondary,
    marginTop: 4,
  },
  myShipCard: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: DesignTokens.colors.amberDim,
    padding: 14,
    width: "100%",
    maxWidth: 360,
  },
  returnBtn: {
    borderWidth: 1,
    borderColor: DesignTokens.colors.amberDim,
    backgroundColor: "transparent",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 6,
  },
  returnBtnText: {
    fontFamily: DesignTokens.typography.fonts.pixel,
    fontSize: 11,
    color: DesignTokens.colors.textPrimary,
  },
  concurrencyLabContainer: {
    gap: 16,
  },
  sectionHeaderRow: {
    borderLeftWidth: 1,
    borderLeftColor: DesignTokens.colors.amber,
    paddingLeft: 12,
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: DesignTokens.typography.fonts.pixel,
    fontSize: 14,
    color: DesignTokens.colors.textPrimary,
    letterSpacing: 0.8,
  },
  sectionSubtitle: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 11,
    color: DesignTokens.colors.textSecondary,
    marginTop: 2,
  },
  pipelineBox: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: DesignTokens.colors.amberDim,
    padding: 12,
    gap: 8,
  },
  pipelineStep: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: DesignTokens.colors.amberDim,
    padding: 10,
    minWidth: 140,
    flex: 1,
  },
  pipelineStepTitle: {
    fontFamily: DesignTokens.typography.fonts.pixel,
    fontSize: 11,
    color: DesignTokens.colors.textPrimary,
    marginBottom: 4,
  },
  pipelineStepDesc: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 11,
    color: DesignTokens.colors.textSecondary,
  },
  terminalMonitor: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: DesignTokens.colors.amberDim,
  },
  terminalMonitorHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.amberDim,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  crtDot: {
    width: 8,
    height: 8,
    backgroundColor: DesignTokens.colors.amber,
  },
  terminalMonitorTitle: {
    fontFamily: DesignTokens.typography.fonts.pixel,
    fontSize: 11,
    color: DesignTokens.colors.textPrimary,
    flex: 1,
  },
  terminalStatusLive: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 11,
    color: DesignTokens.colors.textSecondary,
  },
  terminalLogBox: {
    maxHeight: 180,
    padding: 12,
  },
  terminalEmptyText: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 11,
    color: DesignTokens.colors.textSecondary,
    lineHeight: 18,
  },
  terminalLogLine: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 11,
    color: DesignTokens.colors.textPrimary,
    lineHeight: 20,
  },
  queueTableCard: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: DesignTokens.colors.amberDim,
    padding: 12,
  },
  queueTableTitle: {
    fontFamily: DesignTokens.typography.fonts.pixel,
    fontSize: 12,
    color: DesignTokens.colors.textPrimary,
    marginBottom: 12,
  },
  queueRowItem: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.amberDim,
    paddingVertical: 10,
  },
  queuePosBadge: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: DesignTokens.colors.amberDim,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  queuePosText: {
    fontFamily: DesignTokens.typography.fonts.pixel,
    fontSize: 11,
    color: DesignTokens.colors.textPrimary,
  },
  queueShipCode: {
    fontFamily: DesignTokens.typography.fonts.pixel,
    fontSize: 12,
    color: DesignTokens.colors.textPrimary,
  },
  queueSubInfo: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 11,
    color: DesignTokens.colors.textSecondary,
    marginTop: 2,
  },
  queueStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    backgroundColor: "transparent",
  },
  statusBadgeLock: {
    borderColor: DesignTokens.colors.amber,
  },
  statusBadgeWaiting: {
    borderColor: DesignTokens.colors.amberDim,
  },
  queueStatusText: {
    fontFamily: DesignTokens.typography.fonts.pixel,
    fontSize: 11,
  },
  directivesList: {
    gap: 16,
  },
  directiveCard: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: DesignTokens.colors.amberDim,
    padding: 16,
  },
  cardHeaderBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.amberDim,
    paddingBottom: 10,
    marginBottom: 12,
  },
  directiveIdText: {
    fontFamily: DesignTokens.typography.fonts.pixel,
    fontSize: 13,
    color: DesignTokens.colors.textPrimary,
  },
  timestampText: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 11,
    color: DesignTokens.colors.textSecondary,
    marginTop: 2,
  },
  dispatchStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    backgroundColor: "transparent",
  },
  statusPillPending: {
    borderColor: DesignTokens.colors.textSecondary,
  },
  statusPillAccepted: {
    borderColor: DesignTokens.colors.amber,
  },
  statusPillCancelled: {
    borderColor: DesignTokens.colors.alert,
  },
  dispatchStatusText: {
    fontFamily: DesignTokens.typography.fonts.pixel,
    fontSize: 11,
    color: DesignTokens.colors.textPrimary,
  },
  manifestSlip: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: DesignTokens.colors.amberDim,
    padding: 12,
    gap: 12,
  },
  slipHalf: {
    flex: 1,
    minWidth: 180,
  },
  slipSideLabel: {
    fontFamily: DesignTokens.typography.fonts.pixel,
    fontSize: 11,
    color: DesignTokens.colors.textSecondary,
    marginBottom: 4,
  },
  slipPilotName: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 12,
    color: DesignTokens.colors.textPrimary,
    fontWeight: "bold",
    marginBottom: 4,
  },
  assetCodeText: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 11,
    color: DesignTokens.colors.textSecondary,
  },
  exchangeIndicator: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  exchangeText: {
    fontFamily: DesignTokens.typography.fonts.pixel,
    fontSize: 11,
    color: DesignTokens.colors.textPrimary,
    marginTop: 2,
  },
  cardActionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: DesignTokens.colors.amberDim,
    paddingTop: 12,
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: DesignTokens.colors.alert,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  cancelButtonText: {
    fontFamily: DesignTokens.typography.fonts.pixel,
    fontSize: 11,
    color: DesignTokens.colors.alert,
  },
  emptyNoticeCard: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: DesignTokens.colors.amberDim,
  },
  emptyTitle: {
    fontFamily: DesignTokens.typography.fonts.pixel,
    fontSize: 14,
    color: DesignTokens.colors.textPrimary,
    marginTop: 12,
  },
  emptySubtitle: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 11,
    color: DesignTokens.colors.textSecondary,
    textAlign: "center",
    marginTop: 6,
    maxWidth: 400,
  },
  centeredNotice: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    gap: 12,
  },
  noticeText: {
    fontFamily: DesignTokens.typography.fonts.pixel,
    fontSize: 11,
    color: DesignTokens.colors.textPrimary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(5, 2, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: DesignTokens.colors.bgDeep,
    borderWidth: 1,
    borderColor: DesignTokens.colors.amber,
    width: "100%",
    maxWidth: 640,
    maxHeight: "92%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "transparent",
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.amberDim,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  modalTitle: {
    fontFamily: DesignTokens.typography.fonts.pixel,
    fontSize: 13,
    color: DesignTokens.colors.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
  modalDepotInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: DesignTokens.colors.amberDim,
    padding: 12,
    marginBottom: 16,
  },
  modalDepotCol: {
    flex: 1,
  },
  modalSubLabel: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 11,
    color: DesignTokens.colors.textSecondary,
  },
  modalHighlightText: {
    fontFamily: DesignTokens.typography.fonts.pixel,
    fontSize: 12,
    color: DesignTokens.colors.textPrimary,
    marginTop: 2,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontFamily: DesignTokens.typography.fonts.pixel,
    fontSize: 11,
    color: DesignTokens.colors.textPrimary,
    marginBottom: 8,
  },
  pickerScroll: {
    flexDirection: "row",
  },
  pickerItem: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: DesignTokens.colors.amberDim,
    padding: 10,
    marginRight: 10,
    minWidth: 150,
  },
  pickerItemSelected: {
    backgroundColor: "transparent",
    borderColor: DesignTokens.colors.amber,
  },
  pickerItemCode: {
    fontFamily: DesignTokens.typography.fonts.pixel,
    fontSize: 11,
    color: DesignTokens.colors.textPrimary,
  },
  pickerItemSub: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 11,
    color: DesignTokens.colors.textSecondary,
    marginTop: 4,
  },
  selectedShipPreview: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: DesignTokens.colors.amberDim,
    padding: 12,
    marginBottom: 16,
  },
  previewName: {
    fontFamily: DesignTokens.typography.fonts.pixel,
    fontSize: 13,
    color: DesignTokens.colors.textPrimary,
  },
  previewCode: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 11,
    color: DesignTokens.colors.textSecondary,
    marginTop: 2,
  },
  previewSpecs: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 11,
    color: DesignTokens.colors.textSecondary,
    marginTop: 4,
  },
  routeItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: DesignTokens.colors.amberDim,
    padding: 10,
    marginBottom: 8,
  },
  routeItemSelected: {
    borderColor: DesignTokens.colors.amber,
    backgroundColor: "transparent",
  },
  routeLabel: {
    fontFamily: DesignTokens.typography.fonts.pixel,
    fontSize: 11,
    color: DesignTokens.colors.textPrimary,
  },
  routeMeta: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 11,
    color: DesignTokens.colors.textSecondary,
    marginTop: 2,
  },
  radioCircle: {
    width: 14,
    height: 14,
    borderWidth: 1,
    borderColor: DesignTokens.colors.amberDim,
    borderRadius: 0,
    marginLeft: 8,
  },
  radioCircleSelected: {
    borderColor: DesignTokens.colors.amber,
    backgroundColor: DesignTokens.colors.amber,
  },
  directiveSummaryBox: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: DesignTokens.colors.amberDim,
    padding: 12,
    marginTop: 8,
  },
  summaryTitle: {
    fontFamily: DesignTokens.typography.fonts.pixel,
    fontSize: 11,
    color: DesignTokens.colors.textPrimary,
    marginBottom: 4,
  },
  summaryText: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 11,
    color: DesignTokens.colors.textSecondary,
    lineHeight: 16,
  },
  modalFooter: {
    backgroundColor: "transparent",
    borderTopWidth: 1,
    borderTopColor: DesignTokens.colors.amberDim,
    padding: 16,
  },
  modalSubmitButton: {
    backgroundColor: DesignTokens.colors.amber,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: DesignTokens.colors.amber,
    borderRadius: 0,
    gap: 8,
  },
  modalSubmitButtonDisabled: {
    backgroundColor: "transparent",
    borderColor: DesignTokens.colors.amberDim,
  },
  modalSubmitText: {
    fontFamily: DesignTokens.typography.fonts.pixel,
    fontSize: 12,
    color: DesignTokens.colors.bgDeep,
    fontWeight: "bold",
  },
  modalSubmitTextDisabled: {
    color: DesignTokens.colors.textMuted,
  },
});
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { AeroIcon } from "@/components/AeroIcon";
import { DesignTokens } from "@/constants/Tokens";
import { Header } from "@/components/header";
import { PixelShipView, getShipClassColor, SHIP_CLASS_COLORS } from "@/components/PixelShipView";
import { ConfirmModal } from "@/components/modal";
import { DOCK_SHIPS, ShipAsset } from "@/services/hangarData";
import { useAuth } from "@/context/AuthContext";
import { dispatchService, hangarService, DockedAsset, ShipAssetDTO } from "@/services/api";

const MISSION_ROUTES = [
  { id: "ROTA_ALPHA_PATRULHA", label: "ROTA ALPHA // PATRULHA DE DEFESA ORBITAL", cr: 450, risk: "BAIXO" },
  { id: "ROTA_KUIPER_MINERACAO", label: "ROTA KUIPER // EXTRAÇÃO DE MINÉRIO PESADO", cr: 820, risk: "MÉDIO" },
  { id: "ROTA_KRONOS_ESCOLTA", label: "ROTA KRONOS // ESCOLTA DE CARGUEIRO ESTELAR", cr: 1200, risk: "ALTO" },
  { id: "ROTA_DEEP_VOID_RECON", label: "ROTA DEEP VOID // RECONHECIMENTO FURTIVO ULTRA-ALCANCE", cr: 2400, risk: "EXTREMO" },
];

const SHIP_BAY_TO_INSTANCE: Record<string, { instanceId: string; defaultShipName: string }> = {
  "ship-01": { instanceId: "inst-station-valkyrie-1", defaultShipName: "Valkyrie-9 Interceptor (Wing Alpha)" },
  "ship-02": { instanceId: "inst-station-titan", defaultShipName: "Titan-IV Heavy Cargo Freighter" },
  "ship-03": { instanceId: "inst-station-drill", defaultShipName: "Giga-Drill Mining Drone Mk3" },
  "ship-04": { instanceId: "inst-station-colossus", defaultShipName: "Colossus-X Planetary Assault Mech" },
  "ship-05": { instanceId: "inst-station-starhawk", defaultShipName: "Proto-Starhawk Stealth Fighter" },
  "ship-06": { instanceId: "inst-station-scout", defaultShipName: "Phantom-X Stealth Recon Scout" },
  "ship-07": { instanceId: "inst-station-orion", defaultShipName: "Aegis Orion Patrol Corvette" },
  "ship-08": { instanceId: "inst-station-swarm", defaultShipName: "Swarm Extraction Drone Alpha" },
};

// Tela de Docas (Hangar): permite ver naves disponíveis na Estação Central e requisitar uma nave
export default function DockBaysScreen() {
  const { user, isAdmin } = useAuth();
  const currentUser = user || "piloto";
  const { width } = useWindowDimensions();
  const isDesktop = width >= DesignTokens.breakpoints.desktop;

  // Filtro de classe de nave (ex: ALL, INTERCEPTOR, FREIGHTER...)
  const [selectedClass, setSelectedClass] = useState<string>("ALL");
  const [inspectModalShip, setInspectModalShip] = useState<ShipAsset | null>(null);

  // Lista de naves vindas em tempo real do microsserviço de Despacho (MongoDB)
  const [stationFleet, setStationFleet] = useState<DockedAsset[]>([]);
  const [catalogMap, setCatalogMap] = useState<Record<string, any>>({});
  const [loadingFleet, setLoadingFleet] = useState(false);

  // Estados para Administrador (Cadastrar e Remover Naves na Estação Central)
  const [showAddShipModal, setShowAddShipModal] = useState(false);
  const [newShipName, setNewShipName] = useState("");
  const [newShipClass, setNewShipClass] = useState("INTERCEPTOR");
  const [newShipRarity, setNewShipRarity] = useState("RARE");
  const [newShipHp, setNewShipHp] = useState("320");
  const [newShipPrice, setNewShipPrice] = useState("650");
  const [addShipLoading, setAddShipLoading] = useState(false);

  const [shipToRemove, setShipToRemove] = useState<{ ship: ShipAsset; instanceId: string } | null>(null);
  const [removeShipLoading, setRemoveShipLoading] = useState(false);

  // Requisition Modal State
  const [requisitionShip, setRequisitionShip] = useState<ShipAsset | null>(null);
  const [showConfirmDispatch, setShowConfirmDispatch] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(MISSION_ROUTES[0]);
  const [actionLoading, setActionLoading] = useState(false);
  const [terminalMessage, setTerminalMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const showTerminalMsg = (text: string, type: "success" | "error" | "info" = "success") => {
    setTerminalMessage({ type, text });
    setTimeout(() => setTerminalMessage(null), 8000);
  };

  const loadStationFleet = async (silent = false) => {
    try {
      if (!silent) setLoadingFleet(true);
      const [fleetRes, catRes] = await Promise.allSettled([
        dispatchService.getStationFleet(),
        hangarService.getCatalog(),
      ]);

      if (fleetRes.status === "fulfilled") {
        setStationFleet(fleetRes.value.ships || fleetRes.value.assets || []);
      }
      if (catRes.status === "fulfilled" && Array.isArray(catRes.value)) {
        const map: Record<string, any> = {};
        for (const item of catRes.value) {
          if (item.id) map[item.id] = item;
          if (item.name) map[item.name.toLowerCase().trim()] = item;
        }
        setCatalogMap(map);
      }
    } catch (e) {
      console.warn("Could not sync station fleet:", e);
    } finally {
      if (!silent) setLoadingFleet(false);
    }
  };

  useEffect(() => {
    loadStationFleet();
    const interval = setInterval(() => {
      loadStationFleet(true);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadStationFleet();
    }, [])
  );

  const handleAddShipSubmit = async () => {
    if (!newShipName.trim()) {
      showTerminalMsg("[!] ERRO: O NOME DA NAVE É OBRIGATÓRIO.", "error");
      return;
    }
    setAddShipLoading(true);
    try {
      await dispatchService.addShipToStation({
        name: newShipName.trim(),
        type: newShipClass,
        rarity: newShipRarity,
        hp: parseInt(newShipHp, 10) || 300,
        marketPrice: parseFloat(newShipPrice) || 500,
      });
      showTerminalMsg(`[+] SUCESSO: VETOR [${newShipName.trim()}] REGISTRADO NO HANGAR DA ESTAÇÃO!`, "success");
      setShowAddShipModal(false);
      setNewShipName("");
      await loadStationFleet();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "FALHA AO REGISTRAR NAVE NO MONGODB";
      showTerminalMsg(`[!] ERRO NA CRIAÇÃO: ${msg}`, "error");
    } finally {
      setAddShipLoading(false);
    }
  };

  const handleConfirmRemoveShip = async () => {
    if (!shipToRemove) return;
    setRemoveShipLoading(true);
    try {
      await dispatchService.removeShipFromStation(shipToRemove.instanceId);
      showTerminalMsg(`[-] SUCESSO: VETOR [${shipToRemove.ship.name}] REMOVIDO DO HANGAR COM SUCESSO!`, "success");
      setShipToRemove(null);
      await loadStationFleet();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "FALHA AO REMOVER NAVE";
      showTerminalMsg(`[!] ERRO NA REMOÇÃO: ${msg}`, "error");
    } finally {
      setRemoveShipLoading(false);
    }
  };

  const getShipStatus = (ship: ShipAsset): { status: ShipAsset["status"]; isLocked: boolean; instanceId: string } => {
    const mapping = SHIP_BAY_TO_INSTANCE[ship.id];
    const instanceId = mapping?.instanceId || `inst-${ship.id}`;

    if (stationFleet.length > 0) {
      const match = stationFleet.find(
        (s) => s.instanceId === instanceId || s.instanceId === ship.id || s.assetId === ship.id
      );
      if (!match) {
        return { status: "IN_MISSION", isLocked: true, instanceId };
      }
      if (match.lockedForDispatch) {
        return { status: "QUEUED_LOCK", isLocked: true, instanceId: match.instanceId };
      }
      return { status: "READY", isLocked: false, instanceId: match.instanceId };
    }
    return { status: ship.status, isLocked: ship.status !== "READY", instanceId };
  };

  const handleConfirmRequisition = async () => {
    if (!requisitionShip) return;
    if (isAdmin) {
      showTerminalMsg("[!] AVISO: ADMINISTRADORES NÃO RESERVAM NAVES. APENAS SUPERVISIONAM A ESTAÇÃO.", "info");
      setRequisitionShip(null);
      return;
    }
    const { instanceId } = getShipStatus(requisitionShip);
    setActionLoading(true);
    try {
      await dispatchService.requestShipFromStation(currentUser, instanceId, selectedRoute.id);
      showTerminalMsg(
        `[+] SUCESSO: VETOR [${requisitionShip.name}] DESPACHADO COM SUCESSO! ALOCADO À SUA DOCA.`,
        "success"
      );
      setRequisitionShip(null);
      await loadStationFleet();
      setTimeout(() => loadStationFleet(true), 700);
      setTimeout(() => loadStationFleet(true), 1500);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "FALHA NO DESPACHO DA ESTAÇÃO.";
      showTerminalMsg(`[!] BLOQUEIO DE DESPACHO: ${msg}`, "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Reconcilia a frota em tempo real com o banco de dados MongoDB (sem naves falsas ou simuladas)
  const combinedShips: ShipAsset[] = React.useMemo(() => {
    if (stationFleet.length === 0) return [];

    // Deduplica a frota da estação por instanceId para evitar duplicidade de baias
    const uniqueFleet = stationFleet.filter(
      (item, idx, self) => idx === self.findIndex((t) => t.instanceId === item.instanceId)
    );

    const activeStatic = DOCK_SHIPS.filter((s) => {
      const mapping = SHIP_BAY_TO_INSTANCE[s.id];
      const instId = mapping?.instanceId || `inst-${s.id}`;
      return uniqueFleet.some((item) => item.instanceId === instId || item.assetId === s.id);
    });

    const dynamicShips: ShipAsset[] = uniqueFleet
      .filter((dockItem) => {
        const isStatic = DOCK_SHIPS.some((s) => {
          const mapping = SHIP_BAY_TO_INSTANCE[s.id];
          const instId = mapping?.instanceId || `inst-${s.id}`;
          return dockItem.instanceId === instId || dockItem.assetId === s.id;
        });
        return !isStatic;
      })
      .map((dockItem, index) => {
        const classType = (dockItem.type as any) || "INTERCEPTOR";
        const shipName = dockItem.assetName || dockItem.name || "Nova Nave Estelar";
        const catItem =
          (dockItem.assetId && catalogMap[dockItem.assetId]) ||
          catalogMap[shipName.toLowerCase().trim()];
        const price =
          dockItem.marketPrice && dockItem.marketPrice > 0
            ? dockItem.marketPrice
            : catItem?.marketPrice && catItem.marketPrice > 0
            ? catItem.marketPrice
            : 500;
        const hp =
          dockItem.hp && dockItem.hp > 0
            ? dockItem.hp
            : catItem?.hp && catItem.hp > 0
            ? catItem.hp
            : 300;

        return {
          id: dockItem.instanceId || `${dockItem.assetId || "dyn"}-${index}`,
          code: `BAY-X${index + 1}`,
          name: shipName,
          classType: classType,
          status: (dockItem.lockedForDispatch ? "QUEUED_LOCK" : "READY") as ShipAsset["status"],
          hullHP: hp,
          maxHullHP: hp,
          hullPercent: 100,
          fuelCapacityCR: 500,
          currentFuelCR: 500,
          fuelPercent: 100,
          shieldPercent: 100,
          queueDepth: 0,
          speedSublight: 350,
          warpCore: "Plasma-Ion Mk-IV",
          flightHours: 5,
          isRareSingleUnit: true,
          bay: `DOCA-X${index + 1}`,
          contractRateCR: price,
          specs: {
            armor: classType === "FREIGHTER" ? "Blindagem de Titânio Reativo" :
                   classType === "ASSAULT_MECH" ? "Blindagem Balística Reforçada" :
                   classType === "CORVETTE" ? "Casco Composto de Liga Neutrônica" :
                   "Blindagem de Titânio Reativo",
            propulsion: classType === "FREIGHTER" ? "Impulso Iônico Subluz" :
                        classType === "MINING_DRONE" ? "Micro-Propulsores Vetoriais" :
                        classType === "SCOUT" ? "Propulsão de Fissão Stealth" :
                        "Impulso Iônico Subluz",
            maxCrew: classType === "FREIGHTER" ? 2 : classType === "MINING_DRONE" ? 0 : 2,
            payloadTon: classType === "FREIGHTER" ? 45 : classType === "MINING_DRONE" ? 20 : 15,
          },
        };
      });

    return [...activeStatic, ...dynamicShips];
  }, [stationFleet, catalogMap]);

  const filteredShips =
    selectedClass === "ALL"
      ? combinedShips
      : combinedShips.filter((s) => s.classType === selectedClass);

  const classFilters = [
    { id: "ALL", label: "TODAS DOCAS", count: combinedShips.length, color: DesignTokens.colors.amber },
    { id: "INTERCEPTOR", label: "CAÇAS", count: combinedShips.filter((s) => s.classType === "INTERCEPTOR").length, color: SHIP_CLASS_COLORS.INTERCEPTOR },
    { id: "FREIGHTER", label: "CARGUEIROS", count: combinedShips.filter((s) => s.classType === "FREIGHTER").length, color: SHIP_CLASS_COLORS.FREIGHTER },
    { id: "MINING_DRONE", label: "DRONES", count: combinedShips.filter((s) => s.classType === "MINING_DRONE").length, color: SHIP_CLASS_COLORS.MINING_DRONE },
    { id: "ASSAULT_MECH", label: "MECHAS", count: combinedShips.filter((s) => s.classType === "ASSAULT_MECH").length, color: SHIP_CLASS_COLORS.ASSAULT_MECH },
    { id: "SCOUT", label: "SCOUTS", count: combinedShips.filter((s) => s.classType === "SCOUT").length, color: SHIP_CLASS_COLORS.SCOUT },
    { id: "CORVETTE", label: "CORVETAS", count: combinedShips.filter((s) => s.classType === "CORVETTE").length, color: SHIP_CLASS_COLORS.CORVETTE },
  ];

  return (
    <View style={styles.container}>
      <Header stationCode="ORBITAL ALPHA-7" activeSector="SETOR DOCAS // NÍVEL H-3" />

      {/* FEEDBACK BANNER */}
      {terminalMessage && (
        <View
          style={[
            styles.alertBanner,
            terminalMessage.type === "error"
              ? styles.alertError
              : terminalMessage.type === "info"
              ? styles.alertInfo
              : styles.alertSuccess,
          ]}
        >
          <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
            <AeroIcon
              name={
                terminalMessage.type === "error"
                  ? "alert-circle"
                  : terminalMessage.type === "info"
                  ? "information-circle"
                  : "checkmark-circle"
              }
              size={18}
              color={
                terminalMessage.type === "error"
                  ? DesignTokens.colors.statusCritical
                  : terminalMessage.type === "info"
                  ? DesignTokens.colors.textPrimary
                  : DesignTokens.colors.statusReady
              }
              style={{ marginRight: 8 }}
            />
            <Text style={styles.alertText}>{terminalMessage.text}</Text>
          </View>
          {terminalMessage.type === "success" && (
            <TouchableOpacity
              style={styles.alertActionBtn}
              onPress={() => router.push("/(tabs)/dispatch")}
            >
              <Text style={styles.alertActionBtnText}>VER NO DESPACHO ➜</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        {/* ── CABEÇALHO DO MÓDULO DE DOCAS ── */}
        <View style={styles.moduleHeaderRow}>
          <View>
            <Text style={styles.moduleCode}>[02 // DOCK_BAYS]</Text>
            <Text style={styles.moduleTitle}>PLANTA TÉCNICA & BAIAS DO HANGAR</Text>
          </View>

          {/* PAINEL DE CONTROLE DE FROTA (EXCLUSIVO PARA ROLE_ADMIN) */}
          {isAdmin && (
            <View style={styles.adminFleetBar}>
              <View style={styles.adminFleetInfo}>
                <AeroIcon name="shield-checkmark" size={13} color={DesignTokens.colors.amber} />
                <Text style={styles.adminFleetInfoText}>
                  CONTROLE DE FROTA // PRIVILÉGIO ROLE_ADMIN ATIVO
                </Text>
              </View>
              <TouchableOpacity
                style={styles.adminAddShipBtn}
                onPress={() => setShowAddShipModal(true)}
                activeOpacity={0.85}
              >
                <AeroIcon name="add" size={14} color={DesignTokens.colors.bgDeep} />
                <Text style={styles.adminAddShipBtnText}>[ + CADASTRAR NOVA NAVE ]</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Filtros em Chaves Industriais */}
          <View style={styles.filterPillsGroup}>
            {classFilters.map((tab) => {
              const active = selectedClass === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[
                    styles.filterBtn,
                    active ? styles.filterBtnActive : styles.filterBtnInactive,
                  ]}
                  onPress={() => setSelectedClass(tab.id)}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                    {tab.id !== "ALL" && (
                      <View
                        style={{
                          width: 6,
                          height: 6,
                          backgroundColor: active ? DesignTokens.colors.bgDeep : tab.color,
                        }}
                      />
                    )}
                    <Text
                      style={[
                        styles.filterBtnText,
                        active ? styles.filterBtnTextActive : styles.filterBtnTextInactive,
                      ]}
                    >
                      {tab.label} [{tab.count}]
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── GRID ESTRUTURAL DAS DOCAS ── */}
        <View style={[styles.docksLayoutGrid, isDesktop && styles.docksLayoutGridDesktop]}>
          {filteredShips.length === 0 ? (
            <View style={{ padding: 40, alignItems: "center", width: "100%" }}>
              <Text style={{ color: DesignTokens.colors.amberDim, fontFamily: DesignTokens.typography.fonts.mono, fontSize: 13, textAlign: "center" }}>
                {loadingFleet ? "[ ...] SINCRONIZANDO DOCAS COM A ESTAÇÃO CENTRAL..." : "[ ! ] NENHUMA NAVE DISPONÍVEL NO HANGAR DA ESTAÇÃO CENTRAL."}
              </Text>
            </View>
          ) : (
            filteredShips.map((ship, index) => {
            const { status, isLocked, instanceId } = getShipStatus(ship);
            const shipColor = getShipClassColor(ship.classType, ship.isRareSingleUnit, ship.code);
            const statusColor = status === "READY"
              ? shipColor
              : status === "QUEUED_LOCK"
              ? DesignTokens.colors.statusCritical
              : status === "IN_MISSION"
              ? DesignTokens.colors.textPrimary
              : DesignTokens.colors.statusWarning;

            return (
              <View
                key={`dock-bay-${ship.id}-${instanceId || ""}-${index}`}
                style={[
                  styles.bayContainer,
                  { borderTopColor: shipColor, borderTopWidth: 1 },
                ]}
              >
                {/* Cabeçalho da Baia com Parafusos e Coordenadas */}
                <View style={styles.bayHeaderBar}>
                  <View style={styles.bayCoordRow}>
                    <Text style={[styles.screwMark, { color: shipColor }]}>[+]</Text>
                    <Text style={[styles.bayCodeText, { color: shipColor }]}>{ship.bay}</Text>
                    <Text style={[styles.bayClassText, { color: shipColor, opacity: 0.85 }]}>// {ship.classType}</Text>
                  </View>

                  <View style={[styles.statusTag, { borderColor: statusColor }]}>
                    <Text style={[styles.statusTagText, { color: statusColor }]}>
                      {status === "READY"
                        ? "PRONTA"
                        : status === "QUEUED_LOCK"
                        ? "FILA LOCK"
                        : status === "IN_MISSION"
                        ? "EM MISSÃO"
                        : status === "DEPARTING"
                        ? "DECOLANDO"
                        : "MANUTENÇÃO"}
                    </Text>
                  </View>
                </View>

                {/* Corpo da Baia: Blueprint Pixel Art + Especificações */}
                <View style={styles.bayContentRow}>
                  <View
                    style={[
                      styles.blueprintFrame,
                      { borderColor: `${shipColor}4D`, backgroundColor: `${shipColor}08` },
                    ]}
                  >
                    <PixelShipView classType={ship.classType} size={110} color={shipColor} showBlueprintGrid />
                    {ship.isRareSingleUnit && (
                      <View style={styles.rareNoticeBadge}>
                        <Text style={styles.rareNoticeText}>PROTÓTIPO // UNIDADE ÚNICA</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.specsSideCol}>
                    <Text style={styles.shipNameHeading}>{ship.name}</Text>
                    <Text style={[styles.shipCodeSub, { color: shipColor }]}>{ship.code}</Text>

                    <View style={styles.techMetricsList}>
                      <View style={styles.metricLine}>
                        <Text style={styles.metricKey}>ARMOR:</Text>
                        <Text style={styles.metricVal} numberOfLines={1}>{ship.specs.armor}</Text>
                      </View>
                      <View style={styles.metricLine}>
                        <Text style={styles.metricKey}>PROPULSION:</Text>
                        <Text style={styles.metricVal} numberOfLines={1}>{ship.specs.propulsion}</Text>
                      </View>
                      <View style={styles.metricLine}>
                        <Text style={styles.metricKey}>CREW / CARGO:</Text>
                        <Text style={styles.metricVal}>{ship.specs.maxCrew} PILOTOS // {ship.specs.payloadTon} TON</Text>
                      </View>
                    </View>

                    {/* Barras de Combustível e Escudo */}
                    <View style={styles.gaugesContainer}>
                      <View style={styles.gaugeBlock}>
                        <View style={styles.gaugeLabelRow}>
                          <Text style={styles.gaugeTitle}>HULL INTEGRITY</Text>
                          <Text style={[styles.gaugePercent, { color: shipColor }]}>{ship.shieldPercent}%</Text>
                        </View>
                        <View style={styles.gaugeTrack}>
                          <View style={[styles.gaugeFill, { width: `${ship.shieldPercent}%`, backgroundColor: shipColor }]} />
                        </View>
                      </View>

                      <View style={styles.gaugeBlock}>
                        <View style={styles.gaugeLabelRow}>
                          <Text style={styles.gaugeTitle}>FUEL CELLS</Text>
                          <Text style={[styles.gaugePercent, { color: DesignTokens.colors.statusWarning }]}>{ship.fuelPercent}%</Text>
                        </View>
                        <View style={styles.gaugeTrack}>
                          <View style={[styles.gaugeFill, { width: `${ship.fuelPercent}%`, backgroundColor: DesignTokens.colors.statusWarning }]} />
                        </View>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Rodapé da Doca: Taxa de Contrato & Botão de Despacho */}
                <View style={styles.bayFooterRow}>
                  <View style={styles.rateDisplay}>
                    <Text style={styles.rateLabel}>TAXA DE DESPACHO:</Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                      <AeroIcon name="credit" size={13} color={DesignTokens.colors.statusWarning} />
                      <Text style={styles.rateValue}>{ship.contractRateCR} CR</Text>
                    </View>
                  </View>

                  <View style={styles.actionsBtnRow}>
                    <TouchableOpacity
                      style={styles.inspectBtn}
                      onPress={() => setInspectModalShip(ship)}
                    >
                      <Text style={styles.inspectBtnText}>INSPECIONAR</Text>
                    </TouchableOpacity>

                    {!isAdmin ? (
                      <TouchableOpacity
                        style={[
                          styles.reserveBtn,
                          isLocked
                            ? styles.reserveBtnLocked
                            : { backgroundColor: shipColor, borderColor: shipColor },
                        ]}
                        onPress={() => {
                          if (isLocked) {
                            router.push("/(tabs)/dispatch");
                          } else {
                            setRequisitionShip(ship);
                          }
                        }}
                      >
                        <Text
                          style={[
                            styles.reserveBtnText,
                            !isLocked && { color: DesignTokens.colors.bgDeep },
                          ]}
                        >
                          {isLocked ? (status === "IN_MISSION" ? "ALOCADA (VER DESPACHO)" : "VER FILA (LOCK)") : "RESERVAR VETOR"}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={[
                          styles.reserveBtn,
                          {
                            backgroundColor: "transparent",
                            borderColor: isLocked ? DesignTokens.colors.statusCritical : DesignTokens.colors.amber,
                          },
                        ]}
                        onPress={() => router.push("/(tabs)/dispatch")}
                      >
                        <Text
                          style={[
                            styles.reserveBtnText,
                            { color: isLocked ? DesignTokens.colors.statusCritical : DesignTokens.colors.amber },
                          ]}
                        >
                          {isLocked ? (status === "IN_MISSION" ? "EM MISSÃO // VER FILA" : "LOCK // VER FILA") : "MONITORAR FILA"}
                        </Text>
                      </TouchableOpacity>
                    )}

                    {isAdmin && (
                      <TouchableOpacity
                        style={styles.adminRemoveBtn}
                        onPress={() => setShipToRemove({ ship, instanceId })}
                        activeOpacity={0.8}
                      >
                        <AeroIcon name="trash" size={13} color={DesignTokens.colors.alert} />
                        <Text style={styles.adminRemoveBtnText}>[ REMOVER ]</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            );
          }))}
        </View>
      </ScrollView>

      {/* ── MODAL DE INSPEÇÃO TÉCNICA DETALHADA DO BLUEPRINT ── */}
      <Modal visible={!!inspectModalShip} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            {inspectModalShip && (() => {
              const inspectColor = getShipClassColor(inspectModalShip.classType, inspectModalShip.isRareSingleUnit, inspectModalShip.code);
              return (
                <>
                  <View style={[styles.modalHeader, { borderBottomColor: `${inspectColor}66` }]}>
                    <Text style={[styles.modalTitle, { color: inspectColor }]}>
                      DIAGNÓSTICO // {inspectModalShip.bay} // {inspectModalShip.code}
                    </Text>
                    <TouchableOpacity onPress={() => setInspectModalShip(null)}>
                      <AeroIcon name="close" size={20} color={inspectColor} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.modalBody}>
                    <View
                      style={[
                        styles.modalBlueprintLarge,
                        { borderColor: `${inspectColor}4D`, backgroundColor: `${inspectColor}08` },
                      ]}
                    >
                      <PixelShipView classType={inspectModalShip.classType} size={180} color={inspectColor} showBlueprintGrid />
                    </View>

                    <View style={styles.modalDetailsCol}>
                      <Text style={styles.modalShipName}>{inspectModalShip.name}</Text>
                      <Text style={[styles.modalShipSub, { color: inspectColor }]}>MOTOR DE DOBRA: {inspectModalShip.warpCore}</Text>
                      <Text style={styles.modalShipSub}>HORAS DE VOO: {inspectModalShip.flightHours} H</Text>

                      <View style={styles.modalSpecsBlock}>
                        <Text style={styles.modalSpecHeader}>SISTEMA DE CONTENÇÃO & VETOR:</Text>
                        <Text style={styles.modalSpecText}>• Blindagem: {inspectModalShip.specs.armor}</Text>
                        <Text style={styles.modalSpecText}>• Propulsão: {inspectModalShip.specs.propulsion}</Text>
                        <Text style={styles.modalSpecText}>• Tripulação Máxima: {inspectModalShip.specs.maxCrew} pilotos</Text>
                        <Text style={styles.modalSpecText}>• Capacidade de Transporte: {inspectModalShip.specs.payloadTon} toneladas</Text>
                      </View>

                      {inspectModalShip.isRareSingleUnit && (
                        <View style={[styles.concurrencyAlertBox, { borderColor: DesignTokens.colors.alert, backgroundColor: "transparent" }]}>
                          <Text style={[styles.concurrencyAlertTitle, { color: DesignTokens.colors.alert }]}>PROTÓTIPO EXCLUSIVO // UNIDADE ÚNICA:</Text>
                          <Text style={styles.concurrencyAlertDesc}>
                            Esta nave é um protótipo com apenas 1 unidade física na doca. Solicitações de despacho são processadas por ordem de chegada para evitar alocações conflitantes.
                          </Text>
                        </View>
                      )}

                      {!isAdmin ? (
                        <TouchableOpacity
                          style={[styles.modalActionBtn, { backgroundColor: inspectColor }]}
                          onPress={() => {
                            const target = inspectModalShip;
                            setInspectModalShip(null);
                            setRequisitionShip(target);
                          }}
                        >
                          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 }}>
                            <AeroIcon name="send" size={14} color={DesignTokens.colors.bgDeep} />
                            <Text style={styles.modalActionBtnText}>
                              EMITIR ORDEM DE DESPACHO PARA ESTA NAVE [{inspectModalShip.contractRateCR} CR]
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={[styles.modalActionBtn, { backgroundColor: DesignTokens.colors.amber }]}
                          onPress={() => {
                            setInspectModalShip(null);
                            router.push("/(tabs)/dispatch");
                          }}
                        >
                          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 }}>
                            <AeroIcon name="list" size={14} color={DesignTokens.colors.bgDeep} />
                            <Text style={[styles.modalActionBtnText, { color: DesignTokens.colors.bgDeep }]}>
                              SUPERVISIONAR FILA & HISTÓRICO NO DESPACHO
                            </Text>
                          </View>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </>
              );
            })()}
          </View>
        </View>
      </Modal>

      {/* ── MODAL DE REQUISIÇÃO DIRETA & SELEÇÃO DE ROTA (RABBITMQ) ── */}
      <Modal visible={!!requisitionShip} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalBox, { maxWidth: 640 }]}>
            {requisitionShip && (() => {
              const reqColor = getShipClassColor(requisitionShip.classType, requisitionShip.isRareSingleUnit, requisitionShip.code);
              return (
                <>
                  <View style={[styles.modalHeader, { borderBottomColor: `${reqColor}66` }]}>
                    <Text style={[styles.modalTitle, { color: reqColor }]}>
                      [ + REQUISIÇÃO DE NAVE // {requisitionShip.name.toUpperCase()} ]
                    </Text>
                    <TouchableOpacity onPress={() => setRequisitionShip(null)}>
                      <AeroIcon name="close" size={20} color={reqColor} />
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={{ maxHeight: 520, padding: 16 }}>
                    {/* DEPOT INFO */}
                    <View style={styles.routeHeaderInfo}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.routeDepotLabel}>DEPOT DE ORIGEM:</Text>
                        <Text style={[styles.routeDepotVal, { color: reqColor }]}>ESTAÇÃO CENTRAL ALPHA-7 ({requisitionShip.bay})</Text>
                      </View>
                      <AeroIcon name="arrow-forward" size={18} color={reqColor} />
                      <View style={{ flex: 1, alignItems: "flex-end" }}>
                        <Text style={styles.routeDepotLabel}>OFICIAL REQUISITANTE:</Text>
                        <Text style={[styles.routeDepotVal, { color: DesignTokens.colors.textPrimary }]}>
                          @{currentUser.toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    {/* NAVE PREVIEW */}
                    <View style={[styles.reqShipPreviewBox, { borderColor: `${reqColor}4D`, backgroundColor: `${reqColor}08` }]}>
                      <PixelShipView classType={requisitionShip.classType} size={70} color={reqColor} />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.reqShipName}>{requisitionShip.name}</Text>
                        <Text style={[styles.reqShipCode, { color: reqColor }]}>{requisitionShip.code} // {requisitionShip.classType}</Text>
                        <Text style={styles.reqShipSpecs}>
                          TAXA: {requisitionShip.contractRateCR} CR | REQUISITO: {requisitionShip.specs.maxCrew} PILOTOS
                        </Text>
                      </View>
                    </View>

                    {/* SELEÇÃO DE ROTA */}
                    <Text style={styles.routeSectionTitle}>SELECIONE O OBJETIVO / ROTA OPERACIONAL:</Text>
                    <View style={{ gap: 8, marginTop: 8 }}>
                      {MISSION_ROUTES.map((route) => {
                        const isSelected = selectedRoute.id === route.id;
                        return (
                          <TouchableOpacity
                            key={route.id}
                            style={[
                              styles.routeCard,
                              isSelected && styles.routeCardSelected,
                              isSelected && { borderColor: reqColor, backgroundColor: `${reqColor}14` },
                            ]}
                            onPress={() => setSelectedRoute(route)}
                          >
                            <View style={{ flex: 1 }}>
                              <Text
                                style={[
                                  styles.routeCardLabel,
                                  isSelected && styles.routeCardLabelSelected,
                                  isSelected && { color: reqColor },
                                ]}
                              >
                                {route.label}
                              </Text>
                              <Text style={styles.routeRiskText}>
                                NÍVEL DE RISCO: <Text style={{ color: route.risk === "EXTREMO" ? DesignTokens.colors.statusCritical : DesignTokens.colors.statusWarning }}>{route.risk}</Text>
                              </Text>
                            </View>
                            <View style={[styles.routeRewardBadge, isSelected && { borderColor: reqColor }]}>
                              <Text style={[styles.routeRewardText, isSelected && { color: reqColor }]}>+{route.cr} CR</Text>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    {/* FLIGHT PROTOCOL INFO */}
                    <View style={styles.amqpNoticeBox}>
                      <Text style={styles.amqpNoticeTitle}>PROTOCOLO DE DESPACHO OPERACIONAL // AUTORIZAÇÃO DE VOO</Text>
                      <Text style={styles.amqpNoticeText}>
                        Ao confirmar, a ordem de despacho será transmitida para a coordenação de voo da estação e a nave será alocada para a sua rota.
                      </Text>
                    </View>

                    {/* ACTION BUTTONS */}
                    <View style={styles.reqActionRow}>
                      <TouchableOpacity
                        style={styles.reqCancelBtn}
                        onPress={() => setRequisitionShip(null)}
                        disabled={actionLoading}
                      >
                        <Text style={styles.reqCancelBtnText}>CANCELAR</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.reqSubmitBtn, { backgroundColor: reqColor }]}
                        onPress={() => setShowConfirmDispatch(true)}
                        disabled={actionLoading}
                      >
                        {actionLoading ? (
                          <ActivityIndicator size="small" color={DesignTokens.colors.bgDeep} />
                        ) : (
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                            <AeroIcon name="send" size={14} color={DesignTokens.colors.bgDeep} />
                            <Text style={styles.reqSubmitBtnText}>
                              CONFIRMAR REQUISIÇÃO DE DESPACHO
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                </>
              );
            })()}
          </View>
        </View>
      </Modal>

      {/* Modal de Confirmação de Despacho (INT-01) */}
      <ConfirmModal
        visible={showConfirmDispatch}
        title="CONFIRMAR DESPACHO COM LOCK ATÔMICO"
        message={`Deseja confirmar o despacho do vetor ${requisitionShip?.name} para a ${selectedRoute?.label}? Um lock atômico será emitido no broker AMQP e ${requisitionShip?.contractRateCR} CR serão deduzidos.`}
        confirmText="CONFIRMAR DESPACHO"
        cancelText="CANCELAR"
        shipName={requisitionShip?.name}
        costCr={requisitionShip?.contractRateCR}
        onConfirm={() => {
          setShowConfirmDispatch(false);
          handleConfirmRequisition();
        }}
        onCancel={() => setShowConfirmDispatch(false)}
      />

      {/* ── MODAL DE CADASTRO DE NOVA NAVE (EXCLUSIVO ROLE_ADMIN) ── */}
      <Modal visible={showAddShipModal} transparent animationType="fade">
        <View style={styles.adminModalBackdrop}>
          <View style={styles.adminModalCard}>
            <View style={styles.adminModalHeader}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <AeroIcon name="add-circle" size={18} color={DesignTokens.colors.amber} />
                <Text style={styles.adminModalTitle}>
                  [ CADASTRO DE VETOR // PROTOCOLO ADMIN ]
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowAddShipModal(false)}>
                <AeroIcon name="close" size={18} color={DesignTokens.colors.amber} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.adminModalBody} keyboardShouldPersistTaps="handled">
              <Text style={styles.adminModalSubtitle}>
                Cadastra uma nova nave operacional na frota central (MongoDB) e no catálogo geral.
              </Text>

              {/* NOME DA NAVE */}
              <View style={styles.adminFormGroup}>
                <Text style={styles.adminFormLabel}>NOME DO VETOR / MODELO:</Text>
                <TextInput
                  style={styles.adminTextInput}
                  placeholder="ex: Valkyrie-X Hyper Mk5, Titan Void-02"
                  placeholderTextColor={DesignTokens.colors.textMuted}
                  value={newShipName}
                  onChangeText={setNewShipName}
                />
              </View>

              {/* CLASSE DA NAVE */}
              <View style={styles.adminFormGroup}>
                <Text style={styles.adminFormLabel}>CLASSE DA EMBARCAÇÃO:</Text>
                <View style={styles.adminSelectorGrid}>
                  {[
                    { id: "INTERCEPTOR", label: "CAÇA" },
                    { id: "FREIGHTER", label: "CARGUEIRO" },
                    { id: "MINING_DRONE", label: "DRONE" },
                    { id: "ASSAULT_MECH", label: "MECHA" },
                    { id: "SCOUT", label: "SCOUT" },
                    { id: "CORVETTE", label: "CORVETA" },
                  ].map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      style={[
                        styles.adminSelectorBtn,
                        newShipClass === c.id && styles.adminSelectorBtnActive,
                      ]}
                      onPress={() => setNewShipClass(c.id)}
                    >
                      <Text
                        style={[
                          styles.adminSelectorBtnText,
                          newShipClass === c.id && styles.adminSelectorBtnTextActive,
                        ]}
                      >
                        {c.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* RARIDADE */}
              <View style={styles.adminFormGroup}>
                <Text style={styles.adminFormLabel}>CLASSIFICAÇÃO DE RARIDADE:</Text>
                <View style={styles.adminSelectorGrid}>
                  {[
                    { id: "COMMON", label: "COMUM" },
                    { id: "RARE", label: "RARA" },
                    { id: "ULTRA_RARE", label: "ULTRA RARA" },
                    { id: "SECRET_RARE", label: "SECRETA" },
                  ].map((r) => (
                    <TouchableOpacity
                      key={r.id}
                      style={[
                        styles.adminSelectorBtn,
                        newShipRarity === r.id && styles.adminSelectorBtnActive,
                      ]}
                      onPress={() => setNewShipRarity(r.id)}
                    >
                      <Text
                        style={[
                          styles.adminSelectorBtnText,
                          newShipRarity === r.id && styles.adminSelectorBtnTextActive,
                        ]}
                      >
                        {r.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* HULL & VALOR */}
              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={[styles.adminFormGroup, { flex: 1 }]}>
                  <Text style={styles.adminFormLabel}>BLINDAGEM (HP):</Text>
                  <TextInput
                    style={styles.adminTextInput}
                    placeholder="320"
                    placeholderTextColor={DesignTokens.colors.textMuted}
                    value={newShipHp}
                    onChangeText={setNewShipHp}
                    keyboardType="numeric"
                  />
                </View>

                <View style={[styles.adminFormGroup, { flex: 1 }]}>
                  <Text style={styles.adminFormLabel}>TAXA (CR):</Text>
                  <TextInput
                    style={styles.adminTextInput}
                    placeholder="650"
                    placeholderTextColor={DesignTokens.colors.textMuted}
                    value={newShipPrice}
                    onChangeText={setNewShipPrice}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* BOTOES */}
              <View style={styles.adminModalActionsRow}>
                <TouchableOpacity
                  style={styles.adminCancelBtn}
                  onPress={() => setShowAddShipModal(false)}
                  disabled={addShipLoading}
                >
                  <Text style={styles.adminCancelBtnText}>CANCELAR</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.adminConfirmBtn}
                  onPress={handleAddShipSubmit}
                  disabled={addShipLoading}
                >
                  {addShipLoading ? (
                    <ActivityIndicator size="small" color={DesignTokens.colors.bgDeep} />
                  ) : (
                    <Text style={styles.adminConfirmBtnText}>
                      [ CONFIRMAR REGISTRO NO MONGODB ]
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── MODAL DE CONFIRMAÇÃO DE REMOÇÃO DE NAVE (EXCLUSIVO ROLE_ADMIN) ── */}
      <Modal visible={!!shipToRemove} transparent animationType="fade">
        <View style={styles.adminModalBackdrop}>
          <View style={[styles.adminModalCard, { borderColor: DesignTokens.colors.alert }]}>
            <View style={[styles.adminModalHeader, { borderBottomColor: DesignTokens.colors.alert }]}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <AeroIcon name="warning" size={18} color={DesignTokens.colors.alert} />
                <Text style={[styles.adminModalTitle, { color: DesignTokens.colors.alert }]}>
                  [ EXPURGAR VETOR DA ESTAÇÃO // ADMIN ]
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShipToRemove(null)}>
                <AeroIcon name="close" size={18} color={DesignTokens.colors.alert} />
              </TouchableOpacity>
            </View>

            <View style={styles.adminModalBody}>
              <Text style={styles.adminRemoveWarningText}>
                ATENÇÃO: Você está prestes a remover permanentemente a seguinte nave da frota central:
              </Text>

              <View style={styles.adminRemoveInfoBox}>
                <Text style={styles.adminRemoveInfoName}>
                  {shipToRemove?.ship.name}
                </Text>
                <Text style={styles.adminRemoveInfoDetail}>
                  Instância: {shipToRemove?.instanceId}
                </Text>
                <Text style={styles.adminRemoveInfoDetail}>
                  Classe: {shipToRemove?.ship.classType} • Status: {shipToRemove?.ship.status}
                </Text>
              </View>

              <Text style={styles.adminRemoveNoticeText}>
                Esta nave deixará de estar visível para despachos ou locações no ecossistema de microsserviços.
              </Text>

              <View style={styles.adminModalActionsRow}>
                <TouchableOpacity
                  style={styles.adminCancelBtn}
                  onPress={() => setShipToRemove(null)}
                  disabled={removeShipLoading}
                >
                  <Text style={styles.adminCancelBtnText}>CANCELAR</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.adminConfirmBtn, { backgroundColor: DesignTokens.colors.alert }]}
                  onPress={handleConfirmRemoveShip}
                  disabled={removeShipLoading}
                >
                  {removeShipLoading ? (
                    <ActivityIndicator size="small" color={DesignTokens.colors.bgDeep} />
                  ) : (
                    <Text style={styles.adminConfirmBtnText}>
                      [ CONFIRMAR REMOÇÃO DO BANCO ]
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
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
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: DesignTokens.spacing.base,
    gap: 16,
    paddingBottom: 90,
  },

  moduleHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.border,
    paddingBottom: 12,
    flexWrap: "wrap",
    gap: 12,
  },
  moduleCode: {
    fontFamily: DesignTokens.typography.fontFamilyMono,
    fontSize: 11,
    color: DesignTokens.colors.statusInfo,
    letterSpacing: 1,
  },
  moduleTitle: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    fontSize: 22,
    color: DesignTokens.colors.textPrimary,
    letterSpacing: 1.5,
  },

  filterPillsGroup: {
    flexDirection: "row",
    gap: 4,
    flexWrap: "wrap",
  },
  filterBtn: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 0,
  },
  filterBtnActive: {
    borderColor: DesignTokens.colors.amber,
    backgroundColor: DesignTokens.colors.amber, // #FFB000 fundo sólido
  },
  filterBtnInactive: {
    borderColor: DesignTokens.colors.amberDim,
    backgroundColor: "transparent",
  },
  filterBtnText: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 11,
  },
  filterBtnTextActive: {
    color: DesignTokens.colors.bgDeep, // #050200 texto escuro com alto contraste
    fontWeight: "700",
  },
  filterBtnTextInactive: {
    color: DesignTokens.colors.textPrimary, // #FFE082 luminoso
  },

  /* ── GRID E BAIAS DO HANGAR ── */
  docksLayoutGrid: {
    gap: 16,
  },
  docksLayoutGridDesktop: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  bayContainer: {
    width: "49%",
    minWidth: 320,
    flexGrow: 1,
    backgroundColor: DesignTokens.colors.bgSurface,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
  },
  bayHeaderBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: DesignTokens.colors.bgElevated,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.borderDim,
  },
  bayCoordRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  screwMark: {
    fontFamily: DesignTokens.typography.fontFamilyMono,
    fontSize: 11,
    color: DesignTokens.colors.textMuted,
  },
  bayCodeText: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    fontSize: 12,
    color: DesignTokens.colors.phosphor,
    letterSpacing: 0.5,
  },
  bayClassText: {
    fontFamily: DesignTokens.typography.fontFamilyMono,
    fontSize: 11,
    color: DesignTokens.colors.textMuted,
  },
  statusTag: {
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  statusTagText: {
    fontFamily: DesignTokens.typography.fontFamilyMono,
    fontSize: 11,
    fontWeight: "700",
  },

  /* Conteúdo da Baia */
  bayContentRow: {
    flexDirection: "row",
    padding: 12,
    gap: 12,
    flexWrap: "wrap",
  },
  blueprintFrame: {
    width: 120,
    height: 120,
    backgroundColor: DesignTokens.colors.bgBase,
    borderWidth: 1,
    borderColor: DesignTokens.colors.borderDim,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  rareNoticeBadge: {
    position: "absolute",
    bottom: 2,
    left: 2,
    right: 2,
    backgroundColor: "#050200", // Fundo sólido preto mascarando as linhas do blueprint SVG
    borderWidth: 1,
    borderColor: DesignTokens.colors.amber,
    paddingVertical: 3,
    paddingHorizontal: 4,
    alignItems: "center",
    zIndex: 10,
  },
  rareNoticeText: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 11,
    color: DesignTokens.colors.textPrimary, // #FFE082
    fontWeight: "700",
  },
  specsSideCol: {
    flex: 1,
    minWidth: 180,
  },
  shipNameHeading: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    fontSize: 16,
    color: DesignTokens.colors.textPrimary,
    letterSpacing: 1,
  },
  shipCodeSub: {
    fontFamily: DesignTokens.typography.fontFamilyMono,
    fontSize: 11,
    color: DesignTokens.colors.statusInfo,
    marginBottom: 6,
  },
  techMetricsList: {
    gap: 2,
    marginBottom: 8,
  },
  metricLine: {
    flexDirection: "row",
    gap: 4,
  },
  metricKey: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 11,
    color: DesignTokens.colors.textSecondary, // #FFB000
  },
  metricVal: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 11,
    color: DesignTokens.colors.textPrimary, // #FFE082
    flex: 1,
  },
  gaugesContainer: {
    gap: 6,
  },
  gaugeBlock: {
    gap: 2,
  },
  gaugeLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  gaugeTitle: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 11,
    color: DesignTokens.colors.textSecondary, // #FFB000 (Luminoso para leitura)
    fontWeight: "700",
  },
  gaugePercent: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 11,
    color: DesignTokens.colors.textPrimary, // #FFE082
    fontWeight: "700",
  },
  gaugeTrack: {
    height: 4,
    backgroundColor: DesignTokens.colors.bgBase,
    borderWidth: 1,
    borderColor: DesignTokens.colors.borderDim,
  },
  gaugeFill: {
    height: "100%",
    backgroundColor: DesignTokens.colors.phosphor,
  },

  /* Rodapé da Baia */
  bayFooterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: DesignTokens.colors.bgBase,
    borderTopWidth: 1,
    borderTopColor: DesignTokens.colors.borderDim,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexWrap: "wrap",
    gap: 8,
  },
  rateDisplay: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  rateLabel: {
    fontFamily: DesignTokens.typography.fontFamilyMono,
    fontSize: 11,
    color: DesignTokens.colors.textMuted,
  },
  rateValue: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    fontSize: 14,
    color: DesignTokens.colors.statusWarning,
    fontWeight: "700",
  },
  actionsBtnRow: {
    flexDirection: "row",
    gap: 6,
  },
  inspectBtn: {
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: DesignTokens.colors.bgElevated,
  },
  inspectBtnText: {
    fontFamily: DesignTokens.typography.fontFamilyMono,
    fontSize: 11,
    color: DesignTokens.colors.textSecondary,
  },
  reserveBtn: {
    borderWidth: 1,
    borderColor: DesignTokens.colors.phosphor,
    backgroundColor: DesignTokens.colors.phosphor,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  reserveBtnLocked: {
    backgroundColor: "rgba(255, 59, 48, 0.2)",
    borderColor: DesignTokens.colors.statusCritical,
  },
  reserveBtnText: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    fontSize: 11,
    color: DesignTokens.colors.bgDeep,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  /* ── MODAL DE INSPEÇÃO ── */
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(5, 2, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalBox: {
    width: "100%",
    maxWidth: 720,
    backgroundColor: DesignTokens.colors.bgSurface,
    borderWidth: 1,
    borderColor: DesignTokens.colors.amber,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: DesignTokens.colors.bgElevated,
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.border,
    padding: 12,
  },
  modalTitle: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    fontSize: 12,
    color: DesignTokens.colors.phosphor,
    letterSpacing: 1,
  },
  modalBody: {
    flexDirection: "row",
    padding: 20,
    gap: 20,
    flexWrap: "wrap",
  },
  modalBlueprintLarge: {
    width: 220,
    height: 220,
    backgroundColor: DesignTokens.colors.bgBase,
    borderWidth: 1,
    borderColor: DesignTokens.colors.borderDim,
    alignItems: "center",
    justifyContent: "center",
  },
  modalDetailsCol: {
    flex: 1,
    minWidth: 260,
  },
  modalShipName: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    fontSize: 20,
    color: DesignTokens.colors.textPrimary,
    letterSpacing: 1.5,
  },
  modalShipSub: {
    fontFamily: DesignTokens.typography.fontFamilyMono,
    fontSize: 11,
    color: DesignTokens.colors.statusInfo,
    marginTop: 2,
  },
  modalSpecsBlock: {
    marginTop: 14,
    gap: 4,
    padding: 10,
    backgroundColor: DesignTokens.colors.bgBase,
    borderWidth: 1,
    borderColor: DesignTokens.colors.borderDim,
  },
  modalSpecHeader: {
    fontFamily: DesignTokens.typography.fontFamilyMono,
    fontSize: 11,
    color: DesignTokens.colors.textMuted,
    fontWeight: "700",
  },
  modalSpecText: {
    fontFamily: DesignTokens.typography.fontFamilyMono,
    fontSize: 11,
    color: DesignTokens.colors.textSecondary,
  },
  concurrencyAlertBox: {
    marginTop: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: DesignTokens.colors.statusWarning,
    backgroundColor: "rgba(255, 204, 0, 0.08)",
  },
  concurrencyAlertTitle: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    fontSize: 11,
    color: DesignTokens.colors.statusWarning,
    fontWeight: "700",
  },
  concurrencyAlertDesc: {
    fontFamily: DesignTokens.typography.fontFamilyMono,
    fontSize: 11,
    color: DesignTokens.colors.textSecondary,
    marginTop: 2,
    lineHeight: 14,
  },
  modalActionBtn: {
    marginTop: 16,
    backgroundColor: DesignTokens.colors.phosphor,
    paddingVertical: 10,
    alignItems: "center",
  },
  modalActionBtnText: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    fontSize: 12,
    color: DesignTokens.colors.bgDeep,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  /* ── BANNER DE FEEDBACK ── */
  alertBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  alertSuccess: {
    backgroundColor: "rgba(255, 176, 0, 0.12)",
    borderColor: DesignTokens.colors.statusReady,
  },
  alertError: {
    backgroundColor: "rgba(255, 59, 48, 0.12)",
    borderColor: DesignTokens.colors.statusCritical,
  },
  alertInfo: {
    backgroundColor: "rgba(255, 176, 0, 0.10)",
    borderColor: DesignTokens.colors.textSecondary,
  },
  alertText: {
    fontFamily: DesignTokens.typography.fontFamilyMono,
    fontSize: 11,
    color: DesignTokens.colors.textPrimary,
  },
  alertActionBtn: {
    borderWidth: 1,
    borderColor: DesignTokens.colors.statusReady,
    backgroundColor: DesignTokens.colors.statusReady,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 2,
    marginLeft: 12,
  },
  alertActionBtnText: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    fontSize: 11,
    color: DesignTokens.colors.bgDeep,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  /* ── MODAL DE REQUISIÇÃO ── */
  routeHeaderInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    backgroundColor: DesignTokens.colors.bgBase,
    borderWidth: 1,
    borderColor: DesignTokens.colors.borderDim,
    marginBottom: 14,
  },
  routeDepotLabel: {
    fontFamily: DesignTokens.typography.fontFamilyMono,
    fontSize: 11,
    color: DesignTokens.colors.textMuted,
  },
  routeDepotVal: {
    fontFamily: DesignTokens.typography.fontFamilyMono,
    fontSize: 11,
    color: DesignTokens.colors.phosphor,
    fontWeight: "700",
  },
  reqShipPreviewBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: DesignTokens.colors.bgBase,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
    marginBottom: 14,
  },
  reqShipName: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    fontSize: 15,
    color: DesignTokens.colors.textPrimary,
    letterSpacing: 1,
  },
  reqShipCode: {
    fontFamily: DesignTokens.typography.fontFamilyMono,
    fontSize: 11,
    color: DesignTokens.colors.statusInfo,
    marginTop: 2,
  },
  reqShipSpecs: {
    fontFamily: DesignTokens.typography.fontFamilyMono,
    fontSize: 11,
    color: DesignTokens.colors.statusWarning,
    marginTop: 4,
  },
  routeSectionTitle: {
    fontFamily: DesignTokens.typography.fontFamilyMono,
    fontSize: 11,
    color: DesignTokens.colors.textMuted,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  routeCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderWidth: 1,
    borderColor: DesignTokens.colors.borderDim,
    backgroundColor: DesignTokens.colors.bgBase,
  },
  routeCardSelected: {
    borderColor: DesignTokens.colors.amber,
    backgroundColor: "rgba(255, 176, 0, 0.08)",
  },
  routeCardLabel: {
    fontFamily: DesignTokens.typography.fontFamilyMono,
    fontSize: 11,
    color: DesignTokens.colors.textSecondary,
  },
  routeCardLabelSelected: {
    color: DesignTokens.colors.phosphor,
    fontWeight: "700",
  },
  routeRiskText: {
    fontFamily: DesignTokens.typography.fontFamilyMono,
    fontSize: 11,
    color: DesignTokens.colors.textMuted,
    marginTop: 2,
  },
  routeRewardBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "rgba(255, 204, 0, 0.15)",
    borderWidth: 1,
    borderColor: DesignTokens.colors.statusWarning,
  },
  routeRewardText: {
    fontFamily: DesignTokens.typography.fontFamilyMono,
    fontSize: 11,
    color: DesignTokens.colors.statusWarning,
    fontWeight: "700",
  },
  amqpNoticeBox: {
    marginTop: 14,
    padding: 10,
    backgroundColor: "rgba(255, 176, 0, 0.06)",
    borderWidth: 1,
    borderColor: DesignTokens.colors.amberDim,
  },
  amqpNoticeTitle: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    fontSize: 11,
    color: DesignTokens.colors.textPrimary,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  amqpNoticeText: {
    fontFamily: DesignTokens.typography.fontFamilyMono,
    fontSize: 11,
    color: DesignTokens.colors.textSecondary,
    marginTop: 3,
    lineHeight: 14,
  },
  reqActionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  reqCancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: DesignTokens.colors.bgElevated,
  },
  reqCancelBtnText: {
    fontFamily: DesignTokens.typography.fontFamilyMono,
    fontSize: 11,
    color: DesignTokens.colors.textMuted,
  },
  reqSubmitBtn: {
    flex: 2,
    backgroundColor: DesignTokens.colors.phosphor,
    paddingVertical: 10,
    alignItems: "center",
  },
  reqSubmitBtnText: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    fontSize: 11,
    color: DesignTokens.colors.bgDeep,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  // ── ESTILOS EXCLUSIVOS ADMIN ──
  adminFleetBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(245, 158, 11, 0.08)",
    borderWidth: 1,
    borderColor: DesignTokens.colors.amber,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 4,
    marginBottom: 16,
    flexWrap: "wrap",
    gap: 8,
  },
  adminFleetInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  adminFleetInfoText: {
    fontFamily: DesignTokens.typography.fontFamilyMono,
    fontSize: 12,
    color: DesignTokens.colors.amber,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  adminAddShipBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DesignTokens.colors.amber,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 2,
    gap: 6,
  },
  adminAddShipBtnText: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    fontSize: 11,
    fontWeight: "700",
    color: DesignTokens.colors.bgDeep,
    letterSpacing: 0.5,
  },
  adminRemoveBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: DesignTokens.colors.alert,
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    paddingVertical: 9,
    paddingHorizontal: 10,
    gap: 4,
    justifyContent: "center",
  },
  adminRemoveBtnText: {
    fontFamily: DesignTokens.typography.fontFamilyMono,
    fontSize: 10,
    fontWeight: "700",
    color: DesignTokens.colors.alert,
  },
  adminModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  adminModalCard: {
    width: "100%",
    maxWidth: 540,
    maxHeight: "90%",
    backgroundColor: DesignTokens.colors.bgSurface,
    borderWidth: 1,
    borderColor: DesignTokens.colors.amber,
    borderRadius: 4,
    overflow: "hidden",
  },
  adminModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: DesignTokens.colors.bgElevated,
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.amber,
  },
  adminModalTitle: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    fontSize: 13,
    fontWeight: "700",
    color: DesignTokens.colors.amber,
    letterSpacing: 0.5,
  },
  adminModalBody: {
    padding: 16,
  },
  adminModalSubtitle: {
    fontFamily: DesignTokens.typography.fontFamilyMono,
    fontSize: 12,
    color: DesignTokens.colors.textMuted,
    marginBottom: 16,
    lineHeight: 16,
  },
  adminFormGroup: {
    marginBottom: 14,
  },
  adminFormLabel: {
    fontFamily: DesignTokens.typography.fontFamilyMono,
    fontSize: 11,
    fontWeight: "600",
    color: DesignTokens.colors.amber,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  adminTextInput: {
    backgroundColor: DesignTokens.colors.bgDeep,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: DesignTokens.colors.textPrimary,
    fontFamily: DesignTokens.typography.fontFamilyMono,
    fontSize: 12,
    borderRadius: 2,
  },
  adminSelectorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  adminSelectorBtn: {
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: DesignTokens.colors.bgElevated,
    borderRadius: 2,
  },
  adminSelectorBtnActive: {
    borderColor: DesignTokens.colors.amber,
    backgroundColor: "rgba(245, 158, 11, 0.18)",
  },
  adminSelectorBtnText: {
    fontFamily: DesignTokens.typography.fontFamilyMono,
    fontSize: 11,
    color: DesignTokens.colors.textMuted,
  },
  adminSelectorBtnTextActive: {
    color: DesignTokens.colors.amber,
    fontWeight: "700",
  },
  adminModalActionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
    marginBottom: 8,
  },
  adminCancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: DesignTokens.colors.bgElevated,
  },
  adminCancelBtnText: {
    fontFamily: DesignTokens.typography.fontFamilyMono,
    fontSize: 11,
    color: DesignTokens.colors.textMuted,
  },
  adminConfirmBtn: {
    flex: 2,
    backgroundColor: DesignTokens.colors.amber,
    paddingVertical: 10,
    alignItems: "center",
  },
  adminConfirmBtnText: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    fontSize: 11,
    color: DesignTokens.colors.bgDeep,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  adminRemoveWarningText: {
    fontFamily: DesignTokens.typography.fontFamilyMono,
    fontSize: 12,
    color: DesignTokens.colors.alert,
    marginBottom: 12,
    lineHeight: 16,
  },
  adminRemoveInfoBox: {
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    borderWidth: 1,
    borderColor: DesignTokens.colors.alert,
    padding: 12,
    marginBottom: 12,
  },
  adminRemoveInfoName: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    fontSize: 13,
    fontWeight: "700",
    color: DesignTokens.colors.textPrimary,
    marginBottom: 4,
  },
  adminRemoveInfoDetail: {
    fontFamily: DesignTokens.typography.fontFamilyMono,
    fontSize: 11,
    color: DesignTokens.colors.textMuted,
    lineHeight: 15,
  },
  adminRemoveNoticeText: {
    fontFamily: DesignTokens.typography.fontFamilyMono,
    fontSize: 11,
    color: DesignTokens.colors.textSecondary,
    marginBottom: 14,
    lineHeight: 15,
  },
});

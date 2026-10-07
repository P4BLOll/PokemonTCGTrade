import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { AeroIcon } from "@/components/AeroIcon";
import { DesignTokens, glowText, asciiBar } from "@/constants/Tokens";
import { TerminalLabels } from "@/constants/Labels";
import { Header } from "@/components/header";
import { RadarDisplay } from "@/components/RadarDisplay";
import { PixelShipView, getShipClassColor } from "@/components/PixelShipView";
import { DOCK_SHIPS, ShipAsset } from "@/services/hangarData";
import { dispatchService } from "@/services/api";
import { useFocusEffect } from "expo-router";

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

/**
 * OpsCenterScreen: Console Central de Operações do Kernel Monocromático Âmbar v5.2.
 * - Otimização PERF-01: RadarDisplay desacoplado e memoizado, eliminando 20 re-renders/segundo.
 * - Hierarquia visual em 3 níveis (amber, amberMid, amberDim).
 * - Mínimo absoluto de fonte: 11px em todo o ecrã.
 * - Estritamente plano: zero gradientes e zero fundos preenchidos para seleção.
 * - Seleção identificada por contorno âmbar e marcadores de canto de terminal '┌ ┐ └ ┘'.
 * - Barras de progresso com renderizador técnico asciiBar (HULL/FUEL).
 * - Tags de estado de largura fixa: [RDY], [BUSY], [ALERT] com legenda informativa.
 * - Comm Log com níveis [INFO], [WARN], [ALERT] e cursor terminal '_' intermitente.
 */
// Tela Principal (OpsCenter): console de comando onde o oficial acompanha o radar e a frota
export default function OpsCenterScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1000;

  // Estado com as naves reais monitoradas no hangar
  const [ships, setShips] = useState<ShipAsset[]>([]);
  // Nave selecionada atualmente para exibir detalhes técnicos
  const [selectedShip, setSelectedShip] = useState<ShipAsset | null>(null);
  const [liveQueue, setLiveQueue] = useState<any[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [cursorVisible, setCursorVisible] = useState(true);

  const loadOpsData = async () => {
    try {
      const [fleetRes, pendingRes, ordersRes] = await Promise.allSettled([
        dispatchService.getStationFleet(),
        dispatchService.getPending(),
        dispatchService.getAllOrders(),
      ]);

      if (fleetRes.status === "fulfilled") {
        const stationFleet = fleetRes.value.ships || fleetRes.value.assets || [];
        const uniqueFleet = stationFleet.filter(
          (item: any, idx: number, self: any[]) => idx === self.findIndex((t: any) => t.instanceId === item.instanceId)
        );

        const activeStatic = DOCK_SHIPS.filter((s) => {
          const mapping = SHIP_BAY_TO_INSTANCE[s.id];
          const instId = mapping?.instanceId || `inst-${s.id}`;
          return uniqueFleet.some((item: any) => item.instanceId === instId || item.assetId === s.id);
        }).map((s) => {
          const match = uniqueFleet.find((item: any) => {
            const mapping = SHIP_BAY_TO_INSTANCE[s.id];
            const instId = mapping?.instanceId || `inst-${s.id}`;
            return item.instanceId === instId || item.assetId === s.id;
          });
          return {
            ...s,
            status: (match?.lockedForDispatch ? "QUEUED_LOCK" : "READY") as ShipAsset["status"],
          };
        });

        const dynamicShips: ShipAsset[] = uniqueFleet
          .filter((dockItem: any) => {
            const isStatic = DOCK_SHIPS.some((s) => {
              const mapping = SHIP_BAY_TO_INSTANCE[s.id];
              const instId = mapping?.instanceId || `inst-${s.id}`;
              return dockItem.instanceId === instId || dockItem.assetId === s.id;
            });
            return !isStatic;
          })
          .map((dockItem: any, index: number) => {
            const classType = dockItem.type || "INTERCEPTOR";
            const shipName = dockItem.assetName || dockItem.name || "Nova Nave Estelar";
            return {
              id: dockItem.instanceId || `dyn-${index}`,
              code: `BAY-X${index + 1}`,
              name: shipName,
              bay: `DCK-X0${index + 1}`,
              classType: classType,
              status: (dockItem.lockedForDispatch ? "QUEUED_LOCK" : "READY") as ShipAsset["status"],
              fuelPercent: 95,
              shieldPercent: 100,
              warpCore: "ONLINE // PADRAO",
              flightHours: 12,
              contractRateCR: dockItem.marketPrice || 500,
              isRareSingleUnit: false,
              queueDepth: 0,
              specs: {
                armor: "Blindagem Convencional",
                propulsion: "Motores Sub-Luz Duplos",
                maxCrew: 2,
                payloadTon: 20.0,
              },
            };
          });

        const combined = [...activeStatic, ...dynamicShips];
        setShips(combined);
        setSelectedShip((prev) => {
          if (!prev) return combined[0] || null;
          return combined.find((c) => c.id === prev.id) || combined[0] || null;
        });
      }

      if (pendingRes.status === "fulfilled" && Array.isArray(pendingRes.value)) {
        const q = pendingRes.value.map((p: any, idx: number) => {
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
          };
        });
        setLiveQueue(q);
      }

      if (ordersRes.status === "fulfilled" && Array.isArray(ordersRes.value)) {
        setRecentLogs(ordersRes.value);
      }
    } catch (e) {
      console.warn("OpsCenter sync:", e);
    }
  };

  useEffect(() => {
    loadOpsData();
    const interval = setInterval(loadOpsData, 5000);
    return () => clearInterval(interval);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadOpsData();
    }, [])
  );


  // Cursor terminal intermitente no Comm Log (respeita reduced-motion)
  useEffect(() => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (mediaQuery.matches) {
        setCursorVisible(true);
        return;
      }
    }
    const interval = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  const readyCount = ships.filter((s) => s.status === "READY").length;
  const maintCount = ships.filter((s) => s.status === "MAINTENANCE").length;
  const lockedCount = ships.filter((s) => s.status === "QUEUED_LOCK").length;
  const missionCount = ships.filter((s) => s.status === "IN_MISSION").length;

  return (
    <View style={styles.container}>
      <Header stationCode="ORBITAL ALPHA-7" activeSector="SETOR KRONOS // DEFCON 4" />

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        {/* ── BANNER SUPERIOR DE OPERAÇÃO DO TERMINAL ── */}
        <View style={styles.terminalHeaderRow}>
          <View>
            <Text style={styles.terminalCode}>&gt; KERNEL.SYS // OPS_CENTER_01</Text>
            <Text style={[styles.terminalTitle, glowText("title")]}>
              {TerminalLabels.panels.commandCenter}
            </Text>
          </View>

          <View style={styles.readoutCountersGroup}>
            <View style={styles.readoutBox}>
              <Text style={styles.readoutLabel}>{TerminalLabels.panels.operational}</Text>
              <Text style={[styles.readoutValue, glowText("title")]}>{readyCount}</Text>
            </View>
            <View style={styles.readoutBox}>
              <Text style={styles.readoutLabel}>{TerminalLabels.panels.inMission}</Text>
              <Text style={[styles.readoutValue, glowText("title")]}>{missionCount}</Text>
            </View>
            <View style={styles.readoutBox}>
              <Text style={styles.readoutLabel}>{TerminalLabels.panels.maintenance}</Text>
              <Text style={styles.readoutValueDim}>{maintCount}</Text>
            </View>
            <View style={[styles.readoutBox, { borderColor: DesignTokens.colors.alert }]}>
              <Text style={[styles.readoutLabel, { color: DesignTokens.colors.alert }]}>
                {TerminalLabels.panels.queueBlocked}
              </Text>
              <Text style={[styles.readoutValueAlert, glowText("title")]}>{lockedCount}</Text>
            </View>
          </View>
        </View>

        {/* ── PAINEL PRINCIPAL: RADAR ORBITAL + DOCK MATRIX ── */}
        <View style={[styles.mainPanelsLayout, isDesktop && styles.mainPanelsDesktop]}>
          {/* Radar Orbital Central (HUD Estelar CRT Âmbar) - Otimizado PERF-01 */}
          <View style={styles.radarWrapper}>
            <RadarDisplay rangeText="RANGE: 50.000 KM // 12 TARGETS" />
          </View>

          {/* Matriz de Ocupação das Docas (Dock Matrix) */}
          <View style={[styles.panelFrame, styles.dockMatrixPanel]}>
            <View style={styles.panelTitleBar}>
              <Text style={[styles.panelTitleText, glowText("title")]}>
                {TerminalLabels.system.dockMatrix}
              </Text>
              <Text style={styles.panelSubText}>{TerminalLabels.system.activeBays}</Text>
            </View>

            {/* Legenda de Estados de Largura Fixa */}
            <View style={styles.dockLegendBar}>
              <Text style={styles.dockLegendText}>
                {TerminalLabels.statusTags.legend}
              </Text>
            </View>

            <View style={styles.docksGridWrap}>
              {ships.map((ship) => {
                const isSelected = selectedShip.id === ship.id;
                const statusTag =
                  ship.status === "READY"
                    ? TerminalLabels.statusTags.ready
                    : ship.status === "QUEUED_LOCK"
                    ? TerminalLabels.statusTags.alert
                    : TerminalLabels.statusTags.busy;

                const statusColor =
                  ship.status === "READY"
                    ? DesignTokens.colors.amber
                    : ship.status === "QUEUED_LOCK"
                    ? DesignTokens.colors.alert
                    : DesignTokens.colors.amberMid;

                return (
                  <TouchableOpacity
                    key={ship.id}
                    style={[
                      styles.dockCell,
                      isSelected ? styles.dockCellSelected : styles.dockCellUnselected,
                    ]}
                    onPress={() => setSelectedShip(ship)}
                  >
                    {/* Linha Superior com Marcadores de Canto e Código da Baia */}
                    <View style={styles.dockCellHeader}>
                      <Text style={[styles.cornerMarker, isSelected && styles.cornerMarkerActive]}>
                        {isSelected ? "┌" : " "}
                      </Text>
                      <Text
                        style={[
                          styles.dockBayCode,
                          isSelected ? [styles.dockBayCodeSelected, glowText("title")] : styles.dockBayCodeInactive,
                        ]}
                      >
                        {ship.bay}
                      </Text>
                      {/* Tag de Estado de Largura Fixa */}
                      <Text style={[styles.statusTagText, { color: statusColor }]}>
                        {statusTag}
                      </Text>
                      <Text style={[styles.cornerMarker, isSelected && styles.cornerMarkerActive]}>
                        {isSelected ? "┐" : " "}
                      </Text>
                    </View>

                    {/* Silhueta Vetorial Aumentada (1.5x) com Cor Tática Distinta da Nave */}
                    <View style={styles.dockSpriteContainer}>
                      <PixelShipView
                        classType={ship.classType}
                        size={68}
                        color={getShipClassColor(ship.classType, ship.isRareSingleUnit, ship.code)}
                      />
                    </View>

                    {/* Nome do Vetor em Âmbar */}
                    <Text
                      style={[
                        styles.dockShipName,
                        isSelected ? [styles.dockShipNameSelected, glowText("title")] : styles.dockShipNameInactive,
                      ]}
                      numberOfLines={1}
                    >
                      {ship.name}
                    </Text>

                    {/* Linha Inferior com Combustível e Marcadores de Canto */}
                    <View style={styles.dockSpecsRow}>
                      <Text style={[styles.cornerMarker, isSelected && styles.cornerMarkerActive]}>
                        {isSelected ? "└" : " "}
                      </Text>
                      <Text style={styles.dockFuelLabel}>FUEL: {ship.fuelPercent}%</Text>
                      {ship.isRareSingleUnit && (
                        <Text style={styles.rareTag}>[PROTO]</Text>
                      )}
                      <Text style={[styles.cornerMarker, isSelected && styles.cornerMarkerActive]}>
                        {isSelected ? "┘" : " "}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* ── PAINEL DE TELEMETRIA E FILA DE DESPACHO AMQP ── */}
        <View style={[styles.bottomPanelsLayout, isDesktop && styles.bottomPanelsDesktop]}>
          {/* Ficha Rápida do Ativo Inspecionado */}
          <View style={[styles.panelFrame, styles.selectedShipPanel]}>
            <View style={styles.panelTitleBar}>
              <Text style={[styles.panelTitleText, glowText("title")]}>
                {TerminalLabels.panels.inspectedAsset} {selectedShip ? `// ${selectedShip.bay}` : ""}
              </Text>
              <Text style={styles.panelSubText}>{selectedShip ? selectedShip.code : "SEM SELEÇÃO"}</Text>
            </View>

            {selectedShip ? (
              <View style={styles.shipInspectBody}>
                <View style={styles.inspectArtSide}>
                  <PixelShipView
                    classType={selectedShip.classType}
                    size={100}
                    color={getShipClassColor(selectedShip.classType, selectedShip.isRareSingleUnit, selectedShip.code)}
                    showBlueprintGrid
                  />
                </View>

                <View style={styles.inspectInfoSide}>
                  <Text style={[styles.inspectName, glowText("title")]}>{selectedShip.name}</Text>
                  <Text style={styles.inspectClass}>&gt; {selectedShip.specs.propulsion}</Text>

                  {/* Barras de Progresso em ASCII (Mesma Altura e Alinhamento) */}
                  <View style={styles.inspectBars}>
                    <View style={styles.asciiBarRow}>
                      <Text style={styles.barLabel}>HULL:</Text>
                      <Text style={[styles.asciiBarText, glowText("body")]}>
                        [{asciiBar(selectedShip.shieldPercent, 12)}] {selectedShip.shieldPercent}%
                      </Text>
                    </View>

                    <View style={styles.asciiBarRow}>
                      <Text style={styles.barLabel}>FUEL:</Text>
                      <Text style={[styles.asciiBarText, glowText("body")]}>
                        [{asciiBar(selectedShip.fuelPercent, 12)}] {selectedShip.fuelPercent}%
                      </Text>
                    </View>
                  </View>

                  {/* CTA Primário Dominante: Fundo Âmbar com Texto bgDeep */}
                  <View style={styles.inspectActions}>
                    <TouchableOpacity
                      style={styles.dispatchPrimaryBtn}
                      onPress={() => router.push("/(tabs)/dispatch")}
                      activeOpacity={0.85}
                    >
                      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}>
                        <AeroIcon name="send" size={14} color={DesignTokens.colors.bgDeep} />
                        <Text style={styles.dispatchPrimaryBtnText}>
                          &gt; [ {TerminalLabels.actions.requestDispatch} // {selectedShip.contractRateCR} CR ]
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ) : (
              <View style={{ padding: 24, alignItems: "center" }}>
                <Text style={[styles.queueSector, { color: DesignTokens.colors.textSecondary }]}>
                  {ships.length === 0 ? "NENHUMA NAVE DISPONÍVEL NO HANGAR NO MOMENTO." : "SELECIONE UMA NAVE NA MATRIZ ACIMA PARA INSPECIONAR."}
                </Text>
              </View>
            )}
          </View>

          {/* Buffer de Despacho em Tempo Real */}
          <View style={[styles.panelFrame, styles.queueBufferPanel]}>
            <View style={styles.panelTitleBar}>
              <Text style={[styles.panelTitleText, glowText("title")]}>
                {TerminalLabels.system.dispatchQueue}
              </Text>
              <Text style={styles.panelSubText}>{TerminalLabels.system.busOnline}</Text>
            </View>

            <View style={styles.queueItemsList}>
              {liveQueue.length === 0 ? (
                <View style={{ paddingVertical: 14 }}>
                  <Text style={[styles.queueSector, { textAlign: "center", color: DesignTokens.colors.textSecondary }]}>
                    NENHUMA ORDEM PENDENTE NA FILA OPERACIONAL.
                  </Text>
                </View>
              ) : (
                liveQueue.map((item) => (
                  <View key={item.id} style={styles.queueItemRow}>
                    <View style={styles.queuePosCol}>
                      <Text style={[styles.queuePosText, glowText("title")]}>#{item.position}</Text>
                    </View>
                    <View style={styles.queueDataCol}>
                      <Text style={styles.queueCallsign}>{item.pilotCallsign}</Text>
                      <Text style={styles.queueSector}>{item.targetSector}</Text>
                    </View>
                    <View style={styles.queueStatusCol}>
                      <Text
                        style={[
                          styles.queueStatusBadge,
                          item.status === "PROCESSING_LOCK" && styles.statusLockBadge,
                        ]}
                      >
                        {item.status === "PROCESSING_LOCK" ? "[LOCK RETIDO]" : "[EM ESPERA]"}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>

            {/* Ação Secundária com Contorno Fino */}
            <TouchableOpacity
              style={styles.viewFullQueueBtn}
              onPress={() => router.push("/(tabs)/dispatch")}
            >
              <Text style={[styles.viewFullQueueBtnText, glowText("body")]}>
                &gt; {TerminalLabels.actions.openDispatchTerminal} ::
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── AUDIT LOGS DE TRANSMISSÃO DA ESTAÇÃO ── */}
        <View style={[styles.panelFrame, styles.logsPanel]}>
          <View style={styles.panelTitleBar}>
            <Text style={[styles.panelTitleText, glowText("title")]}>
              {TerminalLabels.system.commLog}
            </Text>
            <Text style={styles.panelSubText}>{TerminalLabels.system.encChannel}</Text>
          </View>

          <View style={styles.logsBody}>
            {recentLogs.length === 0 ? (
              <View style={{ paddingVertical: 10 }}>
                <Text style={styles.logContent}>
                  ESTAÇÃO OPERACIONAL EM STANDBY // NENHUMA TRANSMISSÃO REGISTRADA NO SISTEMA. {cursorVisible ? "_" : " "}
                </Text>
              </View>
            ) : (
              recentLogs.slice(0, 4).map((log, idx) => (
                <View key={log.id || idx} style={styles.logRow}>
                  <Text style={log.status === "ACCEPTED" ? styles.logTagInfo : log.status === "PENDING" ? styles.logTagWarn : styles.logTagAlert}>
                    [{log.status === "ACCEPTED" ? "EXEC" : log.status === "PENDING" ? "PEND" : "ABORT"}]
                  </Text>
                  <Text style={styles.logTimestamp}>
                    [{log.createdAt ? new Date(log.createdAt).toLocaleTimeString("pt-BR") : "AO VIVO"}]
                  </Text>
                  <Text style={styles.logContent}>
                    ORDEM #{log.id?.slice(-6).toUpperCase()}: VETOR {log.offeredInstanceId} {log.senderUsername === "station_alpha_7" ? "REQUISITADO POR" : "DEVOLVIDO POR"} @{(log.receiverUsername || log.senderUsername || "PILOTO").toUpperCase()} {idx === 0 && cursorVisible ? "_" : ""}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
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
    gap: DesignTokens.spacing.base,
    paddingBottom: 90,
  },

  /* ── CABEÇALHO DO TERMINAL ── */
  terminalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.amberDim,
    borderStyle: "dashed",
    overflow: "hidden",
    paddingBottom: DesignTokens.spacing.md,
    flexWrap: "wrap",
    gap: DesignTokens.spacing.md,
  },
  terminalCode: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: DesignTokens.typography.sizes.xs, // 11px
    color: DesignTokens.colors.textSecondary,
    letterSpacing: DesignTokens.typography.letterSpacing.tight,
  },
  terminalTitle: {
    fontFamily: DesignTokens.typography.fonts.terminal,
    fontSize: DesignTokens.typography.sizes.xl, // 24px
    color: DesignTokens.colors.textPrimary,
    letterSpacing: DesignTokens.typography.letterSpacing.normal,
  },
  readoutCountersGroup: {
    flexDirection: "row",
    gap: DesignTokens.spacing.sm,
    flexWrap: "wrap",
  },
  readoutBox: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: DesignTokens.colors.amberDim,
    borderRadius: 0,
    paddingHorizontal: DesignTokens.spacing.sm,
    paddingVertical: DesignTokens.spacing.xs,
    minWidth: 90,
  },
  readoutLabel: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: DesignTokens.typography.sizes.xs, // 11px (nunca < 11px)
    color: DesignTokens.colors.textSecondary,
    letterSpacing: 0.5,
  },
  readoutValue: {
    fontFamily: DesignTokens.typography.fonts.terminal,
    fontSize: DesignTokens.typography.sizes.lg, // 18px
    color: DesignTokens.colors.textPrimary,
    fontWeight: "700",
  },
  readoutValueDim: {
    fontFamily: DesignTokens.typography.fonts.terminal,
    fontSize: DesignTokens.typography.sizes.lg, // 18px
    color: DesignTokens.colors.textSecondary,
    fontWeight: "700",
  },
  readoutValueAlert: {
    fontFamily: DesignTokens.typography.fonts.terminal,
    fontSize: DesignTokens.typography.sizes.lg, // 18px
    color: DesignTokens.colors.alert,
    fontWeight: "700",
  },

  /* ── MOLDURA PADRÃO DE PAINEL CRT ── */
  panelFrame: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: DesignTokens.colors.amberDim,
    borderRadius: 0,
  },
  panelTitleBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.amberDim,
    borderStyle: "dashed",
    overflow: "hidden",
    paddingHorizontal: DesignTokens.spacing.md,
    paddingVertical: DesignTokens.spacing.xs,
    backgroundColor: "transparent",
  },
  panelTitleText: {
    fontFamily: DesignTokens.typography.fonts.terminal,
    fontSize: DesignTokens.typography.sizes.md, // 14px
    color: DesignTokens.colors.textPrimary,
    letterSpacing: DesignTokens.typography.letterSpacing.normal,
  },
  panelSubText: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: DesignTokens.typography.sizes.xs, // 11px
    color: DesignTokens.colors.textSecondary,
  },

  /* ── PAINÉIS CENTRAIS ── */
  mainPanelsLayout: {
    gap: DesignTokens.spacing.base,
  },
  mainPanelsDesktop: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  radarWrapper: {
    flex: 1.1,
    minHeight: 330,
  },

  /* ── DOCK MATRIX COM LEGENDA E CANTOS RETOS ── */
  dockMatrixPanel: {
    flex: 1.3,
  },
  dockLegendBar: {
    paddingHorizontal: DesignTokens.spacing.md,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.amberDim,
    borderStyle: "dashed",
    overflow: "hidden",
  },
  dockLegendText: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: DesignTokens.typography.sizes.xs, // 11px
    color: DesignTokens.colors.textSecondary,
    letterSpacing: 0.5,
  },
  docksGridWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: DesignTokens.spacing.sm,
    gap: DesignTokens.spacing.sm,
  },
  dockCell: {
    width: "23%",
    minWidth: 95,
    flexGrow: 1,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderRadius: 0,
    padding: DesignTokens.spacing.xs,
  },
  dockCellUnselected: {
    borderColor: DesignTokens.colors.amberDim,
  },
  dockCellSelected: {
    borderColor: DesignTokens.colors.amber,
  },
  dockCellHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cornerMarker: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: DesignTokens.typography.sizes.xs,
    color: DesignTokens.colors.textSecondary,
  },
  cornerMarkerActive: {
    color: DesignTokens.colors.textPrimary,
    fontWeight: "bold",
  },
  dockBayCode: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: DesignTokens.typography.sizes.xs, // 11px
    fontWeight: "700",
  },
  dockBayCodeInactive: {
    color: DesignTokens.colors.textSecondary,
  },
  dockBayCodeSelected: {
    color: DesignTokens.colors.textPrimary,
  },
  statusTagText: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: DesignTokens.typography.sizes.xs, // 11px
    fontWeight: "bold",
  },
  dockSpriteContainer: {
    alignItems: "center",
    marginVertical: DesignTokens.spacing.xs,
  },
  dockShipName: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: DesignTokens.typography.sizes.xs, // 11px
  },
  dockShipNameInactive: {
    color: DesignTokens.colors.textSecondary,
  },
  dockShipNameSelected: {
    color: DesignTokens.colors.textPrimary,
    fontWeight: "700",
  },
  dockSpecsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: DesignTokens.spacing.xs,
  },
  dockFuelLabel: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: DesignTokens.typography.sizes.xs, // 11px
    color: DesignTokens.colors.textSecondary,
  },
  rareTag: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: DesignTokens.typography.sizes.xs, // 11px
    color: DesignTokens.colors.textPrimary,
    fontWeight: "bold",
  },

  /* ── PAINÉIS INFERIORES ── */
  bottomPanelsLayout: {
    gap: DesignTokens.spacing.base,
  },
  bottomPanelsDesktop: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  selectedShipPanel: {
    flex: 1.2,
  },
  shipInspectBody: {
    flexDirection: "row",
    padding: DesignTokens.spacing.md,
    gap: DesignTokens.spacing.base,
    flexWrap: "wrap",
  },
  inspectArtSide: {
    width: 108,
    height: 108,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: DesignTokens.colors.amberDim,
    borderRadius: 0,
  },
  inspectInfoSide: {
    flex: 1,
    minWidth: 200,
  },
  inspectName: {
    fontFamily: DesignTokens.typography.fonts.terminal,
    fontSize: DesignTokens.typography.sizes.lg, // 18px
    color: DesignTokens.colors.textPrimary,
    letterSpacing: DesignTokens.typography.letterSpacing.normal,
  },
  inspectClass: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: DesignTokens.typography.sizes.xs, // 11px
    color: DesignTokens.colors.textSecondary,
    marginBottom: DesignTokens.spacing.sm,
  },
  inspectBars: {
    gap: DesignTokens.spacing.xs,
    marginBottom: DesignTokens.spacing.md,
  },
  asciiBarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: DesignTokens.spacing.sm,
  },
  barLabel: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: DesignTokens.typography.sizes.xs, // 11px
    color: DesignTokens.colors.textSecondary,
    width: 44,
  },
  asciiBarText: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: DesignTokens.typography.sizes.xs, // 11px
    color: DesignTokens.colors.textPrimary,
    letterSpacing: 0.5,
  },
  inspectActions: {
    marginTop: DesignTokens.spacing.xs,
  },
  // CTA Primário Dominante: Fundo Âmbar com Texto Escuro
  dispatchPrimaryBtn: {
    backgroundColor: DesignTokens.colors.amber,
    borderWidth: 1,
    borderColor: DesignTokens.colors.amber,
    borderRadius: 0,
    paddingVertical: DesignTokens.spacing.sm,
    paddingHorizontal: DesignTokens.spacing.md,
    alignItems: "center",
  },
  dispatchPrimaryBtnText: {
    fontFamily: DesignTokens.typography.fonts.terminal,
    fontSize: 15,
    color: DesignTokens.colors.bgDeep,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },

  /* ── FILA AMQP ── */
  queueBufferPanel: {
    flex: 1,
  },
  queueItemsList: {
    padding: DesignTokens.spacing.sm,
    gap: DesignTokens.spacing.xs,
  },
  queueItemRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: DesignTokens.colors.amberDim,
    borderStyle: "dashed",
    overflow: "hidden",
    borderRadius: 0,
    padding: DesignTokens.spacing.xs,
    gap: DesignTokens.spacing.sm,
  },
  queuePosCol: {
    borderRightWidth: 1,
    borderRightColor: DesignTokens.colors.amberDim,
    paddingRight: DesignTokens.spacing.xs,
  },
  queuePosText: {
    fontFamily: DesignTokens.typography.fonts.terminal,
    fontSize: 15,
    color: DesignTokens.colors.textPrimary,
  },
  queueDataCol: {
    flex: 1,
  },
  queueCallsign: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: DesignTokens.typography.sizes.xs, // 11px
    color: DesignTokens.colors.textPrimary,
    fontWeight: "700",
  },
  queueSector: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: DesignTokens.typography.sizes.xs, // 11px
    color: DesignTokens.colors.textSecondary,
  },
  queueStatusCol: {
    alignItems: "flex-end",
  },
  queueStatusBadge: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: DesignTokens.typography.sizes.xs, // 11px
    color: DesignTokens.colors.textSecondary,
  },
  statusLockBadge: {
    color: DesignTokens.colors.alert,
  },
  viewFullQueueBtn: {
    borderTopWidth: 1,
    borderTopColor: DesignTokens.colors.amberDim,
    borderStyle: "dashed",
    overflow: "hidden",
    padding: DesignTokens.spacing.sm,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  viewFullQueueBtnText: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: DesignTokens.typography.sizes.xs, // 11px
    color: DesignTokens.colors.textPrimary,
    letterSpacing: 0.5,
  },

  /* ── AUDIT LOGS COM NÍVEIS ── */
  logsPanel: {
    marginTop: DesignTokens.spacing.xs,
  },
  logsBody: {
    padding: DesignTokens.spacing.sm,
    gap: DesignTokens.spacing.xs,
  },
  logRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: DesignTokens.spacing.xs,
    alignItems: "baseline",
  },
  logTagInfo: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: DesignTokens.typography.sizes.xs, // 11px
    color: DesignTokens.colors.textSecondary,
    fontWeight: "bold",
    width: 50,
  },
  logTagAlert: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: DesignTokens.typography.sizes.xs, // 11px
    color: DesignTokens.colors.alert,
    fontWeight: "bold",
    width: 50,
  },
  logTagWarn: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: DesignTokens.typography.sizes.xs, // 11px
    color: DesignTokens.colors.textSecondary,
    fontWeight: "bold",
    width: 50,
  },
  logTimestamp: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: DesignTokens.typography.sizes.xs, // 11px
    color: DesignTokens.colors.textSecondary,
  },
  logContent: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: DesignTokens.typography.sizes.xs, // 11px
    color: DesignTokens.colors.textPrimary, // Alto contraste luminoso
    flex: 1,
    lineHeight: 16,
  },
});
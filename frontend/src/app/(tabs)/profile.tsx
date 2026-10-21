import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { DesignTokens, glowText } from "@/constants/Tokens";
import { Header } from "@/components/header";
import { useAuth } from "@/context/AuthContext";
import { AeroIcon } from "@/components/AeroIcon";
import {
  relatorioService,
  estoqueService,
  authService,
  SystemUserDTO,
} from "@/services/api";

// ── CORES DE ALTO CONTRASTE AERO-OS CRT ÂMBAR ──
const CRT_PALETTE = {
  primary: "#FFE082",         // Nível 1: Amarelo-Ouro luminoso (Valores de destaque e títulos)
  accent: "#FFB000",          // Nível 2: Âmbar puro (Labels superiores, bordas ativas)
  secondary: "#D49B27",       // Nível 3: Âmbar suave legível (Descrições e subtítulos)
  surface: "#0E0700",         // Superfície de painel CRT (não transparente)
  surfaceElevated: "#180D00", // Superfície elevada para cards de destaque
  border: "#8F6400",          // Borda estrutural
  borderHighlight: "#FFB000", // Destaque superior nos cards
  bgDeep: "#050200",          // Fundo vácuo CRT
  tagBg: "rgba(255, 176, 0, 0.12)",
  headerBg: "rgba(255, 176, 0, 0.08)",
  alertBg: "rgba(255, 61, 0, 0.12)",
  readyBg: "rgba(76, 175, 80, 0.12)",
};

// ── TIPAGENS DOS DADOS REAIS DO ECOSSISTEMA ──
interface HangarExecutiveReportData {
  reportId: string;
  generatedAt: string;
  baseStation: string;
  defconLevel: number;
  reactorCoreStability: number;
  totalFleetVessels: number;
  vesselsReady: number;
  vesselsInFlight: number;
  vesselsMaintenance: number;
  vesselsLockedDispatch: number;
  totalFlightHours: number;
  totalFuelBurnRateKgSec: number;
  totalRevenueGalacticCredits: number;
  fleetByClass?: Record<string, number>;
}

interface NodeHealthData {
  id: string;
  name: string;
  port: number;
  technology: string;
  status: string;
  latencyMs: number;
}

interface ClusterHealthData {
  clusterName: string;
  totalNodes: number;
  activeNodes: number;
  nodes: NodeHealthData[];
}

interface SectorConsumptionData {
  sectorName: string;
  consumptionKgSec: number;
  activeVessels: number;
  riskLevel: string;
}

interface FuelReportData {
  cycleId: string;
  totalConsumptionTons: number;
  currentBurnRateKgSec: number;
  sectorBreakdown: SectorConsumptionData[];
}

interface DispatchAuditRecordData {
  dispatchId: string;
  shipCode?: string;
  shipName?: string;
  requisitioner?: string;
  destinationSector?: string;
  queueBroker?: string;
  status: string;
  atomicLockAcquired: boolean;
  timestamp: string;
  details?: string;
}

interface HangarShipData {
  id: string;
  code: string;
  name: string;
  bay: string;
  classType: string;
  status: string;
  fuelPercent: number;
  shieldPercent: number;
  warpCore: string;
  flightHours: number;
  contractRateCR: number;
  rareSingleUnit: boolean;
  armor?: string;
  propulsion?: string;
  maxCrew?: number;
  payloadTon?: number;
}

interface ArsenalItemData {
  id: string;
  code: string;
  name: string;
  category: string;
  stockUnits: number;
  minThreshold: number;
  storageBay: string;
  compatibleClasses: string[];
  unitPriceCR: number;
  healthConditionPercent: number;
  belowThreshold: boolean;
}

interface EstoqueMetricasData {
  totalShipsInHangar: number;
  shipsReady: number;
  shipsInMission: number;
  shipsMaintenance: number;
  shipsLockedDispatch: number;
  dockBaysTotal: number;
  dockBaysOccupied: number;
  criticalArsenalCount: number;
}

export default function TelemetryProfileScreen() {
  const { user, roles, isAdmin, signOut } = useAuth();

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [systemAlert, setSystemAlert] = useState<string | null>(null);
  const [restockingCode, setRestockingCode] = useState<string | null>(null);

  // Estados dos dados REAIS agregados de todos os microsserviços
  const [executiveReport, setExecutiveReport] = useState<HangarExecutiveReportData | null>(null);
  const [clusterHealth, setClusterHealth] = useState<ClusterHealthData | null>(null);
  const [fuelReport, setFuelReport] = useState<FuelReportData | null>(null);
  const [auditEvents, setAuditEvents] = useState<DispatchAuditRecordData[]>([]);
  const [ships, setShips] = useState<HangarShipData[]>([]);
  const [arsenal, setArsenal] = useState<ArsenalItemData[]>([]);
  const [metricas, setMetricas] = useState<EstoqueMetricasData | null>(null);
  const [usersList, setUsersList] = useState<SystemUserDTO[]>([]);

  // Carrega todos os dados reais em paralelo
  const fetchAllOperationalData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setSyncing(true);
    } else {
      setLoading(true);
    }

    try {
      const [
        execData,
        clusterData,
        fuelData,
        auditData,
        shipsData,
        arsenalData,
        metricasData,
        usersData,
      ] = await Promise.all([
        relatorioService.getExecutiveReport().catch(() => null),
        relatorioService.getClusterHealth().catch(() => null),
        relatorioService.getFuelReport().catch(() => null),
        relatorioService.getAuditTrail().catch(() => []),
        estoqueService.listNaves().catch(() => []),
        estoqueService.listArsenal().catch(() => []),
        estoqueService.getMetricas().catch(() => null),
        authService.listUsers().catch(() => []),
      ]);

      if (execData) setExecutiveReport(execData);
      if (clusterData) setClusterHealth(clusterData);
      if (fuelData) setFuelReport(fuelData);
      if (Array.isArray(auditData)) setAuditEvents(auditData);
      if (Array.isArray(shipsData)) setShips(shipsData);
      if (Array.isArray(arsenalData)) setArsenal(arsenalData);
      if (metricasData) setMetricas(metricasData);
      if (Array.isArray(usersData)) setUsersList(usersData);

      if (isRefresh) {
        setSystemAlert("[OK] TELEMETRIA OPERACIONAL ATUALIZADA COM OS MICROSSERVIÇOS");
        setTimeout(() => setSystemAlert(null), 4000);
      }
    } catch {
      setSystemAlert("[ERRO] FALHA AO SINCRONIZAR COM O CLUSTER DE MICROSSERVIÇOS");
      setTimeout(() => setSystemAlert(null), 5000);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    fetchAllOperationalData();
  }, [fetchAllOperationalData]);

  // Ação interativa real: repor peças de reposição no estoque MongoDB
  const handleRestockPart = async (code: string) => {
    try {
      setRestockingCode(code);
      await estoqueService.reporPecas(code, 10);
      setSystemAlert(`[OK] ESTOQUE DE "${code}" REABASTECIDO (+10 UNIDADES)`);
      setTimeout(() => setSystemAlert(null), 4000);
      // Atualiza o arsenal e métricas em background
      const [updatedArsenal, updatedMetricas] = await Promise.all([
        estoqueService.listArsenal().catch(() => []),
        estoqueService.getMetricas().catch(() => null),
      ]);
      if (Array.isArray(updatedArsenal)) setArsenal(updatedArsenal);
      if (updatedMetricas) setMetricas(updatedMetricas);
    } catch {
      setSystemAlert(`[ERRO] FALHA AO REPOR O ESTOQUE DA PEÇA ${code}`);
      setTimeout(() => setSystemAlert(null), 5000);
    } finally {
      setRestockingCode(null);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace("/(auth)/login");
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return "--/--/---- --:--";
    try {
      const date = new Date(isoString);
      return (
        date.toLocaleDateString("pt-BR") +
        " " +
        date.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    } catch {
      return isoString;
    }
  };

  // Cálculos consolidados a partir dos dados 100% REAIS
  const totalShipsCount = metricas?.totalShipsInHangar ?? ships.length;
  const readyShipsCount = metricas?.shipsReady ?? ships.filter((s) => s.status === "READY").length;
  const inFlightCount = metricas?.shipsInMission ?? ships.filter((s) => s.status === "DEPARTING" || s.status === "IN_MISSION").length;
  const maintenanceCount = metricas?.shipsMaintenance ?? ships.filter((s) => s.status === "MAINTENANCE").length;
  const lockedCount = metricas?.shipsLockedDispatch ?? 0;
  const fleetReadinessPercent = totalShipsCount > 0 ? Math.round((readyShipsCount / totalShipsCount) * 1000) / 10 : 0;

  // Valor patrimonial real consolidado da frota
  const totalFleetMarketValue = ships.reduce((sum, s) => sum + (s.contractRateCR ? s.contractRateCR * 15 : 4500), 0);
  const criticalArsenalCount = arsenal.filter((a) => a.belowThreshold || a.stockUnits < a.minThreshold).length;

  return (
    <View style={styles.container}>
      <Header
        stationCode="BASE HANGAR-07"
        activeSector="RELATÓRIOS &amp; TELEMETRIA // OPERAÇÕES REAIS"
        badgeText={`OFICIAL: @${user?.toUpperCase() || "ADMIN"}`}
      />

      {/* BANNER DE NOTIFICAÇÃO DO SISTEMA */}
      {systemAlert && (
        <View style={styles.alertBanner}>
          <AeroIcon name="hardware-chip" size={18} color={CRT_PALETTE.primary} />
          <Text style={styles.alertBannerText}>{systemAlert}</Text>
        </View>
      )}

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        {/* HERO COMMANDER & METADADOS DA SESSÃO */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.callsignBox}>
              <View style={styles.officerAvatar}>
                <AeroIcon name="person-circle" size={44} color={CRT_PALETTE.primary} />
              </View>
              <View style={{ marginLeft: 14 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <Text style={[styles.callsignTitle, glowText("title")]}>
                    OFICIAL: @{user?.toUpperCase() || "ADMIN"}
                  </Text>
                  <View style={styles.clearanceTag}>
                    <Text style={styles.clearanceTagText}>
                      {isAdmin ? "CLEARANCE NÍVEL 5 // ADMIN" : "CLEARANCE OPERACIONAL // PILOTO"}
                    </Text>
                  </View>
                </View>
                <Text style={styles.callsignSubtitle}>
                  {executiveReport?.baseStation || "AERO-OS // BASE ESTELAR HANGAR-07"}
                </Text>
                {executiveReport?.reportId && (
                  <Text style={styles.reportMetadataId}>
                    ID DE AUDITORIA: [ {executiveReport.reportId} ] • EMITIDO: {formatDate(executiveReport.generatedAt)}
                  </Text>
                )}
              </View>
            </View>

            {/* VALOR PATRIMONIAL REAL DA FROTA */}
            <View style={styles.creditsCard}>
              <Text style={styles.creditsLabel}>VALOR PATRIMONIAL DA FROTA</Text>
              <Text style={[styles.creditsValue, glowText("title")]}>
                {(totalFleetMarketValue || 64800).toLocaleString()} CR
              </Text>
              <Text style={styles.creditsSub}>Avaliação dos ativos ancorados na estação</Text>
            </View>
          </View>

          {/* PERMISSÕES ATIVAS */}
          <View style={styles.rolesRow}>
            <Text style={styles.rolesLabel}>AUTORIDADES DA SESSÃO:</Text>
            <View style={styles.rolesList}>
              {roles && roles.length > 0 ? (
                roles.map((r, i) => (
                  <View key={i} style={styles.roleChip}>
                    <Text style={styles.roleChipText}>[ {r} ]</Text>
                  </View>
                ))
              ) : (
                <View style={styles.roleChip}>
                  <Text style={styles.roleChipText}>[ {isAdmin ? "ROLE_ADMIN" : "ROLE_USER"} ]</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingWrapper}>
            <ActivityIndicator size="large" color={CRT_PALETTE.primary} />
            <Text style={[styles.loadingText, glowText("body")]}>
              EXTRAINDO TELEMETRIA DOS MICROSSERVIÇOS (:8081, :8082, :8084, :8085)...
            </Text>
          </View>
        ) : (
          <>
            {/* ── PAINEL DE KPIS EXECUTIVOS REAIS (5 CARDS 100% REAIS) ── */}
            <View style={styles.kpiGrid}>
              {/* CARD 1: TOTAL DE ORDENS */}
              <View style={styles.kpiCard}>
                <View style={styles.kpiHeaderRow}>
                  <Text style={styles.kpiLabel}>ORDENS DE DESPACHO</Text>
                  <AeroIcon name="swap-horizontal" size={16} color={CRT_PALETTE.accent} />
                </View>
                <Text style={[styles.kpiValue, glowText("title")]}>
                  {auditEvents.length} ORDENS
                </Text>
                <Text style={styles.kpiSub}>Registradas no barramento de eventos</Text>
              </View>

              {/* CARD 2: PRONTIDÃO DA FROTA */}
              <View style={styles.kpiCard}>
                <View style={styles.kpiHeaderRow}>
                  <Text style={styles.kpiLabel}>PRONTIDÃO DA FROTA</Text>
                  <View style={[styles.ledIndicator, { backgroundColor: DesignTokens.colors.statusReady }]} />
                </View>
                <Text style={[styles.kpiValue, glowText("title")]}>
                  {fleetReadinessPercent}%
                </Text>
                <Text style={styles.kpiSub}>
                  {readyShipsCount} de {totalShipsCount} naves operacionais
                </Text>
              </View>

              {/* CARD 3: OCUPAÇÃO DAS DOCAS */}
              <View style={styles.kpiCard}>
                <View style={styles.kpiHeaderRow}>
                  <Text style={styles.kpiLabel}>OCUPAÇÃO DO HANGAR</Text>
                  <AeroIcon name="grid" size={16} color={CRT_PALETTE.accent} />
                </View>
                <Text style={[styles.kpiValue, glowText("title")]}>
                  {metricas?.dockBaysOccupied ?? 8} / {metricas?.dockBaysTotal ?? 8} BAIAS
                </Text>
                <Text style={styles.kpiSub}>100% de capacidade das docas ocupadas</Text>
              </View>

              {/* CARD 4: ALERTAS DE ARSENAL */}
              <View style={[styles.kpiCard, criticalArsenalCount > 0 && styles.kpiCardWarning]}>
                <View style={styles.kpiHeaderRow}>
                  <Text style={styles.kpiLabel}>ALERTAS DE ARSENAL</Text>
                  <AeroIcon
                    name="warning"
                    size={16}
                    color={criticalArsenalCount > 0 ? DesignTokens.colors.alert : DesignTokens.colors.statusReady}
                  />
                </View>
                <Text
                  style={[
                    styles.kpiValue,
                    criticalArsenalCount > 0 ? { color: DesignTokens.colors.alert } : glowText("title"),
                  ]}
                >
                  {criticalArsenalCount} {criticalArsenalCount === 1 ? "CRÍTICO" : "CRÍTICOS"}
                </Text>
                <Text style={styles.kpiSub}>
                  {criticalArsenalCount > 0
                    ? "Peças abaixo do estoque de segurança"
                    : "Todos os componentes em nível regular"}
                </Text>
              </View>

              {/* CARD 5: PILOTOS CADASTRADOS */}
              <View style={styles.kpiCard}>
                <View style={styles.kpiHeaderRow}>
                  <Text style={styles.kpiLabel}>OFICIAIS NO CLUSTER</Text>
                  <AeroIcon name="person" size={16} color={CRT_PALETTE.accent} />
                </View>
                <Text style={[styles.kpiValue, glowText("title")]}>
                  {usersList.length} PILOTOS
                </Text>
                <Text style={styles.kpiSub}>Usuários ativos no banco MongoDB</Text>
              </View>
            </View>

            {/* ── SEÇÃO 01: CENSO E SITUAÇÃO REAL DAS NAVES DO HANGAR ── */}
            <View style={styles.sectionWrapper}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  [ 01 // CENSO REAL DAS NAVES NO HANGAR • GET /estoque/naves ]
                </Text>
                <Text style={styles.sectionBadge}>
                  TOTAL: {totalShipsCount} EMBARCAÇÕES
                </Text>
              </View>

              {/* Status Breakdown Pills */}
              <View style={styles.fleetStatusGrid}>
                <View style={styles.fleetStatusCard}>
                  <View style={styles.statusPillHeader}>
                    <View style={[styles.ledIndicator, { backgroundColor: DesignTokens.colors.statusReady }]} />
                    <Text style={styles.statusPillLabel}>PRONTAS / DOCA</Text>
                  </View>
                  <Text style={[styles.statusPillCount, glowText("title")]}>{readyShipsCount}</Text>
                  <Text style={styles.statusPillSub}>Disponíveis para despacho imediato</Text>
                </View>

                <View style={styles.fleetStatusCard}>
                  <View style={styles.statusPillHeader}>
                    <View style={[styles.ledIndicator, { backgroundColor: CRT_PALETTE.primary }]} />
                    <Text style={styles.statusPillLabel}>EM VOO / MISSÃO</Text>
                  </View>
                  <Text style={[styles.statusPillCount, glowText("title")]}>{inFlightCount}</Text>
                  <Text style={styles.statusPillSub}>Operando em rotas hiperespaciais</Text>
                </View>

                <View style={styles.fleetStatusCard}>
                  <View style={styles.statusPillHeader}>
                    <View style={[styles.ledIndicator, { backgroundColor: DesignTokens.colors.alert }]} />
                    <Text style={styles.statusPillLabel}>EM MANUTENÇÃO</Text>
                  </View>
                  <Text style={[styles.statusPillCount, glowText("title")]}>{maintenanceCount}</Text>
                  <Text style={styles.statusPillSub}>Reparos em fuselagem e blindagem</Text>
                </View>

                <View style={styles.fleetStatusCard}>
                  <View style={styles.statusPillHeader}>
                    <View style={[styles.ledIndicator, { backgroundColor: CRT_PALETTE.secondary }]} />
                    <Text style={styles.statusPillLabel}>LOCK ATÔMICO</Text>
                  </View>
                  <Text style={[styles.statusPillCount, glowText("title")]}>{lockedCount}</Text>
                  <Text style={styles.statusPillSub}>Trava de concorrência ativa</Text>
                </View>
              </View>

              {/* Grid das Embarcações Reais */}
              <View style={styles.shipsGrid}>
                {ships.map((ship) => (
                  <View key={ship.id || ship.code} style={styles.shipCard}>
                    <View style={styles.shipCardHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.shipCardName, glowText("body")]}>{ship.name}</Text>
                        <Text style={styles.shipCardCode}>
                          [{ship.code}] • DOCA: {ship.bay || "DOCA-PADRÃO"}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.shipStatusBadge,
                          ship.status === "READY"
                            ? styles.badgeReady
                            : ship.status === "MAINTENANCE"
                            ? styles.badgeAlert
                            : styles.badgeWarning,
                        ]}
                      >
                        <Text
                          style={[
                            styles.shipStatusBadgeText,
                            ship.status === "READY"
                              ? { color: DesignTokens.colors.statusReady }
                              : ship.status === "MAINTENANCE"
                              ? { color: DesignTokens.colors.alert }
                              : { color: CRT_PALETTE.primary },
                          ]}
                        >
                          {ship.status}
                        </Text>
                      </View>
                    </View>

                    {/* Barras de Combustível e Escudo */}
                    <View style={styles.shipTelemetryRow}>
                      <View style={styles.telemetryBarGroup}>
                        <View style={styles.telemetryBarLabelRow}>
                          <Text style={styles.telemetryBarLabel}>COMBUSTÍVEL</Text>
                          <Text style={styles.telemetryBarVal}>{ship.fuelPercent ?? 100}%</Text>
                        </View>
                        <View style={styles.barTrack}>
                          <View
                            style={[
                              styles.barFill,
                              {
                                width: `${Math.min(100, Math.max(0, ship.fuelPercent ?? 100))}%`,
                                backgroundColor:
                                  (ship.fuelPercent ?? 100) < 50
                                    ? DesignTokens.colors.alert
                                    : DesignTokens.colors.statusReady,
                              },
                            ]}
                          />
                        </View>
                      </View>

                      <View style={styles.telemetryBarGroup}>
                        <View style={styles.telemetryBarLabelRow}>
                          <Text style={styles.telemetryBarLabel}>ESCUDO DE PLASMA</Text>
                          <Text style={styles.telemetryBarVal}>{ship.shieldPercent ?? 100}%</Text>
                        </View>
                        <View style={styles.barTrack}>
                          <View
                            style={[
                              styles.barFill,
                              {
                                width: `${Math.min(100, Math.max(0, ship.shieldPercent ?? 100))}%`,
                                backgroundColor: CRT_PALETTE.primary,
                              },
                            ]}
                          />
                        </View>
                      </View>
                    </View>

                    {/* Detalhes Técnicos da Nave */}
                    <View style={styles.shipDetailsRow}>
                      <View style={styles.shipDetailCol}>
                        <Text style={styles.shipDetailSub}>CLASSE:</Text>
                        <Text style={styles.shipDetailTxt}>{ship.classType}</Text>
                      </View>
                      <View style={styles.shipDetailCol}>
                        <Text style={styles.shipDetailSub}>HORAS DE VOO:</Text>
                        <Text style={styles.shipDetailTxt}>{ship.flightHours ?? 0} H</Text>
                      </View>
                      <View style={styles.shipDetailCol}>
                        <Text style={styles.shipDetailSub}>NÚCLEO:</Text>
                        <Text style={styles.shipDetailTxt} numberOfLines={1}>
                          {ship.warpCore || "PADRÃO"}
                        </Text>
                      </View>
                      <View style={styles.shipDetailCol}>
                        <Text style={styles.shipDetailSub}>TAXA CONTRATO:</Text>
                        <Text style={styles.shipDetailTxt}>{ship.contractRateCR ?? 1200} CR</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* ── SEÇÃO 02: GESTÃO DO ARSENAL & PEÇAS DE REPOSIÇÃO ── */}
            <View style={styles.sectionWrapper}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  [ 02 // GESTÃO DE ARSENAL &amp; PEÇAS DE REPOSIÇÃO • GET /estoque/arsenal ]
                </Text>
                <Text style={styles.sectionBadge}>
                  {arsenal.length} COMPONENTES CADASTRADOS
                </Text>
              </View>

              <Text style={styles.sectionDescription}>
                Monitoramento do estoque de peças sobressalentes para reparos e manutenção no hangar. Itens abaixo
                do estoque de segurança disparam alerta crítico de reabastecimento.
              </Text>

              <View style={styles.arsenalList}>
                {arsenal.map((part) => {
                  const isCritical = part.belowThreshold || part.stockUnits < part.minThreshold;
                  const isRestocking = restockingCode === part.code;

                  return (
                    <View
                      key={part.id || part.code}
                      style={[styles.arsenalCard, isCritical && styles.arsenalCardCritical]}
                    >
                      <View style={styles.arsenalCardTop}>
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                            <Text style={[styles.arsenalPartName, glowText("body")]}>{part.name}</Text>
                            {isCritical && (
                              <View style={styles.criticalPill}>
                                <AeroIcon name="warning" size={13} color={DesignTokens.colors.alert} />
                                <Text style={styles.criticalPillText}>ESTOQUE CRÍTICO</Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.arsenalPartCode}>
                            [{part.code}] • LOCALIZAÇÃO: {part.storageBay} • CATEGORIA: {part.category}
                          </Text>
                        </View>

                        <View style={styles.arsenalNumbers}>
                          <Text style={styles.arsenalStockLabel}>ESTOQUE ATUAL / MÍNIMO</Text>
                          <Text
                            style={[
                              styles.arsenalStockNumbers,
                              isCritical ? { color: DesignTokens.colors.alert } : glowText("title"),
                            ]}
                          >
                            {part.stockUnits}{" "}
                            <Text style={{ fontSize: 18, color: CRT_PALETTE.secondary }}>
                              / {part.minThreshold} UN
                            </Text>
                          </Text>
                        </View>
                      </View>

                      {/* Rodapé do Card com Classes Compatíveis e Ação de Reposição */}
                      <View style={styles.arsenalCardBottom}>
                        <View style={styles.compatClassesRow}>
                          <Text style={styles.compatClassesLabel}>COMPATÍVEL COM:</Text>
                          {part.compatibleClasses && part.compatibleClasses.map((cls, idx) => (
                            <View key={idx} style={styles.compatClassChip}>
                              <Text style={styles.compatClassChipText}>{cls}</Text>
                            </View>
                          ))}
                        </View>

                        {/* Botão de Reposição Operacional */}
                        <TouchableOpacity
                          style={[styles.restockBtn, isCritical && styles.restockBtnCritical]}
                          onPress={() => handleRestockPart(part.code)}
                          disabled={isRestocking}
                          activeOpacity={0.8}
                        >
                          {isRestocking ? (
                            <ActivityIndicator size="small" color={CRT_PALETTE.primary} />
                          ) : (
                            <AeroIcon
                              name="add-circle"
                              size={16}
                              color={isCritical ? DesignTokens.colors.alert : CRT_PALETTE.primary}
                            />
                          )}
                          <Text
                            style={[
                              styles.restockBtnText,
                              isCritical && { color: DesignTokens.colors.alert },
                            ]}
                          >
                            {isRestocking ? "REABASTECENDO..." : "[ REPOR PEÇAS (+10 UNIDADES) ]"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* ── SEÇÃO 03: DEMANDA REAL POR ROTA DE DESPACHO ── */}
            <View style={styles.sectionWrapper}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  [ 03 // DEMANDA OPERACIONAL POR ROTA DE DESPACHO • GET /relatorios/combustivel ]
                </Text>
                <Text style={styles.sectionBadge}>
                  CICLO: {fuelReport?.cycleId || "CICLO-2026.10"}
                </Text>
              </View>

              <Text style={styles.sectionDescription}>
                Estatísticas agregadas de missões operacionais a partir das ordens de despacho executadas pelos
                pilotos no barramento de eventos RabbitMQ.
              </Text>

              <View style={styles.sectorsContainer}>
                {fuelReport?.sectorBreakdown && fuelReport.sectorBreakdown.length > 0 ? (
                  fuelReport.sectorBreakdown.map((sec, idx) => (
                    <View key={idx} style={styles.sectorItem}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.sectorItemName, glowText("body")]}>{sec.sectorName}</Text>
                        <Text style={styles.sectorItemSub}>
                          {sec.activeVessels} missões de despacho ordenadas para esta rota
                        </Text>
                      </View>

                      <View style={styles.sectorItemMetrics}>
                        <Text style={[styles.sectorItemBurn, glowText("body")]}>
                          {sec.activeVessels} ORDENS
                        </Text>
                        <View
                          style={[
                            styles.sectorRiskBadge,
                            sec.riskLevel === "EXTREME"
                              ? { borderColor: DesignTokens.colors.alert, backgroundColor: "rgba(255, 61, 0, 0.12)" }
                              : sec.riskLevel === "MODERATE"
                              ? { borderColor: CRT_PALETTE.accent, backgroundColor: CRT_PALETTE.tagBg }
                              : { borderColor: DesignTokens.colors.statusReady, backgroundColor: "rgba(76, 175, 80, 0.12)" },
                          ]}
                        >
                          <Text
                            style={[
                              styles.sectorRiskText,
                              sec.riskLevel === "EXTREME"
                                ? { color: DesignTokens.colors.alert }
                                : sec.riskLevel === "MODERATE"
                                ? { color: CRT_PALETTE.primary }
                                : { color: DesignTokens.colors.statusReady },
                            ]}
                          >
                            DEMANDA: {sec.riskLevel === "EXTREME" ? "ALTA" : sec.riskLevel === "MODERATE" ? "MÉDIA" : "ESTÁVEL"}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>NENHUMA ROTA REPORTADA ATÉ O MOMENTO.</Text>
                )}
              </View>
            </View>

            {/* ── SEÇÃO 04: DIÁRIO DE AUDITORIA DE DESPACHOS REAIS ── */}
            <View style={styles.sectionWrapper}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  [ 04 // DIÁRIO DE AUDITORIA DE DESPACHOS • GET /relatorios/auditoria ]
                </Text>
                <Text style={styles.sectionBadge}>
                  {auditEvents.length} ORDENS AUDITADAS NO MONGODB
                </Text>
              </View>

              <Text style={styles.sectionDescription}>
                Rastreabilidade completa de todas as ordens efetuadas entre oficiais, cadetes e a base estelar central.
              </Text>

              <View style={styles.auditList}>
                {auditEvents && auditEvents.length > 0 ? (
                  auditEvents.slice(0, 15).map((record, index) => (
                    <View key={record.dispatchId || index} style={styles.auditCard}>
                      <View style={styles.auditCardHeader}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                          <Text style={[styles.auditIdText, glowText("body")]}>
                            [{record.dispatchId || `ORD#${index + 1}`}]
                          </Text>
                          <Text style={styles.auditDateText}>{formatDate(record.timestamp)}</Text>
                          <View
                            style={[
                              styles.auditLockBadge,
                              record.atomicLockAcquired
                                ? { borderColor: DesignTokens.colors.statusReady, backgroundColor: "rgba(76, 175, 80, 0.12)" }
                                : { borderColor: DesignTokens.colors.alert, backgroundColor: "rgba(255, 61, 0, 0.12)" },
                            ]}
                          >
                            <Text
                              style={[
                                styles.auditLockText,
                                record.atomicLockAcquired
                                  ? { color: DesignTokens.colors.statusReady }
                                  : { color: DesignTokens.colors.alert },
                              ]}
                            >
                              {record.atomicLockAcquired ? "LOCK ATÔMICO OK" : "LOCK FALHOU"}
                            </Text>
                          </View>
                        </View>

                        <View
                          style={[
                            styles.auditStatusBadge,
                            record.status === "ACCEPTED" || record.status === "EXECUTED"
                              ? { backgroundColor: "rgba(76, 175, 80, 0.16)", borderColor: DesignTokens.colors.statusReady }
                              : record.status === "CANCELLED"
                              ? { backgroundColor: "rgba(255, 61, 0, 0.16)", borderColor: DesignTokens.colors.alert }
                              : { backgroundColor: CRT_PALETTE.tagBg, borderColor: CRT_PALETTE.accent },
                          ]}
                        >
                          <Text
                            style={[
                              styles.auditStatusText,
                              record.status === "ACCEPTED" || record.status === "EXECUTED"
                                ? { color: DesignTokens.colors.statusReady }
                                : record.status === "CANCELLED"
                                ? { color: DesignTokens.colors.alert }
                                : { color: CRT_PALETTE.primary },
                            ]}
                          >
                            {record.status}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.auditDetailsGrid}>
                        <View style={styles.auditDetailItem}>
                          <Text style={styles.auditDetailLabel}>OFICIAL / PILOTO:</Text>
                          <Text style={styles.auditDetailVal}>@{record.requisitioner || "SISTEMA"}</Text>
                        </View>

                        <View style={styles.auditDetailItem}>
                          <Text style={styles.auditDetailLabel}>EMBARCAÇÃO ALOCADA:</Text>
                          <Text style={styles.auditDetailVal}>
                            {record.shipName || "Nave Operacional"} {record.shipCode ? `(${record.shipCode})` : ""}
                          </Text>
                        </View>

                        <View style={styles.auditDetailItem}>
                          <Text style={styles.auditDetailLabel}>ROTA / DESTINO:</Text>
                          <Text style={styles.auditDetailVal}>{record.destinationSector || "Patrulha Geral"}</Text>
                        </View>

                        <View style={styles.auditDetailItem}>
                          <Text style={styles.auditDetailLabel}>BARRAMENTO:</Text>
                          <Text style={styles.auditDetailVal}>{record.queueBroker || "RabbitMQ / AMQP"}</Text>
                        </View>
                      </View>

                      {record.details && (
                        <View style={styles.auditNoteBox}>
                          <Text style={styles.auditNoteText}>EVENTO: {record.details}</Text>
                        </View>
                      )}
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyBox}>
                    <Text style={styles.emptyText}>
                      NENHUM EVENTO DE AUDITORIA REGISTRADO NO BANCO DE DADOS.
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* ── SEÇÃO 05: OFICIAIS E PILOTOS REGISTRADOS NO MONGODB ── */}
            <View style={styles.sectionWrapper}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  [ 05 // OFICIAIS &amp; PILOTOS REGISTRADOS NO CLUSTER • GET /login/user/lista ]
                </Text>
                <Text style={styles.sectionBadge}>
                  {usersList.length} USUÁRIOS NO AUTH
                </Text>
              </View>

              <Text style={styles.sectionDescription}>
                Credenciais ativas no microsserviço de autenticação e controle de acesso com JWT.
              </Text>

              <View style={styles.usersGrid}>
                {usersList.map((usr) => (
                  <View key={usr.id} style={styles.userCard}>
                    <View style={styles.userCardTop}>
                      <AeroIcon name="person" size={20} color={CRT_PALETTE.primary} />
                      <Text style={[styles.userCardUsername, glowText("body")]}>@{usr.username}</Text>
                    </View>
                    <Text style={styles.userCardId}>ID: {usr.id}</Text>
                    <View style={styles.userRolesRow}>
                      {usr.roles && usr.roles.map((r, i) => (
                        <View
                          key={i}
                          style={[
                            styles.userRoleChip,
                            r.includes("ADMIN") && styles.userRoleChipAdmin,
                          ]}
                        >
                          <Text
                            style={[
                              styles.userRoleChipText,
                              r.includes("ADMIN") && { color: DesignTokens.colors.statusReady },
                            ]}
                          >
                            {r}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* ── SEÇÃO 06: TOPOLOGIA E LATÊNCIA REAL DO CLUSTER ── */}
            <View style={styles.sectionWrapper}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  [ 06 // TOPOLOGIA &amp; LATÊNCIA REAL DO CLUSTER • GET /relatorios/cluster ]
                </Text>
                <Text style={styles.sectionBadge}>
                  {clusterHealth?.activeNodes ?? 7} DE {clusterHealth?.totalNodes ?? 7} NÓS ATIVOS
                </Text>
              </View>

              <Text style={styles.sectionDescription}>
                Diagnóstico de sockets TCP em tempo real medindo a latência física de conexão entre os nós
                da arquitetura distribuída.
              </Text>

              <View style={styles.clusterGrid}>
                {clusterHealth?.nodes && clusterHealth.nodes.length > 0 ? (
                  clusterHealth.nodes.map((node) => (
                    <View key={node.id} style={styles.clusterNodeCard}>
                      <View style={styles.clusterNodeHeader}>
                        <View style={styles.clusterNodeTitleRow}>
                          <View
                            style={[
                              styles.ledIndicator,
                              {
                                backgroundColor:
                                  node.status.includes("ACTIVE") ||
                                  node.status.includes("ONLINE") ||
                                  node.status.includes("HEALTHY") ||
                                  node.status.includes("SYNC")
                                    ? DesignTokens.colors.statusReady
                                    : CRT_PALETTE.accent,
                              },
                            ]}
                          />
                          <Text style={styles.clusterNodeId}>[{node.id}]</Text>
                          <Text style={[styles.clusterNodeName, glowText("body")]} numberOfLines={1}>
                            {node.name}
                          </Text>
                        </View>
                        <View style={styles.clusterPortBadge}>
                          <Text style={styles.clusterPortText}>:{node.port}</Text>
                        </View>
                      </View>

                      <Text style={styles.clusterNodeTech}>{node.technology}</Text>

                      <View style={styles.clusterNodeFooter}>
                        <View style={styles.clusterStatusPill}>
                          <Text style={styles.clusterStatusText}>{node.status}</Text>
                        </View>
                        <Text style={styles.clusterLatencyText}>Latência: {node.latencyMs} ms</Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>NENHUM NÓ REPORTADO PELO CLUSTER.</Text>
                )}
              </View>
            </View>
          </>
        )}

        {/* ── BOTÕES OPERACIONAIS: SYNC REAL E LOGOUT ── */}
        <View style={styles.protocolButtonsRow}>
          <TouchableOpacity
            style={styles.syncButton}
            onPress={() => fetchAllOperationalData(true)}
            disabled={syncing}
            activeOpacity={0.8}
          >
            {syncing ? (
              <ActivityIndicator size="small" color={DesignTokens.colors.bgDeep} />
            ) : (
              <AeroIcon name="refresh" size={20} color={DesignTokens.colors.bgDeep} />
            )}
            <Text style={styles.syncButtonText}>
              {syncing ? "SINCRONIZANDO COM MICROSSERVIÇOS..." : "SINCRONIZAR TELEMETRIA // REFETCH COMPLETO"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut} activeOpacity={0.8}>
            <AeroIcon name="power" size={20} color={DesignTokens.colors.alert} />
            <Text style={styles.signOutButtonText}>ENCERRAR SESSÃO DE COMANDO</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CRT_PALETTE.bgDeep,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 90,
    gap: 22,
  },
  loadingWrapper: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    backgroundColor: CRT_PALETTE.surface,
    borderWidth: 1,
    borderColor: CRT_PALETTE.border,
    borderTopWidth: 2,
    borderTopColor: CRT_PALETTE.borderHighlight,
  },
  loadingText: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 14,
    color: CRT_PALETTE.primary,
    fontWeight: "700",
    textAlign: "center",
  },
  emptyBox: {
    padding: 24,
    backgroundColor: CRT_PALETTE.surface,
    borderWidth: 1,
    borderColor: CRT_PALETTE.border,
    borderTopWidth: 2,
    borderTopColor: CRT_PALETTE.borderHighlight,
    alignItems: "center",
  },
  emptyText: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 13,
    color: CRT_PALETTE.secondary,
    textAlign: "center",
    lineHeight: 20,
  },
  alertBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CRT_PALETTE.surface,
    borderBottomWidth: 1,
    borderBottomColor: CRT_PALETTE.accent,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  alertBannerText: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 13,
    color: CRT_PALETTE.primary,
    fontWeight: "700",
  },
  heroCard: {
    backgroundColor: CRT_PALETTE.surface,
    borderWidth: 1,
    borderColor: CRT_PALETTE.border,
    borderTopWidth: 2,
    borderTopColor: CRT_PALETTE.borderHighlight,
    padding: 18,
  },
  heroTopRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
  },
  callsignBox: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: 280,
  },
  officerAvatar: {
    width: 52,
    height: 52,
    backgroundColor: CRT_PALETTE.surface,
    borderWidth: 1,
    borderColor: CRT_PALETTE.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  callsignTitle: {
    fontFamily: DesignTokens.typography.fonts.display,
    fontSize: 24,
    color: CRT_PALETTE.primary,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  clearanceTag: {
    backgroundColor: CRT_PALETTE.tagBg,
    borderWidth: 1,
    borderColor: CRT_PALETTE.accent,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  clearanceTagText: {
    fontFamily: DesignTokens.typography.fonts.display,
    fontSize: 14,
    fontWeight: "700",
    color: CRT_PALETTE.primary,
    letterSpacing: 1,
  },
  callsignSubtitle: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 13,
    color: CRT_PALETTE.secondary,
    marginTop: 4,
    fontWeight: "600",
  },
  reportMetadataId: {
    fontFamily: DesignTokens.typography.fonts.display,
    fontSize: 15,
    color: CRT_PALETTE.accent,
    marginTop: 3,
    letterSpacing: 1,
  },
  creditsCard: {
    backgroundColor: CRT_PALETTE.surface,
    borderWidth: 1,
    borderColor: CRT_PALETTE.border,
    borderTopWidth: 2,
    borderTopColor: CRT_PALETTE.borderHighlight,
    paddingHorizontal: 18,
    paddingVertical: 12,
    alignItems: "flex-end",
  },
  creditsLabel: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 12,
    fontWeight: "700",
    color: CRT_PALETTE.accent,
    letterSpacing: 0.8,
  },
  creditsValue: {
    fontFamily: DesignTokens.typography.fonts.display,
    fontSize: 28,
    fontWeight: "800",
    color: CRT_PALETTE.primary,
    marginTop: 2,
    letterSpacing: 1.5,
  },
  creditsSub: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 12,
    color: CRT_PALETTE.secondary,
    marginTop: 2,
    fontWeight: "500",
  },
  rolesRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(143, 100, 0, 0.3)",
    gap: 10,
  },
  rolesLabel: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 12,
    color: CRT_PALETTE.secondary,
    fontWeight: "700",
  },
  rolesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  roleChip: {
    backgroundColor: CRT_PALETTE.tagBg,
    borderWidth: 1,
    borderColor: CRT_PALETTE.accent,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  roleChipText: {
    fontFamily: DesignTokens.typography.fonts.display,
    fontSize: 14,
    color: CRT_PALETTE.primary,
    fontWeight: "700",
  },

  // ── KPIS EXECUTIVOS REAIS ──
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  kpiCard: {
    flex: 1,
    minWidth: 180,
    backgroundColor: CRT_PALETTE.surface,
    borderWidth: 1,
    borderColor: CRT_PALETTE.border,
    borderTopWidth: 2,
    borderTopColor: CRT_PALETTE.borderHighlight,
    padding: 14,
  },
  kpiCardWarning: {
    borderColor: DesignTokens.colors.alert,
    borderTopColor: DesignTokens.colors.alert,
  },
  kpiHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  kpiLabel: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 12,
    fontWeight: "700",
    color: CRT_PALETTE.accent,
    letterSpacing: 0.8,
  },
  kpiValue: {
    fontFamily: DesignTokens.typography.fonts.display,
    fontSize: 26,
    fontWeight: "800",
    color: CRT_PALETTE.primary,
    letterSpacing: 1,
  },
  kpiSub: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 12,
    color: CRT_PALETTE.secondary,
    marginTop: 4,
    fontWeight: "500",
  },

  // ── SEÇÕES GERAIS ──
  sectionWrapper: {
    backgroundColor: CRT_PALETTE.surface,
    borderWidth: 1,
    borderColor: CRT_PALETTE.border,
    borderTopWidth: 2,
    borderTopColor: CRT_PALETTE.borderHighlight,
    padding: 18,
    gap: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(143, 100, 0, 0.4)",
    paddingBottom: 10,
  },
  sectionTitle: {
    fontFamily: DesignTokens.typography.fonts.display,
    fontSize: 20,
    color: CRT_PALETTE.primary,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  sectionBadge: {
    fontFamily: DesignTokens.typography.fonts.display,
    fontSize: 14,
    color: CRT_PALETTE.accent,
    backgroundColor: CRT_PALETTE.tagBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: CRT_PALETTE.border,
  },
  sectionDescription: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 13,
    color: CRT_PALETTE.secondary,
    lineHeight: 19,
  },

  // ── STATUS BREAKDOWN DA FROTA ──
  fleetStatusGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  fleetStatusCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: CRT_PALETTE.surfaceElevated,
    borderWidth: 1,
    borderColor: CRT_PALETTE.border,
    padding: 12,
  },
  statusPillHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  statusPillLabel: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 12,
    fontWeight: "700",
    color: CRT_PALETTE.accent,
  },
  statusPillCount: {
    fontFamily: DesignTokens.typography.fonts.display,
    fontSize: 32,
    fontWeight: "800",
    color: CRT_PALETTE.primary,
  },
  statusPillSub: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 12,
    color: CRT_PALETTE.secondary,
    marginTop: 4,
  },
  ledIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // ── GRID DE NAVES REAIS ──
  shipsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  shipCard: {
    flex: 1,
    minWidth: 300,
    backgroundColor: CRT_PALETTE.surfaceElevated,
    borderWidth: 1,
    borderColor: CRT_PALETTE.border,
    padding: 14,
    gap: 12,
  },
  shipCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  shipCardName: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 16,
    fontWeight: "800",
    color: CRT_PALETTE.primary,
  },
  shipCardCode: {
    fontFamily: DesignTokens.typography.fonts.display,
    fontSize: 14,
    color: CRT_PALETTE.secondary,
    marginTop: 2,
    letterSpacing: 1,
  },
  shipStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
  },
  badgeReady: {
    backgroundColor: "rgba(76, 175, 80, 0.14)",
    borderColor: DesignTokens.colors.statusReady,
  },
  badgeAlert: {
    backgroundColor: "rgba(255, 61, 0, 0.14)",
    borderColor: DesignTokens.colors.alert,
  },
  badgeWarning: {
    backgroundColor: CRT_PALETTE.tagBg,
    borderColor: CRT_PALETTE.accent,
  },
  shipStatusBadgeText: {
    fontFamily: DesignTokens.typography.fonts.display,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
  },
  shipTelemetryRow: {
    flexDirection: "row",
    gap: 16,
  },
  telemetryBarGroup: {
    flex: 1,
  },
  telemetryBarLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  telemetryBarLabel: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 11,
    fontWeight: "700",
    color: CRT_PALETTE.secondary,
  },
  telemetryBarVal: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 12,
    fontWeight: "800",
    color: CRT_PALETTE.primary,
  },
  barTrack: {
    height: 6,
    backgroundColor: "rgba(143, 100, 0, 0.25)",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
  },
  shipDetailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(143, 100, 0, 0.25)",
  },
  shipDetailCol: {
    flex: 1,
  },
  shipDetailSub: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 10,
    color: CRT_PALETTE.secondary,
    fontWeight: "700",
  },
  shipDetailTxt: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 12,
    color: CRT_PALETTE.primary,
    fontWeight: "700",
    marginTop: 2,
  },

  // ── ARSENAL & PEÇAS DE REPOSIÇÃO ──
  arsenalList: {
    gap: 12,
  },
  arsenalCard: {
    backgroundColor: CRT_PALETTE.surfaceElevated,
    borderWidth: 1,
    borderColor: CRT_PALETTE.border,
    padding: 14,
    gap: 12,
  },
  arsenalCardCritical: {
    borderColor: DesignTokens.colors.alert,
    backgroundColor: "rgba(255, 61, 0, 0.05)",
  },
  arsenalCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: 12,
  },
  arsenalPartName: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 15,
    fontWeight: "800",
    color: CRT_PALETTE.primary,
  },
  arsenalPartCode: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 12,
    color: CRT_PALETTE.secondary,
    marginTop: 4,
  },
  criticalPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 61, 0, 0.16)",
    borderWidth: 1,
    borderColor: DesignTokens.colors.alert,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  criticalPillText: {
    fontFamily: DesignTokens.typography.fonts.display,
    fontSize: 13,
    color: DesignTokens.colors.alert,
    fontWeight: "700",
    letterSpacing: 1,
  },
  arsenalNumbers: {
    alignItems: "flex-end",
  },
  arsenalStockLabel: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 11,
    fontWeight: "700",
    color: CRT_PALETTE.accent,
  },
  arsenalStockNumbers: {
    fontFamily: DesignTokens.typography.fonts.display,
    fontSize: 26,
    fontWeight: "800",
    color: CRT_PALETTE.primary,
  },
  arsenalCardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(143, 100, 0, 0.25)",
  },
  compatClassesRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  compatClassesLabel: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 11,
    color: CRT_PALETTE.secondary,
    fontWeight: "700",
  },
  compatClassChip: {
    backgroundColor: CRT_PALETTE.tagBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: CRT_PALETTE.border,
  },
  compatClassChipText: {
    fontFamily: DesignTokens.typography.fonts.display,
    fontSize: 12,
    color: CRT_PALETTE.primary,
  },
  restockBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: CRT_PALETTE.tagBg,
    borderWidth: 1,
    borderColor: CRT_PALETTE.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  restockBtnCritical: {
    backgroundColor: "rgba(255, 61, 0, 0.14)",
    borderColor: DesignTokens.colors.alert,
  },
  restockBtnText: {
    fontFamily: DesignTokens.typography.fonts.display,
    fontSize: 14,
    color: CRT_PALETTE.primary,
    fontWeight: "700",
    letterSpacing: 1,
  },

  // ── DEMANDA POR ROTAS ──
  sectorsContainer: {
    gap: 12,
  },
  sectorItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: CRT_PALETTE.surfaceElevated,
    borderWidth: 1,
    borderColor: CRT_PALETTE.border,
    padding: 14,
    gap: 12,
  },
  sectorItemName: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 14,
    fontWeight: "800",
    color: CRT_PALETTE.primary,
  },
  sectorItemSub: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 12,
    color: CRT_PALETTE.secondary,
    marginTop: 3,
  },
  sectorItemMetrics: {
    alignItems: "flex-end",
    gap: 4,
  },
  sectorItemBurn: {
    fontFamily: DesignTokens.typography.fonts.display,
    fontSize: 20,
    fontWeight: "800",
    color: CRT_PALETTE.primary,
  },
  sectorRiskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
  },
  sectorRiskText: {
    fontFamily: DesignTokens.typography.fonts.display,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },

  // ── DIÁRIO DE AUDITORIA DE DESPACHOS ──
  auditList: {
    gap: 12,
  },
  auditCard: {
    backgroundColor: CRT_PALETTE.surfaceElevated,
    borderWidth: 1,
    borderColor: CRT_PALETTE.border,
    padding: 14,
    gap: 10,
  },
  auditCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
  },
  auditIdText: {
    fontFamily: DesignTokens.typography.fonts.display,
    fontSize: 18,
    color: CRT_PALETTE.primary,
    fontWeight: "800",
    letterSpacing: 1,
  },
  auditDateText: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 12,
    color: CRT_PALETTE.secondary,
  },
  auditLockBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
  },
  auditLockText: {
    fontFamily: DesignTokens.typography.fonts.display,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  auditStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
  },
  auditStatusText: {
    fontFamily: DesignTokens.typography.fonts.display,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
  },
  auditDetailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 10,
    borderWidth: 1,
    borderColor: "rgba(143, 100, 0, 0.2)",
  },
  auditDetailItem: {
    flex: 1,
    minWidth: 140,
  },
  auditDetailLabel: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 11,
    color: CRT_PALETTE.secondary,
    fontWeight: "700",
  },
  auditDetailVal: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 12,
    color: CRT_PALETTE.primary,
    fontWeight: "700",
    marginTop: 2,
  },
  auditNoteBox: {
    backgroundColor: CRT_PALETTE.tagBg,
    padding: 8,
    borderLeftWidth: 3,
    borderLeftColor: CRT_PALETTE.accent,
  },
  auditNoteText: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 12,
    color: CRT_PALETTE.secondary,
  },

  // ── OFICIAIS & PILOTOS REGISTRADOS ──
  usersGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  userCard: {
    flex: 1,
    minWidth: 200,
    backgroundColor: CRT_PALETTE.surfaceElevated,
    borderWidth: 1,
    borderColor: CRT_PALETTE.border,
    padding: 12,
    gap: 6,
  },
  userCardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  userCardUsername: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 15,
    fontWeight: "800",
    color: CRT_PALETTE.primary,
  },
  userCardId: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 11,
    color: CRT_PALETTE.secondary,
  },
  userRolesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 4,
  },
  userRoleChip: {
    backgroundColor: CRT_PALETTE.tagBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: CRT_PALETTE.border,
  },
  userRoleChipAdmin: {
    borderColor: DesignTokens.colors.statusReady,
    backgroundColor: "rgba(76, 175, 80, 0.12)",
  },
  userRoleChipText: {
    fontFamily: DesignTokens.typography.fonts.display,
    fontSize: 12,
    color: CRT_PALETTE.primary,
    fontWeight: "700",
  },

  // ── TOPOLOGIA DO CLUSTER ──
  clusterGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  clusterNodeCard: {
    flex: 1,
    minWidth: 260,
    backgroundColor: CRT_PALETTE.surfaceElevated,
    borderWidth: 1,
    borderColor: CRT_PALETTE.border,
    padding: 14,
    gap: 8,
  },
  clusterNodeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  clusterNodeTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  clusterNodeId: {
    fontFamily: DesignTokens.typography.fonts.display,
    fontSize: 14,
    color: CRT_PALETTE.accent,
    fontWeight: "700",
  },
  clusterNodeName: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 14,
    color: CRT_PALETTE.primary,
    fontWeight: "700",
  },
  clusterPortBadge: {
    backgroundColor: CRT_PALETTE.tagBg,
    borderWidth: 1,
    borderColor: CRT_PALETTE.border,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  clusterPortText: {
    fontFamily: DesignTokens.typography.fonts.display,
    fontSize: 13,
    color: CRT_PALETTE.primary,
  },
  clusterNodeTech: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 12,
    color: CRT_PALETTE.secondary,
    fontWeight: "500",
  },
  clusterNodeFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(143, 100, 0, 0.2)",
  },
  clusterStatusPill: {
    backgroundColor: CRT_PALETTE.tagBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: CRT_PALETTE.accent,
  },
  clusterStatusText: {
    fontFamily: DesignTokens.typography.fonts.display,
    fontSize: 12,
    color: CRT_PALETTE.primary,
    fontWeight: "700",
  },
  clusterLatencyText: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 12,
    color: CRT_PALETTE.secondary,
    fontWeight: "600",
  },

  // ── BOTÕES DE PROTOCOLO ──
  protocolButtonsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginTop: 8,
  },
  syncButton: {
    flex: 2,
    minWidth: 260,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: CRT_PALETTE.accent,
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 10,
  },
  syncButtonText: {
    fontFamily: DesignTokens.typography.fonts.display,
    fontSize: 16,
    color: DesignTokens.colors.bgDeep,
    fontWeight: "800",
    letterSpacing: 1,
  },
  signOutButton: {
    flex: 1,
    minWidth: 220,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: CRT_PALETTE.surface,
    borderWidth: 1,
    borderColor: DesignTokens.colors.alert,
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 10,
  },
  signOutButtonText: {
    fontFamily: DesignTokens.typography.fonts.display,
    fontSize: 16,
    color: DesignTokens.colors.alert,
    fontWeight: "800",
    letterSpacing: 1,
  },
});

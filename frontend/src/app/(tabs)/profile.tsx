import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { DesignTokens, glowText } from "@/constants/Tokens";
import { Header } from "@/components/header";
import { useAuth } from "@/context/AuthContext";
import { AeroIcon } from "@/components/AeroIcon";
import { dockService, dispatchService, relatorioService, estoqueService } from "@/services/api";
import { ORBITAL_SECTORS } from "@/services/hangarData";

// Tela de Relatórios e Telemetria: Acesso exclusivo para Administradores (ROLE_ADMIN)
export default function TelemetryProfileScreen() {
  const { user, roles, isAdmin, signOut } = useAuth();
  const { width } = useWindowDimensions();
  const isDesktop = width >= DesignTokens.breakpoints.desktop;

  const [dockCount, setDockCount] = useState(8);
  const [activeMissionsCount, setActiveMissionsCount] = useState(3);
  const [galacticCredits, setGalacticCredits] = useState(64800);
  const [executiveReport, setExecutiveReport] = useState<any>(null);
  const [fuelReport, setFuelReport] = useState<any>(null);
  const [auditEvents, setAuditEvents] = useState<any[]>([]);
  const [clusterHealth, setClusterHealth] = useState<any>(null);
  const [calibrateLoading, setCalibrateLoading] = useState(false);
  const [systemAlert, setSystemAlert] = useState<string | null>(null);

  // Carrega os relatórios do microsserviço de Relatórios (:8085) se o usuário for ADMIN
  useEffect(() => {
    if (!user || !isAdmin) return;

    Promise.all([
      relatorioService.getExecutiveReport().catch(() => null),
      relatorioService.getClusterHealth().catch(() => null),
      relatorioService.getFuelReport().catch(() => null),
      relatorioService.getAuditTrail().catch(() => []),
      estoqueService.getMetricas().catch(() => null),
      dockService.getDock(user).catch(() => ({ id: "", officerUsername: user, assets: [], ships: [] })),
      dispatchService.getMyOrders(user).catch(() => []),
    ]).then(([execReport, cluster, fuel, audit, estoqueMetrics, dockData, dispatches]) => {
      if (execReport) {
        setExecutiveReport(execReport);
        if (execReport.totalRevenueGalacticCredits) {
          setGalacticCredits(execReport.totalRevenueGalacticCredits);
        }
      }
      if (cluster) setClusterHealth(cluster);
      if (fuel) setFuelReport(fuel);
      if (Array.isArray(audit)) setAuditEvents(audit);
      if (estoqueMetrics?.totalShipsInHangar) {
        setDockCount(estoqueMetrics.totalShipsInHangar);
      }
      if (dispatches && dispatches.length > 0) setActiveMissionsCount(dispatches.length);
    });
  }, [user, isAdmin]);

  const handleCalibrateCores = () => {
    setCalibrateLoading(true);
    setTimeout(() => {
      setCalibrateLoading(false);
      setSystemAlert("[OK] REATORES DE PLASMA RECALIBRADOS: FREQUÊNCIA HARMONIZADA A 1.42 GHz.");
      setTimeout(() => setSystemAlert(null), 5000);
    }, 1500);
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace("/(auth)/login");
  };

  // ── SE O USUÁRIO FOR APENAS ROLE_USER: EXIBE TELA DE ACESSO NEGADO / CLEARANCE ──
  if (!isAdmin) {
    return (
      <View style={styles.container}>
        <Header
          stationCode="ORBITAL ALPHA-7"
          activeSector="SETOR DE AUDITORIA // ACESSO RESTRITO"
          badgeText={`OFICIAL: @${user?.toUpperCase() || "USER"}`}
        />

        <ScrollView style={styles.scrollArea} contentContainerStyle={styles.deniedScrollContent}>
          <View style={styles.accessDeniedCard}>
            <View style={styles.accessDeniedTopBar}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <AeroIcon name="warning" size={16} color={DesignTokens.colors.alert} />
                <Text style={styles.accessDeniedTopTitle}>
                  [ ! ] PROTOCOLO DE DEFESA // CLEARANCE DEFCON 1
                </Text>
              </View>
              <Text style={styles.accessDeniedStatusTag}>ACESSO RESTRITO</Text>
            </View>

            <View style={styles.accessDeniedBody}>
              <View style={styles.accessDeniedBadge}>
                <Text style={styles.accessDeniedBadgeText}>
                  PERFIL AUTENTICADO: [ {roles.join(" // ") || "ROLE_USER"} ]
                </Text>
              </View>

              <Text style={[styles.accessDeniedHeading, glowText("title")]}>
                TERMINAL DE RELATÓRIOS &amp; AUDITORIA BLOQUEADO
              </Text>

              <Text style={styles.accessDeniedParagraph}>
                O terminal consolidado de Relatórios Executivos, Auditoria Financeira,
                Consumo de Dobra e Telemetria do Cluster é de visualização confidencial.
              </Text>

              <Text style={styles.accessDeniedParagraph}>
                Regra de Segurança do Sistema: Apenas oficiais com patente de
                <Text style={{ color: DesignTokens.colors.amber, fontWeight: "bold" }}>
                  {" "}COMANDANTE GERAL (ROLE_ADMIN){" "}
                </Text>
                possuem clearance autorizado para acessar e consultar os dados deste microsserviço.
              </Text>

              <View style={styles.securityBox}>
                <Text style={styles.securityBoxTitle}>DIRETRIZES ATIVAS DE CONTROLE:</Text>
                <Text style={styles.securityBoxLine}>
                  • Gateway Security: .pathMatchers("/relatorios/**").hasAuthority("ROLE_ADMIN")
                </Text>
                <Text style={styles.securityBoxLine}>
                  • Microsserviço Relatório: Porta :8085 [STATUS: FECHADO PARA ROLE_USER]
                </Text>
                <Text style={styles.securityBoxLine}>
                  • Gestão de Frota: Adicionar/Remover naves exclusivo para ROLE_ADMIN
                </Text>
              </View>

              <TouchableOpacity style={styles.switchAdminBtn} onPress={handleSignOut} activeOpacity={0.85}>
                <AeroIcon name="key" size={16} color={DesignTokens.colors.bgDeep} />
                <Text style={styles.switchAdminBtnText}>
                  [ ENTRAR COMO ADMINISTRADOR // ROLE_ADMIN ]
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ── SE O USUÁRIO FOR ADMIN: EXIBE O DASHBOARD COMPLETO DE RELATÓRIOS & TELEMETRIA ──
  return (
    <View style={styles.container}>
      <Header
        stationCode="ORBITAL ALPHA-7"
        activeSector="RELATÓRIOS & AUDITORIA // ADMIN CLEARANCE"
        badgeText={`COMANDANTE: @${user?.toUpperCase() || "ADMIN"}`}
      />

      {/* ALERT NOTIFIER */}
      {systemAlert && (
        <View style={styles.alertBanner}>
          <AeroIcon name="hardware-chip" size={16} color={DesignTokens.colors.amber} />
          <Text style={styles.alertBannerText}>{systemAlert}</Text>
        </View>
      )}

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        {/* HERO COMMANDER CLEARANCE CARD */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.callsignBox}>
              <View style={styles.officerAvatar}>
                <AeroIcon name="person-circle" size={38} color={DesignTokens.colors.amber} />
              </View>
              <View style={{ marginLeft: 12 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text style={styles.callsignTitle}>COMANDANTE: @{user?.toUpperCase() || "ADMIN"}</Text>
                  <View style={styles.clearanceTag}>
                    <Text style={styles.clearanceTagText}>CLEARANCE NÍVEL 5 // ADMIN</Text>
                  </View>
                </View>
                <Text style={styles.callsignSubtitle}>
                  Base Estelar Hangar-07 // Central de Comando & Auditoria Executiva
                </Text>
              </View>
            </View>

            {/* CREDITS BALANCE */}
            <View style={styles.creditsCard}>
              <Text style={styles.creditsLabel}>RECEITA TOTAL CONSOLIDADA</Text>
              <Text style={styles.creditsValue}>{galacticCredits.toLocaleString()} CR</Text>
              <Text style={styles.creditsSub}>Créditos Galácticos Autorizados</Text>
            </View>
          </View>

          {/* ROLES & PERMISSIONS ROW */}
          <View style={styles.rolesRow}>
            <Text style={styles.rolesLabel}>PERMISSÕES NO SISTEMA:</Text>
            <View style={styles.rolesList}>
              {roles && roles.length > 0 ? (
                roles.map((r, i) => (
                  <View key={i} style={styles.roleChip}>
                    <Text style={styles.roleChipText}>[ {r} ]</Text>
                  </View>
                ))
              ) : (
                <View style={styles.roleChip}>
                  <Text style={styles.roleChipText}>[ ROLE_ADMIN ]</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* ── PAINEL DE RELATÓRIOS EXECUTIVOS (MICROSSERVIÇO :8085) ── */}
        <View style={styles.sectionWrapper}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>[ RELATÓRIO EXECUTIVO GERAL // MICROSSERVIÇO :8085 ]</Text>
            <Text style={styles.sectionBadge}>EXCLUSIVO ADMIN</Text>
          </View>

          <View style={styles.reportMetricsGrid}>
            <View style={styles.reportMetricCard}>
              <Text style={styles.reportMetricLabel}>DESPACHOS CONCLUÍDOS</Text>
              <Text style={styles.reportMetricVal}>
                {executiveReport?.totalDispatches || activeMissionsCount}
              </Text>
              <Text style={styles.reportMetricSub}>Missões processadas</Text>
            </View>

            <View style={styles.reportMetricCard}>
              <Text style={styles.reportMetricLabel}>DURAÇÃO MÉDIA DE VOO</Text>
              <Text style={styles.reportMetricVal}>
                {executiveReport?.averageMissionDurationMinutes || 42} MIN
              </Text>
              <Text style={styles.reportMetricSub}>Tempo de rota orbital</Text>
            </View>

            <View style={styles.reportMetricCard}>
              <Text style={styles.reportMetricLabel}>CLASSE MAIS UTILIZADA</Text>
              <Text style={styles.reportMetricVal}>
                {executiveReport?.mostDispatchedShipClass || "INTERCEPTOR"}
              </Text>
              <Text style={styles.reportMetricSub}>Maior frequência de voo</Text>
            </View>

            <View style={styles.reportMetricCard}>
              <Text style={styles.reportMetricLabel}>PRONTIDÃO DA FROTA</Text>
              <Text style={styles.reportMetricVal}>
                {executiveReport?.fleetReadinessRate || "94.8%"}
              </Text>
              <Text style={styles.reportMetricSub}>Naves prontas em doca</Text>
            </View>
          </View>
        </View>

        {/* ── SUBSISTEMAS DA ESTAÇÃO ── */}
        <View style={styles.sectionWrapper}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>[ SUBSISTEMAS DA ESTAÇÃO // REDE INTEGRADA ]</Text>
            <Text style={styles.sectionBadge}>6 DE 6 SUBSISTEMAS ATIVOS</Text>
          </View>

          <View style={styles.microservicesGrid}>
            <View style={styles.nodeCard}>
              <View style={styles.nodeHeader}>
                <View style={styles.nodeLedActive} />
                <Text style={styles.nodeLedText}>[ONLINE]</Text>
                <Text style={styles.nodeName}>01 // COMUNICAÇÕES</Text>
              </View>
              <Text style={styles.nodeTech}>Canal de Roteamento Primário</Text>
              <Text style={styles.nodeStatus}>STATUS: ROTEAMENTO ATIVO</Text>
              <Text style={styles.nodeMetric}>Latência Média: 1.4ms</Text>
            </View>

            <View style={styles.nodeCard}>
              <View style={styles.nodeHeader}>
                <View style={styles.nodeLedActive} />
                <Text style={styles.nodeLedText}>[ONLINE]</Text>
                <Text style={styles.nodeName}>02 // CONTROLE DE ACESSO</Text>
              </View>
              <Text style={styles.nodeTech}>Segurança & Credenciais JWT</Text>
              <Text style={styles.nodeStatus}>STATUS: AUTENTICAÇÃO ATIVA</Text>
              <Text style={styles.nodeMetric}>Roles: USER & ADMIN</Text>
            </View>

            <View style={styles.nodeCard}>
              <View style={styles.nodeHeader}>
                <View style={styles.nodeLedActive} />
                <Text style={styles.nodeLedText}>[ONLINE]</Text>
                <Text style={styles.nodeName}>03 // CENTRAL DE DESPACHO</Text>
              </View>
              <Text style={styles.nodeTech}>Orquestração de Frota & Missões</Text>
              <Text style={styles.nodeStatus}>STATUS: LOCK ATÔMICO ATIVO</Text>
              <Text style={styles.nodeMetric}>Contratos Ativos: {activeMissionsCount}</Text>
            </View>

            <View style={styles.nodeCard}>
              <View style={styles.nodeHeader}>
                <View style={styles.nodeLedActive} />
                <Text style={styles.nodeLedText}>[ONLINE]</Text>
                <Text style={styles.nodeName}>04 // BAIAS DO HANGAR</Text>
              </View>
              <Text style={styles.nodeTech}>Inventário & Docas de Pouso</Text>
              <Text style={styles.nodeStatus}>STATUS: MONITORAÇÃO ATIVA</Text>
              <Text style={styles.nodeMetric}>Naves no Hangar: {dockCount}</Text>
            </View>

            <View style={styles.nodeCard}>
              <View style={styles.nodeHeader}>
                <View style={[styles.nodeLedActive, { backgroundColor: DesignTokens.colors.accentAmber }]} />
                <Text style={[styles.nodeLedText, { color: DesignTokens.colors.accentAmber }]}>[BUFFER]</Text>
                <Text style={[styles.nodeName, { color: DesignTokens.colors.accentAmber }]}>
                  05 // BARRAMENTO DE TELEMETRIA
                </Text>
              </View>
              <Text style={styles.nodeTech}>Transmissão RabbitMQ AMQP</Text>
              <Text style={styles.nodeStatus}>STATUS: CANAL SINCRONIZADO</Text>
              <Text style={styles.nodeMetric}>Taxa de Transmissão: 48 pacotes/s</Text>
            </View>

            <View style={styles.nodeCard}>
              <View style={styles.nodeHeader}>
                <View style={styles.nodeLedActive} />
                <Text style={styles.nodeLedText}>[ONLINE]</Text>
                <Text style={styles.nodeName}>06 // DIÁRIO DE AUDITORIA</Text>
              </View>
              <Text style={styles.nodeTech}>Histórico de Voo & Telemetria</Text>
              <Text style={styles.nodeStatus}>STATUS: REGISTRANDO FLUXO</Text>
              <Text style={styles.nodeMetric}>Integridade: 99.98%</Text>
            </View>
          </View>
        </View>

        {/* ── OSCILOSCÓPIO DO REATOR E ROTAS HIPERESPACIAIS ── */}
        <View style={styles.telemetrySplitRow}>
          <View style={styles.oscilloscopePanel}>
            <View style={styles.panelHeaderRow}>
              <Text style={styles.panelTitle}>[ OSCILOSCÓPIO DO REATOR PRINCIPAL ]</Text>
              <Text style={styles.panelLiveDot}>● 98.4% STABLE</Text>
            </View>

            <View style={styles.waveDisplay}>
              <Text style={styles.waveLine}>{"▲  .  .  /\\  .  .  /\\  .  .  /\\  .  .  ▲"}</Text>
              <Text style={styles.waveLine}>{"│  . /\\/  \\  . /\\/  \\  . /\\/  \\  . │"}</Text>
              <Text style={styles.waveLine}>{"├───/──────\\──/──────\\──/──────\\───┤"}</Text>
              <Text style={styles.waveLine}>{"│  /        \\/        \\/        \\  │"}</Text>
              <Text style={styles.waveLine}>{"▼ ─          ─          ─          ▼"}</Text>
              <View style={styles.waveOverlayGrid} />
            </View>

            <View style={styles.metricsTriple}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>OUTPUT TÉRMICO</Text>
                <Text style={styles.metricVal}>4.21 GW</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>FLUXO DE PLASMA</Text>
                <Text style={styles.metricVal}>98.2 kg/s</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>DILATAÇÃO TEMPO</Text>
                <Text style={styles.metricVal}>0.0004 ns</Text>
              </View>
            </View>
          </View>

          <View style={styles.hyperlanesPanel}>
            <View style={styles.panelHeaderRow}>
              <Text style={styles.panelTitle}>[ ROTAS HIPERESPACIAIS CONECTADAS ]</Text>
              <Text style={styles.panelLiveDot}>4 VETORES</Text>
            </View>

            <View style={styles.sectorsList}>
              {ORBITAL_SECTORS.map((s: any) => (
                <View key={s.id} style={styles.sectorRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sectorName}>{s.name}</Text>
                    <Text style={styles.sectorCoordinates}>{s.coordinates}</Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text
                      style={[
                        styles.sectorRisk,
                        s.riskLevel === "EXTREME"
                          ? { color: DesignTokens.colors.alert }
                          : s.riskLevel === "MODERATE"
                          ? { color: DesignTokens.colors.amber }
                          : { color: DesignTokens.colors.amberMid },
                      ]}
                    >
                      {s.riskLevel}
                    </Text>
                    <Text style={styles.sectorVessels}>{s.activeVessels} naves ativas</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ── BOTÕES DE COMANDO E LOGOUT ── */}
        <View style={styles.protocolButtonsRow}>
          <TouchableOpacity
            style={styles.calibrateButton}
            onPress={handleCalibrateCores}
            disabled={calibrateLoading}
          >
            {calibrateLoading ? (
              <ActivityIndicator size="small" color={DesignTokens.colors.bgDeep} />
            ) : (
              <AeroIcon name="pulse" size={16} color={DesignTokens.colors.bgDeep} />
            )}
            <Text style={styles.calibrateButtonText}>
              {calibrateLoading ? "CALIBRANDO..." : "CALIBRAR REATORES DE FUSÃO"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <AeroIcon name="power" size={16} color={DesignTokens.colors.alert} />
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
    backgroundColor: DesignTokens.colors.bgDeep,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 90,
    gap: 20,
  },
  deniedScrollContent: {
    padding: 20,
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  accessDeniedCard: {
    width: "100%",
    maxWidth: 580,
    borderWidth: 1,
    borderColor: DesignTokens.colors.alert,
    backgroundColor: "transparent",
  },
  accessDeniedTopBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.alert,
    borderStyle: "dashed",
    overflow: "hidden",
  },
  accessDeniedTopTitle: {
    fontFamily: DesignTokens.typography.fonts.terminal,
    fontSize: 13,
    color: DesignTokens.colors.alert,
    letterSpacing: 0.5,
  },
  accessDeniedStatusTag: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 10,
    color: DesignTokens.colors.alert,
    borderWidth: 1,
    borderColor: DesignTokens.colors.alert,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  accessDeniedBody: {
    padding: 24,
    gap: 14,
  },
  accessDeniedBadge: {
    borderWidth: 1,
    borderColor: DesignTokens.colors.amberDim,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  accessDeniedBadgeText: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 11,
    color: DesignTokens.colors.textSecondary,
  },
  accessDeniedHeading: {
    fontFamily: DesignTokens.typography.fonts.terminal,
    fontSize: 16,
    color: DesignTokens.colors.alert,
    letterSpacing: 0.5,
    marginTop: 4,
  },
  accessDeniedParagraph: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 11,
    color: DesignTokens.colors.textPrimary,
    lineHeight: 18,
  },
  securityBox: {
    borderWidth: 1,
    borderColor: DesignTokens.colors.amberDim,
    borderStyle: "dashed",
    padding: 12,
    gap: 6,
    marginTop: 6,
  },
  securityBoxTitle: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 10,
    color: DesignTokens.colors.amber,
    fontWeight: "bold",
  },
  securityBoxLine: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 10,
    color: DesignTokens.colors.textSecondary,
    lineHeight: 14,
  },
  switchAdminBtn: {
    backgroundColor: DesignTokens.colors.amber,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    marginTop: 10,
  },
  switchAdminBtnText: {
    fontFamily: DesignTokens.typography.fonts.terminal,
    fontSize: 13,
    color: DesignTokens.colors.bgDeep,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  alertBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.amber,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  alertBannerText: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 11,
    color: DesignTokens.colors.amber,
    fontWeight: "bold",
  },
  heroCard: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: DesignTokens.colors.amberDim,
    padding: 16,
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
  },
  officerAvatar: {
    width: 48,
    height: 48,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: DesignTokens.colors.amberDim,
    alignItems: "center",
    justifyContent: "center",
  },
  callsignTitle: {
    fontFamily: DesignTokens.typography.fonts.pixel,
    fontSize: 14,
    color: DesignTokens.colors.amber,
    letterSpacing: 0.5,
  },
  clearanceTag: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: DesignTokens.colors.amber,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  clearanceTagText: {
    fontFamily: DesignTokens.typography.fonts.pixel,
    fontSize: 10,
    color: DesignTokens.colors.amber,
  },
  callsignSubtitle: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 11,
    color: DesignTokens.colors.amberMid,
    marginTop: 4,
  },
  creditsCard: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: DesignTokens.colors.amberDim,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: "flex-end",
  },
  creditsLabel: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 10,
    color: DesignTokens.colors.amberMid,
  },
  creditsValue: {
    fontFamily: DesignTokens.typography.fonts.pixel,
    fontSize: 18,
    color: DesignTokens.colors.amber,
    marginTop: 2,
  },
  creditsSub: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 10,
    color: DesignTokens.colors.textSecondary,
    marginTop: 2,
  },
  rolesRow: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: DesignTokens.colors.amberDim,
    borderStyle: "dashed",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },
  rolesLabel: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 11,
    color: DesignTokens.colors.textSecondary,
  },
  rolesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  roleChip: {
    borderWidth: 1,
    borderColor: DesignTokens.colors.amber,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  roleChipText: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 10,
    color: DesignTokens.colors.amber,
  },
  sectionWrapper: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.amberDim,
    paddingBottom: 6,
  },
  sectionTitle: {
    fontFamily: DesignTokens.typography.fonts.terminal,
    fontSize: 12,
    color: DesignTokens.colors.amber,
    letterSpacing: 0.5,
  },
  sectionBadge: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 10,
    color: DesignTokens.colors.amberMid,
  },
  reportMetricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  reportMetricCard: {
    flex: 1,
    minWidth: 160,
    borderWidth: 1,
    borderColor: DesignTokens.colors.amberDim,
    padding: 14,
    gap: 4,
  },
  reportMetricLabel: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 10,
    color: DesignTokens.colors.textSecondary,
  },
  reportMetricVal: {
    fontFamily: DesignTokens.typography.fonts.terminal,
    fontSize: 18,
    color: DesignTokens.colors.amber,
  },
  reportMetricSub: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 10,
    color: DesignTokens.colors.textSecondary,
  },
  microservicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  nodeCard: {
    flex: 1,
    minWidth: 200,
    borderWidth: 1,
    borderColor: DesignTokens.colors.amberDim,
    padding: 12,
    gap: 4,
  },
  nodeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  nodeLedActive: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: DesignTokens.colors.statusReady,
  },
  nodeLedText: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 10,
    color: DesignTokens.colors.statusReady,
  },
  nodeName: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 11,
    color: DesignTokens.colors.textPrimary,
    fontWeight: "bold",
  },
  nodeTech: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 10,
    color: DesignTokens.colors.textSecondary,
  },
  nodeStatus: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 10,
    color: DesignTokens.colors.amberMid,
    marginTop: 2,
  },
  nodeMetric: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 10,
    color: DesignTokens.colors.textSecondary,
  },
  telemetrySplitRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  oscilloscopePanel: {
    flex: 1,
    minWidth: 280,
    borderWidth: 1,
    borderColor: DesignTokens.colors.amberDim,
    padding: 12,
    gap: 10,
  },
  hyperlanesPanel: {
    flex: 1,
    minWidth: 280,
    borderWidth: 1,
    borderColor: DesignTokens.colors.amberDim,
    padding: 12,
    gap: 10,
  },
  panelHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  panelTitle: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 11,
    color: DesignTokens.colors.amber,
  },
  panelLiveDot: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 10,
    color: DesignTokens.colors.statusReady,
  },
  waveDisplay: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: DesignTokens.colors.amberDim,
    padding: 10,
    alignItems: "center",
  },
  waveLine: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 11,
    color: DesignTokens.colors.amber,
    lineHeight: 16,
  },
  waveOverlayGrid: {},
  metricsTriple: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metricItem: {
    alignItems: "center",
  },
  metricLabel: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 9,
    color: DesignTokens.colors.textSecondary,
  },
  metricVal: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 11,
    color: DesignTokens.colors.amber,
    fontWeight: "bold",
    marginTop: 2,
  },
  sectorsList: {
    gap: 8,
  },
  sectorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.amberDim,
    borderStyle: "dashed",
    paddingBottom: 6,
  },
  sectorName: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 11,
    color: DesignTokens.colors.amber,
  },
  sectorCoordinates: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 10,
    color: DesignTokens.colors.textSecondary,
  },
  sectorRisk: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 10,
    fontWeight: "bold",
  },
  sectorVessels: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 10,
    color: DesignTokens.colors.textSecondary,
  },
  protocolButtonsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 8,
  },
  calibrateButton: {
    backgroundColor: DesignTokens.colors.amber,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  calibrateButtonText: {
    fontFamily: DesignTokens.typography.fonts.terminal,
    fontSize: 12,
    color: DesignTokens.colors.bgDeep,
    fontWeight: "bold",
  },
  signOutButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: DesignTokens.colors.alert,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  signOutButtonText: {
    fontFamily: DesignTokens.typography.fonts.terminal,
    fontSize: 12,
    color: DesignTokens.colors.alert,
  },
});

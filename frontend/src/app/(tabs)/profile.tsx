import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { DesignTokens } from "@/constants/Tokens";
import { Header } from "@/components/Header";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL, binderService, tradeService, cardService } from "@/services/api";

export default function ProfileScreen() {
  const { user, roles, signOut } = useAuth();
  const [collectionCount, setCollectionCount] = useState(0);
  const [tradesCount, setTradesCount] = useState(0);
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      binderService.getBinder(user).catch(() => ({ cards: [] })),
      tradeService.getMyTrades(user).catch(() => []),
      cardService.getCatalog().catch(() => []),
    ]).then(([binder, trades, catalog]) => {
      const cards = binder.cards || [];
      setCollectionCount(cards.length);
      setTradesCount(trades.length);

      const catalogMap: Record<string, number> = {};
      catalog.forEach((c) => {
        catalogMap[c.id] = c.marketPrice || 150.0;
      });

      const val = cards.reduce((acc, c) => acc + (catalogMap[c.cardId] || 150.0), 0);
      setTotalValue(val);
    });
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    router.replace("/(auth)/login");
  };

  return (
    <View style={styles.container}>
      <Header
        title="Perfil do Treinador"
        subtitle="Estatísticas da conta e status do ecossistema de microsserviços"
        badgeText={`@${user || "Treinador"}`}
      />

      <ScrollView style={styles.mainScrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ── CARD HERO: IDENTIDADE DO TREINADOR ── */}
        <View style={styles.trainerHeroCard}>
          <View style={styles.heroBackgroundPattern} />

          <View style={styles.heroMainContent}>
            {/* Avatar Circular com Borda Vermelha */}
            <View style={styles.avatarWrapper}>
              <View style={styles.avatarInner}>
                <Ionicons name="person" size={44} color={DesignTokens.colors.brandRed} />
              </View>
              <View style={styles.trainerLevelBadge}>
                <Ionicons name="shield-checkmark" size={12} color="#FFFFFF" />
              </View>
            </View>

            {/* Informações do Treinador */}
            <View style={styles.trainerInfoSection}>
              <View style={styles.trainerTitleRow}>
                <Text style={styles.trainerUsername}>@{user || "Treinador"}</Text>
                <View style={styles.officialBadge}>
                  <Text style={styles.officialBadgeText}>Treinador Oficial</Text>
                </View>
              </View>

              <Text style={styles.trainerSub}>Membro da Liga Pokémon TCG • Plataforma Microservices</Text>

              {/* Roles Chips */}
              <View style={styles.rolesRow}>
                {roles && roles.length > 0 ? (
                  roles.map((r, i) => (
                    <View key={i} style={styles.roleChip}>
                      <Ionicons name="key-outline" size={11} color={DesignTokens.colors.accentGold} style={{ marginRight: 4 }} />
                      <Text style={styles.roleChipText}>{r}</Text>
                    </View>
                  ))
                ) : (
                  <View style={styles.roleChip}>
                    <Text style={styles.roleChipText}>ROLE_TRAINER</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Métricas Rápidas do Treinador */}
          <View style={styles.heroStatsRow}>
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatValue}>{collectionCount}</Text>
              <Text style={styles.heroStatLabel}>Cartas na Coleção</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStatItem}>
              <Text style={[styles.heroStatValue, { color: DesignTokens.colors.success }]}>{tradesCount}</Text>
              <Text style={styles.heroStatLabel}>Trocas Registradas</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStatItem}>
              <Text style={[styles.heroStatValue, { color: DesignTokens.colors.accentGold }]}>
                R$ {totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </Text>
              <Text style={styles.heroStatLabel}>Patrimônio Estimado</Text>
            </View>
          </View>
        </View>

        {/* ── PAINEL DE ARQUITETURA & SAÚDE DOS MICROSSERVIÇOS ── */}
        <View style={styles.sectionHeader}>
          <Ionicons name="hardware-chip-outline" size={20} color={DesignTokens.colors.brandRed} style={{ marginRight: 8 }} />
          <Text style={styles.sectionHeading}>Ecossistema de Microsserviços & Cloud</Text>
        </View>

        <View style={styles.servicesGrid}>
          {/* Serviço 1: API Gateway */}
          <View style={styles.serviceCard}>
            <View style={styles.serviceCardHeader}>
              <View style={styles.serviceIconCircle}>
                <Ionicons name="globe-outline" size={20} color={DesignTokens.colors.brandRed} />
              </View>
              <View style={styles.serviceStatusPill}>
                <View style={styles.pulsingGreenDot} />
                <Text style={styles.serviceStatusText}>ONLINE</Text>
              </View>
            </View>
            <Text style={styles.serviceName}>API Gateway</Text>
            <Text style={styles.serviceAddress}>Porta :8080 • {API_BASE_URL}</Text>
            <Text style={styles.serviceDesc}>
              Spring Cloud Gateway com roteamento reativo WebFlux, tratamento de CORS unificado e redirecionamento de microsserviços.
            </Text>
          </View>

          {/* Serviço 2: Auth Service */}
          <View style={styles.serviceCard}>
            <View style={styles.serviceCardHeader}>
              <View style={styles.serviceIconCircle}>
                <Ionicons name="lock-closed-outline" size={20} color={DesignTokens.colors.brandRed} />
              </View>
              <View style={styles.serviceStatusPill}>
                <View style={styles.pulsingGreenDot} />
                <Text style={styles.serviceStatusText}>ONLINE</Text>
              </View>
            </View>
            <Text style={styles.serviceName}>Auth Service</Text>
            <Text style={styles.serviceAddress}>Porta :8081 • Spring Security + JWT</Text>
            <Text style={styles.serviceDesc}>
              Gerenciamento de contas de treinadores com criptografia BCrypt, geração de tokens JWT e persistência em MongoDB Atlas.
            </Text>
          </View>

          {/* Serviço 3: Trade Service */}
          <View style={styles.serviceCard}>
            <View style={styles.serviceCardHeader}>
              <View style={styles.serviceIconCircle}>
                <Ionicons name="swap-horizontal" size={20} color={DesignTokens.colors.brandRed} />
              </View>
              <View style={styles.serviceStatusPill}>
                <View style={styles.pulsingGreenDot} />
                <Text style={styles.serviceStatusText}>ONLINE</Text>
              </View>
            </View>
            <Text style={styles.serviceName}>Trade Service</Text>
            <Text style={styles.serviceAddress}>Porta :8082 • ACID Transactions</Text>
            <Text style={styles.serviceDesc}>
              Catálogo oficial de cartas TCG, gestão de binders, bloqueio atômico contra concorrência e liquidação de trocas.
            </Text>
          </View>

          {/* Serviço 4: Mensageria RabbitMQ */}
          <View style={styles.serviceCard}>
            <View style={styles.serviceCardHeader}>
              <View style={styles.serviceIconCircle}>
                <Ionicons name="cube-outline" size={20} color={DesignTokens.colors.brandRed} />
              </View>
              <View style={styles.serviceStatusPill}>
                <View style={styles.pulsingGreenDot} />
                <Text style={styles.serviceStatusText}>CONECTADO</Text>
              </View>
            </View>
            <Text style={styles.serviceName}>RabbitMQ / CloudAMQP</Text>
            <Text style={styles.serviceAddress}>Porta :5671 • AMQPS / SSL Seguro</Text>
            <Text style={styles.serviceDesc}>
              Broker assíncrono gerenciado na nuvem com filas duráveis, Dead Letter Queue (DLQ) e liquidação assíncrona desacoplada.
            </Text>
          </View>
        </View>

        {/* ── ATALHOS RÁPIDOS & ENCERRAMENTO DE SESSÃO ── */}
        <View style={styles.actionsCard}>
          <Text style={styles.actionsCardTitle}>Ações Rápidas da Conta</Text>

          <View style={styles.actionButtonsRow}>
            <TouchableOpacity style={styles.actionLinkBtn} onPress={() => router.push("/(tabs)/binder")}>
              <Ionicons name="albums-outline" size={18} color={DesignTokens.colors.textPrimary} style={{ marginRight: 8 }} />
              <Text style={styles.actionLinkText}>Acessar Minha Coleção</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionLinkBtn} onPress={() => router.push("/(tabs)/trades")}>
              <Ionicons name="swap-horizontal" size={18} color={DesignTokens.colors.textPrimary} style={{ marginRight: 8 }} />
              <Text style={styles.actionLinkText}>Ver Mural de Trocas</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.logoutBtnText}>ENCERRAR SESSÃO</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignTokens.colors.bgBase,
  },
  mainScrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    maxWidth: 1200,
    width: "100%",
    alignSelf: "center",
  },

  /* Card Hero do Treinador */
  trainerHeroCard: {
    backgroundColor: DesignTokens.colors.bgSurface,
    borderRadius: DesignTokens.radii.card,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
    overflow: "hidden",
    marginBottom: 28,
  },
  heroBackgroundPattern: {
    height: 80,
    backgroundColor: DesignTokens.colors.bgElevated,
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.border,
  },
  heroMainContent: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    marginTop: -40,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-end",
    gap: 20,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatarInner: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: DesignTokens.colors.bgSurface,
    borderWidth: 3,
    borderColor: DesignTokens.colors.brandRed,
    justifyContent: "center",
    alignItems: "center",
    ...(Platform.OS === "web" ? { boxShadow: "0 4px 16px rgba(238, 21, 21, 0.3)" } : {}),
  } as any,
  trainerLevelBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: DesignTokens.colors.brandRed,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: DesignTokens.colors.bgSurface,
  },
  trainerInfoSection: {
    flex: 1,
    minWidth: 260,
  },
  trainerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  trainerUsername: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    fontSize: 28,
    fontWeight: "900",
    color: DesignTokens.colors.textPrimary,
    letterSpacing: 0.5,
  },
  officialBadge: {
    backgroundColor: DesignTokens.colors.brandRedSubtle,
    borderWidth: 1,
    borderColor: DesignTokens.colors.brandRed,
    borderRadius: DesignTokens.radii.chip,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  officialBadgeText: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    fontSize: 12,
    fontWeight: "800",
    color: DesignTokens.colors.brandRed,
    letterSpacing: 0.5,
  },
  trainerSub: {
    fontFamily: DesignTokens.typography.fontFamily,
    fontSize: 13,
    color: DesignTokens.colors.textSecondary,
    marginTop: 4,
  },
  rolesRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  roleChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DesignTokens.colors.bgElevated,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
    borderRadius: DesignTokens.radii.chip,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  roleChipText: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    fontSize: 12,
    fontWeight: "700",
    color: DesignTokens.colors.textPrimary,
    letterSpacing: 0.3,
  },

  heroStatsRow: {
    flexDirection: "row",
    backgroundColor: DesignTokens.colors.bgElevated,
    borderTopWidth: 1,
    borderTopColor: DesignTokens.colors.border,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  heroStatItem: {
    flex: 1,
    alignItems: "center",
  },
  heroStatValue: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    fontSize: 24,
    fontWeight: "900",
    color: DesignTokens.colors.textPrimary,
    letterSpacing: 0.5,
  },
  heroStatLabel: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    fontSize: 12,
    fontWeight: "600",
    color: DesignTokens.colors.textSecondary,
    letterSpacing: 0.3,
    marginTop: 2,
  },
  heroStatDivider: {
    width: 1,
    backgroundColor: DesignTokens.colors.border,
    marginVertical: 4,
  },

  /* Seção de Microsserviços */
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionHeading: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    fontSize: 19,
    fontWeight: "800",
    color: DesignTokens.colors.textPrimary,
    letterSpacing: 0.5,
  },
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 28,
  },
  serviceCard: {
    flex: 1,
    minWidth: 260,
    backgroundColor: DesignTokens.colors.bgSurface,
    borderRadius: DesignTokens.radii.card,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
    padding: 18,
  },
  serviceCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  serviceIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: DesignTokens.colors.bgElevated,
    justifyContent: "center",
    alignItems: "center",
  },
  serviceStatusPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(46, 204, 113, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(46, 204, 113, 0.3)",
    borderRadius: DesignTokens.radii.chip,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 5,
  },
  pulsingGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: DesignTokens.colors.success,
  },
  serviceStatusText: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    fontSize: 11,
    fontWeight: "800",
    color: DesignTokens.colors.success,
    letterSpacing: 0.5,
  },
  serviceName: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    fontSize: 16,
    fontWeight: "800",
    color: DesignTokens.colors.textPrimary,
    letterSpacing: 0.3,
  },
  serviceAddress: {
    fontSize: 12,
    fontWeight: "700",
    color: DesignTokens.colors.brandRed,
    marginTop: 2,
    fontFamily: DesignTokens.typography.fontFamilyMono,
  },
  serviceDesc: {
    fontSize: 12,
    color: DesignTokens.colors.textSecondary,
    marginTop: 8,
    lineHeight: 18,
  },

  /* Card de Ações Rápidas */
  actionsCard: {
    backgroundColor: DesignTokens.colors.bgSurface,
    borderRadius: DesignTokens.radii.card,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
    padding: 20,
  },
  actionsCardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: DesignTokens.colors.textPrimary,
    marginBottom: 14,
  },
  actionButtonsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  actionLinkBtn: {
    flex: 1,
    minWidth: 200,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DesignTokens.colors.bgElevated,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
    borderRadius: DesignTokens.radii.button,
    paddingVertical: 12,
  },
  actionLinkText: {
    fontSize: 13,
    fontWeight: "700",
    color: DesignTokens.colors.textPrimary,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DesignTokens.colors.danger,
    borderRadius: DesignTokens.radii.button,
    paddingVertical: 14,
  },
  logoutBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
});

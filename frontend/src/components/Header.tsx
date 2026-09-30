import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, Platform } from "react-native";
import { router, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { DesignTokens } from "@/constants/Tokens";
import { useAuth } from "@/context/AuthContext";

interface Props {
  title: string;
  subtitle?: string;
  badgeText?: string;
}

const NAV_LINKS = [
  { name: "Catálogo", path: "/(tabs)" as const, icon: "albums-outline" },
  { name: "Minha Coleção", path: "/(tabs)/binder" as const, icon: "folder-open-outline" },
  { name: "Trocas", path: "/(tabs)/trades" as const, icon: "swap-horizontal-outline" },
  { name: "Perfil", path: "/(tabs)/profile" as const, icon: "person-outline" },
];

export const Header: React.FC<Props> = ({ title, subtitle, badgeText }) => {
  const { user, signOut } = useAuth();
  const { width } = useWindowDimensions();
  const pathname = usePathname();
  const isDesktop = width >= 860;

  return (
    <View style={styles.headerContainer} accessibilityRole="header">
      {/* Skip Link para acessibilidade WCAG (teclado) */}
      {Platform.OS === "web" && (
        <a
          href="#main-content"
          style={{
            position: "absolute",
            top: -999,
            left: 12,
            background: DesignTokens.colors.brandRed,
            color: "#ffffff",
            padding: "8px 16px",
            zIndex: 9999,
            borderRadius: 6,
            fontWeight: 700,
            textDecoration: "none",
          }}
          onFocus={(e) => {
            (e.currentTarget as any).style.top = "8px";
          }}
          onBlur={(e) => {
            (e.currentTarget as any).style.top = "-999px";
          }}
        >
          Pular para o conteúdo principal
        </a>
      )}

      <View style={styles.headerInner}>
        {/* Lado Esquerdo: Logo Pokébola + Nome da Marca + Breadcrumb */}
        <View style={styles.leftSection}>
          <TouchableOpacity
            style={styles.brandBtn}
            onPress={() => router.push("/(tabs)")}
            accessibilityRole="link"
            accessibilityLabel="Ir para o Catálogo do Pokémon TCG"
          >
            {/* Ícone de Pokébola estilizado */}
            <View style={styles.pokeballIcon}>
              <View style={styles.pokeballTop} />
              <View style={styles.pokeballLine} />
              <View style={styles.pokeballCenter}>
                <View style={styles.pokeballDot} />
              </View>
            </View>

            <View style={styles.brandTextWrap}>
              <View style={styles.brandTitleRow}>
                <Text style={styles.brandWordmark}>POKÉMON</Text>
                <Text style={styles.brandSubmark}>TCG</Text>
              </View>
              <Text style={styles.brandSubtitle}>Marketplace de Cartas TCG</Text>
            </View>
          </TouchableOpacity>

          {/* Breadcrumb da página */}
          <View style={styles.breadcrumbDivider} />
          <View style={styles.breadcrumbWrap}>
            <Text style={styles.breadcrumbRoot}>Início</Text>
            <Ionicons name="chevron-forward" size={12} color={DesignTokens.colors.textMuted} />
            <Text style={styles.breadcrumbCurrent}>{title}</Text>
          </View>
        </View>

        {/* Centro: Navegação Principal Desktop */}
        {isDesktop && (
          <View style={styles.desktopNav} accessibilityRole={"navigation" as any}>
            {NAV_LINKS.map((link) => {
              const isActive =
                link.path === "/(tabs)"
                  ? pathname === "/" || pathname === "/(tabs)" || pathname === "/(tabs)/"
                  : pathname.startsWith(link.path);

              return (
                <TouchableOpacity
                  key={link.path}
                  style={[styles.navLink, isActive && styles.navLinkActive]}
                  onPress={() => router.push(link.path)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                  accessibilityLabel={`Navegar para ${link.name}`}
                >
                  <Ionicons
                    name={link.icon as any}
                    size={16}
                    color={isActive ? DesignTokens.colors.brandRed : DesignTokens.colors.textSecondary}
                  />
                  <Text style={[styles.navLinkText, isActive && styles.navLinkTextActive]}>
                    {link.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Lado Direito: Métricas, Treinador e Logout */}
        <View style={styles.rightSection}>
          {badgeText && (
            <View style={styles.badgePill} accessibilityLabel={`Total: ${badgeText}`}>
              <Ionicons name="layers-outline" size={14} color={DesignTokens.colors.textSecondary} style={{ marginRight: 6 }} />
              <Text style={styles.badgePillText}>{badgeText}</Text>
            </View>
          )}

          {/* Tag do Treinador com indicador de conexão */}
          <View
            style={styles.trainerTag}
            accessibilityLabel={`Usuário conectado: @${user || "treinador"}`}
            // @ts-ignore
            title="Conectado ao servidor oficial"
          >
            <View style={styles.statusIndicator} />
            <Ionicons name="person-circle-outline" size={16} color={DesignTokens.colors.brandRed} />
            <Text style={styles.trainerName}>@{user || "treinador"}</Text>
          </View>

          {/* Botão Sair com Touch Target >= 44x44px */}
          <TouchableOpacity
            onPress={signOut}
            style={styles.logoutBtn}
            accessibilityRole="button"
            accessibilityLabel="Sair da conta"
            // @ts-ignore
            title="Sair da conta"
          >
            <Ionicons name="log-out-outline" size={18} color={DesignTokens.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: DesignTokens.colors.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.border,
    zIndex: 100,
  },
  headerInner: {
    height: 64,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  brandBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 44,
  },
  pokeballIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#F5F6F8",
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#FFFFFF",
  },
  pokeballTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
    backgroundColor: DesignTokens.colors.brandRed,
  },
  pokeballLine: {
    position: "absolute",
    top: "44%",
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "#16181D",
  },
  pokeballCenter: {
    position: "absolute",
    top: "28%",
    left: "28%",
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#16181D",
    justifyContent: "center",
    alignItems: "center",
  },
  pokeballDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#FFFFFF",
  },
  brandTextWrap: {
    justifyContent: "center",
  },
  brandTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  brandWordmark: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    fontSize: 18,
    fontWeight: "800",
    color: DesignTokens.colors.textPrimary,
    letterSpacing: 0.5,
  },
  brandSubmark: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    fontSize: 18,
    fontWeight: "800",
    color: DesignTokens.colors.brandRed,
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontFamily: DesignTokens.typography.fontFamily,
    fontSize: 11,
    color: DesignTokens.colors.textMuted,
  },
  breadcrumbDivider: {
    width: 1,
    height: 16,
    backgroundColor: DesignTokens.colors.border,
    marginHorizontal: 4,
  },
  breadcrumbWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  breadcrumbRoot: {
    fontFamily: DesignTokens.typography.fontFamily,
    fontSize: 12,
    color: DesignTokens.colors.textMuted,
  },
  breadcrumbCurrent: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    fontSize: 13,
    fontWeight: "700",
    color: DesignTokens.colors.textPrimary,
    letterSpacing: 0.3,
  },
  desktopNav: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 64,
  },
  navLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    height: 64,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  navLinkActive: {
    borderBottomColor: DesignTokens.colors.brandRed,
  },
  navLinkText: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    fontSize: 15,
    fontWeight: "600",
    color: DesignTokens.colors.textSecondary,
    letterSpacing: 0.3,
  },
  navLinkTextActive: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    color: DesignTokens.colors.textPrimary,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  badgePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DesignTokens.colors.bgElevated,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
    paddingHorizontal: 10,
    height: 36,
    borderRadius: DesignTokens.radii.control,
  },
  badgePillText: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    fontSize: 13,
    fontWeight: "700",
    color: DesignTokens.colors.textSecondary,
    letterSpacing: 0.3,
  },
  trainerTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DesignTokens.colors.bgElevated,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
    paddingHorizontal: 10,
    height: 36,
    borderRadius: DesignTokens.radii.control,
    gap: 6,
  },
  statusIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: DesignTokens.colors.success,
  },
  trainerName: {
    fontSize: 12,
    fontWeight: "700",
    color: DesignTokens.colors.textPrimary,
  },
  logoutBtn: {
    width: 44,
    height: 44,
    borderRadius: DesignTokens.radii.control,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
    backgroundColor: DesignTokens.colors.bgElevated,
    justifyContent: "center",
    alignItems: "center",
  },
});
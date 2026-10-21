import { StyleSheet } from "react-native";
import { DesignTokens } from "@/constants/Tokens";

export const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: DesignTokens.colors.bgDeep,
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.amberDim,
    borderStyle: "dashed",
    overflow: "hidden",
    zIndex: 100,
  },

  /* ── HUD SUPERIOR TELEMETRIA (MÍNIMO 11PX) ── */
  hudTopBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: DesignTokens.colors.bgDeep,
    paddingHorizontal: DesignTokens.spacing.base,
    paddingVertical: DesignTokens.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.amberDim,
    borderStyle: "dashed",
    overflow: "hidden",
  },
  hudLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: DesignTokens.spacing.sm,
  },
  promptPrefix: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: DesignTokens.typography.sizes.xs,
    color: DesignTokens.colors.amber,
    fontWeight: "700",
  },
  sysStatusIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  sysStatusText: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: DesignTokens.typography.sizes.xs,
    color: DesignTokens.colors.amber,
    letterSpacing: DesignTokens.typography.letterSpacing.tight,
  },
  vDivider: {
    width: 1,
    height: 12,
    backgroundColor: DesignTokens.colors.amberDim,
    marginHorizontal: DesignTokens.spacing.xs,
  },
  stationLabel: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: DesignTokens.typography.sizes.xs,
    color: DesignTokens.colors.textSecondary,
  },
  sectorLabel: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: DesignTokens.typography.sizes.xs,
    color: DesignTokens.colors.textSecondary,
  },
  hudRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: DesignTokens.spacing.sm,
  },
  hudMetric: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: DesignTokens.typography.sizes.xs,
    color: DesignTokens.colors.textSecondary,
  },
  hudMetricValue: {
    color: DesignTokens.colors.textPrimary,
    fontWeight: "700",
  },
  hudMetricAmber: {
    color: DesignTokens.colors.textPrimary,
    fontWeight: "700",
  },

  /* ── BARRA DE NAVEGAÇÃO PRINCIPAL ── */
  navBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: DesignTokens.spacing.base,
    height: 48,
    backgroundColor: "transparent",
  },
  logoBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: DesignTokens.spacing.sm,
  },
  terminalIconBox: {
    borderWidth: 1,
    borderColor: DesignTokens.colors.amber,
    borderRadius: 0,
    paddingHorizontal: 6,
    paddingVertical: 1,
    backgroundColor: "transparent",
  },
  terminalIconText: {
    fontFamily: DesignTokens.typography.fonts.terminal,
    fontSize: 16,
    color: DesignTokens.colors.textPrimary,
  },
  logoTitle: {
    fontFamily: DesignTokens.typography.fonts.display,
    fontSize: 30,
    color: DesignTokens.colors.textPrimary,
    letterSpacing: 3,
  },
  logoSub: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: DesignTokens.typography.sizes.xs,
    color: DesignTokens.colors.textSecondary,
    letterSpacing: DesignTokens.typography.letterSpacing.tight,
  },

  /* ── ABAS DE CONSOLE ── */
  consoleTabsGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: DesignTokens.spacing.xs,
    height: "100%",
  },
  consoleTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: DesignTokens.spacing.md,
    height: 34,
    borderWidth: 1,
    borderColor: DesignTokens.colors.amberDim,
    gap: 4,
    backgroundColor: "transparent",
    borderRadius: 0,
  },
  consoleTabActive: {
    backgroundColor: DesignTokens.colors.amber,
    borderColor: DesignTokens.colors.amber,
  },
  tabPrefix: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: DesignTokens.typography.sizes.xs,
    color: "transparent",
    fontWeight: "700",
  },
  tabPrefixActive: {
    color: DesignTokens.colors.bgDeep,
  },
  consoleTabNumber: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: DesignTokens.typography.sizes.xs,
    color: DesignTokens.colors.textSecondary,
  },
  consoleTabNumberActive: {
    color: DesignTokens.colors.bgDeep,
    fontWeight: "bold",
  },
  consoleTabText: {
    fontFamily: DesignTokens.typography.fonts.terminal,
    fontSize: 14,
    letterSpacing: DesignTokens.typography.letterSpacing.normal,
  },
  consoleTabTextInactive: {
    color: DesignTokens.colors.textPrimary,
  },
  consoleTabTextActive: {
    color: DesignTokens.colors.bgDeep,
    fontWeight: "bold",
  },

  /* ── SEÇÃO DO OFICIAL ── */
  officerSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: DesignTokens.spacing.sm,
  },
  crtToggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: DesignTokens.colors.amberDim,
    borderRadius: 0,
    paddingHorizontal: DesignTokens.spacing.sm,
    paddingVertical: 3,
    backgroundColor: "transparent",
    gap: 4,
  },
  crtToggleLabel: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: DesignTokens.typography.sizes.xs,
    color: DesignTokens.colors.amberMid,
    fontWeight: "700",
  },
  crtToggleValue: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: DesignTokens.typography.sizes.xs,
    color: DesignTokens.colors.amber,
    fontWeight: "700",
  },
  hudTopBarMobile: {
    paddingVertical: 3,
    flexWrap: "wrap",
  },
  officerBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: DesignTokens.colors.amberDim,
    borderRadius: 0,
    paddingHorizontal: DesignTokens.spacing.sm,
    paddingVertical: 3,
    backgroundColor: "transparent",
    gap: 6,
  },
  officerRank: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: DesignTokens.typography.sizes.xs,
    color: DesignTokens.colors.amber,
    fontWeight: "700",
  },
  officerCallsign: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: DesignTokens.typography.sizes.sm,
    color: DesignTokens.colors.amber,
  },
  logoutTerminalBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: DesignTokens.colors.alert,
    borderRadius: 0,
    backgroundColor: "transparent",
    paddingHorizontal: DesignTokens.spacing.sm,
    paddingVertical: 4,
    gap: 4,
  },
  logoutBtnText: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: DesignTokens.typography.sizes.xs,
    color: DesignTokens.colors.alert,
    fontWeight: "700",
  },
});

import { StyleSheet } from "react-native";
import { DesignTokens } from "@/constants/Tokens";

export const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(5, 2, 0, 0.85)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  modalCard: {
    width: "100%",
    maxWidth: 480,
    backgroundColor: DesignTokens.colors.bgDeep,
    borderWidth: 1,
    borderColor: DesignTokens.colors.amber,
    borderRadius: 0,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.amberDim,
    borderStyle: "dashed",
    overflow: "hidden",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 13,
    color: DesignTokens.colors.amber,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  modalBody: {
    padding: 20,
    gap: 16,
  },
  shipHighlightBox: {
    borderWidth: 1,
    borderColor: DesignTokens.colors.amberDim,
    padding: 10,
    gap: 4,
  },
  shipHighlightLabel: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 11,
    color: DesignTokens.colors.textMuted,
  },
  shipHighlightName: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 14,
    color: DesignTokens.colors.amber,
    fontWeight: "700",
  },
  messageText: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 12,
    color: DesignTokens.colors.textSecondary,
    lineHeight: 18,
  },
  costBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: DesignTokens.colors.amberDim,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  costLabel: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 11,
    color: DesignTokens.colors.textMuted,
  },
  costValue: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 13,
    color: DesignTokens.colors.alert,
    fontWeight: "700",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
});

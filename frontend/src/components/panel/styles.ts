import { StyleSheet } from "react-native";
import { DesignTokens } from "@/constants/Tokens";

export const styles = StyleSheet.create({
  panelFrame: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderRadius: 0,
  },
  titleBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderStyle: "dashed",
    overflow: "hidden",
    paddingHorizontal: DesignTokens.spacing.md,
    paddingVertical: DesignTokens.spacing.xs,
    backgroundColor: "transparent",
  },
  titleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  titleText: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: DesignTokens.typography.sizes.sm,
    color: DesignTokens.colors.amber,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  subtitleText: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: DesignTokens.typography.sizes.xs,
    color: DesignTokens.colors.textMuted,
  },
  rightGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  panelBody: {
    backgroundColor: "transparent",
  },
});

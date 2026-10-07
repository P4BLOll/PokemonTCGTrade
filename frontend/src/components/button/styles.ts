import { StyleSheet } from "react-native";
import { DesignTokens } from "@/constants/Tokens";

export const styles = StyleSheet.create({
  baseButton: {
    borderRadius: 0,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 38,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  sizeSm: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    minHeight: 34,
  },
  sizeMd: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 40,
  },
  sizeLg: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    minHeight: 48,
  },
  btnPrimary: {
    backgroundColor: DesignTokens.colors.amber,
    borderColor: DesignTokens.colors.amber,
  },
  btnSecondary: {
    backgroundColor: "transparent",
    borderColor: DesignTokens.colors.amberDim,
  },
  btnDanger: {
    backgroundColor: "transparent",
    borderColor: DesignTokens.colors.alert,
  },
  btnGhost: {
    backgroundColor: "transparent",
    borderColor: "transparent",
  },
  btnDisabled: {
    backgroundColor: "transparent",
    borderColor: DesignTokens.colors.amberDim,
    opacity: 0.6,
  },
  btnText: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  textSize_sm: {
    fontSize: 11,
  },
  textSize_md: {
    fontSize: 12,
  },
  textSize_lg: {
    fontSize: 14,
  },
});

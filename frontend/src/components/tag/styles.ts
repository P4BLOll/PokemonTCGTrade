import { StyleSheet } from "react-native";
import { DesignTokens } from "@/constants/Tokens";

export const styles = StyleSheet.create({
  tagContainer: {
    borderWidth: 1,
    borderRadius: 0,
    backgroundColor: "transparent",
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  fixedWidth: {
    width: 60,
  },
  tagText: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});

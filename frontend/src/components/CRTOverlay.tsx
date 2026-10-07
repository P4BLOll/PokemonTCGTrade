import React from "react";
import { View, StyleSheet } from "react-native";
import { DesignTokens } from "@/constants/Tokens";

interface CRTOverlayProps {
  children?: React.ReactNode;
  enableFlicker?: boolean;
}

/**
 * CRTOverlay: Componente de tela de terminal CRT para Web.
 * A camada de scanlines e flicker é controlada dinamicamente via CSS pelas classes do body (.crt-off, .crt-subtle, .crt-full).
 */
export const CRTOverlay: React.FC<CRTOverlayProps> = ({ children }) => {
  return (
    <View style={styles.container}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignTokens.colors.bgDeep,
    position: "relative",
  },
});

import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { DesignTokens } from "@/constants/Tokens";
import { useCrt } from "@/context/CrtContext";

interface CRTOverlayProps {
  children?: React.ReactNode;
  enableFlicker?: boolean;
}

/**
 * CRTOverlay: Componente de simulação de tela CRT integrado ao CrtContext.
 * - No Web: a camada de scanlines e flicker é controlada pelas classes de body (.crt-off, .crt-subtle, .crt-full).
 * - No Nativo: renderiza malha estritamente plana cuja opacidade reflete a intensidade selecionada pelo usuário.
 */
export const CRTOverlay: React.FC<CRTOverlayProps> = ({ children }) => {
  const { mode } = useCrt();

  const scanlineOpacity = mode === "OFF" ? 0 : mode === "SUBTLE" ? 0.08 : 0.16;

  return (
    <View style={styles.container}>
      {children}
      {Platform.OS !== "web" && mode !== "OFF" && (
        <View
          pointerEvents="none"
          style={[styles.nativeScanlineLayer, { opacity: scanlineOpacity }]}
        >
          {/* Grelha de scanlines estritamente planas para iOS/Android */}
          {Array.from({ length: 40 }).map((_, i) => (
            <View key={i} style={styles.nativeScanlineRow} />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignTokens.colors.bgDeep,
    position: "relative",
  },
  nativeScanlineLayer: {
    ...StyleSheet.absoluteFill,
    zIndex: 9999,
    justifyContent: "space-evenly",
    opacity: 0.15,
  },
  nativeScanlineRow: {
    width: "100%",
    height: 1,
    backgroundColor: "#000000",
  },
});

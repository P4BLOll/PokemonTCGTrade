import React, { useState, useEffect, memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { DesignTokens, glowText } from "@/constants/Tokens";
import { TerminalLabels } from "@/constants/Labels";

interface RadarDisplayProps {
  rangeText?: string;
  size?: number;
}

/**
 * RadarDisplay: Display Vetorial de Radar Orbital CRT para Web.
 * Encapsulado com React.memo e timer interno independente (50ms).
 */
export const RadarDisplay: React.FC<RadarDisplayProps> = memo(({
  rangeText = "RANGE: 50.000 KM // 12 TARGETS",
  size = 280,
}) => {
  const [radarAngle, setRadarAngle] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (mediaQuery.matches) {
        setRadarAngle(45);
        return;
      }
    }

    const interval = setInterval(() => {
      setRadarAngle((prev) => (prev + 3) % 360);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const center = size / 2;
  const radius = center - 10;
  const beamX = center + radius * Math.cos((radarAngle * Math.PI) / 180);
  const beamY = center + radius * Math.sin((radarAngle * Math.PI) / 180);

  return (
    <View
      style={styles.container}
      accessibilityRole="image"
      accessibilityLabel="Radar de varredura orbital em tempo real monitorando alvos do setor"
    >
      <View style={styles.titleBar}>
        <Text style={[styles.titleText, glowText("title")]}>
          {TerminalLabels.system.radarScan}
        </Text>
        <Text style={styles.rangeText}>{rangeText}</Text>
      </View>

      <View style={styles.visualContainer}>
        <View style={styles.svgAnchor}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: "visible" }}>
            {/* Anéis Métricos Concêntricos */}
            <circle cx={center} cy={center} r={radius} stroke={DesignTokens.colors.amberDim} strokeWidth="1" fill="none" />
            <circle cx={center} cy={center} r={radius * 0.73} stroke={DesignTokens.colors.amberDim} strokeWidth="1" strokeDasharray="3 3" fill="none" opacity="0.6" />
            <circle cx={center} cy={center} r={radius * 0.46} stroke={DesignTokens.colors.amberDim} strokeWidth="1" fill="none" opacity="0.5" />
            <circle cx={center} cy={center} r={radius * 0.19} stroke={DesignTokens.colors.amberDim} strokeWidth="1" fill="none" opacity="0.4" />

            {/* Eixos Ortogonais */}
            <line x1={center} y1="5" x2={center} y2={size - 5} stroke={DesignTokens.colors.amberDim} strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
            <line x1="5" y1={center} x2={size - 5} y2={center} stroke={DesignTokens.colors.amberDim} strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />

            {/* Estação Espacial Central ALPHA-7 */}
            <rect x={center - 5} y={center - 5} width="10" height="10" fill={DesignTokens.colors.amber} />
            <rect x={center - 24} y={center - 24} width="48" height="14" fill={DesignTokens.colors.bgDeep} />
            <text x={center} y={center - 13} fill={DesignTokens.colors.amber} fontSize="11" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
              ALPHA-7
            </text>

            {/* Alvos Orbitais com Máscara de Fundo bgDeep */}
            <circle cx={center + 60} cy={center - 60} r="3.5" fill={DesignTokens.colors.amberMid} />
            <rect x={center + 66} y={center - 67} width="68" height="14" fill={DesignTokens.colors.bgDeep} />
            <text x={center + 68} y={center - 56} fill={DesignTokens.colors.amberMid} fontSize="11" fontFamily="monospace">
              CARGO-FR7
            </text>

            <circle cx={center - 65} cy={center + 45} r="4" fill={DesignTokens.colors.amber} />
            <rect x={center - 59} y={center + 38} width="76" height="14" fill={DesignTokens.colors.bgDeep} />
            <text x={center - 57} y={center + 49} fill={DesignTokens.colors.amber} fontSize="11" fontFamily="monospace" fontWeight="bold">
              VALKYRIE-9
            </text>

            <circle cx={center + 75} cy={center + 65} r="3.5" fill={DesignTokens.colors.amberMid} />
            <rect x={center + 81} y={center + 58} width="56" height="14" fill={DesignTokens.colors.bgDeep} />
            <text x={center + 83} y={center + 69} fill={DesignTokens.colors.amberMid} fontSize="11" fontFamily="monospace">
              BUOY-03
            </text>

            {/* Feixe de Varredura Físico CRT */}
            <line
              x1={center}
              y1={center}
              x2={beamX}
              y2={beamY}
              stroke={DesignTokens.colors.amber}
              strokeWidth="1.2"
              opacity="0.9"
            />
          </svg>
        </View>

        <View style={styles.legendRow}>
          <Text style={styles.legendItem}>[N] 000°</Text>
          <Text style={styles.legendItem}>[E] 090°</Text>
          <Text style={styles.legendItem}>[S] 180°</Text>
          <Text style={styles.legendItem}>[W] 270°</Text>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: DesignTokens.colors.bgDeep,
    borderWidth: 1,
    borderColor: DesignTokens.colors.amberDim,
    borderRadius: 0,
    overflow: "hidden",
  },
  titleBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: DesignTokens.spacing.md,
    paddingVertical: DesignTokens.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.amberDim,
    borderStyle: "dashed",
    overflow: "hidden",
  },
  titleText: {
    fontFamily: DesignTokens.typography.fonts.terminal,
    fontSize: DesignTokens.typography.sizes.md, // 14px
    color: DesignTokens.colors.amber,
    letterSpacing: DesignTokens.typography.letterSpacing.normal,
  },
  rangeText: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: DesignTokens.typography.sizes.xs, // 11px
    color: DesignTokens.colors.amberMid,
    letterSpacing: DesignTokens.typography.letterSpacing.tight,
  },
  visualContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: DesignTokens.spacing.md,
  },
  svgAnchor: {
    width: 280,
    height: 280,
    alignItems: "center",
    justifyContent: "center",
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 280,
    marginTop: DesignTokens.spacing.sm,
    paddingHorizontal: DesignTokens.spacing.xs,
  },
  legendItem: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: DesignTokens.typography.sizes.xs, // 11px
    color: DesignTokens.colors.amberMid,
  },
});

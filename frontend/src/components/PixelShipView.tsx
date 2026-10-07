import React from "react";
import { View, StyleSheet } from "react-native";
import { DesignTokens } from "@/constants/Tokens";

/**
 * Cores táticas identificadoras de cada classe e protótipo de vetor estelar.
 */
export const SHIP_CLASS_COLORS: Record<string, string> = {
  INTERCEPTOR: "#FFD54F",   // Amarelo Claro Térmico (Caça tático rápido)
  FREIGHTER: "#FFA000",     // Âmbar Médio (Cargueiro pesado)
  MINING_DRONE: "#FFB000",  // Âmbar Padrão (Drone de mineração)
  ASSAULT_MECH: "#FF3D00",  // Vermelho Térmico (Mecha de assalto)
  SCOUT: "#FF6D00",         // Laranja Vivo (Reconhecimento furtivo)
  CORVETTE: "#FF8F00",      // Laranja Âmbar (Corveta de patrulha)
  PROTOTYPE: "#FFE082",     // Amarelo Ouro Luminoso (Protótipo experimental raro)
};

/**
 * Função utilitária global para obter a cor de identificação tática dos ativos no terminal AERO-OS.
 */
export const getShipClassColor = (
  classType?: string,
  isRareOrPrototype?: boolean,
  shipNameOrCode?: string
): string => {
  if (
    isRareOrPrototype ||
    (shipNameOrCode && /proto|starhawk|raro|secret/i.test(shipNameOrCode))
  ) {
    return SHIP_CLASS_COLORS.PROTOTYPE;
  }
  const normalized = (classType || "INTERCEPTOR").toUpperCase().replace(/\s+/g, "_");
  return SHIP_CLASS_COLORS[normalized] || DesignTokens.colors.amber;
};

interface Props {
  classType?: string;
  shipClass?: string;
  color?: string;
  size?: number;
  showBlueprintGrid?: boolean;
}

/**
 * Renderizador de Blueprints & Sprites Pixel Art para naves e ativos do AERO-OS.
 * - Estética estritamente plana (fundo 100% transparente).
 * - Renderização vetorial nítida com shapeRendering="crispEdges".
 * - Cada nave possui sua cor tática de identificação de classe.
 * - Suporta tamanho aumentado nos cartões sem perda de proporção.
 */
export const PixelShipView: React.FC<Props> = ({
  classType,
  shipClass,
  color,
  size = 120,
  showBlueprintGrid = false,
}) => {
  const activeClass = (classType || shipClass || "INTERCEPTOR").toUpperCase().replace(/\s+/g, "_");
  const strokeColor = color || getShipClassColor(activeClass, false);
  const midColor = strokeColor;
  const dimColor = DesignTokens.colors.amberDim;
  const bgColor = DesignTokens.colors.bgDeep;

  const renderShipShape = () => {
    switch (activeClass) {
      case "INTERCEPTOR":
        // Caça tático em ponta de flecha
        return (
          <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
            <line x1="20" y1="2" x2="20" y2="38" stroke={dimColor} strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
            <line x1="4" y1="20" x2="36" y2="20" stroke={dimColor} strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />

            {/* Casco Principal */}
            <polygon points="20,4 25,18 28,26 34,32 30,34 24,30 20,33 16,30 10,34 6,32 12,26 15,18" fill="none" stroke={strokeColor} strokeWidth="1.2" />

            {/* Cabine / Cockpit */}
            <rect x="18" y="12" width="4" height="8" fill={strokeColor} />

            {/* Motores Iônicos Duplos */}
            <rect x="13" y="30" width="3" height="4" fill={midColor} />
            <rect x="24" y="30" width="3" height="4" fill={midColor} />

            {/* Canhões de Bordo */}
            <line x1="12" y1="24" x2="12" y2="16" stroke={midColor} strokeWidth="1" />
            <line x1="28" y1="24" x2="28" y2="16" stroke={midColor} strokeWidth="1" />
          </svg>
        );

      case "FREIGHTER":
        // Cargueiro pesado retangular com nervuras
        return (
          <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
            <line x1="20" y1="2" x2="20" y2="38" stroke={dimColor} strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />

            {/* Módulo de Comando Frontal */}
            <polygon points="16,6 24,6 26,10 14,10" fill={strokeColor} />

            {/* Seção Central de Carga */}
            <rect x="13" y="11" width="14" height="20" fill="none" stroke={strokeColor} strokeWidth="1.2" />
            <line x1="13" y1="16" x2="27" y2="16" stroke={midColor} strokeWidth="0.8" />
            <line x1="13" y1="21" x2="27" y2="21" stroke={midColor} strokeWidth="0.8" />
            <line x1="13" y1="26" x2="27" y2="26" stroke={midColor} strokeWidth="0.8" />

            {/* Tanques Laterais */}
            <rect x="8" y="14" width="4" height="14" fill="none" stroke={midColor} strokeWidth="1" />
            <rect x="28" y="14" width="4" height="14" fill="none" stroke={midColor} strokeWidth="1" />

            {/* Motores Traseiros */}
            <rect x="10" y="32" width="4" height="3" fill={strokeColor} />
            <rect x="16" y="32" width="3" height="3" fill={midColor} />
            <rect x="21" y="32" width="3" height="3" fill={midColor} />
            <rect x="26" y="32" width="4" height="3" fill={strokeColor} />
          </svg>
        );

      case "MINING_DRONE":
        // Drone industrial com broca frontal
        return (
          <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
            {/* Broca de Perfuração Plasma */}
            <polygon points="20,4 17,11 23,11" fill={strokeColor} />
            <line x1="20" y1="4" x2="20" y2="11" stroke={bgColor} strokeWidth="1" />

            {/* Corpo Central Mecanizado */}
            <circle cx="20" cy="20" r="7" fill="none" stroke={strokeColor} strokeWidth="1.2" />
            <rect x="18" y="18" width="4" height="4" fill={strokeColor} />

            {/* Braços Coletores Articulados */}
            <polygon points="12,16 6,22 8,24 13,19" fill={midColor} />
            <polygon points="28,16 34,22 32,24 27,19" fill={midColor} />

            {/* Propulsores Omnidirecionais */}
            <rect x="11" y="27" width="5" height="4" fill="none" stroke={midColor} strokeWidth="1" />
            <rect x="24" y="27" width="5" height="4" fill="none" stroke={midColor} strokeWidth="1" />
          </svg>
        );

      case "ASSAULT_MECH":
        // Mecha Bípede de Combate
        return (
          <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
            {/* Torso Blindado */}
            <rect x="14" y="8" width="12" height="12" fill="none" stroke={strokeColor} strokeWidth="1.2" />
            <rect x="18" y="11" width="4" height="3" fill={strokeColor} />

            {/* Lançadores de Mísseis nos Ombros */}
            <rect x="8" y="7" width="5" height="6" fill="none" stroke={midColor} strokeWidth="1" />
            <rect x="27" y="7" width="5" height="6" fill="none" stroke={midColor} strokeWidth="1" />

            {/* Braços com Canhões de Plasma */}
            <line x1="12" y1="14" x2="6" y2="22" stroke={strokeColor} strokeWidth="1.2" />
            <line x1="28" y1="14" x2="34" y2="22" stroke={strokeColor} strokeWidth="1.2" />
            <circle cx="6" cy="23" r="2" fill={midColor} />
            <circle cx="34" cy="23" r="2" fill={midColor} />

            {/* Pernas Hidráulicas e Pés */}
            <line x1="16" y1="20" x2="14" y2="30" stroke={midColor} strokeWidth="1.2" />
            <line x1="24" y1="20" x2="26" y2="30" stroke={midColor} strokeWidth="1.2" />
            <rect x="11" y="30" width="6" height="3" fill={strokeColor} />
            <rect x="23" y="30" width="6" height="3" fill={strokeColor} />
          </svg>
        );

      case "CORVETTE":
        // Corveta de patrulha estelar com blindagem angular
        return (
          <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
            <line x1="20" y1="2" x2="20" y2="38" stroke={dimColor} strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
            <polygon points="20,4 25,12 28,24 24,34 20,32 16,34 12,24 15,12" fill="none" stroke={strokeColor} strokeWidth="1.2" />
            <rect x="18" y="14" width="4" height="6" fill={strokeColor} />
            <polygon points="12,20 6,28 12,26" fill={midColor} />
            <polygon points="28,20 34,28 28,26" fill={midColor} />
            <rect x="16" y="34" width="8" height="3" fill={strokeColor} />
          </svg>
        );

      case "SCOUT":
      default:
        // Nave leve de reconhecimento em asa delta
        return (
          <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
            <line x1="20" y1="2" x2="20" y2="38" stroke={dimColor} strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
            <polygon points="20,6 30,30 20,25 10,30" fill="none" stroke={strokeColor} strokeWidth="1.2" />
            <circle cx="20" cy="16" r="2.5" fill={strokeColor} />
            <line x1="6" y1="28" x2="10" y2="28" stroke={midColor} strokeWidth="1" />
            <line x1="30" y1="28" x2="34" y2="28" stroke={midColor} strokeWidth="1" />
            <rect x="19" y="27" width="2" height="4" fill={strokeColor} />
          </svg>
        );
    }
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Grelha de Blueprint Tática Sutil em amberDim */}
      {showBlueprintGrid && (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" style={{ position: "absolute" }}>
            <line x1="0" y1="25" x2="100" y2="25" stroke={dimColor} strokeWidth="0.5" strokeDasharray="2 2" opacity="0.25" />
            <line x1="0" y1="50" x2="100" y2="50" stroke={dimColor} strokeWidth="0.5" strokeDasharray="2 2" opacity="0.25" />
            <line x1="0" y1="75" x2="100" y2="75" stroke={dimColor} strokeWidth="0.5" strokeDasharray="2 2" opacity="0.25" />
            <line x1="25" y1="0" x2="25" y2="100" stroke={dimColor} strokeWidth="0.5" strokeDasharray="2 2" opacity="0.25" />
            <line x1="50" y1="0" x2="50" y2="100" stroke={dimColor} strokeWidth="0.5" strokeDasharray="2 2" opacity="0.25" />
            <line x1="75" y1="0" x2="75" y2="100" stroke={dimColor} strokeWidth="0.5" strokeDasharray="2 2" opacity="0.25" />
          </svg>
        </View>
      )}

      {renderShipShape()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    backgroundColor: "transparent",
  },
});

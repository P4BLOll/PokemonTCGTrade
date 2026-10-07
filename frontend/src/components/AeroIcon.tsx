import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { DesignTokens } from "@/constants/Tokens";

export interface AeroIconProps {
  name: string;
  size?: number;
  color?: any;
  style?: any;
}

/**
 * AeroIcon: Componente de Ícones Aeroespaciais Resiliente.
 * No ambiente Web, renderiza gráficos vetoriais SVG nítidos e puros com estética técnica e cantos retos.
 * Conforme ao tema monocromático Âmbar do kernel AERO-OS v5.0.
 */
export const AeroIcon: React.FC<AeroIconProps> = ({
  name,
  size = 16,
  color = DesignTokens.colors.amber,
  style,
}) => {
  const normalized = (name || "")
    .toLowerCase()
    .replace("-outline", "")
    .replace("-sharp", "");

  if (Platform.OS === "web") {
    const strokeColor = typeof color === "string" ? color : DesignTokens.colors.amber;

    const renderSvgContent = () => {
      switch (normalized) {
        case "radio":
        case "radar":
          return (
            <>
              <circle cx="12" cy="12" r="3" fill={strokeColor} />
              <path
                d="M6 12a6 6 0 0 1 12 0M2 12a10 10 0 0 1 20 0"
                stroke={strokeColor}
                strokeWidth="2"
                strokeLinecap="square"
                fill="none"
              />
            </>
          );

        case "grid":
          return (
            <>
              <rect x="3" y="3" width="7" height="7" fill="none" stroke={strokeColor} strokeWidth="2" />
              <rect x="14" y="3" width="7" height="7" fill="none" stroke={strokeColor} strokeWidth="2" />
              <rect x="3" y="14" width="7" height="7" fill="none" stroke={strokeColor} strokeWidth="2" />
              <rect x="14" y="14" width="7" height="7" fill="none" stroke={strokeColor} strokeWidth="2" />
            </>
          );

        case "swap-horizontal":
        case "swap":
          return (
            <path
              d="M4 8h14M14 4l4 4-4 4M20 16H6M10 12l-4 4 4 4"
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinecap="square"
              fill="none"
            />
          );

        case "pulse":
          return (
            <polyline
              points="2,12 6,12 9,4 13,20 16,9 18,14 22,12"
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinecap="square"
              strokeLinejoin="miter"
              fill="none"
            />
          );

        case "power":
          return (
            <>
              <line x1="12" y1="2" x2="12" y2="11" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="square" />
              <path
                d="M6.3 5.5a8.5 8.5 0 1 0 11.4 0"
                stroke={strokeColor}
                strokeWidth="2"
                strokeLinecap="square"
                fill="none"
              />
            </>
          );

        case "hardware-chip":
        case "chip":
          return (
            <>
              <rect x="6" y="6" width="12" height="12" fill="none" stroke={strokeColor} strokeWidth="2" />
              <rect x="9" y="9" width="6" height="6" fill={strokeColor} />
              <path
                d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"
                stroke={strokeColor}
                strokeWidth="1.5"
                strokeLinecap="square"
              />
            </>
          );

        case "person":
        case "person-circle":
          return (
            <>
              <circle cx="12" cy="8" r="4" fill="none" stroke={strokeColor} strokeWidth="2" />
              <path
                d="M4 20c0-4 4-6 8-6s8 2 8 6"
                stroke={strokeColor}
                strokeWidth="2"
                strokeLinecap="square"
                fill="none"
              />
              <circle cx="12" cy="12" r="11" fill="none" stroke={strokeColor} strokeWidth="1" opacity="0.3" />
            </>
          );

        case "flash":
          return (
            <polygon
              points="13,2 4,13 11,13 11,22 20,9 13,9"
              fill={strokeColor}
              stroke={strokeColor}
              strokeWidth="1"
            />
          );

        case "add":
        case "plus":
          return (
            <>
              <line x1="12" y1="4" x2="12" y2="20" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="square" />
              <line x1="4" y1="12" x2="20" y2="12" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="square" />
            </>
          );

        case "close":
        case "x":
          return (
            <>
              <line x1="5" y1="5" x2="19" y2="19" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="square" />
              <line x1="19" y1="5" x2="5" y2="19" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="square" />
            </>
          );

        case "close-circle":
          return (
            <>
              <circle cx="12" cy="12" r="9" stroke={strokeColor} strokeWidth="2" fill="none" />
              <line x1="8" y1="8" x2="16" y2="16" stroke={strokeColor} strokeWidth="2" strokeLinecap="square" />
              <line x1="16" y1="8" x2="8" y2="16" stroke={strokeColor} strokeWidth="2" strokeLinecap="square" />
            </>
          );

        case "checkmark":
        case "check":
          return (
            <polyline
              points="4,12 9,17 20,5"
              stroke={strokeColor}
              strokeWidth="2.5"
              strokeLinecap="square"
              strokeLinejoin="miter"
              fill="none"
            />
          );

        case "checkmark-circle":
        case "check-circle":
          return (
            <>
              <circle cx="12" cy="12" r="9" stroke={strokeColor} strokeWidth="2" fill="none" />
              <polyline
                points="8,12 11,15 16,8"
                stroke={strokeColor}
                strokeWidth="2"
                strokeLinecap="square"
                strokeLinejoin="miter"
                fill="none"
              />
            </>
          );

        case "trash-bin":
        case "trash":
          return (
            <>
              <path d="M3 6h18M8 6V3h8v3M19 6v14H5V6" stroke={strokeColor} strokeWidth="2" strokeLinecap="square" fill="none" />
              <line x1="10" y1="10" x2="10" y2="16" stroke={strokeColor} strokeWidth="1.5" />
              <line x1="14" y1="10" x2="14" y2="16" stroke={strokeColor} strokeWidth="1.5" />
            </>
          );

        case "send":
          return (
            <polygon points="2,21 23,12 2,3 2,10 13,12 2,14" fill={strokeColor} />
          );

        case "warning":
        case "alert":
        case "alert-circle":
        case "alert-triangle":
          return (
            <>
              <polygon points="12,2 23,21 1,21" fill="none" stroke={strokeColor} strokeWidth="2" strokeLinejoin="miter" />
              <line x1="12" y1="8" x2="12" y2="14" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="square" />
              <circle cx="12" cy="18" r="1.5" fill={strokeColor} />
            </>
          );

        case "info":
        case "information":
        case "information-circle":
          return (
            <>
              <circle cx="12" cy="12" r="9" stroke={strokeColor} strokeWidth="2" fill="none" />
              <rect x="11" y="7" width="2" height="2" fill={strokeColor} />
              <line x1="12" y1="11" x2="12" y2="17" stroke={strokeColor} strokeWidth="2" strokeLinecap="square" />
            </>
          );

        case "key":
          return (
            <>
              <circle cx="8" cy="15" r="4.5" fill="none" stroke={strokeColor} strokeWidth="2" />
              <path d="M11 12l10-10M17 6l2 2M14 9l2 2" stroke={strokeColor} strokeWidth="2" strokeLinecap="square" />
            </>
          );

        case "shield":
        case "shield-checkmark":
          return (
            <>
              <path
                d="M12 2L4 5v6c0 5.5 3.8 10.5 8 12 4.2-1.5 8-6.5 8-12V5l-8-3z"
                fill="none"
                stroke={strokeColor}
                strokeWidth="2"
                strokeLinejoin="miter"
              />
              <polyline
                points="8,12 11,15 16,8"
                stroke={strokeColor}
                strokeWidth="2"
                strokeLinecap="square"
                strokeLinejoin="miter"
                fill="none"
              />
            </>
          );

        case "arrow-back":
          return (
            <path
              d="M19 12H5M12 19l-7-7 7-7"
              stroke={strokeColor}
              strokeWidth="2.5"
              strokeLinecap="square"
              fill="none"
            />
          );

        case "arrow-forward":
          return (
            <path
              d="M5 12h14M12 5l7 7-7 7"
              stroke={strokeColor}
              strokeWidth="2.5"
              strokeLinecap="square"
              fill="none"
            />
          );

        case "file-tray":
          return (
            <>
              <path
                d="M3 4h18v12h-4l-2 4H9l-2-4H3V4z"
                fill="none"
                stroke={strokeColor}
                strokeWidth="2"
                strokeLinejoin="miter"
              />
              <line x1="7" y1="8" x2="17" y2="8" stroke={strokeColor} strokeWidth="1.5" />
            </>
          );

        case "credit":
        case "credits":
        case "hex":
        case "currency":
          return (
            <>
              <polygon
                points="12,2 21,7 21,17 12,22 3,17 3,7"
                fill="none"
                stroke={strokeColor}
                strokeWidth="2"
                strokeLinejoin="miter"
              />
              <polygon
                points="12,8 16,10.3 16,13.7 12,16 8,13.7 8,10.3"
                fill={strokeColor}
              />
            </>
          );

        case "cube":
        case "box":
          return (
            <>
              <path
                d="M12 2l9 5v10l-9 5-9-5V7l9-5z"
                stroke={strokeColor}
                strokeWidth="1.8"
                fill="none"
                strokeLinejoin="miter"
              />
              <path d="M12 12l9-5M12 12v10M12 12L3 7" stroke={strokeColor} strokeWidth="1.8" />
            </>
          );

        case "planet":
          return (
            <>
              <circle cx="12" cy="12" r="6" stroke={strokeColor} strokeWidth="2" fill="none" />
              <ellipse
                cx="12"
                cy="12"
                rx="10"
                ry="3"
                stroke={strokeColor}
                strokeWidth="1.5"
                fill="none"
                transform="rotate(-20 12 12)"
              />
            </>
          );

        case "navigate":
          return (
            <polygon
              points="12,2 19,21 12,17 5,21"
              fill="none"
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinejoin="miter"
            />
          );

        case "settings":
        case "cog":
        case "gear":
          return (
            <>
              <circle cx="12" cy="12" r="3.5" stroke={strokeColor} strokeWidth="2" fill="none" />
              <path
                d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1l2.1-2.1M17 7l2.1-2.1"
                stroke={strokeColor}
                strokeWidth="2"
                strokeLinecap="square"
              />
            </>
          );

        case "search":
          return (
            <>
              <circle cx="10" cy="10" r="6" stroke={strokeColor} strokeWidth="2" fill="none" />
              <line x1="14.5" y1="14.5" x2="20" y2="20" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="square" />
            </>
          );

        case "refresh":
        case "sync":
          return (
            <>
              <path
                d="M20 12A8 8 0 0 1 5.9 17.5M4 12A8 8 0 0 1 18.1 6.5"
                stroke={strokeColor}
                strokeWidth="2"
                strokeLinecap="square"
                fill="none"
              />
              <polyline points="18,3 18,7 14,7" stroke={strokeColor} strokeWidth="2" strokeLinecap="square" fill="none" />
              <polyline points="6,21 6,17 10,17" stroke={strokeColor} strokeWidth="2" strokeLinecap="square" fill="none" />
            </>
          );

        case "lock":
        case "lock-closed":
          return (
            <>
              <rect x="5" y="11" width="14" height="10" stroke={strokeColor} strokeWidth="2" fill="none" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke={strokeColor} strokeWidth="2" fill="none" />
              <circle cx="12" cy="16" r="1.5" fill={strokeColor} />
            </>
          );

        case "lock-open":
          return (
            <>
              <rect x="5" y="11" width="14" height="10" stroke={strokeColor} strokeWidth="2" fill="none" />
              <path d="M8 11V7a4 4 0 0 1 8 0" stroke={strokeColor} strokeWidth="2" fill="none" />
              <circle cx="12" cy="16" r="1.5" fill={strokeColor} />
            </>
          );

        case "time":
        case "clock":
        case "timer":
          return (
            <>
              <circle cx="12" cy="12" r="9" stroke={strokeColor} strokeWidth="2" fill="none" />
              <polyline points="12,7 12,12 16,14" stroke={strokeColor} strokeWidth="2" strokeLinecap="square" fill="none" />
            </>
          );

        case "heart":
          return (
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill={strokeColor}
            />
          );

        case "star":
          return (
            <polygon
              points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9"
              fill="none"
              stroke={strokeColor}
              strokeWidth="1.8"
              strokeLinejoin="miter"
            />
          );

        case "rocket":
        case "ship":
          return (
            <>
              <path d="M12 2c3 3 5 8 5 13l-5 3-5-3c0-5 2-10 5-13z" stroke={strokeColor} strokeWidth="1.8" fill="none" />
              <polygon points="7,15 2,18 4,21 8,18" stroke={strokeColor} strokeWidth="1.5" fill="none" />
              <polygon points="17,15 22,18 20,21 16,18" stroke={strokeColor} strokeWidth="1.5" fill="none" />
              <rect x="11" y="18" width="2" height="4" fill={strokeColor} />
            </>
          );

        case "chevron-down":
          return (
            <polyline
              points="6,9 12,15 18,9"
              stroke={strokeColor}
              strokeWidth="2.5"
              strokeLinecap="square"
              fill="none"
            />
          );

        case "chevron-up":
          return (
            <polyline
              points="6,15 12,9 18,15"
              stroke={strokeColor}
              strokeWidth="2.5"
              strokeLinecap="square"
              fill="none"
            />
          );

        case "chevron-forward":
          return (
            <polyline
              points="9,6 15,12 9,18"
              stroke={strokeColor}
              strokeWidth="2.5"
              strokeLinecap="square"
              fill="none"
            />
          );

        case "chevron-back":
          return (
            <polyline
              points="15,6 9,12 15,18"
              stroke={strokeColor}
              strokeWidth="2.5"
              strokeLinecap="square"
              fill="none"
            />
          );

        default:
          return (
            <>
              <polygon
                points="12,3 21,12 12,21 3,12"
                fill="none"
                stroke={strokeColor}
                strokeWidth="1.8"
              />
              <circle cx="12" cy="12" r="2.5" fill={strokeColor} />
            </>
          );
      }
    };

    return (
      <View style={[styles.iconWrapper, { width: size, height: size }, style]}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: "block" }}
        >
          {renderSvgContent()}
        </svg>
      </View>
    );
  }

  // Fallback para Native
  return <Ionicons name={name as any} size={size} color={color} style={style} />;
};

const styles = StyleSheet.create({
  iconWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
});

import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, useWindowDimensions } from "react-native";
import { router, usePathname } from "expo-router";
import { DesignTokens, glowText } from "@/constants/Tokens";
import { TerminalLabels } from "@/constants/Labels";
import { useAuth } from "@/context/AuthContext";
import { useCrt } from "@/context/CrtContext";
import { ConfirmModal } from "../ConfirmModal";
import { AeroIcon } from "../AeroIcon";
import { styles } from "./styles";

interface Props {
  stationCode?: string;
  activeSector?: string;
  title?: string;
  subtitle?: string;
  badgeText?: string;
}

const OPERATIONAL_CONSOLES = [
  { id: "01", name: "OPS_CENTER", path: "/(tabs)" as const, label: "01 // CENTRO DE OPERAÇÕES", icon: "radar" },
  { id: "02", name: "DOCK_BAYS", path: "/(tabs)/docks" as const, label: "02 // DOCAS & ATIVOS", icon: "grid" },
  { id: "03", name: "DISPATCH_BUS", path: "/(tabs)/dispatch" as const, label: "03 // ESTAÇÃO CENTRAL & DESPACHO", icon: "send" },
  { id: "04", name: "TELEMETRY", path: "/(tabs)/profile" as const, label: "04 // TELEMETRIA", icon: "pulse" },
];

export const Header: React.FC<Props> = ({
  stationCode = "ORBITAL ALPHA-7",
  activeSector = "SETOR KRONOS // DEFCON 4",
}) => {
  const { user, signOut, isAdmin } = useAuth();
  const { width } = useWindowDimensions();
  const pathname = usePathname();
  const { mode: crtMode, cycleMode } = useCrt();
  const isDesktop = width >= DesignTokens.breakpoints.desktop;
  const isSmallMobile = width < 480;

  const [cursorVisible, setCursorVisible] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (mediaQuery.matches) {
        setCursorVisible(true);
        return;
      }
    }

    const interval = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 530);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          (activeEl as HTMLElement).isContentEditable);
      if (isInput) return;

      if (e.key === "1") {
        router.push("/(tabs)");
      } else if (e.key === "2") {
        router.push("/(tabs)/docks");
      } else if (e.key === "3") {
        router.push("/(tabs)/dispatch");
      } else if (e.key === "4") {
        router.push("/(tabs)/profile");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const isTabActive = (consolePath: string) => {
    if (consolePath === "/(tabs)") {
      return pathname === "/(tabs)" || pathname === "/" || pathname === "";
    }
    const rawPath = consolePath.replace("/(tabs)", "");
    return pathname === consolePath || pathname === rawPath;
  };

  const getCrtLabel = () => {
    switch (crtMode) {
      case "FULL":
        return TerminalLabels.crtModes.full;
      case "SUBTLE":
        return TerminalLabels.crtModes.subtle;
      case "OFF":
      default:
        return TerminalLabels.crtModes.off;
    }
  };

  return (
    <View style={styles.headerContainer} accessibilityRole="header">
      <View style={[styles.hudTopBar, isSmallMobile && styles.hudTopBarMobile]}>
        <View style={styles.hudLeft}>
          <View style={styles.sysStatusIndicator}>
            <Text style={styles.promptPrefix}>::</Text>
            <Text style={[styles.sysStatusText, glowText("body")]}>
              {TerminalLabels.system.kernelVer} {cursorVisible ? "_" : " "}
            </Text>
          </View>
          <View style={styles.vDivider} />
          <Text style={styles.stationLabel}>STATION: {stationCode}</Text>
          {!isSmallMobile && (
            <>
              <View style={styles.vDivider} />
              <Text style={styles.sectorLabel}>{activeSector}</Text>
            </>
          )}
        </View>

        <View style={styles.hudRight}>
          <Text style={styles.hudMetric}>
            REACTOR: <Text style={[styles.hudMetricValue, glowText("body")]}>{TerminalLabels.system.reactorStable}</Text>
          </Text>
          {!isSmallMobile && (
            <>
              <View style={styles.vDivider} />
              <Text style={styles.hudMetric}>
                DISPATCH BUS: <Text style={styles.hudMetricValue}>{TerminalLabels.system.syncStatus}</Text>
              </Text>
              <View style={styles.vDivider} />
              <Text style={styles.hudMetric}>
                {isAdmin ? (
                  <>QUEUE: <Text style={styles.hudMetricAmber}>3 PENDING</Text></>
                ) : (
                  <>STATUS: <Text style={styles.hudMetricAmber}>ONLINE</Text></>
                )}
              </Text>
            </>
          )}
        </View>
      </View>

      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.logoBtn}
          onPress={() => router.push("/(tabs)")}
          accessibilityRole="link"
          accessibilityLabel="Ir para o Centro de Operações"
        >
          <View style={styles.terminalIconBox}>
            <Text style={[styles.terminalIconText, glowText("title")]}>[#]</Text>
          </View>
          <View>
            <Text style={[styles.logoTitle, glowText("title")]}>AERO-OS</Text>
            <Text style={styles.logoSub}>HANGAR OPERATIONS KERNEL</Text>
          </View>
        </TouchableOpacity>

        {isDesktop && (
          <View style={styles.consoleTabsGroup}>
            {OPERATIONAL_CONSOLES.map((console) => {
              const isActive = isTabActive(console.path);

              return (
                <TouchableOpacity
                  key={console.id}
                  style={[styles.consoleTab, isActive && styles.consoleTabActive]}
                  onPress={() => router.push(console.path)}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: isActive }}
                  accessibilityLabel={console.label}
                >
                  <AeroIcon
                    name={console.icon}
                    size={13}
                    color={isActive ? DesignTokens.colors.bgDeep : DesignTokens.colors.textPrimary}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={[styles.tabPrefix, isActive && styles.tabPrefixActive]}>
                    {isActive ? "> " : "  "}
                  </Text>
                  <Text style={[styles.consoleTabNumber, isActive && styles.consoleTabNumberActive]}>
                    {console.id}
                  </Text>
                  <Text
                    style={[
                      styles.consoleTabText,
                      isActive ? styles.consoleTabTextActive : styles.consoleTabTextInactive,
                    ]}
                  >
                    {console.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View style={styles.officerSection}>
          <TouchableOpacity
            style={styles.crtToggleBtn}
            onPress={cycleMode}
            accessibilityRole="button"
            accessibilityLabel={`Alternar modo CRT: atual ${getCrtLabel()}`}
          >
            <Text style={styles.crtToggleLabel}>CRT:</Text>
            <Text style={[styles.crtToggleValue, glowText("body")]}>{getCrtLabel()}</Text>
          </TouchableOpacity>

          <View style={styles.officerBadge}>
            <Text style={[styles.officerRank, glowText("body")]}>CMD</Text>
            <Text style={styles.officerCallsign}>@{user || "GUEST_PILOT"}</Text>
          </View>

          <TouchableOpacity
            style={styles.logoutTerminalBtn}
            onPress={() => setShowLogoutModal(true)}
            accessibilityRole="button"
            accessibilityLabel="Encerrar sessão de comando"
          >
            <AeroIcon name="power" size={13} color={DesignTokens.colors.alert} />
            {isDesktop && <Text style={styles.logoutBtnText}>LOGOUT</Text>}
          </TouchableOpacity>
        </View>
      </View>

      <ConfirmModal
        visible={showLogoutModal}
        title={TerminalLabels.modals.confirmLogoutTitle}
        message={TerminalLabels.modals.confirmLogoutDesc}
        confirmText={TerminalLabels.actions.logout}
        cancelText={TerminalLabels.actions.cancel}
        isDangerous
        onConfirm={() => {
          setShowLogoutModal(false);
          signOut();
        }}
        onCancel={() => setShowLogoutModal(false)}
      />
    </View>
  );
};

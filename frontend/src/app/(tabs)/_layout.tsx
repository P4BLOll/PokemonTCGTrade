import React from "react";
import { Tabs } from "expo-router";
import { useWindowDimensions } from "react-native";
import { DesignTokens } from "@/constants/Tokens";
import { AeroIcon } from "@/components/AeroIcon";
import { useAuth } from "@/context/AuthContext";

export default function TabsLayout() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= DesignTokens.breakpoints.desktop;
  const { isAdmin } = useAuth();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          display: isDesktop ? "none" : "flex",
          backgroundColor: DesignTokens.colors.bgDeep,
          borderTopColor: DesignTokens.colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 6,
          paddingTop: 6,
        },
        tabBarItemStyle: {
          justifyContent: "center",
          alignItems: "center",
        },
        tabBarActiveTintColor: DesignTokens.colors.amber,
        tabBarInactiveTintColor: DesignTokens.colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: DesignTokens.typography.fonts.mono,
          fontWeight: "700",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "01 OPS",
          tabBarAccessibilityLabel: "01 Centro de Operações",
          tabBarIcon: ({ color, size }) => (
            <AeroIcon name="radar" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="docks"
        options={{
          title: "02 DOCAS",
          tabBarAccessibilityLabel: "02 Docas e Ativos",
          tabBarIcon: ({ color, size }) => (
            <AeroIcon name="grid" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="dispatch"
        options={{
          title: "03 DESPACHO",
          tabBarAccessibilityLabel: "03 Estação Central & Despacho",
          tabBarIcon: ({ color, size }) => (
            <AeroIcon name="send" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: isAdmin ? "04 RELATÓRIOS" : "04 RELAT [🔒]",
          tabBarAccessibilityLabel: "04 Relatórios e Telemetria",
          tabBarIcon: ({ color, size }) => (
            <AeroIcon name={isAdmin ? "pulse" : "lock-closed"} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
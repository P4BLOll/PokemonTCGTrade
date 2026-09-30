import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useWindowDimensions } from "react-native";
import { DesignTokens } from "@/constants/Tokens";

export default function TabsLayout() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 860;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          display: isDesktop ? "none" : "flex",
          backgroundColor: DesignTokens.colors.bgSurface,
          borderTopColor: DesignTokens.colors.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarItemStyle: {
          minHeight: 44,
          justifyContent: "center",
          alignItems: "center",
        },
        tabBarActiveTintColor: DesignTokens.colors.brandRed,
        tabBarInactiveTintColor: DesignTokens.colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Catálogo",
          tabBarAccessibilityLabel: "Catálogo de Cartas",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="albums-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="binder"
        options={{
          title: "Minha Coleção",
          tabBarAccessibilityLabel: "Minha Coleção de Cartas",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="folder-open-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="trades"
        options={{
          title: "Trocas",
          tabBarAccessibilityLabel: "Central de Trocas",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="swap-horizontal-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarAccessibilityLabel: "Perfil do Treinador",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
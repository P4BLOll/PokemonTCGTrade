import React, { useEffect } from "react";
import { ActivityIndicator, View, Platform } from "react-native";
import { Stack, router, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Colors } from "@/constants/Colors";
import { CSS_DESIGN_TOKENS } from "@/constants/Tokens";

function NavigationGuard() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.background } }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === "web" && typeof document !== "undefined") {
      // Injeta fontes do Google (Rajdhani para títulos/cards/preços gamer, Inter para UI, JetBrains Mono para IDs)
      if (!document.getElementById("pokemon-tcg-fonts")) {
        const link = document.createElement("link");
        link.id = "pokemon-tcg-fonts";
        link.rel = "stylesheet";
        link.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&family=Rajdhani:wght@500;600;700&display=swap";
        document.head.appendChild(link);
      }

      // Injeta variáveis CSS oficiais
      if (!document.getElementById("pokemon-tcg-tokens")) {
        const style = document.createElement("style");
        style.id = "pokemon-tcg-tokens";
        style.innerHTML = CSS_DESIGN_TOKENS;
        document.head.appendChild(style);
      }
    }
  }, []);

  return (
    <AuthProvider>
      <StatusBar style="light" />
      <NavigationGuard />
    </AuthProvider>
  );
}

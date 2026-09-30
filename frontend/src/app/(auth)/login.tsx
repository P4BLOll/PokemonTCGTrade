import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { DesignTokens } from "@/constants/Tokens";
import { useAuth } from "@/context/AuthContext";

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setErrorMsg(null);
    if (!username.trim() || !password.trim()) {
      setErrorMsg("Por favor, preencha o nome de usuário e senha.");
      return;
    }

    setLoading(true);
    const result = await signIn(username, password);
    setLoading(false);

    if (!result.success) {
      setErrorMsg(result.message || "Credenciais inválidas.");
    } else {
      router.replace("/(tabs)");
    }
  };

  const quickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setErrorMsg(null);
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.cardWrapper}>
        {/* Seção da Logo / Identidade */}
        <View style={styles.logoSection}>
          <View style={styles.iconCircle}>
            <View style={styles.pokeballTop} />
            <View style={styles.pokeballLine} />
            <View style={styles.pokeballCenterDot} />
            <View style={styles.pokeballBottom} />
          </View>
          <Text style={styles.title}>POKÉMON TCG</Text>
          <Text style={styles.subtitle}>Plataforma Distribuída de Troca de Cartas</Text>

          <View style={styles.gatewayBadge}>
            <View style={styles.gatewayDot} />
            <Text style={styles.gatewayBadgeText}>API Gateway :8080 • Online</Text>
          </View>
        </View>

        {/* Formulário Principal */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Acessar Conta de Treinador</Text>

          {errorMsg ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color={DesignTokens.colors.danger} style={{ marginRight: 8 }} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome de Treinador</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={18} color={DesignTokens.colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="ex: ash, misty, brock"
                placeholderTextColor={DesignTokens.colors.textMuted}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha de Acesso</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={18} color={DesignTokens.colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Digite sua senha"
                placeholderTextColor={DesignTokens.colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="log-in-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.loginBtnText}>ENTRAR NO APLICATIVO</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Quick Fill para testes da banca/professor */}
          <View style={styles.quickSection}>
            <Text style={styles.quickTitle}>Contas Pré-Cadastradas para Testes (1 Clique):</Text>
            <View style={styles.quickRow}>
              <TouchableOpacity style={styles.quickChip} onPress={() => quickFill("ash", "123456")}>
                <Ionicons name="flash-outline" size={12} color={DesignTokens.colors.brandRed} style={{ marginRight: 4 }} />
                <Text style={styles.quickChipText}>Ash</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickChip} onPress={() => quickFill("misty", "123456")}>
                <Ionicons name="flash-outline" size={12} color={DesignTokens.colors.brandRed} style={{ marginRight: 4 }} />
                <Text style={styles.quickChipText}>Misty</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickChip} onPress={() => quickFill("brock", "123456")}>
                <Ionicons name="flash-outline" size={12} color={DesignTokens.colors.brandRed} style={{ marginRight: 4 }} />
                <Text style={styles.quickChipText}>Brock</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickChip} onPress={() => quickFill("admin", "admin123")}>
                <Ionicons name="shield-outline" size={12} color={DesignTokens.colors.accentGold} style={{ marginRight: 4 }} />
                <Text style={styles.quickChipText}>Admin</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Ainda não tem conta de treinador? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
              <Text style={styles.footerLink}>Cadastre-se aqui</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: DesignTokens.colors.bgBase,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  cardWrapper: {
    width: "100%",
    maxWidth: 460,
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: DesignTokens.colors.bgSurface,
    borderWidth: 2,
    borderColor: DesignTokens.colors.border,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    position: "relative",
    overflow: "hidden",
    ...(Platform.OS === "web" ? { boxShadow: "0 4px 20px rgba(238, 21, 21, 0.2)" } : {}),
  } as any,
  pokeballTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 32,
    backgroundColor: DesignTokens.colors.brandRed,
  },
  pokeballBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 32,
    backgroundColor: "#F5F6F8",
  },
  pokeballLine: {
    position: "absolute",
    top: 30,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: "#16181D",
    zIndex: 2,
  },
  pokeballCenterDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 3,
    borderColor: "#16181D",
    zIndex: 3,
  },
  title: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    fontSize: 28,
    fontWeight: "900",
    color: DesignTokens.colors.textPrimary,
    letterSpacing: 1.5,
  },
  subtitle: {
    fontFamily: DesignTokens.typography.fontFamily,
    fontSize: 13,
    color: DesignTokens.colors.textSecondary,
    marginTop: 4,
    textAlign: "center",
  },
  gatewayBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DesignTokens.colors.bgSurface,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: DesignTokens.radii.chip,
    marginTop: 12,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
    gap: 6,
  },
  gatewayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: DesignTokens.colors.success,
  },
  gatewayBadgeText: {
    fontSize: 11,
    color: DesignTokens.colors.textSecondary,
    fontWeight: "700",
    fontFamily: DesignTokens.typography.fontFamilyMono,
  },
  formCard: {
    backgroundColor: DesignTokens.colors.bgSurface,
    borderRadius: DesignTokens.radii.card,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
    padding: 28,
  },
  formTitle: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    fontSize: 18,
    fontWeight: "800",
    color: DesignTokens.colors.textPrimary,
    marginBottom: 20,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 90, 95, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(255, 90, 95, 0.3)",
    padding: 12,
    borderRadius: DesignTokens.radii.button,
    marginBottom: 16,
  },
  errorText: {
    color: DesignTokens.colors.danger,
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: DesignTokens.colors.textSecondary,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DesignTokens.colors.bgElevated,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
    borderRadius: DesignTokens.radii.button,
    paddingHorizontal: 14,
    height: 46,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: DesignTokens.colors.textPrimary,
    fontSize: 14,
  },
  loginBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DesignTokens.colors.brandRed,
    paddingVertical: 14,
    borderRadius: DesignTokens.radii.button,
    marginTop: 8,
  },
  loginBtnText: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 15,
    letterSpacing: 0.5,
  },
  quickSection: {
    marginTop: 22,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: DesignTokens.colors.border,
  },
  quickTitle: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    fontSize: 12,
    fontWeight: "700",
    color: DesignTokens.colors.textMuted,
    marginBottom: 10,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  quickRow: {
    flexDirection: "row",
    gap: 8,
  },
  quickChip: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: DesignTokens.colors.bgElevated,
    paddingVertical: 8,
    borderRadius: DesignTokens.radii.chip,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  quickChipText: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    color: DesignTokens.colors.textPrimary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 22,
    alignItems: "center",
  },
  footerText: {
    color: DesignTokens.colors.textSecondary,
    fontSize: 13,
  },
  footerLink: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    color: DesignTokens.colors.brandRed,
    fontWeight: "800",
    fontSize: 14,
    letterSpacing: 0.3,
  },
});
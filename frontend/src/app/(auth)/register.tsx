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

export default function RegisterScreen() {
  const { signUp, signIn } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setErrorMsg(null);
    if (!username.trim() || !password.trim()) {
      setErrorMsg("Por favor preencha todos os campos.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("A confirmação de senha não confere.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("A senha deve possuir no mínimo 6 caracteres.");
      return;
    }

    setLoading(true);
    const res = await signUp(username, password);

    if (res.success) {
      // Auto login
      await signIn(username, password);
      router.replace("/(tabs)");
    } else {
      setLoading(false);
      setErrorMsg(res.message || "Não foi possível criar o usuário.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.cardWrapper}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={DesignTokens.colors.textPrimary} />
          <Text style={styles.backBtnText}>Voltar ao Login</Text>
        </TouchableOpacity>

        <View style={styles.headerSection}>
          <Text style={styles.title}>NOVO TREINADOR</Text>
          <Text style={styles.subtitle}>Crie sua conta para colecionar e negociar cartas TCG</Text>
        </View>

        <View style={styles.formCard}>
          {errorMsg ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color={DesignTokens.colors.danger} style={{ marginRight: 8 }} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome de Treinador (Username)</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={18} color={DesignTokens.colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="ex: red, blue, cynthia"
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
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor={DesignTokens.colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirmar Senha</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="shield-checkmark-outline" size={18} color={DesignTokens.colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Repita sua senha"
                placeholderTextColor={DesignTokens.colors.textMuted}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>
          </View>

          <TouchableOpacity style={styles.registerBtn} onPress={handleRegister} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.registerBtnText}>CRIAR CONTA DE TREINADOR</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Já possui uma conta? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.footerLink}>Fazer Login</Text>
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
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    alignSelf: "flex-start",
    gap: 6,
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: DesignTokens.colors.textPrimary,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    fontSize: 26,
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
  formCard: {
    backgroundColor: DesignTokens.colors.bgSurface,
    borderRadius: DesignTokens.radii.card,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
    padding: 28,
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
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    fontSize: 13,
    fontWeight: "700",
    color: DesignTokens.colors.textSecondary,
    marginBottom: 6,
    letterSpacing: 0.3,
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
  registerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DesignTokens.colors.brandRed,
    paddingVertical: 14,
    borderRadius: DesignTokens.radii.button,
    marginTop: 10,
  },
  registerBtnText: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 15,
    letterSpacing: 0.5,
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

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { DesignTokens, glowText } from "@/constants/Tokens";
import { useAuth } from "@/context/AuthContext";
import { AeroIcon } from "@/components/AeroIcon";
import { api } from "@/services/api";

// Tela de Registro: cadastra um novo oficial ou administrador no banco de dados MongoDB via API de Auth
export default function RegisterScreen() {
  const auth = useAuth();
  const [selectedRole, setSelectedRole] = useState<"USER" | "ADMIN">("USER");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const signUp = auth?.signUp || (async (u: string, p: string, r?: string[]) => {
    try {
      await api.post("/login/user/cadastrar", { username: u, password: p, roles: r || ["USER"] });
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || err.message || "Falha ao registrar oficial de frota" };
    }
  });

  const signIn = auth?.signIn || (async (u: string, p: string) => {
    try {
      const res = await api.post("/auth/service/auth", { username: u, password: p });
      return { success: !!res.data?.token };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || err.message || "Falha no login" };
    }
  });

  const handleRegister = async () => {
    setErrorMsg(null);
    if (!username.trim() || !password.trim()) {
      setErrorMsg("[!] ERRO: TODOS OS CAMPOS DE REGISTRO SÃO OBRIGATÓRIOS.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("[!] ERRO: A CONFIRMAÇÃO DO CÓDIGO CIPHER NÃO COINCIDE.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("[!] ERRO: O CÓDIGO CIPHER DEVE CONTER NO MÍNIMO 6 CARACTERES.");
      return;
    }

    setLoading(true);
    const assignedRoles = selectedRole === "ADMIN" ? ["ADMIN", "USER"] : ["USER"];
    const res = await signUp(username.trim().toLowerCase(), password, assignedRoles);

    if (res.success) {
      await signIn(username.trim().toLowerCase(), password);
      router.replace("/(tabs)");
    } else {
      setLoading(false);
      setErrorMsg(res.message || "[!] FALHA NA EMISSÃO: NÃO FOI POSSÍVEL REGISTRAR OFICIAL NO AUTH-SERVICE.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.keyboardRoot}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.terminalCard}>
          {/* TOP STATUS BAR */}
          <View style={styles.terminalTopBar}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <AeroIcon name="arrow-back" size={14} color={DesignTokens.colors.amber} />
              <Text style={styles.backBtnText}>RETORNAR AO TERMINAL</Text>
            </TouchableOpacity>
            <Text style={styles.versionTag}>CLEARANCE_AUTH // NEW_RECRUIT</Text>
          </View>

          {/* MAIN BODY */}
          <View style={styles.formBody}>
            <View style={styles.headerBlock}>
              <Text style={[styles.brandTitle, glowText("title")]}>[ EMISSÃO DE CREDENCIAL ]</Text>
              <Text style={styles.brandSubtitle}>
                REGISTRO DE NOVO PILOTO OU COMANDANTE NO SISTEMA CENTRAL
              </Text>
            </View>

            {/* SELEÇÃO DE PATENTE / ROLE */}
            <View style={styles.roleGroup}>
              <Text style={styles.inputLabel}>SELECIONAR PATENTE / NÍVEL DE ACESSO:</Text>
              <View style={styles.roleRow}>
                <TouchableOpacity
                  style={[
                    styles.roleBtn,
                    selectedRole === "USER" && styles.roleBtnActive,
                  ]}
                  onPress={() => setSelectedRole("USER")}
                >
                  <Text
                    style={[
                      styles.roleBtnText,
                      selectedRole === "USER" && styles.roleBtnTextActive,
                    ]}
                  >
                    [ OFICIAL // USER ]
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.roleBtn,
                    selectedRole === "ADMIN" && styles.roleBtnActive,
                  ]}
                  onPress={() => setSelectedRole("ADMIN")}
                >
                  <Text
                    style={[
                      styles.roleBtnText,
                      selectedRole === "ADMIN" && styles.roleBtnTextActive,
                    ]}
                  >
                    [ COMANDANTE // ADMIN ]
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.roleDesc}>
                {selectedRole === "ADMIN"
                  ? "PATENTE ADMINISTRATIVA: Concede permissão para visualizar relatórios executivos, auditoria e gerenciar a frota (adicionar e remover naves)."
                  : "PATENTE OPERACIONAL: Concede permissão para visualizar docas, requisitar naves e conduzir missões de despacho."}
              </Text>
            </View>

            {errorMsg ? (
              <View style={styles.errorBox}>
                <AeroIcon name="warning" size={16} color={DesignTokens.colors.alert} style={{ marginRight: 8 }} />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            ) : null}

            {/* INPUT: CALLSIGN */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>DEFINIR CALLSIGN DO OFICIAL (USERNAME):</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputPrompt}>new_id:&gt;</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="ex: vance, silva, nova, cmd_alex"
                  placeholderTextColor={DesignTokens.colors.textMuted}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* INPUT: CIPHER */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>CÓDIGO DE ACESSO CIPHER (MÍN. 6 DÍGITOS):</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputPrompt}>cipher:&gt;</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="••••••••"
                  placeholderTextColor={DesignTokens.colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            {/* INPUT: CONFIRM CIPHER */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>CONFIRMAR CÓDIGO CIPHER:</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputPrompt}>verify:&gt;</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="••••••••"
                  placeholderTextColor={DesignTokens.colors.textMuted}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>
            </View>

            {/* SUBMIT BUTTON */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator size="small" color={DesignTokens.colors.bgDeep} />
              ) : (
                <>
                  <AeroIcon name="shield-checkmark" size={16} color={DesignTokens.colors.bgDeep} />
                  <Text style={styles.submitButtonText}>
                    [ EMITIR CREDENCIAL ({selectedRole}) ]
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardRoot: {
    flex: 1,
    backgroundColor: DesignTokens.colors.bgDeep,
  },
  container: {
    flexGrow: 1,
    backgroundColor: DesignTokens.colors.bgDeep,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  terminalCard: {
    width: "100%",
    maxWidth: 520,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: DesignTokens.colors.amberDim,
    borderRadius: 0,
  },
  terminalTopBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "transparent",
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.amberDim,
    borderStyle: "dashed",
    overflow: "hidden",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  backBtnText: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 11,
    color: DesignTokens.colors.amber,
  },
  versionTag: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 11,
    color: DesignTokens.colors.textSecondary,
  },
  formBody: {
    padding: 24,
    gap: 16,
  },
  headerBlock: {
    borderLeftWidth: 1,
    borderLeftColor: DesignTokens.colors.amber,
    paddingLeft: 12,
  },
  brandTitle: {
    fontFamily: DesignTokens.typography.fonts.terminal,
    fontSize: 14,
    color: DesignTokens.colors.textPrimary,
    letterSpacing: 1,
  },
  brandSubtitle: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 11,
    color: DesignTokens.colors.textSecondary,
    marginTop: 4,
  },
  roleGroup: {
    gap: 6,
  },
  roleRow: {
    flexDirection: "row",
    gap: 10,
  },
  roleBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: DesignTokens.colors.amberDim,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  roleBtnActive: {
    borderColor: DesignTokens.colors.amber,
    backgroundColor: "rgba(255, 176, 0, 0.08)",
  },
  roleBtnText: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 11,
    color: DesignTokens.colors.textSecondary,
  },
  roleBtnTextActive: {
    color: DesignTokens.colors.amber,
    fontWeight: "bold",
  },
  roleDesc: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 10,
    color: DesignTokens.colors.textSecondary,
    lineHeight: 14,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: DesignTokens.colors.alert,
    borderRadius: 0,
    padding: 10,
  },
  errorText: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 11,
    color: DesignTokens.colors.alert,
    flex: 1,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 11,
    color: DesignTokens.colors.textPrimary,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: DesignTokens.colors.amberDim,
    borderRadius: 0,
    paddingHorizontal: 10,
    minHeight: 44,
  },
  inputPrompt: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 11,
    color: DesignTokens.colors.textSecondary,
    marginRight: 6,
  },
  textInput: {
    flex: 1,
    paddingVertical: 10,
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 12,
    color: DesignTokens.colors.textPrimary,
  },
  submitButton: {
    backgroundColor: DesignTokens.colors.amber,
    borderWidth: 1,
    borderColor: DesignTokens.colors.amber,
    borderRadius: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    minHeight: 44,
    gap: 8,
    marginTop: 6,
  },
  submitButtonText: {
    fontFamily: DesignTokens.typography.fonts.terminal,
    fontSize: 14,
    color: DesignTokens.colors.bgDeep,
    fontWeight: "bold",
  },
});

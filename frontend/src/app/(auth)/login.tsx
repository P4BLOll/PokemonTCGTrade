import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { DesignTokens, glowText } from "@/constants/Tokens";
import { useAuth } from "@/context/AuthContext";
import { AeroIcon } from "@/components/AeroIcon";

/**
 * LoginScreen: Terminal de Acesso Autenticado ao Kernel Monocromático Âmbar v5.2.
 * - Suporta autenticação para perfis de USER (Oficial de Voo) e ADMIN (Comandante Geral).
 * - Permite alternar perfis rapidamente ou digitar credenciais customizadas.
 */
export default function LoginScreen() {
  const { signIn } = useAuth();
  const [selectedRole, setSelectedRole] = useState<"USER" | "ADMIN">("ADMIN");
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [focusedInput, setFocusedInput] = useState<"username" | "password" | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSelectRole = (role: "USER" | "ADMIN") => {
    setSelectedRole(role);
    setErrorMsg(null);
    if (role === "USER") {
      setUsername("");
      setPassword("");
    } else {
      setUsername("admin");
      setPassword("admin123");
    }
  };

  const handleLogin = async () => {
    setErrorMsg(null);
    if (!username.trim() || !password.trim()) {
      setErrorMsg("[!] ERRO DE ACESSO: CALLSIGN E CÓDIGO CIPHER SÃO OBRIGATÓRIOS.");
      return;
    }

    setLoading(true);
    const result = await signIn(username.trim().toLowerCase(), password);
    setLoading(false);

    if (!result.success) {
      setErrorMsg(result.message || "[!] FALHA NA AUTORIZAÇÃO: CREDENCIAIS NÃO RECONHECIDAS OU INCORRETAS.");
    } else {
      router.replace("/(tabs)");
    }
  };

  return (
    <View style={styles.keyboardRoot}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.terminalCard}>
          {/* TOP STATUS BAR */}
          <View style={styles.terminalTopBar}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={[styles.terminalPrompt, glowText("title")]}>&gt;</Text>
              <Text style={[styles.terminalTitle, glowText("title")]}>
                AERO-OS // KERNEL ACCESS TERMINAL
              </Text>
            </View>
            <Text style={styles.versionTag}>SYS_VER: 5.2.0-AMBER</Text>
          </View>

          {/* SYSTEM STATUS BANNER */}
          <View style={styles.bannerBar}>
            <Text style={styles.bannerText}>
              SISTEMA OPERACIONAL [ONLINE] • CANAL SEGURO [ATIVO] • CONEXÃO ORBITAL [ESTÁVEL]
            </Text>
          </View>

          {/* MAIN BODY */}
          <View style={styles.formBody}>
            <View style={styles.headerBlock}>
              <Text style={[styles.brandTitle, glowText("title")]}>AEROSPACE HANGAR</Text>
              <Text style={styles.brandSubtitle}>
                SISTEMA DE DESPACHO E GERENCIAMENTO DE FROTA INTERESTELAR
              </Text>
            </View>

            {/* SELETOR DE PERFIL / ROLES */}
            <View style={styles.roleSelectorGroup}>
              <Text style={styles.roleSelectorLabel}>SELECIONAR PERFIL DE AUTORIZAÇÃO:</Text>
              <View style={styles.roleButtonsRow}>
                <TouchableOpacity
                  style={[
                    styles.roleTabButton,
                    selectedRole === "USER" && styles.roleTabButtonActive,
                  ]}
                  onPress={() => handleSelectRole("USER")}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.roleTabText,
                      selectedRole === "USER" && styles.roleTabTextActive,
                    ]}
                  >
                    {selectedRole === "USER" ? "[◉] " : "[ ] "}OFICIAL // USER
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.roleTabButton,
                    selectedRole === "ADMIN" && styles.roleTabButtonActive,
                  ]}
                  onPress={() => handleSelectRole("ADMIN")}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.roleTabText,
                      selectedRole === "ADMIN" && styles.roleTabTextActive,
                    ]}
                  >
                    {selectedRole === "ADMIN" ? "[◉] " : "[ ] "}COMANDANTE // ADMIN
                  </Text>
                </TouchableOpacity>
              </View>

              {/* PERMISSION BADGE */}
              <View style={styles.permissionBadgeBox}>
                <Text style={styles.permissionBadgeTitle}>
                  {selectedRole === "ADMIN"
                    ? "CLEARANCE NÍVEL 5 // COMANDANTE GERAL (ROLE_ADMIN)"
                    : "CLEARANCE NÍVEL 1 // OFICIAL OPERACIONAL (ROLE_USER)"}
                </Text>
                <Text style={styles.permissionBadgeDesc}>
                  {selectedRole === "ADMIN"
                    ? "Permissões: Acesso total a Relatórios Executivos, Telemetria, Auditoria, Cadastrar e Remover Naves da Frota."
                    : "Permissões: Despacho de missões, consulta de docas e requisição de naves com lock concorrente atômico."}
                </Text>
              </View>
            </View>

            {errorMsg ? (
              <View style={styles.errorBox}>
                <AeroIcon name="warning" size={14} color={DesignTokens.colors.alert} style={{ marginRight: 8 }} />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            ) : null}

            {/* INPUT: CALLSIGN */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>CALLSIGN DO OFICIAL // USERNAME:</Text>
              <View
                style={[
                  styles.inputWrapper,
                  focusedInput === "username" && styles.inputWrapperFocused,
                ]}
              >
                <Text style={styles.inputPrompt}>usr@kernel:&gt;</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Digite seu callsign ou 'admin'"
                  placeholderTextColor={DesignTokens.colors.textMuted}
                  value={username}
                  onChangeText={(val) => {
                    setUsername(val);
                    if (val.trim().toLowerCase() === "admin") {
                      setSelectedRole("ADMIN");
                    }
                  }}
                  onFocus={() => setFocusedInput("username")}
                  onBlur={() => setFocusedInput(null)}
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* INPUT: PASSWORD */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>CÓDIGO DE ACESSO // CIPHER PASS:</Text>
              <View
                style={[
                  styles.inputWrapper,
                  focusedInput === "password" && styles.inputWrapperFocused,
                ]}
              >
                <Text style={styles.inputPrompt}>key@cipher:&gt;</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="••••••••"
                  placeholderTextColor={DesignTokens.colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setFocusedInput("password")}
                  onBlur={() => setFocusedInput(null)}
                  secureTextEntry
                />
              </View>
            </View>

            {/* SUBMIT BUTTON */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator size="small" color={DesignTokens.colors.bgDeep} />
              ) : (
                <>
                  <AeroIcon name="key" size={14} color={DesignTokens.colors.bgDeep} />
                  <Text style={styles.submitButtonText}>
                    [ AUTORIZAR ACESSO COMO {selectedRole} ]
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* FOOTER */}
            <View style={styles.registerFooter}>
              <Text style={styles.registerPrompt}>NOVO OFICIAL NA ESTAÇÃO?</Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
                <Text style={[styles.registerLink, glowText("body")]}>
                  &gt; SOLICITAR CADASTRO DE PATENTE ::
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
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
    alignItems: "center",
    justifyContent: "center",
    padding: DesignTokens.spacing.base,
  },
  terminalCard: {
    width: "100%",
    maxWidth: 500,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: DesignTokens.colors.amberDim,
    borderRadius: 0,
  },
  terminalTopBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "transparent",
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.amberDim,
    borderStyle: "dashed",
    overflow: "hidden",
    paddingHorizontal: DesignTokens.spacing.md,
    paddingVertical: DesignTokens.spacing.xs,
  },
  terminalPrompt: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: DesignTokens.typography.sizes.xs,
    color: DesignTokens.colors.amber,
    fontWeight: "700",
  },
  terminalTitle: {
    fontFamily: DesignTokens.typography.fonts.terminal,
    fontSize: 14,
    color: DesignTokens.colors.amber,
    letterSpacing: 0.5,
  },
  versionTag: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: DesignTokens.typography.sizes.xs,
    color: DesignTokens.colors.amberMid,
  },
  bannerBar: {
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.amberDim,
    borderStyle: "dashed",
    overflow: "hidden",
    paddingHorizontal: DesignTokens.spacing.md,
    paddingVertical: DesignTokens.spacing.xs,
    backgroundColor: "transparent",
  },
  bannerText: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: DesignTokens.typography.sizes.xs,
    color: DesignTokens.colors.textSecondary,
  },
  formBody: {
    padding: DesignTokens.spacing.lg,
    gap: DesignTokens.spacing.base,
  },
  headerBlock: {
    borderLeftWidth: 1,
    borderLeftColor: DesignTokens.colors.amber,
    paddingLeft: DesignTokens.spacing.sm,
  },
  brandTitle: {
    fontFamily: DesignTokens.typography.fonts.terminal,
    fontSize: DesignTokens.typography.sizes.xl,
    color: DesignTokens.colors.textPrimary,
    letterSpacing: 1,
  },
  brandSubtitle: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: DesignTokens.typography.sizes.xs,
    color: DesignTokens.colors.textSecondary,
    marginTop: 2,
  },
  roleSelectorGroup: {
    gap: DesignTokens.spacing.xs,
    marginTop: DesignTokens.spacing.xs,
  },
  roleSelectorLabel: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: DesignTokens.typography.sizes.xs,
    color: DesignTokens.colors.textSecondary,
  },
  roleButtonsRow: {
    flexDirection: "row",
    gap: DesignTokens.spacing.sm,
  },
  roleTabButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: DesignTokens.colors.amberDim,
    paddingVertical: DesignTokens.spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  roleTabButtonActive: {
    borderColor: DesignTokens.colors.amber,
    backgroundColor: "rgba(255, 176, 0, 0.08)",
  },
  roleTabText: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: DesignTokens.typography.sizes.xs,
    color: DesignTokens.colors.textSecondary,
    fontWeight: "600",
  },
  roleTabTextActive: {
    color: DesignTokens.colors.amber,
    fontWeight: "bold",
  },
  permissionBadgeBox: {
    borderWidth: 1,
    borderColor: DesignTokens.colors.amberDim,
    borderStyle: "dashed",
    padding: DesignTokens.spacing.sm,
    backgroundColor: "transparent",
  },
  permissionBadgeTitle: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: DesignTokens.typography.sizes.xs,
    color: DesignTokens.colors.amber,
    fontWeight: "bold",
  },
  permissionBadgeDesc: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 10,
    color: DesignTokens.colors.textSecondary,
    marginTop: 2,
    lineHeight: 14,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: DesignTokens.colors.alert,
    borderRadius: 0,
    padding: DesignTokens.spacing.sm,
  },
  errorText: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: DesignTokens.typography.sizes.xs,
    color: DesignTokens.colors.alert,
    flex: 1,
  },
  inputGroup: {
    gap: DesignTokens.spacing.xs,
  },
  inputLabel: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: DesignTokens.typography.sizes.xs,
    color: DesignTokens.colors.textPrimary,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: DesignTokens.colors.amberDim,
    borderRadius: 0,
    paddingHorizontal: DesignTokens.spacing.sm,
  },
  inputWrapperFocused: {
    borderColor: DesignTokens.colors.amber,
  },
  inputPrompt: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: DesignTokens.typography.sizes.xs,
    color: DesignTokens.colors.textSecondary,
    marginRight: 6,
  },
  textInput: {
    flex: 1,
    paddingVertical: DesignTokens.spacing.sm,
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: DesignTokens.typography.sizes.sm,
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
    paddingVertical: DesignTokens.spacing.md,
    gap: DesignTokens.spacing.sm,
    marginTop: DesignTokens.spacing.xs,
  },
  submitButtonText: {
    fontFamily: DesignTokens.typography.fonts.terminal,
    fontSize: 14,
    color: DesignTokens.colors.bgDeep,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  registerFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: DesignTokens.colors.amberDim,
    borderStyle: "dashed",
    overflow: "hidden",
    paddingTop: DesignTokens.spacing.md,
    marginTop: DesignTokens.spacing.xs,
  },
  registerPrompt: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: DesignTokens.typography.sizes.xs,
    color: DesignTokens.colors.textSecondary,
  },
  registerLink: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: DesignTokens.typography.sizes.xs,
    color: DesignTokens.colors.textPrimary,
  },
});
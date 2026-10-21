import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
import { DesignTokens } from "@/constants/Tokens";
import { useAuth } from "@/context/AuthContext";
import { AeroIcon } from "@/components/AeroIcon";
import { api } from "@/services/api";

/**
 * Emblema Circular Retrô de Recrutamento / Insígnia de Patente Militar Estelar em SVG Pixel Art.
 * Círculo segmentado com traços grossos de 3 a 5px, asas de piloto estelar, placas #050200 sob as tags.
 */
const RetroRecruitEmblem: React.FC<{ size?: number }> = ({ size = 320 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 240 240"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    shapeRendering="crispEdges"
  >
    {/* Fundo do Dial */}
    <circle cx="120" cy="120" r="115" fill="#050200" />

    {/* Segmentos e Anéis Concêntricos Externos com Traços Grossos 8-bit */}
    <circle cx="120" cy="120" r="114" stroke="#8F6400" strokeWidth="3" opacity="0.8" />
    <circle cx="120" cy="120" r="107" stroke="#8F6400" strokeWidth="4" />
    <circle cx="120" cy="120" r="102" stroke="#8F6400" strokeWidth="2" strokeDasharray="4 4" opacity="0.6" />

    {/* Setor Superior em Alerta Térmico (#FF3D00) */}
    <path
      d="M 120 13 A 107 107 0 0 1 227 120"
      stroke="#FF3D00"
      strokeWidth="5"
      strokeDasharray="8 4"
    />
    {/* Arco inferior em Âmbar (#FFB000) */}
    <path
      d="M 227 120 A 107 107 0 0 1 13 120"
      stroke="#FFB000"
      strokeWidth="3.5"
      strokeDasharray="12 6"
      opacity="0.9"
    />

    {/* Marcas de Graduação Cardinal (Blocos grossos de 4px a cada 90°) */}
    <line x1="120" y1="4" x2="120" y2="18" stroke="#FF3D00" strokeWidth="4" />
    <line x1="120" y1="222" x2="120" y2="236" stroke="#8F6400" strokeWidth="4" />
    <line x1="4" y1="120" x2="18" y2="120" stroke="#8F6400" strokeWidth="4" />
    <line x1="222" y1="120" x2="236" y2="120" stroke="#FFB000" strokeWidth="4" />

    {/* Ticks intermediários (45°, 135°, 225°, 315°) */}
    <line x1="197" y1="43" x2="188" y2="52" stroke="#FF3D00" strokeWidth="3.5" />
    <line x1="43" y1="197" x2="52" y2="188" stroke="#8F6400" strokeWidth="3.5" />
    <line x1="43" y1="43" x2="52" y2="52" stroke="#8F6400" strokeWidth="3.5" />
    <line x1="197" y1="197" x2="188" y2="188" stroke="#8F6400" strokeWidth="3.5" />

    {/* Retícula Tênue da Cruz de Mira */}
    <line x1="120" y1="22" x2="120" y2="218" stroke="#8F6400" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4" />
    <line x1="22" y1="120" x2="218" y2="120" stroke="#8F6400" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4" />

    {/* Anéis Internos Segmentados */}
    <circle cx="120" cy="120" r="84" stroke="#8F6400" strokeWidth="2.5" strokeDasharray="8 6" opacity="0.6" />
    <circle cx="120" cy="120" r="62" stroke="#8F6400" strokeWidth="1.5" opacity="0.35" />

    {/* Órbita Planetária Inclinada */}
    <ellipse
      cx="120"
      cy="120"
      rx="94"
      ry="36"
      transform="rotate(28 120 120)"
      stroke="#FFB000"
      strokeWidth="2.5"
      strokeDasharray="6 4"
      opacity="0.75"
    />
    <circle cx="42" cy="80" r="3.5" fill="#FFE082" />
    <circle cx="42" cy="80" r="7" stroke="#FFE082" strokeWidth="1.5" opacity="0.6" />

    {/* BRASÃO CENTRAL: ASAS DE PILOTO ESTELAR E ESTRELA POLAR COM LINHAS GROSSAS */}
    <g transform="translate(120, 120)">
      {/* Asas Esquerdas (Delta Wing Layers) */}
      <polygon points="-16,-4 -74,-20 -62,-6 -16,16" fill="#050200" stroke="#FFB000" strokeWidth="3.5" />
      <polygon points="-16,6 -60,-2 -50,12 -16,20" fill="#050200" stroke="#8F6400" strokeWidth="2.5" />
      <line x1="-26" y1="-2" x2="-52" y2="-11" stroke="#FFE082" strokeWidth="2" />

      {/* Asas Direitas (Delta Wing Layers) */}
      <polygon points="16,-4 74,-20 62,-6 16,16" fill="#050200" stroke="#FFB000" strokeWidth="3.5" />
      <polygon points="16,6 60,-2 50,12 16,20" fill="#050200" stroke="#8F6400" strokeWidth="2.5" />
      <line x1="26" y1="-2" x2="52" y2="-11" stroke="#FFE082" strokeWidth="2" />

      {/* Escudo / Chevron Central de Patente */}
      <polygon points="0,-36 18,-10 16,26 0,38 -16,26 -18,-10" fill="#050200" stroke="#FFE082" strokeWidth="4" />
      <polygon points="0,-24 12,-4 10,20 0,28 -10,20 -12,-4" fill="#FFB000" opacity="0.18" />

      {/* Estrela Polar de 4 Pontas no Centro */}
      <polygon points="0,-20 5,-5 20,0 5,5 0,20 -5,5 -20,0 -5,-5" fill="#FFE082" stroke="#FF3D00" strokeWidth="2" />
      <circle cx="0" cy="0" r="3" fill="#FF3D00" />

      {/* Listras Térmicas Inferiores do Chevron */}
      <line x1="-10" y1="18" x2="10" y2="18" stroke="#FF3D00" strokeWidth="3" />
      <line x1="-6" y1="25" x2="6" y2="25" stroke="#FFB000" strokeWidth="3" />
    </g>

    {/* PLACAS DE FUNDO SÓLIDO (#050200) SOB AS TAGS DE TEXTO */}
    <rect x="52" y="30" width="136" height="20" fill="#050200" stroke="#FF3D00" strokeWidth="1.5" />
    <text
      x="120"
      y="43.5"
      textAnchor="middle"
      fill="#FF3D00"
      fontFamily="'JetBrains Mono', monospace"
      fontSize="8.5"
      fontWeight="700"
      letterSpacing="1.5"
    >
      [ CLEARANCE PROTOCOL ]
    </text>

    {/* Placa de largura 210, x = 15 */}
    <rect x="15" y="193" width="210" height="22" fill="#050200" stroke="#8F6400" strokeWidth="1.5" />
    <text
      x="120"
      y="207.5"
      textAnchor="middle"
      fill="#FFE082"
      fontFamily="'JetBrains Mono', monospace"
      fontSize="8.5"
      fontWeight="700"
      letterSpacing="1.5"
    >
      RECRUIT COMMAND // ALPHA-7
    </text>
  </svg>
);

/**
 * Tela de Registro AERO-OS:
 * Terminal CRT Corporativo dos anos 80, retro-futurista, pixel art 8-bit autêntico.
 * Moldura dupla com proporção 16:9 no desktop e responsiva no mobile.
 */
export default function RegisterScreen() {
  const auth = useAuth();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 860;

  const [selectedRole, setSelectedRole] = useState<"USER" | "ADMIN">("USER");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [focusedInput, setFocusedInput] = useState<"username" | "password" | "confirmPassword" | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cursorBlink, setCursorBlink] = useState(true);

  const usernameInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);

  // Efeito do cursor de bloco CRT piscante (█)
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorBlink((prev) => !prev);
    }, 530);
    return () => clearInterval(interval);
  }, []);

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
      return { success: !!res.data?.authenticated || res.status === 200 };
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
    const cleanUser = username.trim().toLowerCase();
    const res = await signUp(cleanUser, password, assignedRoles);

    if (res.success) {
      const loginRes = await signIn(cleanUser, password);
      if (loginRes.success) {
        router.replace("/(tabs)");
      } else {
        router.replace("/(auth)/login");
      }
    } else {
      setLoading(false);
      setErrorMsg(res.message || "[!] FALHA NA EMISSÃO: NÃO FOI POSSÍVEL REGISTRAR OFICIAL NO AUTH-SERVICE.");
    }
  };

  return (
    <View style={styles.screenRoot}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* MOLDURA DUPLA EXTERNA */}
        <View
          style={[
            styles.outerFrame,
            isDesktop && { minHeight: 620, aspectRatio: 16 / 9 },
          ]}
        >
          {/* MOLDURA DUPLA INTERNA */}
          <View style={styles.innerFrame}>
            {/* 1. TOP STATUS BAR (CÉLULA DO BOTÃO VOLTAR OCUPANDO 100% DA ALTURA) */}
            <View style={styles.topStatusBar}>
              <TouchableOpacity
                style={styles.topStatusLeft}
                onPress={() => router.push("/(auth)/login")}
                activeOpacity={0.7}
              >
                <View style={styles.topIconCell}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M19 12H5M12 19l-7-7 7-7"
                      stroke={DesignTokens.colors.amber}
                      strokeWidth="2.5"
                      strokeLinecap="square"
                    />
                  </svg>
                </View>
                <Text style={styles.topStatusTitle}>
                  AERO-OS // ALISTAMENTO DE OFICIAIS
                </Text>
              </TouchableOpacity>
              <Text style={styles.topStatusVersion}>CLEARANCE_AUTH // RECRUIT-LVL</Text>
            </View>

            {/* 2. CORPO PRINCIPAL (SEM DIVISÓRIA CENTRAL ENTRE AS COLUNAS) */}
            <View
              style={[
                styles.mainBody,
                isDesktop ? styles.mainBodyRow : styles.mainBodyCol,
              ]}
            >
              {/* COLUNA ESQUERDA (45% no Desktop) */}
              <View
                style={[
                  styles.leftCol,
                  isDesktop ? styles.leftColDesktop : styles.leftColMobile,
                ]}
              >
                <View style={styles.emblemContainer}>
                  <RetroRecruitEmblem size={isDesktop ? 320 : 210} />
                  <View style={styles.emblemFooterInfo}>
                    <Text style={styles.emblemSubTitle}>COMANDO DE DEFESA ORBITAL</Text>
                    <Text style={styles.emblemTelemetryLine}>
                      [●] PROTOCOLO DE RECRUTAMENTO // ATIVO
                    </Text>
                  </View>
                </View>
              </View>

              {/* COLUNA DIREITA (55% no Desktop, elementos com maxWidth: 320px) */}
              <View
                style={[
                  styles.rightCol,
                  isDesktop ? styles.rightColDesktop : styles.rightColMobile,
                ]}
              >
                {/* BLOCO DE CABEÇALHO */}
                <View style={styles.headerBlock}>
                  <Text style={styles.heroTitle}>AERO-OS</Text>
                  <Text style={styles.heroSubtitle}>ALISTAMENTO DE OFICIAIS</Text>
                  <Text style={styles.heroDescription}>
                    REGISTRO DE PATENTE OPERACIONAL // ESTAÇÃO ALPHA-7
                  </Text>
                </View>

                {/* SELETOR DISCRETO DE PATENTE EM LINHA */}
                <View style={styles.roleSelectorRow}>
                  <TouchableOpacity
                    style={[
                      styles.roleChip,
                      selectedRole === "USER" && styles.roleChipActive,
                    ]}
                    onPress={() => setSelectedRole("USER")}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.roleChipText,
                        selectedRole === "USER" && styles.roleChipTextActive,
                      ]}
                    >
                      [ {selectedRole === "USER" ? "● " : "○ "}OFICIAL // USER ]
                    </Text>
                  </TouchableOpacity>

                  <Text style={styles.rolePipe}>|</Text>

                  <TouchableOpacity
                    style={[
                      styles.roleChip,
                      selectedRole === "ADMIN" && styles.roleChipActive,
                    ]}
                    onPress={() => setSelectedRole("ADMIN")}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.roleChipText,
                        selectedRole === "ADMIN" && styles.roleChipTextActive,
                      ]}
                    >
                      [ {selectedRole === "ADMIN" ? "● " : "○ "}COMANDANTE // ADMIN ]
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* MENSAGEM DE ERRO (SE HOUVER) */}
                {errorMsg ? (
                  <View style={styles.errorBox}>
                    <AeroIcon
                      name="warning"
                      size={13}
                      color={DesignTokens.colors.alert}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.errorText}>{errorMsg}</Text>
                  </View>
                ) : null}

                {/* INPUT 1: CALLSIGN (Puro terminal delimitado por colchetes [ ]) */}
                <View style={styles.inputFieldBlock}>
                  <Text style={styles.inputFieldLabel}>
                    DEFINIR CALLSIGN // new_usr@kernel:&gt;
                  </Text>
                  <TouchableOpacity
                    style={styles.terminalBracketRow}
                    activeOpacity={1}
                    onPress={() => usernameInputRef.current?.focus()}
                  >
                    <Text style={styles.bracketChar}>[</Text>
                    <View style={styles.terminalInputArea}>
                      <Text style={styles.displayText} numberOfLines={1}>
                        <Text style={styles.typedText}>{username || "NOVO_CALLSIGN"}</Text>
                        {focusedInput === "username" && cursorBlink ? (
                          <Text style={styles.inlineCursor}>█</Text>
                        ) : null}
                      </Text>
                      <TextInput
                        ref={usernameInputRef}
                        style={styles.terminalHiddenInput}
                        value={username}
                        onChangeText={setUsername}
                        onFocus={() => setFocusedInput("username")}
                        onBlur={() => setFocusedInput(null)}
                        placeholder="NOVO_CALLSIGN"
                        placeholderTextColor="#664600"
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    </View>
                    <Text style={styles.bracketChar}>]</Text>
                  </TouchableOpacity>
                </View>

                {/* INPUT 2: CÓDIGO CIPHER (Asteriscos grandes com espaçamento amplo) */}
                <View style={styles.inputFieldBlock}>
                  <Text style={styles.inputFieldLabel}>
                    CÓDIGO CIPHER (MÍN. 6 DÍGITOS) // key@cipher:&gt;
                  </Text>
                  <TouchableOpacity
                    style={styles.terminalBracketRow}
                    activeOpacity={1}
                    onPress={() => passwordInputRef.current?.focus()}
                  >
                    <Text style={styles.bracketChar}>[</Text>
                    <View style={styles.terminalInputArea}>
                      <Text style={styles.displayText} numberOfLines={1}>
                        <Text style={styles.passwordMaskedText}>
                          {"*".repeat(password.length || 6)}
                        </Text>
                        {focusedInput === "password" && cursorBlink ? (
                          <Text style={styles.inlineCursor}>█</Text>
                        ) : null}
                      </Text>
                      <TextInput
                        ref={passwordInputRef}
                        style={styles.terminalHiddenInput}
                        value={password}
                        onChangeText={setPassword}
                        onFocus={() => setFocusedInput("password")}
                        onBlur={() => setFocusedInput(null)}
                        placeholder="••••••••"
                        placeholderTextColor="#664600"
                        secureTextEntry
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    </View>
                    <Text style={styles.bracketChar}>]</Text>
                  </TouchableOpacity>
                </View>

                {/* INPUT 3: CONFIRMAÇÃO DO CÓDIGO CIPHER */}
                <View style={styles.inputFieldBlock}>
                  <Text style={styles.inputFieldLabel}>
                    CONFIRMAR CÓDIGO CIPHER // verify@cipher:&gt;
                  </Text>
                  <TouchableOpacity
                    style={styles.terminalBracketRow}
                    activeOpacity={1}
                    onPress={() => confirmPasswordInputRef.current?.focus()}
                  >
                    <Text style={styles.bracketChar}>[</Text>
                    <View style={styles.terminalInputArea}>
                      <Text style={styles.displayText} numberOfLines={1}>
                        <Text style={styles.passwordMaskedText}>
                          {"*".repeat(confirmPassword.length || 6)}
                        </Text>
                        {focusedInput === "confirmPassword" && cursorBlink ? (
                          <Text style={styles.inlineCursor}>█</Text>
                        ) : null}
                      </Text>
                      <TextInput
                        ref={confirmPasswordInputRef}
                        style={styles.terminalHiddenInput}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        onFocus={() => setFocusedInput("confirmPassword")}
                        onBlur={() => setFocusedInput(null)}
                        onSubmitEditing={handleRegister}
                        placeholder="••••••••"
                        placeholderTextColor="#664600"
                        secureTextEntry
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    </View>
                    <Text style={styles.bracketChar}>]</Text>
                  </TouchableOpacity>
                </View>

                {/* BOTÃO DE AÇÃO (CTA com borda #FFE082, fundo 0.12 e texto 16px) */}
                <TouchableOpacity
                  style={styles.ctaButtonOuter}
                  onPress={handleRegister}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <View style={styles.ctaButtonInner}>
                    <Text style={[styles.cornerMarker, styles.cornerTL]}>▪</Text>
                    <Text style={[styles.cornerMarker, styles.cornerTR]}>▪</Text>
                    <Text style={[styles.cornerMarker, styles.cornerBL]}>▪</Text>
                    <Text style={[styles.cornerMarker, styles.cornerBR]}>▪</Text>

                    {loading ? (
                      <ActivityIndicator size="small" color={DesignTokens.colors.amber} />
                    ) : (
                      <Text style={styles.ctaButtonText}>
                        [ EMITIR PATENTE & CONECTAR ]
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>

                {/* LINK DISCRETO PARA RETORNAR AO LOGIN */}
                <View style={styles.registerLinkRow}>
                  <TouchableOpacity
                    onPress={() => router.push("/(auth)/login")}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.registerLinkText}>
                      &lt; JÁ POSSUI PATENTE ATIVA? RETORNAR AO LOGIN ::
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* 3. BOTTOM TELEMETRY BAR (BARRA DE 12 BLOCOS EXPANDIDA À DIREITA DE ORBITAL ALPHA-7) */}
            <View style={styles.bottomTelemetryBar}>
              {/* Esquerda: Caixa com borda "ORBITAL ALPHA-7" + Barra Expandida integrada */}
              <View style={styles.bottomLeftGroup}>
                <View style={styles.bottomLeftBox}>
                  <Text style={styles.bottomStationText}>ORBITAL ALPHA-7</Text>
                </View>

                {/* Barra de progresso alinhada à direita da caixa, flex: 1, maxWidth: 520, altura 22px */}
                <View style={styles.bottomProgressBarFrame}>
                  {Array.from({ length: 12 }).map((_, idx) => (
                    <View
                      key={idx}
                      style={styles.progressBlockFilled}
                    />
                  ))}
                </View>
              </View>

              {/* Direita: Pequeno badge de patente + barras de calibração RGB/CRT de 24px */}
              <View style={styles.bottomRightBox}>
                <View style={styles.miniRocketBadge}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" shapeRendering="crispEdges">
                    <circle cx="8" cy="8" r="7" stroke="#8F6400" strokeWidth="1" />
                    <polygon points="8,2 10,6 14,8 10,10 8,14 6,10 2,8 6,6" fill="#FFB000" />
                  </svg>
                </View>
                <View style={styles.calibrationPattern}>
                  <svg width="56" height="24" viewBox="0 0 56 24" shapeRendering="crispEdges">
                    <rect x="0" y="0" width="7" height="24" fill="#FFFFFF" />
                    <rect x="7" y="0" width="7" height="24" fill="#FFE500" />
                    <rect x="14" y="0" width="7" height="24" fill="#00E5FF" />
                    <rect x="21" y="0" width="7" height="24" fill="#00E676" />
                    <rect x="28" y="0" width="7" height="24" fill="#E040FB" />
                    <rect x="35" y="0" width="7" height="24" fill="#FF1744" />
                    <rect x="42" y="0" width="7" height="24" fill="#2979FF" />
                    <rect x="49" y="0" width="7" height="24" fill="#8F6400" />
                  </svg>
                </View>
                <Text style={styles.calibLabel}>REG_CALIB</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenRoot: {
    flex: 1,
    backgroundColor: DesignTokens.colors.bgDeep, // #050200
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: DesignTokens.colors.bgDeep,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },

  // ── MOLDURA DUPLA ──
  outerFrame: {
    width: "95%",
    maxWidth: 1100,
    borderWidth: 1,
    borderColor: DesignTokens.colors.amberDim, // #8F6400
    borderRadius: 0,
    padding: 3,
    backgroundColor: "transparent",
  },
  innerFrame: {
    flex: 1,
    borderWidth: 1,
    borderColor: DesignTokens.colors.amberDim, // #8F6400
    borderRadius: 0,
    backgroundColor: "rgba(5, 2, 0, 0.90)",
    flexDirection: "column",
    justifyContent: "space-between",
  },

  // ── TOP STATUS BAR COM CÉLULA INTEGRADA ──
  topStatusBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.amberDim,
    height: 42,
    paddingHorizontal: 0,
    backgroundColor: "transparent",
  },
  topStatusLeft: {
    flexDirection: "row",
    alignItems: "center",
    height: "100%",
  },
  topIconCell: {
    width: 44,
    height: "100%",
    borderRightWidth: 1,
    borderRightColor: DesignTokens.colors.amberDim,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 176, 0, 0.05)",
    borderRadius: 0,
  },
  topStatusTitle: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 12,
    color: DesignTokens.colors.textPrimary, // #FFE082
    fontWeight: "700",
    letterSpacing: 1,
    paddingLeft: 14,
  },
  topStatusVersion: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 11,
    color: DesignTokens.colors.amberDim,
    letterSpacing: 0.8,
    paddingRight: 16,
  },

  // ── CORPO PRINCIPAL ──
  mainBody: {
    flex: 1,
    alignItems: "stretch",
  },
  mainBodyRow: {
    flexDirection: "row",
  },
  mainBodyCol: {
    flexDirection: "column",
  },

  // Coluna Esquerda (45% no desktop - Sem linha divisória central)
  leftCol: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  leftColDesktop: {
    width: "45%",
    borderRightWidth: 0,
  },
  leftColMobile: {
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.amberDim,
    paddingVertical: 20,
  },
  emblemContainer: {
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  emblemFooterInfo: {
    alignItems: "center",
    gap: 2,
    marginTop: 6,
  },
  emblemSubTitle: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 11,
    color: DesignTokens.colors.textPrimary,
    letterSpacing: 1,
  },
  emblemTelemetryLine: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 10,
    color: DesignTokens.colors.amber,
    letterSpacing: 0.5,
  },

  // Coluna Direita (55% no desktop)
  rightCol: {
    justifyContent: "center",
  },
  rightColDesktop: {
    width: "55%",
    paddingHorizontal: 40,
    paddingVertical: 24,
  },
  rightColMobile: {
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 20,
  },

  // Bloco de Cabeçalho (Hierarquia Estrita com Peso Aumentado)
  headerBlock: {
    marginBottom: 12,
  },
  heroTitle: {
    fontFamily: DesignTokens.typography.fonts.display, // 'VT323'
    fontSize: 72, // Aumentado para 72px
    color: DesignTokens.colors.alert, // #FF3D00
    letterSpacing: 4,
    lineHeight: 72,
    textShadowColor: "rgba(255, 61, 0, 0.45)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  heroSubtitle: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 24, // Aumentado para 24px
    color: DesignTokens.colors.textPrimary, // #FFE082
    fontWeight: "700",
    letterSpacing: 1.5,
    marginTop: 2,
  },
  heroDescription: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 14, // Aumentado para 14px
    color: DesignTokens.colors.amber, // #FFB000
    letterSpacing: 0.8,
    marginTop: 4,
  },

  // Seletor Discreto de Patente em Linha (maxWidth: 320)
  roleSelectorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
    maxWidth: 320,
    width: "100%",
  },
  roleChip: {
    borderWidth: 1,
    borderColor: DesignTokens.colors.amberDim,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: "transparent",
    borderRadius: 0,
  },
  roleChipActive: {
    borderColor: DesignTokens.colors.amber,
    backgroundColor: "rgba(255, 176, 0, 0.12)",
  },
  roleChipText: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 11,
    color: DesignTokens.colors.amberDim,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  roleChipTextActive: {
    color: DesignTokens.colors.amber,
    fontWeight: "700",
  },
  rolePipe: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 12,
    color: DesignTokens.colors.amberDim,
  },

  // Erro de Terminal
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 61, 0, 0.08)",
    borderWidth: 1,
    borderColor: DesignTokens.colors.alert,
    borderRadius: 0,
    padding: 8,
    marginBottom: 12,
    maxWidth: 320,
    width: "100%",
  },
  errorText: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 11,
    color: DesignTokens.colors.alert,
    flex: 1,
    lineHeight: 15,
  },

  // ── INPUTS EM ESTILO PURO DE TERMINAL (MAXWIDTH: 320, FONTSIZE 22, CURSOR █ AO LADO) ──
  inputFieldBlock: {
    marginBottom: 10,
    maxWidth: 320,
    width: "100%",
  },
  inputFieldLabel: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 11,
    color: DesignTokens.colors.textPrimary,
    marginBottom: 3,
    letterSpacing: 0.5,
  },
  terminalBracketRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    borderWidth: 0,
    paddingVertical: 1,
    maxWidth: 320,
    width: "100%",
  },
  bracketChar: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 24,
    color: "#FFE082",
    fontWeight: "700",
    lineHeight: 28,
  },
  terminalInputArea: {
    flex: 1,
    position: "relative",
    height: 36,
    justifyContent: "center",
    marginHorizontal: 6,
  },
  displayText: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 22,
    color: "#FFE082",
    fontWeight: "700",
    letterSpacing: 1.5,
    lineHeight: 28,
  },
  typedText: {
    color: "#FFE082",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 1.5,
    textShadowColor: "rgba(255, 224, 130, 0.45)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  passwordMaskedText: {
    color: "#FFE082",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 4,
    textShadowColor: "rgba(255, 224, 130, 0.45)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  placeholderText: {
    color: "#664600",
    fontWeight: "600",
    letterSpacing: 1,
    fontSize: 18,
  },
  inlineCursor: {
    color: "#FFE082",
    fontSize: 20,
    fontWeight: "900",
    marginLeft: 2,
  },
  terminalHiddenInput: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    opacity: 0,
    fontSize: 22,
    backgroundColor: "transparent",
  },

  // ── BOTÃO CTA (BORDA #FFE082, FUNDO 0.12 E TEXTO 16PX) ──
  ctaButtonOuter: {
    borderWidth: 1.5,
    borderColor: "#FFE082",
    padding: 3,
    backgroundColor: "transparent",
    borderRadius: 0,
    marginTop: 8,
    maxWidth: 320,
    width: "100%",
  },
  ctaButtonInner: {
    borderWidth: 1.5,
    borderColor: "#FFE082",
    backgroundColor: "rgba(255, 176, 0, 0.12)",
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    borderRadius: 0,
  },
  cornerMarker: {
    position: "absolute",
    color: "#FFE082",
    fontSize: 12,
    lineHeight: 12,
    fontFamily: DesignTokens.typography.fonts.mono,
  },
  cornerTL: { top: 2, left: 3 },
  cornerTR: { top: 2, right: 3 },
  cornerBL: { bottom: 2, left: 3 },
  cornerBR: { bottom: 2, right: 3 },
  ctaButtonText: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 16,
    color: "#FFE082",
    fontWeight: "700",
    letterSpacing: 2,
    textShadowColor: "rgba(255, 224, 130, 0.35)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },

  // Link para Retornar ao Login (maxWidth: 320)
  registerLinkRow: {
    alignItems: "center",
    marginTop: 14,
    maxWidth: 320,
    width: "100%",
  },
  registerLinkText: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 11,
    color: DesignTokens.colors.amberDim,
    letterSpacing: 1,
  },

  // ── BOTTOM TELEMETRY BAR (BARRA DE 12 BLOCOS EXPANDIDA À DIREITA DE ORBITAL ALPHA-7) ──
  bottomTelemetryBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: DesignTokens.colors.amberDim,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "transparent",
  },
  bottomLeftGroup: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  bottomLeftBox: {
    borderWidth: 1,
    borderColor: DesignTokens.colors.amberDim,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "rgba(255, 176, 0, 0.04)",
    borderRadius: 0,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomStationText: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 11,
    color: DesignTokens.colors.amber,
    letterSpacing: 0.8,
  },
  bottomProgressBarFrame: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 16,
    flex: 1,
    maxWidth: 520,
    height: 22,
    borderWidth: 1,
    borderColor: DesignTokens.colors.amberDim,
    backgroundColor: "rgba(5, 2, 0, 0.85)",
    paddingHorizontal: 4,
    gap: 4,
    borderRadius: 0,
  },
  progressBlockFilled: {
    width: 14,
    height: 14,
    backgroundColor: "#FFB000",
    borderRadius: 0,
  },
  bottomRightBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  miniRocketBadge: {
    alignItems: "center",
    justifyContent: "center",
  },
  calibrationPattern: {
    borderWidth: 1,
    borderColor: DesignTokens.colors.amberDim,
    padding: 1,
    backgroundColor: DesignTokens.colors.bgDeep,
    borderRadius: 0,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  calibLabel: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 10,
    color: DesignTokens.colors.amberDim,
    letterSpacing: 0.5,
  },
});

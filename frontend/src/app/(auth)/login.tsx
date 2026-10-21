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

/**
 * Emblema Circular Retrô Tático em SVG Pixel Art.
 * Círculo com traços grossos de 3 a 5px, estilo 8-bit / Atari / DOS,
 * placa de fundo #050200 sob as tags e silhueta chunky da nave interceptora.
 */
const RetroRocketEmblem: React.FC<{ size?: number }> = ({ size = 320 }) => (
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

    {/* Segmentos e Anéis Concêntricos com Traços Grossos 8-bit (strokeWidth 3 a 5) */}
    <circle cx="120" cy="120" r="114" stroke="#8F6400" strokeWidth="3" opacity="0.8" />
    <circle cx="120" cy="120" r="107" stroke="#8F6400" strokeWidth="4" />
    <circle cx="120" cy="120" r="102" stroke="#8F6400" strokeWidth="2" strokeDasharray="4 4" opacity="0.6" />

    {/* Setor de Lançamento Térmico (Quadrante Superior Direito: 270° a 360°) com traço grosso */}
    <path
      d="M 120 13 A 107 107 0 0 1 227 120"
      stroke="#FF3D00"
      strokeWidth="5"
      strokeDasharray="8 4"
    />
    {/* Arco inferior em Âmbar grosso */}
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

    {/* Retícula da Cruz de Mira Técnica */}
    <line x1="120" y1="22" x2="120" y2="218" stroke="#8F6400" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4" />
    <line x1="22" y1="120" x2="218" y2="120" stroke="#8F6400" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4" />

    {/* Anel Médio Segmentado */}
    <circle cx="120" cy="120" r="84" stroke="#8F6400" strokeWidth="2.5" strokeDasharray="8 6" opacity="0.6" />
    <circle cx="120" cy="120" r="62" stroke="#8F6400" strokeWidth="1.5" opacity="0.35" />

    {/* Órbita Planetária Elíptica Inclinada */}
    <ellipse
      cx="120"
      cy="120"
      rx="94"
      ry="36"
      transform="rotate(-28 120 120)"
      stroke="#FFB000"
      strokeWidth="2.5"
      strokeDasharray="6 4"
      opacity="0.75"
    />
    {/* Ponto / Satélite Orbital */}
    <circle cx="198" cy="80" r="3.5" fill="#FFE082" />
    <circle cx="198" cy="80" r="7" stroke="#FFE082" strokeWidth="1.5" opacity="0.6" />

    {/* Vetor de Trajetória a 45° */}
    <line
      x1="45"
      y1="195"
      x2="195"
      y2="45"
      stroke="#FF3D00"
      strokeWidth="2"
      strokeDasharray="6 4"
      opacity="0.5"
    />

    {/* SILHUETA DA NAVE / FOGUETE APONTANDO PARA A DIAGONAL (45°) EM PIXEL ART CHUNKY */}
    <g transform="translate(120, 120) rotate(45)">
      {/* Rastro de Plasma Térmico / Exaustão em Blocos Pixel Art */}
      <polygon points="-10,30 0,72 10,30" fill="#FF3D00" opacity="0.9" />
      <polygon points="-6,30 0,56 6,30" fill="#FFB000" />
      <polygon points="-3,30 0,42 3,30" fill="#FFE082" />

      {/* Partículas de Pulso Iônico em Blocos */}
      <rect x="-2" y="76" width="4" height="5" fill="#FF3D00" opacity="0.8" />
      <rect x="-2" y="85" width="4" height="4" fill="#FF3D00" opacity="0.5" />

      {/* Motores Iônicos Duplos com borda grossa */}
      <rect x="-10" y="25" width="8" height="6" fill="#8F6400" stroke="#FFB000" strokeWidth="2" />
      <rect x="2" y="25" width="8" height="6" fill="#8F6400" stroke="#FFB000" strokeWidth="2" />

      {/* Asas Delta com Nervuras Técnicas e Borda Grossa (strokeWidth 4) */}
      <polygon points="12,6 40,30 32,38 14,27" fill="#050200" stroke="#FFB000" strokeWidth="4" />
      <polygon points="-12,6 -40,30 -32,38 -14,27" fill="#050200" stroke="#FFB000" strokeWidth="4" />
      <line x1="18" y1="16" x2="30" y2="30" stroke="#8F6400" strokeWidth="2.5" />
      <line x1="-18" y1="16" x2="-30" y2="30" stroke="#8F6400" strokeWidth="2.5" />

      {/* Canards Frontais */}
      <polygon points="10,-20 24,-10 12,-7" fill="#FFE082" stroke="#FFB000" strokeWidth="2.5" />
      <polygon points="-10,-20 -24,-10 -12,-7" fill="#FFE082" stroke="#FFB000" strokeWidth="2.5" />

      {/* Casco Principal da Nave (Dart Interceptor com Traço Grosso de 4px) */}
      <polygon
        points="0,-52 12,-18 14,14 16,28 0,23 -16,28 -14,14 -12,-18"
        fill="#050200"
        stroke="#FFE082"
        strokeWidth="4"
      />

      {/* Faixa Dorsal Térmica */}
      <line x1="0" y1="-28" x2="0" y2="16" stroke="#FF3D00" strokeWidth="4" />

      {/* Cockpit / Visor de Comando */}
      <polygon points="0,-38 6,-22 -6,-22" fill="#FF3D00" stroke="#FFE082" strokeWidth="2" />
    </g>

    {/* PLACA DE FUNDO SÓLIDO (#050200) PARA A TAG SUPERIOR - EVITA QUE O CÍRCULO CORTE O TEXTO */}
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
      [ VECTOR-LOCK 045° ]
    </text>

    {/* PLACA DE FUNDO SÓLIDO (#050200) PARA A TAG INFERIOR - WIDTH 210, X = 120 - 105 = 15 */}
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
      ORBITAL SECTOR-07 // FLEET CMD
    </text>
  </svg>
);

/**
 * Tela de Login AERO-OS:
 * Terminal CRT Corporativo dos anos 80, retro-futurista, pixel art 8-bit autêntico.
 * Moldura dupla com proporção 16:9 no desktop e responsiva no mobile.
 */
export default function LoginScreen() {
  const { signIn } = useAuth();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 860;

  // Estado inicial pré-preenchido com valores brilhantes para contraste imediato
  const [selectedRole, setSelectedRole] = useState<"USER" | "ADMIN">("USER");
  const [username, setUsername] = useState("COMMANDER_RYN");
  const [password, setPassword] = useState("12345");
  const [focusedInput, setFocusedInput] = useState<"username" | "password" | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cursorBlink, setCursorBlink] = useState(true);

  const usernameInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

  // Efeito do cursor de bloco CRT piscante (█)
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorBlink((prev) => !prev);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  const handleSelectRole = (role: "USER" | "ADMIN") => {
    setSelectedRole(role);
    setErrorMsg(null);
    if (role === "USER") {
      setUsername("COMMANDER_RYN");
      setPassword("12345");
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
      setErrorMsg(
        result.message || "[!] FALHA NA AUTORIZAÇÃO: CREDENCIAIS NÃO RECONHECIDAS OU INCORRETAS."
      );
    } else {
      router.replace("/(tabs)");
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
            {/* 1. TOP STATUS BAR (CABEÇALHO COM CÉLULA INTEGRADA 100% DA ALTURA) */}
            <View style={styles.topStatusBar}>
              <View style={styles.topStatusLeft}>
                {/* Quadrado do ícone ocupando 100% da altura da barra */}
                <View style={styles.topIconCell}>
                  <svg width="18" height="18" viewBox="0 0 16 16" fill="none" shapeRendering="crispEdges">
                    <polygon
                      points="8,1 11,6 14,13 10,12 8,14 6,12 2,13 5,6"
                      stroke="#FFB000"
                      strokeWidth="1.5"
                      fill="#050200"
                    />
                    <circle cx="8" cy="8" r="1.5" fill="#FF3D00" />
                  </svg>
                </View>
                <Text style={styles.topStatusTitle}>
                  AERO-OS // KERNEL ACCESS TERMINAL
                </Text>
              </View>
              <Text style={styles.topStatusVersion}>SYS_VER: 5.2.0-AMBER</Text>
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
                  <RetroRocketEmblem size={isDesktop ? 320 : 210} />
                  <View style={styles.emblemFooterInfo}>
                    <Text style={styles.emblemSubTitle}>ESTAÇÃO ORBITAL ALPHA-7</Text>
                    <Text style={styles.emblemTelemetryLine}>
                      [●] SINAL DE TELEMETRIA: BLOQUEADO (100%)
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
                {/* BLOCO DE CABEÇALHO COM PESO AUMENTADO */}
                <View style={styles.headerBlock}>
                  <Text style={styles.heroTitle}>AERO-OS</Text>
                  <Text style={styles.heroSubtitle}>AEROSPACE HANGAR</Text>
                  <Text style={styles.heroDescription}>
                    SISTEMA DE DESPACHO E GERENCIAMENTO DE FROTA
                  </Text>
                </View>

                {/* SELETOR DISCRETO DE PERFIL EM LINHA */}
                <View style={styles.roleSelectorRow}>
                  <TouchableOpacity
                    style={[
                      styles.roleChip,
                      selectedRole === "USER" && styles.roleChipActive,
                    ]}
                    onPress={() => handleSelectRole("USER")}
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
                    onPress={() => handleSelectRole("ADMIN")}
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

                {/* INPUT 1: CALLSIGN (Puro terminal com colchetes a 320px e cursor ao lado do texto) */}
                <View style={styles.inputFieldBlock}>
                  <Text style={styles.inputFieldLabel}>
                    CALLSIGN DO OFICIAL // usr@kernel:&gt;
                  </Text>
                  <TouchableOpacity
                    style={styles.terminalBracketRow}
                    activeOpacity={1}
                    onPress={() => usernameInputRef.current?.focus()}
                  >
                    <Text style={styles.bracketChar}>[</Text>
                    <View style={styles.terminalInputArea}>
                      <Text style={styles.displayText} numberOfLines={1}>
                        <Text style={styles.typedText}>{username || "COMMANDER_RYN"}</Text>
                        {focusedInput === "username" && cursorBlink ? (
                          <Text style={styles.inlineCursor}>█</Text>
                        ) : null}
                      </Text>
                      <TextInput
                        ref={usernameInputRef}
                        style={styles.terminalHiddenInput}
                        value={username}
                        onChangeText={(val) => {
                          setUsername(val);
                          if (val.trim().toLowerCase() === "admin") {
                            setSelectedRole("ADMIN");
                          }
                        }}
                        onFocus={() => setFocusedInput("username")}
                        onBlur={() => setFocusedInput(null)}
                        onSubmitEditing={handleLogin}
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    </View>
                    <Text style={styles.bracketChar}>]</Text>
                  </TouchableOpacity>
                </View>

                {/* INPUT 2: CÓDIGO DE ACESSO (Asteriscos grandes com espaçamento amplo a 320px) */}
                <View style={styles.inputFieldBlock}>
                  <Text style={styles.inputFieldLabel}>
                    CÓDIGO DE ACESSO // key@cipher:&gt;
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
                          {"*".repeat(password.length || 5)}
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
                        onSubmitEditing={handleLogin}
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
                  onPress={handleLogin}
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
                        [ AUTORIZAR ACESSO ]
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>

                {/* LINK DISCRETO PARA REGISTRO */}
                <View style={styles.registerLinkRow}>
                  <TouchableOpacity
                    onPress={() => router.push("/(auth)/register")}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.registerLinkText}>
                      &gt; SOLICITAR CADASTRO DE PATENTE ::
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

              {/* Direita: Pequeno ícone de foguete + barras de calibração RGB/CRT de 24px */}
              <View style={styles.bottomRightBox}>
                <View style={styles.miniRocketBadge}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" shapeRendering="crispEdges">
                    <circle cx="8" cy="8" r="7" stroke="#8F6400" strokeWidth="1" />
                    <polygon points="8,2 11,8 10,12 8,11 6,12 5,8" fill="#FFB000" />
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
                <Text style={styles.calibLabel}>CALIB</Text>
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

  // Coluna Esquerda (45% no desktop - Sem linha divisória com a direita)
  leftCol: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  leftColDesktop: {
    width: "45%",
    borderRightWidth: 0, // Removida a linha divisória central
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
    marginBottom: 14,
  },
  heroTitle: {
    fontFamily: DesignTokens.typography.fonts.display, // 'VT323'
    fontSize: 72, // Aumentado para 72px
    color: DesignTokens.colors.alert, // #FF3D00
    letterSpacing: 4,
    lineHeight: 72, // lineHeight 72
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

  // Seletor Discreto de Perfil em Linha (maxWidth: 320)
  roleSelectorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
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
    marginBottom: 12,
    maxWidth: 320,
    width: "100%",
  },
  inputFieldLabel: {
    fontFamily: DesignTokens.typography.fonts.mono,
    fontSize: 11,
    color: DesignTokens.colors.textPrimary,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  terminalBracketRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    borderWidth: 0,
    paddingVertical: 2,
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

  // Link para Registro (maxWidth: 320)
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
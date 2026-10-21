/**
 * AERO-OS // MONOCHROME AMBER KERNEL TERMINAL v5.1
 * Sistema de Design Tokens Estrito com Hierarquia Visual de 3 Níveis:
 * - Nível 1: amber (#ffb000) - Títulos, valores-chave, foco, seleção, CTA
 * - Nível 2: amberMid (#b87f00) - Dados, labels, texto secundário (WCAG AA ≈ 6:1)
 * - Nível 3: amberDim (#885d00) - ESTRUTURA APENAS (bordos, divisórias, grelhas)
 * Mínimo absoluto de fonte: 11px em todo o sistema.
 */

// ── PALETA ÂMBAR DE ALTO CONTRASTE (WCAG AAA >= 10:1) ──
export const AMBER_PALETTE = {
  bgDeep: "#050200",       // Fundo principal de vácuo / tela CRT escura
  bgPrimary: "#050200",    // Fundo primário do console de kernel
  bgBase: "#050200",       // Base do chassi do terminal
  bgSurface: "#0c0600",    // Superfície de painel / bloco
  bgElevated: "#180c00",   // Elemento elevado ou popup
  bgCardHover: "#241200",  // Realce de cursor / linha ativa

  // Escala Térmica Monocromática Âmbar
  amberLuminous: "#FFE082", // Amarelo/Âmbar Luminoso para leitura de texto primário
  amber: "#FFB000",         // Âmbar padrão de comando
  amberMid: "#FFC107",      // Âmbar médio quente
  amberDim: "#8F6400",      // APENAS ESTRUTURA (bordas e divisórias)
  amberDark: "#4D3600",     // Linhas técnicas sutis

  // Tipografia Estrita
  textPrimary: "#FFE082",   // Luminoso para leitura
  textSecondary: "#FFB000", // Âmbar padrão
  textMuted: "#CC8C00",     // Âmbar escurecido, mas legível contra o fundo #050200

  // Escala Térmica de Alertas (Laranja e Vermelho Térmico)
  warning: "#FF9100",       // Laranja Térmico
  alert: "#FF3D00",         // Vermelho Térmico / Alerta Crítico
  danger: "#FF3D00",

  glow: "rgba(255, 176, 0, 0.25)",        // Brilho do texto suave e nítido
  glowStrong: "rgba(255, 176, 0, 0.40)",  // Brilho de texto acentuado
  scanline: "rgba(0, 0, 0, 0.08)",       // Scanline ultra-sutil
};

export const DesignTokens = {
  // ── PALETA DE CORES MONOCROMÁTICA ÂMBAR ──
  colors: {
    bgDeep: AMBER_PALETTE.bgDeep,
    bgPrimary: AMBER_PALETTE.bgPrimary,
    bgBase: AMBER_PALETTE.bgBase,
    bgSurface: AMBER_PALETTE.bgSurface,
    bgElevated: AMBER_PALETTE.bgElevated,
    bgCardHover: AMBER_PALETTE.bgCardHover,

    // Hierarquia cromática
    amber: AMBER_PALETTE.amber,
    amberLuminous: AMBER_PALETTE.amberLuminous,
    amberMid: AMBER_PALETTE.amberMid,
    amberDim: AMBER_PALETTE.amberDim,
    amberDark: AMBER_PALETTE.amberDark,
    alert: AMBER_PALETTE.alert,
    danger: AMBER_PALETTE.danger,

    glow: AMBER_PALETTE.glow,
    glowStrong: AMBER_PALETTE.glowStrong,
    scanline: AMBER_PALETTE.scanline,

    // Bordas e Grades Técnicas (Nível 3 estrutural)
    border: AMBER_PALETTE.amberDim,
    borderDim: AMBER_PALETTE.amberDark,
    borderHighlight: AMBER_PALETTE.amber,
    borderFocus: AMBER_PALETTE.amber,
    borderTerminal: AMBER_PALETTE.amberDim,
    borderLight: AMBER_PALETTE.amberDim,

    // Tipografia Âmbar de Alta Legibilidade (Mínimo WCAG AAA)
    textPrimary: AMBER_PALETTE.textPrimary,      // #FFE082 - Títulos e valores dominantes luminosos
    textSecondary: AMBER_PALETTE.textSecondary,  // #FFB000 - Dados, specs e corpo de leitura
    textMuted: AMBER_PALETTE.textMuted,          // #CC8C00 - Labels e metadados legíveis
    textPhosphor: AMBER_PALETTE.textPrimary,

    // Estados Funcionais (Escala Térmica)
    statusReady: AMBER_PALETTE.amber,            // #FFB000
    statusWarning: AMBER_PALETTE.warning,        // #FF9100
    statusCritical: AMBER_PALETTE.alert,         // #FF3D00
    statusInfo: AMBER_PALETTE.textPrimary,       // #FFE082
    statusPlasma: AMBER_PALETTE.amber,

    // ── ALIASES DE COMPATIBILIDADE (@deprecated - Monocromáticos) ──
    /** @deprecated Utilize colors.amber */
    phosphor: AMBER_PALETTE.amber,
    /** @deprecated Utilize colors.amberDim para bordos ou colors.textSecondary para texto */
    phosphorDim: AMBER_PALETTE.amberDim,
    /** @deprecated Utilize colors.amberDark */
    phosphorDark: AMBER_PALETTE.amberDark,
    /** @deprecated Utilize colors.glow */
    phosphorSubtle: "rgba(255, 176, 0, 0.10)",
    /** @deprecated Utilize colors.border */
    phosphorBorder: "rgba(255, 176, 0, 0.35)",
    /** @deprecated Utilize colors.glowStrong */
    phosphorGlow: AMBER_PALETTE.glowStrong,

    /** @deprecated Utilize colors.amber */
    brandGreen: AMBER_PALETTE.amber,
    /** @deprecated Utilize colors.textSecondary */
    brandGreenDim: AMBER_PALETTE.amberMid,
    /** @deprecated Utilize colors.amber */
    brandGreenHover: AMBER_PALETTE.amber,
    /** @deprecated Utilize colors.glow */
    brandGreenSubtle: "rgba(255, 176, 0, 0.10)",
    /** @deprecated Utilize colors.border */
    brandGreenBorder: "rgba(255, 176, 0, 0.35)",
    /** @deprecated Utilize colors.amber */
    accentAmber: AMBER_PALETTE.amber,
    /** @deprecated Utilize colors.alert */
    brandRed: AMBER_PALETTE.alert,
    /** @deprecated Removido tom de ciano: mapeado para âmbar luminoso */
    telemetryCyan: AMBER_PALETTE.textPrimary,
    /** @deprecated Removido tom de roxo: mapeado para laranja térmico */
    plasmaPurple: AMBER_PALETTE.warning,

    // Identificadores cromáticos táticos dos vetores de frota (Escala Térmica do Âmbar)
    shipColors: {
      interceptor: "#FFD54F",  // Amarelo Claro Térmico
      freighter: "#FFA000",    // Âmbar Médio
      miningDrone: "#FFB000",  // Âmbar Padrão
      assaultMech: "#FF3D00",  // Vermelho Térmico
      scout: "#FF6D00",        // Laranja Vivo
      corvette: "#FF8F00",     // Laranja Âmbar
      prototype: "#FFE082",    // Amarelo Ouro Luminoso
    },

    // Classes Operacionais dos Ativos no Terminal com Cores Térmicas
    classes: {
      INTERCEPTOR: { code: "INT", label: "Caça Interceptador", color: "#FFD54F", icon: "flash" },
      FREIGHTER: { code: "FRG", label: "Cargueiro Pesado", color: "#FFA000", icon: "cube" },
      MINING_DRONE: { code: "DRN", label: "Drone de Mineração", color: "#FFB000", icon: "hardware-chip" },
      ASSAULT_MECH: { code: "MCH", label: "Mecha de Assalto", color: "#FF3D00", icon: "shield" },
      SCOUT: { code: "SCT", label: "Reconhecimento Estelar", color: "#FF6D00", icon: "planet" },
      CORVETTE: { code: "CRV", label: "Corveta de Patrulha", color: "#FF8F00", icon: "navigate" },
    } as Record<string, { code: string; label: string; color: string; icon: string }>,
  },

  // ── DERIVADOS DE BORDA TÉCNICA MINIMALISTA ──
  borders: {
    thin: {
      borderWidth: 1,
      borderColor: AMBER_PALETTE.amberDim,
    },
    dashed: {
      borderWidth: 1,
      borderStyle: "dashed" as const,
      borderColor: AMBER_PALETTE.amberDim,
    },
    active: {
      borderWidth: 1,
      borderColor: AMBER_PALETTE.amber,
    },
  },

  // ── TIPOGRAFIA MONOESPAÇADA DE ALTA NITIDEZ (MÍNIMO 11PX) ──
  typography: {
    fontFamily: "'JetBrains Mono', monospace",
    fontFamilyDisplay: "'VT323', monospace",
    fontFamilyTerminal: "'JetBrains Mono', monospace",
    fontFamilyMono: "'JetBrains Mono', monospace",
    fontFamilyBody: "'JetBrains Mono', monospace",
    fonts: {
      pixel: "'VT323', monospace",
      mono: "'JetBrains Mono', monospace",
      terminal: "'JetBrains Mono', monospace",
      body: "'JetBrains Mono', monospace",
      display: "'VT323', monospace",
    },
    // Escala estrita com mínimo absoluto de 11px
    sizes: {
      xs: 11,           // Mínimo absoluto (telemetria, FUEL, labels do radar, timestamps, tags de estado)
      sm: 12,           // Dados e valores secundários
      md: 14,           // Texto corrido de terminal
      lg: 18,           // Títulos de painéis de instrumentos
      xl: 24,           // Título do console operacional
      display: 32,      // Código da estação e logo principal
      // Aliases para compatibilidade
      meta: 11,
      bodySmall: 12,
      body: 14,
      sectionTitle: 18,
      pageTitle: 24,
    },
    letterSpacing: {
      tight: 0.5,
      normal: 1,
      wide: 1.5,
      display: 2,
    },
    weights: {
      regular: "400",
      medium: "500",
      bold: "700",
      extraBold: "800",
    },
  },

  // ── ESCALA CONSISTENTE DE ESPAÇAMENTOS (4/8/12/16/24/32) ──
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
  },

  // ── BREAKPOINTS RESPONSIVOS CENTRALIZADOS ──
  breakpoints: {
    mobile: 480,
    tablet: 768,
    desktop: 960,
  },

  // ── CANTOS RETOS INDUSTRIAIS (0px por especificação CRT) ──
  radii: {
    control: 0,
    button: 0,
    card: 0,
    modal: 0,
    chip: 0,
  },

  // ── BRILHO FÓSFORO ÂMBAR ──
  shadows: {
    amber: "0 0 6px rgba(255, 176, 0, 0.40)",
    amberGlow: "0 0 12px rgba(255, 176, 0, 0.60)",
    terminalBezel: "inset 0 0 20px rgba(0, 0, 0, 0.9), 0 0 0 1px #885d00",
  },
};

/**
 * Helper de Estilização React Native para Glow de Fósforo Âmbar em Dois Níveis:
 * - 'title' (ou 'strong'): Glow pronunciado (raio 8–9) para títulos e valores-chave
 * - 'body' (ou 'normal'): Glow sutil (raio 2.5–3) para texto de dados, garantindo nitidez
 */
export const glowText = (level: "title" | "body" | "normal" | "strong" = "title") => {
  const isTitle = level === "title" || level === "strong";
  return {
    textShadowColor: isTitle ? "rgba(255, 184, 0, 0.30)" : "transparent",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: isTitle ? 3 : 0,
  };
};

/**
 * Helper ASCII Progress Bar para Indicadores de Terminal:
 * Exemplo: asciiBar(98, 10) -> "█████████░", asciiBar(100, 10) -> "██████████"
 */
export const asciiBar = (value: number, width: number = 10): string => {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const filledCount = Math.round((clamped / 100) * width);
  const emptyCount = width - filledCount;
  return "█".repeat(filledCount) + "░".repeat(Math.max(0, emptyCount));
};

export const borderThin = DesignTokens.borders.thin;
export const borderDashed = DesignTokens.borders.dashed;
export const borderActive = DesignTokens.borders.active;

/**
 * CSS Global Injetado no Web / Head:
 * Variáveis CSS, Alto Contraste, Nitidez de Fonte e Scanlines CRT Ultra-Leves.
 */
export const CSS_DESIGN_TOKENS = `
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&family=VT323&display=swap');

:root {
  --amber: #FFB800;
  --amber-mid: #FFC84D;
  --amber-dim: #8F6400;
  --amber-dark: #4D3600;
  --bg: #050200;
  --bg-deep: #050200;
  --bg-surface: #0c0600;
  --bg-elevated: #180c00;
  --alert: #FF3322;
  --glow: rgba(255, 184, 0, 0.25);
  --glow-strong: rgba(255, 184, 0, 0.40);
  --scanline: rgba(0, 0, 0, 0.06);

  --font-display: 'JetBrains Mono', monospace;
  --font-terminal: 'JetBrains Mono', monospace;
  --font-mono: 'JetBrains Mono', monospace;
}

/* ── CONFIGURAÇÕES GLOBAIS DE TERMINAL ÂMBAR ── */
*, *::before, *::after {
  box-sizing: border-box;
}

html, body, #root {
  background-color: var(--bg-deep) !important;
  color: var(--amber);
  font-family: var(--font-mono);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

input, textarea, select, button {
  font-family: var(--font-mono);
  caret-color: var(--amber);
}

/* Seleção e Cursor */
::selection {
  background: var(--amber) !important;
  color: var(--bg) !important;
}

/* Títulos / Nível 1: Glow Sutil sem desfoque */
h1, h2, h3, .pixel-title, [data-typography="pixel"], [data-glow="title"] {
  letter-spacing: 1px;
  text-shadow: 0 0 4px var(--glow);
}

/* Texto Secundário: 100% nítido, sem text-shadow difuso */
.amber-glow-body, [data-glow="body"] {
  text-shadow: none;
}

/* ── EFEITO CRT SCANLINES ULTRA-SUTIL COM CONTROLE DE INTENSIDADE ── */
body::after {
  content: " ";
  display: block;
  position: fixed;
  top: 0; left: 0; bottom: 0; right: 0;
  width: 100vw;
  height: 100vh;
  background: repeating-linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 0,
    rgba(0, 0, 0, 0) 3px,
    rgba(0, 0, 0, 0.08) 4px
  );
  pointer-events: none;
  z-index: 999999;
  opacity: 0.20;
  transition: opacity 0.2s ease;
}

body.crt-off::after {
  display: none !important;
}

body.crt-subtle::after {
  opacity: 0.18 !important;
}

body.crt-full::after {
  opacity: 0.45 !important;
}

/* ── SCROLLBAR MONOCROMÁTICA ÂMBAR FINA ── */
::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}
::-webkit-scrollbar-track {
  background: var(--bg);
  border-left: 1px solid var(--amber-dim);
}
::-webkit-scrollbar-thumb {
  background: var(--amber-dim);
}
::-webkit-scrollbar-thumb:hover {
  background: var(--amber);
  box-shadow: 0 0 6px var(--amber);
}

/* Foco Tático Monocromático */
:focus-visible {
  outline: 1px solid var(--amber) !important;
  outline-offset: 2px !important;
}
`;

/**
 * POKÉMON TCG - DESIGN TOKENS
 * Sistema de design oficial baseado na nova identidade vermelha Pokébola (#EE1515).
 */

export const DesignTokens = {
  // ── CORES DA MARCA & INTERFACE ──
  colors: {
    // Marca & Ação Primária
    brandRed: "#EE1515",
    brandRedHover: "#FF3B3B",
    brandRedPressed: "#C40F0F",
    brandRedSubtle: "rgba(238, 21, 21, 0.12)",
    brandRedBorder: "rgba(238, 21, 21, 0.35)",

    // Destaque Dourado (apenas raridade, preço especial e selos; nunca ação primária)
    accentGold: "#FFCB05",
    accentGoldSubtle: "rgba(255, 203, 5, 0.12)",
    accentGoldBorder: "rgba(255, 203, 5, 0.35)",

    // Superfícies e Fundos (Dark Theme Base)
    bgBase: "#0E0F12",
    bgSurface: "#16181D",
    bgElevated: "#1E2128",
    bgCardHover: "#232731",

    // Bordas
    border: "#2A2E37",
    borderLight: "#3B414E",
    borderFocus: "#EE1515",

    // Cores Auxiliares
    secondary: "#3399FF",

    // Textos (Contraste >= 4.5:1 sobre o fundo)
    textPrimary: "#F5F6F8",
    textSecondary: "#A9AFBC",
    textMuted: "#767D8E",

    // Feedback de Sistema
    success: "#2ECC71",
    successSubtle: "rgba(46, 204, 113, 0.15)",
    warning: "#F5A524",
    warningSubtle: "rgba(245, 165, 36, 0.15)",
    danger: "#FF5A5F",
    dangerSubtle: "rgba(255, 90, 95, 0.15)",

    // Tipos Elementais Pokémon (exclusivos para badges e ícones)
    types: {
      FIRE: { bg: "#FF4422", text: "#FFFFFF", label: "Fogo", icon: "flame" },
      WATER: { bg: "#3399FF", text: "#FFFFFF", label: "Água", icon: "water" },
      GRASS: { bg: "#77CC55", text: "#FFFFFF", label: "Planta", icon: "leaf" },
      ELECTRIC: { bg: "#FFCC33", text: "#16181D", label: "Elétrico", icon: "flash" },
      PSYCHIC: { bg: "#FF5599", text: "#FFFFFF", label: "Psíquico", icon: "eye" },
      FIGHTING: { bg: "#BB5544", text: "#FFFFFF", label: "Lutador", icon: "fitness" },
      DARKNESS: { bg: "#705848", text: "#FFFFFF", label: "Sombrio", icon: "moon" },
      METAL: { bg: "#AAAABB", text: "#16181D", label: "Metal", icon: "shield" },
      DRAGON: { bg: "#7766EE", text: "#FFFFFF", label: "Dragão", icon: "sparkles" },
      COLORLESS: { bg: "#A8A878", text: "#16181D", label: "Incolor", icon: "star" },
    } as Record<string, { bg: string; text: string; label: string; icon: string }>,
  },

  // ── TIPOGRAFIA (Rajdhani Gamer/TCG + Inter UI/Body + JetBrains Mono Código) ──
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontFamilyDisplay: "'Rajdhani', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontFamilyBody: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontFamilyMono: "'JetBrains Mono', 'Fira Code', monospace",
    sizes: {
      meta: 12,       // Metadados, tags secundárias, notas de rodapé (Mínimo 12px)
      bodySmall: 14,  // Controles, filtros, botões compactos
      body: 16,       // Texto corrido padrão
      sectionTitle: 20, // Títulos de seção, modais
      pageTitle: 28,  // Título da página / h1
    },
    weights: {
      regular: "400",
      medium: "500",
      bold: "700",
      extraBold: "800",
      black: "900",
    },
  },

  // ── ESPAÇAMENTOS (Escala de 4px) ──
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  // ── BORDAS E RAIOS ──
  radii: {
    control: 8,    // Inputs, select
    button: 10,    // Botões
    card: 12,      // Cards de carta, painéis
    modal: 20,     // Modais
    chip: 999,     // Tags, pills de filtro
  },

  // ── SOMBRAS & EFEITOS ──
  shadows: {
    card: "0 4px 16px rgba(0, 0, 0, 0.45)",
    cardHover: "0 14px 32px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(238, 21, 21, 0.35)",
    modal: "0 24px 64px rgba(0, 0, 0, 0.85)",
    focusRing: "0 0 0 2px #0E0F12, 0 0 0 4px #EE1515",
  },

  // ── TRANSIÇÕES ──
  transitions: {
    fast: "150ms cubic-bezier(0.16, 1, 0.3, 1)",
    normal: "200ms cubic-bezier(0.16, 1, 0.3, 1)",
  },

  // ── PROPORÇÃO DE CARTA OFICIAL ──
  cardAspect: 63 / 88, // 0.7159
};

/**
 * Representação CSS em string para injeção nativa no head do documento HTML.
 */
export const CSS_DESIGN_TOKENS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&family=Rajdhani:wght@500;600;700&display=swap');

:root {
  --font-display: 'Rajdhani', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  --brand-red: #EE1515;
  --brand-red-hover: #FF3B3B;
  --brand-red-pressed: #C40F0F;
  --brand-red-subtle: rgba(238, 21, 21, 0.12);
  --brand-red-border: rgba(238, 21, 21, 0.35);

  --accent-gold: #FFCB05;
  --accent-gold-subtle: rgba(255, 203, 5, 0.12);
  --accent-gold-border: rgba(255, 203, 5, 0.35);

  --bg-base: #0E0F12;
  --bg-surface: #16181D;
  --bg-elevated: #1E2128;
  --bg-card-hover: #232731;

  --border: #2A2E37;
  --border-light: #3B414E;
  --border-focus: #EE1515;

  --text-primary: #F5F6F8;
  --text-secondary: #A9AFBC;
  --text-muted: #767D8E;

  --success: #2ECC71;
  --warning: #F5A524;
  --danger: #FF5A5F;

  --radius-control: 8px;
  --radius-card: 12px;
  --radius-chip: 999px;

  --card-aspect: 63 / 88;
  --transition-fast: 150ms ease-out;
  --transition-normal: 200ms ease-out;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Scrollbar estilizada */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: var(--bg-base);
}
::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--border-light);
}

/* Foco de teclado padrão WCAG */
:focus-visible {
  outline: 2px solid var(--brand-red) !important;
  outline-offset: 2px !important;
}

/* ── TIPOGRAFIA GLOBAL (Inter para UI/Corpo & Rajdhani para Títulos/Preços/Badges) ── */
*, *::before, *::after,
html, body, #root, div, span, p, a, label, input, textarea, select, button,
[dir="auto"], [dir="ltr"], [dir="rtl"],
.css-text-146c3p1, [class*="css-text"] {
  font-family: var(--font-body) !important;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Títulos, Headings, Valores de Preço, Badges e Destaques Gamer TCG em Rajdhani */
h1, h2, h3, h4, h5, h6,
.font-display, [data-typography="display"], .rajdhani-heading {
  font-family: var(--font-display) !important;
  letter-spacing: 0.5px;
}

/* Tipografia Monospaçada para IDs de Instância e Dados Técnicos */
code, pre, kbd, samp, .font-mono, [data-typography="mono"] {
  font-family: var(--font-mono) !important;
}
`;

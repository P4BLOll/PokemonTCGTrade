import { DesignTokens, AMBER_PALETTE } from "./Tokens";

/**
 * Mapeamento de conveniência de Colors para retrocompatibilidade
 * Atualizado com a hierarquia de 3 níveis:
 * - Nível 1: amber (títulos, valores-chave, primário)
 * - Nível 2: amberMid (dados, labels, texto secundário)
 * - Nível 3: amberDim (apenas bordos e grelhas)
 */
export const Colors = {
  background: AMBER_PALETTE.bgDeep,
  surface: AMBER_PALETTE.bgSurface,
  surfaceCard: AMBER_PALETTE.bgElevated,
  surfaceHover: AMBER_PALETTE.bgCardHover,

  border: AMBER_PALETTE.amberDim,
  borderLight: AMBER_PALETTE.amberDim,
  borderDark: AMBER_PALETTE.amberDark,

  primary: AMBER_PALETTE.amber,
  primaryLight: AMBER_PALETTE.textPrimary,
  primaryDark: AMBER_PALETTE.textSecondary,
  primarySubtle: "rgba(255, 176, 0, 0.12)",
  primaryBorder: "rgba(255, 176, 0, 0.35)",

  accent: AMBER_PALETTE.amber,
  accentGold: AMBER_PALETTE.textPrimary,
  accentGoldSubtle: "rgba(255, 176, 0, 0.15)",

  secondary: AMBER_PALETTE.textSecondary,

  // Tipografia Âmbar de Alto Contraste (WCAG AAA)
  text: AMBER_PALETTE.textPrimary,            // #FFE082 (Luminoso para leitura)
  textPrimary: AMBER_PALETTE.textPrimary,     // #FFE082 (Luminoso para leitura)
  textSecondary: AMBER_PALETTE.textSecondary, // #FFB000 (Âmbar padrão)
  textMuted: AMBER_PALETTE.textMuted,         // #CC8C00 (Legível contra #050200)
  textDim: AMBER_PALETTE.textMuted,           // #CC8C00

  success: AMBER_PALETTE.amber,
  warning: AMBER_PALETTE.warning,
  danger: AMBER_PALETTE.alert,

  types: {
    FIRE: AMBER_PALETTE.alert,
    WATER: AMBER_PALETTE.amber,
    GRASS: AMBER_PALETTE.amber,
    LIGHTNING: AMBER_PALETTE.amber,
    PSYCHIC: AMBER_PALETTE.amberMid,
    FIGHTING: AMBER_PALETTE.amberMid,
    DARKNESS: AMBER_PALETTE.amberDark,
    METAL: AMBER_PALETTE.amberMid,
    COLORLESS: AMBER_PALETTE.amber,
    DRAGON: AMBER_PALETTE.amber,
    FAIRY: AMBER_PALETTE.amber,
  },
};

export { DesignTokens, AMBER_PALETTE };
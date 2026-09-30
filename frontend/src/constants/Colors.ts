import { DesignTokens } from "./Tokens";

/**
 * Mapeamento de conveniência dos Colors para retrocompatibilidade
 * Todos os valores agora derivam estritamente dos DesignTokens oficiais.
 */
export const Colors = {
  // Fundos & Superfícies
  background: DesignTokens.colors.bgBase,
  surface: DesignTokens.colors.bgSurface,
  surfaceCard: DesignTokens.colors.bgElevated,
  surfaceHover: DesignTokens.colors.bgCardHover,

  // Bordas
  border: DesignTokens.colors.border,
  borderLight: DesignTokens.colors.borderLight,

  // Marca (Vermelho Pokébola #EE1515)
  primary: DesignTokens.colors.brandRed,
  primaryLight: DesignTokens.colors.brandRedHover,
  primaryDark: DesignTokens.colors.brandRedPressed,
  primarySubtle: DesignTokens.colors.brandRedSubtle,
  primaryBorder: DesignTokens.colors.brandRedBorder,

  // Acentos (Dourado reservado para raridade / cotação)
  accent: DesignTokens.colors.accentGold,
  accentGold: DesignTokens.colors.accentGold,
  accentGoldSubtle: DesignTokens.colors.accentGoldSubtle,

  secondary: DesignTokens.colors.secondary,

  // Textos
  text: DesignTokens.colors.textPrimary,
  textMuted: DesignTokens.colors.textSecondary,
  textDim: DesignTokens.colors.textMuted,

  // Feedback
  success: DesignTokens.colors.success,
  warning: DesignTokens.colors.warning,
  danger: DesignTokens.colors.danger,

  // Tipos elementais Pokémon
  types: DesignTokens.colors.types,
};

export { DesignTokens };
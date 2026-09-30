import React, { useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DesignTokens } from "@/constants/Tokens";
import { Card } from "@/services/api";

interface Props {
  card: Card;
  onPress?: () => void;
  isOwned?: boolean;
  ownedCount?: number;
  hasTradeOffer?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onQuickTrade?: () => void;
  style?: any;
}

export const PokemonCardItem: React.FC<Props> = ({
  card,
  onPress,
  isOwned = false,
  ownedCount = 0,
  hasTradeOffer = false,
  isFavorite = false,
  onToggleFavorite,
  onQuickTrade,
  style,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const typeConfig = DesignTokens.colors.types[card.type] || DesignTokens.colors.types.COLORLESS;
  const formattedPrice = card.marketPrice
    ? `R$ ${card.marketPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
    : "R$ 150,00";

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      // @ts-ignore Web event listeners
      onMouseEnter={() => setIsHovered(true)}
      // @ts-ignore Web event listeners
      onMouseLeave={() => setIsHovered(false)}
      style={[
        styles.cardContainer,
        isHovered && styles.cardContainerHover,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Carta ${card.name}, tipo ${typeConfig.label}, ${card.hp} HP, coleção ${card.expansion}, raridade ${card.rarity.replace("_", " ")}, preço ${formattedPrice}`}
    >
      {/* ── ARTWORK WRAPPER (Aspect Ratio 63:88 Oficial) ── */}
      <View style={styles.artFrame}>
        {/* Skeleton Shimmer enquanto carrega */}
        {!imageLoaded && (
          <View style={styles.skeletonPlaceholder}>
            <Ionicons name="sparkles" size={24} color={DesignTokens.colors.borderLight} />
          </View>
        )}

        {/* Imagem Oficial com Lazy Loading & Dimensões Explícitas */}
        <Image
          source={{ uri: card.imageUrl || "https://images.pokemontcg.io/base1/4_hires.png" }}
          style={styles.cardImage}
          resizeMode="contain"
          onLoad={() => setImageLoaded(true)}
          // @ts-ignore Web optimization
          loading="lazy"
        />

        {/* Efeito Holográfico Sutil no Hover */}
        {isHovered && <View style={styles.holoSheen} />}

        {/* Selo: "Na Minha Coleção" */}
        {isOwned && (
          <View style={styles.ownedBadge} accessibilityLabel="Carta presente na sua coleção">
            <Ionicons name="checkmark-circle" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={styles.ownedBadgeText}>
              Na coleção {ownedCount > 1 ? `(${ownedCount}x)` : ""}
            </Text>
          </View>
        )}

        {/* Selo: "Oferta de Troca Ativa" */}
        {hasTradeOffer && (
          <View style={[styles.tradeOfferBadge, isOwned ? { bottom: 30 } : null]} accessibilityLabel="Ofertas de troca disponíveis para esta carta">
            <Ionicons name="swap-horizontal" size={11} color="#FFFFFF" style={{ marginRight: 3 }} />
            <Text style={styles.tradeOfferBadgeText}>Troca Ativa</Text>
          </View>
        )}

        {/* Badges Superiores sobre a Imagem com Blur */}
        <View style={styles.topBadgesRow}>
          {/* Badge de Tipo Elemental com Ícone e Fonte >= 12px */}
          <View style={[styles.frostedTypeBadge, { borderColor: typeConfig.bg }]}>
            <View style={[styles.typeIconDot, { backgroundColor: typeConfig.bg }]}>
              <Ionicons name={typeConfig.icon as any} size={11} color="#FFFFFF" />
            </View>
            <Text style={styles.frostedTypeText}>{typeConfig.label}</Text>
          </View>

          {/* Badge de HP */}
          <View style={styles.frostedHpBadge}>
            <Text style={styles.frostedHpText}>{card.hp} HP</Text>
          </View>
        </View>

        {/* Botão de Ação Rápida: Favoritar (Touch Target >= 44x44px) */}
        <TouchableOpacity
          style={styles.quickFavBtn}
          onPress={(e) => {
            e.stopPropagation?.();
            onToggleFavorite?.();
          }}
          accessibilityRole="button"
          accessibilityLabel={isFavorite ? `Remover ${card.name} dos favoritos` : `Favoritar ${card.name}`}
          // @ts-ignore
          title={isFavorite ? "Remover dos favoritos" : "Favoritar carta"}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={18}
            color={isFavorite ? DesignTokens.colors.brandRed : DesignTokens.colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* ── SEÇÃO DE INFORMAÇÕES (Sem rolagem interna) ── */}
      <View style={styles.infoSection}>
        {/* Nome da Carta */}
        <Text style={styles.cardName} numberOfLines={1}>
          {card.name}
        </Text>

        {/* Expansão + Raridade */}
        <View style={styles.metaRow}>
          <Text style={styles.expansionText} numberOfLines={1}>
            {card.expansion}
          </Text>
          <View style={styles.rarityPill}>
            <Text style={styles.rarityText}>
              {card.rarity.replace("_", " ").toLowerCase()}
            </Text>
          </View>
        </View>

        {/* Cotação de Preço em Destaque Dourado */}
        <View style={styles.priceRow}>
          <View style={styles.priceLeft}>
            <Text style={styles.priceLabel}>Mercado</Text>
            <Text style={styles.priceValue}>{formattedPrice}</Text>
          </View>

          {/* Ação Rápida de Troca */}
          <TouchableOpacity
            style={styles.quickActionBtn}
            onPress={(e) => {
              e.stopPropagation?.();
              if (onQuickTrade) {
                onQuickTrade();
              } else if (onPress) {
                onPress();
              }
            }}
            accessibilityRole="button"
            accessibilityLabel={`Ver detalhes e negociar ${card.name}`}
            // @ts-ignore
            title="Ver detalhes da carta"
          >
            <Ionicons name="swap-horizontal" size={15} color={DesignTokens.colors.brandRed} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: DesignTokens.colors.bgSurface,
    borderRadius: DesignTokens.radii.card,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
    overflow: "hidden",
    position: "relative",
    width: "100%",
    ...(Platform.OS === "web"
      ? {
          cursor: "pointer",
          transition: "transform 180ms ease-out, box-shadow 180ms ease-out, border-color 180ms ease-out",
          boxShadow: DesignTokens.shadows.card,
        }
      : {}),
  } as any,
  cardContainerHover: {
    borderColor: DesignTokens.colors.brandRedBorder,
    backgroundColor: DesignTokens.colors.bgElevated,
    transform: [{ scale: 1.02 }, { translateY: -3 }],
    ...(Platform.OS === "web"
      ? {
          boxShadow: DesignTokens.shadows.cardHover,
        }
      : {}),
  } as any,

  /* Frame da Arte (Proporção 63:88) */
  artFrame: {
    width: "100%",
    aspectRatio: DesignTokens.cardAspect,
    backgroundColor: DesignTokens.colors.bgBase,
    position: "relative",
    overflow: "hidden",
  },
  skeletonPlaceholder: {
    ...StyleSheet.absoluteFill,
    backgroundColor: DesignTokens.colors.bgElevated,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  cardImage: {
    width: "100%",
    height: "100%",
    zIndex: 2,
  },
  holoSheen: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    zIndex: 3,
    pointerEvents: "none",
  } as any,

  /* Selo "Na minha coleção" */
  ownedBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(22, 24, 29, 0.88)",
    borderWidth: 1,
    borderColor: DesignTokens.colors.success,
    borderRadius: DesignTokens.radii.chip,
    paddingHorizontal: 8,
    paddingVertical: 3,
    ...(Platform.OS === "web" ? { backdropFilter: "blur(6px)" } : {}),
  } as any,
  ownedBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  tradeOfferBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(238, 21, 21, 0.90)",
    borderWidth: 1,
    borderColor: "#FF7777",
    borderRadius: DesignTokens.radii.chip,
    paddingHorizontal: 8,
    paddingVertical: 3,
    ...(Platform.OS === "web" ? { backdropFilter: "blur(6px)" } : {}),
  } as any,
  tradeOfferBadgeText: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  /* Badges Superiores sobre a Imagem com Blur e Fonte >= 12px */
  topBadgesRow: {
    position: "absolute",
    top: 8,
    left: 8,
    right: 48,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  frostedTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(22, 24, 29, 0.82)",
    borderWidth: 1,
    borderRadius: DesignTokens.radii.control,
    paddingHorizontal: 6,
    paddingVertical: 3,
    gap: 4,
    ...(Platform.OS === "web" ? { backdropFilter: "blur(8px)" } : {}),
  } as any,
  typeIconDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  frostedTypeText: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    fontSize: 12,
    fontWeight: "700",
    color: DesignTokens.colors.textPrimary,
    letterSpacing: 0.3,
  },
  frostedHpBadge: {
    backgroundColor: "rgba(22, 24, 29, 0.82)",
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
    borderRadius: DesignTokens.radii.control,
    paddingHorizontal: 6,
    paddingVertical: 3,
    ...(Platform.OS === "web" ? { backdropFilter: "blur(8px)" } : {}),
  } as any,
  frostedHpText: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    fontSize: 12,
    fontWeight: "800",
    color: DesignTokens.colors.textPrimary,
    letterSpacing: 0.5,
  },

  /* Botão Rápido Favoritar (Touch Target >= 44x44px) */
  quickFavBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 44,
    height: 44,
    zIndex: 15,
    justifyContent: "center",
    alignItems: "center",
  },

  /* Seção de Informações */
  infoSection: {
    padding: DesignTokens.spacing.md,
    backgroundColor: DesignTokens.colors.bgSurface,
  },
  cardName: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    fontSize: 15,
    fontWeight: "700",
    color: DesignTokens.colors.textPrimary,
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  expansionText: {
    fontFamily: DesignTokens.typography.fontFamily,
    fontSize: DesignTokens.typography.sizes.meta,
    color: DesignTokens.colors.textSecondary,
    fontWeight: "500",
    flex: 1,
  },
  rarityPill: {
    backgroundColor: DesignTokens.colors.bgElevated,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rarityText: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    fontSize: 11,
    fontWeight: "700",
    color: DesignTokens.colors.textSecondary,
    textTransform: "capitalize",
    letterSpacing: 0.3,
  },

  /* Preço e Botão de Ação */
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: DesignTokens.colors.border,
  },
  priceLeft: {
    flexDirection: "column",
  },
  priceLabel: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    fontSize: 10,
    fontWeight: "700",
    color: DesignTokens.colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  priceValue: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    fontSize: 15,
    fontWeight: "800",
    color: DesignTokens.colors.accentGold,
    letterSpacing: 0.5,
  },
  quickActionBtn: {
    width: 36,
    height: 36,
    borderRadius: DesignTokens.radii.control,
    backgroundColor: DesignTokens.colors.brandRedSubtle,
    borderWidth: 1,
    borderColor: DesignTokens.colors.brandRedBorder,
    justifyContent: "center",
    alignItems: "center",
  },
});
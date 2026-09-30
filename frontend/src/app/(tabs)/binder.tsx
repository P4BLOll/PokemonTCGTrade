import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Image,
  ScrollView,
  useWindowDimensions,
  Platform,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { DesignTokens } from "@/constants/Tokens";
import { Header } from "@/components/Header";
import { useAuth } from "@/context/AuthContext";
import { BinderItem, Card, binderService, cardService } from "@/services/api";

export default function BinderScreen() {
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 640 && width < 1024;

  const [binderItems, setBinderItems] = useState<BinderItem[]>([]);
  const [catalogCards, setCatalogCards] = useState<Record<string, Card>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filtros locais
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "AVAILABLE" | "LOCKED">("ALL");
  const [selectedType, setSelectedType] = useState<string>("ALL");

  // Modal de Detalhes da Carta do Binder
  const [selectedItem, setSelectedItem] = useState<BinderItem | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  const loadData = async () => {
    if (!user) return;
    try {
      const [binderData, catalogData] = await Promise.all([
        binderService.getBinder(user),
        cardService.getCatalog().catch(() => []),
      ]);

      setBinderItems(binderData.cards || []);

      const map: Record<string, Card> = {};
      catalogData.forEach((c) => {
        map[c.id] = c;
      });
      setCatalogCards(map);
    } catch (e) {
      console.error("Erro ao carregar Minha Coleção:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Contadores
  const availableCount = useMemo(() => binderItems.filter((c) => !c.lockedForTrade).length, [binderItems]);
  const lockedCount = useMemo(() => binderItems.filter((c) => c.lockedForTrade).length, [binderItems]);

  // Valor total estimado
  const totalEstimatedValue = useMemo(() => {
    return binderItems.reduce((acc, item) => {
      const card = catalogCards[item.cardId];
      return acc + (card?.marketPrice || 150.0);
    }, 0);
  }, [binderItems, catalogCards]);

  // Itens filtrados
  const filteredItems = useMemo(() => {
    return binderItems.filter((item) => {
      // Filtro de status
      if (statusFilter === "AVAILABLE" && item.lockedForTrade) return false;
      if (statusFilter === "LOCKED" && !item.lockedForTrade) return false;

      // Filtro de tipo
      if (selectedType !== "ALL" && item.type !== selectedType) return false;

      // Busca por nome ou ID de instância
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = item.cardName.toLowerCase().includes(q);
        const matchesInstance = item.instanceId.toLowerCase().includes(q);
        const matchesRarity = item.rarity.toLowerCase().includes(q);
        if (!matchesName && !matchesInstance && !matchesRarity) return false;
      }

      return true;
    });
  }, [binderItems, statusFilter, selectedType, search]);

  const handleCopyInstanceId = (id: string) => {
    if (Platform.OS === "web" && typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Minha Coleção"
        subtitle={`Cartas registradas no cofre do Treinador @${user || "Treinador"}`}
        badgeText={`${binderItems.length} Cartas`}
      />

      <ScrollView
        style={styles.mainScrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={DesignTokens.colors.brandRed} />}
        showsVerticalScrollIndicator={false}
      >
        {/* ── BARRA DE MÉTRICAS & ESTATÍSTICAS DA COLEÇÃO ── */}
        <View style={styles.statsContainer}>
          {/* Card 1: Total */}
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: DesignTokens.colors.brandRedSubtle }]}>
              <Ionicons name="albums-outline" size={20} color={DesignTokens.colors.brandRed} />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statNumber}>{binderItems.length}</Text>
              <Text style={styles.statLabel}>Total na Coleção</Text>
            </View>
          </View>

          {/* Card 2: Disponíveis */}
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: "rgba(46, 204, 113, 0.12)" }]}>
              <Ionicons name="checkmark-circle-outline" size={20} color={DesignTokens.colors.success} />
            </View>
            <View style={styles.statInfo}>
              <Text style={[styles.statNumber, { color: DesignTokens.colors.success }]}>{availableCount}</Text>
              <Text style={styles.statLabel}>Disponíveis para Troca</Text>
            </View>
          </View>

          {/* Card 3: Bloqueadas em Troca */}
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: "rgba(245, 165, 36, 0.12)" }]}>
              <Ionicons name="lock-closed-outline" size={20} color={DesignTokens.colors.warning} />
            </View>
            <View style={styles.statInfo}>
              <Text style={[styles.statNumber, { color: DesignTokens.colors.warning }]}>{lockedCount}</Text>
              <Text style={styles.statLabel}>Em Negociação Ativa</Text>
            </View>
          </View>

          {/* Card 4: Valor Total Estimado */}
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: "rgba(255, 203, 5, 0.12)" }]}>
              <Ionicons name="cash-outline" size={20} color={DesignTokens.colors.accentGold} />
            </View>
            <View style={styles.statInfo}>
              <Text style={[styles.statNumber, { color: DesignTokens.colors.accentGold }]}>
                R$ {totalEstimatedValue.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
              <Text style={styles.statLabel}>Valor Estimado da Coleção</Text>
            </View>
          </View>
        </View>

        {/* ── BARRA DE CONTROLE: BUSCA E FILTROS ── */}
        <View style={styles.controlsBar}>
          {/* Campo de Busca */}
          <View style={styles.searchInputContainer}>
            <Ionicons name="search-outline" size={18} color={DesignTokens.colors.textMuted} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por Pokémon, ID de instância ou raridade..."
              placeholderTextColor={DesignTokens.colors.textMuted}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")} style={styles.clearSearchBtn}>
                <Ionicons name="close-circle" size={18} color={DesignTokens.colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Segmented Pills de Status */}
          <View style={styles.segmentedContainer}>
            <TouchableOpacity
              style={[styles.segmentBtn, statusFilter === "ALL" && styles.segmentBtnActive]}
              onPress={() => setStatusFilter("ALL")}
            >
              <Text style={[styles.segmentBtnText, statusFilter === "ALL" && styles.segmentBtnTextActive]}>
                Todas ({binderItems.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.segmentBtn, statusFilter === "AVAILABLE" && styles.segmentBtnActive]}
              onPress={() => setStatusFilter("AVAILABLE")}
            >
              <Ionicons
                name="checkmark-circle"
                size={13}
                color={statusFilter === "AVAILABLE" ? DesignTokens.colors.success : DesignTokens.colors.textSecondary}
                style={{ marginRight: 4 }}
              />
              <Text style={[styles.segmentBtnText, statusFilter === "AVAILABLE" && styles.segmentBtnTextActive]}>
                Disponíveis ({availableCount})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.segmentBtn, statusFilter === "LOCKED" && styles.segmentBtnActive]}
              onPress={() => setStatusFilter("LOCKED")}
            >
              <Ionicons
                name="lock-closed"
                size={13}
                color={statusFilter === "LOCKED" ? DesignTokens.colors.warning : DesignTokens.colors.textSecondary}
                style={{ marginRight: 4 }}
              />
              <Text style={[styles.segmentBtnText, statusFilter === "LOCKED" && styles.segmentBtnTextActive]}>
                Em Troca ({lockedCount})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── LISTA / GRID DE CARTAS DA COLEÇÃO ── */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={DesignTokens.colors.brandRed} />
            <Text style={styles.loadingText}>Carregando sua coleção pessoal...</Text>
          </View>
        ) : filteredItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="folder-open-outline" size={48} color={DesignTokens.colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>
              {search || statusFilter !== "ALL" ? "Nenhuma carta corresponde aos filtros" : "Sua coleção está vazia"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {search || statusFilter !== "ALL"
                ? "Tente ajustar o termo de pesquisa ou o filtro de disponibilidade."
                : "Explore o catálogo completo para conferir as cartas e registrar propostas de troca com outros treinadores."}
            </Text>
            <TouchableOpacity style={styles.emptyCtaBtn} onPress={() => router.push("/(tabs)")}>
              <Ionicons name="sparkles" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.emptyCtaText}>Explorar Catálogo de Cartas</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View
            style={[
              styles.cardsGrid,
              Platform.OS === "web"
                ? ({
                    display: "grid",
                    gridTemplateColumns: isDesktop
                      ? "repeat(6, minmax(0, 1fr))"
                      : isTablet
                      ? "repeat(4, minmax(0, 1fr))"
                      : "repeat(2, minmax(0, 1fr))",
                    gap: 16,
                  } as any)
                : {},
            ]}
          >
            {filteredItems.map((item) => {
              const card = catalogCards[item.cardId];
              const imageUrl = card?.imageUrl || "https://images.pokemontcg.io/base1/4_hires.png";
              const typeConfig = DesignTokens.colors.types[item.type] || DesignTokens.colors.types.COLORLESS;
              const formattedPrice = card?.marketPrice
                ? `R$ ${card.marketPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                : "R$ 150,00";

              return (
                <TouchableOpacity
                  key={item.instanceId}
                  style={styles.cardItemWrapper}
                  activeOpacity={0.88}
                  onPress={() => setSelectedItem(item)}
                >
                  <View style={styles.cardItemArtFrame}>
                    <Image source={{ uri: imageUrl }} style={styles.cardImage} resizeMode="contain" />

                    {/* Status Badge: Disponível vs Bloqueado */}
                    <View
                      style={[
                        styles.cardStatusBadge,
                        item.lockedForTrade ? styles.cardStatusLocked : styles.cardStatusAvailable,
                      ]}
                    >
                      <Ionicons
                        name={item.lockedForTrade ? "lock-closed" : "checkmark-circle"}
                        size={11}
                        color="#FFFFFF"
                        style={{ marginRight: 3 }}
                      />
                      <Text style={styles.cardStatusText}>
                        {item.lockedForTrade ? "Em Negociação" : "Disponível"}
                      </Text>
                    </View>

                    {/* Badge Elemental no topo */}
                    <View style={[styles.cardTypeBadge, { borderColor: typeConfig.bg }]}>
                      <Ionicons name={typeConfig.icon as any} size={10} color="#FFFFFF" />
                      <Text style={styles.cardTypeText}>{typeConfig.label}</Text>
                    </View>
                  </View>

                  <View style={styles.cardItemInfo}>
                    <Text style={styles.cardItemName} numberOfLines={1}>
                      {item.cardName}
                    </Text>

                    <View style={styles.cardItemMetaRow}>
                      <Text style={styles.cardItemRarity}>{item.rarity.replace("_", " ").toLowerCase()}</Text>
                      <Text style={styles.cardItemPrice}>{formattedPrice}</Text>
                    </View>

                    <View style={styles.instanceBadge}>
                      <Ionicons name="key-outline" size={10} color={DesignTokens.colors.textMuted} style={{ marginRight: 3 }} />
                      <Text style={styles.instanceBadgeText} numberOfLines={1}>
                        {item.instanceId}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* ── MODAL DE DETALHES DA CARTA DA COLEÇÃO ── */}
      <Modal visible={Boolean(selectedItem)} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalhes da Carta</Text>
              <TouchableOpacity onPress={() => setSelectedItem(null)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color={DesignTokens.colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {selectedItem && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalArtRow}>
                  <Image
                    source={{
                      uri: catalogCards[selectedItem.cardId]?.imageUrl || "https://images.pokemontcg.io/base1/4_hires.png",
                    }}
                    style={styles.modalCardImage}
                    resizeMode="contain"
                  />
                  <View style={styles.modalCardDetails}>
                    <Text style={styles.modalCardName}>{selectedItem.cardName}</Text>
                    <Text style={styles.modalCardSub}>
                      {catalogCards[selectedItem.cardId]?.expansion || "Coleção Oficial"} • {selectedItem.rarity.replace("_", " ")}
                    </Text>

                    <View style={styles.modalPriceBox}>
                      <Text style={styles.modalPriceLabel}>Cotação de Mercado</Text>
                      <Text style={styles.modalPriceValue}>
                        R${" "}
                        {(catalogCards[selectedItem.cardId]?.marketPrice || 150.0).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </Text>
                    </View>

                    {/* Status de Bloqueio / Disponibilidade */}
                    <View
                      style={[
                        styles.modalStatusBox,
                        selectedItem.lockedForTrade ? styles.modalStatusLocked : styles.modalStatusAvailable,
                      ]}
                    >
                      <Ionicons
                        name={selectedItem.lockedForTrade ? "lock-closed" : "checkmark-circle"}
                        size={18}
                        color={selectedItem.lockedForTrade ? DesignTokens.colors.warning : DesignTokens.colors.success}
                        style={{ marginRight: 8 }}
                      />
                      <View>
                        <Text
                          style={[
                            styles.modalStatusTitle,
                            { color: selectedItem.lockedForTrade ? DesignTokens.colors.warning : DesignTokens.colors.success },
                          ]}
                        >
                          {selectedItem.lockedForTrade ? "Bloqueada em Negociação" : "Disponível para Negociação"}
                        </Text>
                        <Text style={styles.modalStatusDesc}>
                          {selectedItem.lockedForTrade
                            ? "Esta carta está atrelada a uma proposta de troca pendente no RabbitMQ."
                            : "Você pode oferecer esta carta em trocas diretas com outros treinadores."}
                        </Text>
                      </View>
                    </View>

                    {/* ID de Instância Único */}
                    <View style={styles.modalInstanceBox}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.modalInstanceLabel}>ID de Instância Exclusivo (MongoDB):</Text>
                        <Text style={styles.modalInstanceVal}>{selectedItem.instanceId}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.copyBtn}
                        onPress={() => handleCopyInstanceId(selectedItem.instanceId)}
                      >
                        <Ionicons
                          name={copiedId ? "checkmark" : "copy-outline"}
                          size={16}
                          color={copiedId ? DesignTokens.colors.success : DesignTokens.colors.textPrimary}
                        />
                        <Text style={[styles.copyBtnText, copiedId && { color: DesignTokens.colors.success }]}>
                          {copiedId ? "Copiado!" : "Copiar ID"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Ações do Modal */}
                <View style={styles.modalActionsRow}>
                  {!selectedItem.lockedForTrade ? (
                    <TouchableOpacity
                      style={styles.modalTradeBtn}
                      onPress={() => {
                        const inst = selectedItem.instanceId;
                        setSelectedItem(null);
                        router.push({ pathname: "/(tabs)/trades", params: { offerInstanceId: inst } });
                      }}
                    >
                      <Ionicons name="swap-horizontal" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                      <Text style={styles.modalTradeBtnText}>PROPOR TROCA COM ESTA CARTA</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.modalViewTradesBtn}
                      onPress={() => {
                        setSelectedItem(null);
                        router.push("/(tabs)/trades");
                      }}
                    >
                      <Ionicons name="eye-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                      <Text style={styles.modalViewTradesBtnText}>VER PROPOSTA ATIVA NO MURAL</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignTokens.colors.bgBase,
  },
  mainScrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    maxWidth: 1600,
    width: "100%",
    alignSelf: "center",
  },

  /* Cards de Estatísticas */
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: 220,
    backgroundColor: DesignTokens.colors.bgSurface,
    borderRadius: DesignTokens.radii.card,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  statIconBox: {
    width: 44,
    height: 44,
    borderRadius: DesignTokens.radii.button,
    justifyContent: "center",
    alignItems: "center",
  },
  statInfo: {
    flex: 1,
  },
  statNumber: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    fontSize: 26,
    fontWeight: "800",
    color: DesignTokens.colors.textPrimary,
    letterSpacing: 0.5,
  },
  statLabel: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    fontSize: 13,
    fontWeight: "600",
    color: DesignTokens.colors.textSecondary,
    letterSpacing: 0.3,
    marginTop: 2,
  },

  /* Barra de Controles: Busca e Segmentos */
  controlsBar: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    marginBottom: 24,
  },
  searchInputContainer: {
    flex: 1,
    minWidth: 280,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DesignTokens.colors.bgSurface,
    borderRadius: DesignTokens.radii.button,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
    paddingHorizontal: 14,
    height: 44,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: DesignTokens.colors.textPrimary,
    fontSize: 14,
  },
  clearSearchBtn: {
    padding: 4,
  },
  segmentedContainer: {
    flexDirection: "row",
    backgroundColor: DesignTokens.colors.bgSurface,
    borderRadius: DesignTokens.radii.button,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
    padding: 4,
    gap: 4,
  },
  segmentBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: DesignTokens.radii.chip,
  },
  segmentBtnActive: {
    backgroundColor: DesignTokens.colors.brandRedSubtle,
    borderWidth: 1,
    borderColor: DesignTokens.colors.brandRed,
  },
  segmentBtnText: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    fontSize: 14,
    fontWeight: "600",
    color: DesignTokens.colors.textSecondary,
    letterSpacing: 0.3,
  },
  segmentBtnTextActive: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    color: DesignTokens.colors.brandRed,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  /* Grid de Cartas */
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cardItemWrapper: {
    backgroundColor: DesignTokens.colors.bgSurface,
    borderRadius: DesignTokens.radii.card,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
    overflow: "hidden",
    marginBottom: 16,
    flexGrow: 0,
    flexShrink: 0,
    width: "100%",
  },
  cardItemArtFrame: {
    width: "100%",
    aspectRatio: 63 / 88,
    backgroundColor: DesignTokens.colors.bgElevated,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardStatusBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: DesignTokens.radii.chip,
    zIndex: 10,
    ...(Platform.OS === "web" ? { backdropFilter: "blur(6px)" } : {}),
  } as any,
  cardStatusAvailable: {
    backgroundColor: "rgba(46, 204, 113, 0.90)",
  },
  cardStatusLocked: {
    backgroundColor: "rgba(245, 165, 36, 0.90)",
  },
  cardStatusText: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    fontSize: 11,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  cardTypeBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(22, 24, 29, 0.88)",
    borderWidth: 1,
    borderRadius: DesignTokens.radii.chip,
    paddingHorizontal: 7,
    paddingVertical: 2,
    gap: 4,
    zIndex: 10,
    ...(Platform.OS === "web" ? { backdropFilter: "blur(6px)" } : {}),
  } as any,
  cardTypeText: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },

  cardItemInfo: {
    padding: 12,
  },
  cardItemName: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    fontSize: 15,
    fontWeight: "800",
    color: DesignTokens.colors.textPrimary,
    letterSpacing: 0.3,
  },
  cardItemMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  cardItemRarity: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    fontSize: 12,
    color: DesignTokens.colors.textSecondary,
    textTransform: "capitalize",
    letterSpacing: 0.3,
  },
  cardItemPrice: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    fontSize: 15,
    fontWeight: "800",
    color: DesignTokens.colors.accentGold,
    letterSpacing: 0.5,
  },
  instanceBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    backgroundColor: DesignTokens.colors.bgElevated,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
  },
  instanceBadgeText: {
    fontSize: 11,
    color: DesignTokens.colors.textMuted,
    fontFamily: DesignTokens.typography.fontFamilyMono,
    flex: 1,
  },

  /* Loading & Empty */
  loadingContainer: {
    paddingVertical: 60,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: DesignTokens.colors.textSecondary,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DesignTokens.colors.bgSurface,
    borderRadius: DesignTokens.radii.card,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: DesignTokens.colors.bgElevated,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: DesignTokens.colors.textPrimary,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 13,
    color: DesignTokens.colors.textSecondary,
    marginTop: 6,
    textAlign: "center",
    maxWidth: 480,
  },
  emptyCtaBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DesignTokens.colors.brandRed,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: DesignTokens.radii.button,
    marginTop: 20,
  },
  emptyCtaText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  /* Modal de Detalhes */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    ...(Platform.OS === "web" ? { backdropFilter: "blur(8px)" } : {}),
  } as any,
  modalCard: {
    backgroundColor: DesignTokens.colors.bgSurface,
    borderRadius: DesignTokens.radii.modal,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
    padding: 24,
    width: "100%",
    maxWidth: 720,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: DesignTokens.colors.textPrimary,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: DesignTokens.colors.bgElevated,
    justifyContent: "center",
    alignItems: "center",
  },
  modalArtRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 20,
  },
  modalCardImage: {
    width: 220,
    aspectRatio: 63 / 88,
    borderRadius: 12,
  },
  modalCardDetails: {
    flex: 1,
    minWidth: 260,
  },
  modalCardName: {
    fontSize: 22,
    fontWeight: "900",
    color: DesignTokens.colors.textPrimary,
  },
  modalCardSub: {
    fontSize: 13,
    color: DesignTokens.colors.textSecondary,
    marginTop: 4,
  },
  modalPriceBox: {
    backgroundColor: DesignTokens.colors.bgElevated,
    borderRadius: DesignTokens.radii.button,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
  },
  modalPriceLabel: {
    fontSize: 11,
    color: DesignTokens.colors.textMuted,
  },
  modalPriceValue: {
    fontSize: 20,
    fontWeight: "900",
    color: DesignTokens.colors.accentGold,
    marginTop: 2,
  },
  modalStatusBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 12,
    borderRadius: DesignTokens.radii.button,
    borderWidth: 1,
    marginTop: 14,
  },
  modalStatusAvailable: {
    backgroundColor: "rgba(46, 204, 113, 0.10)",
    borderColor: "rgba(46, 204, 113, 0.30)",
  },
  modalStatusLocked: {
    backgroundColor: "rgba(245, 165, 36, 0.10)",
    borderColor: "rgba(245, 165, 36, 0.30)",
  },
  modalStatusTitle: {
    fontSize: 13,
    fontWeight: "800",
  },
  modalStatusDesc: {
    fontSize: 11,
    color: DesignTokens.colors.textSecondary,
    marginTop: 2,
    maxWidth: 320,
  },
  modalInstanceBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DesignTokens.colors.bgElevated,
    borderRadius: DesignTokens.radii.button,
    padding: 10,
    marginTop: 14,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
    gap: 10,
  },
  modalInstanceLabel: {
    fontSize: 10,
    color: DesignTokens.colors.textMuted,
  },
  modalInstanceVal: {
    fontSize: 12,
    color: DesignTokens.colors.textPrimary,
    fontFamily: "monospace",
    fontWeight: "700",
    marginTop: 2,
  },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DesignTokens.colors.bgSurface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: DesignTokens.radii.chip,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
    gap: 4,
  },
  copyBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: DesignTokens.colors.textPrimary,
  },

  modalActionsRow: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: DesignTokens.colors.border,
  },
  modalTradeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DesignTokens.colors.brandRed,
    paddingVertical: 14,
    borderRadius: DesignTokens.radii.button,
  },
  modalTradeBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  modalViewTradesBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DesignTokens.colors.bgElevated,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
    paddingVertical: 14,
    borderRadius: DesignTokens.radii.button,
  },
  modalViewTradesBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: DesignTokens.colors.textPrimary,
    letterSpacing: 0.5,
  },
});
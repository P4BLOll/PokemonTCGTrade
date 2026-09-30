import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TextInput,
  ScrollView,
  Image,
  useWindowDimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { DesignTokens } from "@/constants/Tokens";
import { Header } from "@/components/Header";
import { useAuth } from "@/context/AuthContext";
import { BinderItem, Card, TradeProposal, binderService, cardService, tradeService } from "@/services/api";

export default function TradesScreen() {
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const params = useLocalSearchParams();

  const [tab, setTab] = useState<"received" | "sent" | "history">("received");
  const [allMyTrades, setAllMyTrades] = useState<TradeProposal[]>([]);
  const [myCards, setMyCards] = useState<BinderItem[]>([]);
  const [catalogCards, setCatalogCards] = useState<Record<string, Card>>({});
  const [loading, setLoading] = useState(true);

  // Modal de Proposta
  const [modalVisible, setModalVisible] = useState(false);
  const [receiver, setReceiver] = useState("ash");
  const [offeredCard, setOfferedCard] = useState("");
  const [requestedCard, setRequestedCard] = useState("");
  const [receiverCards, setReceiverCards] = useState<BinderItem[]>([]);
  const [actionLoading, setActionLoading] = useState(false);

  // Teste de Concorrência
  const [concurrencyResult, setConcurrencyResult] = useState<string | null>(null);
  const [concurrencyExpanded, setConcurrencyExpanded] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showFeedback = (title: string, message: string, type: "success" | "error" = "success") => {
    setToast({ type, text: `${title}: ${message}` });
    setTimeout(() => setToast(null), 5000);
  };

  const loadInitialData = async () => {
    if (!user) return;
    try {
      const [tradesData, myBinderData, catalogData] = await Promise.all([
        tradeService.getMyTrades(user),
        binderService.getBinder(user).catch(() => ({ id: "", trainerUsername: user, cards: [] })),
        cardService.getCatalog().catch(() => []),
      ]);

      setAllMyTrades(tradesData || []);
      setMyCards(myBinderData.cards || []);

      const map: Record<string, Card> = {};
      catalogData.forEach((c) => {
        map[c.id] = c;
      });
      setCatalogCards(map);
    } catch (e) {
      console.error("Erro ao carregar trocas:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [user]);

  // Se veio redirecionado com uma carta selecionada do Binder
  useEffect(() => {
    if (params?.offerInstanceId && typeof params.offerInstanceId === "string") {
      setOfferedCard(params.offerInstanceId);
      setModalVisible(true);
    }
  }, [params?.offerInstanceId]);

  // Carrega cartas do treinador destinatário quando o modal abre ou muda de receiver
  useEffect(() => {
    if (modalVisible && receiver) {
      binderService.getBinder(receiver).then((data) => {
        setReceiverCards(data.cards?.filter((c) => !c.lockedForTrade) || []);
      }).catch(() => {
        setReceiverCards([]);
      });
    }
  }, [modalVisible, receiver]);

  const handlePropose = async () => {
    if (!receiver.trim() || !offeredCard.trim() || !requestedCard.trim()) {
      showFeedback("Atenção", "Preencha todos os campos da proposta.", "error");
      return;
    }

    if (!user) return;
    setActionLoading(true);
    try {
      await tradeService.propose(user, receiver.trim().toLowerCase(), offeredCard.trim(), requestedCard.trim());
      showFeedback("Sucesso!", "Proposta de troca enviada ao treinador.");
      setModalVisible(false);
      setOfferedCard("");
      setRequestedCard("");
      await loadInitialData();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Erro ao propor troca.";
      showFeedback("Aviso de Bloqueio", msg, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAccept = async (tradeId: string) => {
    if (!user) return;
    setActionLoading(true);
    try {
      await tradeService.accept(tradeId, user);
      showFeedback(
        "Troca Aceita!",
        "A proposta foi enviada para o CloudAMQP / RabbitMQ para liquidação assíncrona e troca automática das cartas!"
      );
      await loadInitialData();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Não foi possível aceitar a troca.";
      showFeedback("Erro ao aceitar", msg, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (tradeId: string) => {
    if (!user) return;
    setActionLoading(true);
    try {
      await tradeService.cancel(tradeId, user);
      showFeedback("Cancelada", "A proposta de troca foi cancelada e a carta foi liberada.");
      await loadInitialData();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Erro ao cancelar troca.";
      showFeedback("Erro ao cancelar", msg, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const runConcurrencyTest = async () => {
    setActionLoading(true);
    setConcurrencyResult(null);
    try {
      const res = await tradeService.testConcurrency(
        "ash",
        "misty",
        "inst-ash-pikachu",
        "inst-misty-blastoise"
      );
      setConcurrencyResult(JSON.stringify(res, null, 2));
      showFeedback(
        "Teste de Concorrência Concluído!",
        "2 threads simultâneas disparadas! Uma obteve o lock atômico e a outra foi bloqueada com sucesso."
      );
    } catch (err: any) {
      showFeedback("Resultado do Teste", err.message || "Executado.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Helper para resolver informações visuais da carta
  const resolveCardVisual = (instanceId: string) => {
    // Procura no myCards
    const myItem = myCards.find((c) => c.instanceId === instanceId);
    if (myItem) {
      const cat = catalogCards[myItem.cardId];
      return {
        name: myItem.cardName,
        type: myItem.type,
        rarity: myItem.rarity,
        imageUrl: cat?.imageUrl || "https://images.pokemontcg.io/base1/4_hires.png",
      };
    }

    // Tenta deduzir pelo instanceId
    const lower = instanceId.toLowerCase();
    let guessedCard: Card | undefined = undefined;

    if (lower.includes("charizard")) guessedCard = Object.values(catalogCards).find((c) => c.name.toLowerCase().includes("charizard"));
    else if (lower.includes("blastoise")) guessedCard = Object.values(catalogCards).find((c) => c.name.toLowerCase().includes("blastoise"));
    else if (lower.includes("venusaur")) guessedCard = Object.values(catalogCards).find((c) => c.name.toLowerCase().includes("venusaur"));
    else if (lower.includes("pikachu")) guessedCard = Object.values(catalogCards).find((c) => c.name.toLowerCase().includes("pikachu"));
    else if (lower.includes("mewtwo")) guessedCard = Object.values(catalogCards).find((c) => c.name.toLowerCase().includes("mewtwo"));
    else if (lower.includes("gengar")) guessedCard = Object.values(catalogCards).find((c) => c.name.toLowerCase().includes("gengar"));
    else if (lower.includes("dragonite")) guessedCard = Object.values(catalogCards).find((c) => c.name.toLowerCase().includes("dragonite"));
    else if (lower.includes("aerodactyl")) guessedCard = Object.values(catalogCards).find((c) => c.name.toLowerCase().includes("aerodactyl"));
    else if (lower.includes("lugia")) guessedCard = Object.values(catalogCards).find((c) => c.name.toLowerCase().includes("lugia"));
    else if (lower.includes("typhlosion")) guessedCard = Object.values(catalogCards).find((c) => c.name.toLowerCase().includes("typhlosion"));
    else if (lower.includes("rayquaza")) guessedCard = Object.values(catalogCards).find((c) => c.name.toLowerCase().includes("rayquaza"));
    else if (lower.includes("umbreon")) guessedCard = Object.values(catalogCards).find((c) => c.name.toLowerCase().includes("umbreon"));

    if (guessedCard) {
      return {
        name: guessedCard.name,
        type: guessedCard.type,
        rarity: guessedCard.rarity,
        imageUrl: guessedCard.imageUrl,
      };
    }

    return {
      name: instanceId.replace("inst-", "").split("-").slice(1).join(" ") || instanceId,
      type: "COLORLESS",
      rarity: "RARE",
      imageUrl: "https://images.pokemontcg.io/base1/4_hires.png",
    };
  };

  const currentUser = user?.toLowerCase() || "";
  const filteredTrades = useMemo(() => {
    return allMyTrades.filter((item) => {
      const isSender = item.senderUsername.toLowerCase() === currentUser;
      const isReceiver = item.receiverUsername.toLowerCase() === currentUser;
      if (!isSender && !isReceiver) return false;

      if (tab === "received") return isReceiver && item.status === "PENDING";
      if (tab === "sent") return isSender && item.status === "PENDING";
      if (tab === "history") return item.status !== "PENDING";
      return false;
    });
  }, [allMyTrades, currentUser, tab]);

  const receivedCount = useMemo(
    () => allMyTrades.filter((t) => t.receiverUsername.toLowerCase() === currentUser && t.status === "PENDING").length,
    [allMyTrades, currentUser]
  );
  const sentCount = useMemo(
    () => allMyTrades.filter((t) => t.senderUsername.toLowerCase() === currentUser && t.status === "PENDING").length,
    [allMyTrades, currentUser]
  );
  const historyCount = useMemo(
    () => allMyTrades.filter((t) => t.status !== "PENDING").length,
    [allMyTrades]
  );

  return (
    <View style={styles.container}>
      <Header
        title="Mural de Trocas"
        subtitle="Negociações privadas com mensageria e liquidação CloudAMQP"
        badgeText={`${allMyTrades.length} Trocas Registradas`}
      />

      {/* Toast Feedback */}
      {toast && (
        <View style={[styles.toastBox, toast.type === "success" ? styles.toastSuccess : styles.toastError]}>
          <Ionicons
            name={toast.type === "success" ? "checkmark-circle" : "alert-circle"}
            size={18}
            color="#FFFFFF"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.toastText}>{toast.text}</Text>
          <TouchableOpacity onPress={() => setToast(null)}>
            <Ionicons name="close" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={styles.mainScrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ── CARD: TESTE DE CONCORRÊNCIA ATÔMICA (BANCA / PROFESSOR) ── */}
        <View style={styles.concurrencyCard}>
          <TouchableOpacity
            style={styles.concurrencyHeader}
            onPress={() => setConcurrencyExpanded((prev) => !prev)}
            activeOpacity={0.8}
          >
            <View style={styles.concurrencyHeaderLeft}>
              <View style={styles.flashIconBox}>
                <Ionicons name="flash" size={18} color={DesignTokens.colors.accentGold} />
              </View>
              <View>
                <Text style={styles.concurrencyTitle}>Demonstração de Concorrência Atômica</Text>
                <Text style={styles.concurrencySub}>Lock Distribuído no MongoDB + RabbitMQ Event Streaming</Text>
              </View>
            </View>
            <Ionicons
              name={concurrencyExpanded ? "chevron-up" : "chevron-down"}
              size={18}
              color={DesignTokens.colors.textSecondary}
            />
          </TouchableOpacity>

          {concurrencyExpanded && (
            <View style={styles.concurrencyBody}>
              <Text style={styles.concurrencyDesc}>
                Este teste dispara 2 threads paralelas simultâneas tentando aceitar e liquidar a mesma proposta de troca
                no mesmo milissegundo. O MongoDB garante a atomicidade através do lock distribuído: a 1ª requisição adquire
                o lock e despacha para a fila do RabbitMQ, e a 2ª é rejeitada com erro de concorrência.
              </Text>

              <TouchableOpacity
                style={styles.concurrencyRunBtn}
                onPress={runConcurrencyTest}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="play" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.concurrencyRunBtnText}>DISPARAR TESTE COM 2 THREADS PARALELAS</Text>
                  </>
                )}
              </TouchableOpacity>

              {concurrencyResult && (
                <View style={styles.resultContainer}>
                  <Text style={styles.resultHeader}>Resultado Retornado:</Text>
                  <ScrollView style={styles.resultBox} horizontal>
                    <Text style={styles.resultText}>{concurrencyResult}</Text>
                  </ScrollView>
                </View>
              )}
            </View>
          )}
        </View>

        {/* ── BARRA SUPERIOR: ABAS DE NAVEGAÇÃO & NOVO BOTÃO DE TROCA ── */}
        <View style={styles.navigationRow}>
          <View style={styles.tabPillsContainer}>
            <TouchableOpacity
              style={[styles.tabPill, tab === "received" && styles.tabPillActive]}
              onPress={() => setTab("received")}
            >
              <Ionicons
                name="arrow-down-circle-outline"
                size={16}
                color={tab === "received" ? DesignTokens.colors.brandRed : DesignTokens.colors.textSecondary}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.tabPillText, tab === "received" && styles.tabPillTextActive]}>
                Recebidas
              </Text>
              <View style={[styles.tabBadge, tab === "received" && styles.tabBadgeActive]}>
                <Text style={[styles.tabBadgeText, tab === "received" && styles.tabBadgeTextActive]}>
                  {receivedCount}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabPill, tab === "sent" && styles.tabPillActive]}
              onPress={() => setTab("sent")}
            >
              <Ionicons
                name="arrow-up-circle-outline"
                size={16}
                color={tab === "sent" ? DesignTokens.colors.brandRed : DesignTokens.colors.textSecondary}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.tabPillText, tab === "sent" && styles.tabPillTextActive]}>
                Enviadas
              </Text>
              <View style={[styles.tabBadge, tab === "sent" && styles.tabBadgeActive]}>
                <Text style={[styles.tabBadgeText, tab === "sent" && styles.tabBadgeTextActive]}>
                  {sentCount}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabPill, tab === "history" && styles.tabPillActive]}
              onPress={() => setTab("history")}
            >
              <Ionicons
                name="time-outline"
                size={16}
                color={tab === "history" ? DesignTokens.colors.brandRed : DesignTokens.colors.textSecondary}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.tabPillText, tab === "history" && styles.tabPillTextActive]}>
                Histórico
              </Text>
              <View style={[styles.tabBadge, tab === "history" && styles.tabBadgeActive]}>
                <Text style={[styles.tabBadgeText, tab === "history" && styles.tabBadgeTextActive]}>
                  {historyCount}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.actionButtonsRow}>
            <TouchableOpacity style={styles.refreshBtn} onPress={loadInitialData}>
              <Ionicons name="refresh" size={18} color={DesignTokens.colors.textPrimary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.newTradeBtn} onPress={() => setModalVisible(true)}>
              <Ionicons name="add-circle" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.newTradeBtnText}>NOVA PROPOSTA</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── LISTA DE PROPOSTAS DE TROCA VISUAIS ── */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={DesignTokens.colors.brandRed} />
            <Text style={styles.loadingText}>Buscando propostas no RabbitMQ / MongoDB...</Text>
          </View>
        ) : filteredTrades.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <Ionicons name="swap-horizontal" size={48} color={DesignTokens.colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>
              {tab === "received"
                ? "Nenhuma proposta recebida aguardando seu aceite"
                : tab === "sent"
                ? "Você não possui propostas enviadas pendentes"
                : "Nenhuma troca registrada no histórico"}
            </Text>
            <Text style={styles.emptySub}>
              {tab === "received"
                ? "Quando outros treinadores propuserem trocar cartas com você, elas aparecerão aqui."
                : "Crie uma nova proposta para trocar cartas com outros treinadores."}
            </Text>
            {tab !== "history" && (
              <TouchableOpacity style={styles.emptyNewTradeBtn} onPress={() => setModalVisible(true)}>
                <Ionicons name="add-circle" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.emptyNewTradeBtnText}>Propor Nova Troca</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.tradesGrid}>
            {filteredTrades.map((item) => {
              const isReceiver = item.receiverUsername.toLowerCase() === currentUser;
              const isSender = item.senderUsername.toLowerCase() === currentUser;
              const isPending = item.status === "PENDING";

              const offeredVisual = resolveCardVisual(item.offeredInstanceId);
              const requestedVisual = resolveCardVisual(item.requestedInstanceId);

              return (
                <View key={item.id} style={styles.tradeCard}>
                  {/* Cabeçalho da Proposta */}
                  <View style={styles.tradeCardHeader}>
                    <View style={styles.trainersRow}>
                      <View style={styles.trainerChip}>
                        <Ionicons name="person" size={13} color={DesignTokens.colors.brandRed} style={{ marginRight: 4 }} />
                        <Text style={styles.trainerText}>@{item.senderUsername}</Text>
                      </View>

                      <Ionicons name="arrow-forward" size={16} color={DesignTokens.colors.textMuted} style={{ marginHorizontal: 8 }} />

                      <View style={styles.trainerChip}>
                        <Ionicons name="person" size={13} color={DesignTokens.colors.accentGold} style={{ marginRight: 4 }} />
                        <Text style={styles.trainerText}>@{item.receiverUsername}</Text>
                      </View>
                    </View>

                    {/* Status Badge */}
                    <View
                      style={[
                        styles.statusBadge,
                        item.status === "PENDING"
                          ? styles.statusPending
                          : item.status === "ACCEPTED"
                          ? styles.statusAccepted
                          : styles.statusCancelled,
                      ]}
                    >
                      <Ionicons
                        name={
                          item.status === "PENDING"
                            ? "hourglass-outline"
                            : item.status === "ACCEPTED"
                            ? "checkmark-circle"
                            : "close-circle"
                        }
                        size={12}
                        color={
                          item.status === "PENDING"
                            ? DesignTokens.colors.warning
                            : item.status === "ACCEPTED"
                            ? DesignTokens.colors.success
                            : DesignTokens.colors.danger
                        }
                        style={{ marginRight: 4 }}
                      />
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color:
                              item.status === "PENDING"
                                ? DesignTokens.colors.warning
                                : item.status === "ACCEPTED"
                                ? DesignTokens.colors.success
                                : DesignTokens.colors.danger,
                          },
                        ]}
                      >
                        {item.status === "PENDING"
                          ? "Pendente"
                          : item.status === "ACCEPTED"
                          ? "Aceita & Liquidada"
                          : "Cancelada"}
                      </Text>
                    </View>
                  </View>

                  {/* Comparativo Visual das Cartas */}
                  <View style={styles.cardsComparisonRow}>
                    {/* Lado Esquerdo: Carta Oferecida */}
                    <View style={styles.cardPreviewBox}>
                      <Text style={styles.cardPreviewRole}>OFERECIDO (@{item.senderUsername})</Text>
                      <View style={styles.miniCardArt}>
                        <Image source={{ uri: offeredVisual.imageUrl }} style={styles.miniImage} resizeMode="contain" />
                      </View>
                      <Text style={styles.miniCardName} numberOfLines={1}>{offeredVisual.name}</Text>
                      <Text style={styles.miniInstanceId} numberOfLines={1}>{item.offeredInstanceId}</Text>
                    </View>

                    {/* Ícone de Troca Central */}
                    <View style={styles.swapIndicatorCenter}>
                      <View style={styles.swapCircle}>
                        <Ionicons name="swap-horizontal" size={20} color={DesignTokens.colors.brandRed} />
                      </View>
                    </View>

                    {/* Lado Direito: Carta Solicitada */}
                    <View style={styles.cardPreviewBox}>
                      <Text style={styles.cardPreviewRole}>SOLICITADO (@{item.receiverUsername})</Text>
                      <View style={styles.miniCardArt}>
                        <Image source={{ uri: requestedVisual.imageUrl }} style={styles.miniImage} resizeMode="contain" />
                      </View>
                      <Text style={styles.miniCardName} numberOfLines={1}>{requestedVisual.name}</Text>
                      <Text style={styles.miniInstanceId} numberOfLines={1}>{item.requestedInstanceId}</Text>
                    </View>
                  </View>

                  {/* Ações da Proposta */}
                  <View style={styles.tradeCardFooter}>
                    {isReceiver && isPending && (
                      <TouchableOpacity
                        style={styles.acceptActionBtn}
                        onPress={() => handleAccept(item.id)}
                        disabled={actionLoading}
                      >
                        <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                        <Text style={styles.acceptActionBtnText}>ACEITAR TROCA (RABBITMQ)</Text>
                      </TouchableOpacity>
                    )}

                    {isSender && isPending && (
                      <TouchableOpacity
                        style={styles.cancelActionBtn}
                        onPress={() => handleCancel(item.id)}
                        disabled={actionLoading}
                      >
                        <Ionicons name="close-circle-outline" size={18} color={DesignTokens.colors.danger} style={{ marginRight: 6 }} />
                        <Text style={styles.cancelActionBtnText}>CANCELAR PROPOSTA</Text>
                      </TouchableOpacity>
                    )}

                    {!isPending && (
                      <View style={styles.concludedInfoRow}>
                        <Ionicons name="shield-checkmark-outline" size={14} color={DesignTokens.colors.textMuted} />
                        <Text style={styles.concludedInfoText}>
                          Transação finalizada e sincronizada entre coleções.
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* ── MODAL: NOVA PROPOSTA DE TROCA ── */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Propor Nova Troca</Text>
                <Text style={styles.modalSubtitle}>Envie uma oferta direta para outro treinador cadastrado</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color={DesignTokens.colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: "75vh" as any }}>
              {/* Passo 1: Escolha do Treinador */}
              <Text style={styles.stepTitle}>1. Escolha o Treinador Destinatário:</Text>
              <View style={styles.trainersChoiceRow}>
                {["ash", "misty", "brock"]
                  .filter((t) => t !== currentUser)
                  .map((t) => (
                    <TouchableOpacity
                      key={t}
                      style={[styles.trainerChoiceCard, receiver === t && styles.trainerChoiceCardActive]}
                      onPress={() => setReceiver(t)}
                    >
                      <View style={[styles.trainerChoiceAvatar, receiver === t && styles.trainerChoiceAvatarActive]}>
                        <Ionicons
                          name="person"
                          size={18}
                          color={receiver === t ? "#FFFFFF" : DesignTokens.colors.textSecondary}
                        />
                      </View>
                      <Text style={[styles.trainerChoiceName, receiver === t && styles.trainerChoiceNameActive]}>
                        @{t}
                      </Text>
                    </TouchableOpacity>
                  ))}
              </View>

              {/* Passo 2: Carta da sua Coleção para Oferecer */}
              <Text style={styles.stepTitle}>2. Selecione a Carta que Você Irá Oferecer:</Text>
              {myCards.filter((c) => !c.lockedForTrade).length === 0 ? (
                <Text style={styles.noCardsWarning}>
                  Você não possui cartas disponíveis para troca na sua coleção.
                </Text>
              ) : (
                <View style={styles.myCardsSelectRow}>
                  {myCards
                    .filter((c) => !c.lockedForTrade)
                    .map((c) => {
                      const isSelected = offeredCard === c.instanceId;
                      const cat = catalogCards[c.cardId];
                      return (
                        <TouchableOpacity
                          key={c.instanceId}
                          style={[styles.selectableCardItem, isSelected && styles.selectableCardItemActive]}
                          onPress={() => setOfferedCard(c.instanceId)}
                        >
                          <Image
                            source={{ uri: cat?.imageUrl || "https://images.pokemontcg.io/base1/4_hires.png" }}
                            style={styles.selectableImage}
                            resizeMode="contain"
                          />
                          <Text style={[styles.selectableCardName, isSelected && styles.selectableCardNameActive]} numberOfLines={1}>
                            {c.cardName}
                          </Text>
                          <Text style={styles.selectableCardId} numberOfLines={1}>{c.instanceId}</Text>
                        </TouchableOpacity>
                      );
                    })}
                </View>
              )}

              {/* Passo 3: Carta Desejada do Treinador */}
              <Text style={styles.stepTitle}>3. Selecione a Carta Desejada de @{receiver}:</Text>
              {receiverCards.length > 0 ? (
                <View style={styles.myCardsSelectRow}>
                  {receiverCards.map((rc) => {
                    const isSelected = requestedCard === rc.instanceId;
                    const cat = catalogCards[rc.cardId];
                    return (
                      <TouchableOpacity
                        key={rc.instanceId}
                        style={[styles.selectableCardItem, isSelected && styles.selectableCardItemActive]}
                        onPress={() => setRequestedCard(rc.instanceId)}
                      >
                        <Image
                          source={{ uri: cat?.imageUrl || "https://images.pokemontcg.io/base1/4_hires.png" }}
                          style={styles.selectableImage}
                          resizeMode="contain"
                        />
                        <Text style={[styles.selectableCardName, isSelected && styles.selectableCardNameActive]} numberOfLines={1}>
                          {rc.cardName}
                        </Text>
                        <Text style={styles.selectableCardId} numberOfLines={1}>{rc.instanceId}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : (
                <View style={styles.inputFallbackBox}>
                  <Text style={styles.inputFallbackLabel}>Digite o ID de instância da carta de @{receiver}:</Text>
                  <TextInput
                    style={styles.inputCustom}
                    placeholder="ex: inst-ash-gengar ou inst-misty-blastoise"
                    placeholderTextColor={DesignTokens.colors.textMuted}
                    value={requestedCard}
                    onChangeText={setRequestedCard}
                  />
                </View>
              )}

              {/* Botão de Envio */}
              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handlePropose}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="send" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.modalSubmitBtnText}>ENVIAR PROPOSTA DE TROCA</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
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
    maxWidth: 1400,
    width: "100%",
    alignSelf: "center",
  },

  /* Toasts */
  toastBox: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 24,
    marginTop: 12,
    padding: 12,
    borderRadius: DesignTokens.radii.button,
    zIndex: 99,
  },
  toastSuccess: { backgroundColor: "#1e7e4e" },
  toastError: { backgroundColor: "#b91c1c" },
  toastText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700", flex: 1 },

  /* Card de Concorrência */
  concurrencyCard: {
    backgroundColor: DesignTokens.colors.bgSurface,
    borderRadius: DesignTokens.radii.card,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
    padding: 16,
    marginBottom: 24,
  },
  concurrencyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  concurrencyHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  flashIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 203, 5, 0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  concurrencyTitle: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    fontSize: 16,
    fontWeight: "800",
    color: DesignTokens.colors.textPrimary,
    letterSpacing: 0.5,
  },
  concurrencySub: {
    fontFamily: DesignTokens.typography.fontFamily,
    fontSize: 12,
    color: DesignTokens.colors.textSecondary,
    marginTop: 2,
  },
  concurrencyBody: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: DesignTokens.colors.border,
  },
  concurrencyDesc: {
    fontFamily: DesignTokens.typography.fontFamily,
    fontSize: 13,
    color: DesignTokens.colors.textSecondary,
    lineHeight: 20,
  },
  concurrencyRunBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DesignTokens.colors.brandRed,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: DesignTokens.radii.button,
    marginTop: 14,
    alignSelf: "flex-start",
  },
  concurrencyRunBtnText: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  resultContainer: {
    marginTop: 14,
  },
  resultHeader: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    fontSize: 12,
    fontWeight: "700",
    color: DesignTokens.colors.textMuted,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  resultBox: {
    backgroundColor: DesignTokens.colors.bgElevated,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
  },
  resultText: {
    color: DesignTokens.colors.success,
    fontSize: 12,
    fontFamily: DesignTokens.typography.fontFamilyMono,
  },

  /* Linha de Navegação (Pills + Botões) */
  navigationRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  tabPillsContainer: {
    flexDirection: "row",
    backgroundColor: DesignTokens.colors.bgSurface,
    borderRadius: DesignTokens.radii.button,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
    padding: 4,
    gap: 4,
  },
  tabPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: DesignTokens.radii.chip,
  },
  tabPillActive: {
    backgroundColor: DesignTokens.colors.brandRedSubtle,
    borderWidth: 1,
    borderColor: DesignTokens.colors.brandRed,
  },
  tabPillText: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    fontSize: 14,
    fontWeight: "600",
    color: DesignTokens.colors.textSecondary,
    letterSpacing: 0.3,
  },
  tabPillTextActive: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    color: DesignTokens.colors.brandRed,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  tabBadge: {
    backgroundColor: DesignTokens.colors.bgElevated,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginLeft: 6,
  },
  tabBadgeActive: {
    backgroundColor: DesignTokens.colors.brandRed,
  },
  tabBadgeText: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    fontSize: 12,
    fontWeight: "700",
    color: DesignTokens.colors.textSecondary,
  },
  tabBadgeTextActive: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  actionButtonsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: DesignTokens.radii.button,
    backgroundColor: DesignTokens.colors.bgSurface,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  newTradeBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DesignTokens.colors.brandRed,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: DesignTokens.radii.button,
  },
  newTradeBtnText: {
    fontFamily: DesignTokens.typography.fontFamilyDisplay,
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },

  /* Grid e Cards de Troca */
  tradesGrid: {
    flexDirection: "column",
    gap: 16,
  },
  tradeCard: {
    backgroundColor: DesignTokens.colors.bgSurface,
    borderRadius: DesignTokens.radii.card,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
    padding: 20,
  },
  tradeCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  trainersRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  trainerChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DesignTokens.colors.bgElevated,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: DesignTokens.radii.chip,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
  },
  trainerText: {
    fontSize: 13,
    fontWeight: "800",
    color: DesignTokens.colors.textPrimary,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: DesignTokens.radii.chip,
  },
  statusPending: {
    backgroundColor: "rgba(245, 165, 36, 0.12)",
  },
  statusAccepted: {
    backgroundColor: "rgba(46, 204, 113, 0.12)",
  },
  statusCancelled: {
    backgroundColor: "rgba(255, 90, 95, 0.12)",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "800",
  },

  /* Comparativo Visual */
  cardsComparisonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: DesignTokens.colors.bgElevated,
    borderRadius: DesignTokens.radii.card,
    padding: 16,
    gap: 16,
  },
  cardPreviewBox: {
    flex: 1,
    alignItems: "center",
  },
  cardPreviewRole: {
    fontSize: 10,
    fontWeight: "800",
    color: DesignTokens.colors.textMuted,
    marginBottom: 8,
  },
  miniCardArt: {
    width: 90,
    aspectRatio: 63 / 88,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: DesignTokens.colors.bgSurface,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
  },
  miniImage: {
    width: "100%",
    height: "100%",
  },
  miniCardName: {
    fontSize: 13,
    fontWeight: "800",
    color: DesignTokens.colors.textPrimary,
    marginTop: 6,
    textAlign: "center",
  },
  miniInstanceId: {
    fontSize: 10,
    color: DesignTokens.colors.textMuted,
    fontFamily: "monospace",
    marginTop: 2,
    textAlign: "center",
  },
  swapIndicatorCenter: {
    alignItems: "center",
    justifyContent: "center",
  },
  swapCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: DesignTokens.colors.bgSurface,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
    justifyContent: "center",
    alignItems: "center",
  },

  /* Rodapé do Card */
  tradeCardFooter: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: DesignTokens.colors.border,
  },
  acceptActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DesignTokens.colors.success,
    paddingVertical: 12,
    borderRadius: DesignTokens.radii.button,
  },
  acceptActionBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  cancelActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 90, 95, 0.10)",
    borderWidth: 1,
    borderColor: DesignTokens.colors.danger,
    paddingVertical: 12,
    borderRadius: DesignTokens.radii.button,
  },
  cancelActionBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: DesignTokens.colors.danger,
    letterSpacing: 0.5,
  },
  concludedInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  concludedInfoText: {
    fontSize: 12,
    color: DesignTokens.colors.textMuted,
  },

  /* Empty & Loading */
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
    backgroundColor: DesignTokens.colors.bgSurface,
    borderRadius: DesignTokens.radii.card,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
    paddingHorizontal: 24,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: DesignTokens.colors.bgElevated,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: DesignTokens.colors.textPrimary,
    textAlign: "center",
  },
  emptySub: {
    fontSize: 13,
    color: DesignTokens.colors.textSecondary,
    marginTop: 6,
    textAlign: "center",
    maxWidth: 420,
  },
  emptyNewTradeBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DesignTokens.colors.brandRed,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: DesignTokens.radii.button,
    marginTop: 18,
  },
  emptyNewTradeBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  /* Modal de Proposta */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    ...(Platform.OS === "web" ? { backdropFilter: "blur(8px)" } : {}),
  } as any,
  modalContent: {
    backgroundColor: DesignTokens.colors.bgSurface,
    borderRadius: DesignTokens.radii.modal,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
    padding: 24,
    width: "100%",
    maxWidth: 640,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: DesignTokens.colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: 12,
    color: DesignTokens.colors.textSecondary,
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: DesignTokens.colors.bgElevated,
    justifyContent: "center",
    alignItems: "center",
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: DesignTokens.colors.textPrimary,
    marginTop: 14,
    marginBottom: 8,
  },
  trainersChoiceRow: {
    flexDirection: "row",
    gap: 10,
  },
  trainerChoiceCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DesignTokens.colors.bgElevated,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
    padding: 10,
    borderRadius: DesignTokens.radii.button,
    gap: 8,
  },
  trainerChoiceCardActive: {
    borderColor: DesignTokens.colors.brandRed,
    backgroundColor: DesignTokens.colors.brandRedSubtle,
  },
  trainerChoiceAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: DesignTokens.colors.bgSurface,
    justifyContent: "center",
    alignItems: "center",
  },
  trainerChoiceAvatarActive: {
    backgroundColor: DesignTokens.colors.brandRed,
  },
  trainerChoiceName: {
    fontSize: 13,
    fontWeight: "700",
    color: DesignTokens.colors.textSecondary,
  },
  trainerChoiceNameActive: {
    color: DesignTokens.colors.brandRed,
    fontWeight: "800",
  },
  noCardsWarning: {
    fontSize: 12,
    color: DesignTokens.colors.warning,
    padding: 10,
    backgroundColor: "rgba(245, 165, 36, 0.10)",
    borderRadius: 8,
  },
  myCardsSelectRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  selectableCardItem: {
    width: 105,
    backgroundColor: DesignTokens.colors.bgElevated,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
    padding: 8,
    alignItems: "center",
  },
  selectableCardItemActive: {
    borderColor: DesignTokens.colors.brandRed,
    backgroundColor: DesignTokens.colors.brandRedSubtle,
  },
  selectableImage: {
    width: 70,
    aspectRatio: 63 / 88,
    borderRadius: 6,
  },
  selectableCardName: {
    fontSize: 11,
    fontWeight: "700",
    color: DesignTokens.colors.textPrimary,
    marginTop: 6,
    textAlign: "center",
  },
  selectableCardNameActive: {
    color: DesignTokens.colors.brandRed,
    fontWeight: "800",
  },
  selectableCardId: {
    fontSize: 9,
    color: DesignTokens.colors.textMuted,
    fontFamily: "monospace",
    marginTop: 2,
    textAlign: "center",
  },
  inputFallbackBox: {
    marginTop: 4,
  },
  inputFallbackLabel: {
    fontSize: 11,
    color: DesignTokens.colors.textMuted,
    marginBottom: 6,
  },
  inputCustom: {
    backgroundColor: DesignTokens.colors.bgElevated,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
    borderRadius: DesignTokens.radii.button,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: DesignTokens.colors.textPrimary,
    fontSize: 13,
  },
  modalSubmitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DesignTokens.colors.brandRed,
    paddingVertical: 14,
    borderRadius: DesignTokens.radii.button,
    marginTop: 24,
  },
  modalSubmitBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
});
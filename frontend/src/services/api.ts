import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const getDefaultGatewayUrl = () => {
  if (Platform.OS === "android") {
    return "http://10.0.2.2:8080";
  }
  return "http://localhost:8080";
};

export const API_BASE_URL = process.env.EXPO_PUBLIC_GATEWAY_URL || getDefaultGatewayUrl();

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem("@Auth:token");
    if (token) {
      if (config.headers.set) {
        config.headers.set("Authorization", `Bearer ${token}`);
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (e) {
    console.error("Erro ao carregar token no interceptor:", e);
  }
  return config;
});

export interface Card {
  id: string;
  name: string;
  type: string;
  rarity: string;
  expansion: string;
  hp: number;
  imageUrl: string;
  marketPrice?: number;
}

export interface CardOwner {
  trainerUsername: string;
  instanceId: string;
  lockedForTrade: boolean;
}

export interface BinderItem {
  instanceId: string;
  cardId: string;
  cardName: string;
  type: string;
  rarity: string;
  ownerUsername: string;
  lockedForTrade: boolean;
}

export interface TrainerBinder {
  id: string;
  trainerUsername: string;
  cards: BinderItem[];
}

export interface TradeProposal {
  id: string;
  senderUsername: string;
  receiverUsername: string;
  offeredInstanceId: string;
  requestedInstanceId: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";
  createdAt: string;
}

export const cardService = {
  getCatalog: async (): Promise<Card[]> => {
    const res = await api.get<Card[]>("/cards/catalog");
    return res.data;
  },
  getCard: async (id: string): Promise<Card> => {
    const res = await api.get<Card>(`/cards/${id}`);
    return res.data;
  },
  getOwners: async (cardId: string): Promise<CardOwner[]> => {
    const res = await api.get<CardOwner[]>(`/cards/${cardId}/owners`);
    return res.data;
  },
  getCardsWithOffers: async (): Promise<string[]> => {
    try {
      const res = await api.get<string[]>("/cards/with-offers");
      return res.data;
    } catch {
      return [];
    }
  }
};

export const binderService = {
  getBinder: async (username: string): Promise<TrainerBinder> => {
    const res = await api.get<TrainerBinder>(`/binders/${username}`);
    return res.data;
  }
};

export const tradeService = {
  getPending: async (trainerUsername?: string): Promise<TradeProposal[]> => {
    const url = trainerUsername ? `/trades/pending?trainerUsername=${trainerUsername}` : "/trades/pending";
    const res = await api.get<TradeProposal[]>(url);
    return res.data;
  },
  getMyTrades: async (username: string): Promise<TradeProposal[]> => {
    const res = await api.get<TradeProposal[]>(`/trades/my-trades/${username}`);
    return res.data;
  },
  propose: async (sender: string, receiver: string, offeredInstanceId: string, requestedInstanceId: string): Promise<TradeProposal> => {
    const res = await api.post<TradeProposal>("/trades/propose", {
      senderUsername: sender,
      receiverUsername: receiver,
      offeredInstanceId,
      requestedInstanceId,
    });
    return res.data;
  },
  accept: async (tradeId: string, receiverUsername: string): Promise<TradeProposal> => {
    const res = await api.post<TradeProposal>(`/trades/accept/${tradeId}?receiverUsername=${receiverUsername}`);
    return res.data;
  },
  cancel: async (tradeId: string, senderUsername: string): Promise<void> => {
    await api.post(`/trades/cancel/${tradeId}?senderUsername=${senderUsername}`);
  },
  testConcurrency: async (sender: string, receiver: string, offeredInstanceId: string, requestedInstanceId: string) => {
    const res = await api.post(`/trades/test-concurrency?sender=${sender}&receiver=${receiver}&offeredInstanceId=${offeredInstanceId}&requestedInstanceId=${requestedInstanceId}`);
    return res.data;
  }
};
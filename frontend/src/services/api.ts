import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const API_BASE_URL = process.env.EXPO_PUBLIC_GATEWAY_URL || "http://localhost:8080";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true, // OBRIGATÓRIO: Permite que o navegador envie e receba Cookies seguros HttpOnly
});

// Interceptor global para assegurar que cookies de credenciais sejam enviados
api.interceptors.request.use((config) => {
  config.withCredentials = true;
  return config;
});

// ── MODELOS DE ATIVOS ESPACIAIS & DOCAS (AERO-OS) ──
export interface ShipAssetDTO {
  id: string;
  name: string;
  type: string;
  rarity: string;
  expansion: string;
  hp: number;
  imageUrl: string;
  marketPrice?: number;
}

export interface AssetCommander {
  officerUsername: string;
  instanceId: string;
  lockedForDispatch: boolean;
}

export interface DockedAsset {
  instanceId: string;
  assetId: string;
  assetName: string;
  name?: string;
  type: string;
  rarity: string;
  ownerUsername: string;
  lockedForDispatch: boolean;
  marketPrice?: number;
  hp?: number;
}

export interface OfficerDock {
  id: string;
  officerUsername: string;
  assets?: DockedAsset[];
  ships?: DockedAsset[];
}

export interface DispatchProposal {
  id: string;
  senderUsername: string;
  receiverUsername: string;
  offeredInstanceId: string;
  requestedInstanceId: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";
  createdAt: string;
}

// ── SERVIÇOS DE FROTA & DESPACHO ──
export const hangarService = {
  getCatalog: async (): Promise<ShipAssetDTO[]> => {
    const res = await api.get<ShipAssetDTO[]>("/assets/catalog");
    return res.data;
  },
  getAsset: async (id: string): Promise<ShipAssetDTO> => {
    const res = await api.get<ShipAssetDTO>(`/assets/${id}`);
    return res.data;
  },
  getOwners: async (assetId: string): Promise<AssetCommander[]> => {
    const res = await api.get<AssetCommander[]>(`/assets/${assetId}/commanders`);
    return res.data;
  },
  getAssetsWithOffers: async (): Promise<string[]> => {
    try {
      const res = await api.get<string[]>("/assets/with-offers");
      return res.data;
    } catch {
      return [];
    }
  },
  deleteAsset: async (id: string): Promise<void> => {
    await api.delete(`/assets/${id}`);
  }
};

export const dockService = {
  getDock: async (username: string): Promise<OfficerDock> => {
    try {
      const res = await api.get<any>(`/docks/${username.toLowerCase()}`);
      const data = res.data;
      const items: DockedAsset[] = data.ships || data.assets || [];
      const officerUser = data.officerUsername || data.commanderUsername || username;
      return {
        id: data.id || data.dockId || "",
        officerUsername: officerUser,
        assets: items,
        ships: items,
      };
    } catch {
      return {
        id: "",
        officerUsername: username,
        assets: [],
        ships: [],
      };
    }
  }
};

export const dispatchService = {
  getStationFleet: async (): Promise<OfficerDock> => {
    try {
      const res = await api.get<any>("/despacho/station-fleet");
      const data = res.data;
      const items: DockedAsset[] = data.ships || data.assets || [];
      return {
        id: data.id || "dck-station",
        officerUsername: "station_alpha_7",
        assets: items,
        ships: items,
      };
    } catch {
      return {
        id: "dck-station",
        officerUsername: "station_alpha_7",
        assets: [],
        ships: [],
      };
    }
  },
  // Requisita uma nave da estação central pro piloto logado
  requestShipFromStation: async (pilotUsername: string, shipInstanceId: string, missionRoute?: string): Promise<DispatchProposal> => {
    const res = await api.post<DispatchProposal>("/despacho/request-ship", {
      pilotUsername,
      shipInstanceId,
      missionRoute: missionRoute || "PATRULHA_ORBITAL_ALPHA_7",
    });
    return res.data;
  },

  // Devolve a nave pro hangar da base
  returnShipToStation: async (instanceId: string, pilotUsername: string): Promise<DispatchProposal> => {
    const res = await api.post<DispatchProposal>(`/despacho/return-ship/${instanceId}?pilotUsername=${pilotUsername}`);
    return res.data;
  },

  // Exclusivo para ADMIN: cadastra uma nova nave na estação central e no catálogo
  addShipToStation: async (shipData: {
    name: string;
    type?: string;
    rarity?: string;
    hp?: number;
    marketPrice?: number;
  }): Promise<DockedAsset> => {
    const res = await api.post<DockedAsset>("/despacho/station-fleet/ship", shipData);
    return res.data;
  },

  // Exclusivo para ADMIN: remove uma nave da frota da estação central
  removeShipFromStation: async (instanceId: string): Promise<void> => {
    await api.delete(`/despacho/station-fleet/ship/${instanceId}`);
  },

  // Busca ordens pendentes
  getPending: async (officerUsername?: string): Promise<DispatchProposal[]> => {
    const url = officerUsername ? `/despacho/pending?officerUsername=${officerUsername}` : "/despacho/pending";
    const res = await api.get<DispatchProposal[]>(url);
    return res.data;
  },

  // Busca as ordens do oficial logado
  getMyOrders: async (username: string): Promise<DispatchProposal[]> => {
    const cleanUser = encodeURIComponent(username.trim());
    const res = await api.get<DispatchProposal[]>(`/despacho/my-orders/${cleanUser}`);
    return res.data;
  },

  // Busca todas as ordens globais da estação (para ADMIN ou auditoria)
  getAllOrders: async (): Promise<DispatchProposal[]> => {
    try {
      const res = await api.get<DispatchProposal[]>("/despacho/all-orders");
      return res.data;
    } catch {
      return [];
    }
  },

  // Envia uma proposta de cessão ou despacho entre dois oficiais
  propose: async (sender: string, receiver: string, offeredInstanceId: string, requestedInstanceId: string): Promise<DispatchProposal> => {
    const res = await api.post<DispatchProposal>("/despacho/propose", {
      senderUsername: sender,
      receiverUsername: receiver,
      offeredInstanceId,
      requestedInstanceId,
    });
    return res.data;
  },

  // Aceita uma proposta de despacho
  accept: async (orderId: string, receiverUsername: string): Promise<DispatchProposal> => {
    const res = await api.post<DispatchProposal>(`/despacho/accept/${orderId}?receiverUsername=${receiverUsername}`);
    return res.data;
  },

  // Cancela a ordem
  cancel: async (orderId: string, senderUsername: string): Promise<void> => {
    await api.post(`/despacho/cancel/${orderId}?senderUsername=${senderUsername}`);
  }
};

// ── SERVIÇOS DE ESTOQUE & HANGAR ──
export const estoqueService = {
  // Lista as naves com filtros opcionais de classe e status
  listNaves: async (classType?: string, status?: string) => {
    let url = "/estoque/naves";
    const params = new URLSearchParams();
    if (classType) params.append("classType", classType);
    if (status) params.append("status", status);
    if (params.toString()) url += `?${params.toString()}`;
    const res = await api.get(url);
    return res.data;
  },
  getNave: async (code: string) => {
    const res = await api.get(`/estoque/naves/${code}`);
    return res.data;
  },
  lockNave: async (code: string, pilot: string) => {
    const res = await api.post(`/estoque/naves/${code}/travar?pilot=${pilot}`);
    return res.data;
  },
  releaseNave: async (code: string) => {
    const res = await api.post(`/estoque/naves/${code}/liberar`);
    return res.data;
  },
  listDocas: async () => {
    const res = await api.get("/estoque/docas");
    return res.data;
  },
  listArsenal: async () => {
    const res = await api.get("/estoque/arsenal");
    return res.data;
  },
  listCriticalArsenal: async () => {
    const res = await api.get("/estoque/arsenal/criticos");
    return res.data;
  },
  reporPecas: async (code: string, quantidade: number = 10) => {
    const res = await api.post(`/estoque/arsenal/${code}/repor?quantidade=${quantidade}`);
    return res.data;
  },
  getMetricas: async () => {
    const res = await api.get("/estoque/metricas");
    return res.data;
  }
};

export const relatorioService = {
  getExecutiveReport: async () => {
    const res = await api.get("/relatorios/geral");
    return res.data;
  },
  getFuelReport: async () => {
    const res = await api.get("/relatorios/combustivel");
    return res.data;
  },
  getAuditTrail: async () => {
    const res = await api.get("/relatorios/auditoria");
    return res.data;
  },
  getClusterHealth: async () => {
    const res = await api.get("/relatorios/cluster");
    return res.data;
  }
};
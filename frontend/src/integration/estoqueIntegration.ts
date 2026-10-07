import { httpClient } from "./httpClient";
import { ShipStockItem, DockBayStockItem, ArsenalStockItem, HangarMetricsStock } from "../@types/hangar";

// Comunicação do frontend com o microsserviço de Estoque (porta 8082 através do Gateway)
export const estoqueIntegration = {
  // Lista todas as naves do catálogo de estoque, podendo filtrar por classe ou status
  listNaves: async (classType?: string, status?: string): Promise<ShipStockItem[]> => {
    let url = "/estoque/naves";
    const params = new URLSearchParams();
    if (classType) params.append("classType", classType);
    if (status) params.append("status", status);
    if (params.toString()) url += `?${params.toString()}`;
    const res = await httpClient.get(url);
    return res.data;
  },

  // Consulta uma nave específica pelo código
  getNave: async (code: string): Promise<ShipStockItem> => {
    const res = await httpClient.get(`/estoque/naves/${code}`);
    return res.data;
  },

  // Trava temporariamente a nave para um piloto específico
  travarNave: async (code: string, pilot: string): Promise<ShipStockItem> => {
    const res = await httpClient.post(`/estoque/naves/${code}/travar?pilot=${pilot}`);
    return res.data;
  },

  // Libera a trava da nave no estoque
  liberarNave: async (code: string): Promise<ShipStockItem> => {
    const res = await httpClient.post(`/estoque/naves/${code}/liberar`);
    return res.data;
  },

  // Lista todas as baías/docas do hangar
  listDocas: async (): Promise<DockBayStockItem[]> => {
    const res = await httpClient.get("/estoque/docas");
    return res.data;
  },

  // Lista os componentes e peças de manutenção do arsenal
  listArsenal: async (): Promise<ArsenalStockItem[]> => {
    const res = await httpClient.get("/estoque/arsenal");
    return res.data;
  },

  // Filtra as peças que estão com estoque baixo/crítico
  listArsenalCriticos: async (): Promise<ArsenalStockItem[]> => {
    const res = await httpClient.get("/estoque/arsenal/criticos");
    return res.data;
  },

  // Repõe unidades de uma peça no estoque
  reporPecas: async (code: string, quantidade: number = 10): Promise<ArsenalStockItem> => {
    const res = await httpClient.post(`/estoque/arsenal/${code}/repor?quantidade=${quantidade}`);
    return res.data;
  },

  // Consulta métricas operacionais do hangar
  getMetricas: async (): Promise<HangarMetricsStock> => {
    const res = await httpClient.get("/estoque/metricas");
    return res.data;
  },
};


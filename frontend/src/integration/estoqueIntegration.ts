import { estoqueHttpClient } from "./httpClient";
import { ShipStockItem, DockBayStockItem, ArsenalStockItem, HangarMetricsStock } from "../@types/hangar";

// Comunicação do frontend com o microsserviço de Estoque (URL via variável de ambiente)
export const estoqueIntegration = {
  // Lista todas as naves do catálogo de estoque, podendo filtrar por classe ou status
  listNaves: async (classType?: string, status?: string): Promise<ShipStockItem[]> => {
    let url = "/estoque/naves";
    const params = new URLSearchParams();
    if (classType) params.append("classType", classType);
    if (status) params.append("status", status);
    if (params.toString()) url += `?${params.toString()}`;
    const res = await estoqueHttpClient.get(url);
    return res.data;
  },

  // Consulta uma nave específica pelo código
  getNave: async (code: string): Promise<ShipStockItem> => {
    const res = await estoqueHttpClient.get(`/estoque/naves/${code}`);
    return res.data;
  },

  // Trava temporariamente a nave para um piloto específico
  travarNave: async (code: string, pilot: string): Promise<ShipStockItem> => {
    const res = await estoqueHttpClient.post(`/estoque/naves/${code}/travar?pilot=${pilot}`);
    return res.data;
  },

  // Libera a trava da nave no estoque
  liberarNave: async (code: string): Promise<ShipStockItem> => {
    const res = await estoqueHttpClient.post(`/estoque/naves/${code}/liberar`);
    return res.data;
  },

  // Lista todas as baías/docas do hangar
  listDocas: async (): Promise<DockBayStockItem[]> => {
    const res = await estoqueHttpClient.get("/estoque/docas");
    return res.data;
  },

  // Lista os componentes e peças de manutenção do arsenal
  listArsenal: async (): Promise<ArsenalStockItem[]> => {
    const res = await estoqueHttpClient.get("/estoque/arsenal");
    return res.data;
  },

  // Filtra as peças que estão com estoque baixo/crítico
  listArsenalCriticos: async (): Promise<ArsenalStockItem[]> => {
    const res = await estoqueHttpClient.get("/estoque/arsenal/criticos");
    return res.data;
  },

  // Repõe unidades de uma peça no estoque
  reporPecas: async (code: string, quantidade: number = 10): Promise<ArsenalStockItem> => {
    const res = await estoqueHttpClient.post(`/estoque/arsenal/${code}/repor?quantidade=${quantidade}`);
    return res.data;
  },

  // Consulta métricas operacionais do hangar
  getMetricas: async (): Promise<HangarMetricsStock> => {
    const res = await estoqueHttpClient.get("/estoque/metricas");
    return res.data;
  },
};


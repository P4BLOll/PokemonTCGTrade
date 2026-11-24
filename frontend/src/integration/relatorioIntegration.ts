import { relatorioHttpClient } from "./httpClient";
import { ExecutiveReport, FuelReport, ClusterStatus } from "../@types/hangar";

// Comunicação do frontend com o microsserviço de Relatórios (URL via variável de ambiente)
export const relatorioIntegration = {
  // Busca o sumário executivo com total de naves, ordens e estoque
  getRelatorioGeral: async (): Promise<ExecutiveReport> => {
    const res = await relatorioHttpClient.get("/relatorios/geral");
    return res.data;
  },

  // Busca o consumo de combustível e taxas de queima por setor
  getRelatorioCombustivel: async (): Promise<FuelReport> => {
    const res = await relatorioHttpClient.get("/relatorios/combustivel");
    return res.data;
  },

  // Busca o histórico de auditoria de despachos
  getRelatorioAuditoria: async (): Promise<any[]> => {
    const res = await relatorioHttpClient.get("/relatorios/auditoria");
    return res.data;
  },

  // Busca o status de saúde e latência de cada microsserviço no cluster
  getClusterHealth: async (): Promise<ClusterStatus> => {
    const res = await relatorioHttpClient.get("/relatorios/cluster");
    return res.data;
  },
};


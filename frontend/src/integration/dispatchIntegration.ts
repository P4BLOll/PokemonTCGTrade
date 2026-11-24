import { despachoHttpClient } from "./httpClient";
import { OfficerDock, DispatchOrder } from "../@types/hangar";

// Comunicação do frontend com o microsserviço de Despacho (URL via variável de ambiente)
export const dispatchIntegration = {
  // Busca todas as naves da Estação Central Alpha-7
  getStationFleet: async (): Promise<OfficerDock> => {
    const res = await despachoHttpClient.get("/despacho/frota-estacao");
    return res.data;
  },

  // Piloto requisita uma nave do hangar central
  requestShipFromStation: async (pilotUsername: string, shipInstanceId: string, missionRoute?: string): Promise<DispatchOrder> => {
    const res = await despachoHttpClient.post("/despacho/requisitar-nave", { pilotUsername, shipInstanceId, missionRoute });
    return res.data;
  },

  // Piloto devolve a nave para a estação
  returnShipToStation: async (pilotUsername: string, shipInstanceId: string): Promise<DispatchOrder> => {
    const res = await despachoHttpClient.post("/despacho/devolver-nave", { pilotUsername, shipInstanceId });
    return res.data;
  },

  // Lista ordens de despacho pendentes
  getPendingOrders: async (): Promise<DispatchOrder[]> => {
    const res = await despachoHttpClient.get("/despacho/pending");
    return res.data;
  },

  // Busca as naves que pertencem à baía de um oficial
  getUserDock: async (username: string): Promise<OfficerDock> => {
    const res = await despachoHttpClient.get(`/docks/${username}`);
    return res.data;
  },

  // Propõe uma nova ordem de despacho e cessão operacional
  proposeOrder: async (data: { sender: string; receiver: string; offeredInstanceId: string; requestedInstanceId: string }): Promise<DispatchOrder> => {
    const res = await despachoHttpClient.post("/despacho/propose", data);
    return res.data;
  },

  // Aceita uma proposta de despacho recebida
  acceptOrder: async (orderId: string, receiver: string): Promise<DispatchOrder> => {
    const res = await despachoHttpClient.post(`/despacho/accept/${orderId}?receiver=${receiver}`);
    return res.data;
  },

  // Cancela uma proposta enviada e destrava a nave no MongoDB
  cancelOrder: async (orderId: string, sender: string): Promise<void> => {
    await despachoHttpClient.post(`/despacho/cancel/${orderId}?sender=${sender}`);
  },
};



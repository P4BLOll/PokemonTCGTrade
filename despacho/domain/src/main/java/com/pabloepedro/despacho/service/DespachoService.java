package com.pabloepedro.despacho.service;

import com.pabloepedro.despacho.entity.Despacho;
import com.pabloepedro.despacho.entity.DockedAsset;
import com.pabloepedro.despacho.entity.OfficerDock;
import com.pabloepedro.despacho.entity.enumerable.Rarity;
import com.pabloepedro.despacho.entity.enumerable.ShipClass;

/**
 * Contrato de serviço de negócio de despacho e locação da frota.
 * Pertence ao Domínio (Clean Architecture / Inversão de Dependências).
 */
public interface DespachoService {
    OfficerDock getStationFleet();
    DockedAsset addShipToStationFleet(String name, ShipClass type, Rarity rarity, int hp, double marketPrice);
    void removeShipFromStationFleet(String instanceId);
    Despacho requestShipFromStation(String pilotUsername, String shipInstanceId, String missionRoute);
    Despacho returnShipToStation(String pilotUsername, String instanceId);
    Despacho proposeDespacho(String senderUsername, String receiverUsername, String offeredInstanceId, String requestedInstanceId);
    Despacho acceptDespacho(String orderId, String receiverUsername);
    void cancelDespacho(String orderId, String senderUsername);
}

package com.pabloepedro.estoque.service;

import com.pabloepedro.estoque.entity.ArsenalComponent;
import com.pabloepedro.estoque.entity.DockBay;
import com.pabloepedro.estoque.entity.ShipAsset;
import com.pabloepedro.estoque.event.DespachoEstoqueEvento;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Contrato de serviço de negócio do inventário do Hangar e Estoque.
 * Pertence ao Domínio (Clean Architecture / Inversão de Dependências).
 */
public interface HangarInventoryService {
    List<ShipAsset> listAllShips(String classFilter, String statusFilter);
    Optional<ShipAsset> getShip(String code);
    ShipAsset lockShipForDispatch(String code, String pilotCallsign);
    ShipAsset releaseShip(String code);
    List<ArsenalComponent> listArsenal();
    List<ArsenalComponent> listCriticalArsenal();
    ArsenalComponent replenishStock(String code, int unitsToAdd);
    List<DockBay> listDockBays();
    Map<String, Object> getHangarMetrics();

    // Contrato de mutação de estoque disparado via Mensageria RabbitMQ
    void processarEventoDespacho(DespachoEstoqueEvento evento);
}

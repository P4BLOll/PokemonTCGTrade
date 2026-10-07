package com.pabloepedro.estoque.repository;

import com.pabloepedro.estoque.entity.ArsenalComponent;
import com.pabloepedro.estoque.entity.DockBay;
import com.pabloepedro.estoque.entity.ShipAsset;

import java.util.List;
import java.util.Optional;

// Contrato do domínio para manipular as naves físicas no hangar, peças e baias
public interface HangarInventoryRepository {
    // Lista todas as naves guardadas no hangar
    List<ShipAsset> findAllShips();

    // Busca uma nave pelo código (ex: INT-VALK-9)
    Optional<ShipAsset> findShipByCode(String code);

    // Salva ou atualiza a nave
    ShipAsset saveShip(ShipAsset ship);

    // Lista todas as peças do arsenal
    List<ArsenalComponent> findAllComponents();

    // Busca uma peça do arsenal pelo código
    Optional<ArsenalComponent> findComponentByCode(String code);

    // Salva ou atualiza a peça
    ArsenalComponent saveComponent(ArsenalComponent comp);

    // Lista as baias de ancoragem
    List<DockBay> findAllDockBays();

    // Salva o status de ocupação da baia
    DockBay saveDockBay(DockBay bay);
}

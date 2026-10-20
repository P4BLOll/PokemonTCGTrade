package com.pabloepedro.estoque.repository;

import com.pabloepedro.estoque.entity.ShipAsset;
import java.util.List;
import java.util.Optional;

/**
 * Porta de persistência segregada para operações com naves e vetores operacionais (ISP - SOLID).
 */
public interface ShipRepository {
    List<ShipAsset> findAllShips();
    Optional<ShipAsset> findShipByCode(String code);
    ShipAsset saveShip(ShipAsset ship);
}

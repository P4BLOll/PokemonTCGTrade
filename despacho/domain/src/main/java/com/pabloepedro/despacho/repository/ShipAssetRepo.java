package com.pabloepedro.despacho.repository;

import com.pabloepedro.despacho.entity.ShipAsset;
import java.util.List;
import java.util.Optional;

// Contrato do domínio para consultar o catálogo geral de naves
public interface ShipAssetRepo {
    // Salva ou atualiza a nave
    ShipAsset save(ShipAsset asset);

    // Busca pelo ID
    Optional<ShipAsset> findById(String id);

    // Lista todas as naves do catálogo
    List<ShipAsset> findAll();

    // Remove uma nave do catálogo
    void deleteById(String id);
}

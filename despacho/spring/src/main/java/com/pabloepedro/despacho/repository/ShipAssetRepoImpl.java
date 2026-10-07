package com.pabloepedro.despacho.repository;

import com.pabloepedro.despacho.entity.ShipAsset;
import com.pabloepedro.despacho.repository.adapter.ShipAssetRepoAdp;
import com.pabloepedro.despacho.repository.client.ShipAssetMongo;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

// Implementação que faz a ponte entre o domínio e o MongoDB para o catálogo de naves
@Repository
public class ShipAssetRepoImpl implements ShipAssetRepo {

    private final ShipAssetMongo mongo;

    public ShipAssetRepoImpl(ShipAssetMongo mongo) {
        this.mongo = mongo;
    }

    // Salva ou atualiza os dados da nave
    @Override
    public ShipAsset save(ShipAsset asset) {
        var orm = ShipAssetRepoAdp.toOrm(asset);
        var saved = mongo.save(orm);
        return ShipAssetRepoAdp.toDomain(saved);
    }

    // Busca uma nave específica pelo seu ID
    @Override
    public Optional<ShipAsset> findById(String id) {
        return mongo.findById(id).map(ShipAssetRepoAdp::toDomain);
    }

    // Retorna todo o catálogo de naves cadastradas
    @Override
    public List<ShipAsset> findAll() {
        return mongo.findAll().stream().map(ShipAssetRepoAdp::toDomain).toList();
    }

    // Remove a nave do MongoDB
    @Override
    public void deleteById(String id) {
        mongo.deleteById(id);
    }
}

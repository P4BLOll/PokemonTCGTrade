package com.pabloepedro.despacho.repository.adapter;

import com.pabloepedro.despacho.entity.ShipAsset;
import com.pabloepedro.despacho.repository.orm.ShipAssetOrm;

// Adaptador: converte entre o documento do catálogo de naves (ShipAssetOrm) e o domínio puro (ShipAsset)
public class ShipAssetRepoAdp {
    private ShipAssetRepoAdp() {}

    // Converte documento do Mongo para entidade de domínio de nave
    public static ShipAsset toDomain(ShipAssetOrm orm) {
        if (orm == null) return null;
        return new ShipAsset(
                orm.id(),
                orm.name(),
                orm.type(),
                orm.rarity(),
                orm.expansion(),
                orm.hp(),
                orm.imageUrl(),
                orm.marketPrice() != null ? orm.marketPrice() : 150.0
        );
    }

    // Converte entidade de domínio de nave para documento do Mongo
    public static ShipAssetOrm toOrm(ShipAsset domain) {
        if (domain == null) return null;
        return new ShipAssetOrm(
                domain.id(),
                domain.name(),
                domain.type(),
                domain.rarity(),
                domain.expansion(),
                domain.hp(),
                domain.imageUrl(),
                domain.marketPrice() != null ? domain.marketPrice() : 150.0
        );
    }
}


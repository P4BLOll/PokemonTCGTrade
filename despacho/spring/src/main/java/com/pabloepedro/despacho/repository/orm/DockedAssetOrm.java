package com.pabloepedro.despacho.repository.orm;

import com.pabloepedro.despacho.entity.enumerable.Rarity;
import com.pabloepedro.despacho.entity.enumerable.ShipClass;

import org.springframework.data.mongodb.core.mapping.Field;

// Sub-documento que representa uma nave física ancorada na doca do oficial
public record DockedAssetOrm(
        String instanceId,
        @Field("cardId") String assetId,
        @Field("cardName") String assetName,
        ShipClass type,
        Rarity rarity,
        String ownerUsername,
        Boolean lockedForDispatch,
        Double marketPrice,
        Integer hp
) {
    public DockedAssetOrm {
        if (lockedForDispatch == null) {
            lockedForDispatch = false;
        }
        if (marketPrice == null) {
            marketPrice = 500.0;
        }
        if (hp == null) {
            hp = 300;
        }
    }

    public DockedAssetOrm(
            String instanceId,
            String assetId,
            String assetName,
            ShipClass type,
            Rarity rarity,
            String ownerUsername,
            Boolean lockedForDispatch
    ) {
        this(instanceId, assetId, assetName, type, rarity, ownerUsername, lockedForDispatch, 500.0, 300);
    }
}

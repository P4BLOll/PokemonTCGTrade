package com.pabloepedro.despacho.entity;

import com.pabloepedro.despacho.entity.enumerable.Rarity;
import com.pabloepedro.despacho.entity.enumerable.ShipClass;

// Instância individual de uma nave estacionada na doca, com flag de bloqueio atômico
public record DockedAsset(
        String instanceId,
        String assetId,
        String assetName,
        ShipClass type,
        Rarity rarity,
        String ownerUsername,
        Boolean lockedForDispatch,
        Double marketPrice,
        Integer hp
) {
    public DockedAsset {
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

    public DockedAsset(
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

    public boolean isLocked() {
        return Boolean.TRUE.equals(lockedForDispatch);
    }

    public String commanderUsername() { return ownerUsername; }
}

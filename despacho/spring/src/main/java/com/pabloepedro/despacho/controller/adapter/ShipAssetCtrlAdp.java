package com.pabloepedro.despacho.controller.adapter;

import com.pabloepedro.despacho.controller.request.ShipAssetRequest;
import com.pabloepedro.despacho.controller.response.ShipAssetResponse;
import com.pabloepedro.despacho.entity.ShipAsset;

import java.util.UUID;

public class ShipAssetCtrlAdp {
    private ShipAssetCtrlAdp() {}

    public static ShipAsset toDomain(ShipAssetRequest request) {
        return new ShipAsset(
                UUID.randomUUID().toString(),
                request.name(),
                request.type(),
                request.rarity(),
                request.expansion(),
                request.hp(),
                request.imageUrl(),
                request.marketPrice() != null ? request.marketPrice() : 150.0
        );
    }

    public static ShipAssetResponse toResponse(ShipAsset asset) {
        if (asset == null) return null;
        return new ShipAssetResponse(
                asset.id(),
                asset.name(),
                asset.type(),
                asset.rarity(),
                asset.expansion(),
                asset.hp(),
                asset.imageUrl(),
                asset.marketPrice() != null ? asset.marketPrice() : 150.0
        );
    }
}

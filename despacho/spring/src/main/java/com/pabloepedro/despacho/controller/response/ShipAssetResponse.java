package com.pabloepedro.despacho.controller.response;

import com.pabloepedro.despacho.entity.enumerable.Rarity;
import com.pabloepedro.despacho.entity.enumerable.ShipClass;

// DTO com os detalhes de um modelo de nave (classe, raridade, escudo, preço estimado)
public record ShipAssetResponse(
        String id,
        String name,
        ShipClass type,
        Rarity rarity,
        String expansion,
        int hp,
        String imageUrl,
        Double marketPrice
) {
    public String assetId() { return id; }
    public String assetName() { return name; }
    public ShipClass shipClass() { return type; }
    public int shieldPercent() { return hp; }
}


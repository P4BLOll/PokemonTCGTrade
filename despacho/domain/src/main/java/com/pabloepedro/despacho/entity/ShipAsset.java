package com.pabloepedro.despacho.entity;

import com.pabloepedro.despacho.entity.enumerable.Rarity;
import com.pabloepedro.despacho.entity.enumerable.ShipClass;

// Guarda as especificações básicas de uma nave no catálogo (classe, casco/HP, raridade e imagem)
public record ShipAsset(
        String id,
        String name,
        ShipClass type,
        Rarity rarity,
        String expansion,
        int hp,
        String imageUrl,
        Double marketPrice
) {
}

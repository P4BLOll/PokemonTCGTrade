package com.pabloepedro.trade.controller.response;

import com.pabloepedro.trade.entity.enumerable.PokemonType;
import com.pabloepedro.trade.entity.enumerable.Rarity;

public record CardResponse(
        String id,
        String name,
        PokemonType type,
        Rarity rarity,
        String expansion,
        int hp,
        String imageUrl,
        Double marketPrice
) {
}
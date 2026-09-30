package com.pabloepedro.trade.entity;

import com.pabloepedro.trade.entity.enumerable.PokemonType;
import com.pabloepedro.trade.entity.enumerable.Rarity;

public record BinderItem(
        String instanceId,
        String cardId,
        String cardName,
        PokemonType type,
        Rarity rarity,
        String ownerUsername,
        boolean lockedForTrade
) {
}
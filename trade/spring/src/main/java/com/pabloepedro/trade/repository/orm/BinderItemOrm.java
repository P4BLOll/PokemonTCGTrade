package com.pabloepedro.trade.repository.orm;

import com.pabloepedro.trade.entity.enumerable.PokemonType;
import com.pabloepedro.trade.entity.enumerable.Rarity;

public record BinderItemOrm(
        String instanceId,
        String cardId,
        String cardName,
        PokemonType type,
        Rarity rarity,
        String ownerUsername,
        boolean lockedForTrade
) {
}
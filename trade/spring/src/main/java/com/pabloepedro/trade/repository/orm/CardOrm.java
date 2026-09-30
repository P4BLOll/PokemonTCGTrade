package com.pabloepedro.trade.repository.orm;

import com.pabloepedro.trade.entity.enumerable.PokemonType;
import com.pabloepedro.trade.entity.enumerable.Rarity;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "cards")
public record CardOrm(
        @Id String id,
        String name,
        PokemonType type,
        Rarity rarity,
        String expansion,
        int hp,
        String imageUrl,
        Double marketPrice
) {
}
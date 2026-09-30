package com.pabloepedro.trade.controller.request;

import com.pabloepedro.trade.entity.enumerable.PokemonType;
import com.pabloepedro.trade.entity.enumerable.Rarity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CardRequest(
        @NotBlank String name,
        @NotNull PokemonType type,
        @NotNull Rarity rarity,
        @NotBlank String expansion,
        int hp,
        String imageUrl,
        Double marketPrice
) {
}
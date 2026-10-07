package com.pabloepedro.despacho.controller.request;

import com.pabloepedro.despacho.entity.enumerable.Rarity;
import com.pabloepedro.despacho.entity.enumerable.ShipClass;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ShipAssetRequest(
        @NotBlank String name,
        @NotNull ShipClass type,
        @NotNull Rarity rarity,
        @NotBlank String expansion,
        int hp,
        String imageUrl,
        Double marketPrice
) {
}

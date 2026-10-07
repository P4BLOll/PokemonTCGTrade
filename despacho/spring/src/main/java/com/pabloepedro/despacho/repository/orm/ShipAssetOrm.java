package com.pabloepedro.despacho.repository.orm;

import com.pabloepedro.despacho.entity.enumerable.Rarity;
import com.pabloepedro.despacho.entity.enumerable.ShipClass;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

// Documento gravado na coleção 'ship_assets' com os dados do modelo da nave
@Document(collection = "ship_assets")
public record ShipAssetOrm(
        @Id String id,
        String name,
        ShipClass type,
        Rarity rarity,
        String expansion,
        int hp,
        String imageUrl,
        Double marketPrice
) {
}


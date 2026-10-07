package com.pabloepedro.despacho.repository.orm;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.List;

// Documento gravado na coleção 'officer_docks' com a lista de naves do oficial
@Document(collection = "officer_docks")
public record OfficerDockOrm(
        @Id String id,
        @Field("trainerUsername") @Indexed(unique = true) String officerUsername,
        @Field("cards") List<DockedAssetOrm> assets
) {
    public List<DockedAssetOrm> ships() { return assets; }
}

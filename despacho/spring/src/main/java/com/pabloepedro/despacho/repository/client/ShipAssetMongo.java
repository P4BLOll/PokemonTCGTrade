package com.pabloepedro.despacho.repository.client;

import com.pabloepedro.despacho.repository.orm.ShipAssetOrm;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

// Interface Spring Data MongoDB para a coleção de catálogo geral de naves espaciais
@Repository
public interface ShipAssetMongo extends MongoRepository<ShipAssetOrm, String> {
}


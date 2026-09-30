package com.pabloepedro.trade.repository.client;

import com.pabloepedro.trade.repository.orm.CardOrm;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CardMongo extends MongoRepository<CardOrm, String> {
}
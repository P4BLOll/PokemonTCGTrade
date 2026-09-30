package com.pabloepedro.trade.repository.client;

import com.pabloepedro.trade.repository.orm.TrainerBinderOrm;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TrainerBinderMongo extends MongoRepository<TrainerBinderOrm, String> {
    Optional<TrainerBinderOrm> findByTrainerUsername(String trainerUsername);
}
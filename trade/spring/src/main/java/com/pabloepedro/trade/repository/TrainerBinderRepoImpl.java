package com.pabloepedro.trade.repository;

import com.pabloepedro.trade.entity.TrainerBinder;
import com.pabloepedro.trade.repository.adapter.TrainerBinderRepoAdp;
import com.pabloepedro.trade.repository.client.TrainerBinderMongo;
import com.pabloepedro.trade.repository.orm.BinderItemOrm;
import com.pabloepedro.trade.repository.orm.TrainerBinderOrm;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class TrainerBinderRepoImpl implements TrainerBinderRepo {

    private final TrainerBinderMongo mongo;
    private final MongoTemplate mongoTemplate;

    public TrainerBinderRepoImpl(TrainerBinderMongo mongo, MongoTemplate mongoTemplate) {
        this.mongo = mongo;
        this.mongoTemplate = mongoTemplate;
    }

    @Override
    public TrainerBinder save(TrainerBinder binder) {
        var orm = TrainerBinderRepoAdp.toOrm(binder);
        var saved = mongo.save(orm);
        return TrainerBinderRepoAdp.toDomain(saved);
    }

    @Override
    public Optional<TrainerBinder> findByTrainerUsername(String trainerUsername) {
        return mongo.findByTrainerUsername(trainerUsername).map(TrainerBinderRepoAdp::toDomain);
    }

    @Override
    public List<TrainerBinder> findAll() {
        return mongo.findAll().stream().map(TrainerBinderRepoAdp::toDomain).toList();
    }

    @Override
    public boolean lockCardInstance(String trainerUsername, String instanceId) {
        // Atomic lock: Only updates if lockedForTrade is currently FALSE
        Query query = new Query(Criteria.where("trainerUsername").is(trainerUsername)
                .and("cards").elemMatch(Criteria.where("instanceId").is(instanceId).and("lockedForTrade").is(false)));
        Update update = new Update().set("cards.$.lockedForTrade", true);

        TrainerBinderOrm updated = mongoTemplate.findAndModify(query, update, TrainerBinderOrm.class);
        return updated != null;
    }

    @Override
    public void unlockCardInstance(String trainerUsername, String instanceId) {
        Query query = new Query(Criteria.where("trainerUsername").is(trainerUsername)
                .and("cards.instanceId").is(instanceId));
        Update update = new Update().set("cards.$.lockedForTrade", false);
        mongoTemplate.updateFirst(query, update, TrainerBinderOrm.class);
    }

    @Override
    public void transferCard(String fromTrainer, String toTrainer, String instanceId) {
        TrainerBinderOrm fromBinder = mongo.findByTrainerUsername(fromTrainer).orElseThrow(
                () -> new RuntimeException("Treinador de origem nao encontrado: " + fromTrainer));

        BinderItemOrm item = fromBinder.cards().stream()
                .filter(c -> c.instanceId().equals(instanceId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Carta " + instanceId + " nao encontrada no binder de " + fromTrainer));

        // 1. Remove from source binder
        Query removeQuery = new Query(Criteria.where("trainerUsername").is(fromTrainer));
        Update removeUpdate = new Update().pull("cards", Query.query(Criteria.where("instanceId").is(instanceId)));
        mongoTemplate.updateFirst(removeQuery, removeUpdate, TrainerBinderOrm.class);

        // 2. Add to destination binder with new owner and locked = false
        BinderItemOrm transferredItem = new BinderItemOrm(
                item.instanceId(), item.cardId(), item.cardName(), item.type(), item.rarity(), toTrainer, false);
        Query addQuery = new Query(Criteria.where("trainerUsername").is(toTrainer));
        Update addUpdate = new Update().push("cards", transferredItem);
        mongoTemplate.updateFirst(addQuery, addUpdate, TrainerBinderOrm.class);
    }
}
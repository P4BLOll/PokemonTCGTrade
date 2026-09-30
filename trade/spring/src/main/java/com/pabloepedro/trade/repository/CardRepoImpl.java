package com.pabloepedro.trade.repository;

import com.pabloepedro.trade.entity.Card;
import com.pabloepedro.trade.repository.adapter.CardRepoAdp;
import com.pabloepedro.trade.repository.client.CardMongo;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class CardRepoImpl implements CardRepo {

    private final CardMongo mongo;

    public CardRepoImpl(CardMongo mongo) {
        this.mongo = mongo;
    }

    @Override
    public Card save(Card card) {
        var orm = CardRepoAdp.toOrm(card);
        var saved = mongo.save(orm);
        return CardRepoAdp.toDomain(saved);
    }

    @Override
    public Optional<Card> findById(String id) {
        return mongo.findById(id).map(CardRepoAdp::toDomain);
    }

    @Override
    public List<Card> findAll() {
        return mongo.findAll().stream().map(CardRepoAdp::toDomain).toList();
    }
}
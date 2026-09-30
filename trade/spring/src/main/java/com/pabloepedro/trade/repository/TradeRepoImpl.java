package com.pabloepedro.trade.repository;

import com.pabloepedro.trade.entity.TradeProposal;
import com.pabloepedro.trade.entity.enumerable.TradeStatus;
import com.pabloepedro.trade.repository.adapter.TradeRepoAdp;
import com.pabloepedro.trade.repository.client.TradeProposalMongo;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class TradeRepoImpl implements TradeRepo {

    private final TradeProposalMongo mongo;

    public TradeRepoImpl(TradeProposalMongo mongo) {
        this.mongo = mongo;
    }

    @Override
    public TradeProposal save(TradeProposal proposal) {
        var orm = TradeRepoAdp.toOrm(proposal);
        var saved = mongo.save(orm);
        return TradeRepoAdp.toDomain(saved);
    }

    @Override
    public Optional<TradeProposal> findById(String id) {
        return mongo.findById(id).map(TradeRepoAdp::toDomain);
    }

    @Override
    public List<TradeProposal> findByTrainer(String trainerUsername) {
        return mongo.findBySenderUsernameOrReceiverUsername(trainerUsername, trainerUsername)
                .stream().map(TradeRepoAdp::toDomain).toList();
    }

    @Override
    public List<TradeProposal> findPending() {
        return mongo.findByStatus(TradeStatus.PENDING)
                .stream().map(TradeRepoAdp::toDomain).toList();
    }
}
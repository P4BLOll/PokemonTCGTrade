package com.pabloepedro.trade.repository;

import com.pabloepedro.trade.entity.TradeProposal;
import java.util.List;
import java.util.Optional;

public interface TradeRepo {
    TradeProposal save(TradeProposal proposal);
    Optional<TradeProposal> findById(String id);
    List<TradeProposal> findByTrainer(String trainerUsername);
    List<TradeProposal> findPending();
}
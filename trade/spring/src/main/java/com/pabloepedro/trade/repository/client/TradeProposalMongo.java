package com.pabloepedro.trade.repository.client;

import com.pabloepedro.trade.entity.enumerable.TradeStatus;
import com.pabloepedro.trade.repository.orm.TradeProposalOrm;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TradeProposalMongo extends MongoRepository<TradeProposalOrm, String> {
    List<TradeProposalOrm> findBySenderUsernameOrReceiverUsername(String sender, String receiver);
    List<TradeProposalOrm> findByStatus(TradeStatus status);
}
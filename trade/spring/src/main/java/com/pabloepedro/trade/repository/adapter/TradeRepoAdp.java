package com.pabloepedro.trade.repository.adapter;

import com.pabloepedro.trade.entity.TradeProposal;
import com.pabloepedro.trade.repository.orm.TradeProposalOrm;

public class TradeRepoAdp {
    private TradeRepoAdp() {}

    public static TradeProposal toDomain(TradeProposalOrm orm) {
        if (orm == null) return null;
        return new TradeProposal(
                orm.id(),
                orm.senderUsername(),
                orm.receiverUsername(),
                orm.offeredInstanceId(),
                orm.requestedInstanceId(),
                orm.status(),
                orm.createdAt()
        );
    }

    public static TradeProposalOrm toOrm(TradeProposal domain) {
        if (domain == null) return null;
        return new TradeProposalOrm(
                domain.id(),
                domain.senderUsername(),
                domain.receiverUsername(),
                domain.offeredInstanceId(),
                domain.requestedInstanceId(),
                domain.status(),
                domain.createdAt()
        );
    }
}
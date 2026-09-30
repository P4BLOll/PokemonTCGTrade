package com.pabloepedro.trade.controller.adapter;

import com.pabloepedro.trade.controller.response.TradeProposalResponse;
import com.pabloepedro.trade.entity.TradeProposal;

public class TradeCtrlAdp {
    private TradeCtrlAdp() {}

    public static TradeProposalResponse toResponse(TradeProposal p) {
        if (p == null) return null;
        return new TradeProposalResponse(
                p.id(),
                p.senderUsername(),
                p.receiverUsername(),
                p.offeredInstanceId(),
                p.requestedInstanceId(),
                p.status(),
                p.createdAt()
        );
    }
}
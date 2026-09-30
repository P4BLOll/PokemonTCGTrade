package com.pabloepedro.trade.queue;

import com.pabloepedro.trade.entity.TradeProposal;

public interface TradeQueueProducer {
    void sendTradeRequested(TradeProposal proposal);
    void sendTradeCompleted(TradeProposal proposal);
}
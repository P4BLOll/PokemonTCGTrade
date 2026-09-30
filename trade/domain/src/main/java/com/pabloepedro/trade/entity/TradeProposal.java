package com.pabloepedro.trade.entity;

import com.pabloepedro.trade.entity.enumerable.TradeStatus;
import java.time.LocalDateTime;

public record TradeProposal(
        String id,
        String senderUsername,
        String receiverUsername,
        String offeredInstanceId,
        String requestedInstanceId,
        TradeStatus status,
        LocalDateTime createdAt
) {
}
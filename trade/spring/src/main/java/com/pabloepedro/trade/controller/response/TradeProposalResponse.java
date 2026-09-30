package com.pabloepedro.trade.controller.response;

import com.pabloepedro.trade.entity.enumerable.TradeStatus;
import java.time.LocalDateTime;

public record TradeProposalResponse(
        String id,
        String senderUsername,
        String receiverUsername,
        String offeredInstanceId,
        String requestedInstanceId,
        TradeStatus status,
        LocalDateTime createdAt
) {
}
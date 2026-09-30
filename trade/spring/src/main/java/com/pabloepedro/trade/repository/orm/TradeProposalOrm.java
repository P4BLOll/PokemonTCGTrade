package com.pabloepedro.trade.repository.orm;

import com.pabloepedro.trade.entity.enumerable.TradeStatus;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "trades")
public record TradeProposalOrm(
        @Id String id,
        String senderUsername,
        String receiverUsername,
        String offeredInstanceId,
        String requestedInstanceId,
        TradeStatus status,
        LocalDateTime createdAt
) {
}
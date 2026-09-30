package com.pabloepedro.trade.controller.adapter;

import com.pabloepedro.trade.controller.request.CardRequest;
import com.pabloepedro.trade.controller.response.CardResponse;
import com.pabloepedro.trade.entity.Card;

import java.util.UUID;

public class CardCtrlAdp {
    private CardCtrlAdp() {}

    public static Card toDomain(CardRequest request) {
        return new Card(
                UUID.randomUUID().toString(),
                request.name(),
                request.type(),
                request.rarity(),
                request.expansion(),
                request.hp(),
                request.imageUrl(),
                request.marketPrice() != null ? request.marketPrice() : 150.0
        );
    }

    public static CardResponse toResponse(Card card) {
        if (card == null) return null;
        return new CardResponse(
                card.id(),
                card.name(),
                card.type(),
                card.rarity(),
                card.expansion(),
                card.hp(),
                card.imageUrl(),
                card.marketPrice() != null ? card.marketPrice() : 150.0
        );
    }
}
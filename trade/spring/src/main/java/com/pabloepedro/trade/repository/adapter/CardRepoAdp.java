package com.pabloepedro.trade.repository.adapter;

import com.pabloepedro.trade.entity.Card;
import com.pabloepedro.trade.repository.orm.CardOrm;

public class CardRepoAdp {
    private CardRepoAdp() {}

    public static Card toDomain(CardOrm orm) {
        if (orm == null) return null;
        return new Card(
                orm.id(),
                orm.name(),
                orm.type(),
                orm.rarity(),
                orm.expansion(),
                orm.hp(),
                orm.imageUrl(),
                orm.marketPrice() != null ? orm.marketPrice() : 150.0
        );
    }

    public static CardOrm toOrm(Card domain) {
        if (domain == null) return null;
        return new CardOrm(
                domain.id(),
                domain.name(),
                domain.type(),
                domain.rarity(),
                domain.expansion(),
                domain.hp(),
                domain.imageUrl(),
                domain.marketPrice() != null ? domain.marketPrice() : 150.0
        );
    }
}
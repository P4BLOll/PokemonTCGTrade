package com.pabloepedro.trade.repository;

import com.pabloepedro.trade.entity.Card;
import java.util.List;
import java.util.Optional;

public interface CardRepo {
    Card save(Card card);
    Optional<Card> findById(String id);
    List<Card> findAll();
}
package com.pabloepedro.trade.repository.adapter;

import com.pabloepedro.trade.entity.BinderItem;
import com.pabloepedro.trade.entity.TrainerBinder;
import com.pabloepedro.trade.repository.orm.BinderItemOrm;
import com.pabloepedro.trade.repository.orm.TrainerBinderOrm;

import java.util.ArrayList;
import java.util.List;

public class TrainerBinderRepoAdp {
    private TrainerBinderRepoAdp() {}

    public static TrainerBinder toDomain(TrainerBinderOrm orm) {
        if (orm == null) return null;
        List<BinderItem> items = orm.cards() != null
                ? orm.cards().stream().map(TrainerBinderRepoAdp::toItemDomain).toList()
                : new ArrayList<>();
        return new TrainerBinder(orm.id(), orm.trainerUsername(), items);
    }

    public static TrainerBinderOrm toOrm(TrainerBinder domain) {
        if (domain == null) return null;
        List<BinderItemOrm> items = domain.cards() != null
                ? domain.cards().stream().map(TrainerBinderRepoAdp::toItemOrm).toList()
                : new ArrayList<>();
        return new TrainerBinderOrm(domain.id(), domain.trainerUsername(), items);
    }

    public static BinderItem toItemDomain(BinderItemOrm orm) {
        return new BinderItem(
                orm.instanceId(),
                orm.cardId(),
                orm.cardName(),
                orm.type(),
                orm.rarity(),
                orm.ownerUsername(),
                orm.lockedForTrade()
        );
    }

    public static BinderItemOrm toItemOrm(BinderItem domain) {
        return new BinderItemOrm(
                domain.instanceId(),
                domain.cardId(),
                domain.cardName(),
                domain.type(),
                domain.rarity(),
                domain.ownerUsername(),
                domain.lockedForTrade()
        );
    }
}
package com.pabloepedro.trade.entity;

import java.util.List;

public record TrainerBinder(
        String id,
        String trainerUsername,
        List<BinderItem> cards
) {
}
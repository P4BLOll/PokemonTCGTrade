package com.pabloepedro.trade.controller.response;

import com.pabloepedro.trade.entity.BinderItem;
import java.util.List;

public record TrainerBinderResponse(
        String id,
        String trainerUsername,
        List<BinderItem> cards
) {
}
package com.pabloepedro.trade.controller.response;

public record CardOwnerDto(
        String trainerUsername,
        String instanceId,
        boolean lockedForTrade
) {
}
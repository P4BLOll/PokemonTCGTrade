package com.pabloepedro.trade.controller.request;

import jakarta.validation.constraints.NotBlank;

public record TradeProposeRequest(
        @NotBlank String senderUsername,
        @NotBlank String receiverUsername,
        @NotBlank String offeredInstanceId,
        @NotBlank String requestedInstanceId
) {
}
package com.pabloepedro.despacho.controller.request;

import jakarta.validation.constraints.NotBlank;

public record DespachoRequest(
        @NotBlank String senderUsername,
        @NotBlank String receiverUsername,
        @NotBlank String offeredInstanceId,
        @NotBlank String requestedInstanceId
) {
}

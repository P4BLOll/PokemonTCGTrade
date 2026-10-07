package com.pabloepedro.despacho.controller.response;

import com.pabloepedro.despacho.entity.enumerable.DespachoStatus;
import java.time.LocalDateTime;

// DTO de resposta que o endpoint REST devolve ao consultar ou criar um despacho
public record DespachoResponse(
        String id,
        String senderUsername,
        String receiverUsername,
        String offeredInstanceId,
        String requestedInstanceId,
        DespachoStatus status,
        LocalDateTime createdAt
) {
}


package com.pabloepedro.despacho.entity;

import com.pabloepedro.despacho.entity.enumerable.DespachoStatus;
import java.time.LocalDateTime;

// Representa a ordem de despacho ou locação de uma nave entre a estação e um piloto
public record Despacho(
        String id,
        String senderUsername,
        String receiverUsername,
        String offeredInstanceId,
        String requestedInstanceId,
        DespachoStatus status,
        LocalDateTime createdAt
) {
}

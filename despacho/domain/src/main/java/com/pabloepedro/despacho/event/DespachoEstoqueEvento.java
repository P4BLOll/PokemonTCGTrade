package com.pabloepedro.despacho.event;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * Evento de mensageria disparado pelo microsserviço de Despacho em direção ao Estoque.
 * Notifica a solicitação de uma nave ou devolução para que o Estoque altere
 * a disponibilidade de naves e dê baixa em suprimentos do arsenal.
 */
public record DespachoEstoqueEvento(
        String orderId,
        String shipCode,
        String pilotCallsign,
        String missionRoute,
        String eventType, // "DESPACHO_SOLICITADO" ou "DESPACHO_DEVOLVIDO"
        String consumablePartCode, // ex: "COMP-03" (Células de Fusão 500MW)
        int consumableQuantity,
        LocalDateTime timestamp
) implements Serializable {
    public DespachoEstoqueEvento {
        if (eventType == null || eventType.isBlank()) {
            eventType = "DESPACHO_SOLICITADO";
        }
        if (consumablePartCode == null || consumablePartCode.isBlank()) {
            consumablePartCode = "COMP-03";
        }
        if (consumableQuantity <= 0) {
            consumableQuantity = 1;
        }
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }
}

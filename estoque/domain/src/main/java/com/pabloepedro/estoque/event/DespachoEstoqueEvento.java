package com.pabloepedro.estoque.event;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * Evento de mensageria assíncrona recebido do microsserviço de Despacho.
 * Representa a notificação de um pedido de despacho de nave para que o Estoque
 * atualize a disponibilidade dos vetores físicos, docas e dê baixa nos suprimentos do arsenal.
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

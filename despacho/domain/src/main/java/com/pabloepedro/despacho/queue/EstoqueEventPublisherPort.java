package com.pabloepedro.despacho.queue;

import com.pabloepedro.despacho.event.DespachoEstoqueEvento;

/**
 * Porta de saída (Outbound Port - Clean Architecture / Hexagonal / DIP):
 * Define o contrato para publicação assíncrona de eventos de alteração de estoque via mensageria (RabbitMQ).
 */
public interface EstoqueEventPublisherPort {
    void publicarEventoAlteracaoEstoque(DespachoEstoqueEvento evento);
}

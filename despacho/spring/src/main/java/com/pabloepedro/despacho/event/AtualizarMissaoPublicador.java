package com.pabloepedro.despacho.event;

import com.pabloepedro.despacho.event.dto.AtualizarMissaoEvento;

// Contrato para publicacao de eventos de atualizacao de missao/despacho no RabbitMQ
public interface AtualizarMissaoPublicador {
    void publicar(AtualizarMissaoEvento evento);
}

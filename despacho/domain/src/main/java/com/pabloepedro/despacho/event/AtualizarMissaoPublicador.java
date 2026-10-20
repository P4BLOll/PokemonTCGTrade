package com.pabloepedro.despacho.event;

// Contrato de dominio (outbound port) para publicacao de eventos de atualizacao de missao/despacho
public interface AtualizarMissaoPublicador {
    void publicar(AtualizarMissaoEvento evento);
}

package com.pabloepedro.despacho.queue;

import com.pabloepedro.despacho.entity.Despacho;

// Porta do domínio para publicar mensagens na fila de mensageria (RabbitMQ)
public interface DespachoQueueProducer {
    // Publica o pedido de despacho na fila
    void sendDespachoRequested(Despacho despacho);

    // Publica o aviso de que o despacho foi finalizado
    void sendDespachoCompleted(Despacho despacho);
}

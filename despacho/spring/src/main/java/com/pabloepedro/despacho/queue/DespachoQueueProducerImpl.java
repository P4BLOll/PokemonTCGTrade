package com.pabloepedro.despacho.queue;

import com.pabloepedro.despacho.config.RabbitConfig;
import com.pabloepedro.despacho.entity.Despacho;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

// Envia os eventos de despacho criados para o RabbitMQ
@Component
public class DespachoQueueProducerImpl implements DespachoQueueProducer {

    private static final Logger log = LoggerFactory.getLogger(DespachoQueueProducerImpl.class);
    private final RabbitTemplate rabbitTemplate;

    public DespachoQueueProducerImpl(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    // Publica o pedido de despacho na exchange fanout do RabbitMQ
    @Override
    public void sendDespachoRequested(Despacho despacho) {
        try {
            log.info("[PUB/SUB - PUBLISH] Publicando proposta de despacho [{}] na Exchange [{}]",
                    despacho.id(), RabbitConfig.DESPACHO_PUBSUB_EXCHANGE);
            // Manda para a exchange: qualquer fila plugada nela recebe a cópia
            rabbitTemplate.convertAndSend(RabbitConfig.DESPACHO_PUBSUB_EXCHANGE, "", despacho);
        } catch (Exception ex) {
            log.warn("[CloudAMQP] Aviso: Nao foi possivel publicar no RabbitMQ: {}", ex.getMessage());
        }
    }

    // Registra no log quando o despacho foi totalmente finalizado
    @Override
    public void sendDespachoCompleted(Despacho despacho) {
        log.info("[PUB/SUB] Evento de conclusao registrado para o despacho [{}]", despacho.id());
    }
}


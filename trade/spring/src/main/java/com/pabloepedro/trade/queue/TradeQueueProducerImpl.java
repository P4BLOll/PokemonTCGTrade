package com.pabloepedro.trade.queue;

import com.pabloepedro.trade.config.RabbitConfig;
import com.pabloepedro.trade.entity.TradeProposal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

/**
 * Publisher do padrao Pub/Sub utilizando RabbitTemplate.
 * Publica eventos de troca na Exchange do CloudAMQP.
 */
@Component
public class TradeQueueProducerImpl implements TradeQueueProducer {

    private static final Logger log = LoggerFactory.getLogger(TradeQueueProducerImpl.class);
    private final RabbitTemplate rabbitTemplate;

    public TradeQueueProducerImpl(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    @Override
    public void sendTradeRequested(TradeProposal proposal) {
        try {
            log.info("[PUB/SUB - PUBLISH] Publicando proposta de troca [{}] na Exchange [{}]",
                    proposal.id(), RabbitConfig.TRADE_PUBSUB_EXCHANGE);
            // Publica na Fanout Exchange (todos os subscribers recebem)
            rabbitTemplate.convertAndSend(RabbitConfig.TRADE_PUBSUB_EXCHANGE, "", proposal);
        } catch (Exception ex) {
            log.warn("[CloudAMQP] Aviso: Nao foi possivel publicar no RabbitMQ: {}", ex.getMessage());
        }
    }

    @Override
    public void sendTradeCompleted(TradeProposal proposal) {
        log.info("[PUB/SUB] Evento de conclusao registrado para a troca [{}]", proposal.id());
    }
}
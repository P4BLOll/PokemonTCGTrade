package com.pabloepedro.despacho.event;

import com.pabloepedro.despacho.event.dto.AtualizarMissaoEvento;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

// Publicador de eventos de missao para o RabbitMQ (CloudAMQP)
@Service
public class AtualizarMissaoPublicadorImpl implements AtualizarMissaoPublicador {

    private static final Logger log = LoggerFactory.getLogger(AtualizarMissaoPublicadorImpl.class);

    private final RabbitTemplate rabbitTemplate;
    private final String exchange;
    private final String routingKey;

    public AtualizarMissaoPublicadorImpl(
            RabbitTemplate rabbitTemplate,
            @Value("${event.atualizar-missao.exchange:atualizar-missao-exchange}") String exchange,
            @Value("${event.atualizar-missao.queue:atualizar-missao-queue}") String routingKey) {
        this.rabbitTemplate = rabbitTemplate;
        this.exchange = exchange;
        this.routingKey = routingKey;
    }

    // Envia o evento de missao serializado em JSON para a exchange do RabbitMQ
    @Override
    public void publicar(AtualizarMissaoEvento evento) {
        try {
            log.info("[RABBITMQ EVENT PUBLISHER] Publicando AtualizarMissaoEvento para exchange [{}] e routingKey [{}]: {}",
                    exchange, routingKey, evento);
            rabbitTemplate.convertAndSend(exchange, routingKey, evento);
        } catch (Exception ex) {
            log.error("[RABBITMQ EVENT PUBLISHER] Erro ao publicar AtualizarMissaoEvento: {}", ex.getMessage());
        }
    }
}

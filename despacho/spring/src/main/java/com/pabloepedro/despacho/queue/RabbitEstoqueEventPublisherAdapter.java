package com.pabloepedro.despacho.queue;

import com.pabloepedro.despacho.config.RabbitConfig;
import com.pabloepedro.despacho.event.DespachoEstoqueEvento;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

/**
 * Adaptador Outbound de Mensageria (Clean Architecture / DIP):
 * Envia mensagens assíncronas para o microsserviço de Estoque através do RabbitMQ.
 * Ao emitir uma ordem de despacho ou devolução de vetor, notifica o Estoque para
 * alterar imediatamente o saldo de naves e suprimentos.
 */
@Component
public class RabbitEstoqueEventPublisherAdapter implements EstoqueEventPublisherPort {

    private static final Logger log = LoggerFactory.getLogger(RabbitEstoqueEventPublisherAdapter.class);

    private final RabbitTemplate rabbitTemplate;

    public RabbitEstoqueEventPublisherAdapter(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    @Override
    public void publicarEventoAlteracaoEstoque(DespachoEstoqueEvento evento) {
        log.info("[MENSAGERIA DESPACHO -> ESTOQUE] Publicando evento no RabbitMQ para alterar estoque: Ordem [{}], Nave [{}], Piloto [{}], Ação [{}]",
                evento.orderId(), evento.shipCode(), evento.pilotCallsign(), evento.eventType());

        try {
            // Publica na exchange direta de alteração de estoque
            rabbitTemplate.convertAndSend(
                    RabbitConfig.ESTOQUE_SYNC_EXCHANGE,
                    RabbitConfig.ESTOQUE_ROUTING_KEY,
                    evento
            );
            log.info("[MENSAGERIA DESPACHO -> ESTOQUE] Evento entregue com sucesso à exchange [{}] com routing key [{}]!",
                    RabbitConfig.ESTOQUE_SYNC_EXCHANGE, RabbitConfig.ESTOQUE_ROUTING_KEY);
        } catch (Exception ex) {
            log.error("[MENSAGERIA DESPACHO -> ESTOQUE] Erro ao publicar mensagem para o Estoque no RabbitMQ: {}", ex.getMessage());
        }
    }
}

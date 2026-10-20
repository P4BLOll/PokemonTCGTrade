package com.pabloepedro.estoque.queue;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pabloepedro.estoque.config.EstoqueRabbitConfig;
import com.pabloepedro.estoque.event.DespachoEstoqueEvento;
import com.pabloepedro.estoque.service.HangarInventoryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Adaptador de entrada da mensageria AMQP:
 * Escuta a fila do RabbitMQ e repassa eventos de despacho para atualizar o estoque do hangar.
 */
@Component
public class EstoqueDespachoConsumer {

    private static final Logger log = LoggerFactory.getLogger(EstoqueDespachoConsumer.class);

    private final HangarInventoryService hangarInventoryService;
    private final ObjectMapper objectMapper;

    // Injeta o serviço de inventário do hangar e o conversor de objetos JSON
    public EstoqueDespachoConsumer(HangarInventoryService hangarInventoryService, ObjectMapper objectMapper) {
        this.hangarInventoryService = hangarInventoryService;
        this.objectMapper = objectMapper;
    }

    // Escuta a fila de despacho e aciona a atualização física do inventário (naves e peças)
    @RabbitListener(queues = EstoqueRabbitConfig.QUEUE_ESTOQUE_DESPACHO)
    public void consumirEventoDespacho(Object payload) {
        log.info("[ESTOQUE AMQP LISTENER] Nova mensagem de despacho detectada na fila [{}]",
                EstoqueRabbitConfig.QUEUE_ESTOQUE_DESPACHO);

        try {
            // Converte o payload recebido para o evento tipado do domínio
            DespachoEstoqueEvento evento = normalizarEvento(payload);

            // Se a mensagem for válida, processa o evento no serviço de hangar
            if (evento != null) {
                hangarInventoryService.processarEventoDespacho(evento);
            } else {
                log.warn("[ESTOQUE AMQP LISTENER] Não foi possível interpretar o payload da mensagem de despacho.");
            }
        } catch (Exception ex) {
            // Captura falhas para registrar no log e evitar que a fila fique presa em loop
            log.error("[ESTOQUE AMQP LISTENER] Erro ao processar mensagem assíncrona de despacho: {}", ex.getMessage(), ex);
        }
    }

    // Normaliza o payload para DespachoEstoqueEvento lidando com diferentes formatos (objeto direto, Map ou JSON)
    private DespachoEstoqueEvento normalizarEvento(Object payload) {
        // Se a mensagem já chegou tipada como evento de domínio, retorna direto
        if (payload instanceof DespachoEstoqueEvento ev) {
            return ev;
        }

        // Se veio como Map/JSON desserializado genericamente, extrai os campos com fallbacks
        if (payload instanceof Map<?, ?> map) {
            String orderId = getMapString(map, "id", getMapString(map, "orderId", "DESP-" + System.currentTimeMillis()));
            String shipCode = getMapString(map, "offeredInstanceId", getMapString(map, "shipCode", ""));
            String pilot = getMapString(map, "receiverUsername", getMapString(map, "pilotCallsign", "pilotoOperacional"));
            String route = getMapString(map, "requestedInstanceId", getMapString(map, "missionRoute", "PATRULHA_PADRAO"));
            String eventType = getMapString(map, "eventType", "DESPACHO_SOLICITADO");
            String compCode = getMapString(map, "consumablePartCode", "COMP-03");

            // Monta o evento de alteração com dados consolidados da requisição
            return new DespachoEstoqueEvento(
                    orderId,
                    shipCode,
                    pilot,
                    route,
                    eventType,
                    compCode,
                    1,
                    LocalDateTime.now()
            );
        }

        try {
            // Conversão de contingência: tenta serializar via Jackson caso seja outro formato de payload
            return objectMapper.convertValue(payload, DespachoEstoqueEvento.class);
        } catch (Exception ex) {
            log.warn("[ESTOQUE AMQP LISTENER] Tentativa de conversao generica falhou: {}", ex.getMessage());
            return null;
        }
    }

    // Auxiliar seguro para ler chaves do Map com fallback para valores padrão sem lançar NPE
    private String getMapString(Map<?, ?> map, String key, String defaultValue) {
        Object val = map.get(key);
        return val != null ? val.toString() : defaultValue;
    }
}

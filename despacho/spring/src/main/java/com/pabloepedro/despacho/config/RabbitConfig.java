package com.pabloepedro.despacho.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Estrutura de Mensageria Pub/Sub com RabbitMQ (compativel com CloudAMQP).
 * O Publisher envia a mensagem para a Exchange de Despacho e multiplos Subscribers
 * (Filas de Liquidacao e de Notificacao/Auditoria) consomem a mesma mensagem de forma independente.
 */
@Configuration
public class RabbitConfig {

    // Exchange de Pub/Sub de Despacho
    public static final String DESPACHO_PUBSUB_EXCHANGE = "giedi.despacho.pubsub.exchange";

    // Fila do Assinante 1: Processamento e Liquidacao do Despacho
    public static final String QUEUE_DESPACHO_SETTLEMENT = "giedi.despacho.settlement.queue";

    // Fila do Assinante 2: Notificacao e Auditoria de Despacho
    public static final String QUEUE_DESPACHO_NOTIFICATION = "giedi.despacho.notification.queue";

    // Exchange do tipo Fanout: joga a mesma mensagem pras duas filas ao mesmo tempo
    @Bean
    public FanoutExchange despachoPubSubExchange() {
        return new FanoutExchange(DESPACHO_PUBSUB_EXCHANGE, true, false);
    }

    // Fila 1: processa a liquidação e liberação da nave (durable pra não perder se cair)
    @Bean
    public Queue despachoSettlementQueue() {
        return QueueBuilder.durable(QUEUE_DESPACHO_SETTLEMENT).build();
    }

    // Fila 2: grava log e dispara avisos de auditoria
    @Bean
    public Queue despachoNotificationQueue() {
        return QueueBuilder.durable(QUEUE_DESPACHO_NOTIFICATION).build();
    }

    // Conecta a fila de liquidação na exchange
    @Bean
    public Binding bindingSettlement(Queue despachoSettlementQueue, FanoutExchange despachoPubSubExchange) {
        return BindingBuilder.bind(despachoSettlementQueue).to(despachoPubSubExchange);
    }

    // Conecta a fila de auditoria na exchange
    @Bean
    public Binding bindingNotification(Queue despachoNotificationQueue, FanoutExchange despachoPubSubExchange) {
        return BindingBuilder.bind(despachoNotificationQueue).to(despachoPubSubExchange);
    }

    // Exchange e Fila dedicadas para o Estoque sincronizar em tempo real as alteracoes fisicas
    public static final String ESTOQUE_SYNC_EXCHANGE = "giedi.estoque.sync.exchange";
    public static final String ESTOQUE_ROUTING_KEY = "despacho.alterar-estoque";
    public static final String QUEUE_ESTOQUE_DESPACHO = "giedi.estoque.despacho.queue";

    @Bean
    public DirectExchange estoqueSyncExchange() {
        return new DirectExchange(ESTOQUE_SYNC_EXCHANGE, true, false);
    }

    @Bean
    public Queue estoqueDespachoQueue() {
        return QueueBuilder.durable(QUEUE_ESTOQUE_DESPACHO).build();
    }

    // Conecta a fila do estoque na exchange Pub/Sub fanout para receber broadcast de despachos
    @Bean
    public Binding bindingEstoquePubSub(Queue estoqueDespachoQueue, FanoutExchange despachoPubSubExchange) {
        return BindingBuilder.bind(estoqueDespachoQueue).to(despachoPubSubExchange);
    }

    // Conecta a fila do estoque na exchange direta de alteracao de estoque
    @Bean
    public Binding bindingEstoqueDirect(Queue estoqueDespachoQueue, DirectExchange estoqueSyncExchange) {
        return BindingBuilder.bind(estoqueDespachoQueue).to(estoqueSyncExchange).with(ESTOQUE_ROUTING_KEY);
    }

    // Exchange e fila de sincronização de missões e despacho operacional
    public static final String ATUALIZAR_MISSAO_EXCHANGE = "atualizar-missao-exchange";
    public static final String ATUALIZAR_MISSAO_QUEUE = "atualizar-missao-queue";

    @Bean
    public DirectExchange atualizarMissaoExchange() {
        return new DirectExchange(ATUALIZAR_MISSAO_EXCHANGE, true, false);
    }

    @Bean
    public Queue atualizarMissaoQueue() {
        return QueueBuilder.durable(ATUALIZAR_MISSAO_QUEUE).build();
    }

    @Bean
    public Binding bindingAtualizarMissao(Queue atualizarMissaoQueue, DirectExchange atualizarMissaoExchange) {
        return BindingBuilder.bind(atualizarMissaoQueue).to(atualizarMissaoExchange).with(ATUALIZAR_MISSAO_QUEUE);
    }

    // Serializa os objetos Java em JSON bonitinho pro RabbitMQ
    @Bean
    public MessageConverter jsonMessageConverter() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        return new Jackson2JsonMessageConverter(mapper);
    }

    // Template pronto pra injetar e publicar mensagens na fila
    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory, MessageConverter jsonMessageConverter) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter);
        return template;
    }
}
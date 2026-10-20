package com.pabloepedro.estoque.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.annotation.EnableRabbit;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuração de mensageria AMQP (RabbitMQ / CloudAMQP) no microsserviço de Estoque.
 * Conecta o microsserviço à fila assíncrona para que todo evento de despacho emitido
 * pelo serviço de Despacho seja consumido e altere em tempo real o saldo de naves e suprimentos.
 */
@Configuration
@EnableRabbit
public class EstoqueRabbitConfig {

    // Exchange Fanout emitida pelo microsserviço de Despacho
    public static final String DESPACHO_PUBSUB_EXCHANGE = "giedi.despacho.pubsub.exchange";

    // Exchange direta para sincronização estrita de alteração de estoque
    public static final String ESTOQUE_SYNC_EXCHANGE = "giedi.estoque.sync.exchange";
    public static final String ESTOQUE_ROUTING_KEY = "despacho.alterar-estoque";

    // Fila dedicada do microsserviço de Estoque para receber pedidos de despacho
    public static final String QUEUE_ESTOQUE_DESPACHO = "giedi.estoque.despacho.queue";

    // Exchange Fanout para escutar o broadcast geral de despachos
    @Bean
    public FanoutExchange despachoPubSubExchange() {
        return new FanoutExchange(DESPACHO_PUBSUB_EXCHANGE, true, false);
    }

    // Exchange Direct para atualizações direcionadas de alteração de estoque
    @Bean
    public DirectExchange estoqueSyncExchange() {
        return new DirectExchange(ESTOQUE_SYNC_EXCHANGE, true, false);
    }

    // Fila durável do estoque: persiste as mensagens mesmo se o broker reiniciar
    @Bean
    public Queue estoqueDespachoQueue() {
        return QueueBuilder.durable(QUEUE_ESTOQUE_DESPACHO).build();
    }

    // Conecta a fila do estoque na exchange Fanout de despacho
    @Bean
    public Binding bindingEstoquePubSub(Queue estoqueDespachoQueue, FanoutExchange despachoPubSubExchange) {
        return BindingBuilder.bind(estoqueDespachoQueue).to(despachoPubSubExchange);
    }

    // Conecta a fila do estoque na exchange Direct usando a routing key definida
    @Bean
    public Binding bindingEstoqueDirect(Queue estoqueDespachoQueue, DirectExchange estoqueSyncExchange) {
        return BindingBuilder.bind(estoqueDespachoQueue).to(estoqueSyncExchange).with(ESTOQUE_ROUTING_KEY);
    }

    // Serializador para converter automaticamente DTOs e eventos em JSON
    @Bean
    public MessageConverter jsonMessageConverter() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        return new Jackson2JsonMessageConverter(mapper);
    }

    // Template do Spring AMQP configurado com conversor JSON para publicar mensagens
    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory, MessageConverter jsonMessageConverter) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter);
        return template;
    }
}

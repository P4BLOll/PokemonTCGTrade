package com.pabloepedro.trade.config;

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
 * O Publisher envia a mensagem para a Exchange e multiplos Subscribers
 * (Filas de Liquidacao e de Notificacao/Auditoria) consomem a mesma mensagem de forma independente.
 */
@Configuration
public class RabbitConfig {

    // Exchange de Pub/Sub (Fanout distribui para todas as filas inscritas)
    public static final String TRADE_PUBSUB_EXCHANGE = "tcg.trade.pubsub.exchange";

    // Fila do Assinante 1: Processamento e Liquidacao da Troca
    public static final String QUEUE_TRADE_SETTLEMENT = "tcg.trade.settlement.queue";

    // Fila do Assinante 2: Notificacao aos Treinadores e Auditoria
    public static final String QUEUE_TRADE_NOTIFICATION = "tcg.trade.notification.queue";

    @Bean
    public FanoutExchange tradePubSubExchange() {
        return new FanoutExchange(TRADE_PUBSUB_EXCHANGE, true, false);
    }

    @Bean
    public Queue tradeSettlementQueue() {
        return QueueBuilder.durable(QUEUE_TRADE_SETTLEMENT).build();
    }

    @Bean
    public Queue tradeNotificationQueue() {
        return QueueBuilder.durable(QUEUE_TRADE_NOTIFICATION).build();
    }

    // Inscricao (Binding) da Fila 1 no Pub/Sub
    @Bean
    public Binding bindingSettlement(Queue tradeSettlementQueue, FanoutExchange tradePubSubExchange) {
        return BindingBuilder.bind(tradeSettlementQueue).to(tradePubSubExchange);
    }

    // Inscricao (Binding) da Fila 2 no Pub/Sub
    @Bean
    public Binding bindingNotification(Queue tradeNotificationQueue, FanoutExchange tradePubSubExchange) {
        return BindingBuilder.bind(tradeNotificationQueue).to(tradePubSubExchange);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        return new Jackson2JsonMessageConverter(mapper);
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory, MessageConverter jsonMessageConverter) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter);
        return template;
    }
}
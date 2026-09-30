package com.pabloepedro.trade.queue;

import com.pabloepedro.trade.config.RabbitConfig;
import com.pabloepedro.trade.entity.TradeProposal;
import com.pabloepedro.trade.entity.enumerable.TradeStatus;
import com.pabloepedro.trade.repository.TradeRepo;
import com.pabloepedro.trade.repository.TrainerBinderRepo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

/**
 * Assinantes (Subscribers) do padrao Pub/Sub escutando suas respectivas filas
 * a partir da Exchange de eventos de troca.
 */
@Component
public class TradeConsumer {

    private static final Logger log = LoggerFactory.getLogger(TradeConsumer.class);

    private final TrainerBinderRepo binderRepo;
    private final TradeRepo tradeRepo;

    public TradeConsumer(TrainerBinderRepo binderRepo, TradeRepo tradeRepo) {
        this.binderRepo = binderRepo;
        this.tradeRepo = tradeRepo;
    }

    /**
     * ASSINANTE 1: Processamento e Liquidacao da Troca
     * Consome a mensagem assincrona da fila de liquidacao e transfere a titularidade das cartas.
     */
    @RabbitListener(queues = RabbitConfig.QUEUE_TRADE_SETTLEMENT)
    public void processTradeSettlement(TradeProposal proposal) {
        log.info("[PUB/SUB - SUBSCRIBER 1 - LIQUIDACAO] Recebida proposta [{}] para transferencia de posse", proposal.id());

        try {
            // Transfere carta A do remetente para o destinatario
            binderRepo.transferCard(proposal.senderUsername(), proposal.receiverUsername(), proposal.offeredInstanceId());
            // Transfere carta B do destinatario para o remetente
            binderRepo.transferCard(proposal.receiverUsername(), proposal.senderUsername(), proposal.requestedInstanceId());

            // Atualiza status no banco para ACCEPTED
            TradeProposal completed = new TradeProposal(
                    proposal.id(),
                    proposal.senderUsername(),
                    proposal.receiverUsername(),
                    proposal.offeredInstanceId(),
                    proposal.requestedInstanceId(),
                    TradeStatus.ACCEPTED,
                    proposal.createdAt()
            );
            tradeRepo.save(completed);

            log.info("[PUB/SUB - SUBSCRIBER 1] Troca [{}] liquidada com sucesso entre {} e {}!",
                    proposal.id(), proposal.senderUsername(), proposal.receiverUsername());

        } catch (Exception ex) {
            log.error("[PUB/SUB - SUBSCRIBER 1] Erro na liquidacao da troca [{}]: {}", proposal.id(), ex.getMessage());
        }
    }

    /**
     * ASSINANTE 2: Notificacao e Auditoria
     * Consome a mesma mensagem assincrona em paralelo na fila de notificacao para alertar os treinadores.
     */
    @RabbitListener(queues = RabbitConfig.QUEUE_TRADE_NOTIFICATION)
    public void processTradeNotification(TradeProposal proposal) {
        log.info("[PUB/SUB - SUBSCRIBER 2 - NOTIFICACAO] Disparando alerta aos treinadores: {} e {}!",
                proposal.senderUsername(), proposal.receiverUsername());
        log.info("[PUB/SUB - SUBSCRIBER 2] Treinador [{}] recebeu a carta [{}] | Treinador [{}] recebeu a carta [{}]",
                proposal.receiverUsername(), proposal.offeredInstanceId(),
                proposal.senderUsername(), proposal.requestedInstanceId());
    }
}
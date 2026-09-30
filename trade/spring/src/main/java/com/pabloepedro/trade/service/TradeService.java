package com.pabloepedro.trade.service;

import com.pabloepedro.trade.entity.TradeProposal;
import com.pabloepedro.trade.entity.enumerable.TradeStatus;
import com.pabloepedro.trade.queue.TradeQueueProducer;
import com.pabloepedro.trade.repository.TradeRepo;
import com.pabloepedro.trade.repository.TrainerBinderRepo;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class TradeService {

    private final TrainerBinderRepo binderRepo;
    private final TradeRepo tradeRepo;
    private final TradeQueueProducer queueProducer;

    public TradeService(TrainerBinderRepo binderRepo, TradeRepo tradeRepo, TradeQueueProducer queueProducer) {
        this.binderRepo = binderRepo;
        this.tradeRepo = tradeRepo;
        this.queueProducer = queueProducer;
    }

    public TradeProposal proposeTrade(String sender, String receiver, String offeredInstanceId, String requestedInstanceId) {
        boolean locked = binderRepo.lockCardInstance(sender, offeredInstanceId);
        if (!locked) {
            throw new IllegalStateException("A sua carta (" + offeredInstanceId + ") ja esta bloqueada em outra negociacao ou indisponivel!");
        }

        TradeProposal proposal = new TradeProposal(
                UUID.randomUUID().toString(),
                sender,
                receiver,
                offeredInstanceId,
                requestedInstanceId,
                TradeStatus.PENDING,
                LocalDateTime.now()
        );

        return tradeRepo.save(proposal);
    }

    public TradeProposal acceptTrade(String tradeId, String receiver) {
        TradeProposal proposal = tradeRepo.findById(tradeId)
                .orElseThrow(() -> new IllegalArgumentException("Proposta de troca nao encontrada: " + tradeId));

        if (proposal.status() != TradeStatus.PENDING) {
            throw new IllegalStateException("Esta proposta nao esta mais pendente (Status: " + proposal.status() + ")");
        }

        if (!proposal.receiverUsername().equalsIgnoreCase(receiver)) {
            throw new IllegalArgumentException("Apenas o destinatario (" + proposal.receiverUsername() + ") pode aceitar esta troca.");
        }

        boolean locked = binderRepo.lockCardInstance(receiver, proposal.requestedInstanceId());
        if (!locked) {
            throw new IllegalStateException("A carta solicitada (" + proposal.requestedInstanceId() + ") ja esta em outra negociacao ou indisponivel!");
        }

        queueProducer.sendTradeRequested(proposal);
        return proposal;
    }

    public void cancelTrade(String tradeId, String sender) {
        TradeProposal proposal = tradeRepo.findById(tradeId)
                .orElseThrow(() -> new IllegalArgumentException("Proposta nao encontrada: " + tradeId));

        if (proposal.status() != TradeStatus.PENDING) {
            throw new IllegalStateException("Apenas trocas pendentes podem ser canceladas.");
        }

        binderRepo.unlockCardInstance(sender, proposal.offeredInstanceId());

        TradeProposal cancelled = new TradeProposal(
                proposal.id(),
                proposal.senderUsername(),
                proposal.receiverUsername(),
                proposal.offeredInstanceId(),
                proposal.requestedInstanceId(),
                TradeStatus.CANCELLED,
                proposal.createdAt()
        );
        tradeRepo.save(cancelled);
    }
}
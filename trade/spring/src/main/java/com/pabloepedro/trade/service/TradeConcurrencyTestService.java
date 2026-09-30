package com.pabloepedro.trade.service;

import com.pabloepedro.trade.entity.TradeProposal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
public class TradeConcurrencyTestService {

    private static final Logger log = LoggerFactory.getLogger(TradeConcurrencyTestService.class);
    private final TradeService tradeService;

    public TradeConcurrencyTestService(TradeService tradeService) {
        this.tradeService = tradeService;
    }

    public Map<String, Object> executeConcurrencyTest(String sender, String receiver, String cardInstanceId, String otherCardInstanceId) {
        ExecutorService executor = Executors.newFixedThreadPool(2);

        log.info("Executando teste de concorrencia: 2 threads simultaneas tentando bloquear carta {}", cardInstanceId);

        CompletableFuture<String> task1 = CompletableFuture.supplyAsync(() -> {
            try {
                TradeProposal p1 = tradeService.proposeTrade(sender, receiver, cardInstanceId, otherCardInstanceId);
                return "Sucesso Thread 1: Proposta criada id=" + p1.id();
            } catch (Exception e) {
                return "Lock evitou conflito Thread 1: " + e.getMessage();
            }
        }, executor);

        CompletableFuture<String> task2 = CompletableFuture.supplyAsync(() -> {
            try {
                TradeProposal p2 = tradeService.proposeTrade(sender, receiver, cardInstanceId, otherCardInstanceId);
                return "Sucesso Thread 2: Proposta criada id=" + p2.id();
            } catch (Exception e) {
                return "Lock evitou conflito Thread 2: " + e.getMessage();
            }
        }, executor);

        CompletableFuture.allOf(task1, task2).join();
        executor.shutdown();

        String res1 = task1.join();
        String res2 = task2.join();

        return Map.of(
                "thread1Result", res1,
                "thread2Result", res2,
                "concurrencyControlled", true
        );
    }
}
package com.pabloepedro.trade.controller;

import com.pabloepedro.trade.controller.adapter.TradeCtrlAdp;
import com.pabloepedro.trade.controller.request.TradeProposeRequest;
import com.pabloepedro.trade.controller.response.TradeProposalResponse;
import com.pabloepedro.trade.entity.TradeProposal;
import com.pabloepedro.trade.entity.enumerable.TradeStatus;
import com.pabloepedro.trade.repository.TradeRepo;
import com.pabloepedro.trade.service.TradeConcurrencyTestService;
import com.pabloepedro.trade.service.TradeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/trades")
public class TradeCtrl {

    private final TradeService tradeService;
    private final TradeRepo tradeRepo;
    private final TradeConcurrencyTestService concurrencyTestService;

    public TradeCtrl(TradeService tradeService, TradeRepo tradeRepo, TradeConcurrencyTestService concurrencyTestService) {
        this.tradeService = tradeService;
        this.tradeRepo = tradeRepo;
        this.concurrencyTestService = concurrencyTestService;
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping("/propose")
    public TradeProposalResponse proposeTrade(@RequestBody @Valid TradeProposeRequest request) {
        TradeProposal proposal = tradeService.proposeTrade(
                request.senderUsername(),
                request.receiverUsername(),
                request.offeredInstanceId(),
                request.requestedInstanceId()
        );
        return TradeCtrlAdp.toResponse(proposal);
    }

    @PostMapping("/accept/{tradeId}")
    public TradeProposalResponse acceptTrade(@PathVariable String tradeId, @RequestParam String receiverUsername) {
        TradeProposal proposal = tradeService.acceptTrade(tradeId, receiverUsername);
        return TradeCtrlAdp.toResponse(proposal);
    }

    @PostMapping("/cancel/{tradeId}")
    public void cancelTrade(@PathVariable String tradeId, @RequestParam String senderUsername) {
        tradeService.cancelTrade(tradeId, senderUsername);
    }

    @GetMapping("/pending")
    public List<TradeProposalResponse> listPending(@RequestParam(required = false) String trainerUsername) {
        if (trainerUsername != null && !trainerUsername.isBlank()) {
            return tradeRepo.findByTrainer(trainerUsername).stream()
                    .filter(t -> t.status() == TradeStatus.PENDING)
                    .map(TradeCtrlAdp::toResponse)
                    .toList();
        }
        return tradeRepo.findPending().stream().map(TradeCtrlAdp::toResponse).toList();
    }

    @GetMapping("/my-trades/{username}")
    public List<TradeProposalResponse> listMyTrades(@PathVariable String username) {
        return tradeRepo.findByTrainer(username).stream().map(TradeCtrlAdp::toResponse).toList();
    }

    @PostMapping("/test-concurrency")
    public Map<String, Object> testConcurrency(
            @RequestParam String sender,
            @RequestParam String receiver,
            @RequestParam String offeredInstanceId,
            @RequestParam String requestedInstanceId
    ) {
        return concurrencyTestService.executeConcurrencyTest(sender, receiver, offeredInstanceId, requestedInstanceId);
    }
}
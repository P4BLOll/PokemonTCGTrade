package com.pabloepedro.trade.controller;

import com.pabloepedro.trade.controller.adapter.CardCtrlAdp;
import com.pabloepedro.trade.controller.request.CardRequest;
import com.pabloepedro.trade.controller.response.CardOwnerDto;
import com.pabloepedro.trade.controller.response.CardResponse;
import com.pabloepedro.trade.entity.Card;
import com.pabloepedro.trade.repository.CardRepo;
import com.pabloepedro.trade.repository.TrainerBinderRepo;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cards")
public class CardCtrl {

    private final CardRepo cardRepo;
    private final TrainerBinderRepo binderRepo;

    public CardCtrl(CardRepo cardRepo, TrainerBinderRepo binderRepo) {
        this.cardRepo = cardRepo;
        this.binderRepo = binderRepo;
    }

    @GetMapping("/catalog")
    public List<CardResponse> listCatalog() {
        return cardRepo.findAll().stream().map(CardCtrlAdp::toResponse).toList();
    }

    @GetMapping("/{id}")
    public CardResponse getCard(@PathVariable String id) {
        Card card = cardRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Carta nao encontrada: " + id));
        return CardCtrlAdp.toResponse(card);
    }

    @GetMapping("/{id}/owners")
    public List<CardOwnerDto> getCardOwners(@PathVariable String id) {
        return binderRepo.findAll().stream()
                .flatMap(binder -> binder.cards().stream()
                        .filter(c -> c.cardId().equalsIgnoreCase(id))
                        .map(c -> new CardOwnerDto(
                                binder.trainerUsername(),
                                c.instanceId(),
                                c.lockedForTrade()
                        ))
                ).toList();
    }

    @GetMapping("/with-offers")
    public List<String> getCardsWithOffers() {
        return binderRepo.findAll().stream()
                .flatMap(binder -> binder.cards().stream())
                .filter(c -> !c.lockedForTrade())
                .map(c -> c.cardId())
                .distinct()
                .toList();
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping("/new")
    public CardResponse createCard(@RequestBody @Valid CardRequest request) {
        Card card = CardCtrlAdp.toDomain(request);
        Card saved = cardRepo.save(card);
        return CardCtrlAdp.toResponse(saved);
    }
}
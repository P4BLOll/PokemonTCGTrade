package com.pabloepedro.trade.controller;

import com.pabloepedro.trade.controller.response.TrainerBinderResponse;
import com.pabloepedro.trade.entity.TrainerBinder;
import com.pabloepedro.trade.repository.TrainerBinderRepo;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/binders")
public class BinderCtrl {

    private final TrainerBinderRepo binderRepo;

    public BinderCtrl(TrainerBinderRepo binderRepo) {
        this.binderRepo = binderRepo;
    }

    @GetMapping("/{username}")
    public TrainerBinderResponse getBinder(@PathVariable String username) {
        TrainerBinder binder = binderRepo.findByTrainerUsername(username.toLowerCase())
                .orElseGet(() -> binderRepo.save(new TrainerBinder(UUID.randomUUID().toString(), username.toLowerCase(), List.of())));
        return new TrainerBinderResponse(binder.id(), binder.trainerUsername(), binder.cards());
    }
}
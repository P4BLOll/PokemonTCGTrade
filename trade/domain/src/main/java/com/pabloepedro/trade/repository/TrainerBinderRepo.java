package com.pabloepedro.trade.repository;

import com.pabloepedro.trade.entity.TrainerBinder;
import java.util.List;
import java.util.Optional;

public interface TrainerBinderRepo {
    TrainerBinder save(TrainerBinder binder);
    Optional<TrainerBinder> findByTrainerUsername(String trainerUsername);
    List<TrainerBinder> findAll();
    boolean lockCardInstance(String trainerUsername, String instanceId);
    void unlockCardInstance(String trainerUsername, String instanceId);
    void transferCard(String fromTrainer, String toTrainer, String instanceId);
}
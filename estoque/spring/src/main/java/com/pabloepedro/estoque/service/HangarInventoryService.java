package com.pabloepedro.estoque.service;

import com.pabloepedro.estoque.entity.ArsenalComponent;
import com.pabloepedro.estoque.entity.DockBay;
import com.pabloepedro.estoque.entity.ShipAsset;
import com.pabloepedro.estoque.repository.HangarInventoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

// Regras de negócio do hangar: gerencia status das naves, bloqueios sincronizados para despacho e estoque do arsenal
@Service
public class HangarInventoryService {

    private final HangarInventoryRepository repository;

    public HangarInventoryService(HangarInventoryRepository repository) {
        this.repository = repository;
    }

    public List<ShipAsset> listAllShips(String classFilter, String statusFilter) {
        return repository.findAllShips().stream()
                .filter(s -> classFilter == null || classFilter.isBlank() || s.getClassType().equalsIgnoreCase(classFilter))
                .filter(s -> statusFilter == null || statusFilter.isBlank() || s.getStatus().equalsIgnoreCase(statusFilter))
                .toList();
    }

    public Optional<ShipAsset> getShip(String code) {
        return repository.findShipByCode(code);
    }

    // O "synchronized" garante que apenas uma thread por vez execute esse método,
    // impedindo que dois pilotos travem a mesma nave simultaneamente na memória.
    public synchronized ShipAsset lockShipForDispatch(String code, String pilotCallsign) {
        ShipAsset ship = repository.findShipByCode(code)
                .orElseThrow(() -> new IllegalArgumentException("Nave nao encontrada no hangar: " + code));

        // Se a nave já estiver travada ou voando, recusa a requisição
        if ("QUEUED_LOCK".equalsIgnoreCase(ship.getStatus()) || "IN_MISSION".equalsIgnoreCase(ship.getStatus())) {
            throw new IllegalStateException("Nave " + code + " ja se encontra sob lock atômico ou em missao ativa!");
        }

        // Marca a nave como travada e associa ao piloto
        ship.setStatus("QUEUED_LOCK");
        ship.setCurrentLockHolder(pilotCallsign);
        ship.setQueueDepth(ship.getQueueDepth() + 1);
        return repository.saveShip(ship);
    }

    // Libera a nave de volta pro status PRONTA (READY)
    public synchronized ShipAsset releaseShip(String code) {
        ShipAsset ship = repository.findShipByCode(code)
                .orElseThrow(() -> new IllegalArgumentException("Nave nao encontrada no hangar: " + code));

        ship.setStatus("READY");
        ship.setCurrentLockHolder(null);
        if (ship.getQueueDepth() > 0) ship.setQueueDepth(ship.getQueueDepth() - 1);
        return repository.saveShip(ship);
    }

    // Lista todas as peças do arsenal
    public List<ArsenalComponent> listArsenal() {
        return repository.findAllComponents();
    }

    public List<ArsenalComponent> listCriticalArsenal() {
        return repository.findAllComponents().stream()
                .filter(ArsenalComponent::isBelowThreshold)
                .toList();
    }

    public ArsenalComponent replenishStock(String code, int unitsToAdd) {
        ArsenalComponent comp = repository.findComponentByCode(code)
                .orElseThrow(() -> new IllegalArgumentException("Componente nao encontrado: " + code));

        comp.setStockUnits(comp.getStockUnits() + unitsToAdd);
        return repository.saveComponent(comp);
    }

    public List<DockBay> listDockBays() {
        return repository.findAllDockBays();
    }

    public Map<String, Object> getHangarMetrics() {
        List<ShipAsset> all = repository.findAllShips();
        long ready = all.stream().filter(s -> "READY".equalsIgnoreCase(s.getStatus())).count();
        long inMission = all.stream().filter(s -> "IN_MISSION".equalsIgnoreCase(s.getStatus())).count();
        long maintenance = all.stream().filter(s -> "MAINTENANCE".equalsIgnoreCase(s.getStatus())).count();
        long locked = all.stream().filter(s -> "QUEUED_LOCK".equalsIgnoreCase(s.getStatus())).count();
        long criticalStock = repository.findAllComponents().stream().filter(ArsenalComponent::isBelowThreshold).count();

        return Map.of(
                "totalShipsInHangar", all.size(),
                "shipsReady", ready,
                "shipsInMission", inMission,
                "shipsMaintenance", maintenance,
                "shipsLockedDispatch", locked,
                "criticalArsenalCount", criticalStock,
                "dockBaysTotal", 8,
                "dockBaysOccupied", repository.findAllDockBays().stream().filter(DockBay::isOccupied).count()
        );
    }
}

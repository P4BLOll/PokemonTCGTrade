package com.pabloepedro.estoque.service;

import com.pabloepedro.estoque.entity.ArsenalComponent;
import com.pabloepedro.estoque.entity.DockBay;
import com.pabloepedro.estoque.entity.ShipAsset;
import com.pabloepedro.estoque.event.DespachoEstoqueEvento;
import com.pabloepedro.estoque.repository.ArsenalRepository;
import com.pabloepedro.estoque.repository.DockBayRepository;
import com.pabloepedro.estoque.repository.ShipRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Implementação do serviço de inventário do Hangar e Estoque.
 * Pertence ao módulo de infraestrutura (Spring), implementando o contrato do Domínio.
 * Respeita a Inversão de Dependências (DIP) e o Princípio de Responsabilidade Única (SRP).
 */
@Service
public class HangarInventoryServiceImpl implements HangarInventoryService {

    private static final Logger log = LoggerFactory.getLogger(HangarInventoryServiceImpl.class);

    private final ShipRepository shipRepository;
    private final ArsenalRepository arsenalRepository;
    private final DockBayRepository dockBayRepository;

    public HangarInventoryServiceImpl(
            ShipRepository shipRepository,
            ArsenalRepository arsenalRepository,
            DockBayRepository dockBayRepository) {
        this.shipRepository = shipRepository;
        this.arsenalRepository = arsenalRepository;
        this.dockBayRepository = dockBayRepository;
    }

    @Override
    public List<ShipAsset> listAllShips(String classFilter, String statusFilter) {
        return shipRepository.findAllShips().stream()
                .filter(s -> classFilter == null || classFilter.isBlank() || s.getClassType().equalsIgnoreCase(classFilter))
                .filter(s -> statusFilter == null || statusFilter.isBlank() || s.getStatus().equalsIgnoreCase(statusFilter))
                .toList();
    }

    @Override
    public Optional<ShipAsset> getShip(String code) {
        return shipRepository.findShipByCode(code);
    }

    @Override
    public synchronized ShipAsset lockShipForDispatch(String code, String pilotCallsign) {
        ShipAsset ship = shipRepository.findShipByCode(code)
                .orElseThrow(() -> new IllegalArgumentException("Nave nao encontrada no hangar: " + code));

        if ("QUEUED_LOCK".equalsIgnoreCase(ship.getStatus()) || "IN_MISSION".equalsIgnoreCase(ship.getStatus())) {
            throw new IllegalStateException("Nave " + code + " ja se encontra sob lock atômico ou em missao ativa!");
        }

        ship.setStatus("QUEUED_LOCK");
        ship.setCurrentLockHolder(pilotCallsign);
        ship.setQueueDepth(ship.getQueueDepth() + 1);
        return shipRepository.saveShip(ship);
    }

    @Override
    public synchronized ShipAsset releaseShip(String code) {
        ShipAsset ship = shipRepository.findShipByCode(code)
                .orElseThrow(() -> new IllegalArgumentException("Nave nao encontrada no hangar: " + code));

        ship.setStatus("READY");
        ship.setCurrentLockHolder(null);
        if (ship.getQueueDepth() > 0) ship.setQueueDepth(ship.getQueueDepth() - 1);
        return shipRepository.saveShip(ship);
    }

    @Override
    public List<ArsenalComponent> listArsenal() {
        return arsenalRepository.findAllComponents();
    }

    @Override
    public List<ArsenalComponent> listCriticalArsenal() {
        return arsenalRepository.findAllComponents().stream()
                .filter(ArsenalComponent::isBelowThreshold)
                .toList();
    }

    @Override
    public ArsenalComponent replenishStock(String code, int unitsToAdd) {
        ArsenalComponent comp = arsenalRepository.findComponentByCode(code)
                .orElseThrow(() -> new IllegalArgumentException("Componente nao encontrado: " + code));

        comp.setStockUnits(comp.getStockUnits() + unitsToAdd);
        return arsenalRepository.saveComponent(comp);
    }

    @Override
    public List<DockBay> listDockBays() {
        return dockBayRepository.findAllDockBays();
    }

    @Override
    public Map<String, Object> getHangarMetrics() {
        List<ShipAsset> all = shipRepository.findAllShips();
        long ready = all.stream().filter(s -> "READY".equalsIgnoreCase(s.getStatus())).count();
        long inMission = all.stream().filter(s -> "IN_MISSION".equalsIgnoreCase(s.getStatus())).count();
        long maintenance = all.stream().filter(s -> "MAINTENANCE".equalsIgnoreCase(s.getStatus())).count();
        long locked = all.stream().filter(s -> "QUEUED_LOCK".equalsIgnoreCase(s.getStatus())).count();
        long criticalStock = arsenalRepository.findAllComponents().stream().filter(ArsenalComponent::isBelowThreshold).count();

        return Map.of(
                "totalShipsInHangar", all.size(),
                "shipsReady", ready,
                "shipsInMission", inMission,
                "shipsMaintenance", maintenance,
                "shipsLockedDispatch", locked,
                "criticalArsenalCount", criticalStock,
                "dockBaysTotal", 8,
                "dockBaysOccupied", dockBayRepository.findAllDockBays().stream().filter(DockBay::isOccupied).count()
        );
    }

    /**
     * MENSAGERIA ASSÍNCRONA: Atualização física do Estoque ao consumir mensagem do Despacho via RabbitMQ.
     */
    @Override
    public synchronized void processarEventoDespacho(DespachoEstoqueEvento evento) {
        log.info("──────────────────────────────────────────────────────────────────────────");
        log.info("[MENSAGERIA RABBITMQ -> ESTOQUE] Mensagem recebida do microsserviço de Despacho!");
        log.info("Ordem: [{}] | Nave: [{}] | Piloto: [{}] | Ação: [{}]",
                evento.orderId(), evento.shipCode(), evento.pilotCallsign(), evento.eventType());

        String eventType = evento.eventType() != null ? evento.eventType().toUpperCase() : "DESPACHO_SOLICITADO";

        if ("DESPACHO_DEVOLVIDO".equals(eventType) || "RETURNED".equals(eventType)) {
            processarDevolucaoNave(evento);
        } else {
            processarAlocacaoEDespacho(evento);
        }
        log.info("──────────────────────────────────────────────────────────────────────────");
    }

    private void processarAlocacaoEDespacho(DespachoEstoqueEvento evento) {
        String shipCode = evento.shipCode();

        // 1. Localiza a nave correspondente no inventário físico do Hangar
        Optional<ShipAsset> shipOpt = encontrarNave(shipCode);

        if (shipOpt.isPresent()) {
            ShipAsset ship = shipOpt.get();
            String statusAnterior = ship.getStatus();

            // Altera o estado no estoque: nave sai de prontidão e vai para missão
            ship.setStatus("IN_MISSION");
            ship.setCurrentLockHolder(evento.pilotCallsign());
            ship.setFlightHours(ship.getFlightHours() + 2);
            ship.setFuelPercent(Math.max(10, ship.getFuelPercent() - 20));
            shipRepository.saveShip(ship);

            log.info("[ESTOQUE MUTATION - NAVE] Nave [{}] alterada com sucesso no Estoque! Status anterior: [{}], Novo status: [IN_MISSION], Piloto alocado: [{}]",
                    ship.getCode(), statusAnterior, evento.pilotCallsign());

            // 2. Atualiza a baia de ancoragem física se houver vínculo
            if (ship.getBay() != null && !ship.getBay().isBlank()) {
                atualizarBaiaOcupacao(ship.getBay(), ship.getCode());
            }
        } else {
            log.warn("[ESTOQUE WARNING] Nave [{}] nao encontrada pelo codigo exato. Aplicando baixa de suprimentos de missao.", shipCode);
        }

        // 3. Dá baixa nos insumos/suprimentos do Arsenal técnico (ex: Células de Fusão gastas na decolagem)
        String compCode = (evento.consumablePartCode() != null && !evento.consumablePartCode().isBlank())
                ? evento.consumablePartCode()
                : "COMP-03";
        int qtdBaixa = evento.consumableQuantity() > 0 ? evento.consumableQuantity() : 1;

        Optional<ArsenalComponent> compOpt = arsenalRepository.findComponentByCode(compCode);
        if (compOpt.isPresent()) {
            ArsenalComponent comp = compOpt.get();
            int saldoAnterior = comp.getStockUnits();
            comp.setStockUnits(Math.max(0, saldoAnterior - qtdBaixa));
            arsenalRepository.saveComponent(comp);

            log.info("[ESTOQUE MUTATION - ARSENAL] Suprimento [{}] baixado no estoque! Saldo anterior: {}, Unidades debitadas: {}, Saldo atual: {}",
                    comp.getCode(), saldoAnterior, qtdBaixa, comp.getStockUnits());
        }
    }

    private void processarDevolucaoNave(DespachoEstoqueEvento evento) {
        Optional<ShipAsset> shipOpt = encontrarNave(evento.shipCode());
        if (shipOpt.isPresent()) {
            ShipAsset ship = shipOpt.get();
            ship.setStatus("READY");
            ship.setCurrentLockHolder(null);
            shipRepository.saveShip(ship);

            log.info("[ESTOQUE MUTATION - DEVOLUCAO] Nave [{}] devolvida ao Hangar! Status redefinido para [READY]. Piloto desvinculado.",
                    ship.getCode());
        }
    }

    private Optional<ShipAsset> encontrarNave(String code) {
        if (code == null || code.isBlank()) return Optional.empty();
        Optional<ShipAsset> direct = shipRepository.findShipByCode(code);
        if (direct.isPresent()) return direct;

        return shipRepository.findAllShips().stream()
                .filter(s -> s.getCode().equalsIgnoreCase(code) ||
                             code.toUpperCase().contains(s.getCode().toUpperCase()) ||
                             s.getCode().toUpperCase().contains(code.toUpperCase()) ||
                             (s.getName() != null && code.toUpperCase().contains(s.getName().toUpperCase())))
                .findFirst();
    }

    private void atualizarBaiaOcupacao(String bayCode, String shipCode) {
        dockBayRepository.findAllDockBays().stream()
                .filter(b -> b.getBayCode().equalsIgnoreCase(bayCode))
                .findFirst()
                .ifPresent(bay -> {
                    bay.setOccupied(true);
                    bay.setVesselCode(shipCode);
                    bay.setBayStatus("IN_FLIGHT");
                    dockBayRepository.saveDockBay(bay);
                });
    }
}

package com.pabloepedro.despacho.service;

import com.pabloepedro.despacho.entity.Despacho;
import com.pabloepedro.despacho.entity.OfficerDock;
import com.pabloepedro.despacho.entity.enumerable.DespachoStatus;
import com.pabloepedro.despacho.event.AtualizarMissaoPublicador;
import com.pabloepedro.despacho.event.dto.AtualizarMissaoEvento;
import com.pabloepedro.despacho.queue.DespachoQueueProducer;
import com.pabloepedro.despacho.repository.OfficerDockRepo;
import com.pabloepedro.despacho.repository.DespachoRepo;
import com.pabloepedro.despacho.entity.DockedAsset;
import com.pabloepedro.despacho.entity.ShipAsset;
import com.pabloepedro.despacho.entity.enumerable.Rarity;
import com.pabloepedro.despacho.entity.enumerable.ShipClass;
import com.pabloepedro.despacho.repository.ShipAssetRepo;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

// Orquestra as requisições de naves, aplicação de locks atômicos e publicação de mensagens no RabbitMQ
@Service
public class DespachoService {

    private final OfficerDockRepo dockRepo;
    private final DespachoRepo despachoRepo;
    private final DespachoQueueProducer queueProducer;
    private final AtualizarMissaoPublicador atualizarMissaoPublicador;
    private final ShipAssetRepo assetRepo;

    public DespachoService(OfficerDockRepo dockRepo, DespachoRepo despachoRepo, DespachoQueueProducer queueProducer,
                           AtualizarMissaoPublicador atualizarMissaoPublicador,
                           ShipAssetRepo assetRepo) {
        this.dockRepo = dockRepo;
        this.despachoRepo = despachoRepo;
        this.queueProducer = queueProducer;
        this.atualizarMissaoPublicador = atualizarMissaoPublicador;
        this.assetRepo = assetRepo;
    }

    public OfficerDock getStationFleet() {
        var dock = dockRepo.findByOfficerUsername("station_alpha_7")
                .orElseGet(() -> new OfficerDock("dck-station-alpha-7", "station_alpha_7", java.util.List.of()));

        var catalogMap = assetRepo.findAll().stream()
                .collect(java.util.stream.Collectors.toMap(ShipAsset::id, a -> a, (a, b) -> a));

        var enrichedAssets = dock.assets().stream().map(asset -> {
            var cat = catalogMap.get(asset.assetId());
            if (cat != null) {
                return new DockedAsset(
                        asset.instanceId(),
                        asset.assetId(),
                        asset.assetName(),
                        asset.type(),
                        asset.rarity(),
                        asset.ownerUsername(),
                        asset.lockedForDispatch(),
                        cat.marketPrice() != null ? cat.marketPrice() : asset.marketPrice(),
                        cat.hp() > 0 ? cat.hp() : asset.hp()
                );
            }
            return asset;
        }).toList();

        return new OfficerDock(dock.id(), dock.officerUsername(), enrichedAssets);
    }

    /**
     * Adiciona uma nova nave à frota operacional da Estação Central e ao catálogo geral.
     * Operação exclusiva para administradores (ROLE_ADMIN).
     */
    public DockedAsset addShipToStationFleet(String name, ShipClass type, Rarity rarity, int hp, Double price) {
        String cleanName = (name != null && !name.isBlank()) ? name.trim() : "Nova Nave Não Identificada";
        String assetId = "ship-" + UUID.randomUUID().toString().substring(0, 8);
        String instanceId = "inst-station-" + UUID.randomUUID().toString().substring(0, 8);
        ShipClass shipClass = type != null ? type : ShipClass.INTERCEPTOR;
        Rarity shipRarity = rarity != null ? rarity : Rarity.RARE;
        double finalPrice = (price != null && price > 0) ? price : 500.0;
        int finalHp = (hp > 0) ? hp : 300;

        DockedAsset dockedAsset = new DockedAsset(
                instanceId,
                assetId,
                cleanName,
                shipClass,
                shipRarity,
                "station_alpha_7",
                false,
                finalPrice,
                finalHp
        );

        dockRepo.addAssetToDock("station_alpha_7", dockedAsset);

        try {
            assetRepo.save(new ShipAsset(
                    assetId,
                    cleanName,
                    shipClass,
                    shipRarity,
                    "Station Alpha Fleet",
                    finalHp,
                    "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2",
                    finalPrice
            ));
        } catch (Exception ignored) {}

        return dockedAsset;
    }

    /**
     * Remove uma nave da frota operacional da Estação Central pelo seu instanceId.
     * Operação exclusiva para administradores (ROLE_ADMIN).
     */
    public void removeShipFromStationFleet(String instanceId) {
        dockRepo.removeAssetFromDock("station_alpha_7", instanceId);
    }

    /**
     * Requisita uma nave diretamente da Estação Central de Naves (STATION_ALPHA_7) para o piloto.
     * Realiza lock atômico na nave da estação e enfileira a ordem no RabbitMQ para despacho.
     */
    public Despacho requestShipFromStation(String pilotUsername, String shipInstanceId, String missionRoute) {
        String pilot = pilotUsername != null ? pilotUsername.toLowerCase() : "pilotoDesconhecido";
        String route = (missionRoute != null && !missionRoute.isBlank()) ? missionRoute : "PATRULHA_ORBITAL_PADRAO";

        if ("admin".equalsIgnoreCase(pilot)) {
            throw new IllegalStateException("O Administrador atua em nível de comando e supervisão. Reservas de vetores de combate são exclusivas para pilotos operacionais!");
        }

        boolean locked = dockRepo.lockAssetInstance("station_alpha_7", shipInstanceId);
        if (!locked) {
            throw new IllegalStateException("A nave (" + shipInstanceId + ") já está alocada para outra missão ou em manutenção na Estação Central!");
        }

        Despacho despacho = new Despacho(
                UUID.randomUUID().toString(),
                "station_alpha_7",
                pilot,
                shipInstanceId,
                route,
                DespachoStatus.PENDING,
                LocalDateTime.now()
        );

        Despacho saved = despachoRepo.save(despacho);
        queueProducer.sendDespachoRequested(saved);
        try {
            atualizarMissaoPublicador.publicar(new AtualizarMissaoEvento(saved.id(), 1));
        } catch (Exception ex) {
            // Ignore if AMQP broker is offline during local test
        }
        notifyAudit("DISP-ORD#" + saved.id().substring(0, Math.min(saved.id().length(), 8)).toUpperCase(),
                shipInstanceId, "Vetor Requisitado", pilot, route, "EXECUTED", true, "Despacho autorizado com sucesso.");
        return saved;
    }

    /**
     * Devolve a nave do piloto de volta à doca da Estação Central de Naves.
     * Libera o ativo e desbloqueia para futuras requisições de outros pilotos.
     */
    public Despacho returnShipToStation(String pilotUsername, String shipInstanceId) {
        String pilot = pilotUsername != null ? pilotUsername.toLowerCase() : "pilotoDesconhecido";

        boolean locked = dockRepo.lockAssetInstance(pilot, shipInstanceId);
        if (!locked) {
            throw new IllegalStateException("A nave (" + shipInstanceId + ") não foi encontrada na sua doca ou já está em liberação!");
        }

        dockRepo.transferAsset(pilot, "station_alpha_7", shipInstanceId);
        dockRepo.unlockAssetInstance("station_alpha_7", shipInstanceId);

        Despacho returnDespacho = new Despacho(
                UUID.randomUUID().toString(),
                pilot,
                "station_alpha_7",
                shipInstanceId,
                "RETORNO_A_BASE_CONCLUIDO",
                DespachoStatus.ACCEPTED,
                LocalDateTime.now()
        );

        Despacho saved = despachoRepo.save(returnDespacho);
        try {
            queueProducer.sendDespachoRequested(saved);
        } catch (Exception ignored) {}
        try {
            atualizarMissaoPublicador.publicar(new AtualizarMissaoEvento(saved.id(), 1));
        } catch (Exception ignored) {}
        notifyAudit("DISP-RET#" + saved.id().substring(0, Math.min(saved.id().length(), 8)).toUpperCase(),
                shipInstanceId, "Vetor Devolvido", pilot, "ESTACAO CENTRAL", "EXECUTED", true, "Devolucao a base central concluida.");
        return saved;
    }

    public Despacho proposeDespacho(String sender, String receiver, String offeredInstanceId, String requestedInstanceId) {
        if ("station_alpha_7".equalsIgnoreCase(receiver) || receiver == null || receiver.isBlank()) {
            return requestShipFromStation(sender, offeredInstanceId, requestedInstanceId);
        }

        boolean locked = dockRepo.lockAssetInstance(sender, offeredInstanceId);
        if (!locked) {
            throw new IllegalStateException("O ativo espacial (" + offeredInstanceId + ") ja esta bloqueado em outra ordem de despacho ou indisponivel!");
        }

        Despacho despacho = new Despacho(
                UUID.randomUUID().toString(),
                sender,
                receiver,
                offeredInstanceId,
                requestedInstanceId,
                DespachoStatus.PENDING,
                LocalDateTime.now()
        );

        return despachoRepo.save(despacho);
    }
    public Despacho acceptDespacho(String despachoId, String receiver) {
        Despacho despacho = despachoRepo.findById(despachoId)
                .orElseThrow(() -> new IllegalArgumentException("Ordem de despacho/locacao nao encontrada: " + despachoId));

        if (despacho.status() != DespachoStatus.PENDING) {
            throw new IllegalStateException("Esta ordem nao esta mais pendente (Status: " + despacho.status() + ")");
        }

        if (!despacho.receiverUsername().equalsIgnoreCase(receiver)) {
            throw new IllegalArgumentException("Apenas o oficial destinatario (" + despacho.receiverUsername() + ") pode aceitar este despacho.");
        }

        boolean locked = dockRepo.lockAssetInstance(receiver, despacho.requestedInstanceId());
        if (!locked) {
            throw new IllegalStateException("O ativo solicitado (" + despacho.requestedInstanceId() + ") ja esta em outra operacao ou indisponivel!");
        }

        queueProducer.sendDespachoRequested(despacho);
        return despacho;
    }

    public void cancelDespacho(String despachoId, String sender) {
        Despacho despacho = despachoRepo.findById(despachoId)
                .orElseThrow(() -> new IllegalArgumentException("Ordem nao encontrada: " + despachoId));

        if (despacho.status() != DespachoStatus.PENDING) {
            throw new IllegalStateException("Apenas ordens pendentes podem ser canceladas.");
        }

        String ownerToUnlock = (sender != null && sender.equalsIgnoreCase("admin")) ? despacho.senderUsername() : sender;
        dockRepo.unlockAssetInstance(ownerToUnlock, despacho.offeredInstanceId());

        Despacho cancelled = new Despacho(
                despacho.id(),
                despacho.senderUsername(),
                despacho.receiverUsername(),
                despacho.offeredInstanceId(),
                despacho.requestedInstanceId(),
                DespachoStatus.CANCELLED,
                despacho.createdAt()
        );
        despachoRepo.save(cancelled);
        notifyAudit("DISP-ABORT#" + cancelled.id().substring(0, Math.min(cancelled.id().length(), 8)).toUpperCase(),
                cancelled.offeredInstanceId(), "Vetor Abortado", cancelled.senderUsername(), "REVOGADO", "CANCELLED", false, "Ordem de voo revogada pelo operador.");
    }

    private void notifyAudit(String orderCode, String shipCode, String shipName, String pilotCallsign, String targetSector, String status, boolean success, String details) {
        java.util.concurrent.CompletableFuture.runAsync(() -> {
            try {
                String json = String.format(
                        "{\"orderCode\":\"%s\",\"shipCode\":\"%s\",\"shipName\":\"%s\",\"pilotCallsign\":\"%s\",\"targetSector\":\"%s\",\"protocol\":\"RabbitMQ / Direct\",\"status\":\"%s\",\"success\":%b,\"details\":\"%s\"}",
                        orderCode, shipCode, shipName, pilotCallsign, targetSector, status, success, details
                );
                java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();
                java.net.http.HttpRequest req = java.net.http.HttpRequest.newBuilder()
                        .uri(java.net.URI.create("http://localhost:8085/relatorios/auditoria"))
                        .header("Content-Type", "application/json")
                        .POST(java.net.http.HttpRequest.BodyPublishers.ofString(json))
                        .build();
                client.send(req, java.net.http.HttpResponse.BodyHandlers.discarding());
            } catch (Exception ignored) {}
        });
    }
}

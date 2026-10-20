package com.pabloepedro.despacho.service;

import com.pabloepedro.despacho.entity.Despacho;
import com.pabloepedro.despacho.entity.DockedAsset;
import com.pabloepedro.despacho.entity.OfficerDock;
import com.pabloepedro.despacho.entity.ShipAsset;
import com.pabloepedro.despacho.entity.enumerable.DespachoStatus;
import com.pabloepedro.despacho.entity.enumerable.Rarity;
import com.pabloepedro.despacho.entity.enumerable.ShipClass;
import com.pabloepedro.despacho.event.AtualizarMissaoPublicador;
import com.pabloepedro.despacho.event.DespachoEstoqueEvento;
import com.pabloepedro.despacho.event.AtualizarMissaoEvento;
import com.pabloepedro.despacho.queue.DespachoQueueProducer;
import com.pabloepedro.despacho.queue.EstoqueEventPublisherPort;
import com.pabloepedro.despacho.repository.DespachoRepo;
import com.pabloepedro.despacho.repository.OfficerDockRepo;
import com.pabloepedro.despacho.repository.ShipAssetRepo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Implementação do serviço de Despacho e Alocação da frota.
 * Implementa o contrato DespachoService pertencente ao Domínio (Clean Architecture / DIP).
 * Orquestra as requisições de naves, aplicação de locks atômicos e publicação de mensagens no RabbitMQ.
 */
@Service
public class DespachoServiceImpl implements DespachoService {

    private static final Logger log = LoggerFactory.getLogger(DespachoServiceImpl.class);

    private final OfficerDockRepo dockRepo;
    private final DespachoRepo despachoRepo;
    private final DespachoQueueProducer queueProducer;
    private final AtualizarMissaoPublicador atualizarMissaoPublicador;
    private final ShipAssetRepo assetRepo;
    private final EstoqueEventPublisherPort estoqueEventPublisher;

    public DespachoServiceImpl(
            OfficerDockRepo dockRepo,
            DespachoRepo despachoRepo,
            DespachoQueueProducer queueProducer,
            AtualizarMissaoPublicador atualizarMissaoPublicador,
            ShipAssetRepo assetRepo,
            EstoqueEventPublisherPort estoqueEventPublisher) {
        this.dockRepo = dockRepo;
        this.despachoRepo = despachoRepo;
        this.queueProducer = queueProducer;
        this.atualizarMissaoPublicador = atualizarMissaoPublicador;
        this.assetRepo = assetRepo;
        this.estoqueEventPublisher = estoqueEventPublisher;
    }

    @Override
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

    @Override
    public DockedAsset addShipToStationFleet(String name, ShipClass type, Rarity rarity, int hp, double marketPrice) {
        String instanceId = "ship-inst-" + UUID.randomUUID().toString().substring(0, 8);
        String assetId = "asset-" + UUID.randomUUID().toString().substring(0, 6);

        int finalHp = hp > 0 ? hp : 300;
        double finalPrice = marketPrice > 0 ? marketPrice : 500.0;
        ShipClass shipClass = type != null ? type : ShipClass.INTERCEPTOR;
        Rarity shipRarity = rarity != null ? rarity : Rarity.COMMON;

        DockedAsset dockedAsset = new DockedAsset(
                instanceId,
                assetId,
                name != null && !name.isBlank() ? name : "Vetor Espacial Operacional",
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
                    name,
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

    @Override
    public void removeShipFromStationFleet(String instanceId) {
        dockRepo.removeAssetFromDock("station_alpha_7", instanceId);
    }

    @Override
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

        // MENSAGERIA ASSÍNCRONA DESPACHO -> ESTOQUE (RabbitMQ): Notifica o Estoque para alterar status e dar baixa em peças
        try {
            estoqueEventPublisher.publicarEventoAlteracaoEstoque(new DespachoEstoqueEvento(
                    saved.id(),
                    shipInstanceId,
                    pilot,
                    route,
                    "DESPACHO_SOLICITADO",
                    "COMP-03",
                    1,
                    LocalDateTime.now()
            ));
        } catch (Exception ex) {
            log.warn("[DESPACHO] Aviso ao publicar evento para o Estoque: {}", ex.getMessage());
        }

        // Publica no buffer local Pub/Sub
        try {
            queueProducer.sendDespachoRequested(saved);
        } catch (Exception ignored) {}

        try {
            atualizarMissaoPublicador.publicar(new AtualizarMissaoEvento(saved.id(), 1));
        } catch (Exception ignored) {}

        notifyAudit("DISP-ORD#" + saved.id().substring(0, Math.min(saved.id().length(), 8)).toUpperCase(),
                shipInstanceId, "Vetor Requisitado", pilot, route, "EXECUTED", true, "Despacho autorizado com sucesso.");
        return saved;
    }

    @Override
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

        // MENSAGERIA ASSÍNCRONA DESPACHO -> ESTOQUE (RabbitMQ): Notifica o retorno da nave para o Estoque retornar a READY
        try {
            estoqueEventPublisher.publicarEventoAlteracaoEstoque(new DespachoEstoqueEvento(
                    saved.id(),
                    shipInstanceId,
                    pilot,
                    "RETORNO_A_BASE",
                    "DESPACHO_DEVOLVIDO",
                    "COMP-03",
                    0,
                    LocalDateTime.now()
            ));
        } catch (Exception ex) {
            log.warn("[DESPACHO] Aviso ao publicar devolucao para o Estoque: {}", ex.getMessage());
        }

        try {
            queueProducer.sendDespachoRequested(saved);
        } catch (Exception ignored) {}

        try {
            atualizarMissaoPublicador.publicar(new AtualizarMissaoEvento(saved.id(), 1));
        } catch (Exception ignored) {}

        notifyAudit("RET-ORD#" + saved.id().substring(0, Math.min(saved.id().length(), 8)).toUpperCase(),
                shipInstanceId, "Vetor Devolvido", pilot, "Estação Central", "COMPLETED", true, "Nave devolvida à Estação.");
        return saved;
    }

    @Override
    public Despacho proposeDespacho(String senderUsername, String receiverUsername,
                                    String offeredInstanceId, String requestedInstanceId) {
        String sender = senderUsername.toLowerCase();
        String receiver = receiverUsername.toLowerCase();

        boolean locked = dockRepo.lockAssetInstance(sender, offeredInstanceId);
        if (!locked) {
            throw new IllegalStateException("A nave (" + offeredInstanceId + ") já está reservada ou em missão!");
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

        Despacho saved = despachoRepo.save(despacho);
        try {
            queueProducer.sendDespachoRequested(saved);
        } catch (Exception ignored) {}

        notifyAudit("PROP-ORD#" + saved.id().substring(0, Math.min(saved.id().length(), 8)).toUpperCase(),
                offeredInstanceId, "Proposta de Alocação", sender, receiver, "PROPOSED", true, "Proposta emitida.");
        return saved;
    }

    @Override
    public Despacho acceptDespacho(String orderId, String receiverUsername) {
        Despacho despacho = despachoRepo.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Ordem de despacho não encontrada: " + orderId));

        if (!despacho.receiverUsername().equalsIgnoreCase(receiverUsername)) {
            throw new IllegalStateException("Apenas o destinatário (" + despacho.receiverUsername() + ") pode confirmar!");
        }

        if (despacho.status() != DespachoStatus.PENDING) {
            throw new IllegalStateException("Esta ordem já foi processada ou cancelada!");
        }

        Despacho accepted = new Despacho(
                despacho.id(),
                despacho.senderUsername(),
                despacho.receiverUsername(),
                despacho.offeredInstanceId(),
                despacho.requestedInstanceId(),
                DespachoStatus.ACCEPTED,
                despacho.createdAt()
        );

        despachoRepo.save(accepted);
        try {
            queueProducer.sendDespachoRequested(accepted);
        } catch (Exception ignored) {}

        notifyAudit("ACPT-ORD#" + accepted.id().substring(0, Math.min(accepted.id().length(), 8)).toUpperCase(),
                accepted.offeredInstanceId(), "Despacho Confirmado", accepted.senderUsername(), accepted.receiverUsername(), "ACCEPTED", true, "Confirmado.");
        return accepted;
    }

    @Override
    public void cancelDespacho(String orderId, String senderUsername) {
        Despacho despacho = despachoRepo.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Ordem de despacho não encontrada: " + orderId));

        if (!despacho.senderUsername().equalsIgnoreCase(senderUsername)) {
            throw new IllegalStateException("Apenas o emissor original pode cancelar a requisição!");
        }

        if (despacho.status() != DespachoStatus.PENDING) {
            throw new IllegalStateException("A ordem não está mais pendente!");
        }

        dockRepo.unlockAssetInstance(despacho.senderUsername(), despacho.offeredInstanceId());

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

        notifyAudit("CANC-ORD#" + cancelled.id().substring(0, Math.min(cancelled.id().length(), 8)).toUpperCase(),
                cancelled.offeredInstanceId(), "Despacho Cancelado", cancelled.senderUsername(), cancelled.receiverUsername(), "CANCELLED", false, "Cancelado.");
    }

    private void notifyAudit(String orderCode, String shipCode, String shipName, String pilotCallsign,
                             String targetSector, String status, boolean success, String details) {
        try {
            java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();
            String jsonPayload = String.format(
                    "{\"orderCode\":\"%s\",\"shipCode\":\"%s\",\"shipName\":\"%s\",\"pilotCallsign\":\"%s\",\"targetSector\":\"%s\",\"protocol\":\"RabbitMQ / Direct\",\"status\":\"%s\",\"success\":%b,\"details\":\"%s\"}",
                    orderCode, shipCode, shipName, pilotCallsign, targetSector, status, success, details
            );
            java.net.http.HttpRequest request = java.net.http.HttpRequest.newBuilder()
                    .uri(java.net.URI.create("http://localhost:8085/relatorios/auditoria/registrar"))
                    .header("Content-Type", "application/json")
                    .POST(java.net.http.HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .timeout(java.time.Duration.ofMillis(600))
                    .build();
            client.sendAsync(request, java.net.http.HttpResponse.BodyHandlers.discarding());
        } catch (Exception ignored) {}
    }
}

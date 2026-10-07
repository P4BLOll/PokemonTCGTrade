package com.pabloepedro.despacho.controller;

import com.pabloepedro.despacho.controller.adapter.DespachoCtrlAdp;
import com.pabloepedro.despacho.controller.request.DespachoRequest;
import com.pabloepedro.despacho.controller.response.DespachoResponse;
import com.pabloepedro.despacho.controller.response.OfficerDockResponse;
import com.pabloepedro.despacho.entity.Despacho;
import com.pabloepedro.despacho.entity.enumerable.DespachoStatus;
import com.pabloepedro.despacho.repository.DespachoRepo;
import com.pabloepedro.despacho.service.DespachoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping({"/despacho", "/dispatch"})
public class DespachoCtrl {

    private final DespachoService despachoService;
    private final DespachoRepo despachoRepo;

    public DespachoCtrl(DespachoService despachoService, DespachoRepo despachoRepo) {
        this.despachoService = despachoService;
        this.despachoRepo = despachoRepo;
    }

    // Lista os ativos da Estação Central prontos pra decolar ou em missão
    @GetMapping({"/station-fleet", "/frota-estacao"})
    public OfficerDockResponse getStationFleet() {
        var dock = despachoService.getStationFleet();
        return new OfficerDockResponse(dock.id(), dock.officerUsername(), dock.assets());
    }

    public record AddShipFleetRequest(
            String name,
            com.pabloepedro.despacho.entity.enumerable.ShipClass type,
            com.pabloepedro.despacho.entity.enumerable.Rarity rarity,
            Integer hp,
            Double marketPrice
    ) {}

    // Exclusivo para Administrador: adiciona uma nova nave à frota operacional da estação
    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping({"/station-fleet/ship", "/frota-estacao/nave"})
    public com.pabloepedro.despacho.entity.DockedAsset addShipToStation(@RequestBody AddShipFleetRequest req) {
        return despachoService.addShipToStationFleet(
                req.name(),
                req.type(),
                req.rarity(),
                req.hp() != null ? req.hp() : 300,
                req.marketPrice() != null ? req.marketPrice() : 500.0
        );
    }

    // Exclusivo para Administrador: remove uma nave da frota operacional da estação
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @DeleteMapping({"/station-fleet/ship/{instanceId}", "/frota-estacao/nave/{instanceId}"})
    public void removeShipFromStation(@PathVariable String instanceId) {
        despachoService.removeShipFromStationFleet(instanceId);
    }

    public record ShipRequisitionBody(String pilotUsername, String shipInstanceId, String missionRoute) {}

    // Piloto requisita uma nave via JSON: aplica lock atômico e manda pro RabbitMQ
    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping(value = {"/request-ship", "/requisitar-nave"}, consumes = "application/json")
    public DespachoResponse requestShipJson(@RequestBody ShipRequisitionBody req) {
        if (req == null || req.pilotUsername() == null || req.pilotUsername().isBlank()) {
            throw new IllegalArgumentException("O nome do piloto é obrigatório para requisitar uma nave.");
        }
        if (req.shipInstanceId() == null || req.shipInstanceId().isBlank()) {
            throw new IllegalArgumentException("O identificador da nave é obrigatório.");
        }
        String route = req.missionRoute() != null && !req.missionRoute().isBlank() ? req.missionRoute() : "PATRULHA_ORBITAL";
        Despacho despacho = despachoService.requestShipFromStation(req.pilotUsername().trim(), req.shipInstanceId().trim(), route);
        return DespachoCtrlAdp.toResponse(despacho);
    }

    // Mesmo endpoint de requisição aceitando query params
    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping({"/request-ship", "/requisitar-nave"})
    public DespachoResponse requestShip(
            @RequestParam String pilotUsername,
            @RequestParam String shipInstanceId,
            @RequestParam(required = false, defaultValue = "PATRULHA_ORBITAL") String missionRoute
    ) {
        if (pilotUsername == null || pilotUsername.isBlank()) {
            throw new IllegalArgumentException("O nome do piloto é obrigatório para requisitar uma nave.");
        }
        if (shipInstanceId == null || shipInstanceId.isBlank()) {
            throw new IllegalArgumentException("O identificador da nave é obrigatório.");
        }
        Despacho despacho = despachoService.requestShipFromStation(pilotUsername.trim(), shipInstanceId.trim(), missionRoute);
        return DespachoCtrlAdp.toResponse(despacho);
    }

    // Devolve a nave pra estação e libera o lock pra outros pilotos poderem usar
    @PostMapping({"/return-ship/{instanceId}", "/devolver-nave/{instanceId}"})
    public DespachoResponse returnShip(
            @PathVariable String instanceId,
            @RequestParam String pilotUsername
    ) {
        if (pilotUsername == null || pilotUsername.isBlank()) {
            throw new IllegalArgumentException("O nome do piloto é obrigatório para devolver a nave.");
        }
        Despacho despacho = despachoService.returnShipToStation(pilotUsername.trim(), instanceId);
        return DespachoCtrlAdp.toResponse(despacho);
    }

    // Cria uma nova proposta de alocação/cessão operacional entre oficiais
    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping({"/propose", "/despacho", "/ordem"})
    public DespachoResponse proposeDespacho(@RequestBody @Valid DespachoRequest request) {
        Despacho despacho = despachoService.proposeDespacho(
                request.senderUsername(),
                request.receiverUsername(),
                request.offeredInstanceId(),
                request.requestedInstanceId()
        );
        return DespachoCtrlAdp.toResponse(despacho);
    }

    // O oficial destinatário aceita o despacho e confirma
    @PostMapping({"/accept/{id}", "/aceitar/{id}"})
    public DespachoResponse acceptDespacho(@PathVariable("id") String id, @RequestParam String receiverUsername) {
        Despacho despacho = despachoService.acceptDespacho(id, receiverUsername);
        return DespachoCtrlAdp.toResponse(despacho);
    }

    // Cancela a ordem e destrava a nave ofertada
    @PostMapping({"/cancel/{id}", "/cancelar/{id}"})
    public void cancelDespacho(@PathVariable("id") String id, @RequestParam String senderUsername) {
        despachoService.cancelDespacho(id, senderUsername);
    }

    // Consulta ordens que ainda estão pendentes
    @GetMapping({"/pending", "/pendentes"})
    public List<DespachoResponse> listPending(@RequestParam(required = false) String officerUsername) {
        if (officerUsername != null && !officerUsername.isBlank()) {
            return despachoRepo.findByOfficer(officerUsername).stream()
                    .filter(t -> t.status() == DespachoStatus.PENDING)
                    .map(DespachoCtrlAdp::toResponse)
                    .toList();
        }
        return despachoRepo.findPending().stream().map(DespachoCtrlAdp::toResponse).toList();
    }

    // Traz todas as ordens vinculadas a um piloto específico
    @GetMapping({"/my-orders/{username}", "/minhas-ordens/{username}"})
    public List<DespachoResponse> listMyOrders(@PathVariable String username) {
        return despachoRepo.findByOfficer(username).stream().map(DespachoCtrlAdp::toResponse).toList();
    }

    // Traz o histórico completo global de ordens da estação (para ADMIN / Auditoria)
    @GetMapping({"/all-orders", "/todas-ordens"})
    public List<DespachoResponse> listAllOrders() {
        return despachoRepo.findAll().stream().map(DespachoCtrlAdp::toResponse).toList();
    }

    // Busca uma ordem de despacho específica pelo ID (usado para polling e auditoria)
    @GetMapping({"/order/{id}", "/ordem/{id}", "/{id}"})
    public org.springframework.http.ResponseEntity<DespachoResponse> getOrderById(@PathVariable String id) {
        return despachoRepo.findById(id)
                .map(DespachoCtrlAdp::toResponse)
                .map(org.springframework.http.ResponseEntity::ok)
                .orElse(org.springframework.http.ResponseEntity.notFound().build());
    }
}

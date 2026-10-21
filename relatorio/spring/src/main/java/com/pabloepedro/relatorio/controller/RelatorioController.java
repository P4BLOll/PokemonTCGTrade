package com.pabloepedro.relatorio.controller;

import com.pabloepedro.relatorio.entity.DispatchAuditRecord;
import com.pabloepedro.relatorio.entity.FuelConsumptionReport;
import com.pabloepedro.relatorio.entity.HangarExecutiveReport;
import com.pabloepedro.relatorio.entity.MicroservicesHealthReport;
import com.pabloepedro.relatorio.service.RelatorioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/relatorios")
public class RelatorioController {

    private final RelatorioService service;

    public RelatorioController(RelatorioService service) {
        this.service = service;
    }

    // Retorna o panorama executivo da estação e da frota
    @GetMapping("/geral")
    public HangarExecutiveReport getExecutiveReport() {
        return service.generateExecutiveReport();
    }

    // Traz o consumo e queima de combustível por quadrante
    @GetMapping("/combustivel")
    public FuelConsumptionReport getFuelReport() {
        return service.generateFuelReport();
    }

    // Histórico de auditoria de todos os despachos realizados
    @GetMapping("/auditoria")
    public List<DispatchAuditRecord> getAuditTrail() {
        return service.listAuditTrail();
    }

    // Registra uma nova entrada no log de auditoria
    @PostMapping({"/auditoria", "/auditoria/registrar"})
    public ResponseEntity<DispatchAuditRecord> postAuditRecord(@RequestBody DispatchAuditRecord record) {
        return ResponseEntity.ok(service.recordAuditEntry(record));
    }

    // Mostra o status e a saúde de cada microsserviço do cluster
    @GetMapping("/cluster")
    public MicroservicesHealthReport getClusterHealth() {
        return service.generateClusterHealth();
    }

    // Atalho de telemetria em tempo real
    @GetMapping("/telemetria")
    public MicroservicesHealthReport getTelemetry() {
        return service.generateClusterHealth();
    }
}

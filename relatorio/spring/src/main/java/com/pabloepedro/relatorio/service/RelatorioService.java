package com.pabloepedro.relatorio.service;

import com.pabloepedro.relatorio.entity.DispatchAuditRecord;
import com.pabloepedro.relatorio.entity.FuelConsumptionReport;
import com.pabloepedro.relatorio.entity.HangarExecutiveReport;
import com.pabloepedro.relatorio.entity.MicroservicesHealthReport;
import com.pabloepedro.relatorio.repository.RelatorioRepository;
import org.springframework.stereotype.Service;

import java.util.List;

// Consolida métricas da estação: relatórios executivos, consumo de combustível e auditoria de despachos
@Service
public class RelatorioService {

    private final RelatorioRepository repository;

    public RelatorioService(RelatorioRepository repository) {
        this.repository = repository;
    }

    public HangarExecutiveReport generateExecutiveReport() {
        return repository.generateExecutiveReport();
    }

    public FuelConsumptionReport generateFuelReport() {
        return repository.generateFuelReport();
    }

    public List<DispatchAuditRecord> listAuditTrail() {
        return repository.getDispatchAuditRecords();
    }

    public DispatchAuditRecord recordAuditEntry(DispatchAuditRecord entry) {
        repository.recordAudit(entry);
        return entry;
    }

    public MicroservicesHealthReport generateClusterHealth() {
        return repository.getClusterHealthReport();
    }
}

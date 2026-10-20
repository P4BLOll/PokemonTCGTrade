package com.pabloepedro.relatorio.service;

import com.pabloepedro.relatorio.entity.DispatchAuditRecord;
import com.pabloepedro.relatorio.entity.FuelConsumptionReport;
import com.pabloepedro.relatorio.entity.HangarExecutiveReport;
import com.pabloepedro.relatorio.entity.MicroservicesHealthReport;
import com.pabloepedro.relatorio.repository.RelatorioRepository;
import org.springframework.stereotype.Service;

import java.util.List;

// Implementacao do servico de relatorios da infraestrutura Spring
@Service
public class RelatorioServiceImpl implements RelatorioService {

    private final RelatorioRepository repository;

    public RelatorioServiceImpl(RelatorioRepository repository) {
        this.repository = repository;
    }

    @Override
    public HangarExecutiveReport generateExecutiveReport() {
        return repository.generateExecutiveReport();
    }

    @Override
    public FuelConsumptionReport generateFuelReport() {
        return repository.generateFuelReport();
    }

    @Override
    public List<DispatchAuditRecord> listAuditTrail() {
        return repository.getDispatchAuditRecords();
    }

    @Override
    public DispatchAuditRecord recordAuditEntry(DispatchAuditRecord entry) {
        repository.recordAudit(entry);
        return entry;
    }

    @Override
    public MicroservicesHealthReport generateClusterHealth() {
        return repository.getClusterHealthReport();
    }
}

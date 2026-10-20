package com.pabloepedro.relatorio.service;

import com.pabloepedro.relatorio.entity.DispatchAuditRecord;
import com.pabloepedro.relatorio.entity.FuelConsumptionReport;
import com.pabloepedro.relatorio.entity.HangarExecutiveReport;
import com.pabloepedro.relatorio.entity.MicroservicesHealthReport;

import java.util.List;

// Contrato de dominio para geracao de relatorios e auditoria
public interface RelatorioService {
    HangarExecutiveReport generateExecutiveReport();
    FuelConsumptionReport generateFuelReport();
    List<DispatchAuditRecord> listAuditTrail();
    DispatchAuditRecord recordAuditEntry(DispatchAuditRecord entry);
    MicroservicesHealthReport generateClusterHealth();
}

package com.pabloepedro.relatorio.repository;

import com.pabloepedro.relatorio.entity.DispatchAuditRecord;
import com.pabloepedro.relatorio.entity.FuelConsumptionReport;
import com.pabloepedro.relatorio.entity.HangarExecutiveReport;
import com.pabloepedro.relatorio.entity.MicroservicesHealthReport;

import java.util.List;

// Contrato (porta) da camada de domínio: define quais dados o serviço de relatórios precisa fornecer
public interface RelatorioRepository {
    // Gera o resumo executivo das naves e faturamento
    HangarExecutiveReport generateExecutiveReport();

    // Gera o relatório de consumo de combustível
    FuelConsumptionReport generateFuelReport();

    // Retorna a trilha de auditoria dos despachos
    List<DispatchAuditRecord> getDispatchAuditRecords();

    // Retorna o status de saúde de todos os microsserviços
    MicroservicesHealthReport getClusterHealthReport();

    // Grava um novo evento de auditoria
    void recordAudit(DispatchAuditRecord record);
}

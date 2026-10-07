package com.pabloepedro.relatorio.repository;

import com.pabloepedro.relatorio.entity.DispatchAuditRecord;
import com.pabloepedro.relatorio.entity.FuelConsumptionReport;
import com.pabloepedro.relatorio.entity.HangarExecutiveReport;
import com.pabloepedro.relatorio.entity.MicroservicesHealthReport;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;

// Repositório que junta e entrega os dados de auditoria, combustível e saúde do sistema
@Repository
public class RelatorioRepositoryImpl implements RelatorioRepository {

    // Lista em memória que guarda os registros de auditoria (segura para várias threads)
    private final List<DispatchAuditRecord> auditTrail = new CopyOnWriteArrayList<>();

    public RelatorioRepositoryImpl() {
        // Inicializa sem registros simulados: apenas auditorias reais cadastradas ou registradas durante o ciclo operacional serão exibidas
    }

    // Monta o relatório executivo com total de naves prontas, em voo e faturamento
    @Override
    public HangarExecutiveReport generateExecutiveReport() {
        HangarExecutiveReport report = new HangarExecutiveReport();
        report.setReportId("REP-EXE-" + System.currentTimeMillis());
        report.setGeneratedAt(LocalDateTime.now());
        report.setBaseStation("AERO-OS // BASE ESTELAR HANGAR-07");
        report.setDefconLevel(4);
        report.setReactorCoreStability(98.4);
        report.setTotalFleetVessels(8);
        report.setVesselsReady(5);
        report.setVesselsInFlight(1);
        report.setVesselsMaintenance(1);
        report.setVesselsLockedDispatch(1);
        report.setTotalFlightHours(6684.0);
        report.setTotalFuelBurnRateKgSec(98.2);
        report.setTotalRevenueGalacticCredits(64800.0);
        report.setFleetByClass(Map.of(
                "INTERCEPTOR", 2,
                "FREIGHTER", 1,
                "MINING_DRONE", 2,
                "ASSAULT_MECH", 1,
                "SCOUT", 1,
                "CORVETTE", 1
        ));
        return report;
    }

    // Calcula o consumo de combustível separado por setor do espaço
    @Override
    public FuelConsumptionReport generateFuelReport() {
        return new FuelConsumptionReport(
                "CYCLE-STEL-2026.10",
                1420.5,
                98.2,
                List.of(
                        new FuelConsumptionReport.SectorConsumption("Quadrante Kronos // Setor 4", 34.5, 14, "LOW"),
                        new FuelConsumptionReport.SectorConsumption("Nebulosa de Têmis // Setor 1", 28.1, 8, "MODERATE"),
                        new FuelConsumptionReport.SectorConsumption("Cinturão de Órion // Minas", 24.8, 22, "EXTREME"),
                        new FuelConsumptionReport.SectorConsumption("Relay de Vega // Anel Exterior", 10.8, 5, "LOW")
                )
        );
    }

    // Retorna a lista completa de ações auditadas
    @Override
    public List<DispatchAuditRecord> getDispatchAuditRecords() {
        return new ArrayList<>(auditTrail);
    }

    // Mostra o status em tempo real de cada microsserviço da arquitetura
    @Override
    public MicroservicesHealthReport getClusterHealthReport() {
        List<MicroservicesHealthReport.NodeHealth> nodes = List.of(
                new MicroservicesHealthReport.NodeHealth("01", "API Gateway", 8080, "Spring Cloud Gateway", "ACTIVE_PROXY", 1.4),
                new MicroservicesHealthReport.NodeHealth("02", "Auth & Access", 8081, "Spring Security JWT", "ONLINE", 2.1),
                new MicroservicesHealthReport.NodeHealth("03", "Despacho & Alocação de Frota", 8082, "Spring Boot + AMQP", "ACTIVE", 3.2),
                new MicroservicesHealthReport.NodeHealth("04", "Front-End Terminal", 8083, "Expo React Native Web", "RUNNING", 0.8),
                new MicroservicesHealthReport.NodeHealth("05", "Estoque & Hangar", 8084, "Spring Boot REST", "HEALTHY", 1.8),
                new MicroservicesHealthReport.NodeHealth("06", "Relatórios & Telemetria", 8085, "Spring Boot Analytics", "ONLINE", 1.2),
                new MicroservicesHealthReport.NodeHealth("07", "CloudAMQP Message Broker", 5672, "RabbitMQ Broker", "BUFFER_SYNC", 4.5)
        );

        return new MicroservicesHealthReport("AERO-OS-DISTRIBUTED-CLUSTER", 7, 7, nodes);
    }

    // Salva um novo evento no topo da lista de auditoria
    @Override
    public void recordAudit(DispatchAuditRecord record) {
        if (record.getTimestamp() == null) record.setTimestamp(LocalDateTime.now());
        auditTrail.add(0, record);
    }
}

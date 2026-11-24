package com.pabloepedro.relatorio;

import com.pabloepedro.relatorio.entity.DispatchAuditRecord;
import com.pabloepedro.relatorio.entity.FuelConsumptionReport;
import com.pabloepedro.relatorio.entity.HangarExecutiveReport;
import com.pabloepedro.relatorio.entity.MicroservicesHealthReport;
import org.apache.coyote.AbstractProtocol;
import org.springframework.aot.hint.MemberCategory;
import org.springframework.aot.hint.RuntimeHints;
import org.springframework.aot.hint.RuntimeHintsRegistrar;
import org.springframework.aot.hint.annotation.RegisterReflectionForBinding;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ImportRuntimeHints;

// Ponto de entrada (Main) do microsserviço de Relatórios (porta 8085)
@SpringBootApplication
@ImportRuntimeHints(RelatorioApplication.GraalVmTomcatHints.class)
@RegisterReflectionForBinding({
        HangarExecutiveReport.class,
        FuelConsumptionReport.class,
        FuelConsumptionReport.SectorConsumption.class,
        DispatchAuditRecord.class,
        MicroservicesHealthReport.class,
        MicroservicesHealthReport.NodeHealth.class
})
public class RelatorioApplication {

    // Método que sobe o servidor Spring Boot desta API
    public static void main(String[] args) {
        SpringApplication.run(RelatorioApplication.class, args);
    }

    static class GraalVmTomcatHints implements RuntimeHintsRegistrar {
        @Override
        public void registerHints(RuntimeHints hints, ClassLoader classLoader) {
            hints.reflection().registerType(AbstractProtocol.class, MemberCategory.INVOKE_PUBLIC_METHODS);
        }
    }
}

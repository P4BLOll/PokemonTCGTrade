package com.pabloepedro.estoque;

import com.pabloepedro.estoque.entity.ArsenalComponent;
import com.pabloepedro.estoque.entity.DockBay;
import com.pabloepedro.estoque.entity.ShipAsset;
import com.pabloepedro.estoque.event.DespachoEstoqueEvento;
import org.apache.coyote.AbstractProtocol;
import org.springframework.aot.hint.MemberCategory;
import org.springframework.aot.hint.RuntimeHints;
import org.springframework.aot.hint.RuntimeHintsRegistrar;
import org.springframework.aot.hint.annotation.RegisterReflectionForBinding;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ImportRuntimeHints;

// Classe principal que inicia o microsserviço de Estoque (porta 8084)
@SpringBootApplication
@ImportRuntimeHints(EstoqueApplication.GraalVmTomcatHints.class)
@RegisterReflectionForBinding({
        ShipAsset.class,
        ArsenalComponent.class,
        DockBay.class,
        DespachoEstoqueEvento.class
})
public class EstoqueApplication {

    // Método main que dá o start na aplicação Spring Boot
    public static void main(String[] args) {
        SpringApplication.run(EstoqueApplication.class, args);
    }

    static class GraalVmTomcatHints implements RuntimeHintsRegistrar {
        @Override
        public void registerHints(RuntimeHints hints, ClassLoader classLoader) {
            hints.reflection().registerType(AbstractProtocol.class, MemberCategory.INVOKE_PUBLIC_METHODS);
        }
    }
}

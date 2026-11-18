package com.pabloepedro.despacho;

import com.pabloepedro.despacho.entity.Despacho;
import com.pabloepedro.despacho.entity.enumerable.DespachoStatus;
import com.pabloepedro.despacho.event.AtualizarMissaoEvento;
import com.pabloepedro.despacho.event.DespachoEstoqueEvento;
import org.apache.coyote.AbstractProtocol;
import org.springframework.aot.hint.MemberCategory;
import org.springframework.aot.hint.RuntimeHints;
import org.springframework.aot.hint.RuntimeHintsRegistrar;
import org.springframework.aot.hint.annotation.RegisterReflectionForBinding;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ImportRuntimeHints;

// Ponto de partida do microsserviço de Despacho (porta 8082): cuida da alocação de naves e fila RabbitMQ
@SpringBootApplication
@ImportRuntimeHints(DespachoApplication.GraalVmTomcatHints.class)
@RegisterReflectionForBinding({
        Despacho.class,
        DespachoStatus.class,
        DespachoEstoqueEvento.class,
        AtualizarMissaoEvento.class
})
public class DespachoApplication {

    public static void main(String[] args) {
        SpringApplication.run(DespachoApplication.class, args);
    }

    static class GraalVmTomcatHints implements RuntimeHintsRegistrar {
        @Override
        public void registerHints(RuntimeHints hints, ClassLoader classLoader) {
            hints.reflection().registerType(AbstractProtocol.class, MemberCategory.INVOKE_PUBLIC_METHODS);
        }
    }

}

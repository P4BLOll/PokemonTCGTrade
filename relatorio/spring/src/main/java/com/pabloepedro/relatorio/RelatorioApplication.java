package com.pabloepedro.relatorio;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// Ponto de entrada (Main) do microsserviço de Relatórios (porta 8084)
@SpringBootApplication
public class RelatorioApplication {

    // Método que sobe o servidor Spring Boot desta API
    public static void main(String[] args) {
        SpringApplication.run(RelatorioApplication.class, args);
    }
}


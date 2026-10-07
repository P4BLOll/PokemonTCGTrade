package com.pabloepedro.estoque;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// Classe principal que inicia o microsserviço de Estoque (porta 8082)
@SpringBootApplication
public class EstoqueApplication {

    // Método main que dá o start na aplicação Spring Boot
    public static void main(String[] args) {
        SpringApplication.run(EstoqueApplication.class, args);
    }
}


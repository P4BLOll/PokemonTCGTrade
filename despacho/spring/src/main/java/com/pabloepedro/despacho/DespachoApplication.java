package com.pabloepedro.despacho;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// Ponto de partida do microsserviço de Despacho (porta 8082): cuida da alocação de naves e fila RabbitMQ
@SpringBootApplication
public class DespachoApplication {

    public static void main(String[] args) {
        SpringApplication.run(DespachoApplication.class, args);
    }

}

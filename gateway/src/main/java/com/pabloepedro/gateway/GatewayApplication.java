package com.pabloepedro.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// Ponto de entrada do API Gateway (porta 8080) - porta única de entrada para todas as requisições
@SpringBootApplication
public class GatewayApplication {

	// Inicia o Spring Cloud Gateway Reativo
	public static void main(String[] args) {
		SpringApplication.run(GatewayApplication.class, args);
	}

}


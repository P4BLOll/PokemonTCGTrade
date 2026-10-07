package com.pabloepedro;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;

// Ponto de entrada (Main) do microsserviço de Autenticação e Usuários (porta 8081)
@EnableWebSecurity
@EnableMethodSecurity
@SpringBootApplication
public class LoginApplication {

    // Inicializa o servidor Spring Boot de Auth
    public static void main(String[] args) {
        SpringApplication.run(LoginApplication.class, args);
    }

}
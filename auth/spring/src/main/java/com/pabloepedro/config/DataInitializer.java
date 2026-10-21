package com.pabloepedro.config;

import com.pabloepedro.entity.Login;
import com.pabloepedro.entity.enumerable.Roles;
import com.pabloepedro.repository.LoginRepo;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

// Cria os usuários padrões no MongoDB assim que a aplicação de autenticação sobe
@Component
public class DataInitializer implements CommandLineRunner {

    private final LoginRepo loginRepo;

    public DataInitializer(LoginRepo loginRepo) {
        this.loginRepo = loginRepo;
    }

    // Executa ao inicializar o Spring Boot
    @Override
    public void run(String... args) {
        try {
            // Garante a existência do usuário administrador
            var adminOpt = loginRepo.listar().stream()
                    .filter(l -> l.username().equalsIgnoreCase("admin"))
                    .findFirst();

            if (adminOpt.isEmpty()) {
                loginRepo.salvar(new Login(
                        UUID.randomUUID().toString(),
                        "admin",
                        "admin123",
                        List.of(Roles.ADMIN, Roles.USER)
                ));
            }
        } catch (Exception ignored) {
            // Se o MongoDB nao estiver acessivel na inicializacao inicial, prossegue normalmente
        }
    }
}
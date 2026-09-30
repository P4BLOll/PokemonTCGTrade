package com.pabloepedro.config;

import com.pabloepedro.entity.Login;
import com.pabloepedro.entity.enumerable.Roles;
import com.pabloepedro.repository.LoginRepo;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
public class DataInitializer implements CommandLineRunner {

    private final LoginRepo loginRepo;

    public DataInitializer(LoginRepo loginRepo) {
        this.loginRepo = loginRepo;
    }

    @Override
    public void run(String... args) {
        try {
            if (loginRepo.listar().isEmpty()) {
                loginRepo.salvar(new Login(UUID.randomUUID().toString(), "ash", "123456", List.of(Roles.USER)));
                loginRepo.salvar(new Login(UUID.randomUUID().toString(), "misty", "123456", List.of(Roles.USER)));
                loginRepo.salvar(new Login(UUID.randomUUID().toString(), "brock", "123456", List.of(Roles.USER)));
                loginRepo.salvar(new Login(UUID.randomUUID().toString(), "admin", "admin123", List.of(Roles.ADMIN, Roles.USER)));
            }
        } catch (Exception ignored) {
            // Se o MongoDB nao estiver acessivel na inicializacao inicial, prossegue normalmente
        }
    }
}
package com.pabloepedro.repository.client;

import com.pabloepedro.repository.orm.LoginOrm;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

// Interface Spring Data MongoDB para a coleção de credenciais de login
@Repository
public interface LoginMongo extends MongoRepository<LoginOrm, String> {
    // Busca usuário pelo username para validar senha
    Optional<LoginOrm> findByUsername(String username);
}
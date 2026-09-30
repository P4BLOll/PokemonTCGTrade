package com.pabloepedro.repository;

import com.pabloepedro.entity.Login;

import java.util.List;
import java.util.Optional;

public interface LoginRepo {
    Login salvar(Login login);
    List<Login> listar();
    void deletar(String id);
    Optional<Login> buscar(String id);
    Login findByUsername(String username);
}
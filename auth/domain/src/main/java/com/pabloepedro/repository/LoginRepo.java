package com.pabloepedro.repository;

import com.pabloepedro.entity.Login;

import java.util.List;
import java.util.Optional;

// Contrato da Clean Architecture: define quais operações de banco a camada de domínio precisa
public interface LoginRepo {
    // Salva ou atualiza um usuário
    Login salvar(Login login);
    // Lista todos os usuários cadastrados
    List<Login> listar();
    // Exclui um usuário pelo id
    void deletar(String id);
    // Busca um usuário pelo id
    Optional<Login> buscar(String id);
    // Busca usuário pelo username para validar login e gerar JWT
    Login findByUsername(String username);
}
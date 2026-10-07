package com.pabloepedro.entity;

// Entidade pura que guarda o login e senha enviados na autenticação
public record Auth(
        String username,
        String password
) {
}
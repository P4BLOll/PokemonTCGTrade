package com.pabloepedro.entity;

import com.pabloepedro.entity.enumerable.Roles;

import java.util.List;

// Entidade de domínio que representa o usuário cadastrado no sistema com seus papéis (roles)
public record Login(
        String id,
        String username,
        String password,
        List<Roles> roles
) {
}
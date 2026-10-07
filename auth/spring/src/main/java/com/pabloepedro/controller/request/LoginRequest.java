package com.pabloepedro.controller.request;

import com.pabloepedro.entity.enumerable.Roles;
import java.util.List;

// DTO com os dados enviados pelo frontend para cadastrar um novo oficial/usuário
public record LoginRequest(
        String username,
        String password,
        List<Roles> roles
) {
}
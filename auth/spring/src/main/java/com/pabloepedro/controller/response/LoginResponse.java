package com.pabloepedro.controller.response;

import com.pabloepedro.entity.enumerable.Roles;
import java.util.List;

// DTO devolvido pelo backend com as informações do usuário/oficial cadastrado
public record LoginResponse(
        String id,
        String username,
        String password,
        List<Roles> roles
) {
}
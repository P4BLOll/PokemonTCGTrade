package com.pabloepedro.controller.response;

import java.util.List;

/**
 * Resposta de autenticação e sessão devolvida ao navegador.
 * IMPORTANTE: Não expõe o token JWT no corpo da resposta para garantir conformidade
 * com a segurança e os requisitos do projeto. A sessão é transmitida exclusivamente
 * via Cookie seguro HttpOnly.
 */
public record AuthUserResponse(
        String username,
        List<String> roles,
        boolean authenticated,
        String message
) {
    public AuthUserResponse(String username, List<String> roles) {
        this(username, roles, true, "Autenticação realizada com sucesso.");
    }
}

package com.pabloepedro.controller.response;

import java.util.List;

// DTO devolvido pelo endpoint de autenticação contendo o token JWT gerado, callsign e roles
public record AuthResponse(
        String token,
        String username,
        List<String> roles
) {
    public AuthResponse(String token) {
        this(token, null, List.of());
    }
}
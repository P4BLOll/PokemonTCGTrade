package com.pabloepedro.controller.request;

// DTO com os dados que o frontend envia no corpo do POST ao fazer login
public record AuthRequest(
        String username,
        String password
) {
}
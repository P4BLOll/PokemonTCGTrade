package com.pabloepedro.controller.request;

public record AuthRequest(
        String username,
        String password
) {
}
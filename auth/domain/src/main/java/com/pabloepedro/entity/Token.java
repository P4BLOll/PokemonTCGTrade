package com.pabloepedro.entity;

// Entidade que encapsula a string do JWT gerado
public record Token(
        String value
) {
}
package com.pabloepedro.despacho.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

// Intercepta erros que acontecem nos controllers e devolve uma resposta HTTP bonitinha pro frontend
@RestControllerAdvice
public class DespachoExceptionHandler {

    // Se der IllegalStateException (ex: tentar despachar nave já despachada), devolve HTTP 409 Conflict
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> handleIllegalState(IllegalStateException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", ex.getMessage()));
    }

    // Se der IllegalArgumentException (ex: parâmetros inválidos), devolve HTTP 400 Bad Request
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", ex.getMessage()));
    }
}


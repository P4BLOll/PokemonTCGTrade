package com.pabloepedro.service;

import java.util.List;
import java.util.Optional;

/**
 * Contrato de serviço de autenticação e sessão pertencente ao Domínio (Clean Architecture / DIP).
 */
public interface AuthService {

    record AuthResult(String username, List<String> roles, String token) {}
    record SessionDetails(String username, List<String> roles) {}

    AuthResult authenticate(String username, String password);
    Optional<SessionDetails> validateSession(String token);
}

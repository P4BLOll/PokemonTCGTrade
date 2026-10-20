package com.pabloepedro.service;

import com.pabloepedro.security.JwtSec;
import io.jsonwebtoken.Claims;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Implementação do serviço de autenticação do módulo Auth.
 * Implementa o contrato AuthService pertencente ao Domínio (Clean Architecture / DIP).
 */
@Service
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtSec jwtSec;

    public AuthServiceImpl(
            AuthenticationManager authenticationManager,
            UserDetailsService userDetailsService,
            JwtSec jwtSec) {
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.jwtSec = jwtSec;
    }

    @Override
    public AuthResult authenticate(String username, String password) {
        UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(username, password);
        authenticationManager.authenticate(authToken);

        UserDetails user = userDetailsService.loadUserByUsername(username);
        String token = jwtSec.genToken(user);

        List<String> roles = user.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        return new AuthResult(user.getUsername(), roles, token);
    }

    @Override
    @SuppressWarnings("unchecked")
    public Optional<SessionDetails> validateSession(String token) {
        if (token == null || token.isBlank()) {
            return Optional.empty();
        }

        try {
            if (jwtSec.isExpired(token)) {
                return Optional.empty();
            }

            Claims claims = jwtSec.parseClaims(token);
            String username = claims.getSubject();
            List<String> roles = claims.get("roles", List.class);

            if (username == null || username.isBlank()) {
                return Optional.empty();
            }

            List<String> resolvedRoles = (roles != null) ? roles : List.of("ROLE_USER");
            return Optional.of(new SessionDetails(username, resolvedRoles));
        } catch (Exception ex) {
            return Optional.empty();
        }
    }
}

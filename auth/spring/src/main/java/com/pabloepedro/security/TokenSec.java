package com.pabloepedro.security;

import com.pabloepedro.entity.Auth;
import com.pabloepedro.entity.Token;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

// Serviço que valida credenciais de login e emite o token JWT
@Component
public class TokenSec {
    private final JwtSec sec;
    private final UserDetailsService services;
    private final AuthenticationManager authMan;

    public TokenSec(
            JwtSec sec,
            UserDetailsService services,
            AuthenticationManager authMan
    ){
        this.sec = sec;
        this.services = services;
        this.authMan = authMan;
    }

    // 1. Autentica usuário e senha; se estiver correto, 2. Gera o JWT
    public Token gerar(Auth auth){
        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                auth.username(), auth.password());
        // Se a senha estiver errada, authMan lança exceção aqui
        authMan.authenticate(authToken);
        UserDetails user = services.loadUserByUsername(auth.username());
        return new Token(sec.genToken(user));
    }

    public record TokenAuthDetails(String token, String username, java.util.List<String> roles) {}

    // Autentica e devolve o JWT junto com as permissões/roles decodificadas
    public TokenAuthDetails gerarComDetalhes(Auth auth){
        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                auth.username(), auth.password());
        authMan.authenticate(authToken);
        UserDetails user = services.loadUserByUsername(auth.username());
        String token = sec.genToken(user);
        java.util.List<String> roles = user.getAuthorities().stream()
                .map(org.springframework.security.core.GrantedAuthority::getAuthority)
                .toList();
        return new TokenAuthDetails(token, user.getUsername(), roles);
    }
}
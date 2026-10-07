package com.pabloepedro.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

// Utilitário responsável por criar, assinar e validar tokens JWT
@Component
public class JwtSec {
    // Mesma chave secreta HMAC compartilhada com o Gateway
    private static final String SECRET = "u7x!A$9zLq#2vNf@eR6tYpWmZcXbGdQh";
    // Tempo de validade do token (24 horas em milissegundos)
    private static final long EXP = 24L * 60 * 60 * 1000;

    private byte[] getSecret(){
        return SECRET.getBytes();
    }

    // Cria o token JWT embutindo username, papéis (roles) e data de expiração
    public String genToken(UserDetails user){
        Date date = new Date();
        SecretKey key = Keys.hmacShaKeyFor(getSecret());
        return Jwts.builder()
                .subject(user.getUsername())
                .claim("roles", user.getAuthorities()
                        .stream()
                        .map(GrantedAuthority::getAuthority)
                        .toList())
                .issuedAt(date)
                .expiration(new Date(date.getTime() + EXP))
                .signWith(key, Jwts.SIG.HS256).compact();
    }

    // Decodifica e valida a assinatura criptográfica do token
    public Claims parseClaims(String token){
        SecretKey secret = Keys.hmacShaKeyFor(getSecret());
        return Jwts.parser().verifyWith(secret).build().parseSignedClaims(token).getPayload();
    }

    // Extrai o username que está guardado dentro do token
    public String getUsername(String token){
        return parseClaims(token).getSubject();
    }

    // Verifica se a data de validade do token já passou
    public boolean isExpired(String token){
        return parseClaims(token).getExpiration().before(new Date());
    }

    // Valida se o token pertence ao usuário informado e ainda está no prazo de validade
    public boolean isTokenValid(String token, UserDetails user){
        String username = getUsername(token);
        return username.equals(user.getUsername()) && !isExpired(token);
    }
}
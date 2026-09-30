package com.pabloepedro.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtSec {
    private static final String SECRET = "u7x!A$9zLq#2vNf@eR6tYpWmZcXbGdQh";
    private static final long EXP = 24L * 60 * 60 * 1000;

    private byte[] getSecret(){
        return SECRET.getBytes();
    }

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

    public Claims parseClaims(String token){
        SecretKey secret = Keys.hmacShaKeyFor(getSecret());
        return Jwts.parser().verifyWith(secret).build().parseSignedClaims(token).getPayload();
    }

    public String getUsername(String token){
        return parseClaims(token).getSubject();
    }

    public boolean isExpired(String token){
        return parseClaims(token).getExpiration().before(new Date());
    }

    public boolean isTokenValid(String token, UserDetails user){
        String username = getUsername(token);
        return username.equals(user.getUsername()) && !isExpired(token);
    }
}
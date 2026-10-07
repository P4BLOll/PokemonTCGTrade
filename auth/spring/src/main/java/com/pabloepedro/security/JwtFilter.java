package com.pabloepedro.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

// Interceptador HTTP que roda em cada requisição para checar se o token JWT é válido
public class JwtFilter extends OncePerRequestFilter {
    private final JwtSec jwt;
    private final UserDetailsService service;

    public JwtFilter(JwtSec jwt, UserDetailsService service){
        this.jwt = jwt;
        this.service = service;
    }

    // Executa a validação do cabeçalho Authorization
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filter
    ) throws ServletException, IOException{
        // 1. Pega o cabeçalho Authorization
        String header = request.getHeader("Authorization");
        // 2. Se tiver token no formato "Bearer <token>", extrai a string
        if(header != null && header.startsWith("Bearer ")){
            String token = header.substring(7);
            String username = jwt.getUsername(token);

            // 3. Se o usuário existir e ainda não estiver autenticado na requisição atual
            if(username != null && SecurityContextHolder.getContext().getAuthentication() == null){
                UserDetails details = service.loadUserByUsername(username);
                // 4. Se o token não estiver expirado e a assinatura for legítima, autentica o usuário no Spring
                if(jwt.isTokenValid(token, details)){
                    UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                            details, null, details.getAuthorities());
                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            }
        }
        // Segue o fluxo normal da requisição
        filter.doFilter(request, response);
    }
}
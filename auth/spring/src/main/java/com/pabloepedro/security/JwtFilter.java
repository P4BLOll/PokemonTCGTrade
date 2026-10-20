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

/**
 * Interceptador HTTP que roda em cada requisição para checar se a sessão/token JWT é válida.
 * Suporta autenticação tanto via Cookie seguro HttpOnly ("AUTH_SESSION") quanto via header Authorization.
 */
public class JwtFilter extends OncePerRequestFilter {
    private final JwtSec jwt;
    private final UserDetailsService service;
    private final SessionCookieManager cookieManager;

    public JwtFilter(JwtSec jwt, UserDetailsService service, SessionCookieManager cookieManager){
        this.jwt = jwt;
        this.service = service;
        this.cookieManager = cookieManager;
    }

    public JwtFilter(JwtSec jwt, UserDetailsService service){
        this(jwt, service, new SessionCookieManager());
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filter
    ) throws ServletException, IOException {
        // Extrai o token do Cookie seguro HttpOnly ou do cabeçalho Authorization
        String token = cookieManager.extractToken(request);

        if (token != null && !token.isBlank()) {
            try {
                String username = jwt.getUsername(token);

                if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    UserDetails details = service.loadUserByUsername(username);

                    if (jwt.isTokenValid(token, details)) {
                        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                                details, null, details.getAuthorities());
                        auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(auth);
                    }
                }
            } catch (Exception ex) {
                // Token inválido ou expirado: prossegue o fluxo (o Spring Security barrará se a rota exigir auth)
            }
        }

        filter.doFilter(request, response);
    }
}
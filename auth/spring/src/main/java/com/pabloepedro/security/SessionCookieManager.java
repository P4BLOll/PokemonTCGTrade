package com.pabloepedro.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import java.time.Duration;

/**
 * Utilitário responsável pelo ciclo de vida de Cookies Seguros de Sessão (Clean Architecture / SRP).
 * - Gera cookies com flag HttpOnly garantindo que scripts no navegador NÃO consigam ler o token.
 * - Define tempo de vida estrito (24 horas) para persistência da sessão no navegador.
 * - Extrai o token de autenticação a partir de cookies ou de headers HTTP para interoperabilidade.
 * - Suporta configuração via variáveis de ambiente (COOKIE_SECURE / COOKIE_SAME_SITE) para HTTPS cross-site (Vercel + Render).
 */
@Component
public class SessionCookieManager {

    public static final String COOKIE_NAME = "AUTH_SESSION";
    // 24 horas de sessão mantida no navegador
    public static final long SESSION_DURATION_SECONDS = 24L * 60 * 60;

    private final boolean cookieSecure;
    private final String cookieSameSite;

    public SessionCookieManager() {
        this(false, "Lax");
    }

    @Autowired
    public SessionCookieManager(
            @Value("${app.cookie.secure:false}") boolean cookieSecure,
            @Value("${app.cookie.same-site:Lax}") String cookieSameSite) {
        this.cookieSecure = cookieSecure;
        this.cookieSameSite = cookieSameSite;
    }

    /**
     * Gera o Cookie HttpOnly com o token JWT embutido para salvar a sessão no navegador.
     */
    public ResponseCookie createSessionCookie(String token) {
        return ResponseCookie.from(COOKIE_NAME, token)
                .httpOnly(true)       // Impede acesso via JavaScript / document.cookie (proteção contra XSS)
                .secure(cookieSecure) // true em produção HTTPS (Vercel + Render); false em dev HTTP local
                .path("/")            // Válido para todas as rotas da aplicação
                .maxAge(Duration.ofSeconds(SESSION_DURATION_SECONDS)) // Determinado tempo no navegador
                .sameSite(cookieSameSite) // None em cross-site HTTPS (Vercel -> Render); Lax em localhost
                .build();
    }

    /**
     * Gera o Cookie de expiração imediata (Max-Age=0) para logout e encerramento da sessão.
     */
    public ResponseCookie createLogoutCookie() {
        return ResponseCookie.from(COOKIE_NAME, "")
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(0)            // Exclui imediatamente o cookie no navegador
                .sameSite(cookieSameSite)
                .build();
    }

    /**
     * Extrai o token JWT da requisição HTTP:
     * 1. Primeiro verifica os Cookies seguros enviados pelo navegador (AUTH_SESSION).
     * 2. Caso não exista em cookie, faz fallback para o cabeçalho Authorization: Bearer <token>.
     */
    public String extractToken(HttpServletRequest request) {
        if (request == null) return null;

        // 1. Extração via Cookie HttpOnly
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (COOKIE_NAME.equals(cookie.getName()) && cookie.getValue() != null && !cookie.getValue().isBlank()) {
                    return cookie.getValue();
                }
            }
        }

        // 2. Fallback via cabeçalho Authorization
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7).trim();
        }

        return null;
    }
}

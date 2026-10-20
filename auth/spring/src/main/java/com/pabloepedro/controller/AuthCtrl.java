package com.pabloepedro.controller;

import com.pabloepedro.controller.request.AuthRequest;
import com.pabloepedro.controller.response.AuthUserResponse;
import com.pabloepedro.security.SessionCookieManager;
import com.pabloepedro.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller de Autenticação Segura (Clean Architecture / DIP):
 * - Depende do contrato AuthService pertencente ao Domínio.
 * - Emite sessão do usuário exclusivamente através de Cookie HttpOnly ("AUTH_SESSION").
 * - O token JWT NUNCA aparece no corpo da resposta para garantir que não fique acessível no navegador.
 * - Suporta verificação de sessão ativa via /auth/me e logout seguro via /auth/logout.
 */
@RestController
@RequestMapping("/auth")
public class AuthCtrl {

    private final AuthService authService;
    private final SessionCookieManager cookieManager;

    public AuthCtrl(AuthService authService, SessionCookieManager cookieManager) {
        this.authService = authService;
        this.cookieManager = cookieManager;
    }

    /**
     * Endpoint de login: valida credenciais e anexa o Cookie seguro HttpOnly na resposta.
     * O token NÃO é exposto no corpo JSON.
     */
    @PostMapping({"/service/auth", "/login"})
    public ResponseEntity<AuthUserResponse> login(@RequestBody AuthRequest request) {
        if (request == null || request.username() == null || request.password() == null) {
            return ResponseEntity.badRequest().body(
                    new AuthUserResponse(null, List.of(), false, "Usuário e senha são obrigatórios.")
            );
        }

        AuthService.AuthResult result =
                authService.authenticate(request.username().trim().toLowerCase(), request.password());

        // Cria o Cookie HttpOnly de 24h
        ResponseCookie sessionCookie = cookieManager.createSessionCookie(result.token());

        // Retorna apenas dados do usuário sem expor o token JWT
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, sessionCookie.toString())
                .body(new AuthUserResponse(
                        result.username(),
                        result.roles(),
                        true,
                        "Sessão iniciada via Cookie Seguro HttpOnly."
                ));
    }

    /**
     * Endpoint de verificação de sessão: lê o cookie seguro HttpOnly enviado pelo navegador
     * e retorna os dados do usuário autenticado.
     */
    @GetMapping({"/me", "/session"})
    public ResponseEntity<AuthUserResponse> me(HttpServletRequest request) {
        String token = cookieManager.extractToken(request);
        return authService.validateSession(token)
                .map(details -> ResponseEntity.ok(
                        new AuthUserResponse(details.username(), details.roles(), true, "Sessão válida")
                ))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                        new AuthUserResponse(null, List.of(), false, "Sessão inválida ou não encontrada.")
                ));
    }

    /**
     * Endpoint de encerramento de sessão: remove o cookie do navegador definindo Max-Age=0.
     */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        ResponseCookie logoutCookie = cookieManager.createLogoutCookie();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, logoutCookie.toString())
                .body(Map.of("message", "Sessão encerrada com sucesso."));
    }
}
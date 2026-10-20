package com.pabloepedro.gateway.config;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpCookie;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

/**
 * Filtro Global do Gateway (BFF - Backend for Frontend):
 * Se a requisição contiver o Cookie seguro HttpOnly ("AUTH_SESSION") e não tiver o cabeçalho Authorization,
 * injeta automaticamente o cabeçalho Authorization: Bearer <token> na requisição repassada
 * para os microsserviços internos downstream (Despacho, Relatório, Estoque, etc.).
 *
 * Isso desacopla totalmente o navegador (que só conhece o Cookie seguro) da arquitetura
 * interna de microsserviços (que continuam recebendo o JWT via padrão Bearer).
 */
@Component
public class AuthCookieRelayFilter implements GlobalFilter, Ordered {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();

        // Se o cabeçalho Authorization já existir, prossegue normalmente
        if (request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
            return chain.filter(exchange);
        }

        // Tenta obter o token a partir do cookie HttpOnly
        HttpCookie sessionCookie = request.getCookies().getFirst(RouteConfig.SESSION_COOKIE_NAME);
        if (sessionCookie != null && sessionCookie.getValue() != null && !sessionCookie.getValue().isBlank()) {
            ServerHttpRequest mutatedRequest = request.mutate()
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + sessionCookie.getValue())
                    .build();
            return chain.filter(exchange.mutate().request(mutatedRequest).build());
        }

        return chain.filter(exchange);
    }

    @Override
    public int getOrder() {
        // Executa com alta prioridade antes do roteamento aos microsserviços
        return -100;
    }
}

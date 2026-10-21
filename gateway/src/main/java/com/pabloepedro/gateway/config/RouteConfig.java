package com.pabloepedro.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpCookie;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.server.resource.authentication.BearerTokenAuthenticationToken;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverter;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.authentication.ServerAuthenticationConverter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;

/**
 * Configuração de segurança reativa e CORS do API Gateway:
 * - Valida autenticação tanto via Cookie seguro HttpOnly ("AUTH_SESSION") quanto via header Authorization.
 * - Habilita credentials no CORS para que o navegador envie cookies de sessão automaticamente.
 * - Protege as rotas administrativas e operacionais distribuídas do ecossistema.
 */
@Configuration
public class RouteConfig {

    public static final String SESSION_COOKIE_NAME = "AUTH_SESSION";

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        return http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .authorizeExchange(exchange -> exchange
                        .pathMatchers(HttpMethod.OPTIONS).permitAll()
                        .pathMatchers("/auth/**").permitAll()
                        .pathMatchers("/login/**").permitAll()
                        // ── CONTROLE DE ACESSO EXCLUSIVO PARA ADMINISTRADORES (ROLE_ADMIN) ──
                        .pathMatchers(HttpMethod.POST, "/assets/new", "/assets/novo", "/despacho/station-fleet/**", "/dispatch/station-fleet/**").hasAuthority("ROLE_ADMIN")
                        .pathMatchers(HttpMethod.DELETE, "/assets/**", "/despacho/station-fleet/**", "/dispatch/station-fleet/**").hasAuthority("ROLE_ADMIN")
                        // ── ROTAS PÚBLICAS OU OPERACIONAIS GERAIS (USER E ADMIN) ──
                        .pathMatchers("/assets/**").permitAll()
                        .pathMatchers("/hangar/**").permitAll()
                        .pathMatchers("/estoque/**").permitAll()
                        .pathMatchers("/telemetry/**").permitAll()
                        .pathMatchers("/relatorios/**", "/reports/**").permitAll()
                        .pathMatchers("/despacho/pending", "/despacho/pendentes", "/dispatch/pending").permitAll()
                        .pathMatchers("/docks/**").authenticated()
                        .pathMatchers("/despacho/**", "/dispatch/**").authenticated()
                        .anyExchange().authenticated()
                )
                .oauth2ResourceServer(oauth -> oauth
                        .bearerTokenConverter(cookieOrHeaderBearerTokenConverter())
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
                )
                .build();
    }

    /**
     * Extrator reativo de tokens para o Resource Server:
     * 1. Primeiro verifica se há o Cookie HttpOnly seguro "AUTH_SESSION" enviado pelo navegador.
     * 2. Caso não exista em cookie, faz fallback para o cabeçalho Authorization: Bearer <token>.
     */
    @Bean
    public ServerAuthenticationConverter cookieOrHeaderBearerTokenConverter() {
        return exchange -> {
            // 1. Extração via Cookie HttpOnly
            HttpCookie cookie = exchange.getRequest().getCookies().getFirst(SESSION_COOKIE_NAME);
            if (cookie != null && cookie.getValue() != null && !cookie.getValue().isBlank()) {
                return Mono.just(new BearerTokenAuthenticationToken(cookie.getValue()));
            }

            // 2. Fallback via cabeçalho HTTP Authorization
            String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7).trim();
                if (!token.isBlank()) {
                    return Mono.just(new BearerTokenAuthenticationToken(token));
                }
            }

            return Mono.empty();
        };
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cors = new CorsConfiguration();
        // Permite origens locais explícitas necessárias quando allowCredentials = true
        cors.setAllowedOriginPatterns(List.of(
                "http://localhost:*",
                "http://127.0.0.1:*",
                "http://[::1]:*"
        ));
        cors.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        cors.setAllowedHeaders(List.of("*"));
        cors.setExposedHeaders(List.of(HttpHeaders.SET_COOKIE, HttpHeaders.AUTHORIZATION));
        cors.setAllowCredentials(true); // OBRIGATÓRIO para envio de cookies pelo navegador

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cors);
        return source;
    }

    @Bean
    public ReactiveJwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter converter = new JwtGrantedAuthoritiesConverter();
        converter.setAuthoritiesClaimName("roles");
        converter.setAuthorityPrefix("");

        ReactiveJwtAuthenticationConverter reactiveConverter = new ReactiveJwtAuthenticationConverter();
        reactiveConverter.setJwtGrantedAuthoritiesConverter(
                jwt -> Flux.fromIterable(converter.convert(jwt))
        );

        return reactiveConverter;
    }
}
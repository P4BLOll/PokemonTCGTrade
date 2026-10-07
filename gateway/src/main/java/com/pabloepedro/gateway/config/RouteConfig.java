package com.pabloepedro.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverter;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import reactor.core.publisher.Flux;

import java.util.List;

// Configuração de segurança reativa e CORS do API Gateway: protege as rotas e valida tokens JWT
@Configuration
public class RouteConfig {

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
                        // 1. Relatórios executivos e auditoria: apenas ADMIN
                        .pathMatchers("/relatorios/**", "/reports/**").hasAuthority("ROLE_ADMIN")
                        // 2. Adicionar novas naves à frota da estação ou catálogo: apenas ADMIN
                        .pathMatchers(HttpMethod.POST, "/assets/new", "/assets/novo", "/despacho/station-fleet/**", "/dispatch/station-fleet/**").hasAuthority("ROLE_ADMIN")
                        // 3. Remover naves da frota da estação ou catálogo: apenas ADMIN
                        .pathMatchers(HttpMethod.DELETE, "/assets/**", "/despacho/station-fleet/**", "/dispatch/station-fleet/**").hasAuthority("ROLE_ADMIN")
                        // ── ROTAS PÚBLICAS OU OPERACIONAIS GERAIS (USER E ADMIN) ──
                        .pathMatchers("/assets/**").permitAll()
                        .pathMatchers("/hangar/**").permitAll()
                        .pathMatchers("/estoque/**").permitAll()
                        .pathMatchers("/telemetry/**").permitAll()
                        .pathMatchers("/despacho/pending", "/despacho/pendentes", "/dispatch/pending").permitAll()
                        .pathMatchers("/docks/**").authenticated()
                        .pathMatchers("/despacho/**", "/dispatch/**").authenticated()
                        .anyExchange().authenticated()
                )
                .oauth2ResourceServer(oauth -> oauth
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
                )
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cors = new CorsConfiguration();
        cors.addAllowedOriginPattern("*");
        cors.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        cors.setAllowedHeaders(List.of("*"));
        cors.setAllowCredentials(false);

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
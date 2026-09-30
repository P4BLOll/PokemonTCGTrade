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
                        .pathMatchers("/cards/**").permitAll()
                        .pathMatchers("/trades/pending").permitAll()
                        .pathMatchers("/binders/**").authenticated()
                        .pathMatchers("/trades/**").authenticated()
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
package com.pabloepedro.config;

import com.pabloepedro.security.JwtFilter;
import com.pabloepedro.security.JwtSec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

// Configuração central de segurança do Spring Security
@Configuration
public class SecConfig {

    @Value("${app.cors.allowed-origins:https://*.vercel.app}")
    private String allowedOriginsConfig;

    // Define o algoritmo de criptografia e hash de senha (BCrypt)
    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }

    // Gerenciador de autenticação que valida login e senha contra o UserDetailsService
    @Bean
    public AuthenticationManager authManager(
            HttpSecurity httpSecurity,
            PasswordEncoder passwordEncoder,
            UserDetailsService userDetailsService
    ) throws Exception {
        AuthenticationManagerBuilder builder = httpSecurity.getSharedObject(AuthenticationManagerBuilder.class);
        builder.userDetailsService(userDetailsService).passwordEncoder(passwordEncoder);
        return builder.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cors = new CorsConfiguration();
        List<String> originPatterns = new ArrayList<>(List.of(
                "http://localhost:*",
                "http://127.0.0.1:*",
                "http://[::1]:*",
                "https://*.vercel.app"
        ));
        if (allowedOriginsConfig != null && !allowedOriginsConfig.isBlank()) {
            Arrays.stream(allowedOriginsConfig.split(","))
                    .map(s -> s.trim().replaceAll("/+$", ""))
                    .filter(s -> !s.isBlank() && !originPatterns.contains(s))
                    .forEach(originPatterns::add);
        }
        cors.setAllowedOriginPatterns(originPatterns);
        cors.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        cors.setAllowedHeaders(List.of("*"));
        cors.setExposedHeaders(List.of(HttpHeaders.SET_COOKIE, HttpHeaders.AUTHORIZATION));
        cors.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cors);
        return source;
    }

    // Regras de acesso e filtros de requisição HTTP
    @Bean
    public SecurityFilterChain filter(
            JwtSec jwt,
            HttpSecurity http,
            UserDetailsService usrDetails,
            com.pabloepedro.security.SessionCookieManager cookieManager
    ) throws Exception {
        // Filtro que pega o Cookie HttpOnly AUTH_SESSION ou cabeçalho Authorization e valida o JWT
        JwtFilter filter = new JwtFilter(jwt, usrDetails, cookieManager);

        http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                // Arquitetura STATELESS via cookie seguro / token JWT
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // Libera rotas públicas de autenticação, checagem de sessão e cadastro
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/auth/**", "/login/user/cadastrar/**", "/login/user/lista", "/error").permitAll()
                        .anyRequest()
                        .authenticated())
                // Executa nosso filtro JWT antes do filtro padrão do Spring
                .addFilterBefore(filter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
package com.pabloepedro.config;

import com.pabloepedro.security.JwtFilter;
import com.pabloepedro.security.JwtSec;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
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

// Configuração central de segurança do Spring Security
@Configuration
public class SecConfig {

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

    // Regras de acesso e filtros de requisição HTTP
    @Bean
    public SecurityFilterChain filter(
            JwtSec jwt,
            HttpSecurity http,
            UserDetailsService usrDetails
    ) throws Exception {
        // Filtro que pega o cabeçalho Authorization: Bearer <token> e valida o JWT
        JwtFilter filter = new JwtFilter(jwt, usrDetails);

        http.cors(AbstractHttpConfigurer::disable)
                .csrf(AbstractHttpConfigurer::disable)
                // Não guarda sessão na memória (arquitetura STATELESS via token JWT)
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // Libera rotas públicas de login e cadastro; o resto exige autenticação
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/service/auth", "/auth/login", "/auth/register", "/login/user/cadastrar/**", "/login/user/lista").permitAll()
                        .anyRequest()
                        .authenticated())
                // Executa nosso filtro JWT antes do filtro padrão do Spring
                .addFilterBefore(filter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
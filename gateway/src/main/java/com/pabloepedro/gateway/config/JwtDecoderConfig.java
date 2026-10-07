package com.pabloepedro.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jwt.NimbusReactiveJwtDecoder;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;

import javax.crypto.spec.SecretKeySpec;

// Configura o decodificador reativo de tokens JWT para o Gateway validar antes de repassar a rota
@Configuration
public class JwtDecoderConfig {

    // Cria o decodificador com a mesma chave secreta HMAC-SHA256 usada pelo microsserviço de Auth
    @Bean
    public ReactiveJwtDecoder jwtDecoder() {
        final String secretKey = "u7x!A$9zLq#2vNf@eR6tYpWmZcXbGdQh";
        return NimbusReactiveJwtDecoder.withSecretKey(
                new SecretKeySpec(secretKey.getBytes(), "HmacSHA256")
        ).build();
    }
}
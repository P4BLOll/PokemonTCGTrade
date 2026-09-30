package com.pabloepedro.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jwt.NimbusReactiveJwtDecoder;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;

import javax.crypto.spec.SecretKeySpec;

@Configuration
public class JwtDecoderConfig {
    @Bean
    public ReactiveJwtDecoder jwtDecoder() {
        final String secretKey = "u7x!A$9zLq#2vNf@eR6tYpWmZcXbGdQh";
        return NimbusReactiveJwtDecoder.withSecretKey(
                new SecretKeySpec(secretKey.getBytes(), "HmacSHA256")
        ).build();
    }
}
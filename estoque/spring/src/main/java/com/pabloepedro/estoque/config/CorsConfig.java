package com.pabloepedro.estoque.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Value("${app.cors.allowed-origins:https://*.vercel.app}")
    private String allowedOriginsConfig;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        List<String> origins = new ArrayList<>(List.of(
                "http://localhost:*",
                "http://127.0.0.1:*",
                "http://[::1]:*",
                "https://*.vercel.app"
        ));
        if (allowedOriginsConfig != null && !allowedOriginsConfig.isBlank()) {
            Arrays.stream(allowedOriginsConfig.split(","))
                    .map(s -> s.trim().replaceAll("/+$", ""))
                    .filter(s -> !s.isBlank() && !origins.contains(s))
                    .forEach(origins::add);
        }
        registry.addMapping("/**")
                .allowedOriginPatterns(origins.toArray(String[]::new))
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}

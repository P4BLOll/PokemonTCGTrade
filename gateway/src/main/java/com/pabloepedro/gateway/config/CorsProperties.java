package com.pabloepedro.gateway.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;

// Mapeia a lista de URLs permitidas para requisições cross-origin (CORS) a partir do application.properties
@Component
@ConfigurationProperties(prefix = "spring.cors")
public class CorsProperties {
    // Lista de origens permitidas (ex: http://localhost:8081, Expo, etc.)
    private List<String> url;

    public List<String> getUrl() {
        return url;
    }

    public void setUrl(List<String> url) {
        this.url = url;
    }
}
package com.pabloepedro.gateway.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@ConfigurationProperties(prefix = "spring.cors")
public class CorsProperties {
    private List<String> url;

    public List<String> getUrl() {
        return url;
    }

    public void setUrl(List<String> url) {
        this.url = url;
    }
}
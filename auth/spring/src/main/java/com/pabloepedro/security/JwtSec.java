package com.pabloepedro.security;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

// Utilitário responsável por criar, assinar e validar tokens JWT (HS256 nativo compatível com GraalVM Native Image)
@Component
public class JwtSec {
    // Mesma chave secreta HMAC compartilhada com o Gateway
    private static final String SECRET = "u7x!A$9zLq#2vNf@eR6tYpWmZcXbGdQh";
    private static final String HMAC_ALG = "HmacSHA256";
    // Tempo de validade do token (24 horas em milissegundos)
    private static final long EXP = 24L * 60 * 60 * 1000;

    private final ObjectMapper mapper = new ObjectMapper();

    private byte[] getSecret() {
        return SECRET.getBytes(StandardCharsets.UTF_8);
    }

    // Cria o token JWT embutindo username, papéis (roles) e data de expiração
    public String genToken(UserDetails user) {
        try {
            long nowSeconds = System.currentTimeMillis() / 1000L;
            long expSeconds = (System.currentTimeMillis() + EXP) / 1000L;

            Map<String, Object> header = new LinkedHashMap<>();
            header.put("alg", "HS256");
            header.put("typ", "JWT");

            List<String> roles = user.getAuthorities()
                    .stream()
                    .map(GrantedAuthority::getAuthority)
                    .toList();

            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("sub", user.getUsername());
            payload.put("roles", roles);
            payload.put("iat", nowSeconds);
            payload.put("exp", expSeconds);

            Base64.Encoder urlEncoder = Base64.getUrlEncoder().withoutPadding();
            String headerB64 = urlEncoder.encodeToString(mapper.writeValueAsBytes(header));
            String payloadB64 = urlEncoder.encodeToString(mapper.writeValueAsBytes(payload));
            String signingInput = headerB64 + "." + payloadB64;
            String signatureB64 = signHmacSha256(signingInput);

            return signingInput + "." + signatureB64;
        } catch (Exception e) {
            throw new IllegalStateException("Erro ao gerar token JWT", e);
        }
    }

    private String signHmacSha256(String signingInput) throws Exception {
        Mac mac = Mac.getInstance(HMAC_ALG);
        mac.init(new SecretKeySpec(getSecret(), HMAC_ALG));
        byte[] sig = mac.doFinal(signingInput.getBytes(StandardCharsets.UTF_8));
        return Base64.getUrlEncoder().withoutPadding().encodeToString(sig);
    }

    // Decodifica e valida a assinatura criptográfica do token
    public Map<String, Object> parsePayload(String token) {
        try {
            if (token == null || token.isBlank()) {
                throw new IllegalArgumentException("Token ausente");
            }
            String[] parts = token.trim().split("\\.");
            if (parts.length != 3) {
                throw new IllegalArgumentException("Formato JWT inválido");
            }
            String signingInput = parts[0] + "." + parts[1];
            String expectedSig = signHmacSha256(signingInput);
            if (!MessageDigest.isEqual(
                    expectedSig.getBytes(StandardCharsets.UTF_8),
                    parts[2].getBytes(StandardCharsets.UTF_8))) {
                throw new SecurityException("Assinatura JWT inválida");
            }
            byte[] payloadBytes = Base64.getUrlDecoder().decode(parts[1]);
            return mapper.readValue(payloadBytes, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            throw new IllegalArgumentException("Token JWT inválido", e);
        }
    }

    // Extrai o username que está guardado dentro do token
    public String getUsername(String token) {
        Object sub = parsePayload(token).get("sub");
        return sub != null ? sub.toString() : null;
    }

    // Extrai a lista de roles do token
    public List<String> getRoles(String token) {
        Object rolesObj = parsePayload(token).get("roles");
        if (rolesObj instanceof List<?> list) {
            return list.stream().map(String::valueOf).toList();
        }
        return Collections.emptyList();
    }

    // Verifica se a data de validade do token já passou
    public boolean isExpired(String token) {
        Object expObj = parsePayload(token).get("exp");
        if (expObj instanceof Number num) {
            long expMillis = num.longValue() * 1000L;
            return expMillis < System.currentTimeMillis();
        }
        return true;
    }

    // Valida se o token pertence ao usuário informado e ainda está no prazo de validade
    public boolean isTokenValid(String token, UserDetails user) {
        String username = getUsername(token);
        return username != null && username.equals(user.getUsername()) && !isExpired(token);
    }
}
package com.chefmate.backend.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.util.StringUtils;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;
import java.util.Map;

@Component
public class JwtService {

    private static final Logger log = LoggerFactory.getLogger(JwtService.class);
    private static final int MIN_SECRET_LENGTH = 32; // bytes

    private final SecretKey signingKey;
    private final long expirationMillis;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-ms:2592000000}") long expirationMillis) {
        String cleaned = sanitizeSecret(secret);
        this.signingKey = Keys.hmacShaKeyFor(cleaned.getBytes());
        this.expirationMillis = expirationMillis;
    }

    public String generateToken(User user) {
        Instant now = Instant.now();
        Instant expiry = now.plusMillis(expirationMillis);
        return Jwts.builder()
                .setSubject(user.getId())
                .addClaims(Map.of("email", user.getEmail()))
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(expiry))
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean isValid(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public String extractUserId(String token) {
        Claims claims = parseClaims(token);
        String sub = claims.getSubject();
        if (!StringUtils.hasText(sub)) {
            throw new IllegalArgumentException("Token subject is missing");
        }
        return sub;
    }

    public String extractEmail(String token) {
        Claims claims = parseClaims(token);
        return claims.get("email", String.class);
    }

    private Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private String sanitizeSecret(String secret) {
        if (!StringUtils.hasText(secret)) {
            throw new IllegalArgumentException("JWT_SECRET is missing; provide a long random string (>=32 chars) and avoid quotes.");
        }
        String trimmed = secret.trim();
        if ((trimmed.startsWith("\"") && trimmed.endsWith("\"")) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
            trimmed = trimmed.substring(1, trimmed.length() - 1).trim();
        }
        if (trimmed.length() < MIN_SECRET_LENGTH) {
            throw new IllegalArgumentException("JWT_SECRET is too short; use at least 32 characters.");
        }
        log.info("JWT secret configured: present=true, length={}", trimmed.length());
        return trimmed;
    }
}

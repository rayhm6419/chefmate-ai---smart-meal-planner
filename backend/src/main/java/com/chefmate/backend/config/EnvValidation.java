package com.chefmate.backend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.net.URI;
import java.net.URISyntaxException;

@Component
public class EnvValidation implements InitializingBean {

    private static final Logger log = LoggerFactory.getLogger(EnvValidation.class);
    private static final int MIN_SECRET_LENGTH = 32;

    private final Environment environment;

    public EnvValidation(Environment environment) {
        this.environment = environment;
    }

    @Override
    public void afterPropertiesSet() {
        String mongoUri = sanitize(environment.getProperty("spring.data.mongodb.uri"));
        validateMongo(mongoUri);

        String jwtSecret = sanitize(environment.getProperty("app.jwt.secret"));
        validateJwtSecret(jwtSecret);
    }

    private void validateMongo(String mongoUri) {
        if (!StringUtils.hasText(mongoUri)) {
            throw new IllegalArgumentException("MONGODB_URI is missing; set it to a mongodb:// or mongodb+srv:// URI without quotes.");
        }
        if (!(mongoUri.startsWith("mongodb://") || mongoUri.startsWith("mongodb+srv://"))) {
            throw new IllegalArgumentException("MONGODB_URI must start with mongodb:// or mongodb+srv:// (remove any surrounding quotes).");
        }
        String redactedHost = redactHost(mongoUri);
        log.info("Mongo URI configured: scheme={}, host={}", mongoUri.startsWith("mongodb+srv://") ? "mongodb+srv" : "mongodb", redactedHost);
    }

    private void validateJwtSecret(String jwtSecret) {
        if (!StringUtils.hasText(jwtSecret)) {
            throw new IllegalArgumentException("JWT_SECRET is missing; provide a long random string (>=32 chars) without quotes.");
        }
        if (jwtSecret.length() < MIN_SECRET_LENGTH) {
            throw new IllegalArgumentException("JWT_SECRET is too short; use at least 32 characters.");
        }
        log.info("JWT secret configured: present=true, length={}", jwtSecret.length());
    }

    private String sanitize(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        if ((trimmed.startsWith("\"") && trimmed.endsWith("\"")) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
            trimmed = trimmed.substring(1, trimmed.length() - 1).trim();
        }
        return trimmed;
    }

    private String redactHost(String uri) {
        try {
            URI parsed = new URI(uri.replaceFirst("^mongodb\\+srv", "mongodb")); // URI parser can't handle +srv scheme directly
            String host = parsed.getHost();
            return host != null ? host : "<unknown-host>";
        } catch (URISyntaxException e) {
            return "<unparsable-host>";
        }
    }
}

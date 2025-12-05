package com.chefmate.backend.config;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

@Configuration
public class AiConfig {

    private static final Logger log = LoggerFactory.getLogger(AiConfig.class);

    @Value("${GEMINI_API_KEY:}")
    private String geminiApiKey;

    @PostConstruct
    public void validate() {
        if (!StringUtils.hasText(geminiApiKey)) {
            log.error("GEMINI_API_KEY is not set. AI features cannot start without this configuration.");
            throw new IllegalStateException("Missing GEMINI_API_KEY");
        }
        log.info("Gemini API configuration initialized.");
    }

    public String geminiApiKey() {
        return geminiApiKey;
    }
}

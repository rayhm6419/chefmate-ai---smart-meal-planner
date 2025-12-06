package com.chefmate.backend.ai.client;

import com.chefmate.backend.recipe.GeminiClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class LlmClient {

    private static final Logger log = LoggerFactory.getLogger(LlmClient.class);

    private final GeminiClient geminiClient;

    public LlmClient(GeminiClient geminiClient) {
        this.geminiClient = geminiClient;
    }

    public String generateRecipes(String systemPrompt, String userPrompt, String jsonSchema) {
        log.debug("Requesting AI recipes with user prompt length {}", userPrompt.length());
        return geminiClient.generateJson(systemPrompt, userPrompt, jsonSchema);
    }
}

package com.chefmate.backend.recipe;

import com.chefmate.backend.ai.client.LlmClient;
import com.chefmate.backend.recipe.dto.InventoryRecipeRequest;
import com.chefmate.backend.recipe.dto.InventoryRecipeResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Service
public class InventoryRecipeService {

    private static final Logger log = LoggerFactory.getLogger(InventoryRecipeService.class);

    private final LlmClient llmClient;
    private final ObjectMapper objectMapper;

    public InventoryRecipeService(LlmClient llmClient, ObjectMapper objectMapper) {
        this.llmClient = llmClient;
        this.objectMapper = objectMapper;
    }

    public InventoryRecipeResponse generateFromInventory(InventoryRecipeRequest request) {
        String systemPrompt = buildSystemPrompt();
        String userPrompt = buildUserPrompt(request.getIngredients());
        String jsonSchema = buildJsonSchema();

        String rawResponse = llmClient.generateRecipes(systemPrompt, userPrompt, jsonSchema);
        return parseResponse(rawResponse);
    }

    private String buildSystemPrompt() {
        return """
        You are ChefMate, an expert home-cooking assistant.
        Respond with STRICT JSON only, matching the provided schema.
        Provide exactly one recipe using the user's current fridge items.
        Do not include markdown or extra text.
        """;
    }

    private String buildUserPrompt(List<InventoryRecipeRequest.Item> items) {
        String names = items == null ? "" : items.stream()
            .map(InventoryRecipeRequest.Item::getName)
            .filter(StringUtils::hasText)
            .collect(Collectors.joining(", "));
        return """
        Ingredients currently in the fridge: %s
        Create one dish that uses these ingredients. Include 3-5 main ingredients and clear numbered steps.
        """.formatted(names);
    }

    private String buildJsonSchema() {
        return """
        {
          "type": "object",
          "properties": {
            "title": { "type": "string" },
            "ingredients": { "type": "array", "items": { "type": "string" }, "minItems": 3, "maxItems": 8 },
            "steps": { "type": "array", "items": { "type": "string" }, "minItems": 3, "maxItems": 10 }
          },
          "required": ["title","ingredients","steps"]
        }
        """;
    }

    private InventoryRecipeResponse parseResponse(String raw) {
        try {
            InventoryRecipeResponse response = objectMapper.readValue(raw, InventoryRecipeResponse.class);
            if (!StringUtils.hasText(response.getTitle()) || response.getIngredients().isEmpty() || response.getSteps().isEmpty()) {
                throw new IllegalStateException("Missing fields");
            }
            return response;
        } catch (Exception e) {
            log.error("Failed to parse inventory recipe response: {}", raw, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to generate recipe");
        }
    }
}

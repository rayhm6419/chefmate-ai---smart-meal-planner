package com.chefmate.backend.recipe;

import com.chefmate.backend.ai.client.LlmClient;
import com.chefmate.backend.recipe.dto.GenerateRecipesRequest;
import com.chefmate.backend.recipe.dto.GenerateRecipesResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Service
public class GenerateRecipesService {

    private static final Logger log = LoggerFactory.getLogger(GenerateRecipesService.class);

    private final LlmClient llmClient;
    private final ObjectMapper objectMapper;

    public GenerateRecipesService(LlmClient llmClient, ObjectMapper objectMapper) {
        this.llmClient = llmClient;
        this.objectMapper = objectMapper;
    }

    public GenerateRecipesResponse generate(GenerateRecipesRequest request) {
        String systemPrompt = buildSystemPrompt();
        String userPrompt = buildUserPrompt(request);
        String schema = buildJsonSchema();

        String raw = llmClient.generateRecipes(systemPrompt, userPrompt, schema);
        log.debug("GenerateRecipes raw response (truncated): {}", raw == null ? "null" : raw.substring(0, Math.min(raw.length(), 500)));
        return parse(raw, request);
    }

    private String buildSystemPrompt() {
        return """
        You are ChefMate, an expert meal planner.
        Reply with STRICT JSON only that matches the provided schema.
        Propose 3 to 5 dish ideas using the given ingredients.
        """;
    }

    private String buildUserPrompt(GenerateRecipesRequest req) {
        String ingredientNames = req.getIngredients().stream()
            .map(GenerateRecipesRequest.Ingredient::getName)
            .filter(StringUtils::hasText)
            .collect(Collectors.joining(", "));
        String cuisines = (req.getCuisinePreference() == null || req.getCuisinePreference().isEmpty())
            ? "no specific cuisine"
            : String.join(", ", req.getCuisinePreference());

        return """
        Ingredients available: %s
        Cuisine preference: %s
        Difficulty: %s
        Servings: %s
        Max time (minutes): %s
        Avoid recipe IDs: %s
        Seed: %s
        Return 3-5 diverse dish ideas.
        """.formatted(
            ingredientNames,
            cuisines,
            safe(req.getDifficulty()),
            req.getServings() == null ? "not specified" : req.getServings(),
            req.getMaxTimeMinutes() == null ? "not specified" : req.getMaxTimeMinutes(),
            req.getExcludeRecipeIds() == null ? "none" : String.join(", ", req.getExcludeRecipeIds()),
            safe(req.getSeed())
        );
    }

    private String buildJsonSchema() {
        return """
        {
          "type": "object",
          "properties": {
            "dishes": {
              "type": "array",
              "minItems": 3,
              "maxItems": 5,
              "items": {
                "type": "object",
                "properties": {
                  "id": { "type": "string" },
                  "title": { "type": "string" },
                  "shortDescription": { "type": "string" },
                  "difficulty": { "type": "string" },
                  "estimatedTime": { "type": "integer" },
                  "imageUrl": { "type": "string" },
                  "ingredients": { "type": "array", "items": { "type": "string" }, "minItems": 3, "maxItems": 10 },
                  "steps": { "type": "array", "items": { "type": "string" }, "minItems": 3, "maxItems": 12 }
                },
                "required": ["title","shortDescription","difficulty","estimatedTime","ingredients","steps"]
              }
            }
          },
          "required": ["dishes"]
        }
        """;
    }

    private GenerateRecipesResponse parse(String raw, GenerateRecipesRequest request) {
        try {
            GenerateRecipesResponse res = objectMapper.readValue(raw, GenerateRecipesResponse.class);
            if (res.getDishes() == null || res.getDishes().isEmpty()) {
                throw new IllegalStateException("No dishes");
            }
            res.getDishes().forEach(d -> {
                if (!StringUtils.hasText(d.getId())) {
                    d.setId(UUID.randomUUID().toString());
                }
                if (!StringUtils.hasText(d.getImageUrl())) {
                    d.setImageUrl("https://placehold.co/600x400?text=ChefMate");
                }
            });
            return res;
        } catch (Exception e) {
            log.error("Failed to parse generate recipes response: {}", raw, e);
            return fallbackResponse(request);
        }
    }

    private GenerateRecipesResponse fallbackResponse(GenerateRecipesRequest request) {
        GenerateRecipesResponse res = new GenerateRecipesResponse();
        GenerateRecipesResponse.Dish dish = new GenerateRecipesResponse.Dish();
        dish.setId(UUID.randomUUID().toString());
        dish.setTitle("Stir-Fry Medley");
        dish.setShortDescription("Quick wok stir-fry using your selected ingredients.");
        dish.setDifficulty("easy");
        dish.setEstimatedTime(20);
        dish.setImageUrl("https://placehold.co/600x400?text=ChefMate");
        List<String> ing = request.getIngredients().stream()
            .map(GenerateRecipesRequest.Ingredient::getName)
            .collect(Collectors.toList());
        dish.setIngredients(ing.isEmpty() ? List.of("Mixed veggies", "Oil", "Soy sauce") : ing);
        dish.setSteps(List.of(
            "Prep all ingredients into bite-size pieces.",
            "Heat a wok with oil until shimmering.",
            "Stir-fry proteins first, then add vegetables.",
            "Season with soy sauce or preferred seasoning and serve hot."
        ));
        res.setDishes(List.of(dish));
        return res;
    }

    private String safe(String val) {
        return StringUtils.hasText(val) ? val : "not specified";
    }
}

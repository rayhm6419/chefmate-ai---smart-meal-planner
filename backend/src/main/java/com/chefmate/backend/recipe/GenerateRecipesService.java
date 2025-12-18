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
    private volatile List<GenerateRecipesResponse.Dish> lastSuccessfulDishes;

    public GenerateRecipesService(LlmClient llmClient, ObjectMapper objectMapper) {
        this.llmClient = llmClient;
        this.objectMapper = objectMapper;
    }

    public GenerateRecipesResponse generate(GenerateRecipesRequest request) {
        String systemPrompt = buildSystemPrompt();
        String userPrompt = buildUserPrompt(request);
        String schema = buildJsonSchema();

        GenerateRecipesResponse res = new GenerateRecipesResponse();
        AttemptResult result = attemptGeneration(systemPrompt, userPrompt, schema, request);
        res.setDishes(result.dishes());
        res.setSource(result.source());
        return res;
    }

    private AttemptResult attemptGeneration(String systemPrompt, String userPrompt, String schema, GenerateRecipesRequest request) {
        for (int attempt = 1; attempt <= 3; attempt++) {
            try {
                String raw = llmClient.generateRecipes(systemPrompt, userPromptWithVariation(userPrompt), schema);
                log.debug("GenerateRecipes attempt {} raw response (truncated): {}", attempt, raw == null ? "null" : raw.substring(0, Math.min(raw.length(), 500)));
                List<GenerateRecipesResponse.Dish> dishes = parse(raw, request);
                if (dishes != null && dishes.size() == 3) {
                    lastSuccessfulDishes = dishes;
                    return new AttemptResult(dishes, "ai");
                }
                log.warn("GenerateRecipes attempt {} returned {} dishes, expected 3", attempt, dishes == null ? 0 : dishes.size());
            } catch (ResponseStatusException e) {
                log.warn("GenerateRecipes attempt {} failed: {}", attempt, e.getReason());
            } catch (Exception e) {
                log.warn("GenerateRecipes attempt {} failed", attempt, e);
            }
        }
        if (lastSuccessfulDishes != null && !lastSuccessfulDishes.isEmpty()) {
            log.warn("Using cached dishes fallback after AI failures");
            return new AttemptResult(lastSuccessfulDishes, "cache");
        }
        log.warn("Using placeholder dishes fallback after AI failures");
        return new AttemptResult(fallbackDishes(request), "fallback");
    }

    private String userPromptWithVariation(String basePrompt) {
        return basePrompt + "\nVariationId: " + UUID.randomUUID() + ". Use this to diversify results.";
    }

    private String buildSystemPrompt() {
        return """
        You are ChefMate, an expert meal planner.
        Reply with STRICT JSON only that matches the provided schema.
        Propose EXACTLY 3 dish ideas using the given ingredients.
        The 3 dishes must be clearly different; vary cooking method, main protein, or cuisine so they are not similar.
        If results are too similar, regenerate internally until diversity is achieved.
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
        Return EXACTLY 3 diverse dish ideas.
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
              "maxItems": 3,
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

    private List<GenerateRecipesResponse.Dish> parse(String raw, GenerateRecipesRequest request) {
        try {
            GenerateRecipesResponse res = objectMapper.readValue(raw, GenerateRecipesResponse.class);
            if (res.getDishes() == null || res.getDishes().isEmpty()) {
                throw new IllegalStateException("No dishes");
            }
            if (res.getDishes().size() != 3) {
                throw new IllegalStateException("Expected 3 dishes but got " + res.getDishes().size());
            }
            res.getDishes().forEach(d -> {
                if (!StringUtils.hasText(d.getId())) {
                    d.setId(UUID.randomUUID().toString());
                }
                if (!StringUtils.hasText(d.getImageUrl())) {
                    d.setImageUrl("https://placehold.co/600x400?text=ChefMate");
                }
            });
            return res.getDishes();
        } catch (Exception e) {
            log.error("Failed to parse generate recipes response: {}", raw, e);
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "AI generation failed to parse");
        }
    }

    private String safe(String val) {
        return StringUtils.hasText(val) ? val : "not specified";
    }

    private List<GenerateRecipesResponse.Dish> fallbackDishes(GenerateRecipesRequest request) {
        List<String> ing = request.getIngredients().stream()
            .map(GenerateRecipesRequest.Ingredient::getName)
            .filter(StringUtils::hasText)
            .collect(Collectors.toList());
        if (ing.isEmpty()) {
            ing = List.of("Mixed veggies", "Oil", "Soy sauce");
        }
        GenerateRecipesResponse.Dish d1 = placeholderDish("Pan-Seared Protein Bowl", "Quick skillet bowl with your available protein and greens.", ing);
        GenerateRecipesResponse.Dish d2 = placeholderDish("Hearty One-Pot Stew", "Comforting stew using pantry staples and veggies.", ing);
        GenerateRecipesResponse.Dish d3 = placeholderDish("Roasted Sheet Pan Medley", "Easy sheet-pan bake with veggies and protein.", ing);
        return List.of(d1, d2, d3);
    }

    private GenerateRecipesResponse.Dish placeholderDish(String title, String description, List<String> ing) {
        GenerateRecipesResponse.Dish dish = new GenerateRecipesResponse.Dish();
        dish.setId(UUID.randomUUID().toString());
        dish.setTitle(title);
        dish.setShortDescription(description);
        dish.setDifficulty("easy");
        dish.setEstimatedTime(20);
        dish.setImageUrl("https://placehold.co/600x400?text=ChefMate");
        dish.setIngredients(ing);
        dish.setSteps(List.of(
            "Prep ingredients into bite-size pieces.",
            "Cook over medium heat until done.",
            "Season to taste and serve."
        ));
        return dish;
    }

    private record AttemptResult(List<GenerateRecipesResponse.Dish> dishes, String source) {}
}

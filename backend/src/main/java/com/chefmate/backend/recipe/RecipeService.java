package com.chefmate.backend.recipe;

import com.chefmate.backend.entity.Recipe;
import com.chefmate.backend.repository.RecipeRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class RecipeService {

    private static final Logger log = LoggerFactory.getLogger(RecipeService.class);

    private final RecipeRepository recipeRepository;
    private final GeminiClient geminiClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public RecipeService(RecipeRepository recipeRepository, GeminiClient geminiClient) {
        this.recipeRepository = recipeRepository;
        this.geminiClient = geminiClient;
    }

    public List<RecipeDto> findFavorites(LocalDate date, MealType mealType) {
        return recipeRepository.findAll().stream()
            .filter(r -> Boolean.TRUE.equals(r.getFavorite()))
            .filter(r -> r.getPlannedDate() != null && r.getPlannedDate().isEqual(date))
            .filter(r -> mealType == null || (r.getMealType() != null && r.getMealType().equals(mealType)))
            .map(RecipeMapper::toDto)
            .toList();
    }

    public RecipeDto generateAndSaveAiRecipe(AiRecipeRequest request) {
        String systemPrompt = buildSystemPrompt();
        String userPrompt = buildUserPrompt(request);
        String jsonSchema = buildJsonSchema();

        String rawJson = geminiClient.generateJson(systemPrompt, userPrompt, jsonSchema);
        RecipePayload payload = parsePayload(rawJson);

        Recipe recipe = new Recipe();
        recipe.setTitle(payload.title());
        recipe.setShortDescription(payload.shortDescription());
        recipe.setServings(payload.servings());
        recipe.setMealType(payload.mealType());
        recipe.setCuisine(payload.cuisine());
        recipe.setCookTimeMinutes(payload.cookTimeMinutes());
        recipe.setDifficulty(payload.difficulty());
        recipe.setFavorite(true);
        recipe.setPlannedDate(request.date());
        recipe.setPlannedMealSlot(request.mealType().name().toLowerCase());
        recipe.setCreatedAt(java.time.LocalDateTime.now());
        recipe.setUpdatedAt(recipe.getCreatedAt());

        RecipeMapper.applyLists(recipe, payload.ingredients(), payload.steps(), payload.tips());

        Recipe saved = recipeRepository.save(recipe);
        return RecipeMapper.toDto(saved);
    }

    private String buildSystemPrompt() {
        return """
        You are a cooking assistant for a meal planning app. Always respond with a single JSON object that matches the provided recipe schema.
        No markdown, no prose, just JSON.
        """;
    }

    private String buildUserPrompt(AiRecipeRequest request) {
        StringBuilder sb = new StringBuilder();
        sb.append("User request: ").append(request.prompt()).append("\n");
        sb.append("Date: ").append(request.date()).append("\n");
        sb.append("Meal type: ").append(request.mealType()).append("\n");
        if (request.servings() != null) {
            sb.append("Servings: ").append(request.servings()).append("\n");
        }
        if (request.mustHaveIngredients() != null && !request.mustHaveIngredients().isEmpty()) {
            sb.append("Must include ingredients: ").append(String.join(", ", request.mustHaveIngredients())).append("\n");
        }
        sb.append("Respond ONLY with JSON.");
        return sb.toString();
    }

    private String buildJsonSchema() {
        // Represent schema as JSON string
        return """
        {
          "type": "object",
          "properties": {
            "title": { "type": "string" },
            "shortDescription": { "type": "string" },
            "servings": { "type": "number" },
            "mealType": { "type": "string", "enum": ["BREAKFAST", "LUNCH", "DINNER"] },
            "cuisine": { "type": "string" },
            "cookTimeMinutes": { "type": "number" },
            "difficulty": { "type": "string", "enum": ["EASY", "MEDIUM", "HARD"] },
            "ingredients": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "name": { "type": "string" },
                  "quantity": { "type": "string" },
                  "unit": { "type": "string" },
                  "note": { "type": "string" }
                },
                "required": ["name"]
              }
            },
            "steps": { "type": "array", "items": { "type": "string" } },
            "tips": { "type": "array", "items": { "type": "string" } }
          },
          "required": ["title","shortDescription","servings","mealType","cookTimeMinutes","difficulty","ingredients","steps","tips"]
        }
        """;
    }

    private RecipePayload parsePayload(String rawJson) {
        try {
            JsonNode node = objectMapper.readTree(rawJson);
            return new RecipePayload(
                text(node, "title"),
                text(node, "shortDescription"),
                intOrNull(node, "servings"),
                MealType.valueOf(text(node, "mealType").toUpperCase()),
                text(node, "cuisine"),
                intOrNull(node, "cookTimeMinutes"),
                Difficulty.valueOf(text(node, "difficulty").toUpperCase()),
                mapIngredients(node.get("ingredients")),
                mapStringArray(node.get("steps")),
                mapStringArray(node.get("tips"))
            );
        } catch (Exception e) {
            log.error("Failed to parse AI recipe JSON response");
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to generate recipe");
        }
    }

    private List<RecipeIngredientDto> mapIngredients(JsonNode node) {
        if (node == null || !node.isArray()) return Collections.emptyList();
        return objectMapper.convertValue(node, objectMapper.getTypeFactory().constructCollectionType(List.class, RecipeIngredientDto.class));
    }

    private List<String> mapStringArray(JsonNode node) {
        if (node == null || !node.isArray()) return Collections.emptyList();
        return objectMapper.convertValue(node, objectMapper.getTypeFactory().constructCollectionType(List.class, String.class));
    }

    private String text(JsonNode node, String field) {
        JsonNode val = node.get(field);
        if (val == null || val.isNull()) return "";
        return val.asText();
    }

    private Integer intOrNull(JsonNode node, String field) {
        JsonNode val = node.get(field);
        if (val == null || val.isNull()) return null;
        return val.isInt() ? val.asInt() : null;
    }

    private record RecipePayload(
        String title,
        String shortDescription,
        Integer servings,
        MealType mealType,
        String cuisine,
        Integer cookTimeMinutes,
        Difficulty difficulty,
        List<RecipeIngredientDto> ingredients,
        List<String> steps,
        List<String> tips
    ) {}
}

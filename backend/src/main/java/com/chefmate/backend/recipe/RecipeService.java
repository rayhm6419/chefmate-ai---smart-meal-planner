package com.chefmate.backend.recipe;

import com.chefmate.backend.entity.Recipe;
import com.chefmate.backend.repository.RecipeRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class RecipeService {

    private final RecipeRepository recipeRepository;
    private final LlmClient llmClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public RecipeService(RecipeRepository recipeRepository, LlmClient llmClient) {
        this.recipeRepository = recipeRepository;
        this.llmClient = llmClient;
    }

    @Transactional(readOnly = true)
    public List<RecipeDto> findFavorites(LocalDate date, MealType mealType) {
        return recipeRepository.findAll().stream()
            .filter(r -> Boolean.TRUE.equals(r.getFavorite()))
            .filter(r -> r.getPlannedDate() != null && r.getPlannedDate().isEqual(date))
            .filter(r -> mealType == null || (r.getMealType() != null && r.getMealType().equals(mealType)))
            .map(RecipeMapper::toDto)
            .toList();
    }

    @Transactional
    public RecipeDto generateAndSaveAiRecipe(AiRecipeRequest request) {
        String systemPrompt = buildSystemPrompt();
        String userPrompt = buildUserPrompt(request);

        String rawJson = llmClient.generateRecipeJson(systemPrompt, userPrompt);
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

        RecipeMapper.applyLists(recipe, payload.ingredients(), payload.steps(), payload.tips());

        Recipe saved = recipeRepository.save(recipe);
        return RecipeMapper.toDto(saved);
    }

    private String buildSystemPrompt() {
        return """
        You are an AI chef. Always respond with a single JSON object only, no extra text.
        Required fields:
        {
          "title": string,
          "shortDescription": string,
          "servings": number,
          "mealType": "BREAKFAST" | "LUNCH" | "DINNER",
          "cuisine": string,
          "cookTimeMinutes": number,
          "difficulty": "EASY" | "MEDIUM" | "HARD",
          "ingredients": [ { "name": string, "quantity": string, "unit": string, "note": string } ],
          "steps": [string],
          "tips": [string]
        }
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
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid AI recipe response");
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

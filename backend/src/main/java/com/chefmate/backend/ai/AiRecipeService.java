package com.chefmate.backend.ai;

import com.chefmate.backend.ai.client.LlmClient;
import com.chefmate.backend.ai.dto.AiRecipeRequest;
import com.chefmate.backend.ai.dto.AiRecipeResponse;
import com.chefmate.backend.ai.dto.IngredientDTO;
import com.chefmate.backend.ai.dto.RecipeDTO;
import com.chefmate.backend.entity.Recipe;
import com.chefmate.backend.recipe.Difficulty;
import com.chefmate.backend.recipe.MealType;
import com.chefmate.backend.recipe.RecipeIngredientDto;
import com.chefmate.backend.recipe.RecipeMapper;
import com.chefmate.backend.repository.RecipeRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AiRecipeService {

    private static final Logger log = LoggerFactory.getLogger(AiRecipeService.class);

    private final LlmClient llmClient;
    private final ObjectMapper objectMapper;
    private final RecipeRepository recipeRepository;

    public AiRecipeService(LlmClient llmClient, ObjectMapper objectMapper, RecipeRepository recipeRepository) {
        this.llmClient = llmClient;
        this.objectMapper = objectMapper;
        this.recipeRepository = recipeRepository;
    }

    public AiRecipeResponse generateRecipes(AiRecipeRequest request) {
        String systemPrompt = buildSystemPrompt();
        String userPrompt = buildUserPrompt(request);
        String jsonSchema = buildJsonSchema();

        log.info("Requesting AI recipes for query='{}', servings={}, mealType={}", request.getQuery(), request.getServings(), request.getMealType());
        String rawResponse = llmClient.generateRecipes(systemPrompt, userPrompt, jsonSchema);
        AiRecipeResponse response = parseResponse(rawResponse);
        persistFirstRecipe(response, request);
        return response;
    }

    private String buildSystemPrompt() {
        return """
        You are ChefMate, a Chinese home-cooking assistant. Prefer Cantonese, Sichuan, and Fujian flavors when appropriate.
        You must reply with STRICT JSON only. Never include markdown or prose. Do not wrap the JSON in code fences.
        Produce between 1 and 3 recipes that match the provided JSON schema exactly.
        All text fields must respect the requested language code. Omit null fields.
        If you are unsure, still produce valid JSON with best-effort values rather than failing.
        """;
    }

    private String buildUserPrompt(AiRecipeRequest request) {
        String cuisines = String.join(", ", request.getCuisinePreference());
        String diet = (request.getDietRestrictions() == null || request.getDietRestrictions().isEmpty())
            ? "none specified"
            : String.join(", ", request.getDietRestrictions());

        StringBuilder sb = new StringBuilder();
        sb.append("User query: ").append(request.getQuery()).append("\n");
        sb.append("Preferred language: ").append(request.getLanguage()).append("\n");
        if (request.getServings() != null) {
            sb.append("Servings: ").append(request.getServings()).append("\n");
        }
        if (StringUtils.hasText(request.getMealType())) {
            sb.append("Meal type: ").append(request.getMealType()).append("\n");
        }
        sb.append("Cuisine preferences (prioritize these): ").append(cuisines).append("\n");
        sb.append("Dietary restrictions: ").append(diet).append("\n");
        sb.append("Return 1-3 fully-specified recipes formatted as the provided JSON schema.");
        return sb.toString();
    }

    private String buildJsonSchema() {
        return """
        {
          "type": "object",
          "properties": {
            "recipes": {
              "type": "array",
              "minItems": 1,
              "maxItems": 3,
              "items": {
                "type": "object",
                "properties": {
                  "title": { "type": "string" },
                  "description": { "type": "string" },
                  "totalTimeMinutes": { "type": "integer" },
                  "difficulty": { "type": "string", "enum": ["easy","medium","hard"] },
                  "tags": { "type": "array", "items": { "type": "string" } },
                  "servings": { "type": "integer" },
                  "ingredients": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "name": { "type": "string" },
                        "amount": { "type": "string" }
                      },
                      "required": ["name","amount"]
                    }
                  },
                  "steps": { "type": "array", "items": { "type": "string" } },
                  "tips": { "type": "array", "items": { "type": "string" } }
                },
                "required": ["title","description","totalTimeMinutes","difficulty","tags","servings","ingredients","steps","tips"]
              }
            }
          },
          "required": ["recipes"]
        }
        """;
    }

    private AiRecipeResponse parseResponse(String rawJson) {
        if (!StringUtils.hasText(rawJson)) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Empty AI response");
        }
        try {
            AiRecipeResponse response = objectMapper.readValue(rawJson, AiRecipeResponse.class);
            if (response.getRecipes() == null || response.getRecipes().isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "AI returned no recipes");
            }
            return response;
        } catch (Exception e) {
            log.error("Failed to parse AI recipe response: {}", rawJson, e);
            return fallbackResponse();
        }
    }

    private AiRecipeResponse fallbackResponse() {
        AiRecipeResponse fallback = new AiRecipeResponse();
        RecipeDTO recipe = new RecipeDTO();
        recipe.setTitle("Quick Cantonese Stir-Fry");
        recipe.setDescription("A simple wok-fried chicken with ginger, scallions, and soy.");
        recipe.setTotalTimeMinutes(25);
        recipe.setDifficulty("easy");
        recipe.setTags(List.of("cantonese", "stir-fry", "weeknight"));
        recipe.setServings(2);
        recipe.setIngredients(List.of(
            ingredient("boneless chicken thighs", "350 g, sliced"),
            ingredient("fresh ginger", "1 tbsp, julienned"),
            ingredient("scallions", "3 stalks, cut"),
            ingredient("light soy sauce", "1.5 tbsp"),
            ingredient("oyster sauce", "1 tbsp"),
            ingredient("neutral oil", "2 tbsp")
        ));
        recipe.setSteps(List.of(
            "Marinate chicken with soy sauce and oyster sauce for 10 minutes.",
            "Heat oil in a wok until hot, sear chicken until almost cooked.",
            "Add ginger and scallions, stir-fry 1-2 minutes until fragrant.",
            "Serve immediately over rice."
        ));
        recipe.setTips(List.of("Keep the wok hot to avoid steaming.", "Add chili oil for heat if desired."));
        fallback.setRecipes(List.of(recipe));
        return fallback;
    }

    private IngredientDTO ingredient(String name, String amount) {
        IngredientDTO dto = new IngredientDTO();
        dto.setName(name);
        dto.setAmount(amount);
        return dto;
    }

    private void persistFirstRecipe(AiRecipeResponse response, AiRecipeRequest request) {
        if (response.getRecipes() == null || response.getRecipes().isEmpty()) {
            return;
        }
        try {
            RecipeDTO dto = response.getRecipes().get(0);
            Recipe recipe = new Recipe();
            recipe.setTitle(dto.getTitle());
            recipe.setShortDescription(dto.getDescription());
            recipe.setServings(dto.getServings());
            recipe.setMealType(parseMealType(request.getMealType()));
            recipe.setCuisine(firstOrNull(dto.getTags()));
            recipe.setCookTimeMinutes(dto.getTotalTimeMinutes());
            recipe.setDifficulty(parseDifficulty(dto.getDifficulty()));
            recipe.setFavorite(true);
            LocalDate plannedDate = parseDate(request.getDate());
            recipe.setPlannedDate(plannedDate);
            recipe.setPlannedMealSlot(recipe.getMealType() != null ? recipe.getMealType().name().toLowerCase() : null);

            List<RecipeIngredientDto> ingredients = toIngredientDtos(dto.getIngredients());
            RecipeMapper.applyLists(recipe, ingredients, dto.getSteps(), dto.getTips());

            recipeRepository.save(recipe);
            log.info("Saved AI recipe '{}' as favorite for date {}", dto.getTitle(), plannedDate);
        } catch (Exception e) {
            log.error("Failed to persist AI recipe", e);
        }
    }

    private List<RecipeIngredientDto> toIngredientDtos(List<IngredientDTO> list) {
        if (list == null) return List.of();
        return list.stream()
            .map(i -> new RecipeIngredientDto(i.getName(), null, null, i.getAmount()))
            .collect(Collectors.toList());
    }

    private Difficulty parseDifficulty(String value) {
        if (!StringUtils.hasText(value)) return Difficulty.MEDIUM;
        try {
            return Difficulty.valueOf(value.trim().toUpperCase());
        } catch (Exception e) {
            return Difficulty.MEDIUM;
        }
    }

    private MealType parseMealType(String value) {
        if (!StringUtils.hasText(value)) return MealType.DINNER;
        try {
            return MealType.valueOf(value.trim().toUpperCase());
        } catch (Exception e) {
            return MealType.DINNER;
        }
    }

    private LocalDate parseDate(String value) {
        if (!StringUtils.hasText(value)) return LocalDate.now();
        try {
            return LocalDate.parse(value);
        } catch (Exception e) {
            return LocalDate.now();
        }
    }

    private String firstOrNull(List<String> tags) {
        if (tags == null || tags.isEmpty()) return null;
        return tags.get(0);
    }
}

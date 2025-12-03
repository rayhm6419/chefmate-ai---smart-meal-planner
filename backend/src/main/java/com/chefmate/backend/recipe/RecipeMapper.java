package com.chefmate.backend.recipe;

import com.chefmate.backend.entity.Recipe;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Collections;
import java.util.List;

public final class RecipeMapper {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    private static final TypeReference<List<String>> STRING_LIST = new TypeReference<>() {};
    private static final TypeReference<List<RecipeIngredientDto>> INGREDIENT_LIST = new TypeReference<>() {};

    private RecipeMapper() {
    }

    public static RecipeDto toDto(Recipe recipe) {
        return new RecipeDto(
            recipe.getId(),
            recipe.getTitle(),
            recipe.getShortDescription(),
            recipe.getServings(),
            recipe.getMealType(),
            recipe.getCuisine(),
            recipe.getCookTimeMinutes(),
            recipe.getDifficulty(),
            recipe.getFavorite(),
            recipe.getPlannedDate(),
            recipe.getPlannedMealSlot(),
            parseIngredients(recipe.getIngredientsJson()),
            parseList(recipe.getStepsJson()),
            parseList(recipe.getTipsJson())
        );
    }

    public static void applyLists(Recipe recipe, List<RecipeIngredientDto> ingredients, List<String> steps, List<String> tips) {
        recipe.setIngredientsJson(writeIngredients(ingredients));
        recipe.setStepsJson(writeList(steps));
        recipe.setTipsJson(writeList(tips));
    }

    private static List<String> parseList(String json) {
        if (json == null || json.isBlank()) {
            return Collections.emptyList();
        }
        try {
            return OBJECT_MAPPER.readValue(json, STRING_LIST);
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    private static List<RecipeIngredientDto> parseIngredients(String json) {
        if (json == null || json.isBlank()) {
            return Collections.emptyList();
        }
        try {
            return OBJECT_MAPPER.readValue(json, INGREDIENT_LIST);
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    private static String writeIngredients(List<RecipeIngredientDto> list) {
        if (list == null || list.isEmpty()) {
            return "[]";
        }
        try {
            return OBJECT_MAPPER.writeValueAsString(list);
        } catch (Exception e) {
            return "[]";
        }
    }

    private static String writeList(List<String> list) {
        if (list == null || list.isEmpty()) {
            return "[]";
        }
        try {
            return OBJECT_MAPPER.writeValueAsString(list);
        } catch (Exception e) {
            return "[]";
        }
    }
}

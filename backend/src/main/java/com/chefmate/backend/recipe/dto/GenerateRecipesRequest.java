package com.chefmate.backend.recipe.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public class GenerateRecipesRequest {

    @NotEmpty
    private List<Ingredient> ingredients;
    private List<String> cuisinePreference;
    private String difficulty;
    private Integer servings;
    private Integer maxTimeMinutes;
    private List<String> excludeRecipeIds;
    private String seed;

    public List<Ingredient> getIngredients() {
        return ingredients;
    }

    public void setIngredients(List<Ingredient> ingredients) {
        this.ingredients = ingredients;
    }

    public List<String> getCuisinePreference() {
        return cuisinePreference;
    }

    public void setCuisinePreference(List<String> cuisinePreference) {
        this.cuisinePreference = cuisinePreference;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public Integer getServings() {
        return servings;
    }

    public void setServings(Integer servings) {
        this.servings = servings;
    }

    public Integer getMaxTimeMinutes() {
        return maxTimeMinutes;
    }

    public void setMaxTimeMinutes(Integer maxTimeMinutes) {
        this.maxTimeMinutes = maxTimeMinutes;
    }

    public List<String> getExcludeRecipeIds() {
        return excludeRecipeIds;
    }

    public void setExcludeRecipeIds(List<String> excludeRecipeIds) {
        this.excludeRecipeIds = excludeRecipeIds;
    }

    public String getSeed() {
        return seed;
    }

    public void setSeed(String seed) {
        this.seed = seed;
    }

    public static class Ingredient {
        private String id;
        private String name;

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }
    }
}

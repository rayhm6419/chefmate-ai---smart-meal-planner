package com.chefmate.backend.ai.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class AiRecipeRequest {

    private static final List<String> DEFAULT_CUISINES = List.of("cantonese", "sichuan", "fujian");

    @NotBlank
    private String query;

    private Integer servings;

    private String mealType;

    private List<String> cuisinePreference = new ArrayList<>(DEFAULT_CUISINES);

    private List<String> dietRestrictions;

    private String language = "en-US";

    public String getQuery() {
        return query;
    }

    public void setQuery(String query) {
        this.query = query;
    }

    public Integer getServings() {
        return servings;
    }

    public void setServings(Integer servings) {
        this.servings = servings;
    }

    public String getMealType() {
        return mealType;
    }

    public void setMealType(String mealType) {
        this.mealType = mealType;
    }

    public List<String> getCuisinePreference() {
        if (cuisinePreference == null || cuisinePreference.isEmpty()) {
            return DEFAULT_CUISINES;
        }
        return cuisinePreference;
    }

    public void setCuisinePreference(List<String> cuisinePreference) {
        this.cuisinePreference = cuisinePreference;
    }

    public List<String> getDietRestrictions() {
        return dietRestrictions;
    }

    public void setDietRestrictions(List<String> dietRestrictions) {
        this.dietRestrictions = dietRestrictions;
    }

    public String getLanguage() {
        return (language == null || language.isBlank()) ? "en-US" : language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }
}

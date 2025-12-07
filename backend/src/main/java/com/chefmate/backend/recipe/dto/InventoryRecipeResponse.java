package com.chefmate.backend.recipe.dto;

import java.util.ArrayList;
import java.util.List;

public class InventoryRecipeResponse {
    private String title;
    private List<String> ingredients = new ArrayList<>();
    private List<String> steps = new ArrayList<>();

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public List<String> getIngredients() {
        return ingredients;
    }

    public void setIngredients(List<String> ingredients) {
        this.ingredients = ingredients;
    }

    public List<String> getSteps() {
        return steps;
    }

    public void setSteps(List<String> steps) {
        this.steps = steps;
    }
}

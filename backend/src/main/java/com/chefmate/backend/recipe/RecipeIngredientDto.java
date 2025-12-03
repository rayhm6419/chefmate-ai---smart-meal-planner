package com.chefmate.backend.recipe;

public record RecipeIngredientDto(
    String name,
    String quantity,
    String unit,
    String note
) { }

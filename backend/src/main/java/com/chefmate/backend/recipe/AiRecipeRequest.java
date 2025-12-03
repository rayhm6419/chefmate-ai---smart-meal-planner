package com.chefmate.backend.recipe;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public record AiRecipeRequest(
    @NotBlank String prompt,
    @NotNull LocalDate date,
    @NotNull MealType mealType,
    Integer servings,
    List<String> mustHaveIngredients
) { }

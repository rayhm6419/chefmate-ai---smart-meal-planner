package com.chefmate.backend.recipe;

import java.time.LocalDate;
import java.util.List;

public record RecipeDto(
    String id,
    String title,
    String shortDescription,
    Integer servings,
    MealType mealType,
    String cuisine,
    Integer cookTimeMinutes,
    Difficulty difficulty,
    Boolean favorite,
    LocalDate plannedDate,
    String plannedMealSlot,
    List<RecipeIngredientDto> ingredients,
    List<String> steps,
    List<String> tips
) { }

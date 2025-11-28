package com.chefmate.backend.mealplan;

import jakarta.validation.constraints.NotBlank;

public record MealPlanDto(
    @NotBlank String meal,
    String title,
    String notes
) { }

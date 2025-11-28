package com.chefmate.backend.mealplan;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record UpdateMealPlansRequest(
    @NotNull List<@Valid MealPlanDto> plans
) { }

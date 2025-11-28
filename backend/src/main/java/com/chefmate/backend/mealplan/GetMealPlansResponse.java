package com.chefmate.backend.mealplan;

import java.time.LocalDate;
import java.util.List;

public record GetMealPlansResponse(
    LocalDate date,
    List<MealPlanDto> plans
) { }

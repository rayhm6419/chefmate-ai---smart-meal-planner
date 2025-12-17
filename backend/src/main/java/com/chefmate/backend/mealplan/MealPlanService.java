package com.chefmate.backend.mealplan;

import com.chefmate.backend.DemoUsers;
import com.chefmate.backend.entity.MealPlan;
import com.chefmate.backend.entity.MealType;
import com.chefmate.backend.repository.MealPlanRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class MealPlanService {

    private final MealPlanRepository mealPlanRepository;

    public MealPlanService(MealPlanRepository mealPlanRepository) {
        this.mealPlanRepository = mealPlanRepository;
    }

    public GetMealPlansResponse getPlansForDate(LocalDate date) {
        String userId = DemoUsers.DEMO_USER_ID_STR;
        List<MealPlanDto> plans = mealPlanRepository.findByUserIdAndPlanDate(userId, date).stream()
            .map(MealPlanService::toDto)
            .toList();
        return new GetMealPlansResponse(date, plans);
    }

    public GetMealPlansResponse savePlansForDate(LocalDate date, List<MealPlanDto> plans) {
        String userId = DemoUsers.DEMO_USER_ID_STR;

        if (plans == null || plans.isEmpty()) {
            mealPlanRepository.deleteByUserIdAndPlanDate(userId, date);
            return new GetMealPlansResponse(date, List.of());
        } else {
            // Replace existing plans for the date.
            mealPlanRepository.deleteByUserIdAndPlanDate(userId, date);

            List<MealPlanDto> saved = plans.stream()
                .map(dto -> toEntity(dto, userId, date))
                .map(mealPlanRepository::save)
                .map(MealPlanService::toDto)
                .toList();

            return new GetMealPlansResponse(date, saved);
        }
    }

    private static MealPlanDto toDto(MealPlan mealPlan) {
        return new MealPlanDto(
            mealPlan.getMeal().name(),
            mealPlan.getTitle(),
            mealPlan.getNotes()
        );
    }

    private static MealPlan toEntity(MealPlanDto dto, String userId, LocalDate planDate) {
        MealPlan entity = new MealPlan();
        entity.setUserId(userId);
        entity.setPlanDate(planDate);
        entity.setMeal(parseMealType(dto.meal()));
        entity.setTitle(dto.title());
        entity.setNotes(dto.notes());
        entity.setCreatedAt(Instant.now());
        entity.setUpdatedAt(entity.getCreatedAt());
        return entity;
    }

    private static MealType parseMealType(String meal) {
        try {
            return MealType.valueOf(meal.toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid meal type: " + meal);
        }
    }
}

package com.chefmate.backend.repository;

import com.chefmate.backend.entity.MealPlan;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MealPlanRepository extends JpaRepository<MealPlan, UUID> {
    List<MealPlan> findByUserIdAndPlanDate(UUID userId, LocalDate planDate);

    void deleteByUserIdAndPlanDate(UUID userId, LocalDate planDate);
}

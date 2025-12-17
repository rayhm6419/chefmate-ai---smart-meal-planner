package com.chefmate.backend.repository;

import com.chefmate.backend.entity.MealPlan;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface MealPlanRepository extends MongoRepository<MealPlan, String> {
    List<MealPlan> findByUserIdAndPlanDate(String userId, LocalDate planDate);

    void deleteByUserIdAndPlanDate(String userId, LocalDate planDate);

    default void deleteByUserIdAndDate(String userId, LocalDate date) {
        deleteByUserIdAndPlanDate(userId, date);
    }
}

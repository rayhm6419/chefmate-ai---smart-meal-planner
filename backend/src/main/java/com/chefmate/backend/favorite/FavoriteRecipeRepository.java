package com.chefmate.backend.favorite;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface FavoriteRecipeRepository extends MongoRepository<FavoriteRecipe, String> {
    List<FavoriteRecipe> findByUserId(String userId);
    Optional<FavoriteRecipe> findByUserIdAndRecipeId(String userId, String recipeId);
    void deleteByUserIdAndRecipeId(String userId, String recipeId);
}

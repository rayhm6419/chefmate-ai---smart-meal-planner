package com.chefmate.backend.favorite;

import com.chefmate.backend.auth.User;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteRecipeController {

    private final FavoriteRecipeRepository favoriteRecipeRepository;

    public FavoriteRecipeController(FavoriteRecipeRepository favoriteRecipeRepository) {
        this.favoriteRecipeRepository = favoriteRecipeRepository;
    }

    @GetMapping
    public ResponseEntity<List<FavoriteRecipe>> list(Authentication authentication) {
        String userId = currentUserId(authentication);
        List<FavoriteRecipe> favorites = favoriteRecipeRepository.findByUserId(userId);
        return ResponseEntity.ok(favorites);
    }

    @PostMapping
    public ResponseEntity<FavoriteRecipe> add(@Valid @RequestBody FavoriteRecipe request, Authentication authentication) {
        String userId = currentUserId(authentication);
        FavoriteRecipe favorite = favoriteRecipeRepository.findByUserIdAndRecipeId(userId, request.getRecipeId())
                .orElseGet(FavoriteRecipe::new);

        favorite.setUserId(userId);
        favorite.setRecipeId(request.getRecipeId());
        favorite.setTitle(request.getTitle());
        favorite.setShortDescription(request.getShortDescription());
        favorite.setCookTimeMinutes(request.getCookTimeMinutes());
        favorite.setDifficulty(request.getDifficulty());
        favorite.setServings(request.getServings());
        favorite.setCuisine(request.getCuisine());
        favorite.setFavorite(request.getFavorite() != null ? request.getFavorite() : Boolean.TRUE);
        favorite.setIngredients(request.getIngredients());
        favorite.setSteps(request.getSteps());
        favorite.setImageUrl(request.getImageUrl());
        if (favorite.getCreatedAt() == null) {
            favorite.setCreatedAt(Instant.now());
        }
        FavoriteRecipe saved = favoriteRecipeRepository.save(favorite);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @DeleteMapping("/by-recipe/{recipeId}")
    public ResponseEntity<Void> deleteByRecipe(@PathVariable String recipeId, Authentication authentication) {
        String userId = currentUserId(authentication);
        favoriteRecipeRepository.deleteByUserIdAndRecipeId(userId, recipeId);
        return ResponseEntity.noContent().build();
    }

    private String currentUserId(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof User user) {
            return user.getId();
        }
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
    }
}

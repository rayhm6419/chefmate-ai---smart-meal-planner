package com.chefmate.backend.recipe;

import com.chefmate.backend.recipe.dto.InventoryRecipeRequest;
import com.chefmate.backend.recipe.dto.InventoryRecipeResponse;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/recipes")
@CrossOrigin(origins = "*")
public class RecipeController {

    private final RecipeService recipeService;
    private final InventoryRecipeService inventoryRecipeService;

    public RecipeController(RecipeService recipeService, InventoryRecipeService inventoryRecipeService) {
        this.recipeService = recipeService;
        this.inventoryRecipeService = inventoryRecipeService;
    }

    @PostMapping("/ai")
    public ResponseEntity<RecipeDto> generateAiRecipe(@Valid @RequestBody AiRecipeRequest request) {
        RecipeDto dto = recipeService.generateAndSaveAiRecipe(request);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/favorites")
    public ResponseEntity<List<RecipeDto>> favorites(
        @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
        @RequestParam(value = "mealType", required = false) MealType mealType
    ) {
        List<RecipeDto> recipes = recipeService.findFavorites(date, mealType);
        return ResponseEntity.ok(recipes);
    }

    @PostMapping("/from-inventory")
    public ResponseEntity<InventoryRecipeResponse> generateFromInventory(@Valid @RequestBody InventoryRecipeRequest request) {
        InventoryRecipeResponse response = inventoryRecipeService.generateFromInventory(request);
        return ResponseEntity.ok(response);
    }
}

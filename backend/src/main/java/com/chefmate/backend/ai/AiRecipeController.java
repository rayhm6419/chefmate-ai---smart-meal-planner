package com.chefmate.backend.ai;

import com.chefmate.backend.ai.dto.AiRecipeRequest;
import com.chefmate.backend.ai.dto.AiRecipeResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AiRecipeController {

    private final AiRecipeService aiRecipeService;

    public AiRecipeController(AiRecipeService aiRecipeService) {
        this.aiRecipeService = aiRecipeService;
    }

    @PostMapping("/recipes")
    public ResponseEntity<AiRecipeResponse> generateRecipes(@Valid @RequestBody AiRecipeRequest request) {
        AiRecipeResponse response = aiRecipeService.generateRecipes(request);
        return ResponseEntity.ok(response);
    }
}

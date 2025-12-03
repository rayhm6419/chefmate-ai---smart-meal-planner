package com.chefmate.backend.recipe;

import org.springframework.stereotype.Component;

/**
 * Placeholder LLM client. Replace with real OpenAI/Gemini integration.
 */
@Component
public class DummyLlmClient implements LlmClient {
    @Override
    public String generateRecipeJson(String systemPrompt, String userPrompt) {
        // In production, call the real model. Here we return a minimal stub JSON.
        return """
        {
          "title": "Sample Recipe",
          "shortDescription": "A tasty AI-generated dish.",
          "servings": 2,
          "mealType": "DINNER",
          "cuisine": "Fusion",
          "cookTimeMinutes": 30,
          "difficulty": "EASY",
          "ingredients": [
            { "name": "Chicken", "quantity": "200", "unit": "g", "note": "" },
            { "name": "Salt", "quantity": "1", "unit": "tsp", "note": "" }
          ],
          "steps": [
            "Prep ingredients",
            "Cook thoroughly"
          ],
          "tips": ["Serve hot"]
        }
        """;
    }
}

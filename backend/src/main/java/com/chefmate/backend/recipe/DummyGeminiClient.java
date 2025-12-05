package com.chefmate.backend.recipe;

import org.springframework.stereotype.Component;

/**
 * Placeholder Gemini client. Replace with real Gemini SDK/HTTP implementation.
 */
@Component
public class DummyGeminiClient implements GeminiClient {
    @Override
    public String generateJson(String systemInstruction, String userPrompt, String jsonSchema) {
        return """
        {
          "title": "Sample Gemini Dinner",
          "shortDescription": "A quick, easy dinner idea.",
          "servings": 2,
          "mealType": "DINNER",
          "cuisine": "Fusion",
          "cookTimeMinutes": 25,
          "difficulty": "EASY",
          "ingredients": [
            { "name": "Pasta", "quantity": "200", "unit": "g", "note": "" },
            { "name": "Tomato Sauce", "quantity": "1", "unit": "cup", "note": "" }
          ],
          "steps": [
            "Boil pasta until al dente.",
            "Heat sauce and combine."
          ],
          "tips": [
            "Garnish with basil.",
            "Add chili flakes for heat."
          ]
        }
        """;
    }

    @Override
    public String generateText(String systemInstruction, String userPrompt) {
        return "Here is a helpful cooking tip from Gemini.";
    }
}

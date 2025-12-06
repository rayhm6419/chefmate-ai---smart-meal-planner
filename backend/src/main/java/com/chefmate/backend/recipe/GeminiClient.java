package com.chefmate.backend.recipe;

public interface GeminiClient {
    String generateJson(String systemInstruction, String userPrompt, String jsonSchema);
    String generateText(String systemInstruction, String userPrompt);
}

package com.chefmate.backend.recipe;

public interface LlmClient {
    /**
     * Returns raw JSON string from the model for the given system + user prompts.
     */
    String generateRecipeJson(String systemPrompt, String userPrompt);
}

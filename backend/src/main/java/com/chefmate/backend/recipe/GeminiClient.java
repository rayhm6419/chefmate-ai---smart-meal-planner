package com.chefmate.backend.recipe;

public interface GeminiClient {
    /**
     * Generates JSON content from Gemini using structured output (JSON mode).
     *
     * @param systemInstruction instruction for the model
     * @param userPrompt user prompt
     * @param jsonSchema JSON schema string defining the expected response shape
     * @return raw JSON string response
     */
    String generateJson(String systemInstruction, String userPrompt, String jsonSchema);

    /**
     * Generates plain text (no structured output) from Gemini for chat.
     *
     * @param systemInstruction instruction for the model
     * @param userPrompt user prompt (full history serialized as needed)
     * @return assistant reply text
     */
    String generateText(String systemInstruction, String userPrompt);
}

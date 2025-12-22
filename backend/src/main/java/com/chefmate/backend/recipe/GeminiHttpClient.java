package com.chefmate.backend.recipe;

import com.chefmate.backend.config.AiConfig;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

@Component
public class GeminiHttpClient implements GeminiClient {

    private static final Logger log = LoggerFactory.getLogger(GeminiHttpClient.class);
    private static final String DEFAULT_MODEL = "gemini-2.5-flash";
    private static final String BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s";

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final String modelId;

    public GeminiHttpClient(AiConfig aiConfig, ObjectMapper objectMapper) {
        this.apiKey = aiConfig.geminiApiKey();
        this.objectMapper = objectMapper;
        String envModel = System.getenv("GEMINI_MODEL_ID");
        this.modelId = (envModel == null || envModel.isBlank()) ? DEFAULT_MODEL : envModel.trim();
    }

    @Override
    public String generateJson(String systemInstruction, String userPrompt, String jsonSchema) {
        String systemWithSchema = systemInstruction + "\nYou must follow this JSON schema exactly:\n" + jsonSchema + "\nReturn ONLY valid JSON.";
        return callModel(systemWithSchema, userPrompt);
    }

    @Override
    public String generateText(String systemInstruction, String userPrompt) {
        return callModel(systemInstruction, userPrompt);
    }

    private String callModel(String systemInstruction, String userPrompt) {
        String requestId = UUID.randomUUID().toString();
        try {
            if (apiKey == null || apiKey.isBlank()) {
                throw new ResponseStatusException(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR, "GEMINI_API_KEY is not configured");
            }
            String url = BASE_URL.formatted(modelId, apiKey);
            log.info("[Gemini] reqId={} model={} url={}", requestId, modelId, url);
            Map<String, Object> body = new HashMap<>();
            body.put("systemInstruction", Map.of(
                "parts", List.of(Map.of("text", systemInstruction))
            ));
            body.put("contents", List.of(Map.of(
                "role", "user",
                "parts", List.of(Map.of("text", userPrompt))
            )));
            body.put("generationConfig", Map.of(
                "temperature", 1.0,
                "topP", 0.95,
                "topK", 64,
                "maxOutputTokens", 1600,
                "responseMimeType", "application/json"
            ));
            try {
                log.info("[Gemini] reqId={} request body: {}", requestId, objectMapper.writeValueAsString(body));
            } catch (Exception ignore) {
                log.debug("Gemini request body logging failed");
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            ResponseEntity<String> response;
            try {
                response = restTemplate.postForEntity(url, entity, String.class);
            } catch (HttpStatusCodeException e) {
                String responseBody = e.getResponseBodyAsString();
                String truncatedBody = responseBody == null ? "" : responseBody.substring(0, Math.min(responseBody.length(), 2000));
                log.error("[Gemini] reqId={} API error status={} url={} body={}", requestId, e.getStatusCode(), url, truncatedBody);
                String shortBody = responseBody == null ? "" : responseBody.substring(0, Math.min(responseBody.length(), 200));
                throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_GATEWAY,
                    "Gemini API error (reqId=" + requestId + ", status=" + e.getStatusCode() + "): " + shortBody);
            }

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                log.error("[Gemini] reqId={} non-OK status: {} url={}", requestId, response.getStatusCode(), url);
                throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_GATEWAY, "Gemini API error (reqId=" + requestId + ")");
            }
            String raw = response.getBody();
            String text = extractText(raw);
            text = cleanJson(text);
            log.debug("[Gemini] reqId={} raw text response (truncated): {}", requestId, text.substring(0, Math.min(text.length(), 300)));
            return text;
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            log.error("[Gemini] reqId={} API call failed", requestId, e);
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_GATEWAY, "Failed to call Gemini (reqId=" + requestId + "): " + e.getMessage(), e);
        }
    }

    private String extractText(String rawResponse) throws Exception {
        JsonNode root = objectMapper.readTree(rawResponse);
        if (root.has("error")) {
            String message = root.path("error").path("message").asText("Unknown Gemini error");
            throw new IllegalStateException(message);
        }
        JsonNode candidates = root.path("candidates");
        if (!candidates.isArray() || candidates.isEmpty()) {
            throw new IllegalStateException("Gemini returned no candidates");
        }
        JsonNode textNode = candidates.get(0).path("content").path("parts").get(0).path("text");
        if (textNode.isMissingNode() || textNode.isNull()) {
            throw new IllegalStateException("Gemini returned empty content");
        }
        return textNode.asText();
    }

    private String cleanJson(String text) {
        if (text == null) return null;
        String trimmed = text.trim();
        if (trimmed.startsWith("```")) {
            trimmed = trimmed.replaceFirst("```json\\s*", "")
                .replaceFirst("^```", "");
            int fence = trimmed.lastIndexOf("```");
            if (fence >= 0) {
                trimmed = trimmed.substring(0, fence);
            }
        }
        return trimmed.trim();
    }
}

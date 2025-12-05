package com.chefmate.backend.recipe;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class ChatService {

    private final GeminiClient geminiClient;
    private static final String SYSTEM_PROMPT = "You are a helpful cooking assistant for an app called ChefMate.";

    public ChatService(GeminiClient geminiClient) {
        this.geminiClient = geminiClient;
    }

    public String chat(List<ChatMessageDto> messages) {
        String userPrompt = messages.stream()
            .map(m -> m.role().toUpperCase() + ": " + m.content())
            .collect(Collectors.joining("\n"));

        return geminiClient.generateText(SYSTEM_PROMPT, userPrompt);
    }
}

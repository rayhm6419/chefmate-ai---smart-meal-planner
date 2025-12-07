package com.chefmate.backend.recipe;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

import com.chefmate.backend.ai.client.LlmClient;
import com.chefmate.backend.recipe.dto.InventoryRecipeRequest;
import com.chefmate.backend.recipe.dto.InventoryRecipeRequest.Item;
import com.chefmate.backend.recipe.dto.InventoryRecipeResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class InventoryRecipeServiceTest {

    @Mock
    private LlmClient llmClient;

    @InjectMocks
    private InventoryRecipeService service = new InventoryRecipeService(llmClient, new ObjectMapper());

    @Test
    void parsesValidResponse() {
        when(llmClient.generateRecipes(anyString(), anyString(), anyString()))
            .thenReturn("{\"title\":\"Test Dish\",\"ingredients\":[\"a\",\"b\",\"c\"],\"steps\":[\"step1\",\"step2\"]}");

        InventoryRecipeRequest req = new InventoryRecipeRequest();
        Item item = new Item();
        item.setName("Chicken");
        req.setIngredients(List.of(item));

        InventoryRecipeResponse res = service.generateFromInventory(req);
        assertThat(res.getTitle()).isEqualTo("Test Dish");
        assertThat(res.getIngredients()).containsExactly("a", "b", "c");
        assertThat(res.getSteps()).contains("step1");
    }

    @Test
    void rejectsInvalidResponse() {
        when(llmClient.generateRecipes(anyString(), anyString(), anyString()))
            .thenReturn("{\"title\":\"\"}");

        InventoryRecipeRequest req = new InventoryRecipeRequest();
        Item item = new Item();
        item.setName("Rice");
        req.setIngredients(List.of(item));

        assertThatThrownBy(() -> service.generateFromInventory(req))
            .isInstanceOf(ResponseStatusException.class);
    }
}

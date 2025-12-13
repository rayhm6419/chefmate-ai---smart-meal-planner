package com.chefmate.backend.recipe;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

import com.chefmate.backend.ai.client.LlmClient;
import com.chefmate.backend.recipe.dto.GenerateRecipesRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class GenerateRecipesServiceTest {

    @Mock
    private LlmClient llmClient;

    @InjectMocks
    private GenerateRecipesService service = new GenerateRecipesService(llmClient, new ObjectMapper());

    @Test
    void parsesValidResponse() {
        when(llmClient.generateRecipes(anyString(), anyString(), anyString())).thenReturn("""
            {"dishes":[{"id":"1","title":"Dish A","shortDescription":"desc","difficulty":"easy","estimatedTime":15,"imageUrl":"","ingredients":["a","b"],"steps":["one","two"]}]}
        """);

        GenerateRecipesRequest req = new GenerateRecipesRequest();
        GenerateRecipesRequest.Ingredient ing = new GenerateRecipesRequest.Ingredient();
        ing.setName("Chicken");
        req.setIngredients(List.of(ing));

        var res = service.generate(req);
        assertThat(res.getDishes()).hasSize(1);
        assertThat(res.getDishes().get(0).getTitle()).isEqualTo("Dish A");
    }

    @Test
    void rejectsInvalidResponse() {
        when(llmClient.generateRecipes(anyString(), anyString(), anyString())).thenReturn("{}\n");

        GenerateRecipesRequest req = new GenerateRecipesRequest();
        GenerateRecipesRequest.Ingredient ing = new GenerateRecipesRequest.Ingredient();
        ing.setName("Rice");
        req.setIngredients(List.of(ing));

        assertThatThrownBy(() -> service.generate(req)).isInstanceOf(ResponseStatusException.class);
    }
}

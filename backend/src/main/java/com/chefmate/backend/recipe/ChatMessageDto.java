package com.chefmate.backend.recipe;

import jakarta.validation.constraints.NotBlank;

public record ChatMessageDto(
    @NotBlank String role,
    @NotBlank String content
) { }

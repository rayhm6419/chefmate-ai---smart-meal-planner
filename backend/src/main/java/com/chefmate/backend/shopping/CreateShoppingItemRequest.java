package com.chefmate.backend.shopping;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateShoppingItemRequest(
    @NotBlank(message = "Name is required")
    @Size(max = 255)
    String name,

    @Min(value = 0, message = "Quantity must be non-negative")
    Integer quantity,

    @Size(max = 32)
    String unit,

    @Size(max = 32)
    String category
) {
}



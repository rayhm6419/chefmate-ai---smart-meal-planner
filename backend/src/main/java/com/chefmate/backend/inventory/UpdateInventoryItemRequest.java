package com.chefmate.backend.inventory;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record UpdateInventoryItemRequest(
    @NotBlank String name,
    @NotNull InventoryCategory category,
    Integer quantity,
    String unit,
    LocalDate expiryDate
) { }

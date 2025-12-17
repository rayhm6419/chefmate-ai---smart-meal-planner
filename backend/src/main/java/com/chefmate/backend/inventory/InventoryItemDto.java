package com.chefmate.backend.inventory;

import java.time.LocalDate;

public record InventoryItemDto(
    String id,
    String name,
    InventoryCategory category,
    Integer quantity,
    String unit,
    LocalDate expiryDate
) { }

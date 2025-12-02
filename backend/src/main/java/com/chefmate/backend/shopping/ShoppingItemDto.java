package com.chefmate.backend.shopping;

import java.time.LocalDateTime;

public record ShoppingItemDto(
    Long id,
    String name,
    Integer quantity,
    String unit,
    String category,
    boolean checked,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
}



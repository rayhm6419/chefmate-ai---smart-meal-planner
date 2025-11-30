package com.chefmate.backend;

import java.util.List;

public record ApiError(
    String message,
    List<FieldErrorInfo> errors
) {
    public static ApiError of(String message) {
        return new ApiError(message, List.of());
    }
}

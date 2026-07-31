package com.foody.tracking.auth.dto;

public record UserResponse(
        Long id,
        String name,
        String email
) {
}

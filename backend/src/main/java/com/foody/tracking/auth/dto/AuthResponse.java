package com.foody.tracking.auth.dto;

public record AuthResponse(
        String token,
        long expiresIn,
        UserResponse user
) {
}

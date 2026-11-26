package com.parkpulse.dto;

import com.parkpulse.domain.DutyStatus;
import com.parkpulse.domain.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public final class AuthDtos {
    private AuthDtos() {}

    public record LoginRequest(
            @NotBlank(message = "Email is required") @Email(message = "Invalid email format") String email,
            @NotBlank(message = "Password is required") String password
    ) {}

    public record LoginResponse(
            String token,
            Long userId,
            String fullName,
            String email,
            Role role,
            String assignedStation,
            Long assignedRideId,
            DutyStatus dutyStatus
    ) {}
}

package com.parkpulse.dto;

import com.parkpulse.domain.DutyStatus;
import com.parkpulse.domain.Role;
import com.parkpulse.domain.StaffUser;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public final class StaffDtos {
    private StaffDtos() {}

    public record CreateStaffRequest(
            @NotBlank(message = "Full name is required") @Size(min = 2, max = 120) String fullName,
            @NotBlank(message = "Email is required") @Email(message = "Invalid email format") String email,
            @NotBlank(message = "Password is required") @Size(min = 8, max = 100, message = "Password must be at least 8 characters") String password,
            @NotBlank(message = "Phone is required") @Pattern(regexp = "^\\d{8,15}$", message = "Phone must be 8 to 15 digits") String phone,
            @NotNull(message = "Role is required") Role role,
            @NotBlank(message = "Assigned station is required") @Size(min = 2, max = 100) String assignedStation,
            Long assignedRideId,
            @NotNull(message = "Salary is required") @DecimalMin("0.00") @DecimalMax("100000.00") BigDecimal salary
    ) {}

    public record UpdateStationRequest(
            @NotBlank(message = "Station name is required")
            @Size(min = 2, max = 100) String assignedStation,
            Long assignedRideId
    ) {}

    public record StaffResponse(
            Long id,
            String fullName,
            String email,
            String phone,
            Role role,
            String assignedStation,
            Long assignedRideId,
            String assignedRideName,
            DutyStatus dutyStatus
    ) {
        public static StaffResponse from(StaffUser u) {
            return new StaffResponse(
                    u.getId(), u.getFullName(), u.getEmail(), u.getPhone(),
                    u.getRole(), u.getAssignedStation(),
                    u.getAssignedRide() != null ? u.getAssignedRide().getId() : null,
                    u.getAssignedRide() != null ? u.getAssignedRide().getName() : null,
                    u.getDutyStatus()
            );
        }
    }
}

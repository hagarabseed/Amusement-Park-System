package com.parkpulse.dto;

import com.parkpulse.domain.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public final class Dtos {
    private Dtos() {}

    public record LoginRequest(
            @NotBlank @Email String email,
            @NotBlank String password
    ) {}

    public record LoginResponse(
            String token,
            String fullName,
            String email,
            Role role
    ) {}

    public record CreateCustomerRequest(
            @NotBlank(message = "Full name is required")
            @Size(min = 2, max = 120) String fullName,

            @NotBlank(message = "Email is required")
            @Email(message = "Invalid email format") String email,

            @NotBlank(message = "Phone is required")
            @Pattern(regexp = "^\\d{8,15}$", message = "Phone must be 8 to 15 digits") String phone,

            @NotNull(message = "Initial deposit is required")
            @DecimalMin(value = "0.00", message = "Initial deposit cannot be negative")
            @DecimalMax(value = "10000.00", message = "Initial deposit exceeds single limit")
            BigDecimal initialDeposit
    ) {}

    public record CustomerResponse(
            Long id,
            String fullName,
            String email,
            String phone,
            BigDecimal wristbandBalance,
            int loyaltyPoints,
            LocalDateTime createdAt
    ) {
        public static CustomerResponse from(Customer c) {
            return new CustomerResponse(c.getId(), c.getFullName(), c.getEmail(),
                    c.getPhone(), c.getWristbandBalance(), c.getLoyaltyPoints(), c.getCreatedAt());
        }
    }

    public record TopUpRequest(
            @NotNull Long customerId,
            @NotNull @DecimalMin(value = "1.00", message = "Top-up must be at least $1.00")
            @DecimalMax(value = "5000.00", message = "Top-up cannot exceed $5000.00")
            BigDecimal amount
    ) {}

    public record IssueTicketRequest(
            @NotNull Long customerId,
            @NotNull PassType passType,
            @NotNull PaymentMethod paymentMethod,
            String promoCode
    ) {}

    public record OrderLineRequest(
            @NotNull Long menuItemId,
            @Min(value = 1, message = "Quantity must be at least 1")
            @Max(value = 50, message = "Quantity cannot exceed 50")
            int quantity
    ) {}

    public record FoodCheckoutRequest(
            @NotNull Long customerId,
            @NotNull PaymentMethod paymentMethod,
            String promoCode,
            @NotEmpty(message = "Cart cannot be empty") @Valid List<OrderLineRequest> items
    ) {}

    public record TransactionResponse(
            Long id,
            Long customerId,
            String customerName,
            TransactionType txType,
            PaymentMethod paymentMethod,
            BigDecimal grossAmount,
            BigDecimal discountAmount,
            BigDecimal netAmount,
            int pointsEarned,
            BigDecimal updatedBalance,
            int updatedLoyaltyPoints,
            LocalDateTime createdAt
    ) {}

    public record CreateRideRequest(
            @NotBlank @Size(min = 2, max = 120) String name,
            @NotNull RideCategory category,
            @Min(value = 1, message = "Capacity must be at least 1")
            @Max(value = 200) int capacity,
            @Min(value = 0) @Max(value = 21) int minAge,
            @NotNull @DecimalMin("0.00") @DecimalMax("2.50") BigDecimal minHeightM,
            String specificDetails
    ) {}

    public record RideResponse(
            Long id,
            String name,
            RideCategory category,
            int capacity,
            int minAge,
            BigDecimal minHeightM,
            boolean needMaintenance,
            boolean operational,
            String specificDetails
    ) {
        public static RideResponse from(Ride r) {
            return new RideResponse(r.getId(), r.getName(), r.getCategory(), r.getCapacity(),
                    r.getMinAge(), r.getMinHeightM(), r.isNeedMaintenance(), r.isOperational(), r.getSpecificDetails());
        }
    }

    public record UpdateStationRequest(
            @NotBlank(message = "Station name is required")
            @Size(min = 2, max = 100) String assignedStation
    ) {}

    public record StaffResponse(
            Long id,
            String fullName,
            String email,
            Role role,
            String assignedStation,
            DutyStatus dutyStatus
    ) {
        public static StaffResponse from(StaffUser u) {
            return new StaffResponse(u.getId(), u.getFullName(), u.getEmail(),
                    u.getRole(), u.getAssignedStation(), u.getDutyStatus());
        }
    }

    public record DashboardSummaryResponse(
            BigDecimal totalRevenue,
            BigDecimal ticketRevenue,
            BigDecimal foodRevenue,
            BigDecimal topupRevenue,
            long registeredCustomers,
            long operationalRides,
            long totalRides,
            long activeStaffCount,
            List<AuditLog> recentLogs
    ) {}
}
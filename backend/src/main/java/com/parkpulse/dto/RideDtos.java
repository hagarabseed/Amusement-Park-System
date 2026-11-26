package com.parkpulse.dto;

import com.parkpulse.domain.PassType;
import com.parkpulse.domain.Ride;
import com.parkpulse.domain.RideBoarding;
import com.parkpulse.domain.RideCategory;
import com.parkpulse.domain.TicketStatus;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public final class RideDtos {
    private RideDtos() {}

    public record CreateRideRequest(
            @NotBlank(message = "Ride name is required")
            @Size(min = 2, max = 120) String name,
            @NotNull(message = "Category is required") RideCategory category,
            @Min(value = 1, message = "Capacity must be at least 1")
            @Max(value = 200, message = "Capacity cannot exceed 200")
            int capacity,
            @Min(value = 0, message = "Minimum age cannot be negative")
            @Max(value = 21, message = "Minimum age cannot exceed 21")
            int minAge,
            @NotNull(message = "Minimum height is required")
            @DecimalMin(value = "0.00", message = "Height cannot be negative")
            @DecimalMax(value = "2.50", message = "Height cannot exceed 2.50m")
            BigDecimal minHeightM,
            @Size(max = 255) String specificDetails
    ) {}

    public record ToggleMaintenanceRequest(
            @Size(max = 255, message = "Reason cannot exceed 255 characters")
            String reason
    ) {}

    public record BoardRideRequest(
            @NotBlank(message = "Ticket code is required") String ticketCode,
            @Min(value = 0, message = "Guest age cannot be negative")
            @Max(value = 120, message = "Guest age must be realistic")
            int guestAge,
            @NotNull(message = "Guest height is required")
            @DecimalMin(value = "0.40", message = "Guest height must be at least 0.40m")
            @DecimalMax(value = "2.50", message = "Guest height cannot exceed 2.50m")
            BigDecimal guestHeightM
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
            String maintenanceReason,
            String specificDetails,
            long totalBoardings
    ) {
        public static RideResponse from(Ride r, long totalBoardings) {
            return new RideResponse(
                    r.getId(), r.getName(), r.getCategory(), r.getCapacity(),
                    r.getMinAge(), r.getMinHeightM(), r.isNeedMaintenance(), r.isOperational(),
                    r.getMaintenanceReason(), r.getSpecificDetails(), totalBoardings
            );
        }
    }

    public record RideBoardingResponse(
            Long id,
            Long rideId,
            String rideName,
            String ticketCode,
            String customerName,
            PassType passType,
            int guestAge,
            BigDecimal guestHeightM,
            String operatorEmail,
            LocalDateTime boardedAt
    ) {
        public static RideBoardingResponse from(RideBoarding rb) {
            return new RideBoardingResponse(
                    rb.getId(),
                    rb.getRide().getId(),
                    rb.getRide().getName(),
                    rb.getTicket().getTicketCode(),
                    rb.getTicket().getCustomer().getFullName(),
                    rb.getTicket().getPassType(),
                    rb.getGuestAge(),
                    rb.getGuestHeightM(),
                    rb.getOperator().getEmail(),
                    rb.getBoardedAt()
            );
        }
    }

    public record TicketLookupResponse(
            Long id,
            String ticketCode,
            String customerName,
            PassType passType,
            TicketStatus status,
            LocalDate validDate,
            int boardingsCount
    ) {}
}

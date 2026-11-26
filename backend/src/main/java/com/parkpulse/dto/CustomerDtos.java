package com.parkpulse.dto;

import com.parkpulse.domain.Customer;
import com.parkpulse.domain.PassType;
import com.parkpulse.domain.Ticket;
import com.parkpulse.domain.TicketStatus;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public final class CustomerDtos {
    private CustomerDtos() {}

    public record CreateCustomerRequest(
            @NotBlank(message = "Full name is required")
            @Size(min = 2, max = 120, message = "Full name must be 2 to 120 characters")
            String fullName,

            @NotBlank(message = "Email is required")
            @Email(message = "Invalid email format")
            String email,

            @NotBlank(message = "Phone is required")
            @Pattern(regexp = "^\\d{8,15}$", message = "Phone must be 8 to 15 digits")
            String phone,

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
            return new CustomerResponse(
                    c.getId(), c.getFullName(), c.getEmail(),
                    c.getPhone(), c.getWristbandBalance(), c.getLoyaltyPoints(), c.getCreatedAt()
            );
        }
    }

    public record TicketSummary(
            Long id,
            String ticketCode,
            PassType passType,
            TicketStatus status,
            BigDecimal pricePaid,
            LocalDate validDate,
            int boardingsCount,
            LocalDateTime issuedAt
    ) {
        public static TicketSummary from(Ticket t) {
            return new TicketSummary(
                    t.getId(), t.getTicketCode(), t.getPassType(), t.getStatus(),
                    t.getPricePaid(), t.getValidDate(), t.getBoardingsCount(), t.getIssuedAt()
            );
        }
    }

    public record CustomerDetailResponse(
            CustomerResponse profile,
            List<TicketSummary> tickets,
            List<PosDtos.TransactionResponse> recentTransactions
    ) {}
}

package com.parkpulse.dto;

import com.parkpulse.domain.PassType;
import com.parkpulse.domain.TicketStatus;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public final class CustomerPortalDtos {
    private CustomerPortalDtos() {}

    // ── Registration ──────────────────────────────────────────────────────────
    public record RegisterRequest(
            @NotBlank @Size(min = 2, max = 120) String fullName,
            @NotBlank @Email String email,
            @NotBlank @Pattern(regexp = "^[+]?[0-9]{7,20}$", message = "Invalid phone number") String phone,
            @NotBlank @Size(min = 8, max = 72,
                    message = "Password must be 8-72 characters") String password
    ) {}

    // ── Auth response (returned after register or login) ──────────────────────
    public record CustomerAuthResponse(
            String token,
            Long accountId,
            Long customerId,
            String fullName,
            String email,
            String role
    ) {}

    // ── Ticket booking ────────────────────────────────────────────────────────
    public record BookTicketRequest(
            @NotNull PassType passType,
            @NotBlank String paymentMethod,   // "CASH" or "WRISTBAND"
            String promoCode                  // optional
    ) {}

    public record BookedTicketResponse(
            Long ticketId,
            String ticketCode,
            PassType passType,
            BigDecimal pricePaid,
            BigDecimal grossAmount,
            BigDecimal discountAmount,
            BigDecimal netAmount,
            int pointsEarned,
            TicketStatus status,
            LocalDate validDate,
            LocalDateTime issuedAt
    ) {}

    // ── Customer portal profile ───────────────────────────────────────────────
    public record CustomerProfileResponse(
            Long customerId,
            String fullName,
            String email,
            String phone,
            BigDecimal wristbandBalance,
            int loyaltyPoints,
            java.util.List<MyTicketDto> tickets
    ) {}

    public record MyTicketDto(
            Long id,
            String ticketCode,
            PassType passType,
            TicketStatus status,
            BigDecimal pricePaid,
            LocalDate validDate,
            int boardingsCount,
            LocalDateTime issuedAt
    ) {}

    // ── Pass catalog (public) ─────────────────────────────────────────────────
    public record PassOption(
            PassType passType,
            String label,
            String description,
            BigDecimal price,
            String[] perks
    ) {}
}

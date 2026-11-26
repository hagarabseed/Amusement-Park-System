package com.parkpulse.dto;

import com.parkpulse.domain.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public final class PosDtos {
    private PosDtos() {}

    public record TopUpRequest(
            @NotNull(message = "Customer ID is required") Long customerId,
            @NotNull(message = "Amount is required")
            @DecimalMin(value = "1.00", message = "Top-up must be at least $1.00")
            @DecimalMax(value = "5000.00", message = "Top-up cannot exceed $5000.00")
            BigDecimal amount
    ) {}

    public record IssueTicketRequest(
            @NotNull(message = "Customer ID is required") Long customerId,
            @NotNull(message = "Pass type is required") PassType passType,
            @NotNull(message = "Payment method is required") PaymentMethod paymentMethod,
            String promoCode
    ) {}

    public record OrderLineRequest(
            @NotNull(message = "Menu item ID is required") Long menuItemId,
            @Min(value = 1, message = "Quantity must be at least 1")
            @Max(value = 50, message = "Quantity cannot exceed 50")
            int quantity
    ) {}

    public record FoodCheckoutRequest(
            @NotNull(message = "Customer ID is required") Long customerId,
            @NotNull(message = "Payment method is required") PaymentMethod paymentMethod,
            String promoCode,
            @NotEmpty(message = "Cart cannot be empty") @Valid List<OrderLineRequest> items
    ) {}

    public record LoyaltyRedeemRequest(
            @NotNull(message = "Customer ID is required") Long customerId,
            @Min(value = 100, message = "Minimum 100 points required for redemption")
            @Max(value = 10000, message = "Maximum 10,000 points per redemption")
            int points
    ) {}

    public record LoyaltyRedeemResponse(
            Long redemptionId,
            Long customerId,
            String customerName,
            int pointsRedeemed,
            BigDecimal creditAmount,
            BigDecimal updatedBalance,
            int remainingPoints,
            LocalDateTime createdAt
    ) {}

    public record CreateOfferRequest(
            @NotBlank(message = "Promo code is required")
            @Pattern(regexp = "^[A-Za-z0-9_-]{3,32}$", message = "Promo code must be 3-32 alphanumeric characters")
            String code,
            @NotBlank(message = "Title is required")
            @Size(min = 3, max = 120) String title,
            @Min(value = 1, message = "Discount must be at least 1%")
            @Max(value = 100, message = "Discount cannot exceed 100%")
            int discountPercent,
            @NotNull @DecimalMin("0.00") @DecimalMax("5000.00") BigDecimal minSpend
    ) {}

    public record OfferResponse(
            Long id,
            String code,
            String title,
            int discountPercent,
            boolean active,
            BigDecimal minSpend,
            LocalDateTime expiresAt
    ) {
        public static OfferResponse from(Offer o) {
            return new OfferResponse(o.getId(), o.getCode(), o.getTitle(),
                    o.getDiscountPercent(), o.isActive(), o.getMinSpend(), o.getExpiresAt());
        }
    }

    public record PromoQuoteResponse(
            String code,
            String title,
            int discountPercent,
            BigDecimal minSpend,
            BigDecimal grossAmount,
            BigDecimal discountAmount,
            BigDecimal netAmount
    ) {}

    public record PassCatalogItem(
            PassType passType,
            String label,
            BigDecimal basePrice,
            String perks
    ) {}

    public record PosCatalogResponse(
            List<PassCatalogItem> passes,
            List<OfferResponse> activeOffers,
            int loyaltyPointsPerCreditUnit,
            BigDecimal loyaltyCreditPer100Points
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
            String ticketCode,
            String processedByEmail,
            String promoCode,
            String referenceNote,
            LocalDateTime createdAt
    ) {}

    public record FoodReceiptLine(
            Long menuItemId,
            String itemName,
            int quantity,
            BigDecimal unitPrice,
            BigDecimal lineTotal
    ) {}

    public record TransactionReceiptResponse(
            TransactionResponse transaction,
            CustomerDtos.TicketSummary ticket,
            List<FoodReceiptLine> foodItems
    ) {}
}

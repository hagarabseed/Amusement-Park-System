package com.parkpulse.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "loyalty_redemptions")
public class LoyaltyRedemption {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "processed_by_id")
    private StaffUser processedBy;

    @Column(name = "points_redeemed", nullable = false)
    private int pointsRedeemed;

    @Column(name = "credit_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal creditAmount;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() { return id; }
    public Customer getCustomer() { return customer; }
    public void setCustomer(Customer customer) { this.customer = customer; }
    public StaffUser getProcessedBy() { return processedBy; }
    public void setProcessedBy(StaffUser processedBy) { this.processedBy = processedBy; }
    public int getPointsRedeemed() { return pointsRedeemed; }
    public void setPointsRedeemed(int pointsRedeemed) { this.pointsRedeemed = pointsRedeemed; }
    public BigDecimal getCreditAmount() { return creditAmount; }
    public void setCreditAmount(BigDecimal creditAmount) { this.creditAmount = creditAmount; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}

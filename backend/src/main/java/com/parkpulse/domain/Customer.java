package com.parkpulse.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "customers")
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false, length = 120)
    private String fullName;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false, unique = true, length = 20)
    private String phone;

    @Column(name = "wristband_balance", nullable = false, precision = 10, scale = 2)
    private BigDecimal wristbandBalance = BigDecimal.ZERO;

    @Column(name = "loyalty_points", nullable = false)
    private int loyaltyPoints = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Version
    @Column(nullable = false)
    private Long version = 0L;

    public void creditBalance(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Credit amount must be positive");
        }
        this.wristbandBalance = this.wristbandBalance.add(amount);
    }

    public void debitBalance(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Debit amount must be positive");
        }
        if (this.wristbandBalance.compareTo(amount) < 0) {
            throw new IllegalStateException("Insufficient wristband balance");
        }
        this.wristbandBalance = this.wristbandBalance.subtract(amount);
    }

    public void addLoyaltyPoints(int points) {
        if (points > 0) {
            this.loyaltyPoints += points;
        }
    }

    public void deductLoyaltyPoints(int points) {
        if (points <= 0 || this.loyaltyPoints < points) {
            throw new IllegalStateException("Insufficient loyalty points");
        }
        this.loyaltyPoints -= points;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public BigDecimal getWristbandBalance() { return wristbandBalance; }
    public void setWristbandBalance(BigDecimal wristbandBalance) { this.wristbandBalance = wristbandBalance; }
    public int getLoyaltyPoints() { return loyaltyPoints; }
    public void setLoyaltyPoints(int loyaltyPoints) { this.loyaltyPoints = loyaltyPoints; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public Long getVersion() { return version; }
}

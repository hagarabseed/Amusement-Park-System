package com.parkpulse.domain;

import java.math.BigDecimal;

public enum PassType {
    REGULAR(new BigDecimal("50.00")),
    VIP_FASTPASS(new BigDecimal("75.00")),
    FAMILY(new BigDecimal("160.00"));

    private final BigDecimal basePrice;

    PassType(BigDecimal basePrice) {
        this.basePrice = basePrice;
    }

    public BigDecimal getBasePrice() {
        return basePrice;
    }
}
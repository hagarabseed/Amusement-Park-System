package com.parkpulse.repository;

import com.parkpulse.domain.LoyaltyRedemption;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LoyaltyRedemptionRepository extends JpaRepository<LoyaltyRedemption, Long> {
    List<LoyaltyRedemption> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
}

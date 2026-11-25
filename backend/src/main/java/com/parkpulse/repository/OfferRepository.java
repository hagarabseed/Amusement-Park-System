package com.parkpulse.repository;

import com.parkpulse.domain.Offer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface OfferRepository extends JpaRepository<Offer, Long> {
    Optional<Offer> findByCodeIgnoreCaseAndActiveTrue(String code);
}
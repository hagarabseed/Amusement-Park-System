package com.parkpulse.repository;

import com.parkpulse.domain.RideBoarding;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RideBoardingRepository extends JpaRepository<RideBoarding, Long> {
    @EntityGraph(attributePaths = {"ticket", "ticket.customer", "operator"})
    List<RideBoarding> findTop20ByRideIdOrderByBoardedAtDesc(Long rideId);
    long countByRideId(Long rideId);
    long countByOperatorId(Long operatorId);
}

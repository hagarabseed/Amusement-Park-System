package com.parkpulse.repository;

import com.parkpulse.domain.Ride;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RideRepository extends JpaRepository<Ride, Long> {
    boolean existsByNameIgnoreCase(String name);
    List<Ride> findByNameContainingIgnoreCase(String name);
    long countByNeedMaintenanceFalse();
}
package com.parkpulse.repository;

import com.parkpulse.domain.StaffUser;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StaffUserRepository extends JpaRepository<StaffUser, Long> {
    @EntityGraph(attributePaths = {"assignedRide"})
    Optional<StaffUser> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    @EntityGraph(attributePaths = {"assignedRide"})
    @Override
    List<StaffUser> findAll();
}

package com.parkpulse.repository;

import com.parkpulse.domain.FoodOrder;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FoodOrderRepository extends JpaRepository<FoodOrder, Long> {
    @EntityGraph(attributePaths = {"items", "items.menuItem"})
    Optional<FoodOrder> findByTransactionId(Long transactionId);
}

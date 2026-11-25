package com.parkpulse.repository;

import com.parkpulse.domain.ParkTransaction;
import com.parkpulse.domain.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;

public interface ParkTransactionRepository extends JpaRepository<ParkTransaction, Long> {
    @Query("SELECT COALESCE(SUM(t.netAmount), 0) FROM ParkTransaction t")
    BigDecimal sumTotalRevenue();

    @Query("SELECT COALESCE(SUM(t.netAmount), 0) FROM ParkTransaction t WHERE t.txType = :type")
    BigDecimal sumRevenueByType(@Param("type") TransactionType type);
}
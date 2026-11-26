package com.parkpulse.repository;

import com.parkpulse.domain.ParkTransaction;
import com.parkpulse.domain.PaymentMethod;
import com.parkpulse.domain.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface ParkTransactionRepository extends JpaRepository<ParkTransaction, Long> {
    @Query("SELECT COALESCE(SUM(t.netAmount), 0) FROM ParkTransaction t")
    BigDecimal sumTotalRevenue();

    @Query("SELECT COALESCE(SUM(t.netAmount), 0) FROM ParkTransaction t WHERE t.txType = :type")
    BigDecimal sumRevenueByType(@Param("type") TransactionType type);

    @Query("SELECT COALESCE(SUM(t.netAmount), 0) FROM ParkTransaction t WHERE t.paymentMethod = :method")
    BigDecimal sumRevenueByPaymentMethod(@Param("method") PaymentMethod method);

    @Query("SELECT COALESCE(SUM(t.netAmount), 0) FROM ParkTransaction t WHERE t.processedBy.id = :userId")
    BigDecimal sumRevenueByProcessedBy(@Param("userId") Long userId);

    long countByProcessedById(Long userId);

    @EntityGraph(attributePaths = {"customer", "offer", "processedBy"})
    List<ParkTransaction> findTop15ByCustomerIdOrderByCreatedAtDesc(Long customerId);

    @EntityGraph(attributePaths = {"customer", "offer", "processedBy"})
    @Query("""
        SELECT t FROM ParkTransaction t
        WHERE (:txType IS NULL OR t.txType = :txType)
          AND (:customerId IS NULL OR t.customer.id = :customerId)
          AND (:processedById IS NULL OR t.processedBy.id = :processedById)
        ORDER BY t.createdAt DESC
    """)
    Page<ParkTransaction> findFiltered(
            @Param("txType") TransactionType txType,
            @Param("customerId") Long customerId,
            @Param("processedById") Long processedById,
            Pageable pageable);
}

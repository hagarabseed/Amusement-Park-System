package com.parkpulse.repository;

import com.parkpulse.domain.Ticket;
import com.parkpulse.domain.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
    Optional<Ticket> findByTicketCodeIgnoreCase(String ticketCode);
    Optional<Ticket> findByTransactionId(Long transactionId);
    List<Ticket> findByCustomerIdOrderByIssuedAtDesc(Long customerId);
    List<Ticket> findByCustomerIdAndStatusOrderByIssuedAtDesc(Long customerId, TicketStatus status);
}

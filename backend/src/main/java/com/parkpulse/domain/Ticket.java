package com.parkpulse.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "tickets")
public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "transaction_id")
    private ParkTransaction transaction;

    @Enumerated(EnumType.STRING)
    @Column(name = "pass_type", nullable = false, length = 30)
    private PassType passType;

    @Column(name = "price_paid", nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePaid;

    @Column(name = "ticket_code", unique = true, length = 32)
    private String ticketCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TicketStatus status = TicketStatus.ACTIVE;

    @Column(name = "valid_date", nullable = false)
    private LocalDate validDate = LocalDate.now();

    @Column(name = "boardings_count", nullable = false)
    private int boardingsCount = 0;

    @Column(name = "issued_at", nullable = false, updatable = false)
    private LocalDateTime issuedAt = LocalDateTime.now();

    public void recordBoarding() {
        this.boardingsCount += 1;
    }

    public Long getId() { return id; }
    public Customer getCustomer() { return customer; }
    public void setCustomer(Customer customer) { this.customer = customer; }
    public ParkTransaction getTransaction() { return transaction; }
    public void setTransaction(ParkTransaction transaction) { this.transaction = transaction; }
    public PassType getPassType() { return passType; }
    public void setPassType(PassType passType) { this.passType = passType; }
    public BigDecimal getPricePaid() { return pricePaid; }
    public void setPricePaid(BigDecimal pricePaid) { this.pricePaid = pricePaid; }
    public String getTicketCode() { return ticketCode; }
    public void setTicketCode(String ticketCode) { this.ticketCode = ticketCode; }
    public TicketStatus getStatus() { return status; }
    public void setStatus(TicketStatus status) { this.status = status; }
    public LocalDate getValidDate() { return validDate; }
    public void setValidDate(LocalDate validDate) { this.validDate = validDate; }
    public int getBoardingsCount() { return boardingsCount; }
    public void setBoardingsCount(int boardingsCount) { this.boardingsCount = boardingsCount; }
    public LocalDateTime getIssuedAt() { return issuedAt; }
}

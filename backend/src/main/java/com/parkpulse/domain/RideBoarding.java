package com.parkpulse.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "ride_boardings")
public class RideBoarding {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ride_id")
    private Ride ride;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ticket_id")
    private Ticket ticket;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "operator_id")
    private StaffUser operator;

    @Column(name = "guest_age", nullable = false)
    private int guestAge;

    @Column(name = "guest_height_m", nullable = false, precision = 4, scale = 2)
    private BigDecimal guestHeightM;

    @Column(name = "boarded_at", nullable = false, updatable = false)
    private LocalDateTime boardedAt = LocalDateTime.now();

    public Long getId() { return id; }
    public Ride getRide() { return ride; }
    public void setRide(Ride ride) { this.ride = ride; }
    public Ticket getTicket() { return ticket; }
    public void setTicket(Ticket ticket) { this.ticket = ticket; }
    public StaffUser getOperator() { return operator; }
    public void setOperator(StaffUser operator) { this.operator = operator; }
    public int getGuestAge() { return guestAge; }
    public void setGuestAge(int guestAge) { this.guestAge = guestAge; }
    public BigDecimal getGuestHeightM() { return guestHeightM; }
    public void setGuestHeightM(BigDecimal guestHeightM) { this.guestHeightM = guestHeightM; }
    public LocalDateTime getBoardedAt() { return boardedAt; }
}

package com.parkpulse.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "users")
public class StaffUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false, length = 120)
    private String fullName;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(nullable = false, length = 20)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Role role;

    @Column(name = "assigned_station", nullable = false, length = 100)
    private String assignedStation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_ride_id")
    private Ride assignedRide;

    @Enumerated(EnumType.STRING)
    @Column(name = "duty_status", nullable = false, length = 20)
    private DutyStatus dutyStatus = DutyStatus.ON_DUTY;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal salary;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public String getAssignedStation() { return assignedStation; }
    public void setAssignedStation(String assignedStation) { this.assignedStation = assignedStation; }
    public Ride getAssignedRide() { return assignedRide; }
    public void setAssignedRide(Ride assignedRide) { this.assignedRide = assignedRide; }
    public DutyStatus getDutyStatus() { return dutyStatus; }
    public void setDutyStatus(DutyStatus dutyStatus) { this.dutyStatus = dutyStatus; }
    public BigDecimal getSalary() { return salary; }
    public void setSalary(BigDecimal salary) { this.salary = salary; }
}

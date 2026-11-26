package com.parkpulse.service;

import com.parkpulse.domain.DutyStatus;
import com.parkpulse.domain.Ride;
import com.parkpulse.domain.Role;
import com.parkpulse.domain.StaffUser;
import com.parkpulse.dto.StaffDtos.CreateStaffRequest;
import com.parkpulse.dto.StaffDtos.StaffResponse;
import com.parkpulse.exception.BusinessRuleException;
import com.parkpulse.repository.RideRepository;
import com.parkpulse.repository.StaffUserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StaffServiceTest {

    @Mock private StaffUserRepository staffUserRepository;
    @Mock private RideRepository rideRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private AuditService auditService;

    @InjectMocks private StaffService staffService;

    @Test
    @DisplayName("Creates ride operator linked to ride and hashes password")
    void createStaff_RideOperator_Success() {
        Ride ride = new Ride();
        ride.setId(1L);
        ride.setName("Thunder Coaster");

        when(staffUserRepository.existsByEmailIgnoreCase("op@park.com")).thenReturn(false);
        when(rideRepository.findById(1L)).thenReturn(Optional.of(ride));
        when(passwordEncoder.encode("Strong@123")).thenReturn("$2a$hashed");
        when(staffUserRepository.save(any(StaffUser.class))).thenAnswer(inv -> inv.getArgument(0));

        StaffResponse res = staffService.createStaff(new CreateStaffRequest(
                "Layla Op", "Op@Park.com", "Strong@123", "01022223333",
                Role.RIDE_OPERATOR, "Ignored", 1L, new BigDecimal("6000.00")));

        assertEquals("op@park.com", res.email());
        assertEquals("Thunder Coaster", res.assignedStation());
        assertEquals(1L, res.assignedRideId());
        assertEquals(DutyStatus.ON_DUTY, res.dutyStatus());
    }

    @Test
    @DisplayName("Rejects ride linkage for non-operator role and duplicate email")
    void createStaff_InvalidRoleRideLinkAndDuplicateEmail_Throws() {
        when(staffUserRepository.existsByEmailIgnoreCase("dup@park.com")).thenReturn(true);
        assertThrows(BusinessRuleException.class, () -> staffService.createStaff(new CreateStaffRequest(
                "Dup", "dup@park.com", "Strong@123", "01022223333",
                Role.CASHIER, "Gate 1", null, new BigDecimal("5000.00"))));

        when(staffUserRepository.existsByEmailIgnoreCase("cashier@park.com")).thenReturn(false);
        assertThrows(BusinessRuleException.class, () -> staffService.createStaff(new CreateStaffRequest(
                "Cashier", "cashier@park.com", "Strong@123", "01022223333",
                Role.CASHIER, "Gate 1", 1L, new BigDecimal("5000.00"))));
    }
}

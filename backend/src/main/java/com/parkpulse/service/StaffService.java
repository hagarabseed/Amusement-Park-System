package com.parkpulse.service;

import com.parkpulse.domain.DutyStatus;
import com.parkpulse.domain.Ride;
import com.parkpulse.domain.Role;
import com.parkpulse.domain.StaffUser;
import com.parkpulse.dto.StaffDtos.CreateStaffRequest;
import com.parkpulse.dto.StaffDtos.StaffResponse;
import com.parkpulse.exception.BusinessRuleException;
import com.parkpulse.exception.ResourceNotFoundException;
import com.parkpulse.repository.RideRepository;
import com.parkpulse.repository.StaffUserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class StaffService {
    private final StaffUserRepository staffUserRepository;
    private final RideRepository rideRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    public StaffService(StaffUserRepository staffUserRepository,
                        RideRepository rideRepository,
                        PasswordEncoder passwordEncoder,
                        AuditService auditService) {
        this.staffUserRepository = staffUserRepository;
        this.rideRepository = rideRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public List<StaffResponse> listStaff() {
        return staffUserRepository.findAll().stream().map(StaffResponse::from).toList();
    }

    @Transactional
    public StaffResponse createStaff(CreateStaffRequest req) {
        String email = req.email().trim().toLowerCase();
        if (staffUserRepository.existsByEmailIgnoreCase(email)) {
            throw new BusinessRuleException("Staff email already exists: " + email);
        }

        Ride assignedRide = resolveRideAssignment(req.role(), req.assignedRideId());

        StaffUser user = new StaffUser();
        user.setFullName(req.fullName().trim());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(req.password()));
        user.setPhone(req.phone().trim());
        user.setRole(req.role());
        user.setAssignedStation(assignedRide != null ? assignedRide.getName() : req.assignedStation().trim());
        user.setAssignedRide(assignedRide);
        user.setDutyStatus(DutyStatus.ON_DUTY);
        user.setSalary(req.salary());

        StaffUser saved = staffUserRepository.save(user);
        auditService.record("STAFF_CREATED", "USER", String.valueOf(saved.getId()),
                "Onboarded " + saved.getFullName() + " (" + saved.getRole() + ")");
        return StaffResponse.from(saved);
    }

    @Transactional
    public StaffResponse toggleStaffShift(Long staffId) {
        StaffUser user = staffUserRepository.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found: " + staffId));
        user.setDutyStatus(user.getDutyStatus() == DutyStatus.ON_DUTY ? DutyStatus.OFF_DUTY : DutyStatus.ON_DUTY);
        auditService.record("STAFF_SHIFT_UPDATED", "USER", String.valueOf(user.getId()),
                user.getFullName() + " is now " + user.getDutyStatus());
        return StaffResponse.from(user);
    }

    @Transactional
    public StaffResponse updateStaffStation(Long staffId, String station, Long assignedRideId) {
        StaffUser user = staffUserRepository.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found: " + staffId));

        Ride ride = resolveRideAssignment(user.getRole(), assignedRideId);
        String stationName = ride != null ? ride.getName() : station.trim();
        user.setAssignedRide(ride);
        user.setAssignedStation(stationName);

        auditService.record("STAFF_STATION_ASSIGNED", "USER", String.valueOf(user.getId()),
                user.getFullName() + " assigned to " + stationName);
        return StaffResponse.from(user);
    }

    private Ride resolveRideAssignment(Role role, Long assignedRideId) {
        if (assignedRideId == null) {
            return null;
        }
        if (role != Role.RIDE_OPERATOR) {
            throw new BusinessRuleException("Only RIDE_OPERATOR accounts can be linked directly to a ride station.");
        }
        return rideRepository.findById(assignedRideId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found: " + assignedRideId));
    }
}

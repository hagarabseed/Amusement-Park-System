// RideAndStaffService.java
package com.parkpulse.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.parkpulse.domain.DutyStatus;
import com.parkpulse.domain.Ride;
import com.parkpulse.domain.StaffUser;
import com.parkpulse.domain.TransactionType;
import com.parkpulse.dto.Dtos.*;
import com.parkpulse.dto.Dtos.CreateRideRequest;
import com.parkpulse.dto.Dtos.DashboardSummaryResponse;
import com.parkpulse.dto.Dtos.RideResponse;
import com.parkpulse.dto.Dtos.StaffResponse;
import com.parkpulse.exception.BusinessRuleException;
import com.parkpulse.exception.ResourceNotFoundException;
import com.parkpulse.repository.AuditLogRepository;
import com.parkpulse.repository.CustomerRepository;
import com.parkpulse.repository.ParkTransactionRepository;
import com.parkpulse.repository.RideRepository;
import com.parkpulse.repository.StaffUserRepository;

@Service
public class RideAndStaffService {
    private final RideRepository rideRepository;
    private final StaffUserRepository staffUserRepository;
    private final CustomerRepository customerRepository;
    private final ParkTransactionRepository txRepository;
    private final AuditLogRepository auditLogRepository;
    private final AuditService auditService;

    public RideAndStaffService(RideRepository rideRepository,
                               StaffUserRepository staffUserRepository,
                               CustomerRepository customerRepository,
                               ParkTransactionRepository txRepository,
                               AuditLogRepository auditLogRepository,
                               AuditService auditService) {
        this.rideRepository = rideRepository;
        this.staffUserRepository = staffUserRepository;
        this.customerRepository = customerRepository;
        this.txRepository = txRepository;
        this.auditLogRepository = auditLogRepository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public List<RideResponse> listRides(String search) {
        List<Ride> rides = (search == null || search.isBlank())
                ? rideRepository.findAll()
                : rideRepository.findByNameContainingIgnoreCase(search.trim());
        return rides.stream().map(RideResponse::from).toList();
    }

    @Transactional
    public RideResponse createRide(CreateRideRequest req) {
        if (rideRepository.existsByNameIgnoreCase(req.name().trim())) {
            throw new BusinessRuleException("Ride already exists: " + req.name());
        }
        Ride ride = new Ride();
        ride.setName(req.name().trim());
        ride.setCategory(req.category());
        ride.setCapacity(req.capacity());
        ride.setMinAge(req.minAge());
        ride.setMinHeightM(req.minHeightM());
        ride.setSpecificDetails(req.specificDetails());
        Ride saved = rideRepository.save(ride);

        auditService.record("RIDE_CREATED", "RIDE", String.valueOf(saved.getId()), "Added ride " + saved.getName());
        return RideResponse.from(saved);
    }

    @Transactional
    public RideResponse toggleRideMaintenance(Long rideId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found: " + rideId));
        ride.setNeedMaintenance(!ride.isNeedMaintenance());
        auditService.record("RIDE_MAINTENANCE_TOGGLED", "RIDE", String.valueOf(ride.getId()),
                ride.getName() + " maintenance=" + ride.isNeedMaintenance());
        return RideResponse.from(ride);
    }

    @Transactional(readOnly = true)
    public List<StaffResponse> listStaff() {
        return staffUserRepository.findAll().stream().map(StaffResponse::from).toList();
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
    public StaffResponse updateStaffStation(Long staffId, String station) {
        StaffUser user = staffUserRepository.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found: " + staffId));
        user.setAssignedStation(station.trim());
        auditService.record("STAFF_STATION_ASSIGNED", "USER", String.valueOf(user.getId()),
                user.getFullName() + " assigned to " + station.trim());
        return StaffResponse.from(user);
    }

    @Transactional(readOnly = true)
    public DashboardSummaryResponse getDashboardSummary() {
        return new DashboardSummaryResponse(
                txRepository.sumTotalRevenue(),
                txRepository.sumRevenueByType(TransactionType.TICKET),
                txRepository.sumRevenueByType(TransactionType.FOOD),
                txRepository.sumRevenueByType(TransactionType.TOPUP),
                customerRepository.count(),
                rideRepository.countByNeedMaintenanceFalse(),
                rideRepository.count(),
                staffUserRepository.count(),
                auditLogRepository.findTop20ByOrderByCreatedAtDesc()
        );
    }
}
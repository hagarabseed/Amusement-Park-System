package com.parkpulse.service;

import com.parkpulse.domain.DutyStatus;
import com.parkpulse.domain.PaymentMethod;
import com.parkpulse.domain.Role;
import com.parkpulse.domain.StaffUser;
import com.parkpulse.domain.TransactionType;
import com.parkpulse.dto.DashboardDtos.PersonalDashboardResponse;
import com.parkpulse.dto.DashboardDtos.RevenueBreakdown;
import com.parkpulse.exception.ResourceNotFoundException;
import com.parkpulse.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DashboardService {
    private final StaffUserRepository staffUserRepository;
    private final RideRepository rideRepository;
    private final CustomerRepository customerRepository;
    private final ParkTransactionRepository txRepository;
    private final RideBoardingRepository boardingRepository;
    private final AuditLogRepository auditLogRepository;

    public DashboardService(StaffUserRepository staffUserRepository,
                            RideRepository rideRepository,
                            CustomerRepository customerRepository,
                            ParkTransactionRepository txRepository,
                            RideBoardingRepository boardingRepository,
                            AuditLogRepository auditLogRepository) {
        this.staffUserRepository = staffUserRepository;
        this.rideRepository = rideRepository;
        this.customerRepository = customerRepository;
        this.txRepository = txRepository;
        this.boardingRepository = boardingRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional(readOnly = true)
    public PersonalDashboardResponse getPersonalDashboard(String userEmail) {
        StaffUser currentUser = staffUserRepository.findByEmailIgnoreCase(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        Role role = currentUser.getRole();
        long opRides = rideRepository.countByNeedMaintenanceFalse();
        long allRides = rideRepository.count();
        Long assignedRideId = currentUser.getAssignedRide() != null ? currentUser.getAssignedRide().getId() : null;

        if (role == Role.MANAGER) {
            RevenueBreakdown breakdown = new RevenueBreakdown(
                    txRepository.sumRevenueByType(TransactionType.TICKET),
                    txRepository.sumRevenueByType(TransactionType.FOOD),
                    txRepository.sumRevenueByType(TransactionType.TOPUP),
                    txRepository.sumRevenueByPaymentMethod(PaymentMethod.WRISTBAND),
                    txRepository.sumRevenueByPaymentMethod(PaymentMethod.CASH)
            );
            long activeStaff = staffUserRepository.findAll().stream()
                    .filter(u -> u.getDutyStatus() == DutyStatus.ON_DUTY)
                    .count();

            return new PersonalDashboardResponse(
                    currentUser.getId(), currentUser.getFullName(), currentUser.getEmail(),
                    role, currentUser.getAssignedStation(), assignedRideId, currentUser.getDutyStatus(),
                    txRepository.sumTotalRevenue(),
                    breakdown,
                    customerRepository.count(),
                    txRepository.countByProcessedById(currentUser.getId()),
                    txRepository.sumRevenueByProcessedBy(currentUser.getId()),
                    opRides, allRides,
                    boardingRepository.count(),
                    activeStaff,
                    staffUserRepository.count(),
                    auditLogRepository.findTop20ByOrderByCreatedAtDesc()
            );
        }

        if (role == Role.CASHIER) {
            return new PersonalDashboardResponse(
                    currentUser.getId(), currentUser.getFullName(), currentUser.getEmail(),
                    role, currentUser.getAssignedStation(), assignedRideId, currentUser.getDutyStatus(),
                    null, null,
                    customerRepository.count(),
                    txRepository.countByProcessedById(currentUser.getId()),
                    txRepository.sumRevenueByProcessedBy(currentUser.getId()),
                    opRides, allRides,
                    null, null, null,
                    auditLogRepository.findTop20ByActorEmailOrderByCreatedAtDesc(userEmail)
            );
        }

        // RIDE_OPERATOR
        return new PersonalDashboardResponse(
                currentUser.getId(), currentUser.getFullName(), currentUser.getEmail(),
                role, currentUser.getAssignedStation(), assignedRideId, currentUser.getDutyStatus(),
                null, null,
                null, null, null,
                opRides, allRides,
                boardingRepository.countByOperatorId(currentUser.getId()),
                null, null,
                auditLogRepository.findTop20ByActorEmailOrderByCreatedAtDesc(userEmail)
        );
    }
}

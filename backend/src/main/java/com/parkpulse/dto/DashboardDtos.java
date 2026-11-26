package com.parkpulse.dto;

import com.parkpulse.domain.AuditLog;
import com.parkpulse.domain.DutyStatus;
import com.parkpulse.domain.Role;

import java.math.BigDecimal;
import java.util.List;

public final class DashboardDtos {
    private DashboardDtos() {}

    public record RevenueBreakdown(
            BigDecimal ticketRevenue,
            BigDecimal foodRevenue,
            BigDecimal topupRevenue,
            BigDecimal wristbandPaidRevenue,
            BigDecimal cashPaidRevenue
    ) {}

    public record PersonalDashboardResponse(
            Long userId,
            String fullName,
            String email,
            Role role,
            String assignedStation,
            Long assignedRideId,
            DutyStatus dutyStatus,
            // Manager-only global financials (null for Cashier & Ride Operator)
            BigDecimal totalRevenue,
            RevenueBreakdown revenueBreakdown,
            // Cashier & Manager metrics
            Long registeredCustomers,
            Long myTransactionsCount,
            BigDecimal myProcessedVolume,
            // Ride Operator & Manager metrics
            Long operationalRides,
            Long totalRides,
            Long myBoardingsCount,
            Long activeStaffCount,
            Long totalStaffCount,
            List<AuditLog> recentLogs
    ) {}
}

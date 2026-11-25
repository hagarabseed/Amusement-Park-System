// ParkOperationsController.java
package com.parkpulse.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.parkpulse.domain.MenuItem;
import com.parkpulse.dto.Dtos.*;
import com.parkpulse.dto.Dtos.CreateCustomerRequest;
import com.parkpulse.dto.Dtos.CreateRideRequest;
import com.parkpulse.dto.Dtos.CustomerResponse;
import com.parkpulse.dto.Dtos.DashboardSummaryResponse;
import com.parkpulse.dto.Dtos.FoodCheckoutRequest;
import com.parkpulse.dto.Dtos.IssueTicketRequest;
import com.parkpulse.dto.Dtos.RideResponse;
import com.parkpulse.dto.Dtos.StaffResponse;
import com.parkpulse.dto.Dtos.TopUpRequest;
import com.parkpulse.dto.Dtos.TransactionResponse;
import com.parkpulse.dto.Dtos.UpdateStationRequest;
import com.parkpulse.repository.MenuItemRepository;
import com.parkpulse.service.CustomerService;
import com.parkpulse.service.PosService;
import com.parkpulse.service.RideAndStaffService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1")
public class ParkOperationsController {
    private final CustomerService customerService;
    private final PosService posService;
    private final RideAndStaffService rideAndStaffService;
    private final MenuItemRepository menuItemRepository;

    public ParkOperationsController(CustomerService customerService,
                                    PosService posService,
                                    RideAndStaffService rideAndStaffService,
                                    MenuItemRepository menuItemRepository) {
        this.customerService = customerService;
        this.posService = posService;
        this.rideAndStaffService = rideAndStaffService;
        this.menuItemRepository = menuItemRepository;
    }

    @GetMapping("/dashboard")
    public DashboardSummaryResponse dashboard() {
        return rideAndStaffService.getDashboardSummary();
    }

    // Customers
    @GetMapping("/customers")
    public Page<CustomerResponse> listCustomers(@RequestParam(required = false) String q,
                                                @PageableDefault(size = 20) Pageable pageable) {
        return customerService.searchCustomers(q, pageable);
    }

    @PostMapping("/customers")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('MANAGER', 'CASHIER')")
    public CustomerResponse registerCustomer(@Valid @RequestBody CreateCustomerRequest req) {
        return customerService.registerCustomer(req);
    }

    // POS & Wristband
    @PostMapping("/pos/topup")
    @PreAuthorize("hasAnyRole('MANAGER', 'CASHIER')")
    public TransactionResponse topUp(@Valid @RequestBody TopUpRequest req) {
        return posService.topUpWristband(req);
    }

    @PostMapping("/pos/tickets")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('MANAGER', 'CASHIER')")
    public TransactionResponse issueTicket(@Valid @RequestBody IssueTicketRequest req) {
        return posService.issueTicket(req);
    }

    @GetMapping("/menu")
    public List<MenuItem> getMenu() {
        return menuItemRepository.findByAvailableTrue();
    }

    @PostMapping("/pos/food-orders")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('MANAGER', 'CASHIER')")
    public TransactionResponse checkoutFood(@Valid @RequestBody FoodCheckoutRequest req) {
        return posService.checkoutFoodOrder(req);
    }

    // Rides
    @GetMapping("/rides")
    public List<RideResponse> listRides(@RequestParam(required = false) String q) {
        return rideAndStaffService.listRides(q);
    }

    @PostMapping("/rides")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('MANAGER')")
    public RideResponse createRide(@Valid @RequestBody CreateRideRequest req) {
        return rideAndStaffService.createRide(req);
    }

    @PatchMapping("/rides/{id}/maintenance")
    @PreAuthorize("hasAnyRole('MANAGER', 'RIDE_OPERATOR')")
    public RideResponse toggleMaintenance(@PathVariable Long id) {
        return rideAndStaffService.toggleRideMaintenance(id);
    }

    // Staff
    @GetMapping("/staff")
    @PreAuthorize("hasRole('MANAGER')")
    public List<StaffResponse> listStaff() {
        return rideAndStaffService.listStaff();
    }

    @PatchMapping("/staff/{id}/shift")
    @PreAuthorize("hasRole('MANAGER')")
    public StaffResponse toggleShift(@PathVariable Long id) {
        return rideAndStaffService.toggleStaffShift(id);
    }

    @PatchMapping("/staff/{id}/station")
    @PreAuthorize("hasRole('MANAGER')")
    public StaffResponse assignStation(@PathVariable Long id, @Valid @RequestBody UpdateStationRequest req) {
        return rideAndStaffService.updateStaffStation(id, req.assignedStation());
    }
}
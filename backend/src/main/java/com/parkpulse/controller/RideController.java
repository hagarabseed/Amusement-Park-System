package com.parkpulse.controller;

import com.parkpulse.domain.RideCategory;
import com.parkpulse.dto.RideDtos.*;
import com.parkpulse.service.RideService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class RideController {
    private final RideService rideService;

    public RideController(RideService rideService) {
        this.rideService = rideService;
    }

    @GetMapping("/rides")
    public List<RideResponse> listRides(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) RideCategory category) {
        return rideService.listRides(q, category);
    }

    @PostMapping("/rides")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('MANAGER')")
    public RideResponse createRide(@Valid @RequestBody CreateRideRequest req) {
        return rideService.createRide(req);
    }

    @PatchMapping("/rides/{id}/maintenance")
    @PreAuthorize("hasAnyRole('MANAGER', 'RIDE_OPERATOR')")
    public RideResponse toggleMaintenance(
            @PathVariable Long id,
            @Valid @RequestBody(required = false) ToggleMaintenanceRequest req) {
        String reason = req != null ? req.reason() : null;
        return rideService.toggleRideMaintenance(id, reason);
    }

    @PostMapping("/rides/{id}/board")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('MANAGER', 'RIDE_OPERATOR')")
    public RideBoardingResponse boardGuest(
            @PathVariable Long id,
            @Valid @RequestBody BoardRideRequest req) {
        return rideService.boardGuest(id, req);
    }

    @GetMapping("/rides/{id}/boardings")
    @PreAuthorize("hasAnyRole('MANAGER', 'RIDE_OPERATOR')")
    public List<RideBoardingResponse> listRecentBoardings(@PathVariable Long id) {
        return rideService.listRecentBoardings(id);
    }

    @GetMapping("/tickets/lookup")
    @PreAuthorize("hasAnyRole('MANAGER', 'CASHIER', 'RIDE_OPERATOR')")
    public TicketLookupResponse lookupTicket(@RequestParam String code) {
        return rideService.lookupTicket(code);
    }
}

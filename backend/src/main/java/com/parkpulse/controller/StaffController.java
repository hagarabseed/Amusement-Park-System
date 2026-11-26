package com.parkpulse.controller;

import com.parkpulse.dto.StaffDtos.CreateStaffRequest;
import com.parkpulse.dto.StaffDtos.StaffResponse;
import com.parkpulse.dto.StaffDtos.UpdateStationRequest;
import com.parkpulse.service.StaffService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/staff")
public class StaffController {
    private final StaffService staffService;

    public StaffController(StaffService staffService) {
        this.staffService = staffService;
    }

    @GetMapping
    @PreAuthorize("hasRole('MANAGER')")
    public List<StaffResponse> listStaff() {
        return staffService.listStaff();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('MANAGER')")
    public StaffResponse createStaff(@Valid @RequestBody CreateStaffRequest req) {
        return staffService.createStaff(req);
    }

    @PatchMapping("/{id}/shift")
    @PreAuthorize("hasRole('MANAGER')")
    public StaffResponse toggleShift(@PathVariable Long id) {
        return staffService.toggleStaffShift(id);
    }

    @PatchMapping("/{id}/station")
    @PreAuthorize("hasRole('MANAGER')")
    public StaffResponse assignStation(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStationRequest req) {
        return staffService.updateStaffStation(id, req.assignedStation(), req.assignedRideId());
    }
}

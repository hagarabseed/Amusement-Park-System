package com.parkpulse.controller;

import com.parkpulse.dto.CustomerPortalDtos.*;
import com.parkpulse.dto.AuthDtos.LoginRequest;
import com.parkpulse.service.CustomerPortalService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Public-facing customer portal API.
 * <p>
 * Public endpoints (no auth required):
 *   POST /api/v1/portal/register
 *   POST /api/v1/portal/login
 *   GET  /api/v1/portal/passes
 *
 * Authenticated customer endpoints (ROLE_CUSTOMER):
 *   POST /api/v1/portal/book-ticket
 *   GET  /api/v1/portal/me
 */
@RestController
@RequestMapping("/api/v1/portal")
public class CustomerPortalController {

    private final CustomerPortalService portalService;

    public CustomerPortalController(CustomerPortalService portalService) {
        this.portalService = portalService;
    }

    /** Self-service registration — returns a JWT immediately. */
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public CustomerAuthResponse register(@Valid @RequestBody RegisterRequest req) {
        return portalService.register(req);
    }

    /** Customer login — separate from staff /auth/login. */
    @PostMapping("/login")
    public CustomerAuthResponse login(@Valid @RequestBody LoginRequest req) {
        return portalService.login(req.email(), req.password());
    }

    /** Public pass catalog — no authentication needed. */
    @GetMapping("/passes")
    public List<PassOption> listPasses() {
        return portalService.getPassCatalog();
    }

    /** Authenticated ticket booking. */
    @PostMapping("/book-ticket")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('CUSTOMER')")
    public BookedTicketResponse bookTicket(@Valid @RequestBody BookTicketRequest req,
                                           Authentication auth) {
        return portalService.bookTicket(auth.getName(), req);
    }

    /** My profile + wallet + tickets. */
    @GetMapping("/me")
    @PreAuthorize("hasRole('CUSTOMER')")
    public CustomerProfileResponse myProfile(Authentication auth) {
        return portalService.getMyProfile(auth.getName());
    }
}

package com.parkpulse.controller;

import com.parkpulse.dto.AuthDtos.LoginRequest;
import com.parkpulse.dto.AuthDtos.LoginResponse;
import com.parkpulse.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public LoginResponse me(Authentication auth) {
        return authService.getCurrentProfile(auth.getName());
    }
}

package com.parkpulse.service;

import com.parkpulse.config.JwtService;
import com.parkpulse.domain.StaffUser;
import com.parkpulse.dto.AuthDtos.LoginRequest;
import com.parkpulse.dto.AuthDtos.LoginResponse;
import com.parkpulse.exception.ResourceNotFoundException;
import com.parkpulse.repository.StaffUserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final StaffUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(StaffUserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        StaffUser user = userRepository.findByEmailIgnoreCase(request.email().trim())
                .orElseThrow(() -> {
                    log.warn("Failed login attempt for unknown email: {}", request.email());
                    return new BadCredentialsException("Invalid credentials");
                });
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            log.warn("Failed login attempt (bad password) for email: {}", user.getEmail());
            throw new BadCredentialsException("Invalid credentials");
        }
        String token = jwtService.generateToken(user);
        log.info("Staff login succeeded: {} ({})", user.getEmail(), user.getRole());
        return toLoginResponse(token, user);
    }

    @Transactional(readOnly = true)
    public LoginResponse getCurrentProfile(String email) {
        StaffUser user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("Staff user not found: " + email));
        return toLoginResponse(null, user);
    }

    private LoginResponse toLoginResponse(String token, StaffUser user) {
        return new LoginResponse(
                token,
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.getAssignedStation(),
                user.getAssignedRide() != null ? user.getAssignedRide().getId() : null,
                user.getDutyStatus()
        );
    }
}

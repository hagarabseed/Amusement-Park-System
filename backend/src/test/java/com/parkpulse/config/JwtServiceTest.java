package com.parkpulse.config;

import com.parkpulse.domain.Role;
import com.parkpulse.domain.StaffUser;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private static final String VALID_SECRET = "TestSecretKeyForJwtSigningMustBeAtLeast256BitsLong2026!";

    @Test
    @DisplayName("Generates valid JWT containing email subject, uid, and role claims")
    void generateAndParseToken_Success() {
        JwtService jwtService = new JwtService(VALID_SECRET, 3600000);
        StaffUser user = new StaffUser();
        user.setId(7L);
        user.setEmail("omar.manager@parkpulse.com");
        user.setRole(Role.MANAGER);

        String token = jwtService.generateToken(user);
        Claims claims = jwtService.parseClaims(token);

        assertEquals("omar.manager@parkpulse.com", claims.getSubject());
        assertEquals(7, claims.get("uid", Integer.class));
        assertEquals("MANAGER", claims.get("role", String.class));
    }

    @Test
    @DisplayName("Rejects tampered token and weak secret key")
    void parseInvalidToken_AndWeakSecret_Throws() {
        JwtService jwtService = new JwtService(VALID_SECRET, 3600000);
        assertThrows(JwtException.class, () -> jwtService.parseClaims("invalid.jwt.token"));
        assertThrows(IllegalArgumentException.class, () -> new JwtService("short-secret", 3600000));
    }
}

package com.parkpulse.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Customer Portal Integration Tests")
class CustomerPortalIntegrationTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    // ── Public endpoints ──────────────────────────────────────────────────────

    @Test
    @DisplayName("GET /portal/passes returns 3 pass options without auth")
    void getPassCatalog_public() throws Exception {
        mockMvc.perform(get("/api/v1/portal/passes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3))
                .andExpect(jsonPath("$[0].passType").exists())
                .andExpect(jsonPath("$[0].price").isNumber());
    }

    @Test
    @DisplayName("POST /portal/register creates account and returns JWT")
    void register_success() throws Exception {
        Map<String, String> payload = Map.of(
                "fullName", "Test Customer",
                "email",    "testcustomer_" + System.currentTimeMillis() + "@example.com",
                "phone",    "+2010" + System.currentTimeMillis() % 100000000L,
                "password", "SecurePass1!"
        );

        mockMvc.perform(post("/api/v1/portal/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.role").value("CUSTOMER"));
    }

    @Test
    @DisplayName("POST /portal/register rejects duplicate email with 409")
    void register_duplicateEmail_conflict() throws Exception {
        // First registration
        Map<String, String> payload = Map.of(
                "fullName", "Dup Test",
                "email",    "dup.test@example.com",
                "phone",    "+201055551234",
                "password", "SecurePass1!"
        );
        mockMvc.perform(post("/api/v1/portal/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)));

        // Second registration with same email
        mockMvc.perform(post("/api/v1/portal/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("POST /portal/login with invalid credentials returns 401")
    void login_badCredentials() throws Exception {
        Map<String, String> payload = Map.of(
                "email",    "nobody@example.com",
                "password", "WrongPass"
        );
        mockMvc.perform(post("/api/v1/portal/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /portal/login with demo account returns CUSTOMER token")
    void login_demoCustomer_returnsToken() throws Exception {
        Map<String, String> payload = Map.of(
                "email",    "sara.demo@example.com",
                "password", "Pass@1234"
        );
        mockMvc.perform(post("/api/v1/portal/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.role").value("CUSTOMER"));
    }

    @Test
    @DisplayName("GET /portal/me without token returns 401")
    void myProfile_unauthenticated_returns401() throws Exception {
        mockMvc.perform(get("/api/v1/portal/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /portal/register validates blank fullName with 400")
    void register_blankName_returns400() throws Exception {
        Map<String, String> payload = Map.of(
                "fullName", "",
                "email",    "valid@example.com",
                "phone",    "+201012345678",
                "password", "ValidPass1!"
        );
        mockMvc.perform(post("/api/v1/portal/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isBadRequest());
    }
}

package com.parkpulse.controller;

import java.math.BigDecimal;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.parkpulse.domain.PassType;
import com.parkpulse.domain.PaymentMethod;
import com.parkpulse.domain.RideCategory;
import com.parkpulse.dto.Dtos.*;
import com.parkpulse.dto.Dtos.CreateCustomerRequest;
import com.parkpulse.dto.Dtos.CreateRideRequest;
import com.parkpulse.dto.Dtos.IssueTicketRequest;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class ParkOperationsIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @Test
    @DisplayName("Unauthenticated request to protected endpoint returns 403 Forbidden")
    void accessProtectedEndpoint_Unauthenticated_Returns403() throws Exception {
        mockMvc.perform(get("/api/v1/customers"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "khaled.cashier@parkpulse.com", roles = "CASHIER")
    @DisplayName("RBAC: Cashier cannot create a new ride (403 Forbidden)")
    void createRide_AsCashier_Returns403() throws Exception {
        CreateRideRequest req = new CreateRideRequest(
                "Sky Drop", RideCategory.ROLLER_COASTER, 20, 12, new BigDecimal("1.30"), "Drop tower");

        mockMvc.perform(post("/api/v1/rides")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "omar.manager@parkpulse.com", roles = "MANAGER")
    @DisplayName("Validation: Registering customer with invalid phone & negative deposit returns RFC 7807 400")
    void registerCustomer_InvalidInput_ReturnsProblemDetail() throws Exception {
        CreateCustomerRequest invalid = new CreateCustomerRequest(
                "A", "bad-email", "123", new BigDecimal("-10.00"));

        mockMvc.perform(post("/api/v1/customers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Validation Error"))
                .andExpect(jsonPath("$.errors.email").exists())
                .andExpect(jsonPath("$.errors.phone").exists())
                .andExpect(jsonPath("$.errors.initialDeposit").exists());
    }

    @Test
    @WithMockUser(username = "khaled.cashier@parkpulse.com", roles = "CASHIER")
    @DisplayName("End-to-End API Flow: Register customer -> Top-up -> Issue Ticket")
    void fullPosJourney_Success() throws Exception {
        CreateCustomerRequest newCust = new CreateCustomerRequest(
                "Hagar Mahmoud", "hagar@parkpulse.com", "01012345678", new BigDecimal("50.00"));

        String createdJson = mockMvc.perform(post("/api/v1/customers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newCust)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.wristbandBalance").value(50.00))
                .andReturn().getResponse().getContentAsString();

        Long customerId = objectMapper.readTree(createdJson).get("id").asLong();

        // Issue Regular Ticket ($50) paid via Wristband -> balance becomes $0.00
        IssueTicketRequest ticketReq = new IssueTicketRequest(
                customerId, PassType.REGULAR, PaymentMethod.WRISTBAND, null);

        mockMvc.perform(post("/api/v1/pos/tickets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(ticketReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.updatedBalance").value(0.00))
                .andExpect(jsonPath("$.updatedLoyaltyPoints").value(15));
    }
}
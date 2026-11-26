package com.parkpulse.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.parkpulse.domain.PassType;
import com.parkpulse.domain.PaymentMethod;
import com.parkpulse.domain.RideCategory;
import com.parkpulse.domain.Role;
import com.parkpulse.dto.AuthDtos.LoginRequest;
import com.parkpulse.dto.CustomerDtos.CreateCustomerRequest;
import com.parkpulse.dto.PosDtos.*;
import com.parkpulse.dto.RideDtos.BoardRideRequest;
import com.parkpulse.dto.RideDtos.CreateRideRequest;
import com.parkpulse.dto.RideDtos.ToggleMaintenanceRequest;
import com.parkpulse.dto.StaffDtos.CreateStaffRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class ParkOperationsIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    private String loginAndGetToken(String email, String password) throws Exception {
        String response = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(email, password))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response).get("token").asText();
    }

    @Test
    @DisplayName("Auth: Unauthenticated & invalid Bearer token return RFC 7807 401 Unauthorized")
    void unauthenticatedAndInvalidToken_Returns401() throws Exception {
        mockMvc.perform(get("/api/v1/customers"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.title").value("Unauthorized"));

        mockMvc.perform(get("/api/v1/customers")
                        .header("Authorization", "Bearer invalid.token.value"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("omar.manager@parkpulse.com", "WrongPass"))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.title").value("Authentication Failed"));
    }

    @Test
    @DisplayName("RBAC: Role boundaries enforced across Manager, Cashier, and Ride Operator")
    void rbacBoundaries_Enforced() throws Exception {
        String cashierToken = loginAndGetToken("khaled.cashier@parkpulse.com", "Pass@1234");
        String operatorToken = loginAndGetToken("ahmed.operator@parkpulse.com", "Pass@1234");

        // Cashier cannot create rides, view staff, or create offers
        CreateRideRequest rideReq = new CreateRideRequest(
                "Sky Drop", RideCategory.ROLLER_COASTER, 20, 12, new BigDecimal("1.30"), "Drop tower");
        mockMvc.perform(post("/api/v1/rides")
                        .header("Authorization", "Bearer " + cashierToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(rideReq)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.title").value("Access Denied"));

        mockMvc.perform(get("/api/v1/staff")
                        .header("Authorization", "Bearer " + cashierToken))
                .andExpect(status().isForbidden());

        // Ride Operator cannot access customer wallets or POS endpoints
        mockMvc.perform(get("/api/v1/customers")
                        .header("Authorization", "Bearer " + operatorToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/v1/pos/topup")
                        .header("Authorization", "Bearer " + operatorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new TopUpRequest(1L, new BigDecimal("20.00")))))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("BVA Validation: Invalid customer inputs return RFC 7807 400 with field errors")
    void registerCustomer_BoundaryValidation_Returns400() throws Exception {
        String managerToken = loginAndGetToken("omar.manager@parkpulse.com", "Pass@1234");

        CreateCustomerRequest invalid = new CreateCustomerRequest(
                "A", "bad-email", "1234567", new BigDecimal("-0.01"));

        mockMvc.perform(post("/api/v1/customers")
                        .header("Authorization", "Bearer " + managerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Validation Error"))
                .andExpect(jsonPath("$.errors.fullName").exists())
                .andExpect(jsonPath("$.errors.email").exists())
                .andExpect(jsonPath("$.errors.phone").exists())
                .andExpect(jsonPath("$.errors.initialDeposit").exists());
    }

    @Test
    @DisplayName("Full E2E API Flow: Register -> TopUp -> Ticket + Receipt -> Food Order -> Loyalty -> Ride Boarding")
    void fullParkOperationsJourney_Success() throws Exception {
        String cashierToken = loginAndGetToken("khaled.cashier@parkpulse.com", "Pass@1234");
        String operatorToken = loginAndGetToken("ahmed.operator@parkpulse.com", "Pass@1234");

        // 1. Register customer with $50.00 deposit (gets 10 welcome points)
        CreateCustomerRequest newCust = new CreateCustomerRequest(
                "Hagar Mahmoud", "hagar@parkpulse.com", "01012345678", new BigDecimal("50.00"));
        String createdJson = mockMvc.perform(post("/api/v1/customers")
                        .header("Authorization", "Bearer " + cashierToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newCust)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.wristbandBalance").value(50.00))
                .andExpect(jsonPath("$.loyaltyPoints").value(10))
                .andReturn().getResponse().getContentAsString();

        Long customerId = objectMapper.readTree(createdJson).get("id").asLong();

        // 2. Top-up $1000.00 (earns 50 points -> total 60 pts, balance $1050.00)
        mockMvc.perform(post("/api/v1/pos/topup")
                        .header("Authorization", "Bearer " + cashierToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new TopUpRequest(customerId, new BigDecimal("1000.00")))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.updatedBalance").value(1050.00))
                .andExpect(jsonPath("$.updatedLoyaltyPoints").value(60));

        // 3. Issue VIP FastPass ($75) with SUMMER20 (20% off = $60) via Wristband -> balance $990, +6 pts = 66 pts
        String ticketTxJson = mockMvc.perform(post("/api/v1/pos/tickets")
                        .header("Authorization", "Bearer " + cashierToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new IssueTicketRequest(customerId, PassType.VIP_FASTPASS, PaymentMethod.WRISTBAND, "SUMMER20"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.netAmount").value(60.00))
                .andExpect(jsonPath("$.updatedBalance").value(990.00))
                .andExpect(jsonPath("$.ticketCode", startsWith("PKP-")))
                .andReturn().getResponse().getContentAsString();

        JsonNode ticketTxNode = objectMapper.readTree(ticketTxJson);
        Long ticketTxId = ticketTxNode.get("id").asLong();
        String ticketCode = ticketTxNode.get("ticketCode").asText();

        // 4. Verify Receipt & Customer Detail show persisted Ticket
        mockMvc.perform(get("/api/v1/pos/transactions/{id}/receipt", ticketTxId)
                        .header("Authorization", "Bearer " + cashierToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ticket.ticketCode").value(ticketCode))
                .andExpect(jsonPath("$.ticket.status").value("ACTIVE"));

        // 5. Food Order Checkout ($150 * 4 = $600 -> +40 pts -> 106 pts)
        String foodTxJson = mockMvc.perform(post("/api/v1/pos/food-orders")
                        .header("Authorization", "Bearer " + cashierToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new FoodCheckoutRequest(customerId, PaymentMethod.WRISTBAND, null,
                                        List.of(new OrderLineRequest(1L, 4))))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.netAmount").value(600.00))
                .andExpect(jsonPath("$.updatedLoyaltyPoints").value(106))
                .andReturn().getResponse().getContentAsString();

        Long foodTxId = objectMapper.readTree(foodTxJson).get("id").asLong();
        mockMvc.perform(get("/api/v1/pos/transactions/{id}/receipt", foodTxId)
                        .header("Authorization", "Bearer " + cashierToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.foodItems", hasSize(1)))
                .andExpect(jsonPath("$.foodItems[0].quantity").value(4));

        // 6. Redeem 100 Loyalty Points -> +$10.00 wristband credit ($390 + $10 = $400), 6 pts left
        mockMvc.perform(post("/api/v1/pos/loyalty/redeem")
                        .header("Authorization", "Bearer " + cashierToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoyaltyRedeemRequest(customerId, 100))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.creditAmount").value(10.00))
                .andExpect(jsonPath("$.updatedBalance").value(400.00))
                .andExpect(jsonPath("$.remainingPoints").value(6));

        // 7. Ride Operator validates safety & boards guest on Thunder Coaster (id=1, minAge=14, minHeight=1.40)
        mockMvc.perform(post("/api/v1/rides/1/board")
                        .header("Authorization", "Bearer " + operatorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new BoardRideRequest(ticketCode, 13, new BigDecimal("1.50")))))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.detail", containsString("Minimum age")));

        mockMvc.perform(post("/api/v1/rides/1/board")
                        .header("Authorization", "Bearer " + operatorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new BoardRideRequest(ticketCode, 14, new BigDecimal("1.40")))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.ticketCode").value(ticketCode));

        // 8. Toggle maintenance with reason and verify boarding is blocked
        mockMvc.perform(patch("/api/v1/rides/1/maintenance")
                        .header("Authorization", "Bearer " + operatorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ToggleMaintenanceRequest("Brake sensor check"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.operational").value(false))
                .andExpect(jsonPath("$.maintenanceReason").value("Brake sensor check"));

        mockMvc.perform(post("/api/v1/rides/1/board")
                        .header("Authorization", "Bearer " + operatorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new BoardRideRequest(ticketCode, 20, new BigDecimal("1.80")))))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.detail", containsString("maintenance")));
    }

    @Test
    @DisplayName("Manager Governance: Create Staff, Create Offer, Toggle Menu Availability & Dashboard Metrics")
    void managerGovernance_AndPersonalDashboard() throws Exception {
        String managerToken = loginAndGetToken("omar.manager@parkpulse.com", "Pass@1234");

        // Create staff member & verify login works with new account
        CreateStaffRequest newStaff = new CreateStaffRequest(
                "Nour Cashier", "nour.cashier@parkpulse.com", "Strong@123", "01055556666",
                Role.CASHIER, "Food Court POS #2", null, new BigDecimal("5200.00"));
        mockMvc.perform(post("/api/v1/staff")
                        .header("Authorization", "Bearer " + managerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newStaff)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("nour.cashier@parkpulse.com"));

        String nourToken = loginAndGetToken("nour.cashier@parkpulse.com", "Strong@123");
        mockMvc.perform(get("/api/v1/dashboard")
                        .header("Authorization", "Bearer " + nourToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalRevenue").value(nullValue()))
                .andExpect(jsonPath("$.assignedStation").value("Food Court POS #2"));

        // Create Offer & Toggle Menu Item
        mockMvc.perform(post("/api/v1/pos/offers")
                        .header("Authorization", "Bearer " + managerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateOfferRequest("FALL25", "Autumn Promo", 25, new BigDecimal("40.00")))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value("FALL25"));

        mockMvc.perform(patch("/api/v1/menu/1/availability")
                        .header("Authorization", "Bearer " + managerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available").value(false));
    }
}

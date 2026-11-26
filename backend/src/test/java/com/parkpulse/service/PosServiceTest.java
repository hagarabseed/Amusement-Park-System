package com.parkpulse.service;

import com.parkpulse.domain.*;
import com.parkpulse.dto.PosDtos.*;
import com.parkpulse.exception.BusinessRuleException;
import com.parkpulse.exception.ResourceNotFoundException;
import com.parkpulse.repository.*;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PosServiceTest {

    @Mock private CustomerService customerService;
    @Mock private OfferRepository offerRepository;
    @Mock private MenuItemRepository menuItemRepository;
    @Mock private ParkTransactionRepository txRepository;
    @Mock private TicketRepository ticketRepository;
    @Mock private FoodOrderRepository foodOrderRepository;
    @Mock private LoyaltyRedemptionRepository loyaltyRedemptionRepository;
    @Mock private StaffUserRepository staffUserRepository;
    @Mock private AuditService auditService;

    @InjectMocks private PosService posService;

    private Customer sampleCustomer;
    private StaffUser cashier;

    @BeforeEach
    void setUp() {
        sampleCustomer = new Customer();
        sampleCustomer.setId(1L);
        sampleCustomer.setFullName("Sara Mahmoud");
        sampleCustomer.setWristbandBalance(new BigDecimal("100.00"));
        sampleCustomer.setLoyaltyPoints(120);

        cashier = new StaffUser();
        cashier.setId(2L);
        cashier.setEmail("khaled.cashier@parkpulse.com");
        cashier.setRole(Role.CASHIER);

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("khaled.cashier@parkpulse.com", null));

        lenient().when(staffUserRepository.findByEmailIgnoreCase("khaled.cashier@parkpulse.com"))
                .thenReturn(Optional.of(cashier));
        lenient().when(txRepository.save(any(ParkTransaction.class))).thenAnswer(inv -> inv.getArgument(0));
        lenient().when(ticketRepository.save(any(Ticket.class))).thenAnswer(inv -> inv.getArgument(0));
        lenient().when(foodOrderRepository.save(any(FoodOrder.class))).thenAnswer(inv -> inv.getArgument(0));
        lenient().when(loyaltyRedemptionRepository.save(any(LoyaltyRedemption.class)))
                .thenAnswer(inv -> inv.getArgument(0));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("Issue ticket with wristband and active promo deducts net amount, persists Ticket, and awards points")
    void issueTicket_WithWristbandAndPromo_Success() {
        Offer summerOffer = new Offer();
        summerOffer.setCode("SUMMER20");
        summerOffer.setDiscountPercent(20);
        summerOffer.setMinSpend(BigDecimal.ZERO);

        when(customerService.getCustomerEntity(1L)).thenReturn(sampleCustomer);
        when(offerRepository.findByCodeIgnoreCaseAndActiveTrue("SUMMER20")).thenReturn(Optional.of(summerOffer));

        TransactionResponse res = posService.issueTicket(
                new IssueTicketRequest(1L, PassType.REGULAR, PaymentMethod.WRISTBAND, "SUMMER20"));

        assertEquals(new BigDecimal("40.00"), res.netAmount());
        assertEquals(new BigDecimal("60.00"), sampleCustomer.getWristbandBalance());
        assertEquals(124, sampleCustomer.getLoyaltyPoints());
        assertNotNull(res.ticketCode());
        assertTrue(res.ticketCode().startsWith("PKP-"));
        verify(ticketRepository).save(any(Ticket.class));
        verify(auditService).record(eq("TICKET_ISSUED"), eq("TICKET"), any(), any());
    }

    @Test
    @DisplayName("Issue ticket fails with BusinessRuleException when wristband balance is insufficient")
    void issueTicket_InsufficientBalance_ThrowsException() {
        when(customerService.getCustomerEntity(1L)).thenReturn(sampleCustomer);

        BusinessRuleException ex = assertThrows(BusinessRuleException.class, () ->
                posService.issueTicket(new IssueTicketRequest(1L, PassType.FAMILY, PaymentMethod.WRISTBAND, null)));

        assertTrue(ex.getMessage().contains("Insufficient wristband balance"));
        assertEquals(new BigDecimal("100.00"), sampleCustomer.getWristbandBalance());
        verify(txRepository, never()).save(any());
        verify(ticketRepository, never()).save(any());
    }

    @Test
    @DisplayName("Promo code rejects order below minSpend boundary")
    void validatePromo_BelowMinSpend_ThrowsException() {
        Offer vipOffer = new Offer();
        vipOffer.setCode("VIP10");
        vipOffer.setDiscountPercent(10);
        vipOffer.setMinSpend(new BigDecimal("50.00"));
        vipOffer.setActive(true);

        when(offerRepository.findByCodeIgnoreCaseAndActiveTrue("VIP10")).thenReturn(Optional.of(vipOffer));

        BusinessRuleException ex = assertThrows(BusinessRuleException.class, () ->
                posService.validatePromo("VIP10", new BigDecimal("49.99")));

        assertTrue(ex.getMessage().contains("requires minimum spend"));
    }

    @Test
    @DisplayName("Expired promo code is rejected")
    void validatePromo_Expired_ThrowsException() {
        Offer expired = new Offer();
        expired.setCode("OLD20");
        expired.setDiscountPercent(20);
        expired.setExpiresAt(LocalDateTime.now().minusDays(1));
        expired.setActive(true);

        when(offerRepository.findByCodeIgnoreCaseAndActiveTrue("OLD20")).thenReturn(Optional.of(expired));

        BusinessRuleException ex = assertThrows(BusinessRuleException.class, () ->
                posService.validatePromo("OLD20", new BigDecimal("100.00")));

        assertTrue(ex.getMessage().contains("expired"));
    }

    @Test
    @DisplayName("Top-up awards 1 point per $20 (BVA: $19.99 -> 0 pts, $50.00 -> 2 pts)")
    void topUpWristband_BoundaryPoints() {
        when(customerService.getCustomerEntity(1L)).thenReturn(sampleCustomer);

        TransactionResponse low = posService.topUpWristband(new TopUpRequest(1L, new BigDecimal("19.99")));
        assertEquals(0, low.pointsEarned());

        TransactionResponse mid = posService.topUpWristband(new TopUpRequest(1L, new BigDecimal("50.00")));
        assertEquals(2, mid.pointsEarned());
        assertEquals(new BigDecimal("169.99"), mid.updatedBalance());
    }

    @Test
    @DisplayName("Food checkout persists FoodOrder with items and rejects unavailable menu items")
    void checkoutFoodOrder_SuccessAndUnavailableRejection() {
        MenuItem burger = new MenuItem();
        burger.setId(1L);
        burger.setName("Burger Meal");
        burger.setPrice(new BigDecimal("40.00"));
        burger.setAvailable(true);

        when(customerService.getCustomerEntity(1L)).thenReturn(sampleCustomer);
        when(menuItemRepository.findById(1L)).thenReturn(Optional.of(burger));

        TransactionResponse res = posService.checkoutFoodOrder(
                new FoodCheckoutRequest(1L, PaymentMethod.WRISTBAND, null, List.of(new OrderLineRequest(1L, 2))));

        assertEquals(new BigDecimal("80.00"), res.netAmount());
        assertEquals(new BigDecimal("20.00"), sampleCustomer.getWristbandBalance());
        verify(foodOrderRepository).save(any(FoodOrder.class));

        burger.setAvailable(false);
        assertThrows(BusinessRuleException.class, () ->
                posService.checkoutFoodOrder(
                        new FoodCheckoutRequest(1L, PaymentMethod.CASH, null, List.of(new OrderLineRequest(1L, 1)))));
    }

    @Test
    @DisplayName("Food checkout throws ResourceNotFoundException for unknown menu item")
    void checkoutFoodOrder_UnknownItem_ThrowsNotFound() {
        when(customerService.getCustomerEntity(1L)).thenReturn(sampleCustomer);
        when(menuItemRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                posService.checkoutFoodOrder(
                        new FoodCheckoutRequest(1L, PaymentMethod.CASH, null, List.of(new OrderLineRequest(999L, 1)))));
    }

    @Test
    @DisplayName("Loyalty redemption converts multiples of 100 points to $10 wristband credit and rejects non-multiples")
    void redeemLoyaltyPoints_ValidAndInvalidCases() {
        when(customerService.getCustomerEntity(1L)).thenReturn(sampleCustomer);

        // Non-multiple rejected
        assertThrows(BusinessRuleException.class, () ->
                posService.redeemLoyaltyPoints(new LoyaltyRedeemRequest(1L, 150)));

        // Insufficient points rejected (has 120, requests 200)
        assertThrows(BusinessRuleException.class, () ->
                posService.redeemLoyaltyPoints(new LoyaltyRedeemRequest(1L, 200)));

        // Valid 100 points -> +$10.00 balance, 20 points remaining
        LoyaltyRedeemResponse ok = posService.redeemLoyaltyPoints(new LoyaltyRedeemRequest(1L, 100));
        assertEquals(new BigDecimal("10.00"), ok.creditAmount());
        assertEquals(new BigDecimal("110.00"), ok.updatedBalance());
        assertEquals(20, ok.remainingPoints());
    }
}

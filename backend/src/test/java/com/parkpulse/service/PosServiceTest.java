package com.parkpulse.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.parkpulse.domain.Customer;
import com.parkpulse.domain.MenuItem;
import com.parkpulse.domain.Offer;
import com.parkpulse.domain.ParkTransaction;
import com.parkpulse.domain.PassType;
import com.parkpulse.domain.PaymentMethod;
import com.parkpulse.dto.Dtos.*;
import com.parkpulse.dto.Dtos.FoodCheckoutRequest;
import com.parkpulse.dto.Dtos.IssueTicketRequest;
import com.parkpulse.dto.Dtos.OrderLineRequest;
import com.parkpulse.dto.Dtos.TopUpRequest;
import com.parkpulse.dto.Dtos.TransactionResponse;
import com.parkpulse.exception.BusinessRuleException;
import com.parkpulse.repository.MenuItemRepository;
import com.parkpulse.repository.OfferRepository;
import com.parkpulse.repository.ParkTransactionRepository;

@ExtendWith(MockitoExtension.class)
class PosServiceTest {

    @Mock private CustomerService customerService;
    @Mock private OfferRepository offerRepository;
    @Mock private MenuItemRepository menuItemRepository;
    @Mock private ParkTransactionRepository txRepository;
    @Mock private AuditService auditService;

    @InjectMocks private PosService posService;

    private Customer sampleCustomer;

    @BeforeEach
    void setUp() {
        sampleCustomer = new Customer();
        sampleCustomer.setId(1L);
        sampleCustomer.setFullName("Sara Mahmoud");
        sampleCustomer.setWristbandBalance(new BigDecimal("100.00"));
        sampleCustomer.setLoyaltyPoints(10);

        lenient().when(txRepository.save(any(ParkTransaction.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    @Test
    @DisplayName("Should deduct wristband balance and award loyalty points on valid ticket purchase")
    void issueTicket_WithWristbandAndPromo_Success() {
        Offer summerOffer = new Offer();
        summerOffer.setCode("SUMMER20");
        summerOffer.setDiscountPercent(20);

        when(customerService.getCustomerEntity(1L)).thenReturn(sampleCustomer);
        when(offerRepository.findByCodeIgnoreCaseAndActiveTrue("SUMMER20")).thenReturn(Optional.of(summerOffer));

        // Regular Pass = $50.00, 20% off -> $40.00 net, 4 loyalty points
        TransactionResponse res = posService.issueTicket(
                new IssueTicketRequest(1L, PassType.REGULAR, PaymentMethod.WRISTBAND, "SUMMER20"));

        assertEquals(new BigDecimal("40.00"), res.netAmount());
        assertEquals(new BigDecimal("60.00"), sampleCustomer.getWristbandBalance());
        assertEquals(14, sampleCustomer.getLoyaltyPoints());
        verify(auditService).record(eq("TICKET_ISSUED"), eq("TICKET"), any(), any());
    }

    @Test
    @DisplayName("Should throw BusinessRuleException when wristband balance is insufficient")
    void issueTicket_InsufficientBalance_ThrowsException() {
        when(customerService.getCustomerEntity(1L)).thenReturn(sampleCustomer);

        // Family Pass = $160.00 > $100.00 balance
        BusinessRuleException ex = assertThrows(BusinessRuleException.class, () ->
                posService.issueTicket(new IssueTicketRequest(1L, PassType.FAMILY, PaymentMethod.WRISTBAND, null)));

        assertTrue(ex.getMessage().contains("Insufficient wristband balance"));
        assertEquals(new BigDecimal("100.00"), sampleCustomer.getWristbandBalance());
        verify(txRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should credit wristband balance and award 1 point per $20 on top-up")
    void topUpWristband_Success() {
        when(customerService.getCustomerEntity(1L)).thenReturn(sampleCustomer);

        TransactionResponse res = posService.topUpWristband(new TopUpRequest(1L, new BigDecimal("50.00")));

        assertEquals(new BigDecimal("150.00"), res.updatedBalance());
        assertEquals(12, res.updatedLoyaltyPoints()); // 10 + (50 / 20)
    }

    @Test
    @DisplayName("Should calculate multi-item food cart total and deduct from wristband")
    void checkoutFoodOrder_Success() {
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
        assertEquals(15, sampleCustomer.getLoyaltyPoints()); // 10 + (80 / 15)
    }
}
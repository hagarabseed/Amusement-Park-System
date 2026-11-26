package com.parkpulse.service;

import com.parkpulse.domain.Customer;
import com.parkpulse.dto.CustomerDtos.CreateCustomerRequest;
import com.parkpulse.dto.CustomerDtos.CustomerResponse;
import com.parkpulse.exception.BusinessRuleException;
import com.parkpulse.exception.ResourceNotFoundException;
import com.parkpulse.repository.CustomerRepository;
import com.parkpulse.repository.ParkTransactionRepository;
import com.parkpulse.repository.TicketRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomerServiceTest {

    @Mock private CustomerRepository customerRepository;
    @Mock private TicketRepository ticketRepository;
    @Mock private ParkTransactionRepository txRepository;
    @Mock private AuditService auditService;

    @InjectMocks private CustomerService customerService;

    @Test
    @DisplayName("Register customer normalizes email, sets welcome points, and records audit log")
    void registerCustomer_Success() {
        when(customerRepository.existsByEmailIgnoreCase("sara@park.com")).thenReturn(false);
        when(customerRepository.existsByPhone("01012345678")).thenReturn(false);
        when(customerRepository.save(any(Customer.class))).thenAnswer(inv -> {
            Customer c = inv.getArgument(0);
            c.setId(42L);
            return c;
        });

        CustomerResponse res = customerService.registerCustomer(
                new CreateCustomerRequest("  Sara Ali ", "Sara@Park.com ", "01012345678", new BigDecimal("0.00")));

        assertEquals(42L, res.id());
        assertEquals("Sara Ali", res.fullName());
        assertEquals("sara@park.com", res.email());
        assertEquals(10, res.loyaltyPoints());
        assertEquals(new BigDecimal("0.00"), res.wristbandBalance());
        verify(auditService).record(eq("CUSTOMER_REGISTERED"), eq("CUSTOMER"), eq("42"), any());
    }

    @Test
    @DisplayName("Register customer rejects duplicate email and duplicate phone")
    void registerCustomer_Duplicates_ThrowBusinessRuleException() {
        when(customerRepository.existsByEmailIgnoreCase("dup@park.com")).thenReturn(true);

        assertThrows(BusinessRuleException.class, () ->
                customerService.registerCustomer(
                        new CreateCustomerRequest("Test", "dup@park.com", "01012345678", BigDecimal.TEN)));

        when(customerRepository.existsByEmailIgnoreCase("ok@park.com")).thenReturn(false);
        when(customerRepository.existsByPhone("01012345678")).thenReturn(true);

        assertThrows(BusinessRuleException.class, () ->
                customerService.registerCustomer(
                        new CreateCustomerRequest("Test", "ok@park.com", "01012345678", BigDecimal.TEN)));
    }

    @Test
    @DisplayName("Get missing customer throws ResourceNotFoundException")
    void getCustomerEntity_NotFound() {
        when(customerRepository.findById(999L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> customerService.getCustomerEntity(999L));
    }
}

package com.parkpulse.service;

import com.parkpulse.domain.*;
import com.parkpulse.dto.RideDtos.BoardRideRequest;
import com.parkpulse.dto.RideDtos.RideBoardingResponse;
import com.parkpulse.exception.BusinessRuleException;
import com.parkpulse.repository.RideBoardingRepository;
import com.parkpulse.repository.RideRepository;
import com.parkpulse.repository.StaffUserRepository;
import com.parkpulse.repository.TicketRepository;
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
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RideServiceTest {

    @Mock private RideRepository rideRepository;
    @Mock private TicketRepository ticketRepository;
    @Mock private RideBoardingRepository boardingRepository;
    @Mock private StaffUserRepository staffUserRepository;
    @Mock private AuditService auditService;

    @InjectMocks private RideService rideService;

    private Ride coaster;
    private Ticket activeTicket;
    private StaffUser operator;

    @BeforeEach
    void setUp() {
        coaster = new Ride();
        coaster.setId(1L);
        coaster.setName("Thunder Coaster");
        coaster.setCategory(RideCategory.ROLLER_COASTER);
        coaster.setCapacity(24);
        coaster.setMinAge(14);
        coaster.setMinHeightM(new BigDecimal("1.40"));
        coaster.setNeedMaintenance(false);

        Customer customer = new Customer();
        customer.setId(1L);
        customer.setFullName("Sara Mahmoud");

        activeTicket = new Ticket();
        activeTicket.setTicketCode("PKP-ABC123");
        activeTicket.setCustomer(customer);
        activeTicket.setPassType(PassType.VIP_FASTPASS);
        activeTicket.setStatus(TicketStatus.ACTIVE);
        activeTicket.setValidDate(LocalDate.now());

        operator = new StaffUser();
        operator.setId(3L);
        operator.setEmail("ahmed.operator@parkpulse.com");
        operator.setRole(Role.RIDE_OPERATOR);

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("ahmed.operator@parkpulse.com", null));

        lenient().when(rideRepository.findById(1L)).thenReturn(Optional.of(coaster));
        lenient().when(ticketRepository.findByTicketCodeIgnoreCase("PKP-ABC123")).thenReturn(Optional.of(activeTicket));
        lenient().when(staffUserRepository.findByEmailIgnoreCase("ahmed.operator@parkpulse.com"))
                .thenReturn(Optional.of(operator));
        lenient().when(boardingRepository.save(any(RideBoarding.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("BVA: Boarding succeeds at exact minimum age (14) and height (1.40m) boundaries")
    void boardGuest_ExactMinBoundary_Success() {
        RideBoardingResponse res = rideService.boardGuest(1L,
                new BoardRideRequest("PKP-ABC123", 14, new BigDecimal("1.40")));

        assertEquals("Thunder Coaster", res.rideName());
        assertEquals(1, activeTicket.getBoardingsCount());
        verify(boardingRepository).save(any(RideBoarding.class));
    }

    @Test
    @DisplayName("BVA: Boarding blocked when guest age is 13 (minAge - 1)")
    void boardGuest_BelowMinAge_Throws() {
        BusinessRuleException ex = assertThrows(BusinessRuleException.class, () ->
                rideService.boardGuest(1L, new BoardRideRequest("PKP-ABC123", 13, new BigDecimal("1.50"))));

        assertTrue(ex.getMessage().contains("Minimum age"));
        verify(boardingRepository, never()).save(any());
    }

    @Test
    @DisplayName("BVA: Boarding blocked when guest height is 1.39m (minHeightM - 0.01)")
    void boardGuest_BelowMinHeight_Throws() {
        BusinessRuleException ex = assertThrows(BusinessRuleException.class, () ->
                rideService.boardGuest(1L, new BoardRideRequest("PKP-ABC123", 15, new BigDecimal("1.39"))));

        assertTrue(ex.getMessage().contains("Minimum height"));
        verify(boardingRepository, never()).save(any());
    }

    @Test
    @DisplayName("Boarding blocked when ride is under maintenance")
    void boardGuest_RideInMaintenance_Throws() {
        coaster.setNeedMaintenance(true);

        BusinessRuleException ex = assertThrows(BusinessRuleException.class, () ->
                rideService.boardGuest(1L, new BoardRideRequest("PKP-ABC123", 18, new BigDecimal("1.75"))));

        assertTrue(ex.getMessage().contains("maintenance"));
    }

    @Test
    @DisplayName("Boarding blocked for cancelled or expired ticket")
    void boardGuest_CancelledOrExpiredTicket_Throws() {
        activeTicket.setStatus(TicketStatus.CANCELLED);
        assertThrows(BusinessRuleException.class, () ->
                rideService.boardGuest(1L, new BoardRideRequest("PKP-ABC123", 18, new BigDecimal("1.75"))));

        activeTicket.setStatus(TicketStatus.ACTIVE);
        activeTicket.setValidDate(LocalDate.now().minusDays(1));
        assertThrows(BusinessRuleException.class, () ->
                rideService.boardGuest(1L, new BoardRideRequest("PKP-ABC123", 18, new BigDecimal("1.75"))));
    }
}

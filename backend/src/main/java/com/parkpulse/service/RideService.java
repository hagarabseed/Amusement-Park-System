package com.parkpulse.service;

import com.parkpulse.domain.*;
import com.parkpulse.dto.RideDtos.*;
import com.parkpulse.exception.BusinessRuleException;
import com.parkpulse.exception.ResourceNotFoundException;
import com.parkpulse.repository.RideBoardingRepository;
import com.parkpulse.repository.RideRepository;
import com.parkpulse.repository.StaffUserRepository;
import com.parkpulse.repository.TicketRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class RideService {
    private final RideRepository rideRepository;
    private final TicketRepository ticketRepository;
    private final RideBoardingRepository boardingRepository;
    private final StaffUserRepository staffUserRepository;
    private final AuditService auditService;

    public RideService(RideRepository rideRepository,
                       TicketRepository ticketRepository,
                       RideBoardingRepository boardingRepository,
                       StaffUserRepository staffUserRepository,
                       AuditService auditService) {
        this.rideRepository = rideRepository;
        this.ticketRepository = ticketRepository;
        this.boardingRepository = boardingRepository;
        this.staffUserRepository = staffUserRepository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public List<RideResponse> listRides(String search, RideCategory category) {
        List<Ride> rides = (search == null || search.isBlank())
                ? rideRepository.findAll()
                : rideRepository.findByNameContainingIgnoreCase(search.trim());
        return rides.stream()
                .filter(r -> category == null || r.getCategory() == category)
                .map(r -> RideResponse.from(r, boardingRepository.countByRideId(r.getId())))
                .toList();
    }

    @Transactional
    public RideResponse createRide(CreateRideRequest req) {
        String cleanName = req.name().trim();
        if (rideRepository.existsByNameIgnoreCase(cleanName)) {
            throw new BusinessRuleException("Ride already exists: " + cleanName);
        }
        Ride ride = new Ride();
        ride.setName(cleanName);
        ride.setCategory(req.category());
        ride.setCapacity(req.capacity());
        ride.setMinAge(req.minAge());
        ride.setMinHeightM(req.minHeightM());
        ride.setSpecificDetails(req.specificDetails() != null ? req.specificDetails().trim() : null);
        Ride saved = rideRepository.save(ride);

        auditService.record("RIDE_CREATED", "RIDE", String.valueOf(saved.getId()), "Added ride " + saved.getName());
        return RideResponse.from(saved, 0);
    }

    @Transactional
    public RideResponse toggleRideMaintenance(Long rideId, String reason) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found: " + rideId));
        boolean nextMaintenance = !ride.isNeedMaintenance();
        ride.setNeedMaintenance(nextMaintenance);
        if (nextMaintenance) {
            ride.setMaintenanceReason((reason != null && !reason.isBlank())
                    ? reason.trim()
                    : "Safety & mechanical inspection");
        } else {
            ride.setMaintenanceReason(null);
        }
        auditService.record("RIDE_MAINTENANCE_TOGGLED", "RIDE", String.valueOf(ride.getId()),
                ride.getName() + " operational=" + ride.isOperational()
                        + (ride.getMaintenanceReason() != null ? " (" + ride.getMaintenanceReason() + ")" : ""));
        return RideResponse.from(ride, boardingRepository.countByRideId(ride.getId()));
    }

    @Transactional
    public RideBoardingResponse boardGuest(Long rideId, BoardRideRequest req) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found: " + rideId));

        if (!ride.isOperational()) {
            throw new BusinessRuleException("Boarding blocked: " + ride.getName() + " is currently in maintenance.");
        }

        if (req.guestAge() < ride.getMinAge()) {
            throw new BusinessRuleException(String.format(
                    "Safety requirement not met: Minimum age for %s is %d years (guest is %d).",
                    ride.getName(), ride.getMinAge(), req.guestAge()));
        }

        if (req.guestHeightM().compareTo(ride.getMinHeightM()) < 0) {
            throw new BusinessRuleException(String.format(
                    "Safety requirement not met: Minimum height for %s is %.2fm (guest is %.2fm).",
                    ride.getName(), ride.getMinHeightM(), req.guestHeightM()));
        }

        Ticket ticket = ticketRepository.findByTicketCodeIgnoreCase(req.ticketCode().trim())
                .orElseThrow(() -> new ResourceNotFoundException("Ticket code not found: " + req.ticketCode()));

        if (ticket.getStatus() != TicketStatus.ACTIVE) {
            throw new BusinessRuleException("Ticket " + ticket.getTicketCode() + " is not active (" + ticket.getStatus() + ").");
        }
        if (ticket.getValidDate().isBefore(LocalDate.now())) {
            throw new BusinessRuleException("Ticket " + ticket.getTicketCode() + " has expired (valid date: " + ticket.getValidDate() + ").");
        }

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String operatorEmail = auth != null ? auth.getName() : null;
        StaffUser operator = staffUserRepository.findByEmailIgnoreCase(operatorEmail)
                .orElseThrow(() -> new BusinessRuleException("Authenticated staff operator required to dispatch ride."));

        ticket.recordBoarding();

        RideBoarding boarding = new RideBoarding();
        boarding.setRide(ride);
        boarding.setTicket(ticket);
        boarding.setOperator(operator);
        boarding.setGuestAge(req.guestAge());
        boarding.setGuestHeightM(req.guestHeightM());
        RideBoarding saved = boardingRepository.save(boarding);

        auditService.record("RIDE_BOARDING", "RIDE", String.valueOf(ride.getId()),
                "Admitted " + ticket.getTicketCode() + " on " + ride.getName());

        return RideBoardingResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<RideBoardingResponse> listRecentBoardings(Long rideId) {
        if (!rideRepository.existsById(rideId)) {
            throw new ResourceNotFoundException("Ride not found: " + rideId);
        }
        return boardingRepository.findTop20ByRideIdOrderByBoardedAtDesc(rideId)
                .stream().map(RideBoardingResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public TicketLookupResponse lookupTicket(String code) {
        Ticket ticket = ticketRepository.findByTicketCodeIgnoreCase(code.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Ticket code not found: " + code));
        return new TicketLookupResponse(
                ticket.getId(),
                ticket.getTicketCode(),
                ticket.getCustomer().getFullName(),
                ticket.getPassType(),
                ticket.getStatus(),
                ticket.getValidDate(),
                ticket.getBoardingsCount()
        );
    }
}

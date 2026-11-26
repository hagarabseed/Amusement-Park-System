package com.parkpulse.service;

import com.parkpulse.config.JwtService;
import com.parkpulse.domain.*;
import com.parkpulse.dto.CustomerPortalDtos.*;
import com.parkpulse.exception.BusinessRuleException;
import com.parkpulse.exception.ConflictException;
import com.parkpulse.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Handles customer self-service: registration, login, ticket booking, and profile retrieval.
 * Customers authenticate separately from staff. Their JWT carries ROLE_CUSTOMER.
 */
@Service
public class CustomerPortalService {

    private static final Logger log = LoggerFactory.getLogger(CustomerPortalService.class);
    private static final int WELCOME_POINTS = 10;

    private final CustomerAccountRepository accountRepo;
    private final CustomerRepository customerRepo;
    private final TicketRepository ticketRepo;
    private final ParkTransactionRepository txRepo;
    private final OfferRepository offerRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuditService auditService;

    public CustomerPortalService(CustomerAccountRepository accountRepo,
                                 CustomerRepository customerRepo,
                                 TicketRepository ticketRepo,
                                 ParkTransactionRepository txRepo,
                                 OfferRepository offerRepo,
                                 PasswordEncoder passwordEncoder,
                                 JwtService jwtService,
                                 AuditService auditService) {
        this.accountRepo = accountRepo;
        this.customerRepo = customerRepo;
        this.ticketRepo = ticketRepo;
        this.txRepo = txRepo;
        this.offerRepo = offerRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.auditService = auditService;
    }

    // ── Registration ──────────────────────────────────────────────────────────

    @Transactional
    public CustomerAuthResponse register(RegisterRequest req) {
        String email = req.email().trim().toLowerCase();
        String phone = req.phone().trim();

        if (accountRepo.existsByEmailIgnoreCase(email)) {
            throw new ConflictException("An account with this email already exists.");
        }
        if (accountRepo.existsByPhone(phone)) {
            throw new ConflictException("An account with this phone number already exists.");
        }

        // Create the wallet/loyalty profile
        Customer profile = new Customer();
        profile.setFullName(req.fullName().trim());
        profile.setEmail(email);
        profile.setPhone(phone);
        profile.setWristbandBalance(BigDecimal.ZERO);
        profile.setLoyaltyPoints(WELCOME_POINTS);
        Customer savedProfile = customerRepo.save(profile);

        // Create login credentials
        CustomerAccount account = new CustomerAccount();
        account.setCustomer(savedProfile);
        account.setEmail(email);
        account.setFullName(req.fullName().trim());
        account.setPhone(phone);
        account.setPasswordHash(passwordEncoder.encode(req.password()));
        CustomerAccount savedAccount = accountRepo.save(account);

        auditService.record("CUSTOMER_SELF_REGISTERED", "CUSTOMER_ACCOUNT",
                String.valueOf(savedAccount.getId()),
                "Customer portal registration for " + email);

        String token = jwtService.generateCustomerToken(savedAccount);
        log.info("Customer registered: {}", email);
        return new CustomerAuthResponse(token, savedAccount.getId(),
                savedProfile.getId(), savedProfile.getFullName(), email, "CUSTOMER");
    }

    // ── Login ─────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public CustomerAuthResponse login(String email, String rawPassword) {
        String normalizedEmail = email.trim().toLowerCase();
        CustomerAccount account = accountRepo.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> {
                    log.warn("Failed customer login attempt for unknown email: {}", normalizedEmail);
                    return new BadCredentialsException("Invalid credentials");
                });

        if (!passwordEncoder.matches(rawPassword, account.getPasswordHash())) {
            log.warn("Failed customer login (bad password) for: {}", normalizedEmail);
            throw new BadCredentialsException("Invalid credentials");
        }

        String token = jwtService.generateCustomerToken(account);
        Long customerId = account.getCustomer() != null ? account.getCustomer().getId() : null;
        log.info("Customer login succeeded: {}", normalizedEmail);
        return new CustomerAuthResponse(token, account.getId(), customerId,
                account.getFullName(), account.getEmail(), "CUSTOMER");
    }

    // ── Ticket booking ────────────────────────────────────────────────────────

    @Transactional
    public BookedTicketResponse bookTicket(String customerEmail, BookTicketRequest req) {
        CustomerAccount account = accountRepo.findByEmailIgnoreCase(customerEmail)
                .orElseThrow(() -> new BusinessRuleException("Customer account not found"));
        Customer customer = account.getCustomer();
        if (customer == null) {
            throw new BusinessRuleException("No wallet profile linked to this account. Contact support.");
        }

        BigDecimal gross = req.passType().getBasePrice();

        // Resolve optional promo code
        BigDecimal discount = BigDecimal.ZERO;
        Offer offer = null;
        if (req.promoCode() != null && !req.promoCode().isBlank()) {
            offer = offerRepo.findByCodeIgnoreCaseAndActiveTrue(req.promoCode().trim())
                    .orElseThrow(() -> new BusinessRuleException("Invalid or inactive promo code: " + req.promoCode()));
            if (offer.getMinSpend() != null && gross.compareTo(offer.getMinSpend()) < 0) {
                throw new BusinessRuleException(String.format(
                        "Promo code %s requires minimum spend of $%.2f", offer.getCode(), offer.getMinSpend()));
            }
            discount = gross.multiply(BigDecimal.valueOf(offer.getDiscountPercent()))
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        }
        BigDecimal net = gross.subtract(discount);

        PaymentMethod paymentMethod = PaymentMethod.CASH;
        if ("WRISTBAND".equalsIgnoreCase(req.paymentMethod())) {
            paymentMethod = PaymentMethod.WRISTBAND;
            if (customer.getWristbandBalance().compareTo(net) < 0) {
                throw new BusinessRuleException(String.format(
                        "Insufficient wristband balance. Required: $%.2f, Available: $%.2f",
                        net, customer.getWristbandBalance()));
            }
            customer.debitBalance(net);
        }

        int points = net.divide(BigDecimal.TEN, 0, RoundingMode.DOWN).intValue();
        customer.addLoyaltyPoints(points);

        ParkTransaction tx = new ParkTransaction();
        tx.setCustomer(customer);
        tx.setOffer(offer);
        tx.setTxType(TransactionType.TICKET);
        tx.setPaymentMethod(paymentMethod);
        tx.setGrossAmount(gross);
        tx.setDiscountAmount(discount);
        tx.setNetAmount(net);
        tx.setPointsEarned(points);
        tx.setReferenceNote(req.passType().name() + " Pass (Customer Portal)");
        ParkTransaction savedTx = txRepo.save(tx);

        Ticket ticket = new Ticket();
        ticket.setCustomer(customer);
        ticket.setTransaction(savedTx);
        ticket.setPassType(req.passType());
        ticket.setPricePaid(net);
        ticket.setTicketCode("PKP-" + UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase());
        ticket.setStatus(TicketStatus.ACTIVE);
        ticket.setValidDate(LocalDate.now());
        Ticket savedTicket = ticketRepo.save(ticket);

        auditService.record("CUSTOMER_PORTAL_TICKET", "TICKET", String.valueOf(savedTicket.getId()),
                req.passType() + " ticket booked online by " + customerEmail + " ($" + net + ")");

        return new BookedTicketResponse(
                savedTicket.getId(), savedTicket.getTicketCode(), savedTicket.getPassType(),
                savedTicket.getPricePaid(), gross, discount, net, points,
                savedTicket.getStatus(), savedTicket.getValidDate(), savedTicket.getIssuedAt());
    }

    // ── Profile ───────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public CustomerProfileResponse getMyProfile(String customerEmail) {
        CustomerAccount account = accountRepo.findByEmailIgnoreCase(customerEmail)
                .orElseThrow(() -> new BusinessRuleException("Account not found"));
        Customer customer = account.getCustomer();
        if (customer == null) {
            return new CustomerProfileResponse(null, account.getFullName(), account.getEmail(),
                    account.getPhone(), BigDecimal.ZERO, 0, List.of());
        }

        List<MyTicketDto> tickets = ticketRepo.findByCustomerIdOrderByIssuedAtDesc(customer.getId())
                .stream()
                .map(t -> new MyTicketDto(t.getId(), t.getTicketCode(), t.getPassType(),
                        t.getStatus(), t.getPricePaid(), t.getValidDate(),
                        t.getBoardingsCount(), t.getIssuedAt()))
                .toList();

        return new CustomerProfileResponse(customer.getId(), customer.getFullName(),
                customer.getEmail(), customer.getPhone(),
                customer.getWristbandBalance(), customer.getLoyaltyPoints(), tickets);
    }

    // ── Public pass catalog ───────────────────────────────────────────────────

    public List<PassOption> getPassCatalog() {
        return List.of(
                new PassOption(PassType.REGULAR, "Regular Day Pass",
                        "Full-day access to all standard attractions and park areas.",
                        PassType.REGULAR.getBasePrice(),
                        new String[]{"All-day park entry", "Access to 20+ rides", "Free map & guide"}),
                new PassOption(PassType.VIP_FASTPASS, "VIP FastPass",
                        "Skip the queues with priority boarding on every attraction.",
                        PassType.VIP_FASTPASS.getBasePrice(),
                        new String[]{"Everything in Regular", "Skip-the-line access", "Dedicated VIP lounge", "Welcome gift bag"}),
                new PassOption(PassType.FAMILY, "Family Bundle",
                        "Best value for groups of up to 4 — a perfect day out together.",
                        PassType.FAMILY.getBasePrice(),
                        new String[]{"Entry for up to 4 guests", "All-day access", "Family photo session", "Dining discount 15%"})
        );
    }
}

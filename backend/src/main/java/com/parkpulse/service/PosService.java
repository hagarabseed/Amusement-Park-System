package com.parkpulse.service;

import com.parkpulse.domain.*;
import com.parkpulse.dto.CustomerDtos.TicketSummary;
import com.parkpulse.dto.PosDtos.*;
import com.parkpulse.exception.BusinessRuleException;
import com.parkpulse.exception.ResourceNotFoundException;
import com.parkpulse.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class PosService {
    public static final int LOYALTY_BLOCK_POINTS = 100;
    public static final BigDecimal LOYALTY_BLOCK_CREDIT = new BigDecimal("10.00");

    private final CustomerService customerService;
    private final OfferRepository offerRepository;
    private final MenuItemRepository menuItemRepository;
    private final ParkTransactionRepository txRepository;
    private final TicketRepository ticketRepository;
    private final FoodOrderRepository foodOrderRepository;
    private final LoyaltyRedemptionRepository loyaltyRedemptionRepository;
    private final StaffUserRepository staffUserRepository;
    private final AuditService auditService;

    public PosService(CustomerService customerService,
                      OfferRepository offerRepository,
                      MenuItemRepository menuItemRepository,
                      ParkTransactionRepository txRepository,
                      TicketRepository ticketRepository,
                      FoodOrderRepository foodOrderRepository,
                      LoyaltyRedemptionRepository loyaltyRedemptionRepository,
                      StaffUserRepository staffUserRepository,
                      AuditService auditService) {
        this.customerService = customerService;
        this.offerRepository = offerRepository;
        this.menuItemRepository = menuItemRepository;
        this.txRepository = txRepository;
        this.ticketRepository = ticketRepository;
        this.foodOrderRepository = foodOrderRepository;
        this.loyaltyRedemptionRepository = loyaltyRedemptionRepository;
        this.staffUserRepository = staffUserRepository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public PosCatalogResponse getCatalog() {
        List<PassCatalogItem> passes = Arrays.stream(PassType.values())
                .map(pt -> new PassCatalogItem(pt, labelForPass(pt), pt.getBasePrice(), perksForPass(pt)))
                .toList();
        List<OfferResponse> offers = offerRepository.findByActiveTrueOrderByCodeAsc()
                .stream().map(OfferResponse::from).toList();
        return new PosCatalogResponse(passes, offers, LOYALTY_BLOCK_POINTS, LOYALTY_BLOCK_CREDIT);
    }

    @Transactional(readOnly = true)
    public PromoQuoteResponse validatePromo(String code, BigDecimal grossAmount) {
        if (grossAmount == null || grossAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessRuleException("Order amount must be positive to apply a promo code.");
        }
        Offer offer = resolveOffer(code, grossAmount);
        BigDecimal discount = calculateDiscount(grossAmount, offer);
        BigDecimal net = grossAmount.subtract(discount);
        return new PromoQuoteResponse(
                offer.getCode(),
                offer.getTitle(),
                offer.getDiscountPercent(),
                offer.getMinSpend(),
                grossAmount,
                discount,
                net
        );
    }

    @Transactional
    public TransactionResponse topUpWristband(TopUpRequest req) {
        Customer customer = customerService.getCustomerEntity(req.customerId());
        StaffUser actor = resolveCurrentStaff();
        customer.creditBalance(req.amount());

        int points = req.amount().divide(BigDecimal.valueOf(20), 0, RoundingMode.DOWN).intValue();
        customer.addLoyaltyPoints(points);

        ParkTransaction tx = new ParkTransaction();
        tx.setCustomer(customer);
        tx.setProcessedBy(actor);
        tx.setTxType(TransactionType.TOPUP);
        tx.setPaymentMethod(PaymentMethod.CASH);
        tx.setGrossAmount(req.amount());
        tx.setDiscountAmount(BigDecimal.ZERO);
        tx.setNetAmount(req.amount());
        tx.setPointsEarned(points);
        tx.setReferenceNote("RFID Wristband Top-Up");

        ParkTransaction saved = txRepository.save(tx);
        auditService.record("WRISTBAND_TOPUP", "CUSTOMER", String.valueOf(customer.getId()),
                "Topped up $" + req.amount() + " for " + customer.getFullName());

        return toResponse(saved, customer, null);
    }

    @Transactional
    public TransactionResponse issueTicket(IssueTicketRequest req) {
        Customer customer = customerService.getCustomerEntity(req.customerId());
        StaffUser actor = resolveCurrentStaff();
        BigDecimal gross = req.passType().getBasePrice();
        Offer offer = resolveOptionalOffer(req.promoCode(), gross);
        BigDecimal discount = calculateDiscount(gross, offer);
        BigDecimal net = gross.subtract(discount);

        if (req.paymentMethod() == PaymentMethod.WRISTBAND) {
            debitWristbandOrThrow(customer, net);
        }

        int points = net.divide(BigDecimal.TEN, 0, RoundingMode.DOWN).intValue();
        customer.addLoyaltyPoints(points);

        ParkTransaction tx = new ParkTransaction();
        tx.setCustomer(customer);
        tx.setOffer(offer);
        tx.setProcessedBy(actor);
        tx.setTxType(TransactionType.TICKET);
        tx.setPaymentMethod(req.paymentMethod());
        tx.setGrossAmount(gross);
        tx.setDiscountAmount(discount);
        tx.setNetAmount(net);
        tx.setPointsEarned(points);
        tx.setReferenceNote(req.passType().name() + " Pass");

        ParkTransaction savedTx = txRepository.save(tx);

        Ticket ticket = new Ticket();
        ticket.setCustomer(customer);
        ticket.setTransaction(savedTx);
        ticket.setPassType(req.passType());
        ticket.setPricePaid(net);
        ticket.setTicketCode(generateTicketCode());
        ticket.setStatus(TicketStatus.ACTIVE);
        ticket.setValidDate(LocalDate.now());
        Ticket savedTicket = ticketRepository.save(ticket);

        auditService.record("TICKET_ISSUED", "TICKET", String.valueOf(savedTicket.getId()),
                req.passType() + " (" + savedTicket.getTicketCode() + ") issued to " + customer.getFullName() + " ($" + net + ")");

        return toResponse(savedTx, customer, savedTicket.getTicketCode());
    }

    @Transactional
    public TransactionResponse checkoutFoodOrder(FoodCheckoutRequest req) {
        Customer customer = customerService.getCustomerEntity(req.customerId());
        StaffUser actor = resolveCurrentStaff();

        FoodOrder order = new FoodOrder();
        order.setCustomer(customer);

        BigDecimal gross = BigDecimal.ZERO;
        for (OrderLineRequest line : req.items()) {
            MenuItem item = menuItemRepository.findById(line.menuItemId())
                    .orElseThrow(() -> new ResourceNotFoundException("Menu item not found: " + line.menuItemId()));
            if (!item.isAvailable()) {
                throw new BusinessRuleException("Menu item is currently unavailable: " + item.getName());
            }
            BigDecimal lineTotal = item.getPrice().multiply(BigDecimal.valueOf(line.quantity()));
            gross = gross.add(lineTotal);

            FoodOrderItem orderItem = new FoodOrderItem();
            orderItem.setMenuItem(item);
            orderItem.setQuantity(line.quantity());
            orderItem.setUnitPrice(item.getPrice());
            order.addItem(orderItem);
        }

        Offer offer = resolveOptionalOffer(req.promoCode(), gross);
        BigDecimal discount = calculateDiscount(gross, offer);
        BigDecimal net = gross.subtract(discount);

        if (req.paymentMethod() == PaymentMethod.WRISTBAND) {
            debitWristbandOrThrow(customer, net);
        }

        int points = net.divide(BigDecimal.valueOf(15), 0, RoundingMode.DOWN).intValue();
        customer.addLoyaltyPoints(points);

        ParkTransaction tx = new ParkTransaction();
        tx.setCustomer(customer);
        tx.setOffer(offer);
        tx.setProcessedBy(actor);
        tx.setTxType(TransactionType.FOOD);
        tx.setPaymentMethod(req.paymentMethod());
        tx.setGrossAmount(gross);
        tx.setDiscountAmount(discount);
        tx.setNetAmount(net);
        tx.setPointsEarned(points);
        tx.setReferenceNote(req.items().size() + " food court item line(s)");

        ParkTransaction savedTx = txRepository.save(tx);

        order.setTransaction(savedTx);
        order.setTotalAmount(net);
        FoodOrder savedOrder = foodOrderRepository.save(order);

        auditService.record("FOOD_ORDER_CHECKOUT", "FOOD_ORDER", String.valueOf(savedOrder.getId()),
                "Food order #" + savedOrder.getId() + " for " + customer.getFullName() + " ($" + net + ")");

        return toResponse(savedTx, customer, null);
    }

    @Transactional
    public LoyaltyRedeemResponse redeemLoyaltyPoints(LoyaltyRedeemRequest req) {
        if (req.points() % LOYALTY_BLOCK_POINTS != 0) {
            throw new BusinessRuleException("Points must be redeemed in multiples of " + LOYALTY_BLOCK_POINTS);
        }
        Customer customer = customerService.getCustomerEntity(req.customerId());
        if (customer.getLoyaltyPoints() < req.points()) {
            throw new BusinessRuleException(String.format(
                    "Insufficient loyalty points. Requested: %d, Available: %d",
                    req.points(), customer.getLoyaltyPoints()));
        }
        StaffUser actor = resolveCurrentStaff();
        if (actor == null) {
            throw new BusinessRuleException("Authenticated staff context is required for loyalty redemption.");
        }

        int blocks = req.points() / LOYALTY_BLOCK_POINTS;
        BigDecimal credit = LOYALTY_BLOCK_CREDIT.multiply(BigDecimal.valueOf(blocks));

        customer.deductLoyaltyPoints(req.points());
        customer.creditBalance(credit);

        LoyaltyRedemption redemption = new LoyaltyRedemption();
        redemption.setCustomer(customer);
        redemption.setProcessedBy(actor);
        redemption.setPointsRedeemed(req.points());
        redemption.setCreditAmount(credit);
        LoyaltyRedemption saved = loyaltyRedemptionRepository.save(redemption);

        auditService.record("LOYALTY_REDEEMED", "CUSTOMER", String.valueOf(customer.getId()),
                "Redeemed " + req.points() + " pts for $" + credit + " wristband credit (" + customer.getFullName() + ")");

        return new LoyaltyRedeemResponse(
                saved.getId(),
                customer.getId(),
                customer.getFullName(),
                req.points(),
                credit,
                customer.getWristbandBalance(),
                customer.getLoyaltyPoints(),
                saved.getCreatedAt()
        );
    }

    @Transactional(readOnly = true)
    public List<OfferResponse> listAllOffers() {
        return offerRepository.findAll().stream().map(OfferResponse::from).toList();
    }

    @Transactional
    public OfferResponse createOffer(CreateOfferRequest req) {
        String normalizedCode = req.code().trim().toUpperCase();
        if (offerRepository.existsByCodeIgnoreCase(normalizedCode)) {
            throw new BusinessRuleException("Promo code already exists: " + normalizedCode);
        }
        Offer offer = new Offer();
        offer.setCode(normalizedCode);
        offer.setTitle(req.title().trim());
        offer.setDiscountPercent(req.discountPercent());
        offer.setMinSpend(req.minSpend());
        offer.setActive(true);
        Offer saved = offerRepository.save(offer);
        auditService.record("OFFER_CREATED", "OFFER", String.valueOf(saved.getId()),
                "Created promo code " + saved.getCode() + " (" + saved.getDiscountPercent() + "% off)");
        return OfferResponse.from(saved);
    }

    @Transactional
    public OfferResponse toggleOffer(Long id) {
        Offer offer = offerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Offer not found: " + id));
        offer.setActive(!offer.isActive());
        auditService.record("OFFER_TOGGLED", "OFFER", String.valueOf(offer.getId()),
                offer.getCode() + " active=" + offer.isActive());
        return OfferResponse.from(offer);
    }

    @Transactional
    public MenuItem toggleMenuItemAvailability(Long id) {
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found: " + id));
        item.setAvailable(!item.isAvailable());
        auditService.record("MENU_AVAILABILITY_TOGGLED", "MENU_ITEM", String.valueOf(item.getId()),
                item.getName() + " available=" + item.isAvailable());
        return item;
    }

    @Transactional(readOnly = true)
    public Page<TransactionResponse> listTransactions(TransactionType txType, Long customerId,
                                                      boolean mineOnly, Pageable pageable) {
        Long processedById = null;
        if (mineOnly) {
            StaffUser actor = resolveCurrentStaff();
            if (actor != null) {
                processedById = actor.getId();
            }
        }
        return txRepository.findFiltered(txType, customerId, processedById, pageable)
                .map(tx -> {
                    String code = ticketRepository.findByTransactionId(tx.getId())
                            .map(Ticket::getTicketCode)
                            .orElse(null);
                    return toResponse(tx, tx.getCustomer(), code);
                });
    }

    @Transactional(readOnly = true)
    public TransactionReceiptResponse getReceipt(Long transactionId) {
        ParkTransaction tx = txRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found: " + transactionId));

        TicketSummary ticketSummary = ticketRepository.findByTransactionId(transactionId)
                .map(TicketSummary::from)
                .orElse(null);

        List<FoodReceiptLine> foodItems = foodOrderRepository.findByTransactionId(transactionId)
                .map(order -> order.getItems().stream()
                        .map(i -> new FoodReceiptLine(
                                i.getMenuItem().getId(),
                                i.getMenuItem().getName(),
                                i.getQuantity(),
                                i.getUnitPrice(),
                                i.getUnitPrice().multiply(BigDecimal.valueOf(i.getQuantity()))
                        ))
                        .toList())
                .orElse(List.of());

        String ticketCode = ticketSummary != null ? ticketSummary.ticketCode() : null;
        return new TransactionReceiptResponse(toResponse(tx, tx.getCustomer(), ticketCode), ticketSummary, foodItems);
    }

    private void debitWristbandOrThrow(Customer customer, BigDecimal net) {
        if (customer.getWristbandBalance().compareTo(net) < 0) {
            throw new BusinessRuleException(String.format(
                    "Insufficient wristband balance. Required: $%.2f, Available: $%.2f",
                    net, customer.getWristbandBalance()));
        }
        customer.debitBalance(net);
    }

    private Offer resolveOptionalOffer(String promoCode, BigDecimal gross) {
        if (promoCode == null || promoCode.isBlank()) {
            return null;
        }
        return resolveOffer(promoCode, gross);
    }

    private Offer resolveOffer(String promoCode, BigDecimal gross) {
        Offer offer = offerRepository.findByCodeIgnoreCaseAndActiveTrue(promoCode.trim())
                .orElseThrow(() -> new BusinessRuleException("Invalid or inactive promo code: " + promoCode));
        if (offer.getExpiresAt() != null && offer.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BusinessRuleException("Promo code has expired: " + offer.getCode());
        }
        if (offer.getMinSpend() != null && gross.compareTo(offer.getMinSpend()) < 0) {
            throw new BusinessRuleException(String.format(
                    "Promo code %s requires minimum spend of $%.2f (current: $%.2f)",
                    offer.getCode(), offer.getMinSpend(), gross));
        }
        return offer;
    }

    private BigDecimal calculateDiscount(BigDecimal gross, Offer offer) {
        if (offer == null) {
            return BigDecimal.ZERO;
        }
        return gross.multiply(BigDecimal.valueOf(offer.getDiscountPercent()))
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
    }

    private StaffUser resolveCurrentStaff() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            return null;
        }
        return staffUserRepository.findByEmailIgnoreCase(auth.getName()).orElse(null);
    }

    private String generateTicketCode() {
        return "PKP-" + UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase();
    }

    private String labelForPass(PassType pt) {
        return switch (pt) {
            case REGULAR -> "Regular Day Pass";
            case VIP_FASTPASS -> "VIP FastPass";
            case FAMILY -> "Family Bundle Pass";
        };
    }

    private String perksForPass(PassType pt) {
        return switch (pt) {
            case REGULAR -> "All-day access to standard park attractions";
            case VIP_FASTPASS -> "Priority boarding lane + all attractions";
            case FAMILY -> "Group day entry for up to 4 guests";
        };
    }

    private TransactionResponse toResponse(ParkTransaction tx, Customer c, String ticketCode) {
        return new TransactionResponse(
                tx.getId(),
                c.getId(),
                c.getFullName(),
                tx.getTxType(),
                tx.getPaymentMethod(),
                tx.getGrossAmount(),
                tx.getDiscountAmount(),
                tx.getNetAmount(),
                tx.getPointsEarned(),
                c.getWristbandBalance(),
                c.getLoyaltyPoints(),
                ticketCode,
                tx.getProcessedBy() != null ? tx.getProcessedBy().getEmail() : null,
                tx.getOffer() != null ? tx.getOffer().getCode() : null,
                tx.getReferenceNote(),
                tx.getCreatedAt()
        );
    }
}

// PosService.java (Handles Wristband Top-Up, Ticketing POS & Food Court POS atomically)
package com.parkpulse.service;

import java.math.BigDecimal;
import java.math.RoundingMode;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.parkpulse.domain.Customer;
import com.parkpulse.domain.MenuItem;
import com.parkpulse.domain.Offer;
import com.parkpulse.domain.ParkTransaction;
import com.parkpulse.domain.PaymentMethod;
import com.parkpulse.domain.TransactionType;
import com.parkpulse.dto.Dtos.*;
import com.parkpulse.dto.Dtos.FoodCheckoutRequest;
import com.parkpulse.dto.Dtos.IssueTicketRequest;
import com.parkpulse.dto.Dtos.OrderLineRequest;
import com.parkpulse.dto.Dtos.TopUpRequest;
import com.parkpulse.dto.Dtos.TransactionResponse;
import com.parkpulse.exception.BusinessRuleException;
import com.parkpulse.exception.ResourceNotFoundException;
import com.parkpulse.repository.MenuItemRepository;
import com.parkpulse.repository.OfferRepository;
import com.parkpulse.repository.ParkTransactionRepository;

@Service
public class PosService {
    private final CustomerService customerService;
    private final OfferRepository offerRepository;
    private final MenuItemRepository menuItemRepository;
    private final ParkTransactionRepository txRepository;
    private final AuditService auditService;

    public PosService(CustomerService customerService,
                      OfferRepository offerRepository,
                      MenuItemRepository menuItemRepository,
                      ParkTransactionRepository txRepository,
                      AuditService auditService) {
        this.customerService = customerService;
        this.offerRepository = offerRepository;
        this.menuItemRepository = menuItemRepository;
        this.txRepository = txRepository;
        this.auditService = auditService;
    }

    @Transactional
    public TransactionResponse topUpWristband(TopUpRequest req) {
        Customer customer = customerService.getCustomerEntity(req.customerId());
        customer.creditBalance(req.amount());

        int points = req.amount().divide(BigDecimal.valueOf(20), 0, RoundingMode.DOWN).intValue();
        customer.addLoyaltyPoints(points);

        ParkTransaction tx = new ParkTransaction();
        tx.setCustomer(customer);
        tx.setTxType(TransactionType.TOPUP);
        tx.setPaymentMethod(PaymentMethod.CASH);
        tx.setGrossAmount(req.amount());
        tx.setDiscountAmount(BigDecimal.ZERO);
        tx.setNetAmount(req.amount());
        tx.setPointsEarned(points);

        ParkTransaction saved = txRepository.save(tx);
        auditService.record("WRISTBAND_TOPUP", "CUSTOMER", String.valueOf(customer.getId()),
                "Topped up $" + req.amount() + " for " + customer.getFullName());

        return toResponse(saved, customer);
    }

    @Transactional
    public TransactionResponse issueTicket(IssueTicketRequest req) {
        Customer customer = customerService.getCustomerEntity(req.customerId());
        BigDecimal gross = req.passType().getBasePrice();
        Offer offer = resolveOffer(req.promoCode());
        BigDecimal discount = calculateDiscount(gross, offer);
        BigDecimal net = gross.subtract(discount);

        if (req.paymentMethod() == PaymentMethod.WRISTBAND) {
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
        tx.setPaymentMethod(req.paymentMethod());
        tx.setGrossAmount(gross);
        tx.setDiscountAmount(discount);
        tx.setNetAmount(net);
        tx.setPointsEarned(points);

        ParkTransaction saved = txRepository.save(tx);
        auditService.record("TICKET_ISSUED", "TICKET", String.valueOf(saved.getId()),
                req.passType() + " issued to " + customer.getFullName() + " ($" + net + ")");

        return toResponse(saved, customer);
    }

    @Transactional
    public TransactionResponse checkoutFoodOrder(FoodCheckoutRequest req) {
        Customer customer = customerService.getCustomerEntity(req.customerId());

        BigDecimal gross = BigDecimal.ZERO;
        for (OrderLineRequest line : req.items()) {
            MenuItem item = menuItemRepository.findById(line.menuItemId())
                    .orElseThrow(() -> new ResourceNotFoundException("Menu item not found: " + line.menuItemId()));
            if (!item.isAvailable()) {
                throw new BusinessRuleException("Menu item is currently unavailable: " + item.getName());
            }
            gross = gross.add(item.getPrice().multiply(BigDecimal.valueOf(line.quantity())));
        }

        Offer offer = resolveOffer(req.promoCode());
        BigDecimal discount = calculateDiscount(gross, offer);
        BigDecimal net = gross.subtract(discount);

        if (req.paymentMethod() == PaymentMethod.WRISTBAND) {
            if (customer.getWristbandBalance().compareTo(net) < 0) {
                throw new BusinessRuleException(String.format(
                        "Insufficient wristband balance. Required: $%.2f, Available: $%.2f",
                        net, customer.getWristbandBalance()));
            }
            customer.debitBalance(net);
        }

        int points = net.divide(BigDecimal.valueOf(15), 0, RoundingMode.DOWN).intValue();
        customer.addLoyaltyPoints(points);

        ParkTransaction tx = new ParkTransaction();
        tx.setCustomer(customer);
        tx.setOffer(offer);
        tx.setTxType(TransactionType.FOOD);
        tx.setPaymentMethod(req.paymentMethod());
        tx.setGrossAmount(gross);
        tx.setDiscountAmount(discount);
        tx.setNetAmount(net);
        tx.setPointsEarned(points);

        ParkTransaction saved = txRepository.save(tx);
        auditService.record("FOOD_ORDER_CHECKOUT", "FOOD_ORDER", String.valueOf(saved.getId()),
                "Food checkout for " + customer.getFullName() + " ($" + net + ")");

        return toResponse(saved, customer);
    }

    private Offer resolveOffer(String promoCode) {
        if (promoCode == null || promoCode.isBlank()) {
            return null;
        }
        return offerRepository.findByCodeIgnoreCaseAndActiveTrue(promoCode.trim())
                .orElseThrow(() -> new BusinessRuleException("Invalid or inactive promo code: " + promoCode));
    }

    private BigDecimal calculateDiscount(BigDecimal gross, Offer offer) {
        if (offer == null) {
            return BigDecimal.ZERO;
        }
        return gross.multiply(BigDecimal.valueOf(offer.getDiscountPercent()))
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
    }

    private TransactionResponse toResponse(ParkTransaction tx, Customer c) {
        return new TransactionResponse(
                tx.getId(), c.getId(), c.getFullName(), tx.getTxType(), tx.getPaymentMethod(),
                tx.getGrossAmount(), tx.getDiscountAmount(), tx.getNetAmount(), tx.getPointsEarned(),
                c.getWristbandBalance(), c.getLoyaltyPoints(), tx.getCreatedAt()
        );
    }
}
package com.parkpulse.controller;

import com.parkpulse.domain.MenuItem;
import com.parkpulse.domain.TransactionType;
import com.parkpulse.dto.PosDtos.*;
import com.parkpulse.repository.MenuItemRepository;
import com.parkpulse.service.PosService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class PosController {
    private final PosService posService;
    private final MenuItemRepository menuItemRepository;

    public PosController(PosService posService, MenuItemRepository menuItemRepository) {
        this.posService = posService;
        this.menuItemRepository = menuItemRepository;
    }

    @GetMapping("/pos/catalog")
    @PreAuthorize("hasAnyRole('MANAGER', 'CASHIER')")
    public PosCatalogResponse getCatalog() {
        return posService.getCatalog();
    }

    @GetMapping("/pos/offers/validate")
    @PreAuthorize("hasAnyRole('MANAGER', 'CASHIER')")
    public PromoQuoteResponse validatePromo(
            @RequestParam String code,
            @RequestParam BigDecimal amount) {
        return posService.validatePromo(code, amount);
    }

    @GetMapping("/pos/offers")
    @PreAuthorize("hasRole('MANAGER')")
    public List<OfferResponse> listOffers() {
        return posService.listAllOffers();
    }

    @PostMapping("/pos/offers")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('MANAGER')")
    public OfferResponse createOffer(@Valid @RequestBody CreateOfferRequest req) {
        return posService.createOffer(req);
    }

    @PatchMapping("/pos/offers/{id}/toggle")
    @PreAuthorize("hasRole('MANAGER')")
    public OfferResponse toggleOffer(@PathVariable Long id) {
        return posService.toggleOffer(id);
    }

    @PostMapping("/pos/topup")
    @PreAuthorize("hasAnyRole('MANAGER', 'CASHIER')")
    public TransactionResponse topUp(@Valid @RequestBody TopUpRequest req) {
        return posService.topUpWristband(req);
    }

    @PostMapping("/pos/tickets")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('MANAGER', 'CASHIER')")
    public TransactionResponse issueTicket(@Valid @RequestBody IssueTicketRequest req) {
        return posService.issueTicket(req);
    }

    @GetMapping("/menu")
    public List<MenuItem> getMenu(@RequestParam(defaultValue = "false") boolean includeUnavailable) {
        return includeUnavailable ? menuItemRepository.findAll() : menuItemRepository.findByAvailableTrue();
    }

    @PatchMapping("/menu/{id}/availability")
    @PreAuthorize("hasRole('MANAGER')")
    public MenuItem toggleMenuItemAvailability(@PathVariable Long id) {
        return posService.toggleMenuItemAvailability(id);
    }

    @PostMapping("/pos/food-orders")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('MANAGER', 'CASHIER')")
    public TransactionResponse checkoutFood(@Valid @RequestBody FoodCheckoutRequest req) {
        return posService.checkoutFoodOrder(req);
    }

    @PostMapping("/pos/loyalty/redeem")
    @PreAuthorize("hasAnyRole('MANAGER', 'CASHIER')")
    public LoyaltyRedeemResponse redeemLoyalty(@Valid @RequestBody LoyaltyRedeemRequest req) {
        return posService.redeemLoyaltyPoints(req);
    }

    @GetMapping("/pos/transactions")
    @PreAuthorize("hasAnyRole('MANAGER', 'CASHIER')")
    public Page<TransactionResponse> listTransactions(
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false) Long customerId,
            @RequestParam(defaultValue = "false") boolean mineOnly,
            @PageableDefault(size = 15) Pageable pageable) {
        return posService.listTransactions(type, customerId, mineOnly, pageable);
    }

    @GetMapping("/pos/transactions/{id}/receipt")
    @PreAuthorize("hasAnyRole('MANAGER', 'CASHIER')")
    public TransactionReceiptResponse getReceipt(@PathVariable Long id) {
        return posService.getReceipt(id);
    }
}

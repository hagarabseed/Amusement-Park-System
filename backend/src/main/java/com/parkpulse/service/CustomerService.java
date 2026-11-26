package com.parkpulse.service;

import com.parkpulse.domain.Customer;
import com.parkpulse.domain.ParkTransaction;
import com.parkpulse.dto.CustomerDtos.CreateCustomerRequest;
import com.parkpulse.dto.CustomerDtos.CustomerDetailResponse;
import com.parkpulse.dto.CustomerDtos.CustomerResponse;
import com.parkpulse.dto.CustomerDtos.TicketSummary;
import com.parkpulse.dto.PosDtos.TransactionResponse;
import com.parkpulse.exception.BusinessRuleException;
import com.parkpulse.exception.ResourceNotFoundException;
import com.parkpulse.repository.CustomerRepository;
import com.parkpulse.repository.ParkTransactionRepository;
import com.parkpulse.repository.TicketRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CustomerService {
    public static final int WELCOME_LOYALTY_POINTS = 10;

    private final CustomerRepository customerRepository;
    private final TicketRepository ticketRepository;
    private final ParkTransactionRepository txRepository;
    private final AuditService auditService;

    public CustomerService(CustomerRepository customerRepository,
                           TicketRepository ticketRepository,
                           ParkTransactionRepository txRepository,
                           AuditService auditService) {
        this.customerRepository = customerRepository;
        this.ticketRepository = ticketRepository;
        this.txRepository = txRepository;
        this.auditService = auditService;
    }

    @Transactional
    public CustomerResponse registerCustomer(CreateCustomerRequest req) {
        String normalizedEmail = req.email().trim().toLowerCase();
        String normalizedPhone = req.phone().trim();

        if (customerRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new BusinessRuleException("Email is already registered: " + normalizedEmail);
        }
        if (customerRepository.existsByPhone(normalizedPhone)) {
            throw new BusinessRuleException("Phone number is already registered: " + normalizedPhone);
        }

        Customer c = new Customer();
        c.setFullName(req.fullName().trim());
        c.setEmail(normalizedEmail);
        c.setPhone(normalizedPhone);
        c.setWristbandBalance(req.initialDeposit());
        c.setLoyaltyPoints(WELCOME_LOYALTY_POINTS);

        Customer saved = customerRepository.save(c);
        auditService.record("CUSTOMER_REGISTERED", "CUSTOMER", String.valueOf(saved.getId()),
                "Registered " + saved.getFullName() + " with deposit $" + saved.getWristbandBalance());
        return CustomerResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public Page<CustomerResponse> searchCustomers(String query, Pageable pageable) {
        if (query == null || query.isBlank()) {
            return customerRepository.findAll(pageable).map(CustomerResponse::from);
        }
        String q = query.trim();
        return customerRepository
                .findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCaseOrPhoneContaining(q, q, q, pageable)
                .map(CustomerResponse::from);
    }

    @Transactional(readOnly = true)
    public CustomerDetailResponse getCustomerDetail(Long id) {
        Customer customer = getCustomerEntity(id);
        List<TicketSummary> tickets = ticketRepository.findByCustomerIdOrderByIssuedAtDesc(id)
                .stream().map(TicketSummary::from).toList();
        List<TransactionResponse> txs = txRepository.findTop15ByCustomerIdOrderByCreatedAtDesc(id)
                .stream().map(this::toTxSummary).toList();
        return new CustomerDetailResponse(CustomerResponse.from(customer), tickets, txs);
    }

    @Transactional(readOnly = true)
    public Customer getCustomerEntity(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + id));
    }

    private TransactionResponse toTxSummary(ParkTransaction tx) {
        Customer c = tx.getCustomer();
        String ticketCode = ticketRepository.findByTransactionId(tx.getId())
                .map(t -> t.getTicketCode())
                .orElse(null);
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

// CustomerService.java
package com.parkpulse.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.parkpulse.domain.Customer;
import com.parkpulse.dto.Dtos.*;
import com.parkpulse.dto.Dtos.CreateCustomerRequest;
import com.parkpulse.dto.Dtos.CustomerResponse;
import com.parkpulse.exception.BusinessRuleException;
import com.parkpulse.exception.ResourceNotFoundException;
import com.parkpulse.repository.CustomerRepository;

@Service
public class CustomerService {
    private static final int WELCOME_LOYALTY_POINTS = 10;

    private final CustomerRepository customerRepository;
    private final AuditService auditService;

    public CustomerService(CustomerRepository customerRepository, AuditService auditService) {
        this.customerRepository = customerRepository;
        this.auditService = auditService;
    }

    @Transactional
    public CustomerResponse registerCustomer(CreateCustomerRequest req) {
        if (customerRepository.existsByEmailIgnoreCase(req.email().trim())) {
            throw new BusinessRuleException("Email is already registered: " + req.email());
        }
        if (customerRepository.existsByPhone(req.phone().trim())) {
            throw new BusinessRuleException("Phone number is already registered: " + req.phone());
        }

        Customer c = new Customer();
        c.setFullName(req.fullName().trim());
        c.setEmail(req.email().trim().toLowerCase());
        c.setPhone(req.phone().trim());
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
    public Customer getCustomerEntity(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + id));
    }
}
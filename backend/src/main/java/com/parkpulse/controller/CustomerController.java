package com.parkpulse.controller;

import com.parkpulse.dto.CustomerDtos.CreateCustomerRequest;
import com.parkpulse.dto.CustomerDtos.CustomerDetailResponse;
import com.parkpulse.dto.CustomerDtos.CustomerResponse;
import com.parkpulse.service.CustomerService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/customers")
public class CustomerController {
    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'CASHIER')")
    public Page<CustomerResponse> listCustomers(
            @RequestParam(required = false) String q,
            @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        return customerService.searchCustomers(q, pageable);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'CASHIER')")
    public CustomerDetailResponse getCustomerDetail(@PathVariable Long id) {
        return customerService.getCustomerDetail(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('MANAGER', 'CASHIER')")
    public CustomerResponse registerCustomer(@Valid @RequestBody CreateCustomerRequest req) {
        return customerService.registerCustomer(req);
    }
}

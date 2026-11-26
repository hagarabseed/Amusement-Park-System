package com.parkpulse.config;

import com.parkpulse.domain.CustomerAccount;
import com.parkpulse.repository.CustomerAccountRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Loads {@link CustomerAccount} records for JWT authentication.
 * Distinguished from {@link StaffUserDetailsService} by a "customer:" email prefix
 * embedded in the JWT subject when a customer account logs in.
 */
@Service("customerUserDetailsService")
public class CustomerUserDetailsService implements UserDetailsService {

    private final CustomerAccountRepository repo;

    public CustomerUserDetailsService(CustomerAccountRepository repo) {
        this.repo = repo;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        CustomerAccount account = repo.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new UsernameNotFoundException("Customer account not found: " + email));

        return User.builder()
                .username(account.getEmail())
                .password(account.getPasswordHash())
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER")))
                .build();
    }
}

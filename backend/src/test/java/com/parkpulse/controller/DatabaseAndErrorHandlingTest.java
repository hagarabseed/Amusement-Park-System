package com.parkpulse.controller;

import com.parkpulse.domain.Customer;
import com.parkpulse.dto.AuthDtos.LoginRequest;
import com.parkpulse.repository.CustomerRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.MediaType;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class DatabaseAndErrorHandlingTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private CustomerRepository customerRepository;
    @Autowired private EntityManagerFactory emf;

    private String loginManager() throws Exception {
        String res = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new LoginRequest("omar.manager@parkpulse.com", "Pass@1234"))))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(res).get("token").asText();
    }

    @Test
    @DisplayName("API Error Handling: 400 Malformed JSON and 404 Not Found return RFC 7807 ProblemDetail")
    void errorHandling_MalformedAndNotFound() throws Exception {
        String token = loginManager();

        mockMvc.perform(post("/api/v1/customers")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{invalid-json"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Malformed Request"));

        mockMvc.perform(get("/api/v1/customers/999999")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Resource Not Found"));
    }

    @Test
    @DisplayName("Database Integrity: Negative wristband balance rejected by CHECK constraint")
    void dbConstraint_NegativeBalanceRejected() {
        Customer bad = new Customer();
        bad.setFullName("Constraint Check");
        bad.setEmail("constraint@test.com");
        bad.setPhone("01088889999");
        bad.setWristbandBalance(new BigDecimal("-5.00"));

        assertThrows(DataIntegrityViolationException.class, () -> customerRepository.saveAndFlush(bad));
    }

    @Test
    @DisplayName("Concurrency Integrity: Optimistic locking prevents lost update on Customer wristband")
    void optimisticLocking_ConcurrentWalletModificationThrows() {
        Customer created = new Customer();
        created.setFullName("Concurrent Guest");
        created.setEmail("concurrent@test.com");
        created.setPhone("01077776666");
        created.setWristbandBalance(new BigDecimal("100.00"));
        Customer saved = customerRepository.saveAndFlush(created);

        EntityManager em1 = emf.createEntityManager();
        EntityManager em2 = emf.createEntityManager();
        try {
            em1.getTransaction().begin();
            Customer c1 = em1.find(Customer.class, saved.getId());
            em1.detach(c1);
            em1.getTransaction().commit();

            em2.getTransaction().begin();
            Customer c2 = em2.find(Customer.class, saved.getId());
            c2.creditBalance(new BigDecimal("50.00"));
            em2.getTransaction().commit();

            c1.creditBalance(new BigDecimal("25.00"));
            assertThrows(Exception.class, () -> {
                em1.getTransaction().begin();
                em1.merge(c1);
                em1.getTransaction().commit();
            });
        } finally {
            if (em1.getTransaction().isActive()) em1.getTransaction().rollback();
            if (em2.getTransaction().isActive()) em2.getTransaction().rollback();
            em1.close();
            em2.close();
            customerRepository.deleteById(saved.getId());
        }
    }
}

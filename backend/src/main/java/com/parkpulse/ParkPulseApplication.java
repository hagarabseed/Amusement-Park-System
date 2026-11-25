package com.parkpulse;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.parkpulse.repository.StaffUserRepository;

@SpringBootApplication
public class ParkPulseApplication {
    public static void main(String[] args) {
        SpringApplication.run(ParkPulseApplication.class, args);
    }

    @Bean
    CommandLineRunner syncDemoPasswords(StaffUserRepository repo, PasswordEncoder encoder) {
        return args -> repo.findAll().forEach(user -> {
            if (!encoder.matches("Pass@1234", user.getPasswordHash())) {
                user.setPasswordHash(encoder.encode("Pass@1234"));
                repo.save(user);
            }
        });
    }
}
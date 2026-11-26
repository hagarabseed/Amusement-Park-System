package com.parkpulse.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.parkpulse.domain.AuditLog;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findTop20ByOrderByCreatedAtDesc();
    List<AuditLog> findTop20ByActorEmailOrderByCreatedAtDesc(String actorEmail);
    long countByActorEmail(String actorEmail);
}
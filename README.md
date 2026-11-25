# ParkPulse — Amusement Park Operations & POS Web Platform

Refactored from a monolithic Java Swing desktop application into a multi-tier, test-driven Spring Boot + React + PostgreSQL web system engineered for end-to-end Software Quality Assurance.

## Architecture Overview
- **Backend:** Java 21, Spring Boot 3.4, Spring Security (Stateless JWT RBAC), Spring Data JPA, Flyway, RFC 7807 `ProblemDetail` error responses, OpenAPI/Swagger UI.
- **Database:** PostgreSQL 16 (`NUMERIC(10,2)` currency precision, `CHECK` constraints, indexed lookups).
- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS with semantic `data-testid` attributes.
- **QA Pyramid:** JUnit 5 + Mockito + JaCoCo (Unit), SpringBootTest + MockMvc (API Integration), Postman Automated Collection, and Playwright (E2E).

## Quick Start
1. **Start PostgreSQL:**
   ```bash
   cp .env.example .env
   docker compose up -d
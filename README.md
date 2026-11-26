# ParkPulse — Amusement Park Operations & POS Platform

A full-stack Amusement Park Operations, Point-of-Sale (POS), RFID Wallet, and Ride Safety Control platform built with **Spring Boot 3.4**, **React 19 + TypeScript + Tailwind CSS**, and **PostgreSQL 16 (Flyway)**.

## Architecture Overview
- **Backend (`backend/`)**: Java 21, Spring Boot 3.4, Spring Security (Stateless JWT RBAC + custom `UserDetailsService` + RFC 7807 `401`/`403` `ProblemDetail`), Spring Data JPA with Optimistic Locking (`@Version`), Flyway migrations (`V1`–`V3`), `X-Request-Id` correlation logging, OpenAPI/Swagger UI (`/swagger-ui.html`).
- **Database**: PostgreSQL 16 (`NUMERIC(10,2)` currency precision, `CHECK` constraints, indexed lookups) with an embedded H2 PostgreSQL-mode `dev` profile for zero-setup local demos.
- **Frontend (`frontend/`)**: Modular React 19 + TypeScript + Tailwind CSS architecture (`AppShell`, role-scoped dashboards with revenue visualizations, paginated visitor wallet inspector, Ticketing & Food Court POS with live promo quotes, Transaction Receipt modal & CSV export, Ride Gate Safety Boarding, Staff & Catalog Governance).
- **QA Pyramid**:
  - **Backend Unit & Integration**: JUnit 5, Mockito, SpringBootTest + MockMvc, H2 + Flyway, JaCoCo (`mvn test`)
  - **Frontend Unit**: Node 24 native TypeScript test runner (`npm run test:unit`)
  - **E2E Browser**: Playwright (`npm run test:e2e`)
  - **QA Artifacts (`docs/qa/`)**: IEEE 829 Test Plan, BVA/EP Test Cases, Requirements Traceability Matrix, Postman Collection.

## Running Locally

### Option A: Zero-Dependency Local Demo (H2 PostgreSQL Mode)
1. **Start Backend (`dev` profile):**
   ```bash
   cd backend
   mvn spring-boot:run -Dspring-boot.run.profiles=dev
   ```
2. **Start Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
3. Open `http://localhost:5173`. Demo accounts (Password: `Pass@1234`):
   - **Manager:** `omar.manager@parkpulse.com`
   - **Cashier:** `khaled.cashier@parkpulse.com`
   - **Ride Operator:** `ahmed.operator@parkpulse.com`

### Option B: Production PostgreSQL 16 via Docker Compose
1. Configure environment variables:
   ```bash
   cp .env.example .env
   docker compose up -d
   ```
2. Run backend with default PostgreSQL profile:
   ```bash
   cd backend
   mvn spring-boot:run
   ```

## Running Automated Tests
```bash
# Backend Unit + Integration + DB Integrity Tests + JaCoCo Report
cd backend && mvn test

# Frontend Unit Tests & Production Build
cd frontend && npm run test:unit && npm run build

# Playwright E2E Suite (with backend & frontend running)
cd frontend && npm run test:e2e
```

# IEEE 829 Software Test Plan — ParkPulse Operations & POS Platform

## 1. Test Plan Identifier
`TP-PARKPULSE-2.0`

## 2. Introduction & Scope
ParkPulse is a multi-tier amusement park operations and Point-of-Sale (POS) web platform engineered with Spring Boot 3.4, PostgreSQL 16 (with Flyway migrations), and React 19 + TypeScript. This test plan governs verification across unit, integration/API, database integrity, and browser End-to-End (E2E) layers.

### In-Scope Modules
- **Authentication & RBAC (`AuthController`, `SecurityConfig`, `JwtService`)**: Stateless JWT issuance, `401 Unauthorized` vs `403 Forbidden` enforcement across `MANAGER`, `CASHIER`, and `RIDE_OPERATOR`.
- **Visitor & RFID Wallet Management (`CustomerController`, `CustomerService`)**: Registration, duplicate email/phone rejection, search/pagination, detail inspection, optimistic locking (`@Version`).
- **Ticketing, Food Court & Loyalty POS (`PosController`, `PosService`)**: Pass issuance (`Ticket` persistence + `PKP-` codes), promo validation (`minSpend`, expiry, active status), Food Court orders (`FoodOrder` + `FoodOrderItem`), loyalty point earning & redemption, receipt retrieval.
- **Ride Operations & Safety Gate Control (`RideController`, `RideService`)**: Attraction provisioning, maintenance locking with reason, guest safety eligibility validation (`minAge`, `minHeightM`, active ticket validation), boarding logs.
- **Staff & Catalog Governance (`StaffController`, `PosController`)**: Staff onboarding, shift toggling, station/ride linking, offer campaigns, menu availability toggles.

## 3. Test Approach & Pyramid
| Layer | Tooling | Target |
| :--- | :--- | :--- |
| **Backend Unit** | JUnit 5 + Mockito | Isolated service business rules, BVA thresholds, JWT cryptography |
| **Frontend Unit** | Node 24 Test Runner (`node:test`) | Currency precision, cart totals, client form BVA, safety eligibility helpers |
| **API & DB Integration** | SpringBootTest + MockMvc + H2 (PostgreSQL mode) + Flyway | End-to-end HTTP contracts, RFC 7807 `ProblemDetail`, RBAC, `CHECK` constraints, `@Version` optimistic locking |
| **API Contract Suite** | Postman / Newman (`ParkPulse_QA_Suite.postman_collection.json`) | Automated chained REST assertions across Auth, POS, Boarding, Negative cases |
| **Browser E2E** | Playwright + Chromium | Full multi-role UI workflows, negative auth, RBAC UI isolation, safety BVA |

## 4. Entry & Exit Criteria
- **Entry Criteria:** Clean compilation (`mvn compile`, `tsc --noEmit`), Flyway migrations `V1`–`V3` valid, seed data loaded.
- **Exit Criteria:** 100% pass rate across backend unit/integration tests, frontend unit tests, and Playwright E2E suite; zero critical/high open defects; JaCoCo coverage report generated.

## 5. Risk & Mitigation
- **Concurrent RFID Balance Modification:** Mitigated via JPA `@Version` optimistic locking (`409 Conflict` on stale write) and DB `CHECK (wristband_balance >= 0)`.
- **Unauthorized Financial/Operational Access:** Mitigated via Spring Security method-level `@PreAuthorize` + stateless JWT verification + explicit `401`/`403` `ProblemDetail` handlers.

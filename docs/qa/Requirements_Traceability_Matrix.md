# Requirements Traceability Matrix (RTM) — ParkPulse

| Req ID | Business Requirement | Backend Implementation | Test Coverage (Unit / Integration / E2E) |
| :--- | :--- | :--- | :--- |
| `REQ-AUTH-01` | Stateless JWT authentication & `/me` profile | `AuthController`, `AuthService`, `JwtService` | `JwtServiceTest`, `ParkOperationsIntegrationTest`, `parkpulse.spec.ts` |
| `REQ-AUTH-02` | HTTP `401` (unauthenticated) vs `403` (RBAC forbidden) with RFC 7807 | `SecurityConfig`, `GlobalExceptionHandler` | `ParkOperationsIntegrationTest.unauthenticatedAndInvalidToken_Returns401`, `rbacBoundaries_Enforced` |
| `REQ-CUST-01` | Visitor registration with unique email/phone & welcome points | `CustomerController`, `CustomerService` | `CustomerServiceTest`, `ParkOperationsIntegrationTest`, `parkpulse.spec.ts` |
| `REQ-CUST-02` | Paginated search & wallet detail with tickets/transactions | `CustomerController.getCustomerDetail` | `ParkOperationsIntegrationTest`, `CustomersView.tsx` |
| `REQ-POS-01` | RFID wristband top-up & optimistic concurrency safety | `PosService.topUpWristband`, `Customer.@Version` | `PosServiceTest`, `DatabaseAndErrorHandlingTest.optimisticLocking` |
| `REQ-POS-02` | Ticket pass issuance persisting `Ticket` + `PKP-` code | `PosService.issueTicket`, `Ticket` | `PosServiceTest`, `ParkOperationsIntegrationTest`, `parkpulse.spec.ts` |
| `REQ-POS-03` | Food Court multi-item order persisting `FoodOrder` & `FoodOrderItem` | `PosService.checkoutFoodOrder`, `FoodOrder` | `PosServiceTest`, `ParkOperationsIntegrationTest`, `parkpulse.spec.ts` |
| `REQ-POS-04` | Promo code validation (`active`, `expiresAt`, `minSpend`) | `PosService.validatePromo` | `PosServiceTest`, `parkpulse.spec.ts` |
| `REQ-POS-05` | Loyalty point redemption (100 pts = $10 credit) | `PosService.redeemLoyaltyPoints` | `PosServiceTest`, `ParkOperationsIntegrationTest` |
| `REQ-RIDE-01` | Ride CRUD & maintenance toggle with reason | `RideController`, `RideService` | `ParkOperationsIntegrationTest`, `parkpulse.spec.ts` |
| `REQ-RIDE-02` | Ride gate boarding safety & ticket validation | `RideService.boardGuest`, `RideBoarding` | `RideServiceTest`, `ParkOperationsIntegrationTest`, `parkpulse.spec.ts` |
| `REQ-STAFF-01` | Manager staff onboarding, shift toggle & ride-station linking | `StaffController`, `StaffService` | `StaffServiceTest`, `ParkOperationsIntegrationTest` |
| `REQ-DB-01` | Relational & `CHECK` constraint integrity | `V1`–`V3` Flyway migrations | `DatabaseAndErrorHandlingTest` |

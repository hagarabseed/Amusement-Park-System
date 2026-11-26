# Black-Box Test Cases — Boundary Value Analysis (BVA) & Equivalence Partitioning (EP)

## 1. Visitor Registration (`POST /api/v1/customers`)

| TC ID | Technique | Field | Input Value | Expected Result | Automated Coverage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `TC-CUST-01` | EP (Valid) | All | Valid name, unique email, 11-digit phone, `$50.00` | `201 Created`, 10 welcome points | `ParkOperationsIntegrationTest` |
| `TC-CUST-02` | BVA (Lower Valid) | `initialDeposit` | `$0.00` | `201 Created`, balance `$0.00` | `CustomerServiceTest`, `posCalculations.test.ts` |
| `TC-CUST-03` | BVA (Invalid Below) | `initialDeposit` | `-$0.01` | `400 Bad Request` (`errors.initialDeposit`) | `ParkOperationsIntegrationTest` |
| `TC-CUST-04` | BVA (Invalid Above) | `initialDeposit` | `$10000.01` | `400 Bad Request` (`errors.initialDeposit`) | DTO `@DecimalMax("10000.00")` |
| `TC-CUST-05` | BVA (Phone Length) | `phone` | `1234567` (7 digits) | `400 Bad Request` (`errors.phone`) | `ParkOperationsIntegrationTest`, `posCalculations.test.ts` |
| `TC-CUST-06` | BVA (Name Length) | `fullName` | `"A"` (1 char) | `400 Bad Request` (`errors.fullName`) | `ParkOperationsIntegrationTest` |
| `TC-CUST-07` | EP (Negative) | `email` / `phone` | Existing email or phone | `422 Unprocessable Entity` | `CustomerServiceTest` |

## 2. Loyalty Points Earning & Redemption (`POST /api/v1/pos/topup`, `/pos/loyalty/redeem`)

| TC ID | Technique | Scenario | Input | Expected Result | Automated Coverage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `TC-POS-01` | BVA (Threshold - 0.01) | Top-Up points boundary | `$19.99` | `pointsEarned = 0` | `PosServiceTest`, `posCalculations.test.ts` |
| `TC-POS-02` | BVA (Exact Threshold) | Top-Up points boundary | `$20.00` | `pointsEarned = 1` | `posCalculations.test.ts` |
| `TC-POS-03` | EP (Valid) | Redeem loyalty block | `100` pts (customer has `120`) | `+$10.00` credit, `20` pts left | `PosServiceTest`, `ParkOperationsIntegrationTest` |
| `TC-POS-04` | EP (Invalid Modulo) | Non-multiple of 100 | `150` pts | `422 Unprocessable Entity` | `PosServiceTest` |
| `TC-POS-05` | BVA (Insufficient) | Exceeds balance | `200` pts (customer has `120`) | `422 Unprocessable Entity` | `PosServiceTest` |

## 3. Promo Code Validation (`GET /api/v1/pos/offers/validate`, `/pos/tickets`)

| TC ID | Technique | Scenario | Input | Expected Result | Automated Coverage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `TC-PROMO-01` | BVA (Below `minSpend`) | `VIP10` (`minSpend = $50.00`) | Gross `$49.99` | `422 Unprocessable Entity` | `PosServiceTest` |
| `TC-PROMO-02` | BVA (Exact `minSpend`) | `VIP10` (`minSpend = $50.00`) | Gross `$50.00` | `200 OK`, `$5.00` discount | `PosService.validatePromo` |
| `TC-PROMO-03` | EP (Inactive/Expired) | `EXPIRED15` or past `expiresAt` | Any valid amount | `422 Unprocessable Entity` | `PosServiceTest` |
| `TC-POS-06` | Negative Balance | `FAMILY` ($160) on `$100` wallet | `WRISTBAND` | `422 Unprocessable Entity` | `PosServiceTest`, `parkpulse.spec.ts` |

## 4. Ride Safety Gate Boarding (`POST /api/v1/rides/{id}/board`)

| TC ID | Technique | Ride Spec (`Thunder Coaster`: `minAge=14`, `minHeight=1.40m`) | Input | Expected Result | Automated Coverage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `TC-RIDE-01` | BVA (Exact Min) | Age = `14`, Height = `1.40m`, Ride `OPEN` | Active `PKP-` ticket | `201 Created`, boarding logged | `RideServiceTest`, `ParkOperationsIntegrationTest`, `parkpulse.spec.ts` |
| `TC-RIDE-02` | BVA (Age - 1) | Age = `13`, Height = `1.50m` | Active `PKP-` ticket | `422` (`Minimum age`) | `RideServiceTest`, `ParkOperationsIntegrationTest`, `parkpulse.spec.ts` |
| `TC-RIDE-03` | BVA (Height - 0.01) | Age = `15`, Height = `1.39m` | Active `PKP-` ticket | `422` (`Minimum height`) | `RideServiceTest`, `posCalculations.test.ts` |
| `TC-RIDE-04` | State Transition | Ride in `MAINTENANCE` | Age `20`, Height `1.80m` | `422` (`maintenance`) | `RideServiceTest`, `ParkOperationsIntegrationTest` |
| `TC-RIDE-05` | State Transition | Ticket `CANCELLED` or expired `validDate` | Age `20`, Height `1.80m` | `422` (`not active` / `expired`) | `RideServiceTest` |

import { test, expect } from '@playwright/test';

test.describe('ParkPulse Operations & QA E2E Suite', () => {
  test('Negative Auth: Rejects invalid credentials with RFC 7807 error banner', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('login-email').fill('omar.manager@parkpulse.com');
    await page.getByTestId('login-password').fill('WrongPassword99');
    await page.getByTestId('login-submit').click();

    await expect(page.getByTestId('alert-error')).toContainText('Invalid email or password');
    await expect(page.getByTestId('login-submit')).toBeVisible();
  });

  test('Manager Full Workflow: Register Visitor -> Ticket POS -> Food POS -> Receipts -> Rides -> Catalog', async ({
    page,
  }) => {
    await page.goto('/');

    // 1. Authenticate as Manager
    await page.getByTestId('demo-fill-manager').click();
    await page.getByTestId('login-submit').click();
    await expect(page.getByTestId('stat-revenue')).toBeVisible();
    await expect(page.getByTestId('user-role-badge')).toHaveText('MANAGER');

    // 2. Register New Visitor
    const uniqueSuffix = Date.now().toString().slice(-6);
    const visitorEmail = `visitor${uniqueSuffix}@test.com`;
    await page.getByTestId('nav-customers').click();
    await page.getByTestId('cust-name').fill(`QA Visitor ${uniqueSuffix}`);
    await page.getByTestId('cust-email').fill(visitorEmail);
    await page.getByTestId('cust-phone').fill(`01099${uniqueSuffix}`);
    await page.getByTestId('cust-deposit').fill('300.00');
    await page.getByTestId('cust-submit').click();

    await expect(page.getByTestId('alert-success')).toContainText('registered successfully');

    // 3. Issue Ticket with SUMMER20 Promo via Wristband
    await page.getByTestId('nav-pos').click();
    await page.getByTestId('pos-pass-select').selectOption('REGULAR');
    await page.getByTestId('pos-promo-input').fill('SUMMER20');
    await page.getByTestId('pos-promo-apply-btn').click();
    await expect(page.getByTestId('alert-success')).toContainText('20% off');

    await page.getByTestId('pos-issue-btn').click();
    await expect(page.getByTestId('issued-ticket-card')).toBeVisible();
    const ticketCode = (await page.getByTestId('issued-ticket-card').locator('.text-lg').innerText()).trim();
    expect(ticketCode).toMatch(/^PKP-/);

    // 4. Food Court POS Checkout
    await page.getByTestId('nav-food-pos').click();
    await page.getByTestId('add-menu-1').click();
    await expect(page.getByTestId('food-cart-total')).toHaveText('$150.00');
    await page.getByTestId('food-checkout-btn').click();
    await expect(page.getByTestId('alert-success')).toContainText('Food order completed');

    // 5. Verify Transactions Ledger
    await page.getByTestId('nav-transactions').click();
    await expect(page.getByTestId('transactions-table')).toContainText(ticketCode);

    // 6. Toggle Ride Maintenance (Ride 2: House of Shock)
    await page.getByTestId('nav-rides').click();
    await page.getByTestId('toggle-maint-2').click();
    await expect(page.getByTestId('ride-status-2')).toHaveText('MAINTENANCE');
    await page.getByTestId('toggle-maint-2').click();
    await expect(page.getByTestId('ride-status-2')).toHaveText('OPEN');

    // 7. Create Promo Campaign
    await page.getByTestId('nav-catalog').click();
    await page.getByTestId('offer-code-input').fill(`QA${uniqueSuffix}`);
    await page.getByTestId('offer-title-input').fill('E2E Flash Promo');
    await page.getByTestId('offer-discount-input').fill('15');
    await page.getByTestId('offer-submit-btn').click();
    await expect(page.getByTestId('alert-success')).toContainText(`QA${uniqueSuffix}`);

    // 8. Sign Out
    await page.getByTestId('logout-btn').click();
    await expect(page.getByTestId('login-submit')).toBeVisible();
  });

  test('Cashier RBAC & Negative Balance Workflow', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('demo-fill-cashier').click();
    await page.getByTestId('login-submit').click();

    await expect(page.getByTestId('user-role-badge')).toHaveText('CASHIER');
    await expect(page.getByTestId('stat-my-actions')).toBeVisible();
    await expect(page.getByTestId('stat-revenue')).toHaveCount(0);
    await expect(page.getByTestId('nav-staff')).toHaveCount(0);
    await expect(page.getByTestId('nav-catalog')).toHaveCount(0);

    // Register low-balance customer ($10.00) and attempt $160 FAMILY pass via Wristband
    const suffix = Date.now().toString().slice(-6);
    await page.getByTestId('nav-customers').click();
    await page.getByTestId('cust-name').fill(`Low Bal ${suffix}`);
    await page.getByTestId('cust-email').fill(`low${suffix}@test.com`);
    await page.getByTestId('cust-phone').fill(`01088${suffix}`);
    await page.getByTestId('cust-deposit').fill('10.00');
    await page.getByTestId('cust-submit').click();
    await expect(page.getByTestId('alert-success')).toBeVisible();

    await page.getByTestId('nav-pos').click();
    await page.getByTestId('pos-pass-select').selectOption('FAMILY');
    await page.getByTestId('pos-issue-btn').click();
    await expect(page.getByTestId('alert-error')).toContainText('Insufficient wristband balance');
  });

  test('Ride Operator RBAC & Gate Boarding Safety BVA', async ({ page }) => {
    // First issue a ticket as Cashier
    await page.goto('/');
    await page.getByTestId('demo-fill-cashier').click();
    await page.getByTestId('login-submit').click();
    await page.getByTestId('nav-pos').click();
    await page.getByTestId('pos-issue-btn').click();
    await expect(page.getByTestId('issued-ticket-card')).toBeVisible();
    const ticketCode = (await page.getByTestId('issued-ticket-card').locator('.text-lg').innerText()).trim();
    await page.getByTestId('logout-btn').click();

    // Now sign in as Ride Operator
    await page.getByTestId('demo-fill-operator').click();
    await page.getByTestId('login-submit').click();

    await expect(page.getByTestId('user-role-badge')).toHaveText('RIDE_OPERATOR');
    await expect(page.getByTestId('nav-customers')).toHaveCount(0);
    await expect(page.getByTestId('nav-pos')).toHaveCount(0);
    await expect(page.getByTestId('nav-staff')).toHaveCount(0);

    await page.getByTestId('nav-rides').click();
    await page.getByTestId('board-ride-1').click();

    // Below minAge boundary (13 < 14)
    await page.getByTestId('board-ticket-code').fill(ticketCode);
    await page.getByTestId('board-guest-age').fill('13');
    await page.getByTestId('board-guest-height').fill('1.55');
    await page.getByTestId('board-submit-btn').click();
    await expect(page.getByTestId('alert-error')).toContainText('below minimum age');

    // Exact boundary (14 yrs, 1.40m) succeeds
    await page.getByTestId('board-guest-age').fill('14');
    await page.getByTestId('board-guest-height').fill('1.40');
    await page.getByTestId('board-submit-btn').click();
    await expect(page.getByTestId('alert-success')).toContainText(`Admitted`);
  });
});

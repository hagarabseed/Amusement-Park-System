import { test, expect } from '@playwright/test';

test.describe('ParkPulse E2E Critical Journeys', () => {
  test('Manager login, customer registration, ticket POS & ride maintenance toggle', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // 1. Authenticate
    await page.getByTestId('login-email').fill('omar.manager@parkpulse.com');
    await page.getByTestId('login-password').fill('Pass@1234');
    await page.getByTestId('login-submit').click();

    await expect(page.getByTestId('stat-revenue')).toBeVisible();

    // 2. Register New Customer
    const uniqueSuffix = Date.now().toString().slice(-6);
    await page.getByTestId('nav-customers').click();
    await page.getByTestId('cust-name').fill(`Test Visitor ${uniqueSuffix}`);
    await page.getByTestId('cust-email').fill(`visitor${uniqueSuffix}@test.com`);
    await page.getByTestId('cust-phone').fill(`01099${uniqueSuffix}`);
    await page.getByTestId('cust-deposit').fill('100.00');
    await page.getByTestId('cust-submit').click();

    await expect(page.getByTestId('alert-success')).toContainText('registered successfully');

    // 3. Issue Ticket with Promo Code via Wristband
    await page.getByTestId('nav-pos').click();
    await page.getByTestId('pos-pass-select').selectOption('REGULAR');
    await page.getByTestId('pos-promo-input').fill('SUMMER20');
    await page.getByTestId('pos-issue-btn').click();

    await expect(page.getByTestId('alert-success')).toContainText('Ticket issued ($40');

    // 4. Toggle Ride Maintenance State
    await page.getByTestId('nav-rides').click();
    await page.getByTestId('toggle-maint-1').click();
    await expect(page.getByTestId('ride-status-1')).toHaveText('MAINTENANCE');
  });
});
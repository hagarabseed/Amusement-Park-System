import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCartSubtotal,
  calculateDiscountAmount,
  checkRideEligibilityLocally,
  estimateLoyaltyPoints,
  formatCurrency,
  validateCustomerForm,
} from '../../src/utils/posCalculations.ts';

test('formatCurrency handles numbers, zero, and nullish values', () => {
  assert.equal(formatCurrency(50), '$50.00');
  assert.equal(formatCurrency(12.345), '$12.35');
  assert.equal(formatCurrency(null), '$0.00');
});

test('calculateCartSubtotal and calculateDiscountAmount handle precision accurately', () => {
  const subtotal = calculateCartSubtotal([
    { price: 150, quantity: 2 },
    { price: 45.5, quantity: 1 },
  ]);
  assert.equal(subtotal, 345.5);
  assert.equal(calculateDiscountAmount(345.5, 20), 69.1);
  assert.equal(calculateDiscountAmount(0, 20), 0);
});

test('estimateLoyaltyPoints follows boundary thresholds per transaction type', () => {
  assert.equal(estimateLoyaltyPoints('TOPUP', 19.99), 0);
  assert.equal(estimateLoyaltyPoints('TOPUP', 20.0), 1);
  assert.equal(estimateLoyaltyPoints('TICKET', 9.99), 0);
  assert.equal(estimateLoyaltyPoints('TICKET', 40.0), 4);
  assert.equal(estimateLoyaltyPoints('FOOD', 14.99), 0);
  assert.equal(estimateLoyaltyPoints('FOOD', 45.0), 3);
});

test('validateCustomerForm enforces BVA and format rules', () => {
  assert.equal(
    validateCustomerForm({
      fullName: 'Sara Ali',
      email: 'sara@park.com',
      phone: '01012345678',
      initialDeposit: '0.00',
    }),
    null
  );
  assert.match(
    validateCustomerForm({
      fullName: 'A',
      email: 'sara@park.com',
      phone: '01012345678',
      initialDeposit: '10',
    })!,
    /at least 2/
  );
  assert.match(
    validateCustomerForm({
      fullName: 'Sara Ali',
      email: 'invalid-email',
      phone: '01012345678',
      initialDeposit: '10',
    })!,
    /valid email/
  );
  assert.match(
    validateCustomerForm({
      fullName: 'Sara Ali',
      email: 'sara@park.com',
      phone: '1234567',
      initialDeposit: '10',
    })!,
    /8 to 15 digits/
  );
  assert.match(
    validateCustomerForm({
      fullName: 'Sara Ali',
      email: 'sara@park.com',
      phone: '01012345678',
      initialDeposit: '-0.01',
    })!,
    /between \$0\.00/
  );
});

test('checkRideEligibilityLocally enforces maintenance and safety BVA', () => {
  assert.equal(
    checkRideEligibilityLocally({
      operational: true,
      minAge: 14,
      minHeightM: 1.4,
      guestAge: 14,
      guestHeightM: 1.4,
    }),
    null
  );
  assert.match(
    checkRideEligibilityLocally({
      operational: false,
      minAge: 14,
      minHeightM: 1.4,
      guestAge: 20,
      guestHeightM: 1.8,
    })!,
    /maintenance/
  );
  assert.match(
    checkRideEligibilityLocally({
      operational: true,
      minAge: 14,
      minHeightM: 1.4,
      guestAge: 13,
      guestHeightM: 1.5,
    })!,
    /minimum age/
  );
  assert.match(
    checkRideEligibilityLocally({
      operational: true,
      minAge: 14,
      minHeightM: 1.4,
      guestAge: 15,
      guestHeightM: 1.39,
    })!,
    /minimum height/
  );
});

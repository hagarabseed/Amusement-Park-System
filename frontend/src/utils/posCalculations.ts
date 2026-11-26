export interface CartItemLike {
  price: number;
  quantity: number;
}

export function formatCurrency(amount: number | null | undefined): string {
  const safe = Number(amount ?? 0);
  return `$${safe.toFixed(2)}`;
}

export function calculateCartSubtotal(items: CartItemLike[]): number {
  const total = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  return Math.round(total * 100) / 100;
}

export function calculateDiscountAmount(gross: number, discountPercent: number): number {
  if (gross <= 0 || discountPercent <= 0) return 0;
  return Math.round((gross * discountPercent) / 100 * 100) / 100;
}

export function estimateLoyaltyPoints(txType: 'TOPUP' | 'TICKET' | 'FOOD', netAmount: number): number {
  if (netAmount <= 0) return 0;
  const divisor = txType === 'TICKET' ? 10 : txType === 'FOOD' ? 15 : 20;
  return Math.floor(netAmount / divisor);
}

export function validateCustomerForm(input: {
  fullName: string;
  email: string;
  phone: string;
  initialDeposit: string;
}): string | null {
  if (input.fullName.trim().length < 2) {
    return 'Full name must be at least 2 characters.';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) {
    return 'Please enter a valid email address.';
  }
  if (!/^\d{8,15}$/.test(input.phone.trim())) {
    return 'Phone number must be 8 to 15 digits.';
  }
  const deposit = Number(input.initialDeposit);
  if (Number.isNaN(deposit) || deposit < 0 || deposit > 10000) {
    return 'Initial deposit must be between $0.00 and $10,000.00.';
  }
  return null;
}

export function checkRideEligibilityLocally(params: {
  operational: boolean;
  minAge: number;
  minHeightM: number;
  guestAge: number;
  guestHeightM: number;
}): string | null {
  if (!params.operational) {
    return 'Ride is closed for maintenance.';
  }
  if (params.guestAge < params.minAge) {
    return `Guest age (${params.guestAge}) is below minimum age (${params.minAge}).`;
  }
  if (params.guestHeightM < params.minHeightM) {
    return `Guest height (${params.guestHeightM.toFixed(2)}m) is below minimum height (${params.minHeightM.toFixed(2)}m).`;
  }
  return null;
}

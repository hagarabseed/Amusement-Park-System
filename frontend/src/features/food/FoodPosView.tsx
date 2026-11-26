import React, { useEffect, useState } from 'react';
import { apiFetch, formatApiError } from '../../api/client';
import { Badge } from '../../components/ui/Badge';
import { Customer, MenuItem, PaymentMethod, PromoQuote, Transaction } from '../../types';
import { calculateCartSubtotal, estimateLoyaltyPoints, formatCurrency } from '../../utils/posCalculations';

interface FoodPosViewProps {
  customers: Customer[];
  menuItems: MenuItem[];
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
  onRefreshAll: () => Promise<void>;
}

export const FoodPosView: React.FC<FoodPosViewProps> = ({
  customers,
  menuItems,
  onSuccess,
  onError,
  onRefreshAll,
}) => {
  const [customerId, setCustomerId] = useState<number>(customers[0]?.id ?? 0);
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'FOOD' | 'DRINK'>('ALL');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<{ item: MenuItem; quantity: number }[]>([]);
  const [payWithWristband, setPayWithWristband] = useState(true);
  const [promoCode, setPromoCode] = useState('');
  const [promoQuote, setPromoQuote] = useState<PromoQuote | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (customers.length > 0 && !customers.some(c => c.id === customerId)) {
      setCustomerId(customers[0].id);
    }
  }, [customers, customerId]);

  const filteredMenu = menuItems.filter(m => {
    const matchesType = categoryFilter === 'ALL' || m.itemType === categoryFilter;
    const matchesQuery = !search.trim() || m.name.toLowerCase().includes(search.trim().toLowerCase());
    return matchesType && matchesQuery;
  });

  const addToCart = (item: MenuItem) => {
    setPromoQuote(null);
    setCart(prev => {
      const existing = prev.find(e => e.item.id === item.id);
      if (existing) {
        return prev.map(e => (e.item.id === item.id ? { ...e, quantity: e.quantity + 1 } : e));
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId: number, delta: number) => {
    setPromoQuote(null);
    setCart(prev =>
      prev
        .map(e => (e.item.id === itemId ? { ...e, quantity: e.quantity + delta } : e))
        .filter(e => e.quantity > 0)
    );
  };

  const subtotal = calculateCartSubtotal(cart.map(c => ({ price: c.item.price, quantity: c.quantity })));
  const discount = promoQuote && promoQuote.grossAmount === subtotal ? Number(promoQuote.discountAmount) : 0;
  const netTotal = subtotal - discount;

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      setPromoQuote(null);
      return;
    }
    if (subtotal <= 0) {
      onError('Add at least one item before applying a promo code.');
      return;
    }
    try {
      const quote = await apiFetch<PromoQuote>(
        `/pos/offers/validate?code=${encodeURIComponent(promoCode.trim())}&amount=${subtotal}`
      );
      setPromoQuote(quote);
      onSuccess(`Promo ${quote.code} applied (-${formatCurrency(quote.discountAmount)})`);
    } catch (err) {
      setPromoQuote(null);
      onError(formatApiError(err));
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      onError('Cart is empty. Add menu items before checking out.');
      return;
    }
    if (!customerId) {
      onError('Please select a customer.');
      return;
    }
    setSubmitting(true);
    try {
      const method: PaymentMethod = payWithWristband ? 'WRISTBAND' : 'CASH';
      const res = await apiFetch<Transaction>('/pos/food-orders', {
        method: 'POST',
        body: JSON.stringify({
          customerId,
          paymentMethod: method,
          promoCode: promoCode.trim() || null,
          items: cart.map(e => ({ menuItemId: e.item.id, quantity: e.quantity })),
        }),
      });
      setCart([]);
      setPromoCode('');
      setPromoQuote(null);
      await onRefreshAll();
      onSuccess(
        `Food order completed (${formatCurrency(res.netAmount)}). Remaining balance: ${formatCurrency(res.updatedBalance)}`
      );
    } catch (err) {
      onError(formatApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left: Menu Catalog */}
      <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-200 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-bold text-slate-900">Food & Beverage Menu</h2>
            <div className="flex gap-1.5">
              {(['ALL', 'FOOD', 'DRINK'] as const).map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    categoryFilter === cat
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'ALL' ? 'All Items' : cat === 'FOOD' ? 'Food' : 'Drinks'}
                </button>
              ))}
            </div>
          </div>
          <input
            placeholder="Filter menu items..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 text-sm outline-none"
          />
        </div>

        <div className="overflow-x-auto">
          <table data-testid="menu-table" className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-4 font-semibold">Item</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold text-right">Price</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMenu.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500">
                    No menu items match your filter.
                  </td>
                </tr>
              ) : (
                filteredMenu.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-semibold text-slate-900">{item.name}</td>
                    <td className="py-3 px-4">
                      <Badge tone={item.itemType === 'FOOD' ? 'amber' : 'blue'}>
                        {item.subCategory}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right font-mono-num font-semibold text-slate-900">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        data-testid={`add-menu-${item.id}`}
                        onClick={() => addToCart(item)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                      >
                        + Add
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right: Order Cart */}
      <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 space-y-4 h-fit">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3">
          Current Order Cart
        </h2>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Visitor Account</label>
          <select
            data-testid="food-customer-select"
            value={customerId}
            onChange={e => setCustomerId(Number(e.target.value))}
            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none"
          >
            {customers.map(c => (
              <option key={c.id} value={c.id}>
                {c.fullName} (Bal: {formatCurrency(c.wristbandBalance)})
              </option>
            ))}
          </select>
        </div>

        {cart.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-slate-300 rounded-xl bg-slate-50">
            Cart is empty. Select items from the menu to build an order.
          </div>
        ) : (
          <div className="space-y-2">
            {cart.map(entry => (
              <div
                key={entry.item.id}
                className="flex items-center justify-between gap-2 bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-lg text-sm"
              >
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900 truncate">{entry.item.name}</div>
                  <div className="text-xs text-slate-500 font-mono-num">
                    {formatCurrency(entry.item.price)} each
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => updateQuantity(entry.item.id, -1)}
                    className="w-6 h-6 rounded border border-slate-300 bg-white hover:bg-slate-100 text-xs font-bold"
                  >
                    -
                  </button>
                  <span className="w-6 text-center font-mono-num text-xs font-bold">{entry.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(entry.item.id, 1)}
                    className="w-6 h-6 rounded border border-slate-300 bg-white hover:bg-slate-100 text-xs font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <input
            data-testid="food-promo-input"
            placeholder="Promo code (Optional)"
            value={promoCode}
            onChange={e => {
              setPromoCode(e.target.value);
              setPromoQuote(null);
            }}
            className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm uppercase font-mono-num outline-none"
          />
          <button
            type="button"
            onClick={handleApplyPromo}
            className="px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-semibold"
          >
            Apply
          </button>
        </div>

        <label className="flex items-center gap-2 text-xs text-slate-700">
          <input
            data-testid="food-wristband-checkbox"
            type="checkbox"
            checked={payWithWristband}
            onChange={e => setPayWithWristband(e.target.checked)}
          />
          Pay with RFID Wristband Balance (uncheck for Cash)
        </label>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span data-testid="food-cart-total" className="font-mono-num font-semibold">
              {formatCurrency(subtotal)}
            </span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-emerald-700 font-medium">
              <span>Discount ({promoQuote?.code})</span>
              <span className="font-mono-num">-{formatCurrency(discount)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-200 text-base">
            <span>Total</span>
            <span className="font-mono-num text-emerald-700">{formatCurrency(netTotal)}</span>
          </div>
          <div className="text-xs text-slate-500">
            Earns +{estimateLoyaltyPoints('FOOD', netTotal)} loyalty point(s)
          </div>
        </div>

        <button
          data-testid="food-checkout-btn"
          type="button"
          disabled={submitting || cart.length === 0}
          onClick={handleCheckout}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-2.5 rounded-lg font-semibold text-sm transition shadow-xs"
        >
          {submitting ? 'Settling Order...' : 'Checkout Food Order'}
        </button>
      </div>
    </div>
  );
};

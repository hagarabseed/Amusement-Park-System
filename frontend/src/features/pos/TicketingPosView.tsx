import React, { useEffect, useState } from 'react';
import { apiFetch, formatApiError } from '../../api/client';
import { Badge } from '../../components/ui/Badge';
import { Customer, PassType, PaymentMethod, PosCatalog, PromoQuote, Transaction } from '../../types';
import { estimateLoyaltyPoints, formatCurrency } from '../../utils/posCalculations';

interface TicketingPosViewProps {
  customers: Customer[];
  catalog: PosCatalog | null;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
  onRefreshAll: () => Promise<void>;
}

export const TicketingPosView: React.FC<TicketingPosViewProps> = ({
  customers,
  catalog,
  onSuccess,
  onError,
  onRefreshAll,
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<number>(customers[0]?.id ?? 0);
  const [passType, setPassType] = useState<PassType>('REGULAR');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('WRISTBAND');
  const [promoCode, setPromoCode] = useState('');
  const [promoQuote, setPromoQuote] = useState<PromoQuote | null>(null);
  const [topupAmount, setTopupAmount] = useState('50.00');
  const [lastIssuedTx, setLastIssuedTx] = useState<Transaction | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (customers.length > 0 && !customers.some(c => c.id === selectedCustomerId)) {
      setSelectedCustomerId(customers[0].id);
    }
  }, [customers, selectedCustomerId]);

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  const passes = catalog?.passes ?? [
    { passType: 'REGULAR' as PassType, label: 'Regular Day Pass', basePrice: 50, perks: 'Standard attractions' },
    { passType: 'VIP_FASTPASS' as PassType, label: 'VIP FastPass', basePrice: 75, perks: 'Priority boarding lane' },
    { passType: 'FAMILY' as PassType, label: 'Family Bundle Pass', basePrice: 160, perks: 'Group entry for up to 4' },
  ];
  const currentPass = passes.find(p => p.passType === passType) ?? passes[0];
  const grossPrice = Number(currentPass.basePrice);
  const effectiveDiscount =
    promoQuote && promoQuote.grossAmount === grossPrice ? Number(promoQuote.discountAmount) : 0;
  const netPrice = grossPrice - effectiveDiscount;

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      setPromoQuote(null);
      return;
    }
    try {
      const quote = await apiFetch<PromoQuote>(
        `/pos/offers/validate?code=${encodeURIComponent(promoCode.trim())}&amount=${grossPrice}`
      );
      setPromoQuote(quote);
      onSuccess(`Promo ${quote.code} applied: ${quote.discountPercent}% off (-${formatCurrency(quote.discountAmount)})`);
    } catch (err) {
      setPromoQuote(null);
      onError(formatApiError(err));
    }
  };

  const handleIssueTicket = async () => {
    if (!selectedCustomerId) {
      onError('Please register or select a visitor first.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiFetch<Transaction>('/pos/tickets', {
        method: 'POST',
        body: JSON.stringify({
          customerId: selectedCustomerId,
          passType,
          paymentMethod,
          promoCode: promoCode.trim() || null,
        }),
      });
      setLastIssuedTx(res);
      setPromoQuote(null);
      await onRefreshAll();
      onSuccess(
        `Ticket issued (${formatCurrency(res.netAmount)}) · Code: ${res.ticketCode}. Remaining balance: ${formatCurrency(res.updatedBalance)}`
      );
    } catch (err) {
      onError(formatApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      onError('Please register or select a visitor first.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiFetch<Transaction>('/pos/topup', {
        method: 'POST',
        body: JSON.stringify({
          customerId: selectedCustomerId,
          amount: parseFloat(topupAmount),
        }),
      });
      setTopupAmount('50.00');
      await onRefreshAll();
      onSuccess(
        `Wristband topped up by ${formatCurrency(res.netAmount)}. New balance: ${formatCurrency(res.updatedBalance)}`
      );
    } catch (err) {
      onError(formatApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left: Ticket Pass POS */}
      <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Issue Park Admission Pass</h2>
            <p className="text-xs text-slate-500">Generates a scannable PKP pass code for ride boarding</p>
          </div>
          {selectedCustomer && (
            <div className="text-right">
              <div className="text-xs text-slate-500">Wallet Balance</div>
              <div className="text-base font-bold font-mono-num text-emerald-700">
                {formatCurrency(selectedCustomer.wristbandBalance)}
              </div>
            </div>
          )}
        </div>

        {/* Visitor Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Target Visitor</label>
          <select
            data-testid="pos-customer-select"
            value={selectedCustomerId}
            onChange={e => setSelectedCustomerId(Number(e.target.value))}
            className="w-full bg-white border border-slate-300 focus:border-blue-500 rounded-lg px-3 py-2 text-sm outline-none"
          >
            {customers.length === 0 && <option value={0}>No registered visitors available</option>}
            {customers.map(c => (
              <option key={c.id} value={c.id}>
                {c.fullName} — Bal: {formatCurrency(c.wristbandBalance)} ({c.loyaltyPoints} pts)
              </option>
            ))}
          </select>
        </div>

        {/* Pass Tier Selection (Accessible Select + Visual Cards) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-700">Pass Tier</label>
            <select
              data-testid="pos-pass-select"
              value={passType}
              onChange={e => {
                setPassType(e.target.value as PassType);
                setPromoQuote(null);
              }}
              className="bg-slate-50 border border-slate-300 rounded-md px-2.5 py-1 text-xs font-medium"
            >
              {passes.map(p => (
                <option key={p.passType} value={p.passType}>
                  {p.label} ({formatCurrency(p.basePrice)})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {passes.map(p => {
              const selected = p.passType === passType;
              return (
                <button
                  key={p.passType}
                  type="button"
                  onClick={() => {
                    setPassType(p.passType);
                    setPromoQuote(null);
                  }}
                  className={`text-left p-3.5 rounded-xl border transition ${
                    selected
                      ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-600/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-900">{p.label}</div>
                  <div className="text-lg font-bold font-mono-num text-blue-700 mt-1">
                    {formatCurrency(p.basePrice)}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 leading-snug">{p.perks}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Promo Code & Preview */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Promo Code (Optional)</label>
          <div className="flex gap-2">
            <input
              data-testid="pos-promo-input"
              placeholder="e.g. SUMMER20 or VIP10"
              value={promoCode}
              onChange={e => {
                setPromoCode(e.target.value);
                setPromoQuote(null);
              }}
              className="flex-1 bg-white border border-slate-300 focus:border-blue-500 rounded-lg px-3 py-2 text-sm uppercase font-mono-num outline-none"
            />
            <button
              type="button"
              data-testid="pos-promo-apply-btn"
              onClick={handleApplyPromo}
              className="px-4 py-2 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-800"
            >
              Preview Quote
            </button>
          </div>
          {catalog && catalog.activeOffers.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {catalog.activeOffers.map(o => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => {
                    setPromoCode(o.code);
                    setPromoQuote(null);
                  }}
                  className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 hover:bg-blue-50 text-slate-700 border border-slate-200 font-mono-num"
                >
                  {o.code} ({o.discountPercent}% off{Number(o.minSpend) > 0 ? ` · min $${o.minSpend}` : ''})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Payment Method Segmented Control + Legacy Checkbox TestID Compatibility */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700">Payment Method</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod('WRISTBAND')}
              className={`py-2 px-3 rounded-lg border text-xs font-semibold transition ${
                paymentMethod === 'WRISTBAND'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              RFID Wristband Wallet
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('CASH')}
              className={`py-2 px-3 rounded-lg border text-xs font-semibold transition ${
                paymentMethod === 'CASH'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              Cash Tender
            </button>
          </div>
          <label className="flex items-center gap-2 text-xs text-slate-600 pt-1">
            <input
              data-testid="pos-wristband-checkbox"
              type="checkbox"
              checked={paymentMethod === 'WRISTBAND'}
              onChange={e => setPaymentMethod(e.target.checked ? 'WRISTBAND' : 'CASH')}
            />
            Deduct directly from visitor&apos;s RFID wristband balance
          </label>
        </div>

        {/* Order Summary Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Pass Base Price</span>
            <span className="font-mono-num">{formatCurrency(grossPrice)}</span>
          </div>
          {effectiveDiscount > 0 && (
            <div className="flex justify-between text-emerald-700 font-medium">
              <span>Promo Discount ({promoQuote?.code})</span>
              <span className="font-mono-num">-{formatCurrency(effectiveDiscount)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-200 text-base">
            <span>Total Due</span>
            <span className="font-mono-num">{formatCurrency(netPrice)}</span>
          </div>
          <div className="text-xs text-slate-500">
            Earns +{estimateLoyaltyPoints('TICKET', netPrice)} loyalty points
          </div>
        </div>

        <button
          data-testid="pos-issue-btn"
          type="button"
          disabled={submitting || !selectedCustomerId}
          onClick={handleIssueTicket}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-lg font-semibold text-sm transition shadow-xs"
        >
          {submitting ? 'Processing...' : `Issue ${currentPass.label}`}
        </button>

        {lastIssuedTx && lastIssuedTx.ticketCode && (
          <div
            data-testid="issued-ticket-card"
            className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between"
          >
            <div>
              <div className="text-xs font-semibold text-emerald-800 uppercase">Last Issued Pass</div>
              <div className="text-lg font-bold font-mono-num text-emerald-950 mt-0.5">
                {lastIssuedTx.ticketCode}
              </div>
              <div className="text-xs text-emerald-700">
                Visitor: {lastIssuedTx.customerName} · Paid {formatCurrency(lastIssuedTx.netAmount)}
              </div>
            </div>
            <Badge tone="emerald">ACTIVE</Badge>
          </div>
        )}
      </div>

      {/* Right: Wristband Top-Up */}
      <div className="lg:col-span-5 space-y-6">
        <form
          onSubmit={handleTopUp}
          className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"
        >
          <div>
            <h2 className="text-lg font-bold text-slate-900">RFID Wristband Top-Up</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Loads cash funds onto {selectedCustomer ? selectedCustomer.fullName : 'selected visitor'}&apos;s wristband (1 pt per $20).
            </p>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {['20.00', '50.00', '100.00', '200.00'].map(preset => (
              <button
                key={preset}
                type="button"
                onClick={() => setTopupAmount(preset)}
                className={`py-2 rounded-lg border text-xs font-mono-num font-semibold transition ${
                  topupAmount === preset
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                }`}
              >
                +${Number(preset)}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Top-Up Amount ($)</label>
            <input
              data-testid="pos-topup-input"
              type="number"
              step="0.01"
              min="1"
              max="5000"
              value={topupAmount}
              onChange={e => setTopupAmount(e.target.value)}
              className="w-full bg-white border border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm font-mono-num outline-none"
              required
            />
            <p className="text-xs text-slate-500 mt-1">
              Bonus: +{estimateLoyaltyPoints('TOPUP', parseFloat(topupAmount) || 0)} loyalty point(s)
            </p>
          </div>

          <button
            data-testid="pos-topup-btn"
            type="submit"
            disabled={submitting || !selectedCustomerId}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-2.5 rounded-lg font-semibold text-sm transition shadow-xs"
          >
            Add Funds to Wristband
          </button>
        </form>

        {selectedCustomer && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Selected Wallet Snapshot
            </div>
            <div className="text-base font-bold text-slate-900">{selectedCustomer.fullName}</div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-500">Current Balance</div>
                <div className="text-lg font-bold font-mono-num text-emerald-700">
                  {formatCurrency(selectedCustomer.wristbandBalance)}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-500">Loyalty Points</div>
                <div className="text-lg font-bold font-mono-num text-blue-700">
                  {selectedCustomer.loyaltyPoints} pts
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

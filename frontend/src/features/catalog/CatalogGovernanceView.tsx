import React, { useState } from 'react';
import { apiFetch, formatApiError } from '../../api/client';
import { Badge } from '../../components/ui/Badge';
import { MenuItem, Offer } from '../../types';
import { formatCurrency } from '../../utils/posCalculations';

interface CatalogGovernanceViewProps {
  offers: Offer[];
  allMenuItems: MenuItem[];
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
  onRefreshAll: () => Promise<void>;
}

export const CatalogGovernanceView: React.FC<CatalogGovernanceViewProps> = ({
  offers,
  allMenuItems,
  onSuccess,
  onError,
  onRefreshAll,
}) => {
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [discountPercent, setDiscountPercent] = useState('15');
  const [minSpend, setMinSpend] = useState('0.00');

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await apiFetch<Offer>('/pos/offers', {
        method: 'POST',
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          title: title.trim(),
          discountPercent: parseInt(discountPercent, 10),
          minSpend: parseFloat(minSpend),
        }),
      });
      setCode('');
      setTitle('');
      await onRefreshAll();
      onSuccess(`Promo campaign ${created.code} (${created.discountPercent}% off) created.`);
    } catch (err) {
      onError(formatApiError(err));
    }
  };

  const handleToggleOffer = async (offer: Offer) => {
    try {
      const updated = await apiFetch<Offer>(`/pos/offers/${offer.id}/toggle`, { method: 'PATCH' });
      await onRefreshAll();
      onSuccess(`Promo ${updated.code} is now ${updated.active ? 'ACTIVE' : 'PAUSED'}.`);
    } catch (err) {
      onError(formatApiError(err));
    }
  };

  const handleToggleMenu = async (item: MenuItem) => {
    try {
      const updated = await apiFetch<MenuItem>(`/menu/${item.id}/availability`, { method: 'PATCH' });
      await onRefreshAll();
      onSuccess(`Menu item "${updated.name}" marked ${updated.available ? 'Available' : 'Out of Stock'}.`);
    } catch (err) {
      onError(formatApiError(err));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Promo Campaigns */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-slate-200">
            <h2 className="text-base font-bold text-slate-900">Promo Code Campaigns</h2>
            <p className="text-xs text-slate-500">Activate or pause discount campaigns across Ticketing & Food POS</p>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="py-3 px-4 font-semibold">Code</th>
                <th className="py-3 px-4 font-semibold">Discount</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {offers.map(o => (
                <tr key={o.id}>
                  <td className="py-3 px-4">
                    <div className="font-mono-num font-bold text-slate-900">{o.code}</div>
                    <div className="text-xs text-slate-500">{o.title}</div>
                  </td>
                  <td className="py-3 px-4 text-xs font-mono-num">
                    <span className="font-bold text-blue-700">{o.discountPercent}% off</span>
                    {Number(o.minSpend) > 0 && (
                      <div className="text-slate-500">Min {formatCurrency(o.minSpend)}</div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <Badge tone={o.active ? 'emerald' : 'slate'}>{o.active ? 'ACTIVE' : 'INACTIVE'}</Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleToggleOffer(o)}
                      className="px-3 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold"
                    >
                      {o.active ? 'Pause' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form onSubmit={handleCreateOffer} className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Launch New Promo Code</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              data-testid="offer-code-input"
              placeholder="Code (e.g. SPRING15)"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono-num uppercase"
              required
            />
            <input
              data-testid="offer-title-input"
              placeholder="Campaign title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
              required
            />
            <input
              data-testid="offer-discount-input"
              type="number"
              min="1"
              max="100"
              placeholder="Discount %"
              value={discountPercent}
              onChange={e => setDiscountPercent(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono-num"
              required
            />
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Min Spend ($)"
              value={minSpend}
              onChange={e => setMinSpend(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono-num"
              required
            />
          </div>
          <button
            data-testid="offer-submit-btn"
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-semibold"
          >
            Create Promo Campaign
          </button>
        </form>
      </div>

      {/* Menu Availability */}
      <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl overflow-hidden h-fit">
        <div className="p-5 border-b border-slate-200">
          <h2 className="text-base font-bold text-slate-900">Food Court Stock Control</h2>
          <p className="text-xs text-slate-500">Toggle item availability on Cashier POS terminals</p>
        </div>
        <div className="divide-y divide-slate-100">
          {allMenuItems.map(item => (
            <div key={item.id} className="px-5 py-3 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-900">{item.name}</div>
                <div className="text-xs text-slate-500 font-mono-num">
                  {item.subCategory} · {formatCurrency(item.price)}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleToggleMenu(item)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold border transition ${
                  item.available
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                }`}
              >
                {item.available ? 'In Stock' : 'Sold Out'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

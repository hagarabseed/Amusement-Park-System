import React, { useState } from 'react';
import { apiFetch, formatApiError } from '../../api/client';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Customer, CustomerDetail, PageResponse } from '../../types';
import { formatCurrency, validateCustomerForm } from '../../utils/posCalculations';

interface CustomersViewProps {
  customersPage: PageResponse<Customer>;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit: (q: string, page?: number) => void;
  onCustomerCreated: (msg: string) => void;
  onError: (msg: string) => void;
  onRefreshAll: () => Promise<void>;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customersPage,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onCustomerCreated,
  onError,
  onRefreshAll,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [initialDeposit, setInitialDeposit] = useState('50.00');
  const [submitting, setSubmitting] = useState(false);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<CustomerDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [redeemPoints, setRedeemPoints] = useState('100');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErr = validateCustomerForm({ fullName, email, phone, initialDeposit });
    if (validationErr) {
      onError(validationErr);
      return;
    }

    setSubmitting(true);
    try {
      await apiFetch<Customer>('/customers', {
        method: 'POST',
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          initialDeposit: parseFloat(initialDeposit),
        }),
      });
      const registeredName = fullName.trim();
      setFullName('');
      setEmail('');
      setPhone('');
      setInitialDeposit('50.00');
      await onRefreshAll();
      onCustomerCreated(`Visitor "${registeredName}" registered successfully with 10 welcome loyalty points.`);
    } catch (err) {
      onError(formatApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const openCustomerDetail = async (id: number) => {
    setDetailModalOpen(true);
    setDetailLoading(true);
    try {
      const detail = await apiFetch<CustomerDetail>(`/customers/${id}`);
      setSelectedDetail(detail);
    } catch (err) {
      onError(formatApiError(err));
      setDetailModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleRedeemLoyalty = async () => {
    if (!selectedDetail) return;
    try {
      const res = await apiFetch<{ creditAmount: number; pointsRedeemed: number }>('/pos/loyalty/redeem', {
        method: 'POST',
        body: JSON.stringify({
          customerId: selectedDetail.profile.id,
          points: parseInt(redeemPoints, 10),
        }),
      });
      await onRefreshAll();
      const updatedDetail = await apiFetch<CustomerDetail>(`/customers/${selectedDetail.profile.id}`);
      setSelectedDetail(updatedDetail);
      onCustomerCreated(
        `Redeemed ${res.pointsRedeemed} points for ${formatCurrency(res.creditAmount)} wristband credit.`
      );
    } catch (err) {
      onError(formatApiError(err));
    }
  };

  const customers = customersPage.content;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Directory Table */}
      <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Registered Park Visitors</h2>
            <p className="text-xs text-slate-500">
              {customersPage.totalElements} total wallet account(s)
            </p>
          </div>
          <form
            onSubmit={e => {
              e.preventDefault();
              onSearchSubmit(searchQuery, 0);
            }}
            className="flex gap-2"
          >
            <input
              data-testid="cust-search-input"
              placeholder="Search name, email, phone..."
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              className="bg-white border border-slate-300 focus:border-blue-500 rounded-lg px-3 py-1.5 text-sm outline-none w-52 sm:w-64"
            />
            <button
              data-testid="cust-search-btn"
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-lg text-sm font-medium transition"
            >
              Search
            </button>
          </form>
        </div>

        <div className="overflow-x-auto flex-1">
          <table data-testid="customers-table" className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-4 font-semibold">Visitor</th>
                <th className="py-3 px-4 font-semibold">Contact</th>
                <th className="py-3 px-4 font-semibold text-right">RFID Balance</th>
                <th className="py-3 px-4 font-semibold text-right">Points</th>
                <th className="py-3 px-4 font-semibold text-right">Wallet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-500">
                    No matching visitors found.
                  </td>
                </tr>
              ) : (
                customers.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{c.fullName}</div>
                      <div className="text-xs text-slate-400 font-mono-num">ID #{c.id}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-700">{c.email}</div>
                      <div className="text-xs text-slate-500 font-mono-num">{c.phone}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono-num font-bold text-emerald-700">
                      {formatCurrency(c.wristbandBalance)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono-num text-slate-700">
                      {c.loyaltyPoints} pts
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        data-testid={`view-customer-${c.id}`}
                        onClick={() => openCustomerDetail(c.id)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition"
                      >
                        Inspect Wallet
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {customersPage.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
            <span>
              Page {customersPage.number + 1} of {customersPage.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={customersPage.number === 0}
                onClick={() => onSearchSubmit(searchQuery, customersPage.number - 1)}
                className="px-3 py-1 rounded border border-slate-300 bg-white disabled:opacity-40 font-medium"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={customersPage.number + 1 >= customersPage.totalPages}
                onClick={() => onSearchSubmit(searchQuery, customersPage.number + 1)}
                className="px-3 py-1 rounded border border-slate-300 bg-white disabled:opacity-40 font-medium"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Register Visitor Form */}
      <form
        onSubmit={handleCreate}
        className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 h-fit"
      >
        <div>
          <h3 className="text-base font-bold text-slate-900">Register New Visitor</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Provisions an RFID wristband wallet with 10 welcome loyalty points.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
          <input
            data-testid="cust-name"
            placeholder="e.g. Mariam Adel"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            className="w-full bg-white border border-slate-300 focus:border-blue-500 rounded-lg px-3 py-2 text-sm outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
          <input
            data-testid="cust-email"
            type="email"
            placeholder="visitor@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-white border border-slate-300 focus:border-blue-500 rounded-lg px-3 py-2 text-sm outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Phone (8–15 digits)</label>
          <input
            data-testid="cust-phone"
            placeholder="01012345678"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="w-full bg-white border border-slate-300 focus:border-blue-500 rounded-lg px-3 py-2 text-sm outline-none font-mono-num"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Wristband Deposit ($)</label>
          <input
            data-testid="cust-deposit"
            type="number"
            step="0.01"
            min="0"
            max="10000"
            value={initialDeposit}
            onChange={e => setInitialDeposit(e.target.value)}
            className="w-full bg-white border border-slate-300 focus:border-blue-500 rounded-lg px-3 py-2 text-sm outline-none font-mono-num"
            required
          />
        </div>

        <button
          data-testid="cust-submit"
          type="submit"
          disabled={submitting}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white py-2.5 rounded-lg font-semibold text-sm transition shadow-xs"
        >
          {submitting ? 'Registering...' : 'Create Visitor Wallet'}
        </button>
      </form>

      {/* Customer Detail Modal */}
      <Modal
        open={detailModalOpen}
        title={selectedDetail ? selectedDetail.profile.fullName : 'Visitor Wallet'}
        subtitle={selectedDetail ? `${selectedDetail.profile.email} · ${selectedDetail.profile.phone}` : ''}
        onClose={() => setDetailModalOpen(false)}
        maxWidth="max-w-2xl"
      >
        {detailLoading || !selectedDetail ? (
          <div className="py-8 text-center text-sm text-slate-500">Loading wallet records...</div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="text-xs font-semibold text-emerald-800 uppercase">RFID Balance</div>
                <div className="text-2xl font-bold font-mono-num text-emerald-900 mt-1">
                  {formatCurrency(selectedDetail.profile.wristbandBalance)}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                <div className="text-xs font-semibold text-blue-800 uppercase">Loyalty Points</div>
                <div className="text-2xl font-bold font-mono-num text-blue-900 mt-1">
                  {selectedDetail.profile.loyaltyPoints} pts
                </div>
              </div>
            </div>

            {/* Loyalty Points Redemption */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-900">Redeem Loyalty Points</div>
                <div className="text-xs text-slate-500">Every 100 points converts to $10.00 wristband credit</div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  data-testid="loyalty-redeem-select"
                  value={redeemPoints}
                  onChange={e => setRedeemPoints(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm"
                >
                  <option value="100">100 pts → $10.00</option>
                  <option value="200">200 pts → $20.00</option>
                  <option value="500">500 pts → $50.00</option>
                </select>
                <button
                  type="button"
                  data-testid="loyalty-redeem-btn"
                  disabled={selectedDetail.profile.loyaltyPoints < Number(redeemPoints)}
                  onClick={handleRedeemLoyalty}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold"
                >
                  Redeem
                </button>
              </div>
            </div>

            {/* Active Tickets */}
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-2">Issued Park Passes ({selectedDetail.tickets.length})</h4>
              {selectedDetail.tickets.length === 0 ? (
                <p className="text-xs text-slate-500">No passes issued to this visitor yet.</p>
              ) : (
                <div className="space-y-2">
                  {selectedDetail.tickets.map(t => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-200 text-xs"
                    >
                      <div>
                        <span className="font-mono-num font-bold text-slate-900">{t.ticketCode}</span>
                        <span className="mx-2 text-slate-300">|</span>
                        <span className="font-semibold text-slate-700">{t.passType}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">{t.boardingsCount} ride(s)</span>
                        <Badge tone={t.status === 'ACTIVE' ? 'emerald' : 'slate'}>{t.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Transactions */}
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-2">Recent Transactions</h4>
              {selectedDetail.recentTransactions.length === 0 ? (
                <p className="text-xs text-slate-500">No transactions yet.</p>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg">
                  {selectedDetail.recentTransactions.map(tx => (
                    <div key={tx.id} className="px-3 py-2 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-slate-900">{tx.txType}</span>
                        <span className="text-slate-500 ml-2">{tx.referenceNote || tx.paymentMethod}</span>
                      </div>
                      <div className="font-mono-num font-semibold text-slate-900">
                        {formatCurrency(tx.netAmount)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

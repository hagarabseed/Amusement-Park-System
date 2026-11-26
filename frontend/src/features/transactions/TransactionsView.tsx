import React, { useEffect, useState } from 'react';
import { apiFetch, formatApiError } from '../../api/client';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { PageResponse, Transaction, TransactionReceipt, TransactionType } from '../../types';
import { formatCurrency } from '../../utils/posCalculations';

interface TransactionsViewProps {
  onError: (msg: string) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({ onError }) => {
  const [txPage, setTxPage] = useState<PageResponse<Transaction> | null>(null);
  const [typeFilter, setTypeFilter] = useState<'' | TransactionType>('');
  const [mineOnly, setMineOnly] = useState(false);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);

  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [receipt, setReceipt] = useState<TransactionReceipt | null>(null);

  const loadTransactions = async (targetPage = page, targetType = typeFilter, targetMine = mineOnly) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(targetPage));
      params.set('size', '12');
      if (targetType) params.set('type', targetType);
      if (targetMine) params.set('mineOnly', 'true');
      const data = await apiFetch<PageResponse<Transaction>>(`/pos/transactions?${params.toString()}`);
      setTxPage(data);
    } catch (err) {
      onError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions(0, typeFilter, mineOnly);
    setPage(0);
  }, [typeFilter, mineOnly]);

  const openReceipt = async (id: number) => {
    try {
      const data = await apiFetch<TransactionReceipt>(`/pos/transactions/${id}/receipt`);
      setReceipt(data);
      setReceiptModalOpen(true);
    } catch (err) {
      onError(formatApiError(err));
    }
  };

  const exportCsv = () => {
    if (!txPage || txPage.content.length === 0) return;
    const headers = ['ID', 'Type', 'Customer', 'Method', 'Gross', 'Discount', 'Net', 'Points', 'TicketCode', 'Staff', 'Date'];
    const rows = txPage.content.map(t => [
      t.id,
      t.txType,
      `"${t.customerName.replace(/"/g, '""')}"`,
      t.paymentMethod,
      t.grossAmount,
      t.discountAmount,
      t.netAmount,
      t.pointsEarned,
      t.ticketCode || '',
      t.processedByEmail || '',
      t.createdAt,
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `parkpulse-transactions-p${page + 1}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">Transactions & Receipts Ledger</h2>
          <p className="text-xs text-slate-500">
            {txPage ? `${txPage.totalElements} recorded financial transaction(s)` : 'Loading ledger...'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            data-testid="tx-type-filter"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value as '' | TransactionType)}
            className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-medium"
          >
            <option value="">All Types</option>
            <option value="TICKET">Ticket Passes</option>
            <option value="FOOD">Food Court</option>
            <option value="TOPUP">Wristband Top-Ups</option>
          </select>

          <label className="flex items-center gap-1.5 text-xs text-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50">
            <input
              type="checkbox"
              checked={mineOnly}
              onChange={e => setMineOnly(e.target.checked)}
            />
            My Terminal Only
          </label>

          <button
            type="button"
            onClick={exportCsv}
            disabled={!txPage || txPage.content.length === 0}
            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 text-xs font-semibold text-slate-700"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table data-testid="transactions-table" className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="py-3 px-4 font-semibold">Tx #</th>
              <th className="py-3 px-4 font-semibold">Visitor</th>
              <th className="py-3 px-4 font-semibold">Type / Method</th>
              <th className="py-3 px-4 font-semibold text-right">Net Amount</th>
              <th className="py-3 px-4 font-semibold">Reference</th>
              <th className="py-3 px-4 font-semibold text-right">Receipt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-500">
                  Loading transactions...
                </td>
              </tr>
            ) : !txPage || txPage.content.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-500">
                  No transactions recorded matching the selected filters.
                </td>
              </tr>
            ) : (
              txPage.content.map(tx => (
                <tr key={tx.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-mono-num text-xs font-semibold text-slate-500">
                    #{tx.id}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{tx.customerName}</div>
                    <div className="text-xs text-slate-400">
                      {new Date(tx.createdAt).toLocaleString()}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <Badge
                        tone={
                          tx.txType === 'TICKET' ? 'blue' : tx.txType === 'FOOD' ? 'amber' : 'emerald'
                        }
                      >
                        {tx.txType}
                      </Badge>
                      <span className="text-xs text-slate-500">{tx.paymentMethod}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono-num font-bold text-slate-900">
                    {formatCurrency(tx.netAmount)}
                    {Number(tx.discountAmount) > 0 && (
                      <div className="text-[11px] font-normal text-emerald-700">
                        -{formatCurrency(tx.discountAmount)} ({tx.promoCode})
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-600 font-mono-num">
                    {tx.ticketCode || tx.referenceNote || '—'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      data-testid={`view-receipt-${tx.id}`}
                      onClick={() => openReceipt(tx.id)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1.5 rounded-lg"
                    >
                      Receipt
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {txPage && txPage.totalPages > 1 && (
        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
          <span>
            Page {txPage.number + 1} of {txPage.totalPages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => {
                const next = page - 1;
                setPage(next);
                loadTransactions(next, typeFilter, mineOnly);
              }}
              className="px-3 py-1 rounded border border-slate-300 bg-white disabled:opacity-40 font-medium"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page + 1 >= txPage.totalPages}
              onClick={() => {
                const next = page + 1;
                setPage(next);
                loadTransactions(next, typeFilter, mineOnly);
              }}
              className="px-3 py-1 rounded border border-slate-300 bg-white disabled:opacity-40 font-medium"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      <Modal
        open={receiptModalOpen}
        title={receipt ? `Receipt #${receipt.transaction.id}` : 'Receipt'}
        subtitle={receipt ? new Date(receipt.transaction.createdAt).toLocaleString() : ''}
        onClose={() => setReceiptModalOpen(false)}
      >
        {receipt && (
          <div className="space-y-4 text-sm">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Visitor</span>
                <span className="font-semibold text-slate-900">{receipt.transaction.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Processed By</span>
                <span className="font-mono-num text-slate-800">{receipt.transaction.processedByEmail || 'System'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Method</span>
                <span className="font-semibold text-slate-900">{receipt.transaction.paymentMethod}</span>
              </div>
            </div>

            {receipt.ticket && (
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-blue-800">Issued Park Pass</div>
                  <div className="text-lg font-bold font-mono-num text-blue-950">{receipt.ticket.ticketCode}</div>
                  <div className="text-xs text-blue-700">{receipt.ticket.passType}</div>
                </div>
                <Badge tone="blue">{receipt.ticket.status}</Badge>
              </div>
            )}

            {receipt.foodItems.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">Itemized Food Order</h4>
                <div className="border border-slate-200 rounded-lg divide-y divide-slate-100">
                  {receipt.foodItems.map(line => (
                    <div key={line.menuItemId} className="px-3 py-2 flex justify-between text-xs">
                      <span>
                        {line.itemName} × {line.quantity} ({formatCurrency(line.unitPrice)})
                      </span>
                      <span className="font-mono-num font-semibold">{formatCurrency(line.lineTotal)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-slate-200 pt-3 space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Gross Amount</span>
                <span className="font-mono-num">{formatCurrency(receipt.transaction.grossAmount)}</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Discount</span>
                <span className="font-mono-num">-{formatCurrency(receipt.transaction.discountAmount)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-slate-900 pt-1">
                <span>Net Settled</span>
                <span className="font-mono-num">{formatCurrency(receipt.transaction.netAmount)}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { apiFetch, formatApiError } from '../../api/client';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { useTheme } from '../../context/ThemeContext';

interface PassOption {
  passType: 'REGULAR' | 'VIP_FASTPASS' | 'FAMILY';
  label: string;
  description: string;
  price: number;
  perks: string[];
}

interface BookedTicket {
  ticketId: number;
  ticketCode: string;
  passType: string;
  pricePaid: number;
  netAmount: number;
  discountAmount: number;
  grossAmount: number;
  pointsEarned: number;
  status: string;
  validDate: string;
  issuedAt: string;
}

interface Props {
  onLogout: () => void;
  fullName: string;
}

const PASS_COLORS_DARK: Record<string, string> = {
  REGULAR: 'from-[#0f3460] to-[#16213e]',
  VIP_FASTPASS: 'from-[#e94560] to-[#c41e3a]',
  FAMILY: 'from-[#533483] to-[#2d1b6e]',
};

const PASS_COLORS_LIGHT: Record<string, string> = {
  REGULAR: 'bg-white',
  VIP_FASTPASS: 'bg-rose-50/60',
  FAMILY: 'bg-white',
};

const PASS_BADGES_DARK: Record<string, string> = {
  REGULAR: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  VIP_FASTPASS: 'bg-[#e94560]/20 text-[#ff6b80] border-[#e94560]/30',
  FAMILY: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
};

const PASS_BADGES_LIGHT: Record<string, string> = {
  REGULAR: 'bg-blue-50 text-blue-700 border-blue-200',
  VIP_FASTPASS: 'bg-[#e94560]/10 text-[#e94560] border-[#e94560]/30',
  FAMILY: 'bg-purple-50 text-purple-700 border-purple-200',
};

export const TicketBookingView: React.FC<Props> = ({ onLogout, fullName }) => {
  const { isDark } = useTheme();
  const [passes, setPasses] = useState<PassOption[]>([]);
  const [selected, setSelected] = useState<PassOption | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'WRISTBAND'>('CASH');
  const [promoCode, setPromoCode] = useState('');
  const [bookedTicket, setBookedTicket] = useState<BookedTicket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<PassOption[]>('/portal/passes')
      .then(data => {
        setPasses(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleBook = async () => {
    if (!selected) return;
    setError(null);
    setBusy(true);
    try {
      const data = await apiFetch<BookedTicket>('/portal/book-ticket', {
        method: 'POST',
        body: JSON.stringify({
          passType: selected.passType,
          paymentMethod,
          promoCode: promoCode.trim() || null,
        }),
      });
      setBookedTicket(data);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setBusy(false);
    }
  };

  const handleNewBooking = () => {
    setBookedTicket(null);
    setSelected(null);
    setPromoCode('');
    setError(null);
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        isDark
          ? 'bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]'
          : 'bg-slate-50'
      }`}
    >
      {/* Header */}
      <header
        className={`border-b px-4 sm:px-6 py-4 flex items-center justify-between gap-4 backdrop-blur-md ${
          isDark
            ? 'border-white/10 bg-black/20'
            : 'border-slate-200 bg-white/90'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#e94560] flex items-center justify-center shadow-md shadow-[#e94560]/30">
            <span className="text-white font-black text-base">P</span>
          </div>
          <div>
            <div className={`font-bold text-lg tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              ParkPulse
            </div>
            <div className={`text-xs ${isDark ? 'text-[#a8b2d8]' : 'text-slate-500'}`}>Guest Portal</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`text-sm hidden md:block ${isDark ? 'text-[#a8b2d8]' : 'text-slate-600'}`}>
            Welcome, <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{fullName}</span>
          </span>

          <ThemeToggle />

          <button
            type="button"
            data-testid="portal-signout-back-btn"
            onClick={onLogout}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${
              isDark
                ? 'text-[#a8b2d8] hover:text-white border-white/15 hover:border-white/30 bg-white/5'
                : 'text-slate-700 hover:text-slate-900 border-slate-200 hover:bg-slate-100 bg-white'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Sign Out &amp; Back
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* SUCCESS STATE */}
        {bookedTicket && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 mb-6">
              <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className={`text-3xl font-black mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Booking Confirmed!
            </h2>
            <p className={`mb-8 ${isDark ? 'text-[#a8b2d8]' : 'text-slate-600'}`}>
              Your ticket is active and ready to scan at the gate.
            </p>

            <div
              className={`max-w-sm mx-auto rounded-2xl p-6 text-left mb-8 border ${
                isDark
                  ? 'bg-white/5 border-white/10'
                  : 'bg-white border-slate-200 shadow-lg'
              }`}
            >
              <div className="text-center mb-4">
                <div className={`text-xs uppercase tracking-widest mb-1 ${isDark ? 'text-[#a8b2d8]' : 'text-slate-500'}`}>
                  Ticket Code
                </div>
                <div className="text-3xl font-black text-[#e94560] font-mono tracking-wider">
                  {bookedTicket.ticketCode}
                </div>
              </div>
              <div
                className={`border-t border-dashed pt-4 space-y-2 text-sm ${
                  isDark ? 'border-white/10' : 'border-slate-200'
                }`}
              >
                {(
                  [
                    ['Pass Type', bookedTicket.passType.replace('_', ' ')],
                    ['Valid Date', bookedTicket.validDate],
                    ['Amount Paid', `$${bookedTicket.netAmount?.toFixed(2) ?? bookedTicket.pricePaid?.toFixed(2)}`],
                    bookedTicket.discountAmount > 0
                      ? ['Discount Saved', `$${bookedTicket.discountAmount.toFixed(2)}`]
                      : null,
                    ['Loyalty Points Earned', `+${bookedTicket.pointsEarned} pts`],
                    ['Status', bookedTicket.status],
                  ] as ([string, string] | null)[]
                )
                  .filter((r): r is [string, string] => r !== null)
                  .map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className={isDark ? 'text-[#a8b2d8]' : 'text-slate-500'}>{k}</span>
                      <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{v}</span>
                    </div>
                  ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleNewBooking}
              className="bg-[#e94560] hover:bg-[#d63651] text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-[#e94560]/30 transition"
            >
              Book Another Ticket
            </button>
          </div>
        )}

        {/* BOOKING FORM */}
        {!bookedTicket && (
          <>
            <div className="mb-10">
              <h1 className={`text-4xl font-black mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Book Your Tickets
              </h1>
              <p className={`text-lg ${isDark ? 'text-[#a8b2d8]' : 'text-slate-600'}`}>
                Choose your pass type and secure your spot for an unforgettable day.
              </p>
            </div>

            {error && (
              <div className="mb-6 bg-[#e94560]/10 border border-[#e94560]/30 text-[#e94560] rounded-xl px-5 py-4 text-sm">
                {error}
              </div>
            )}

            {/* Pass cards */}
            {loading ? (
              <div className={`text-center py-20 ${isDark ? 'text-[#a8b2d8]' : 'text-slate-500'}`}>
                Loading passes…
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                {passes.map(pass => {
                  const isSelected = selected?.passType === pass.passType;
                  return (
                    <button
                      type="button"
                      key={pass.passType}
                      onClick={() => setSelected(pass)}
                      className={`relative text-left rounded-2xl p-6 border-2 transition-all ${
                        isSelected
                          ? 'border-[#e94560] scale-[1.02] shadow-xl shadow-[#e94560]/20'
                          : isDark
                          ? 'border-white/10 hover:border-white/30 hover:scale-[1.01]'
                          : 'border-slate-200 hover:border-slate-300 hover:scale-[1.01] shadow-sm'
                      } ${
                        isDark
                          ? `bg-gradient-to-br ${PASS_COLORS_DARK[pass.passType]}`
                          : PASS_COLORS_LIGHT[pass.passType]
                      }`}
                    >
                      {pass.passType === 'VIP_FASTPASS' && (
                        <div className="absolute top-4 right-4 bg-[#e94560] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                          Popular
                        </div>
                      )}
                      <div
                        className={`inline-block text-xs font-bold border rounded-full px-2.5 py-0.5 mb-3 ${
                          isDark ? PASS_BADGES_DARK[pass.passType] : PASS_BADGES_LIGHT[pass.passType]
                        }`}
                      >
                        {pass.passType.replace('_', ' ')}
                      </div>
                      <div className={`font-black text-xl mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {pass.label}
                      </div>
                      <div className={`text-sm mb-4 ${isDark ? 'text-[#a8b2d8]' : 'text-slate-600'}`}>
                        {pass.description}
                      </div>
                      <div className={`text-3xl font-black mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        ${pass.price.toFixed(2)}
                      </div>
                      <ul className="space-y-1.5">
                        {pass.perks.map(perk => (
                          <li
                            key={perk}
                            className={`flex items-center gap-2 text-sm ${
                              isDark ? 'text-[#a8b2d8]' : 'text-slate-600'
                            }`}
                          >
                            <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {perk}
                          </li>
                        ))}
                      </ul>
                      {isSelected && (
                        <div className="mt-4 flex items-center gap-2 text-[#e94560] text-sm font-semibold">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Selected
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Checkout panel */}
            {selected && (
              <div
                className={`rounded-2xl p-6 border ${
                  isDark
                    ? 'bg-white/5 border-white/10'
                    : 'bg-white border-slate-200 shadow-lg'
                }`}
              >
                <h3 className={`font-bold text-lg mb-5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Complete Your Booking
                </h3>
                <div className="grid sm:grid-cols-2 gap-5 mb-5">
                  {/* Payment method */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-[#a8b2d8]' : 'text-slate-700'}`}>
                      Payment Method
                    </label>
                    <div className="flex gap-3">
                      {(['CASH', 'WRISTBAND'] as const).map(m => (
                        <button
                          type="button"
                          key={m}
                          onClick={() => setPaymentMethod(m)}
                          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition ${
                            paymentMethod === m
                              ? 'bg-[#e94560] border-[#e94560] text-white shadow-lg shadow-[#e94560]/20'
                              : isDark
                              ? 'bg-white/5 border-white/10 text-[#a8b2d8] hover:border-white/30'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          {m === 'CASH' ? '💵 Cash' : '🔖 Wristband'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Promo code */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-[#a8b2d8]' : 'text-slate-700'}`}>
                      Promo Code (optional)
                    </label>
                    <input
                      type="text"
                      value={promoCode}
                      onChange={e => setPromoCode(e.target.value.toUpperCase())}
                      placeholder="e.g. VIP10"
                      className={`w-full rounded-xl px-4 py-2.5 outline-none transition text-sm font-mono uppercase border focus:border-[#e94560] focus:ring-2 focus:ring-[#e94560]/20 ${
                        isDark
                          ? 'bg-white/5 border-white/10 text-white placeholder-white/30'
                          : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>
                </div>

                {/* Summary */}
                <div
                  className={`rounded-xl px-5 py-4 mb-5 space-y-2 text-sm ${
                    isDark ? 'bg-black/20' : 'bg-slate-50 border border-slate-200'
                  }`}
                >
                  <div className={`flex justify-between ${isDark ? 'text-[#a8b2d8]' : 'text-slate-600'}`}>
                    <span>Pass</span>
                    <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{selected.label}</span>
                  </div>
                  <div className={`flex justify-between ${isDark ? 'text-[#a8b2d8]' : 'text-slate-600'}`}>
                    <span>Price</span>
                    <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      ${selected.price.toFixed(2)}
                    </span>
                  </div>
                  <div className={`flex justify-between ${isDark ? 'text-[#a8b2d8]' : 'text-slate-600'}`}>
                    <span>Payment</span>
                    <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{paymentMethod}</span>
                  </div>
                  {promoCode && (
                    <div className="flex justify-between text-emerald-500">
                      <span>Promo</span>
                      <span className="font-semibold font-mono">{promoCode}</span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleBook}
                  disabled={busy}
                  className="w-full bg-[#e94560] hover:bg-[#d63651] disabled:opacity-60 text-white font-bold py-3.5 rounded-xl text-base shadow-lg shadow-[#e94560]/30 transition"
                >
                  {busy ? 'Processing…' : `Confirm Booking — $${selected.price.toFixed(2)}`}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

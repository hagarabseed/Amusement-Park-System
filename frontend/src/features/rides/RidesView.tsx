import React, { useState } from 'react';
import { apiFetch, formatApiError } from '../../api/client';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Ride, RideBoarding, RideCategory, TicketLookup } from '../../types';
import { checkRideEligibilityLocally } from '../../utils/posCalculations';

interface RidesViewProps {
  rides: Ride[];
  isManager: boolean;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
  onRefreshAll: () => Promise<void>;
}

const CATEGORIES: RideCategory[] = ['ROLLER_COASTER', 'HORROR', 'KIDS', 'WATER', 'FAMILY'];

export const RidesView: React.FC<RidesViewProps> = ({
  rides,
  isManager,
  onSuccess,
  onError,
  onRefreshAll,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<'' | RideCategory>('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<RideCategory>('ROLLER_COASTER');
  const [capacity, setCapacity] = useState('20');
  const [minAge, setMinAge] = useState('10');
  const [minHeightM, setMinHeightM] = useState('1.20');
  const [specificDetails, setSpecificDetails] = useState('');

  // Gate Boarding Modal
  const [boardingRide, setBoardingRide] = useState<Ride | null>(null);
  const [ticketCode, setTicketCode] = useState('');
  const [ticketInfo, setTicketInfo] = useState<TicketLookup | null>(null);
  const [guestAge, setGuestAge] = useState('16');
  const [guestHeight, setGuestHeight] = useState('1.55');
  const [recentBoardings, setRecentBoardings] = useState<RideBoarding[]>([]);

  const filteredRides = rides.filter(r => !categoryFilter || r.category === categoryFilter);

  const handleToggleMaintenance = async (ride: Ride) => {
    try {
      const updated = await apiFetch<Ride>(`/rides/${ride.id}/maintenance`, {
        method: 'PATCH',
        body: JSON.stringify({
          reason: ride.operational ? 'Operator safety inspection' : null,
        }),
      });
      await onRefreshAll();
      onSuccess(
        `Ride "${updated.name}" is now ${updated.operational ? 'OPEN (Operational)' : 'CLOSED (Maintenance)'}.`
      );
    } catch (err) {
      onError(formatApiError(err));
    }
  };

  const handleCreateRide = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch<Ride>('/rides', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          category,
          capacity: parseInt(capacity, 10),
          minAge: parseInt(minAge, 10),
          minHeightM: parseFloat(minHeightM),
          specificDetails: specificDetails.trim() || null,
        }),
      });
      const createdName = name.trim();
      setName('');
      setSpecificDetails('');
      await onRefreshAll();
      onSuccess(`Attraction "${createdName}" added to park inventory.`);
    } catch (err) {
      onError(formatApiError(err));
    }
  };

  const openBoardingConsole = async (ride: Ride) => {
    setBoardingRide(ride);
    setTicketCode('');
    setTicketInfo(null);
    setGuestAge(String(Math.max(ride.minAge, 12)));
    setGuestHeight(Number(ride.minHeightM).toFixed(2));
    try {
      const list = await apiFetch<RideBoarding[]>(`/rides/${ride.id}/boardings`);
      setRecentBoardings(list);
    } catch {
      setRecentBoardings([]);
    }
  };

  const handleLookupTicket = async () => {
    if (!ticketCode.trim()) return;
    try {
      const info = await apiFetch<TicketLookup>(`/tickets/lookup?code=${encodeURIComponent(ticketCode.trim())}`);
      setTicketInfo(info);
    } catch (err) {
      setTicketInfo(null);
      onError(formatApiError(err));
    }
  };

  const handleBoardGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!boardingRide) return;
    const localWarning = checkRideEligibilityLocally({
      operational: boardingRide.operational,
      minAge: boardingRide.minAge,
      minHeightM: Number(boardingRide.minHeightM),
      guestAge: parseInt(guestAge, 10),
      guestHeightM: parseFloat(guestHeight),
    });
    if (localWarning) {
      onError(localWarning);
      return;
    }
    try {
      const res = await apiFetch<RideBoarding>(`/rides/${boardingRide.id}/board`, {
        method: 'POST',
        body: JSON.stringify({
          ticketCode: ticketCode.trim(),
          guestAge: parseInt(guestAge, 10),
          guestHeightM: parseFloat(guestHeight),
        }),
      });
      setTicketCode('');
      setTicketInfo(null);
      const list = await apiFetch<RideBoarding[]>(`/rides/${boardingRide.id}/boardings`);
      setRecentBoardings(list);
      await onRefreshAll();
      onSuccess(`Admitted ${res.customerName} (${res.ticketCode}) onto ${res.rideName}.`);
    } catch (err) {
      onError(formatApiError(err));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className={`${isManager ? 'lg:col-span-8' : 'lg:col-span-12'} bg-white border border-slate-200 rounded-xl overflow-hidden`}>
        <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Park Attractions & Safety Control</h2>
            <p className="text-xs text-slate-500">Live ride status, height/age gates, and boarding dispatch</p>
          </div>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value as '' | RideCategory)}
            className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-medium"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c.replace('_', ' ')}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table data-testid="rides-table" className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-4 font-semibold">Attraction</th>
                <th className="py-3 px-4 font-semibold">Safety Specs</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRides.map(r => (
                <tr key={r.id} className="hover:bg-slate-50/70">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{r.name}</div>
                    <div className="text-xs text-slate-500">
                      {r.category.replace('_', ' ')} · Cap {r.capacity} · {r.totalBoardings} boardings
                    </div>
                    {r.maintenanceReason && (
                      <div className="text-xs text-rose-600 mt-0.5">{r.maintenanceReason}</div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-700 font-mono-num">
                    <div>Min Age: {r.minAge} yrs</div>
                    <div>Min Height: {Number(r.minHeightM).toFixed(2)}m</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge
                      testId={`ride-status-${r.id}`}
                      tone={r.operational ? 'emerald' : 'rose'}
                    >
                      {r.operational ? 'OPEN' : 'MAINTENANCE'}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                    <button
                      type="button"
                      data-testid={`board-ride-${r.id}`}
                      onClick={() => openBoardingConsole(r)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                    >
                      Gate Check
                    </button>
                    <button
                      type="button"
                      data-testid={`toggle-maint-${r.id}`}
                      onClick={() => handleToggleMaintenance(r)}
                      className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                    >
                      Toggle Maintenance
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isManager && (
        <form
          onSubmit={handleCreateRide}
          className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 space-y-3.5 h-fit"
        >
          <div>
            <h3 className="text-base font-bold text-slate-900">Add New Attraction</h3>
            <p className="text-xs text-slate-500">Manager-only park inventory provisioning</p>
          </div>
          <input
            data-testid="ride-name"
            placeholder="Ride Name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none"
            required
          />
          <select
            data-testid="ride-category"
            value={category}
            onChange={e => setCategory(e.target.value as RideCategory)}
            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none"
          >
            <option value="ROLLER_COASTER">Roller Coaster</option>
            <option value="HORROR">Horror / Thrill</option>
            <option value="KIDS">Kids Ride</option>
            <option value="WATER">Water Ride</option>
            <option value="FAMILY">Family Ride</option>
          </select>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Capacity</label>
              <input
                data-testid="ride-capacity"
                type="number"
                min="1"
                max="200"
                value={capacity}
                onChange={e => setCapacity(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm font-mono-num"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Min Age</label>
              <input
                data-testid="ride-min-age"
                type="number"
                min="0"
                max="21"
                value={minAge}
                onChange={e => setMinAge(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm font-mono-num"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Height (m)</label>
              <input
                data-testid="ride-min-height"
                type="number"
                step="0.05"
                min="0"
                max="2.5"
                value={minHeightM}
                onChange={e => setMinHeightM(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm font-mono-num"
                required
              />
            </div>
          </div>
          <input
            data-testid="ride-details"
            placeholder="Track specs / notes (optional)"
            value={specificDetails}
            onChange={e => setSpecificDetails(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none"
          />
          <button
            data-testid="ride-submit"
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg font-semibold text-sm transition"
          >
            Create Attraction
          </button>
        </form>
      )}

      {/* Gate Boarding Modal */}
      <Modal
        open={boardingRide !== null}
        title={boardingRide ? `Gate Boarding — ${boardingRide.name}` : 'Gate Boarding'}
        subtitle={
          boardingRide
            ? `Safety Minimums: ${boardingRide.minAge}+ yrs · ${Number(boardingRide.minHeightM).toFixed(2)}m`
            : ''
        }
        onClose={() => setBoardingRide(null)}
        maxWidth="max-w-lg"
      >
        {boardingRide && (
          <div className="space-y-5">
            {!boardingRide.operational && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium">
                This attraction is currently closed for maintenance. Boarding is disabled until reopened.
              </div>
            )}

            <form onSubmit={handleBoardGuest} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pass Ticket Code</label>
                <div className="flex gap-2">
                  <input
                    data-testid="board-ticket-code"
                    placeholder="e.g. PKP-A1B2C3"
                    value={ticketCode}
                    onChange={e => setTicketCode(e.target.value.toUpperCase())}
                    className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono-num uppercase"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleLookupTicket}
                    className="px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-semibold"
                  >
                    Verify
                  </button>
                </div>
                {ticketInfo && (
                  <div className="mt-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                    Valid {ticketInfo.passType} for <strong>{ticketInfo.customerName}</strong> ({ticketInfo.boardingsCount} prior rides)
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Guest Age (yrs)</label>
                  <input
                    data-testid="board-guest-age"
                    type="number"
                    min="0"
                    max="120"
                    value={guestAge}
                    onChange={e => setGuestAge(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono-num"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Guest Height (m)</label>
                  <input
                    data-testid="board-guest-height"
                    type="number"
                    step="0.01"
                    min="0.40"
                    max="2.50"
                    value={guestHeight}
                    onChange={e => setGuestHeight(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono-num"
                    required
                  />
                </div>
              </div>

              <button
                data-testid="board-submit-btn"
                type="submit"
                disabled={!boardingRide.operational}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white py-2.5 rounded-lg text-sm font-semibold"
              >
                Validate Safety & Admit Rider
              </button>
            </form>

            <div>
              <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">Recent Gate Dispatches</h4>
              {recentBoardings.length === 0 ? (
                <p className="text-xs text-slate-500">No boardings recorded on this attraction yet.</p>
              ) : (
                <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-48 overflow-y-auto">
                  {recentBoardings.map(b => (
                    <div key={b.id} className="px-3 py-2 flex justify-between text-xs">
                      <span>
                        <strong className="font-mono-num">{b.ticketCode}</strong> · {b.customerName}
                      </span>
                      <span className="text-slate-500 font-mono-num">
                        {b.guestAge}y / {Number(b.guestHeightM).toFixed(2)}m
                      </span>
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

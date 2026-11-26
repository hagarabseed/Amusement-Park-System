import React, { useState } from 'react';
import { apiFetch, formatApiError } from '../../api/client';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Ride, Role, StaffMember } from '../../types';

interface StaffViewProps {
  staff: StaffMember[];
  rides: Ride[];
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
  onRefreshAll: () => Promise<void>;
}

export const StaffView: React.FC<StaffViewProps> = ({
  staff,
  rides,
  onSuccess,
  onError,
  onRefreshAll,
}) => {
  const [stationEdits, setStationEdits] = useState<Record<number, string>>({});
  const [rideEdits, setRideEdits] = useState<Record<number, number | ''>>({});

  // Create Staff Modal
  const [createOpen, setCreateOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Pass@1234');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<Role>('CASHIER');
  const [assignedStation, setAssignedStation] = useState('Main Gate POS #2');
  const [assignedRideId, setAssignedRideId] = useState<number | ''>('');
  const [salary, setSalary] = useState('5500.00');

  const handleToggleShift = async (staffId: number) => {
    try {
      const updated = await apiFetch<StaffMember>(`/staff/${staffId}/shift`, { method: 'PATCH' });
      await onRefreshAll();
      onSuccess(`${updated.fullName} shift status updated to ${updated.dutyStatus}.`);
    } catch (err) {
      onError(formatApiError(err));
    }
  };

  const handleAssignStation = async (member: StaffMember) => {
    const chosenRideId = rideEdits[member.id];
    const customStation = stationEdits[member.id];

    if (member.role === 'RIDE_OPERATOR' && chosenRideId) {
      const ride = rides.find(r => r.id === Number(chosenRideId));
      try {
        const updated = await apiFetch<StaffMember>(`/staff/${member.id}/station`, {
          method: 'PATCH',
          body: JSON.stringify({
            assignedStation: ride ? ride.name : 'Ride Station',
            assignedRideId: Number(chosenRideId),
          }),
        });
        await onRefreshAll();
        onSuccess(`${updated.fullName} assigned to "${updated.assignedStation}".`);
      } catch (err) {
        onError(formatApiError(err));
      }
      return;
    }

    if (!customStation || !customStation.trim()) {
      onError('Please enter a station name before assigning.');
      return;
    }

    try {
      const updated = await apiFetch<StaffMember>(`/staff/${member.id}/station`, {
        method: 'PATCH',
        body: JSON.stringify({ assignedStation: customStation.trim(), assignedRideId: null }),
      });
      setStationEdits(prev => ({ ...prev, [member.id]: '' }));
      await onRefreshAll();
      onSuccess(`${updated.fullName} assigned to "${updated.assignedStation}".`);
    } catch (err) {
      onError(formatApiError(err));
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await apiFetch<StaffMember>('/staff', {
        method: 'POST',
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          password,
          phone: phone.trim(),
          role,
          assignedStation: assignedStation.trim(),
          assignedRideId: role === 'RIDE_OPERATOR' && assignedRideId ? Number(assignedRideId) : null,
          salary: parseFloat(salary),
        }),
      });
      setCreateOpen(false);
      setFullName('');
      setEmail('');
      setPhone('');
      await onRefreshAll();
      onSuccess(`Onboarded ${created.fullName} (${created.role}).`);
    } catch (err) {
      onError(formatApiError(err));
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">Staff Duty & Station Assignments</h2>
          <p className="text-xs text-slate-500">Manage active shifts, terminal assignments, and team onboarding</p>
        </div>
        <button
          type="button"
          data-testid="open-create-staff-btn"
          onClick={() => setCreateOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition"
        >
          + Onboard Staff Member
        </button>
      </div>

      <div className="overflow-x-auto">
        <table data-testid="staff-table" className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="py-3 px-4 font-semibold">Staff Member</th>
              <th className="py-3 px-4 font-semibold">Role</th>
              <th className="py-3 px-4 font-semibold">Assigned Station</th>
              <th className="py-3 px-4 font-semibold">Status</th>
              <th className="py-3 px-4 font-semibold">Reassign Station</th>
              <th className="py-3 px-4 font-semibold text-right">Shift</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {staff.map(s => (
              <tr key={s.id} className="hover:bg-slate-50/70">
                <td className="py-3.5 px-4">
                  <div className="font-semibold text-slate-900">{s.fullName}</div>
                  <div className="text-xs text-slate-500">{s.email}</div>
                </td>
                <td className="py-3.5 px-4">
                  <Badge tone={s.role === 'MANAGER' ? 'indigo' : s.role === 'CASHIER' ? 'blue' : 'amber'}>
                    {s.role}
                  </Badge>
                </td>
                <td className="py-3.5 px-4 text-slate-700 font-medium">{s.assignedStation}</td>
                <td className="py-3.5 px-4">
                  <Badge tone={s.dutyStatus === 'ON_DUTY' ? 'emerald' : 'slate'}>{s.dutyStatus}</Badge>
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-1.5">
                    {s.role === 'RIDE_OPERATOR' ? (
                      <select
                        value={rideEdits[s.id] ?? s.assignedRideId ?? ''}
                        onChange={e =>
                          setRideEdits(prev => ({
                            ...prev,
                            [s.id]: e.target.value ? Number(e.target.value) : '',
                          }))
                        }
                        className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs"
                      >
                        <option value="">Select ride...</option>
                        {rides.map(r => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        data-testid={`station-input-${s.id}`}
                        placeholder="New station..."
                        value={stationEdits[s.id] || ''}
                        onChange={e =>
                          setStationEdits(prev => ({ ...prev, [s.id]: e.target.value }))
                        }
                        className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs w-36"
                      />
                    )}
                    <button
                      type="button"
                      data-testid={`assign-station-${s.id}`}
                      onClick={() => handleAssignStation(s)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg text-xs font-semibold"
                    >
                      Save
                    </button>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    type="button"
                    data-testid={`toggle-shift-${s.id}`}
                    onClick={() => handleToggleShift(s.id)}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold"
                  >
                    Toggle Shift
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={createOpen}
        title="Onboard New Staff Member"
        subtitle="Creates a role-scoped login account with BCrypt-hashed credentials"
        onClose={() => setCreateOpen(false)}
      >
        <form onSubmit={handleCreateStaff} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                data-testid="staff-create-name"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
              <input
                data-testid="staff-create-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Password (8+ chars)</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                minLength={8}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone (8–15 digits)</label>
              <input
                data-testid="staff-create-phone"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono-num"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Role</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as Role)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="CASHIER">CASHIER</option>
                <option value="RIDE_OPERATOR">RIDE_OPERATOR</option>
                <option value="MANAGER">MANAGER</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Station</label>
              {role === 'RIDE_OPERATOR' ? (
                <select
                  value={assignedRideId}
                  onChange={e => {
                    const id = e.target.value ? Number(e.target.value) : '';
                    setAssignedRideId(id);
                    const found = rides.find(r => r.id === id);
                    if (found) setAssignedStation(found.name);
                  }}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select ride...</option>
                  {rides.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              ) : (
                <input
                  value={assignedStation}
                  onChange={e => setAssignedStation(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  required
                />
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Salary ($)</label>
              <input
                type="number"
                step="0.01"
                value={salary}
                onChange={e => setSalary(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono-num"
                required
              />
            </div>
          </div>

          <button
            data-testid="staff-create-submit"
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-semibold"
          >
            Create Staff Account
          </button>
        </form>
      </Modal>
    </div>
  );
};

import { useState, useEffect, useCallback } from 'react';
import { getAppointments, approveAppointment, declineAppointment } from '../../services/api';
import OfficePill from '../shared/OfficePill';

export default function AppointmentRequests() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [declineId, setDeclineId] = useState(null);
  const [declineReason, setDeclineReason] = useState('');

  const fetchAppointments = useCallback(async () => {
    try {
      const data = await getAppointments('pending');
      setAppointments(data.appointments || []);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
    const interval = setInterval(fetchAppointments, 30000);
    return () => clearInterval(interval);
  }, [fetchAppointments]);

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await approveAppointment(id);
      setAppointments(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error('Approve failed:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async (id) => {
    if (!declineReason.trim()) return;
    setActionLoading(id);
    try {
      await declineAppointment(id, declineReason.trim());
      setAppointments(prev => prev.filter(a => a.id !== id));
      setDeclineId(null);
      setDeclineReason('');
    } catch (err) {
      console.error('Decline failed:', err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return null;
  if (appointments.length === 0) return null;

  return (
    <div className="card mb-4">
      <div className="flex items-center gap-2.5 mb-5">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
          style={{
            background: 'linear-gradient(135deg, rgba(252, 209, 22, 0.15), rgba(245, 158, 11, 0.1))',
            border: '1px solid rgba(252, 209, 22, 0.2)',
          }}
        >
          {'\uD83D\uDCC5'}
        </div>
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
          Appointment Requests
        </h3>
        <span
          className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{
            background: 'linear-gradient(135deg, rgba(252, 209, 22, 0.2), rgba(245, 158, 11, 0.1))',
            color: '#F59E0B',
            border: '1px solid rgba(252, 209, 22, 0.3)',
          }}
        >
          {appointments.length} pending
        </span>
      </div>

      <div className="space-y-2.5 stagger-children">
        {appointments.map((appt) => (
          <div
            key={appt.id}
            className="p-3.5 rounded-2xl"
            style={{
              background: 'var(--bg-card-inset)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium truncate">{appt.visitor_name}</span>
                  <OfficePill abbreviation={appt.office_abbr} type={appt.office_type} />
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-text-muted">
                  <span>{appt.expected_date}{appt.expected_time ? ` at ${appt.expected_time}` : ''}</span>
                  <span>{appt.purpose}</span>
                  {appt.visitor_organization && <span>{appt.visitor_organization}</span>}
                </div>
              </div>

              {declineId !== appt.id && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleApprove(appt.id)}
                    disabled={actionLoading === appt.id}
                    className="px-3 py-1.5 rounded-xl text-[11px] font-semibold text-white transition-all"
                    style={{
                      background: 'linear-gradient(135deg, #006B3F, #34D399)',
                      boxShadow: '0 2px 8px rgba(0, 107, 63, 0.25)',
                      opacity: actionLoading === appt.id ? 0.6 : 1,
                    }}
                  >
                    {actionLoading === appt.id ? '...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => setDeclineId(appt.id)}
                    disabled={actionLoading === appt.id}
                    className="px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all"
                    style={{
                      background: 'rgba(206, 17, 38, 0.1)',
                      color: '#CE1126',
                      border: '1px solid rgba(206, 17, 38, 0.2)',
                    }}
                  >
                    Decline
                  </button>
                </div>
              )}
            </div>

            {declineId === appt.id && (
              <div className="mt-2.5 flex items-center gap-2">
                <input
                  className="input flex-1 text-sm"
                  placeholder="Reason for declining..."
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleDecline(appt.id)}
                  autoFocus
                />
                <button
                  onClick={() => handleDecline(appt.id)}
                  disabled={!declineReason.trim() || actionLoading === appt.id}
                  className="px-3 py-1.5 rounded-xl text-[11px] font-semibold text-white"
                  style={{
                    background: actionLoading === appt.id ? 'rgba(206, 17, 38, 0.5)' : '#CE1126',
                    opacity: !declineReason.trim() ? 0.5 : 1,
                  }}
                >
                  {actionLoading === appt.id ? '...' : 'Send'}
                </button>
                <button
                  onClick={() => { setDeclineId(null); setDeclineReason(''); }}
                  className="px-2 py-1.5 rounded-xl text-[11px] text-text-muted"
                  style={{ background: 'var(--bg-card-inset)' }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

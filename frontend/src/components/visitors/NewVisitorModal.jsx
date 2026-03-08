import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useOffices } from '../../hooks/useOffices';
import { createVisitor, checkInVisitor, aiRoute, updatePreRegistration } from '../../services/api';
import AISuggestionCard from './AISuggestionCard';
import useUXFeedback from '../../hooks/useUXFeedback';
import { VISIT_PURPOSES, ID_TYPES } from '../../constants/offices';

export default function NewVisitorModal({ open, onClose, onSuccess, prefill }) {
  const { grouped, offices } = useOffices();
  const { celebrate, notify } = useUXFeedback();
  const [step, setStep] = useState(1); // 1=info, 2=checkin, 3=success
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [error, setError] = useState(null);

  const [visitor, setVisitor] = useState({
    full_name: '', phone: '', email: '', organization: '', id_type: 'Ghana Card', id_number: '',
  });

  const [visit, setVisit] = useState({
    purpose: '', office_id: '', host_officer: '', notes: '',
  });

  const [createdVisitorId, setCreatedVisitorId] = useState(null);
  const [prefillPreRegId, setPrefillPreRegId] = useState(null);

  // Apply prefill data from QR scan
  useEffect(() => {
    if (prefill && open) {
      setVisitor(v => ({
        ...v,
        full_name: prefill.visitor_name || v.full_name,
        phone: prefill.visitor_phone || v.phone,
        email: prefill.visitor_email || v.email,
        organization: prefill.visitor_organization || v.organization,
      }));
      setVisit(v => ({
        ...v,
        purpose: prefill.purpose || v.purpose,
        office_id: prefill.office_id ? String(prefill.office_id) : v.office_id,
        host_officer: prefill.host_officer || v.host_officer,
      }));
      setPrefillPreRegId(prefill.id);
    }
  }, [prefill, open]);

  if (!open) return null;

  const handleAIRoute = async (purpose) => {
    if (!purpose) return;
    setAiLoading(true);
    try {
      const data = await aiRoute(purpose, visitor.organization);
      if (data.routing) {
        setAiSuggestion(data.routing);
      }
    } catch {
      // AI routing is optional
    } finally {
      setAiLoading(false);
    }
  };

  const acceptAISuggestion = () => {
    if (!aiSuggestion) return;
    const office = offices.find(o => o.abbreviation === aiSuggestion.office_abbreviation);
    if (office) {
      setVisit(prev => ({
        ...prev,
        office_id: String(office.id),
        host_officer: aiSuggestion.host || office.head_officer || '',
      }));
    }
  };

  const handleNext = async () => {
    if (step === 1) {
      if (!visitor.full_name) { setError('Name is required'); return; }
      setError(null);
      setLoading(true);
      try {
        const data = await createVisitor(visitor);
        setCreatedVisitorId(data.visitor.id);
        setStep(2);
      } catch (err) {
        setError(err.message);
        notify.error(err.message || 'Failed to create visitor');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCheckIn = async () => {
    if (!visit.purpose || !visit.office_id || !visit.host_officer) {
      setError('Purpose, office, and host officer are required');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await checkInVisitor({
        visitor_id: createdVisitorId,
        office_id: parseInt(visit.office_id),
        purpose: visit.purpose,
        host_officer: visit.host_officer,
        notes: visit.notes,
        ai_routed: !!aiSuggestion,
        ai_routing_confidence: aiSuggestion?.confidence || null,
      });
      // Mark pre-registration as converted if this came from QR scan
      if (prefillPreRegId) {
        try {
          await updatePreRegistration(prefillPreRegId, { status: 'converted' });
        } catch {
          // non-critical
        }
      }
      // Show success screen with celebration
      celebrate('checkin', `${visitor.full_name} checked in!`, 'celebration');
      setStep(3);
      onSuccess?.();
      // Auto-close after 1.8s
      setTimeout(() => handleClose(), 1800);
      return;
    } catch (err) {
      setError(err.message);
      notify.error(err.message || 'Check-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setVisitor({ full_name: '', phone: '', email: '', organization: '', id_type: 'Ghana Card', id_number: '' });
    setVisit({ purpose: '', office_id: '', host_officer: '', notes: '' });
    setCreatedVisitorId(null);
    setPrefillPreRegId(null);
    setAiSuggestion(null);
    setError(null);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 animate-fade-in"
        style={{ background: 'var(--bg-backdrop)', backdropFilter: 'blur(4px)' }}
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl animate-fade-in-up modal-responsive"
          style={{
            background: 'var(--bg-modal)',
            border: '1px solid var(--border-separator)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            boxShadow: 'var(--shadow-modal)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid var(--border-secondary)' }}>
            <div>
              <h2 className="text-lg font-semibold">
                {step === 1 ? 'New Visitor Registration' : 'Visit Details'}
              </h2>
              <div className="flex items-center gap-2 mt-1.5">
                {[1, 2].map(s => (
                  <div key={s} className="flex items-center gap-1.5">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold"
                      style={{
                        background: step >= s
                          ? 'linear-gradient(135deg, #006B3F, #34D399)'
                          : 'var(--bg-card-inset)',
                        color: step >= s ? 'white' : 'var(--text-muted)',
                        boxShadow: step >= s ? '0 0 12px rgba(0, 107, 63, 0.2)' : 'none',
                      }}
                    >
                      {s}
                    </div>
                    <span className="text-[10px] text-text-muted">
                      {s === 1 ? 'Info' : 'Check-in'}
                    </span>
                    {s === 1 && (
                      <div className="w-6 h-px mx-1" style={{ background: 'var(--border-separator)' }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-xl text-text-muted hover:text-text-secondary hover:bg-[var(--bg-card-inset)] transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4">
            {error && (
              <div
                className="p-3.5 rounded-2xl text-sm flex items-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, rgba(206, 17, 38, 0.1), rgba(206, 17, 38, 0.04))',
                  border: '1px solid rgba(206, 17, 38, 0.2)',
                  color: '#CE1126',
                }}
              >
                <span>{'\u26A0'}</span> {error}
              </div>
            )}

            {step === 1 && (
              <>
                <FieldGroup label="Full Name" required>
                  <input
                    className="input"
                    placeholder="Enter visitor's full name"
                    value={visitor.full_name}
                    onChange={(e) => setVisitor(v => ({ ...v, full_name: e.target.value }))}
                  />
                </FieldGroup>
                <div className="grid grid-cols-2 gap-3">
                  <FieldGroup label="Phone">
                    <input
                      className="input"
                      placeholder="024 XXX XXXX"
                      value={visitor.phone}
                      onChange={(e) => setVisitor(v => ({ ...v, phone: e.target.value }))}
                    />
                  </FieldGroup>
                  <FieldGroup label="Email">
                    <input
                      className="input"
                      placeholder="visitor@email.com"
                      value={visitor.email}
                      onChange={(e) => setVisitor(v => ({ ...v, email: e.target.value }))}
                    />
                  </FieldGroup>
                </div>
                <FieldGroup label="Organization">
                  <input
                    className="input"
                    placeholder="Visitor's organization"
                    value={visitor.organization}
                    onChange={(e) => setVisitor(v => ({ ...v, organization: e.target.value }))}
                  />
                </FieldGroup>
                <div className="grid grid-cols-2 gap-3">
                  <FieldGroup label="ID Type">
                    <select
                      className="select"
                      value={visitor.id_type}
                      onChange={(e) => setVisitor(v => ({ ...v, id_type: e.target.value }))}
                    >
                      {ID_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </FieldGroup>
                  <FieldGroup label="ID Number">
                    <input
                      className="input"
                      placeholder="GHA-XXXXXXXXX-X"
                      value={visitor.id_number}
                      onChange={(e) => setVisitor(v => ({ ...v, id_number: e.target.value }))}
                    />
                  </FieldGroup>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                {/* Visitor summary badge */}
                <div
                  className="p-3.5 rounded-2xl flex items-center gap-3"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0, 107, 63, 0.06), rgba(252, 209, 22, 0.04))',
                    border: '1px solid rgba(0, 107, 63, 0.1)',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                    style={{
                      background: 'linear-gradient(135deg, #006B3F, #34D399)',
                      color: 'white',
                    }}
                  >
                    {visitor.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-sm font-medium">{visitor.full_name}</span>
                    <div className="flex items-center gap-2">
                      <span
                        className="font-mono text-[11px] font-bold"
                        style={{ color: '#FCD116', textShadow: 'var(--glow-gold-text)' }}
                      >
                        {createdVisitorId}
                      </span>
                      {visitor.organization && (
                        <span className="text-[11px] text-text-muted">{visitor.organization}</span>
                      )}
                    </div>
                  </div>
                </div>

                <FieldGroup label="Purpose of Visit" required>
                  <select
                    className="select"
                    value={visit.purpose}
                    onChange={(e) => {
                      setVisit(v => ({ ...v, purpose: e.target.value }));
                      handleAIRoute(e.target.value);
                    }}
                  >
                    <option value="">Select purpose...</option>
                    {VISIT_PURPOSES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </FieldGroup>

                {aiLoading && (
                  <div
                    className="p-3.5 rounded-2xl text-sm flex items-center gap-2.5"
                    style={{
                      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(139, 92, 246, 0.05))',
                      border: '1px solid rgba(59, 130, 246, 0.15)',
                      color: '#818CF8',
                    }}
                  >
                    <div className="w-4 h-4 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
                    AI is finding the best office...
                  </div>
                )}

                {aiSuggestion && !aiLoading && (
                  <AISuggestionCard suggestion={aiSuggestion} onAccept={acceptAISuggestion} />
                )}

                <FieldGroup label="Office" required>
                  <select
                    className="select"
                    value={visit.office_id}
                    onChange={(e) => setVisit(v => ({ ...v, office_id: e.target.value }))}
                  >
                    <option value="">Select office...</option>
                    {grouped.executive.length > 0 && (
                      <optgroup label="Executive">
                        {grouped.executive.map(o => (
                          <option key={o.id} value={o.id}>{o.abbreviation} — {o.full_name}</option>
                        ))}
                      </optgroup>
                    )}
                    <optgroup label="Directorates">
                      {grouped.directorates.map(o => (
                        <option key={o.id} value={o.id}>{o.abbreviation} — {o.full_name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Units">
                      {grouped.units.map(o => (
                        <option key={o.id} value={o.id}>{o.abbreviation} — {o.full_name}</option>
                      ))}
                    </optgroup>
                  </select>
                </FieldGroup>

                <FieldGroup label="Host Officer" required>
                  <input
                    className="input"
                    placeholder="Officer to visit"
                    value={visit.host_officer}
                    onChange={(e) => setVisit(v => ({ ...v, host_officer: e.target.value }))}
                  />
                </FieldGroup>

                <FieldGroup label="Notes">
                  <textarea
                    className="input"
                    rows={2}
                    placeholder="Additional notes..."
                    value={visit.notes}
                    onChange={(e) => setVisit(v => ({ ...v, notes: e.target.value }))}
                  />
                </FieldGroup>
              </>
            )}
          </div>

          {/* Success screen */}
          {step === 3 && (
            <div className="p-8 text-center">
              <motion.div
                className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(0, 107, 63, 0.15), rgba(52, 211, 153, 0.1))',
                  border: '2px solid rgba(0, 107, 63, 0.3)',
                }}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              >
                <motion.svg
                  className="w-10 h-10"
                  style={{ color: '#34D399' }}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </motion.svg>
              </motion.div>
              <motion.p
                className="text-lg font-semibold text-gradient-hero"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {visitor.full_name}
              </motion.p>
              <motion.p
                className="text-xs text-text-muted mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Checked in successfully
              </motion.p>
            </div>
          )}

          {/* Footer */}
          {step < 3 && (
            <div
              className="flex items-center justify-end gap-3 p-5"
              style={{ borderTop: '1px solid var(--border-secondary)' }}
            >
              <button
                onClick={handleClose}
                className="card-inset-interactive px-4 py-2.5 rounded-xl text-sm text-text-secondary"
              >
                Cancel
              </button>
              {step === 1 && (
                <button onClick={handleNext} disabled={loading} className="btn-primary">
                  {loading ? 'Creating...' : 'Next \u2192'}
                </button>
              )}
              {step === 2 && (
                <button onClick={handleCheckIn} disabled={loading} className="btn-primary">
                  {loading ? 'Checking In...' : '\u2713 Check In'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function FieldGroup({ label, required, children }) {
  return (
    <div>
      <label className="text-[11px] text-text-muted uppercase tracking-wider mb-1.5 block font-medium">
        {label} {required && <span style={{ color: '#CE1126' }}>*</span>}
      </label>
      {children}
    </div>
  );
}

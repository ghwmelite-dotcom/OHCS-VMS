import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import AvatarCircle from '../shared/AvatarCircle';
import OfficePill from '../shared/OfficePill';
import StatusBadge from '../shared/StatusBadge';
import AIFlagBadge from '../shared/AIFlagBadge';
import { backdrop, modalContent } from '../../constants/motion';
import { getVisitor } from '../../services/api';

export default function VisitorProfileCard({ visitorId, open, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !visitorId) return;
    setLoading(true);
    getVisitor(visitorId)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [visitorId, open]);

  const visitor = data?.visitor;
  const visits = data?.visits || [];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50"
            style={{ background: 'var(--bg-backdrop)', backdropFilter: 'blur(4px)' }}
            variants={backdrop}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={onClose}
          />
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              className="pointer-events-auto w-full max-w-md max-h-[85vh] overflow-y-auto rounded-3xl custom-scrollbar modal-responsive"
              style={{
                background: 'var(--bg-modal)',
                border: '1px solid var(--border-separator)',
                backdropFilter: 'blur(40px)',
                boxShadow: 'var(--shadow-modal)',
              }}
              variants={modalContent}
              initial="initial"
              animate="animate"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              {loading ? (
                <div className="p-8 text-center">
                  <div className="w-6 h-6 border-2 border-ghana-gold/30 border-t-ghana-gold rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-text-muted text-sm">Loading profile...</p>
                </div>
              ) : visitor ? (
                <>
                  {/* Header */}
                  <div className="p-6 text-center relative" style={{ borderBottom: '1px solid var(--border-secondary)' }}>
                    <button
                      onClick={onClose}
                      className="absolute top-4 right-4 p-2 rounded-xl text-text-muted hover:text-text-secondary transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>

                    <AvatarCircle name={visitor.full_name} size="lg" />
                    <h2 className="text-lg font-semibold mt-3">{visitor.full_name}</h2>
                    <p className="text-sm text-text-muted font-mono" style={{ color: '#FCD116' }}>{visitor.id}</p>
                    {visitor.organization && (
                      <p className="text-xs text-text-muted mt-1">{visitor.organization}</p>
                    )}

                    <div className="flex items-center justify-center gap-3 mt-3">
                      {visitor.phone && (
                        <span className="text-[11px] text-text-muted flex items-center gap-1">📞 {visitor.phone}</span>
                      )}
                      {visitor.email && (
                        <span className="text-[11px] text-text-muted flex items-center gap-1">✉️ {visitor.email}</span>
                      )}
                    </div>

                    <div className="flex items-center justify-center gap-2 mt-3">
                      <span
                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold"
                        style={{
                          background: 'rgba(252, 209, 22, 0.08)',
                          border: '1px solid rgba(252, 209, 22, 0.15)',
                          color: '#FCD116',
                        }}
                      >
                        {visitor.visit_count || 0} visits
                      </span>
                      {visitor.is_blocklisted && (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold" style={{ background: 'rgba(206, 17, 38, 0.1)', color: '#CE1126', border: '1px solid rgba(206, 17, 38, 0.2)' }}>
                          Blocklisted
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Visit Timeline */}
                  <div className="p-5">
                    <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Visit History</h3>
                    {visits.length === 0 ? (
                      <p className="text-sm text-text-muted text-center py-4">No visit history</p>
                    ) : (
                      <div className="space-y-2">
                        {visits.slice(0, 10).map((visit, i) => (
                          <div
                            key={visit.id}
                            className="flex items-start gap-3 p-3 rounded-xl relative"
                            style={{ background: 'var(--bg-card-inset)', border: '1px solid var(--border-subtle)' }}
                          >
                            {/* Timeline connector */}
                            {i < visits.length - 1 && (
                              <div
                                className="absolute left-[22px] top-12 w-0.5 h-[calc(100%-16px)]"
                                style={{ background: 'var(--border-secondary)' }}
                              />
                            )}
                            <div
                              className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                              style={{
                                background: visit.status === 'checked-in' ? '#34D399' : '#64748B',
                                boxShadow: visit.status === 'checked-in' ? '0 0 8px rgba(52, 211, 153, 0.4)' : 'none',
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <OfficePill abbreviation={visit.office_abbr} type={visit.office_type} />
                                <StatusBadge status={visit.status} />
                                <AIFlagBadge flag={visit.ai_flag} />
                              </div>
                              <p className="text-xs text-text-secondary mt-1">{visit.purpose}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] text-text-muted font-mono">
                                  {new Date(visit.check_in).toLocaleDateString('en-GH', { timeZone: 'Africa/Accra' })}
                                </span>
                                <span className="text-[10px] text-text-muted font-mono">
                                  {new Date(visit.check_in).toLocaleTimeString('en-GH', { timeZone: 'Africa/Accra', hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {visit.badge_number && (
                                  <span className="text-[10px] font-mono" style={{ color: '#FCD116' }}>Badge: {visit.badge_number}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-text-muted text-sm">Visitor not found</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

import { motion, AnimatePresence } from 'framer-motion';
import EmptyState from '../shared/EmptyState';
import { staggerContainer, staggerItem, spring } from '../../constants/motion';

const SEVERITY_CONFIG = {
  high: {
    gradient: 'linear-gradient(135deg, rgba(206, 17, 38, 0.12), rgba(206, 17, 38, 0.04))',
    border: 'rgba(206, 17, 38, 0.2)',
    color: '#CE1126',
    dot: '#CE1126',
    icon: '🔴',
    action: 'Investigate immediately',
  },
  medium: {
    gradient: 'linear-gradient(135deg, rgba(252, 209, 22, 0.1), rgba(252, 209, 22, 0.03))',
    border: 'rgba(252, 209, 22, 0.18)',
    color: '#FCD116',
    dot: '#FCD116',
    icon: '🟡',
    action: 'Review when possible',
  },
  low: {
    gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.03))',
    border: 'rgba(59, 130, 246, 0.18)',
    color: '#3B82F6',
    dot: '#3B82F6',
    icon: '🔵',
    action: 'Monitor trend',
  },
};

export default function AnomalyDetection({ anomalies }) {
  const count = anomalies?.length || 0;
  const allClear = !anomalies || count === 0;

  // Count by severity
  const severityCounts = { high: 0, medium: 0, low: 0 };
  anomalies?.forEach(a => { severityCounts[a.severity] = (severityCounts[a.severity] || 0) + 1; });

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring.gentle}
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
            style={{
              background: allClear
                ? 'linear-gradient(135deg, rgba(0, 107, 63, 0.15), rgba(52, 211, 153, 0.1))'
                : 'linear-gradient(135deg, rgba(206, 17, 38, 0.15), rgba(252, 209, 22, 0.1))',
              border: `1px solid ${allClear ? 'rgba(0, 107, 63, 0.2)' : 'rgba(206, 17, 38, 0.2)'}`,
            }}
          >
            {allClear ? '✓' : '⚠'}
          </div>
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Anomaly Detection</h3>
        </div>

        {/* Severity summary pills */}
        {!allClear && (
          <div className="flex items-center gap-1.5">
            {Object.entries(severityCounts).filter(([_, c]) => c > 0).map(([sev, c]) => (
              <span
                key={sev}
                className="text-[9px] font-bold px-2 py-0.5 rounded-md"
                style={{
                  background: SEVERITY_CONFIG[sev]?.gradient,
                  color: SEVERITY_CONFIG[sev]?.color,
                  border: `1px solid ${SEVERITY_CONFIG[sev]?.border}`,
                }}
              >
                {c} {sev}
              </span>
            ))}
          </div>
        )}
      </div>

      {allClear ? (
        <EmptyState
          type="anomalies"
          title="All clear"
          description="No anomalies detected. Scanning runs daily at 10 PM."
        />
      ) : (
        <motion.div
          className="space-y-2.5 max-h-72 overflow-y-auto pr-1 custom-scrollbar"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <AnimatePresence>
            {anomalies.map((a, i) => {
              const cfg = SEVERITY_CONFIG[a.severity] || SEVERITY_CONFIG.low;
              return (
                <motion.div
                  key={a.id || i}
                  variants={staggerItem}
                  className="p-3.5 rounded-2xl relative overflow-hidden group"
                  style={{
                    background: cfg.gradient,
                    border: `1px solid ${cfg.border}`,
                  }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      {/* Pulsing severity dot */}
                      <div className="relative">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.dot }} />
                        {a.severity === 'high' && (
                          <div
                            className="absolute inset-0 w-2 h-2 rounded-full animate-ping"
                            style={{ backgroundColor: cfg.dot, opacity: 0.4 }}
                          />
                        )}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1" style={{ color: cfg.color }}>
                        {cfg.icon} {a.severity}
                      </span>
                    </div>
                    <span className="text-[10px] text-text-muted font-mono">
                      {a.created_at ? new Date(a.created_at).toLocaleString('en-GH', { timeZone: 'Africa/Accra' }) : ''}
                    </span>
                  </div>
                  <p className="text-sm text-text-primary leading-relaxed">{a.description}</p>
                  {a.ai_reasoning && (
                    <p className="text-xs text-text-muted mt-1.5 leading-relaxed italic">{a.ai_reasoning}</p>
                  )}

                  {/* Recommended action */}
                  <div className="flex items-center justify-between mt-2 pt-2" style={{ borderTop: `1px solid ${cfg.border}` }}>
                    <span className="text-[10px] text-text-muted">Suggested: {cfg.action}</span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
}

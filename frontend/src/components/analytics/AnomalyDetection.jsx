import { useState, useEffect } from 'react';

const SEVERITY_CONFIG = {
  high: {
    gradient: 'linear-gradient(135deg, rgba(206, 17, 38, 0.12), rgba(206, 17, 38, 0.04))',
    border: 'rgba(206, 17, 38, 0.2)',
    color: '#CE1126',
    glow: 'var(--status-glow, 0 0 20px rgba(206, 17, 38, 0.08))',
    dot: '#CE1126',
  },
  medium: {
    gradient: 'linear-gradient(135deg, rgba(252, 209, 22, 0.1), rgba(252, 209, 22, 0.03))',
    border: 'rgba(252, 209, 22, 0.18)',
    color: '#FCD116',
    glow: 'var(--status-glow, 0 0 20px rgba(252, 209, 22, 0.06))',
    dot: '#FCD116',
  },
  low: {
    gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.03))',
    border: 'rgba(59, 130, 246, 0.18)',
    color: '#3B82F6',
    glow: 'var(--status-glow, 0 0 20px rgba(59, 130, 246, 0.06))',
    dot: '#3B82F6',
  },
};

export default function AnomalyDetection({ anomalies }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  const count = anomalies?.length || 0;
  const allClear = !anomalies || count === 0;

  return (
    <div className="card">
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
            {allClear ? '\u2713' : '\u26A0'}
          </div>
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Anomaly Detection</h3>
        </div>
        <span
          className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg"
          style={{
            background: allClear ? 'rgba(0, 107, 63, 0.1)' : 'rgba(206, 17, 38, 0.1)',
            color: allClear ? '#34D399' : '#CE1126',
            border: `1px solid ${allClear ? 'rgba(0, 107, 63, 0.15)' : 'rgba(206, 17, 38, 0.15)'}`,
          }}
        >
          {count} detected
        </span>
      </div>

      {allClear ? (
        <div className="text-center py-8">
          <div
            className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 107, 63, 0.08), rgba(52, 211, 153, 0.05))',
              border: '1px solid rgba(0, 107, 63, 0.1)',
            }}
          >
            <span className="text-xl" style={{ color: '#34D399' }}>{'\u2714'}</span>
          </div>
          <p className="text-sm" style={{ color: '#34D399' }}>All clear — no anomalies detected.</p>
          <p className="text-xs text-text-muted mt-1">Scanning runs every 10 PM</p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
          {anomalies.map((a, i) => {
            const cfg = SEVERITY_CONFIG[a.severity] || SEVERITY_CONFIG.low;
            return (
              <div
                key={a.id || i}
                className="p-3.5 rounded-2xl relative overflow-hidden"
                style={{
                  background: cfg.gradient,
                  border: `1px solid ${cfg.border}`,
                  boxShadow: cfg.glow,
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateY(0)' : 'translateY(8px)',
                  transition: `all 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${i * 80}ms`,
                }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: cfg.dot, boxShadow: `0 0 8px ${cfg.dot}40` }}
                    />
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: cfg.color }}>
                      {a.severity}
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

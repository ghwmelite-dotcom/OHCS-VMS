import { useState, useEffect } from 'react';
import ConfidenceBar from '../shared/ConfidenceBar';
import AnimatedCounter from '../shared/AnimatedCounter';

export default function PredictiveAnalytics({ prediction }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 150); }, []);

  return (
    <div className="card shimmer-border">
      <div className="flex items-center gap-2.5 mb-5">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
          style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(59, 130, 246, 0.1))',
            border: '1px solid rgba(139, 92, 246, 0.2)',
          }}
        >
          {'\u{1F52E}'}
        </div>
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Predictive Analytics</h3>
      </div>

      {!prediction ? (
        <div className="text-center py-8">
          <div
            className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(59, 130, 246, 0.05))',
              border: '1px solid rgba(139, 92, 246, 0.1)',
            }}
          >
            <span className="text-xl">{'\u{1F52E}'}</span>
          </div>
          <p className="text-text-muted text-sm">Predictions generate at 6 AM daily.</p>
          <p className="text-xs text-text-muted mt-1">AI model analyzes historical patterns</p>
        </div>
      ) : (
        <div className="space-y-3 stagger-children">
          {/* Main prediction stats */}
          <div className="grid grid-cols-2 gap-2.5">
            <StatBlock
              label="Predicted Visitors"
              icon={'\u{1F465}'}
              value={prediction.predicted_count ?? prediction.predictedCount ?? '\u2014'}
              animated={visible}
              delay={0}
            />
            <StatBlock
              label="Peak Hour"
              icon={'\u{23F0}'}
              value={prediction.peak_hour != null ? `${prediction.peak_hour ?? prediction.peakHour}:00` : '\u2014'}
              animated={visible}
              delay={80}
              isTime
            />
          </div>

          {/* Busiest office */}
          {(prediction.busiest_office || prediction.busiestOffice) && (
            <div
              className="p-3.5 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(252, 209, 22, 0.06), rgba(0, 107, 63, 0.04))',
                border: '1px solid rgba(252, 209, 22, 0.1)',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(8px)',
                transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1) 160ms',
              }}
            >
              <span className="text-[10px] text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                <span>{'\u{1F3DB}\u{FE0F}'}</span> Busiest Office Forecast
              </span>
              <div
                className="text-lg font-bold font-mono mt-1"
                style={{ color: '#FCD116', textShadow: 'var(--glow-gold-text)' }}
              >
                {prediction.busiest_office || prediction.busiestOffice}
              </div>
            </div>
          )}

          {/* Confidence */}
          <div
            className="p-3.5 rounded-2xl"
            style={{
              background: 'var(--bg-card-inset)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <span className="text-[10px] text-text-muted uppercase tracking-wider mb-2 block">Model Confidence</span>
            <ConfidenceBar confidence={prediction.confidence || 0} />
          </div>

          {/* Staff recommendation */}
          {(prediction.staff_recommendation || prediction.staffRecommendation) && (
            <div
              className="p-3.5 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.06), rgba(139, 92, 246, 0.04))',
                border: '1px solid rgba(59, 130, 246, 0.1)',
              }}
            >
              <span className="text-[10px] text-text-muted uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <span>{'\u{1F4A1}'}</span> AI Recommendation
              </span>
              <p className="text-xs leading-relaxed" style={{ color: '#818CF8' }}>
                {prediction.staff_recommendation || prediction.staffRecommendation}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatBlock({ label, icon, value, animated, delay, isTime }) {
  const numericValue = typeof value === 'number' ? value : null;

  return (
    <div
      className="p-3.5 rounded-2xl"
      style={{
        background: 'var(--bg-card-inset)',
        border: '1px solid var(--border-subtle)',
        opacity: animated ? 1 : 0,
        transform: animated ? 'translateY(0)' : 'translateY(8px)',
        transition: `all 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      }}
    >
      <span className="text-[10px] text-text-muted uppercase tracking-wider flex items-center gap-1.5">
        <span>{icon}</span> {label}
      </span>
      <div
        className="text-2xl font-bold font-mono mt-1"
        style={{ color: '#FCD116', textShadow: 'var(--glow-gold-text)' }}
      >
        {numericValue != null && !isTime ? (
          <AnimatedCounter value={numericValue} duration={800} />
        ) : (
          value
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';

const SEGMENTS = [
  { key: 'positive', label: 'Positive', icon: '\u{1F60A}', gradient: 'linear-gradient(90deg, #006B3F, #34D399)', color: '#34D399', glow: 'rgba(0, 107, 63, 0.15)' },
  { key: 'neutral', label: 'Neutral', icon: '\u{1F610}', gradient: 'linear-gradient(90deg, #C4A000, #FCD116)', color: '#FCD116', glow: 'rgba(252, 209, 22, 0.12)' },
  { key: 'negative', label: 'Negative', icon: '\u{1F61E}', gradient: 'linear-gradient(90deg, #8B0000, #CE1126)', color: '#CE1126', glow: 'rgba(206, 17, 38, 0.12)' },
];

export default function SentimentAnalysis({ data }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { setTimeout(() => setAnimated(true), 200); }, []);

  const total = (data?.positive || 0) + (data?.neutral || 0) + (data?.negative || 0);

  return (
    <div className="card">
      <div className="flex items-center gap-2.5 mb-5">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 107, 63, 0.15), rgba(252, 209, 22, 0.1))',
            border: '1px solid rgba(0, 107, 63, 0.2)',
          }}
        >
          {'\u{1F4AC}'}
        </div>
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Visitor Sentiment</h3>
      </div>

      {total === 0 ? (
        <div className="text-center py-8">
          <div
            className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(148, 163, 184, 0.06), rgba(148, 163, 184, 0.02))',
              border: '1px solid var(--border-secondary)',
            }}
          >
            <span className="text-xl">{'\u{1F4AC}'}</span>
          </div>
          <p className="text-text-muted text-sm">No feedback data yet.</p>
          <p className="text-xs text-text-muted mt-1">Sentiment is analyzed from visitor feedback</p>
        </div>
      ) : (
        <>
          {/* Segmented bar */}
          <div
            className="flex h-3 rounded-full overflow-hidden mb-5"
            style={{ background: 'var(--bar-track)' }}
          >
            {SEGMENTS.map((s, i) => {
              const count = data?.[s.key] || 0;
              if (count === 0) return null;
              const pct = (count / total) * 100;
              return (
                <div
                  key={s.key}
                  className="h-full relative overflow-hidden"
                  style={{
                    width: animated ? `${pct}%` : '0%',
                    background: s.gradient,
                    transition: `width 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${i * 150}ms`,
                  }}
                >
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 100%)' }} />
                </div>
              );
            })}
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-2.5">
            {SEGMENTS.map((s, i) => {
              const count = data?.[s.key] || 0;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div
                  key={s.key}
                  className="p-3.5 rounded-2xl text-center"
                  style={{
                    background: 'var(--bg-card-inset)',
                    border: '1px solid var(--border-subtle)',
                    opacity: animated ? 1 : 0,
                    transform: animated ? 'translateY(0)' : 'translateY(12px)',
                    transition: `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${(i + 1) * 100}ms`,
                  }}
                >
                  <div className="text-lg mb-1">{s.icon}</div>
                  <div
                    className="text-2xl font-bold font-mono"
                    style={{ color: s.color, textShadow: `0 0 16px ${s.glow}` }}
                  >
                    {count}
                  </div>
                  <div className="text-xs text-text-muted mt-0.5">{s.label}</div>
                  <div className="text-[10px] font-mono text-text-muted mt-0.5">{pct}%</div>
                </div>
              );
            })}
          </div>

          {data?.avgRating != null && data.avgRating > 0 && (
            <div
              className="mt-3.5 p-3.5 rounded-2xl text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(252, 209, 22, 0.06), rgba(0, 107, 63, 0.04))',
                border: '1px solid rgba(252, 209, 22, 0.1)',
              }}
            >
              <span className="text-xs text-text-muted">Average Rating </span>
              <span
                className="text-lg font-bold font-mono"
                style={{ color: '#FCD116', textShadow: 'var(--glow-gold-text)' }}
              >
                {data.avgRating}/5
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

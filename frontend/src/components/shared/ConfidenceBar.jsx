import { useEffect, useState } from 'react';

export default function ConfidenceBar({ confidence, showLabel = true, animate = true }) {
  const [width, setWidth] = useState(animate ? 0 : Math.round(confidence * 100));
  const pct = Math.round(confidence * 100);

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => setWidth(pct), 100);
      return () => clearTimeout(timer);
    }
  }, [pct, animate]);

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden relative"
        style={{ background: 'var(--bar-track, rgba(148, 163, 184, 0.08))' }}
      >
        <div
          className="h-full rounded-full relative"
          style={{
            width: `${width}%`,
            background: 'linear-gradient(90deg, #006B3F 0%, #34D399 40%, #FCD116 100%)',
            boxShadow: '0 0 12px rgba(252, 209, 22, 0.2)',
            transition: animate ? 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
          }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-mono text-text-secondary tabular-nums">{pct}%</span>
      )}
    </div>
  );
}

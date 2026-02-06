import { useState, useEffect } from 'react';
import OfficePill from '../shared/OfficePill';

export default function OfficeTraffic({ data }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { setTimeout(() => setAnimated(true), 200); }, []);

  if (!data || data.length === 0) {
    return (
      <div className="card">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Office Traffic</h3>
        <p className="text-text-muted text-sm text-center py-6">No traffic data yet.</p>
      </div>
    );
  }

  const maxCount = Math.max(...data.map(d => d.visitor_count || 0), 1);
  const directorates = data.filter(d => d.office_type === 'directorate');
  const units = data.filter(d => d.office_type === 'unit');
  const executive = data.filter(d => d.office_type === 'executive');

  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-5">Office Traffic</h3>

      {executive.length > 0 && <Section label="Executive" items={executive} maxCount={maxCount} animated={animated} offset={0} />}
      <Section label="Directorates" items={directorates} maxCount={maxCount} animated={animated} offset={executive.length} />
      <Section label="Units" items={units} maxCount={maxCount} animated={animated} offset={executive.length + directorates.length} />
    </div>
  );
}

function Section({ label, items, maxCount, animated, offset }) {
  if (items.length === 0) return null;

  return (
    <div className="mb-5 last:mb-0">
      <div className="text-[10px] text-text-muted uppercase tracking-widest mb-3 font-medium">{label}</div>
      <div className="space-y-2.5">
        {items.map((item, i) => {
          const pct = ((item.visitor_count || 0) / maxCount) * 100;
          return (
            <div key={item.abbreviation} className="flex items-center gap-3 group">
              <div className="w-16 shrink-0">
                <OfficePill abbreviation={item.abbreviation} type={item.office_type} />
              </div>
              <div className="flex-1 h-2.5 rounded-full overflow-hidden relative" style={{ background: 'var(--bar-track)' }}>
                <div
                  className="h-full rounded-full relative overflow-hidden"
                  style={{
                    width: animated ? `${Math.max(pct, 2)}%` : '0%',
                    background: 'linear-gradient(90deg, #006B3F 0%, #34D399 50%, #FCD116 100%)',
                    boxShadow: '0 0 12px rgba(252, 209, 22, 0.1)',
                    transition: `width 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${(offset + i) * 100}ms`,
                  }}
                >
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 100%)' }} />
                </div>
              </div>
              <span
                className="text-sm font-bold font-mono w-8 text-right tabular-nums"
                style={{ color: '#FCD116', textShadow: 'var(--glow-gold-text)' }}
              >
                {item.visitor_count || 0}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

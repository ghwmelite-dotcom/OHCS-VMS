import { useState, useEffect } from 'react';

export default function WeeklyChart({ data }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 200);
    return () => clearTimeout(timer);
  }, []);

  if (!data || data.length === 0) {
    return (
      <div className="card">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Weekly Traffic</h3>
        <div className="text-center py-8">
          <p className="text-text-muted text-sm">Collecting data...</p>
        </div>
      </div>
    );
  }

  const maxVisitors = Math.max(...data.map(d => d.total_visitors || 0), 1);
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-6">Weekly Traffic</h3>
      <div className="flex items-end gap-3 h-44 px-2">
        {data.map((day, i) => {
          const count = day.total_visitors || 0;
          const height = (count / maxVisitors) * 100;
          const isToday = day.date === today;
          const dayLabel = new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' });

          return (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-2 group">
              {/* Count */}
              <span
                className="text-xs font-mono tabular-nums transition-all duration-300"
                style={{ color: isToday ? '#FCD116' : 'var(--text-muted)' }}
              >
                {count}
              </span>

              {/* Bar container */}
              <div className="w-full relative h-[130px] flex items-end">
                <div
                  className="w-full rounded-t-xl relative overflow-hidden transition-all duration-700"
                  style={{
                    height: animated ? `${Math.max(height, 3)}%` : '0%',
                    transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                    transitionDelay: `${i * 80}ms`,
                    background: isToday
                      ? 'linear-gradient(180deg, #FCD116 0%, #006B3F 100%)'
                      : 'linear-gradient(180deg, rgba(252, 209, 22, 0.4) 0%, rgba(0, 107, 63, 0.3) 100%)',
                    boxShadow: isToday ? '0 0 20px rgba(252, 209, 22, 0.15)' : 'none',
                  }}
                >
                  {/* Shine effect */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
                    }}
                  />
                  {/* Hover highlight */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: 'rgba(255,255,255,0.05)' }}
                  />
                </div>
              </div>

              {/* Day label */}
              <span
                className="text-[11px] font-medium transition-colors duration-200"
                style={{
                  color: isToday ? '#FCD116' : 'var(--text-muted)',
                  textShadow: isToday ? 'var(--glow-gold-text)' : 'none',
                }}
              >
                {dayLabel}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

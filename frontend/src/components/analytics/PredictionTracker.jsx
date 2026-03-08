import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, ComposedChart } from 'recharts';
import { getPredictionAccuracy } from '../../services/api';

export default function PredictionTracker() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPredictionAccuracy(14)
      .then(d => {
        const formatted = (d.accuracy || []).map(row => ({
          date: new Date(row.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          actual: row.actual || 0,
          predicted: row.predicted || 0,
        }));
        setData(formatted);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || data.length < 2) return null;

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.[0]) return null;
    return (
      <div
        className="rounded-xl px-3 py-2"
        style={{
          background: 'var(--bg-modal)',
          border: '1px solid var(--border-separator)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <p className="text-[10px] text-text-muted mb-1">{label}</p>
        {payload.map(p => (
          <p key={p.dataKey} className="text-xs font-mono" style={{ color: p.color }}>
            {p.dataKey === 'actual' ? 'Actual' : 'Predicted'}: {p.value}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div
      className="p-3.5 rounded-2xl"
      style={{ background: 'var(--bg-card-inset)', border: '1px solid var(--border-subtle)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] text-text-muted uppercase tracking-wider">Prediction Accuracy</span>
        <span className="text-[9px] text-text-muted">Last 14 days</span>
      </div>

      <ResponsiveContainer width="100%" height={120}>
        <ComposedChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 9 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 9 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />

          {/* Accuracy area (between predicted and actual) */}
          <Area
            type="monotone"
            dataKey="predicted"
            stroke="none"
            fill="rgba(139, 92, 246, 0.08)"
            animationDuration={800}
          />

          {/* Actual line (solid) */}
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#34D399"
            strokeWidth={2}
            dot={{ r: 2, fill: '#34D399' }}
            animationDuration={800}
          />

          {/* Predicted line (dashed) */}
          <Line
            type="monotone"
            dataKey="predicted"
            stroke="#8B5CF6"
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={{ r: 2, fill: '#8B5CF6' }}
            animationDuration={1000}
          />
        </ComposedChart>
      </ResponsiveContainer>

      <div className="flex items-center justify-center gap-4 mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 rounded-full" style={{ background: '#34D399' }} />
          <span className="text-[9px] text-text-muted">Actual</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 rounded-full" style={{ background: '#8B5CF6', borderTop: '1px dashed #8B5CF6' }} />
          <span className="text-[9px] text-text-muted">Predicted</span>
        </div>
      </div>
    </div>
  );
}

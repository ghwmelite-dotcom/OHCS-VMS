import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import AnimatedCounter from '../shared/AnimatedCounter';
import { fadeInUp, spring } from '../../constants/motion';

const SEGMENTS = [
  { key: 'positive', label: 'Positive', emoji: '😊', color: '#34D399', gradient: 'linear-gradient(90deg, #006B3F, #34D399)' },
  { key: 'neutral', label: 'Neutral', emoji: '😐', color: '#FCD116', gradient: 'linear-gradient(90deg, #C4A000, #FCD116)' },
  { key: 'negative', label: 'Negative', emoji: '😞', color: '#CE1126', gradient: 'linear-gradient(90deg, #8B0000, #CE1126)' },
];

export default function SentimentAnalysis({ data }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { setTimeout(() => setAnimated(true), 200); }, []);

  const total = (data?.positive || 0) + (data?.neutral || 0) + (data?.negative || 0);

  const pieData = SEGMENTS.map(s => ({
    name: s.label,
    value: data?.[s.key] || 0,
    color: s.color,
  })).filter(d => d.value > 0);

  // Gauge angle for average rating (0-5 scale → 0-180 degrees)
  const avgRating = data?.avgRating || 0;
  const gaugeAngle = (avgRating / 5) * 180;

  return (
    <motion.div
      className="card"
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      transition={spring.gentle}
    >
      <div className="flex items-center gap-2.5 mb-5">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 107, 63, 0.15), rgba(252, 209, 22, 0.1))',
            border: '1px solid rgba(0, 107, 63, 0.2)',
          }}
        >
          💬
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
            <span className="text-xl">💬</span>
          </div>
          <p className="text-text-muted text-sm">No feedback data yet.</p>
          <p className="text-xs text-text-muted mt-1">Sentiment is analyzed from visitor feedback</p>
        </div>
      ) : (
        <>
          {/* Sentiment gauge (semicircle) */}
          {avgRating > 0 && (
            <div className="relative flex justify-center mb-4">
              <svg viewBox="0 0 200 110" className="w-48 h-auto">
                {/* Track */}
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="var(--bar-track)"
                  strokeWidth="12"
                  strokeLinecap="round"
                />
                {/* Fill */}
                <motion.path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="url(#sentimentGradient)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: animated ? avgRating / 5 : 0 }}
                  transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                />
                {/* Needle */}
                <motion.line
                  x1="100" y1="100"
                  x2="100" y2="30"
                  stroke="#FCD116"
                  strokeWidth="2"
                  strokeLinecap="round"
                  style={{ transformOrigin: '100px 100px' }}
                  initial={{ rotate: -90 }}
                  animate={{ rotate: animated ? gaugeAngle - 90 : -90 }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
                />
                <circle cx="100" cy="100" r="4" fill="#FCD116" />
                <defs>
                  <linearGradient id="sentimentGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#CE1126" />
                    <stop offset="50%" stopColor="#FCD116" />
                    <stop offset="100%" stopColor="#34D399" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute bottom-0 text-center">
                <span className="text-2xl font-bold font-mono" style={{ color: '#FCD116' }}>
                  {avgRating.toFixed(1)}
                </span>
                <span className="text-xs text-text-muted"> / 5</span>
              </div>
            </div>
          )}

          {/* Donut + Stats */}
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%" cy="50%"
                    innerRadius={25}
                    outerRadius={40}
                    paddingAngle={3}
                    dataKey="value"
                    animationDuration={800}
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {SEGMENTS.map((s) => {
                const count = data?.[s.key] || 0;
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={s.key} className="flex items-center gap-2">
                    <span className="text-sm">{s.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[11px] text-text-secondary">{s.label}</span>
                        <span className="text-xs font-mono font-bold" style={{ color: s.color }}>
                          <AnimatedCounter value={count} /> <span className="text-text-muted">({pct}%)</span>
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bar-track)' }}>
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: s.gradient }}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}

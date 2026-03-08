import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Line, ComposedChart, ReferenceLine } from 'recharts';
import { fadeInUp, spring } from '../../constants/motion';
import Skeleton from '../shared/Skeleton';

export default function WeeklyChart({ data, prediction }) {
  if (!data || data.length === 0) {
    return <Skeleton.Chart />;
  }

  const today = new Date().toISOString().split('T')[0];

  const chartData = data.map(day => {
    const dayLabel = new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' });
    return {
      name: dayLabel,
      visitors: day.total_visitors || 0,
      isToday: day.date === today,
      date: day.date,
    };
  });

  // Compute 3-day moving average
  chartData.forEach((d, i) => {
    const slice = chartData.slice(Math.max(0, i - 2), i + 1);
    d.avg = Math.round(slice.reduce((s, x) => s + x.visitors, 0) / slice.length);
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.[0]) return null;
    return (
      <div
        className="rounded-xl px-3 py-2"
        style={{
          background: 'var(--bg-modal)',
          border: '1px solid var(--border-separator)',
          boxShadow: 'var(--shadow-card)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <p className="text-xs font-semibold text-text-primary">{label}</p>
        <p className="text-sm font-mono font-bold" style={{ color: '#FCD116' }}>
          {payload[0].value} visitors
        </p>
        {payload[1] && (
          <p className="text-[10px] text-text-muted">
            Avg: {payload[1].value}
          </p>
        )}
      </div>
    );
  };

  return (
    <motion.div
      className="card"
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      transition={spring.gentle}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Weekly Traffic</h3>
        {prediction?.predicted_count && (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-text-muted">Predicted today:</span>
            <span className="text-xs font-bold font-mono" style={{ color: '#818CF8' }}>
              {prediction.predicted_count}
            </span>
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'DM Sans' }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'Space Mono' }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.05)' }} />

          {prediction?.predicted_count && (
            <ReferenceLine
              y={prediction.predicted_count}
              stroke="#818CF8"
              strokeDasharray="4 4"
              strokeWidth={1}
              opacity={0.5}
            />
          )}

          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FCD116" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#006B3F" stopOpacity={0.7} />
            </linearGradient>
            <linearGradient id="barGradientMuted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FCD116" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#006B3F" stopOpacity={0.3} />
            </linearGradient>
          </defs>

          <Bar
            dataKey="visitors"
            radius={[6, 6, 0, 0]}
            maxBarSize={40}
            fill="url(#barGradientMuted)"
            animationDuration={800}
            animationEasing="ease-out"
          />
          <Line
            type="monotone"
            dataKey="avg"
            stroke="#F59E0B"
            strokeWidth={2}
            dot={false}
            strokeDasharray="4 4"
            animationDuration={1000}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

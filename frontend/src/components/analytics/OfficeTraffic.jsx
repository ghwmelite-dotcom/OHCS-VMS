import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import EmptyState from '../shared/EmptyState';
import { fadeInUp, spring } from '../../constants/motion';

const PERIOD_OPTIONS = [
  { label: '7D', value: 7 },
  { label: '30D', value: 30 },
  { label: '90D', value: 90 },
];

const TYPE_COLORS = {
  directorate: '#34D399',
  unit: '#60A5FA',
  executive: '#FCD116',
};

export default function OfficeTraffic({ data, onPeriodChange }) {
  const [period, setPeriod] = useState(7);
  const [selectedOffice, setSelectedOffice] = useState(null);

  const handlePeriodChange = (val) => {
    setPeriod(val);
    onPeriodChange?.(val);
  };

  if (!data || data.length === 0) {
    return (
      <div className="card">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Office Traffic</h3>
        <EmptyState type="data" title="No traffic data" description="Traffic data will appear after the first visitor checks in." />
      </div>
    );
  }

  const chartData = data.map(d => ({
    name: d.abbreviation,
    visitors: d.visitor_count || 0,
    type: d.office_type,
    fullName: d.full_name,
    avgDuration: d.avg_duration_mins ? `${Math.round(d.avg_duration_mins)}min` : 'N/A',
  })).sort((a, b) => b.visitors - a.visitors);

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.[0]) return null;
    const d = payload[0].payload;
    return (
      <div
        className="rounded-xl px-3 py-2"
        style={{
          background: 'var(--bg-modal)',
          border: '1px solid var(--border-separator)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <p className="text-xs font-semibold text-text-primary">{d.fullName || d.name}</p>
        <p className="text-sm font-mono font-bold" style={{ color: TYPE_COLORS[d.type] || '#FCD116' }}>
          {d.visitors} visitors
        </p>
        <p className="text-[10px] text-text-muted">Avg duration: {d.avgDuration}</p>
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
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Office Traffic</h3>
        <div
          className="flex rounded-lg overflow-hidden"
          style={{ border: '1px solid var(--border-separator)' }}
        >
          {PERIOD_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => handlePeriodChange(opt.value)}
              className="px-2.5 py-1 text-[10px] font-bold transition-colors"
              style={{
                background: period === opt.value ? 'rgba(252, 209, 22, 0.1)' : 'transparent',
                color: period === opt.value ? '#FCD116' : 'var(--text-muted)',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={chartData.length * 36 + 20}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
          <XAxis type="number" hide />
          <YAxis
            dataKey="name"
            type="category"
            axisLine={false}
            tickLine={false}
            width={50}
            tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'Space Mono' }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.03)' }} />
          <Bar
            dataKey="visitors"
            radius={[0, 6, 6, 0]}
            maxBarSize={20}
            animationDuration={800}
            onClick={(d) => setSelectedOffice(d.name)}
            cursor="pointer"
          >
            {chartData.map((entry) => (
              <Cell
                key={entry.name}
                fill={TYPE_COLORS[entry.type] || '#FCD116'}
                opacity={selectedOffice && selectedOffice !== entry.name ? 0.3 : 0.8}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {selectedOffice && (
        <motion.div
          className="mt-3 flex items-center justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <span className="text-xs text-text-muted">Showing: <span className="font-bold text-text-primary">{selectedOffice}</span></span>
          <button
            onClick={() => setSelectedOffice(null)}
            className="text-[10px] text-text-muted hover:text-text-secondary"
          >
            Clear filter
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}

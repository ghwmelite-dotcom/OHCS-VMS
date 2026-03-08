import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getFlowData } from '../../services/api';
import Skeleton from '../shared/Skeleton';
import { spring, staggerContainer, staggerItem } from '../../constants/motion';

const SOURCE_COLORS = {
  'Walk-in': '#FCD116',
  'Pre-Registered': '#34D399',
  'AI-Routed': '#818CF8',
};

const OUTCOME_COLORS = {
  'checked-in': '#34D399',
  'checked-out': '#64748B',
};

export default function VisitorFlowSankey() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFlowData()
      .then(d => setData(d.flow || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton.AnalyticsCard />;
  if (!data || data.length === 0) {
    return (
      <div className="card">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Visitor Flow</h3>
        <div className="text-center py-8">
          <p className="text-text-muted text-sm">Flow data builds over the first week</p>
        </div>
      </div>
    );
  }

  // Aggregate by source
  const sources = {};
  const offices = {};
  const outcomes = {};
  let totalVisitors = 0;

  data.forEach(row => {
    sources[row.source] = (sources[row.source] || 0) + row.count;
    offices[row.office] = (offices[row.office] || 0) + row.count;
    outcomes[row.outcome] = (outcomes[row.outcome] || 0) + row.count;
    totalVisitors += row.count;
  });

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring.gentle}
    >
      <div className="flex items-center gap-2.5 mb-5">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
          style={{
            background: 'linear-gradient(135deg, rgba(252, 209, 22, 0.12), rgba(0, 107, 63, 0.1))',
            border: '1px solid rgba(252, 209, 22, 0.2)',
          }}
        >
          🔀
        </div>
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Visitor Flow</h3>
      </div>

      {/* Simplified flow visualization */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* Sources column */}
        <motion.div variants={staggerItem} className="space-y-2">
          <div className="text-[10px] text-text-muted uppercase tracking-wider mb-2 text-center">Source</div>
          {Object.entries(sources).sort((a, b) => b[1] - a[1]).map(([source, count]) => {
            const pct = Math.round((count / totalVisitors) * 100);
            return (
              <motion.div
                key={source}
                className="p-2.5 rounded-xl text-center"
                style={{
                  background: 'var(--bg-card-inset)',
                  border: `1px solid ${SOURCE_COLORS[source] || '#FCD116'}20`,
                }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-lg font-bold font-mono" style={{ color: SOURCE_COLORS[source] || '#FCD116' }}>
                  {count}
                </div>
                <div className="text-[10px] text-text-muted">{source}</div>
                <div className="text-[9px] text-text-muted font-mono">{pct}%</div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Offices column */}
        <motion.div variants={staggerItem} className="space-y-2">
          <div className="text-[10px] text-text-muted uppercase tracking-wider mb-2 text-center">Offices</div>
          {Object.entries(offices).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([office, count]) => (
            <div
              key={office}
              className="p-2 rounded-xl text-center"
              style={{
                background: 'var(--bg-card-inset)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div className="text-sm font-bold font-mono" style={{ color: '#FCD116' }}>{count}</div>
              <div className="text-[10px] text-text-muted font-mono">{office}</div>
            </div>
          ))}
        </motion.div>

        {/* Outcomes column */}
        <motion.div variants={staggerItem} className="space-y-2">
          <div className="text-[10px] text-text-muted uppercase tracking-wider mb-2 text-center">Outcome</div>
          {Object.entries(outcomes).sort((a, b) => b[1] - a[1]).map(([outcome, count]) => {
            const pct = Math.round((count / totalVisitors) * 100);
            const label = outcome === 'checked-in' ? 'Active' : 'Completed';
            return (
              <div
                key={outcome}
                className="p-2.5 rounded-xl text-center"
                style={{
                  background: 'var(--bg-card-inset)',
                  border: `1px solid ${OUTCOME_COLORS[outcome] || '#64748B'}20`,
                }}
              >
                <div className="text-lg font-bold font-mono" style={{ color: OUTCOME_COLORS[outcome] || '#64748B' }}>
                  {count}
                </div>
                <div className="text-[10px] text-text-muted">{label}</div>
                <div className="text-[9px] text-text-muted font-mono">{pct}%</div>
              </div>
            );
          })}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

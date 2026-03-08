import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '../../constants/motion';

const HOURS = Array.from({ length: 10 }, (_, i) => i + 8); // 8 AM to 5 PM
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

function getIntensityColor(value, max) {
  if (!value || max === 0) return 'rgba(148, 163, 184, 0.04)';
  const ratio = value / max;
  if (ratio < 0.25) return 'rgba(0, 107, 63, 0.15)';
  if (ratio < 0.5) return 'rgba(0, 107, 63, 0.35)';
  if (ratio < 0.75) return 'rgba(252, 209, 22, 0.4)';
  return 'rgba(252, 209, 22, 0.7)';
}

function getIntensityBorder(value, max) {
  if (!value || max === 0) return 'rgba(148, 163, 184, 0.06)';
  const ratio = value / max;
  if (ratio < 0.5) return 'rgba(0, 107, 63, 0.2)';
  return 'rgba(252, 209, 22, 0.3)';
}

export default function VisitorHeatmap({ data }) {
  const [hovered, setHovered] = useState(null);

  // Build grid: data is expected as { [day]: { [hour]: count } } or flat array
  const grid = {};
  let max = 0;

  if (Array.isArray(data)) {
    data.forEach(({ day_of_week, hour, count }) => {
      if (!grid[day_of_week]) grid[day_of_week] = {};
      grid[day_of_week][hour] = count;
      if (count > max) max = count;
    });
  }

  if (!data || (Array.isArray(data) && data.length === 0)) {
    return (
      <div className="card">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Visitor Heatmap</h3>
        <div className="text-center py-8">
          <p className="text-text-muted text-sm">Heatmap data builds over time</p>
        </div>
      </div>
    );
  }

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
          🗓️
        </div>
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Visitor Heatmap</h3>
      </div>

      {/* Hour labels */}
      <div className="flex gap-1 mb-1 ml-10">
        {HOURS.map(h => (
          <div key={h} className="flex-1 text-center text-[9px] text-text-muted font-mono">
            {h}:00
          </div>
        ))}
      </div>

      {/* Grid */}
      <motion.div
        className="space-y-1"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {DAYS.map((day, dayIdx) => (
          <motion.div key={day} className="flex gap-1 items-center" variants={staggerItem}>
            <span className="w-8 text-[10px] text-text-muted font-medium text-right shrink-0">{day}</span>
            <div className="flex-1 flex gap-1">
              {HOURS.map(hour => {
                const count = grid[dayIdx]?.[hour] || grid[day]?.[hour] || 0;
                const isHovered = hovered?.day === day && hovered?.hour === hour;
                return (
                  <motion.div
                    key={hour}
                    className="flex-1 aspect-square rounded-lg relative cursor-default"
                    style={{
                      background: getIntensityColor(count, max),
                      border: `1px solid ${getIntensityBorder(count, max)}`,
                      minHeight: '24px',
                    }}
                    whileHover={{ scale: 1.15, zIndex: 10 }}
                    onHoverStart={() => setHovered({ day, hour, count })}
                    onHoverEnd={() => setHovered(null)}
                  >
                    {isHovered && count > 0 && (
                      <motion.div
                        className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg text-[10px] font-mono whitespace-nowrap z-20"
                        style={{
                          background: 'var(--bg-modal)',
                          border: '1px solid var(--border-separator)',
                          color: '#FCD116',
                          boxShadow: 'var(--shadow-card)',
                        }}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {count} visitors
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-2 mt-3">
        <span className="text-[9px] text-text-muted">Less</span>
        {['rgba(148, 163, 184, 0.04)', 'rgba(0, 107, 63, 0.15)', 'rgba(0, 107, 63, 0.35)', 'rgba(252, 209, 22, 0.4)', 'rgba(252, 209, 22, 0.7)'].map((bg, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-sm"
            style={{ background: bg, border: '1px solid rgba(148, 163, 184, 0.1)' }}
          />
        ))}
        <span className="text-[9px] text-text-muted">More</span>
      </div>
    </div>
  );
}

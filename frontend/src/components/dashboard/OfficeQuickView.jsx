import { motion } from 'framer-motion';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import OfficePill from '../shared/OfficePill';
import AnimatedCounter from '../shared/AnimatedCounter';
import { staggerContainer, staggerItem, cardHover } from '../../constants/motion';

const MAX_CAPACITY = 15; // Rough capacity per office for ring visualization

function getCapacityColor(count) {
  const ratio = count / MAX_CAPACITY;
  if (ratio < 0.5) return '#34D399'; // green
  if (ratio < 0.8) return '#FCD116'; // gold
  return '#CE1126'; // red
}

export default function OfficeQuickView({ officeStats, onOfficeClick }) {
  if (!officeStats || officeStats.length === 0) return null;

  const directorates = officeStats.filter(o => o.office_type === 'directorate');
  const units = officeStats.filter(o => o.office_type === 'unit');
  const executive = officeStats.filter(o => o.office_type === 'executive');

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 24 }}
    >
      <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-5">Office Overview</h3>

      {executive.length > 0 && (
        <OfficeSection label="Executive" offices={executive} onOfficeClick={onOfficeClick} />
      )}
      <OfficeSection label="Directorates" offices={directorates} onOfficeClick={onOfficeClick} />
      <OfficeSection label="Units" offices={units} onOfficeClick={onOfficeClick} />
    </motion.div>
  );
}

function OfficeSection({ label, offices, onOfficeClick }) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="text-[10px] text-text-muted uppercase tracking-widest mb-2 font-medium">{label}</div>
      <motion.div
        className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-2"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {offices.map(o => {
          const count = o.visitor_count || 0;
          const color = getCapacityColor(count);
          const fill = Math.min((count / MAX_CAPACITY) * 100, 100);

          const chartData = [{ name: o.abbreviation, value: fill, fill: color }];

          return (
            <motion.button
              key={o.abbreviation}
              variants={staggerItem}
              whileHover={cardHover.hover}
              whileTap={cardHover.tap}
              onClick={() => onOfficeClick?.(o.abbreviation)}
              className="p-3 rounded-2xl text-left group relative overflow-hidden"
              style={{
                background: 'var(--bg-card-inset)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <OfficePill abbreviation={o.abbreviation} type={o.office_type} />
                  <div className="text-lg font-bold font-mono mt-1 text-gradient-gold">
                    <AnimatedCounter value={count} duration={600} />
                  </div>
                </div>
                {/* Mini radial ring */}
                <div className="w-10 h-10 sm:w-12 sm:h-12">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      cx="50%" cy="50%"
                      innerRadius="70%" outerRadius="100%"
                      data={chartData}
                      startAngle={90}
                      endAngle={-270}
                    >
                      <RadialBar
                        background={{ fill: 'var(--bar-track)' }}
                        dataKey="value"
                        cornerRadius={10}
                        animationDuration={800}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}

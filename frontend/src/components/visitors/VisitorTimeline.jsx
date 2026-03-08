import { motion } from 'framer-motion';
import AvatarCircle from '../shared/AvatarCircle';
import OfficePill from '../shared/OfficePill';
import StatusBadge from '../shared/StatusBadge';
import AIFlagBadge from '../shared/AIFlagBadge';
import { staggerContainer, staggerItem } from '../../constants/motion';

export default function VisitorTimeline({ visits = [] }) {
  if (visits.length === 0) {
    return (
      <div className="card text-center py-12">
        <div className="text-2xl mb-2 opacity-30">📋</div>
        <p className="text-text-muted text-sm">No visitors to show</p>
      </div>
    );
  }

  // Group by hour
  const groups = {};
  visits.forEach(v => {
    const hour = new Date(v.check_in).toLocaleTimeString('en-GH', {
      timeZone: 'Africa/Accra', hour: '2-digit', minute: '2-digit',
    });
    if (!groups[hour]) groups[hour] = [];
    groups[hour].push(v);
  });

  return (
    <motion.div
      className="card p-0 overflow-hidden"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      <div className="px-5 py-3.5" style={{ background: 'var(--bg-card-inset-deep)', borderBottom: '1px solid var(--border-secondary)' }}>
        <span className="text-[10px] text-text-muted uppercase tracking-widest font-medium">Timeline View</span>
      </div>

      <div className="relative">
        {/* Vertical line */}
        <div
          className="absolute left-8 top-0 bottom-0 w-0.5"
          style={{ background: 'var(--border-secondary)' }}
        />

        {Object.entries(groups).map(([time, items]) => (
          <div key={time} className="relative">
            {/* Time marker */}
            <div className="flex items-center gap-3 px-5 py-2 sticky top-0 z-10" style={{ background: 'var(--bg-card)' }}>
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center z-10"
                style={{
                  background: 'linear-gradient(135deg, #FCD116, #F59E0B)',
                  boxShadow: '0 0 8px rgba(252, 209, 22, 0.3)',
                }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
              <span className="text-xs font-mono font-bold" style={{ color: '#FCD116' }}>{time}</span>
            </div>

            {/* Items */}
            {items.map((visit) => (
              <motion.div
                key={visit.id}
                variants={staggerItem}
                className="flex items-center gap-3 pl-14 pr-5 py-2.5 hover:bg-[var(--bg-row-hover)] transition-colors"
              >
                <AvatarCircle name={visit.visitor_name} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{visit.visitor_name}</span>
                    <AIFlagBadge flag={visit.ai_flag} />
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <OfficePill abbreviation={visit.office_abbr} type={visit.office_type} />
                    <span className="text-[11px] text-text-muted truncate">{visit.purpose}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={visit.status} />
                  {visit.badge_number && (
                    <span className="font-mono text-xs font-bold" style={{ color: '#FCD116' }}>{visit.badge_number}</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

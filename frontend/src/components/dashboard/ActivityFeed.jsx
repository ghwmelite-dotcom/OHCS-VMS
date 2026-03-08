import { AnimatePresence, motion } from 'framer-motion';
import AvatarCircle from '../shared/AvatarCircle';
import OfficePill from '../shared/OfficePill';

export default function ActivityFeed({ visits = [] }) {
  const recent = visits.slice(0, 10);

  return (
    <div className="card shimmer-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: '#34D399', boxShadow: '0 0 8px rgba(52, 211, 153, 0.5)' }}
            />
            <div
              className="absolute inset-0 w-2 h-2 rounded-full animate-ping"
              style={{ background: '#34D399', opacity: 0.4 }}
            />
          </div>
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Live Activity</h3>
        </div>
        <span className="text-[10px] text-text-muted font-mono">{recent.length} recent</span>
      </div>

      <div className="space-y-1 max-h-80 overflow-y-auto custom-scrollbar pr-1">
        <AnimatePresence initial={false}>
          {recent.map((visit) => (
            <motion.div
              key={visit.id}
              layout
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="flex items-center gap-3 p-2.5 rounded-xl"
              style={{
                background: 'var(--bg-card-inset)',
                border: '1px solid transparent',
              }}
            >
              <AvatarCircle name={visit.visitor_name} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">{visit.visitor_name}</span>
                  <span
                    className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md"
                    style={{
                      background: visit.status === 'checked-in' ? 'rgba(0, 107, 63, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                      color: visit.status === 'checked-in' ? '#34D399' : '#94A3B8',
                      border: `1px solid ${visit.status === 'checked-in' ? 'rgba(0, 107, 63, 0.2)' : 'rgba(100, 116, 139, 0.1)'}`,
                    }}
                  >
                    {visit.status === 'checked-in' ? 'IN' : 'OUT'}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <OfficePill abbreviation={visit.office_abbr} type={visit.office_type} />
                  <span className="text-[10px] text-text-muted font-mono">
                    {new Date(visit.check_in).toLocaleTimeString('en-GH', {
                      timeZone: 'Africa/Accra',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {recent.length === 0 && (
          <div className="text-center py-8">
            <div className="text-2xl mb-2 opacity-30">📋</div>
            <p className="text-text-muted text-sm">No activity today yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

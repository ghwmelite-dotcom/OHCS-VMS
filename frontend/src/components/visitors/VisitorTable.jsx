import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AvatarCircle from '../shared/AvatarCircle';
import OfficePill from '../shared/OfficePill';
import StatusBadge from '../shared/StatusBadge';
import AIFlagBadge from '../shared/AIFlagBadge';
import { tableStagger, tableRow, spring } from '../../constants/motion';

export default function VisitorTable({ visits, onCheckOut, onViewProfile, selectedIds = [], onToggleSelect }) {
  if (!visits || visits.length === 0) {
    return (
      <div className="card">
        <div className="text-center py-12">
          <div
            className="w-16 h-16 rounded-3xl mx-auto mb-4 flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(148, 163, 184, 0.06), rgba(148, 163, 184, 0.02))',
              border: '1px solid var(--border-secondary)',
            }}
          >
            <span className="text-2xl" style={{ opacity: 0.4 }}>👥</span>
          </div>
          <p className="text-text-muted text-sm">No visitors found.</p>
          <p className="text-text-muted text-xs mt-1">Try adjusting your filters or register a new visitor.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden p-0">
      {/* Table header */}
      <div
        className="hidden lg:grid grid-cols-[auto_1fr_0.7fr_0.6fr_0.7fr_0.7fr_0.5fr_0.4fr_0.5fr_0.4fr] gap-0 px-5 py-3.5 items-center"
        style={{
          background: 'var(--bg-card-inset-deep)',
          borderBottom: '1px solid var(--border-secondary)',
        }}
      >
        <div className="w-8" />
        {['Visitor', 'ID', 'Office', 'Purpose', 'Host', 'Check-in', 'Badge', 'Status', ''].map(h => (
          <span key={h || 'action'} className="text-[10px] text-text-muted uppercase tracking-widest font-medium">
            {h}
          </span>
        ))}
      </div>

      {/* Desktop rows */}
      <motion.div
        className="hidden lg:block divide-y"
        style={{ borderColor: 'var(--border-subtle)' }}
        variants={tableStagger}
        initial="initial"
        animate="animate"
      >
        {visits.map((visit) => (
          <VisitorRow
            key={visit.id}
            visit={visit}
            onCheckOut={onCheckOut}
            onViewProfile={onViewProfile}
            selected={selectedIds.includes(visit.id)}
            onToggleSelect={onToggleSelect}
          />
        ))}
      </motion.div>

      {/* Mobile/Tablet card view */}
      <motion.div
        className="lg:hidden divide-y"
        style={{ borderColor: 'var(--border-subtle)' }}
        variants={tableStagger}
        initial="initial"
        animate="animate"
      >
        {visits.map((visit) => (
          <VisitorCard
            key={visit.id}
            visit={visit}
            onCheckOut={onCheckOut}
            onViewProfile={onViewProfile}
          />
        ))}
      </motion.div>
    </div>
  );
}

function VisitorRow({ visit, onCheckOut, onViewProfile, selected, onToggleSelect }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div variants={tableRow}>
      <div
        className="grid grid-cols-[auto_1fr_0.7fr_0.6fr_0.7fr_0.7fr_0.5fr_0.4fr_0.5fr_0.4fr] gap-0 items-center px-5 py-3.5 cursor-pointer transition-colors"
        style={{
          background: selected ? 'rgba(252, 209, 22, 0.03)' : 'transparent',
        }}
        onClick={() => setExpanded(!expanded)}
        onMouseEnter={(e) => { if (!selected) e.currentTarget.style.background = 'var(--bg-row-hover)'; }}
        onMouseLeave={(e) => { if (!selected) e.currentTarget.style.background = 'transparent'; }}
      >
        {/* Checkbox */}
        <div className="w-8">
          <motion.button
            onClick={(e) => { e.stopPropagation(); onToggleSelect?.(visit.id); }}
            className="w-4 h-4 rounded border flex items-center justify-center"
            style={{
              borderColor: selected ? '#FCD116' : 'var(--border-secondary)',
              background: selected ? 'rgba(252, 209, 22, 0.15)' : 'transparent',
            }}
            whileTap={{ scale: 0.85 }}
          >
            {selected && (
              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="#FCD116" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            )}
          </motion.button>
        </div>

        {/* Visitor */}
        <div className="flex items-center gap-2.5 min-w-0">
          <AvatarCircle name={visit.visitor_name} size="sm" />
          <div className="min-w-0">
            <div className="text-sm font-medium flex items-center gap-1 truncate">
              {visit.visitor_name}
              <AIFlagBadge flag={visit.ai_flag} />
            </div>
            {visit.organization && (
              <div className="text-[11px] text-text-muted truncate">{visit.organization}</div>
            )}
          </div>
        </div>

        <span className="font-mono text-[11px] text-text-muted">{visit.visitor_id}</span>

        <div><OfficePill abbreviation={visit.office_abbr} type={visit.office_type} /></div>

        <span className="text-sm text-text-secondary truncate">{visit.purpose}</span>
        <span className="text-sm truncate">{visit.host_officer}</span>

        <span className="font-mono text-[11px] text-text-muted">
          {new Date(visit.check_in).toLocaleTimeString('en-GH', {
            timeZone: 'Africa/Accra', hour: '2-digit', minute: '2-digit',
          })}
        </span>

        <span className="font-mono text-sm font-bold" style={{ color: visit.badge_number ? '#FCD116' : 'var(--text-muted)', textShadow: visit.badge_number ? 'var(--glow-gold-text)' : 'none' }}>
          {visit.badge_number || '\u2014'}
        </span>

        <StatusBadge status={visit.status} />

        <div>
          {visit.status === 'checked-in' && (
            <motion.button
              onClick={(e) => { e.stopPropagation(); onCheckOut?.(visit); }}
              className="text-[11px] font-medium px-2.5 py-1.5 rounded-xl"
              style={{
                color: '#CE1126',
                background: 'rgba(206, 17, 38, 0.08)',
                border: '1px solid rgba(206, 17, 38, 0.12)',
              }}
              whileHover={{ scale: 1.05, background: 'rgba(206, 17, 38, 0.15)' }}
              whileTap={{ scale: 0.95 }}
            >
              Check Out
            </motion.button>
          )}
        </div>
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            className="px-5 pb-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={spring.gentle}
          >
            <div className="flex items-center gap-3 p-3 rounded-xl ml-8" style={{ background: 'var(--bg-card-inset)', border: '1px solid var(--border-subtle)' }}>
              <div className="flex-1 grid grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-text-muted block text-[10px] uppercase">Notes</span>
                  <span className="text-text-secondary">{visit.notes || 'None'}</span>
                </div>
                <div>
                  <span className="text-text-muted block text-[10px] uppercase">AI Routed</span>
                  <span className="text-text-secondary">{visit.ai_routed ? 'Yes' : 'No'}</span>
                </div>
                <div>
                  <span className="text-text-muted block text-[10px] uppercase">Location</span>
                  <span className="text-text-secondary">{visit.floor}, Room {visit.room}</span>
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onViewProfile?.(visit.visitor_id); }}
                className="text-[11px] font-medium px-3 py-1.5 rounded-xl"
                style={{ color: '#60A5FA', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.12)' }}
              >
                View Profile
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function VisitorCard({ visit, onCheckOut, onViewProfile }) {
  const [swipeX, setSwipeX] = useState(0);
  const swipeThreshold = 80;

  return (
    <motion.div
      variants={tableRow}
      className="relative overflow-hidden"
    >
      {/* Swipe action backgrounds */}
      <div className="absolute inset-y-0 left-0 w-24 flex items-center justify-center"
        style={{ background: 'rgba(59, 130, 246, 0.12)' }}>
        <span className="text-[10px] text-blue-400 font-medium">Profile</span>
      </div>
      <div className="absolute inset-y-0 right-0 w-24 flex items-center justify-center"
        style={{ background: 'rgba(206, 17, 38, 0.12)' }}>
        <span className="text-[10px] font-medium" style={{ color: '#CE1126' }}>Check Out</span>
      </div>

      <motion.div
        className="p-4 relative"
        style={{ background: 'var(--bg-card)', x: swipeX }}
        drag="x"
        dragConstraints={{ left: -100, right: 100 }}
        dragElastic={0.1}
        onDragEnd={(_, info) => {
          if (info.offset.x > swipeThreshold) {
            onViewProfile?.(visit.visitor_id);
          } else if (info.offset.x < -swipeThreshold && visit.status === 'checked-in') {
            onCheckOut?.(visit);
          }
          setSwipeX(0);
        }}
      >
        <div className="flex items-start gap-3">
          <AvatarCircle name={visit.visitor_name} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium truncate">{visit.visitor_name}</span>
                <AIFlagBadge flag={visit.ai_flag} />
              </div>
              <StatusBadge status={visit.status} />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <OfficePill abbreviation={visit.office_abbr} type={visit.office_type} />
              <span className="text-[11px] text-text-muted">{visit.purpose}</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-text-muted font-mono">{visit.visitor_id}</span>
                <span className="font-mono text-[10px] text-text-muted">
                  {new Date(visit.check_in).toLocaleTimeString('en-GH', { timeZone: 'Africa/Accra', hour: '2-digit', minute: '2-digit' })}
                </span>
                {visit.badge_number && (
                  <span className="font-mono text-xs font-bold" style={{ color: '#FCD116' }}>{visit.badge_number}</span>
                )}
              </div>
              {visit.status === 'checked-in' && (
                <button
                  onClick={() => onCheckOut?.(visit)}
                  className="text-[11px] font-medium px-2.5 py-1.5 rounded-xl"
                  style={{ color: '#CE1126', background: 'rgba(206, 17, 38, 0.08)', border: '1px solid rgba(206, 17, 38, 0.12)' }}
                >
                  Check Out
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

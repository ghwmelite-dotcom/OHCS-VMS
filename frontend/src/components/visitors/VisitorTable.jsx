import { useState } from 'react';
import AvatarCircle from '../shared/AvatarCircle';
import OfficePill from '../shared/OfficePill';
import StatusBadge from '../shared/StatusBadge';
import AIFlagBadge from '../shared/AIFlagBadge';

export default function VisitorTable({ visits, onCheckOut }) {
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
            <span className="text-2xl" style={{ opacity: 0.4 }}>{'\u{1F465}'}</span>
          </div>
          <p className="text-text-muted text-sm">No visitors found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden p-0">
      {/* Glass table header */}
      <div
        className="grid grid-cols-[1fr_0.7fr_0.6fr_0.7fr_0.7fr_0.5fr_0.4fr_0.5fr_0.4fr] gap-0 px-5 py-3.5"
        style={{
          background: 'var(--bg-card-inset-deep)',
          borderBottom: '1px solid var(--border-secondary)',
        }}
      >
        {['Visitor', 'ID', 'Office', 'Purpose', 'Host', 'Check-in', 'Badge', 'Status', ''].map(h => (
          <span key={h || 'action'} className="text-[10px] text-text-muted uppercase tracking-widest font-medium">
            {h}
          </span>
        ))}
      </div>

      {/* Rows */}
      <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
        {visits.map((visit, i) => (
          <VisitorRow key={visit.id} visit={visit} index={i} onCheckOut={onCheckOut} />
        ))}
      </div>
    </div>
  );
}

function VisitorRow({ visit, index, onCheckOut }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="grid grid-cols-[1fr_0.7fr_0.6fr_0.7fr_0.7fr_0.5fr_0.4fr_0.5fr_0.4fr] gap-0 items-center px-5 py-3.5"
      style={{
        background: hovered ? 'var(--bg-row-hover)' : 'transparent',
        transition: 'all 0.2s ease',
        opacity: 1,
        animation: `fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${index * 40}ms both`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
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

      {/* ID */}
      <span className="font-mono text-[11px] text-text-muted">{visit.visitor_id}</span>

      {/* Office */}
      <div>
        <OfficePill abbreviation={visit.office_abbr} type={visit.office_type} />
      </div>

      {/* Purpose */}
      <span className="text-sm text-text-secondary truncate">{visit.purpose}</span>

      {/* Host */}
      <span className="text-sm truncate">{visit.host_officer}</span>

      {/* Check-in time */}
      <span className="font-mono text-[11px] text-text-muted">
        {new Date(visit.check_in).toLocaleTimeString('en-GH', {
          timeZone: 'Africa/Accra',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </span>

      {/* Badge */}
      <span
        className="font-mono text-sm font-bold"
        style={{
          color: visit.badge_number ? '#FCD116' : 'var(--text-muted)',
          textShadow: visit.badge_number ? 'var(--glow-gold-text)' : 'none',
        }}
      >
        {visit.badge_number || '\u2014'}
      </span>

      {/* Status */}
      <StatusBadge status={visit.status} />

      {/* Action */}
      <div>
        {visit.status === 'checked-in' && (
          <button
            onClick={() => onCheckOut(visit.id)}
            className="text-[11px] font-medium px-2.5 py-1.5 rounded-xl"
            style={{
              color: '#CE1126',
              background: 'rgba(206, 17, 38, 0.08)',
              border: '1px solid rgba(206, 17, 38, 0.12)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(206, 17, 38, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(206, 17, 38, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(206, 17, 38, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(206, 17, 38, 0.12)';
            }}
          >
            Check Out
          </button>
        )}
      </div>
    </div>
  );
}

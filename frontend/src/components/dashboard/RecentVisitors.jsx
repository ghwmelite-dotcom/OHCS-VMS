import AvatarCircle from '../shared/AvatarCircle';
import OfficePill from '../shared/OfficePill';
import StatusBadge from '../shared/StatusBadge';
import AIFlagBadge from '../shared/AIFlagBadge';

export default function RecentVisitors({ visits }) {
  return (
    <div className="card shimmer-border">
      <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Recent Visitors</h3>

      {(!visits || visits.length === 0) ? (
        <div className="text-center py-8">
          <div className="text-3xl mb-2 opacity-30">{"\u{1F465}"}</div>
          <p className="text-text-muted text-sm">No visitors today yet</p>
        </div>
      ) : (
        <div className="space-y-2 stagger-children">
          {visits.slice(0, 8).map((visit) => (
            <div
              key={visit.id}
              className="flex items-center gap-3 p-3 rounded-2xl group cursor-default"
              style={{
                background: 'var(--bg-card-inset)',
                border: '1px solid transparent',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-card-inset-hover)';
                e.currentTarget.style.borderColor = 'var(--border-secondary)';
                e.currentTarget.style.transform = 'translateX(4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--bg-card-inset)';
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              <AvatarCircle name={visit.visitor_name} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm truncate">{visit.visitor_name}</span>
                  <AIFlagBadge flag={visit.ai_flag} />
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <OfficePill abbreviation={visit.office_abbr} type={visit.office_type} />
                  <span className="text-xs text-text-muted truncate">{visit.purpose}</span>
                </div>
              </div>
              <div className="text-right shrink-0 flex flex-col items-end gap-1">
                <StatusBadge status={visit.status} />
                <span className="font-mono text-xs text-ghana-gold/70">{visit.badge_number || ''}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

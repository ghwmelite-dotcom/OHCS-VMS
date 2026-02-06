import OfficePill from '../shared/OfficePill';
import AnimatedCounter from '../shared/AnimatedCounter';

export default function OfficeQuickView({ officeStats, onOfficeClick }) {
  if (!officeStats || officeStats.length === 0) return null;

  const directorates = officeStats.filter(o => o.office_type === 'directorate');
  const units = officeStats.filter(o => o.office_type === 'unit');
  const executive = officeStats.filter(o => o.office_type === 'executive');

  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-5">Office Overview</h3>

      {executive.length > 0 && (
        <OfficeSection label="Executive" offices={executive} onOfficeClick={onOfficeClick} />
      )}
      <OfficeSection label="Directorates" offices={directorates} onOfficeClick={onOfficeClick} />
      <OfficeSection label="Units" offices={units} onOfficeClick={onOfficeClick} />
    </div>
  );
}

function OfficeSection({ label, offices, onOfficeClick }) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="text-[10px] text-text-muted uppercase tracking-widest mb-2 font-medium">{label}</div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 stagger-children">
        {offices.map(o => (
          <button
            key={o.abbreviation}
            onClick={() => onOfficeClick?.(o.abbreviation)}
            className="p-3 rounded-2xl text-left group relative overflow-hidden"
            style={{
              background: 'var(--bg-card-inset)',
              border: '1px solid var(--border-subtle)',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-card-inset-hover)';
              e.currentTarget.style.borderColor = 'var(--border-separator)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--bg-card-inset)';
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div className="flex items-center justify-between">
              <OfficePill abbreviation={o.abbreviation} type={o.office_type} />
              <span className="text-lg font-bold font-mono text-gradient-gold">
                <AnimatedCounter value={o.visitor_count || 0} duration={600} />
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

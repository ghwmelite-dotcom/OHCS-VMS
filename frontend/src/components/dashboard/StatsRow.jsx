import AnimatedCounter from '../shared/AnimatedCounter';

const statCards = [
  {
    key: 'total', label: "Today's Visitors", icon: UsersIcon,
    gradient: 'linear-gradient(135deg, rgba(252, 209, 22, 0.08), rgba(245, 158, 11, 0.04))',
    borderColor: 'rgba(252, 209, 22, 0.12)',
    glowColor: 'rgba(252, 209, 22, 0.06)',
    numColor: '#FCD116',
    iconColor: '#FCD116',
  },
  {
    key: 'checkedIn', label: 'Checked In', icon: CheckInIcon,
    gradient: 'linear-gradient(135deg, rgba(0, 107, 63, 0.08), rgba(52, 211, 153, 0.04))',
    borderColor: 'rgba(0, 107, 63, 0.15)',
    glowColor: 'rgba(0, 107, 63, 0.06)',
    numColor: '#34D399',
    iconColor: '#34D399',
  },
  {
    key: 'preRegistered', label: 'Pre-Registered', icon: ClockIcon,
    gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(99, 102, 241, 0.04))',
    borderColor: 'rgba(59, 130, 246, 0.12)',
    glowColor: 'rgba(59, 130, 246, 0.06)',
    numColor: '#60A5FA',
    iconColor: '#60A5FA',
  },
  {
    key: 'checkedOut', label: 'Checked Out', icon: CheckOutIcon,
    gradient: 'linear-gradient(135deg, rgba(100, 116, 139, 0.06), rgba(148, 163, 184, 0.03))',
    borderColor: 'rgba(100, 116, 139, 0.1)',
    glowColor: 'transparent',
    numColor: '#94A3B8',
    iconColor: '#64748B',
  },
];

export default function StatsRow({ stats }) {
  return (
    <div className="grid grid-cols-4 gap-4 mb-6 stagger-children">
      {statCards.map(({ key, label, icon: Icon, gradient, borderColor, glowColor, numColor, iconColor }) => (
        <div
          key={key}
          className="relative overflow-hidden rounded-card p-5 group cursor-default"
          style={{
            background: gradient,
            border: `1px solid ${borderColor}`,
            backdropFilter: 'blur(20px)',
            boxShadow: `0 0 40px ${glowColor}, var(--shadow-card)`,
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Shimmer top border */}
          <div
            className="absolute top-0 left-0 right-0 h-[1px]"
            style={{
              background: `linear-gradient(90deg, transparent, ${borderColor}, transparent)`,
              opacity: 'var(--top-line-opacity)',
            }}
          />

          <div className="flex items-center justify-between mb-3">
            <span className="text-text-secondary text-xs font-medium tracking-wide uppercase">{label}</span>
            <Icon style={{ color: iconColor }} />
          </div>
          <div className="text-3xl font-bold font-mono" style={{ color: numColor, textShadow: 'var(--glow-gold-text)' }}>
            {stats?.[key] != null ? (
              <AnimatedCounter value={stats[key]} />
            ) : (
              <span className="text-text-muted">{'\u2014'}</span>
            )}
          </div>

          {/* Ambient glow on hover */}
          <div
            className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: `radial-gradient(circle, ${glowColor}, transparent)` }}
          />
        </div>
      ))}
    </div>
  );
}

function UsersIcon({ style }) {
  return (
    <svg className="w-5 h-5" style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}

function CheckInIcon({ style }) {
  return (
    <svg className="w-5 h-5" style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
  );
}

function ClockIcon({ style }) {
  return (
    <svg className="w-5 h-5" style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function CheckOutIcon({ style }) {
  return (
    <svg className="w-5 h-5" style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
    </svg>
  );
}

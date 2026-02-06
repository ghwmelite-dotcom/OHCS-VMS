const STATUS_CONFIG = {
  'checked-in': {
    label: 'Checked In',
    bg: 'rgba(0, 107, 63, 0.12)',
    color: '#34D399',
    border: 'rgba(0, 107, 63, 0.25)',
    glow: 'rgba(0, 107, 63, 0.15)',
    pulse: true,
  },
  'checked-out': {
    label: 'Checked Out',
    bg: 'rgba(100, 116, 139, 0.1)',
    color: '#94A3B8',
    border: 'rgba(100, 116, 139, 0.2)',
    glow: 'none',
    pulse: false,
  },
  'pre-registered': {
    label: 'Pre-Registered',
    bg: 'rgba(252, 209, 22, 0.1)',
    color: '#FCD116',
    border: 'rgba(252, 209, 22, 0.25)',
    glow: 'rgba(252, 209, 22, 0.1)',
    pulse: false,
  },
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG['checked-in'];

  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide"
      style={{
        background: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        boxShadow: config.glow !== 'none' ? `var(--status-glow, 0 0 12px ${config.glow})` : 'none',
      }}
    >
      {config.pulse && (
        <span
          className="w-1.5 h-1.5 rounded-full mr-1.5 animate-pulse-glow"
          style={{ backgroundColor: config.color }}
        />
      )}
      {config.label}
    </span>
  );
}

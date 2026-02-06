export default function LiveIndicator({ connected }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase"
      style={{
        background: connected ? 'rgba(0, 107, 63, 0.12)' : 'rgba(100, 116, 139, 0.1)',
        color: connected ? '#34D399' : '#64748B',
        border: `1px solid ${connected ? 'rgba(0, 107, 63, 0.25)' : 'rgba(100, 116, 139, 0.15)'}`,
        boxShadow: connected ? '0 0 16px rgba(0, 107, 63, 0.15)' : 'none',
      }}
    >
      <span
        className="relative flex h-1.5 w-1.5"
      >
        {connected && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
            style={{ backgroundColor: '#34D399' }}
          />
        )}
        <span
          className="relative inline-flex rounded-full h-1.5 w-1.5"
          style={{ backgroundColor: connected ? '#34D399' : '#64748B' }}
        />
      </span>
      LIVE
    </span>
  );
}

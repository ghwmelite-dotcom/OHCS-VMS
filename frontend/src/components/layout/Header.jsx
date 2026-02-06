import { useState, useEffect } from 'react';

export default function Header({ title, actions }) {
  const [time, setTime] = useState(getAccraTime());

  useEffect(() => {
    const interval = setInterval(() => setTime(getAccraTime()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-gradient-hero">{title}</h1>
        <span
          className="px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-widest uppercase"
          style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))',
            color: '#818CF8',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            boxShadow: '0 0 16px rgba(99, 102, 241, 0.08)',
          }}
        >
          AI-Powered
        </span>
      </div>
      <div className="flex items-center gap-3">
        {actions}
        <div
          className="px-4 py-2 rounded-xl flex items-center gap-2"
          style={{
            background: 'var(--bg-card-inset)',
            border: '1px solid var(--border-secondary)',
            backdropFilter: 'blur(12px)',
            transition: 'background 0.3s ease, border-color 0.3s ease',
          }}
        >
          <span className="font-mono text-sm text-text-secondary tabular-nums">{time}</span>
          <span className="text-[10px] text-text-muted tracking-wide uppercase">Accra</span>
        </div>
      </div>
    </header>
  );
}

function getAccraTime() {
  return new Date().toLocaleTimeString('en-GH', {
    timeZone: 'Africa/Accra',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

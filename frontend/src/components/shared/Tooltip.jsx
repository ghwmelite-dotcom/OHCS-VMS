import { useState, useRef } from 'react';

/**
 * Lightweight tooltip. Appears on hover after a short delay.
 *
 * Usage:
 *   <Tooltip text="Dashboard">
 *     <DashboardIcon />
 *   </Tooltip>
 */
export default function Tooltip({ text, children, position = 'right', delay = 200 }) {
  const [visible, setVisible] = useState(false);
  const timeout = useRef(null);

  const show = () => {
    timeout.current = setTimeout(() => setVisible(true), delay);
  };
  const hide = () => {
    clearTimeout(timeout.current);
    setVisible(false);
  };

  const posStyles = {
    right: { left: 'calc(100% + 10px)', top: '50%', transform: 'translateY(-50%)' },
    left: { right: 'calc(100% + 10px)', top: '50%', transform: 'translateY(-50%)' },
    top: { bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)' },
    bottom: { top: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)' },
  };

  return (
    <div className="relative inline-flex" onMouseEnter={show} onMouseLeave={hide}>
      {children}
      {visible && text && (
        <div
          className="absolute z-50 whitespace-nowrap px-2.5 py-1.5 rounded-lg text-[11px] font-medium pointer-events-none"
          style={{
            background: 'var(--bg-modal)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-separator)',
            boxShadow: 'var(--shadow-card)',
            backdropFilter: 'blur(20px)',
            ...posStyles[position],
          }}
        >
          {text}
        </div>
      )}
    </div>
  );
}

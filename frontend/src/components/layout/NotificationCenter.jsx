import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { spring } from '../../constants/motion';

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const ref = useRef(null);

  // Simulate notifications from events
  useEffect(() => {
    const handler = (e) => {
      const notif = e.detail;
      if (notif) {
        setNotifications(prev => [
          { id: Date.now(), ...notif, time: new Date() },
          ...prev.slice(0, 19), // keep max 20
        ]);
      }
    };
    window.addEventListener('vms:notification', handler);
    return () => window.removeEventListener('vms:notification', handler);
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const unread = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setOpen(prev => !prev); if (!open) markAllRead(); }}
        className="relative w-10 h-10 rounded-xl flex items-center justify-center text-text-muted hover:text-text-secondary transition-all duration-200 group"
        title="Notifications"
      >
        <svg className="w-[18px] h-[18px] relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        <div
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: 'rgba(252, 209, 22, 0.08)' }}
        />
        {unread > 0 && (
          <motion.span
            className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full flex items-center justify-center text-[9px] font-bold px-1"
            style={{
              background: '#CE1126',
              color: 'white',
              boxShadow: '0 0 8px rgba(206, 17, 38, 0.4)',
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={spring.bouncy}
          >
            {unread}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="notification-dropdown"
            initial={{ opacity: 0, x: -8, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -8, scale: 0.96 }}
            transition={spring.snappy}
          >
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border-secondary)' }}>
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Notifications</span>
              {notifications.length > 0 && (
                <button
                  onClick={() => setNotifications([])}
                  className="text-[10px] text-text-muted hover:text-text-secondary transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="max-h-64 overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-text-muted">No notifications</p>
                </div>
              ) : (
                notifications.slice(0, 10).map((n) => (
                  <div
                    key={n.id}
                    className="px-4 py-3 hover:bg-[var(--bg-card-inset-hover)] transition-colors cursor-default"
                    style={{ borderBottom: '1px solid var(--border-subtle)' }}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-sm shrink-0">{n.icon || '🔔'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-text-primary leading-relaxed">{n.message}</p>
                        <p className="text-[10px] text-text-muted mt-0.5">
                          {n.time?.toLocaleTimeString('en-GH', { timeZone: 'Africa/Accra', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { spring } from '../../constants/motion';

export default function FAB() {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const actions = [
    {
      icon: '📱',
      label: 'Scan QR',
      onClick: () => { window.dispatchEvent(new CustomEvent('vms:scan-qr')); setExpanded(false); },
    },
    {
      icon: '✨',
      label: 'AI Chat',
      onClick: () => { window.dispatchEvent(new CustomEvent('vms:toggle-chat')); setExpanded(false); },
    },
  ];

  const handleMainClick = () => {
    if (expanded) {
      // Trigger new visitor
      window.dispatchEvent(new CustomEvent('vms:new-visitor'));
      setExpanded(false);
    } else {
      setExpanded(true);
    }
  };

  return (
    <div className="fixed bottom-20 right-4 z-40 lg:hidden flex flex-col items-center gap-2">
      <AnimatePresence>
        {expanded && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-[-1]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setExpanded(false)}
            />
            {actions.map((action, i) => (
              <motion.button
                key={action.label}
                onClick={action.onClick}
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg"
                style={{
                  background: 'var(--bg-modal)',
                  border: '1px solid var(--border-separator)',
                  boxShadow: 'var(--shadow-card)',
                  backdropFilter: 'blur(20px)',
                }}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                transition={{ ...spring.snappy, delay: (actions.length - 1 - i) * 0.05 }}
                whileTap={{ scale: 0.9 }}
                title={action.label}
              >
                {action.icon}
              </motion.button>
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        onClick={handleMainClick}
        className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
        style={{
          background: 'linear-gradient(135deg, #006B3F 0%, #00915A 100%)',
          boxShadow: '0 0 24px rgba(0, 107, 63, 0.3), 0 8px 24px rgba(0, 0, 0, 0.3)',
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{ rotate: expanded ? 45 : 0 }}
        transition={spring.snappy}
      >
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </motion.button>
    </div>
  );
}

import { AnimatePresence, motion } from 'framer-motion';
import { backdrop, modalContent } from '../../constants/motion';

const shortcuts = [
  { keys: ['Ctrl', 'K'], label: 'Command Palette' },
  { keys: ['N'], label: 'New Visitor' },
  { keys: ['S'], label: 'Search / Focus Search' },
  { keys: ['1'], label: 'Go to Dashboard' },
  { keys: ['2'], label: 'Go to Visitors' },
  { keys: ['3'], label: 'Go to Analytics' },
  { keys: ['4'], label: 'Go to Settings' },
  { keys: ['?'], label: 'Show Shortcuts' },
  { keys: ['Esc'], label: 'Close Panel / Modal' },
];

export default function ShortcutsOverlay({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[100]"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
            variants={backdrop}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none"
          >
            <motion.div
              className="pointer-events-auto w-full max-w-md rounded-2xl overflow-hidden"
              style={{
                background: 'var(--bg-modal)',
                border: '1px solid var(--border-separator)',
                boxShadow: 'var(--shadow-modal)',
                backdropFilter: 'blur(40px)',
              }}
              variants={modalContent}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid var(--border-secondary)' }}>
                <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Keyboard Shortcuts</h2>
                <button onClick={onClose} className="text-text-muted hover:text-text-secondary transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-5 space-y-2.5">
                {shortcuts.map(({ keys, label }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between p-2.5 rounded-xl"
                    style={{ background: 'var(--bg-card-inset)' }}
                  >
                    <span className="text-sm text-text-secondary">{label}</span>
                    <div className="flex items-center gap-1">
                      {keys.map((key) => (
                        <kbd
                          key={key}
                          className="px-2 py-1 rounded-lg text-[11px] font-mono font-bold min-w-[28px] text-center"
                          style={{
                            background: 'var(--bg-card-inset-deep)',
                            border: '1px solid var(--border-secondary)',
                            color: 'var(--text-primary)',
                            boxShadow: '0 2px 0 var(--border-secondary)',
                          }}
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

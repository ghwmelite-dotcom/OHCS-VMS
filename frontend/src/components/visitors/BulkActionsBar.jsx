import { AnimatePresence, motion } from 'framer-motion';
import { spring } from '../../constants/motion';

export default function BulkActionsBar({ selectedCount, onBulkCheckout, onClearSelection }) {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          className="fixed bottom-4 left-1/2 z-40 flex items-center gap-4 px-5 py-3 rounded-2xl"
          style={{
            background: 'var(--bg-modal)',
            border: '1px solid var(--border-separator)',
            boxShadow: 'var(--shadow-modal)',
            backdropFilter: 'blur(40px)',
          }}
          initial={{ opacity: 0, y: 40, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 40, x: '-50%' }}
          transition={spring.snappy}
        >
          <span className="text-sm text-text-secondary">
            <span className="font-bold text-ghana-gold">{selectedCount}</span> selected
          </span>

          <div className="w-px h-6" style={{ background: 'var(--border-separator)' }} />

          <button
            onClick={onBulkCheckout}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium"
            style={{
              background: 'rgba(206, 17, 38, 0.1)',
              color: '#CE1126',
              border: '1px solid rgba(206, 17, 38, 0.15)',
            }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            Bulk Check Out
          </button>

          <button
            onClick={onClearSelection}
            className="text-xs text-text-muted hover:text-text-secondary transition-colors"
          >
            Clear
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

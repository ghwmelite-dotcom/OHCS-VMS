import { motion } from 'framer-motion';
import { spring } from '../../constants/motion';

const illustrations = {
  visitors: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="40" r="20" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" opacity="0.3" />
      <circle cx="60" cy="40" r="12" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <path d="M30 95c0-16.569 13.431-30 30-30s30 13.431 30 30" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" opacity="0.3" />
      <path d="M38 95c0-12.15 9.85-22 22-22s22 9.85 22 22" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <circle cx="45" cy="38" r="2" fill="#FCD116" opacity="0.6" />
      <circle cx="75" cy="38" r="2" fill="#006B3F" opacity="0.6" />
    </svg>
  ),
  data: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="70" width="16" height="30" rx="4" stroke="currentColor" strokeWidth="1.5" opacity="0.3" strokeDasharray="4 4" />
      <rect x="44" y="50" width="16" height="50" rx="4" stroke="currentColor" strokeWidth="1.5" opacity="0.4" strokeDasharray="4 4" />
      <rect x="68" y="35" width="16" height="65" rx="4" stroke="currentColor" strokeWidth="1.5" opacity="0.3" strokeDasharray="4 4" />
      <path d="M24 68l20-18 24 10 20-25" stroke="#FCD116" strokeWidth="2" opacity="0.5" strokeLinecap="round" />
      <circle cx="24" cy="68" r="3" fill="#006B3F" opacity="0.6" />
      <circle cx="44" cy="50" r="3" fill="#FCD116" opacity="0.6" />
      <circle cx="68" cy="60" r="3" fill="#006B3F" opacity="0.6" />
      <circle cx="88" cy="35" r="3" fill="#CE1126" opacity="0.6" />
    </svg>
  ),
  anomalies: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="35" stroke="currentColor" strokeWidth="1.5" opacity="0.2" strokeDasharray="4 4" />
      <circle cx="60" cy="60" r="20" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
      <path d="M60 40v20l12 12" stroke="#006B3F" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <circle cx="60" cy="60" r="3" fill="#FCD116" opacity="0.8" />
      <path d="M52 28l16 0" stroke="#FCD116" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
    </svg>
  ),
  error: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="35" stroke="#CE1126" strokeWidth="1.5" opacity="0.2" strokeDasharray="4 4" />
      <path d="M60 30L90 85H30L60 30z" stroke="#CE1126" strokeWidth="1.5" opacity="0.4" />
      <line x1="60" y1="50" x2="60" y2="65" stroke="#CE1126" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <circle cx="60" cy="73" r="2" fill="#CE1126" opacity="0.6" />
    </svg>
  ),
  search: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="52" cy="52" r="25" stroke="currentColor" strokeWidth="1.5" opacity="0.3" strokeDasharray="4 4" />
      <circle cx="52" cy="52" r="16" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <line x1="72" y1="72" x2="92" y2="92" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
      <circle cx="46" cy="48" r="2" fill="#FCD116" opacity="0.5" />
      <circle cx="56" cy="52" r="2" fill="#006B3F" opacity="0.5" />
    </svg>
  ),
};

export default function EmptyState({
  type = 'visitors',
  title = 'No data yet',
  description = 'Data will appear here once available.',
  action,
  actionLabel,
}) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-12 px-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring.gentle}
    >
      <motion.div
        className="text-text-muted mb-4"
        animate={{
          y: [0, -4, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {illustrations[type] || illustrations.visitors}
      </motion.div>

      <h3 className="text-sm font-semibold text-text-secondary mb-1">{title}</h3>
      <p className="text-xs text-text-muted text-center max-w-[260px] leading-relaxed">{description}</p>

      {action && (
        <motion.button
          onClick={action}
          className="mt-4 text-xs font-medium px-4 py-2 rounded-xl"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 107, 63, 0.1), rgba(252, 209, 22, 0.06))',
            border: '1px solid rgba(0, 107, 63, 0.15)',
            color: '#34D399',
          }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          {actionLabel || 'Get Started'}
        </motion.button>
      )}
    </motion.div>
  );
}

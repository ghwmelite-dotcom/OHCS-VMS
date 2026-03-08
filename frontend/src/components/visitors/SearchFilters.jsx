import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { spring } from '../../constants/motion';

const STATUS_OPTIONS = [
  { value: 'checked-in', label: 'Checked In', color: '#34D399' },
  { value: 'checked-out', label: 'Checked Out', color: '#64748B' },
  { value: 'pre-registered', label: 'Pre-Registered', color: '#60A5FA' },
];

export default function SearchFilters({ filters, onChange, offices = [] }) {
  const [expanded, setExpanded] = useState(false);

  const updateFilter = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  const removeFilter = (key) => {
    const next = { ...filters };
    delete next[key];
    onChange(next);
  };

  const activeFilters = Object.entries(filters || {}).filter(([_, v]) => v != null && v !== '');
  const hasFilters = activeFilters.length > 0;

  return (
    <div>
      {/* Filter toggle + active chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <motion.button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium"
          style={{
            background: expanded ? 'rgba(252, 209, 22, 0.08)' : 'var(--bg-card-inset)',
            border: `1px solid ${expanded ? 'rgba(252, 209, 22, 0.15)' : 'var(--border-separator)'}`,
            color: expanded ? '#FCD116' : 'var(--text-secondary)',
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
          </svg>
          Filters
          {hasFilters && (
            <span
              className="ml-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold"
              style={{ background: 'rgba(252, 209, 22, 0.15)', color: '#FCD116' }}
            >
              {activeFilters.length}
            </span>
          )}
        </motion.button>

        {/* Active filter chips */}
        <AnimatePresence>
          {activeFilters.map(([key, value]) => (
            <motion.span
              key={key}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium"
              style={{
                background: 'rgba(59, 130, 246, 0.08)',
                border: '1px solid rgba(59, 130, 246, 0.15)',
                color: '#60A5FA',
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={spring.snappy}
            >
              {key}: {value}
              <button
                onClick={() => removeFilter(key)}
                className="ml-0.5 hover:text-white transition-colors"
              >
                ×
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      {/* Expanded filter panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            className="mt-3 p-4 rounded-2xl grid grid-cols-1 lg:grid-cols-3 gap-3"
            style={{
              background: 'var(--bg-card-inset)',
              border: '1px solid var(--border-subtle)',
            }}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={spring.gentle}
          >
            {/* Date range */}
            <div>
              <label className="text-[10px] text-text-muted uppercase tracking-wider mb-1 block">Date Range</label>
              <input
                type="date"
                className="input text-xs"
                value={filters?.dateFrom || ''}
                onChange={(e) => updateFilter('dateFrom', e.target.value)}
              />
            </div>

            {/* Status */}
            <div>
              <label className="text-[10px] text-text-muted uppercase tracking-wider mb-1 block">Status</label>
              <select
                className="select text-xs"
                value={filters?.status || ''}
                onChange={(e) => updateFilter('status', e.target.value || null)}
              >
                <option value="">All statuses</option>
                {STATUS_OPTIONS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Office */}
            <div>
              <label className="text-[10px] text-text-muted uppercase tracking-wider mb-1 block">Office</label>
              <select
                className="select text-xs"
                value={filters?.office || ''}
                onChange={(e) => updateFilter('office', e.target.value || null)}
              >
                <option value="">All offices</option>
                {offices.map(o => (
                  <option key={o.abbreviation} value={o.abbreviation}>{o.abbreviation}</option>
                ))}
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

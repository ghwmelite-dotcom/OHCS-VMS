import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { spring } from '../../constants/motion';
import { aiChat } from '../../services/api';

const RECENT_KEY = 'vms-nl-recent';
const MAX_RECENT = 5;

function getRecent() {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; }
}
function saveRecent(q) {
  try {
    const arr = [q, ...getRecent().filter(r => r !== q)].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(arr));
    return arr;
  } catch { return []; }
}

export default function NLQueryBar() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState(getRecent);
  const inputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    setLoading(true);
    setResult(null);
    setRecent(saveRecent(query.trim()));
    try {
      const response = await aiChat(query, []);
      setResult(response.reply || response.message || 'No answer available.');
    } catch {
      setResult('Could not process query. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    'How many visitors today?',
    'Which office is busiest?',
    'Average visit duration this week?',
    'Any anomalies detected?',
  ];

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring.gentle}
    >
      <div className="flex items-center gap-2.5 mb-4">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
          style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.1))',
            border: '1px solid rgba(59, 130, 246, 0.2)',
          }}
        >
          🔍
        </div>
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Ask AI</h3>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-3">
        <input
          ref={inputRef}
          className="input flex-1"
          placeholder="Ask a question about your visitor data..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <motion.button
          type="submit"
          disabled={loading || !query.trim()}
          className="btn-primary px-4"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          )}
        </motion.button>
      </form>

      {/* Suggestions + Recent */}
      {!result && !loading && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map(s => (
              <button
                key={s}
                onClick={() => { setQuery(s); inputRef.current?.focus(); }}
                className="text-[10px] px-2.5 py-1 rounded-lg transition-colors"
                style={{
                  background: 'var(--bg-card-inset)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-muted)',
                }}
              >
                {s}
              </button>
            ))}
          </div>
          {recent.length > 0 && (
            <div>
              <span className="text-[9px] text-text-muted uppercase tracking-wider font-medium">Recent</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {recent.map(r => (
                  <button
                    key={r}
                    onClick={() => { setQuery(r); inputRef.current?.focus(); }}
                    className="text-[10px] px-2.5 py-1 rounded-lg transition-colors"
                    style={{
                      background: 'rgba(252, 209, 22, 0.06)',
                      border: '1px solid rgba(252, 209, 22, 0.12)',
                      color: '#FCD116',
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Result */}
      <AnimatePresence>
        {(result || loading) && (
          <motion.div
            className="mt-3 p-3.5 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.06), rgba(139, 92, 246, 0.04))',
              border: '1px solid rgba(59, 130, 246, 0.1)',
            }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
                <span className="text-xs" style={{ color: '#818CF8' }}>Analyzing your data...</span>
              </div>
            ) : (
              <p className="text-sm leading-relaxed" style={{ color: '#818CF8' }}>{result}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

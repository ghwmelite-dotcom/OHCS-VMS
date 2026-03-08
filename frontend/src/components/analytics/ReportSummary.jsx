import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { spring } from '../../constants/motion';
import { aiChat } from '../../services/api';

export default function ReportSummary() {
  const [summary, setSummary] = useState('');
  const [typed, setTyped] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    aiChat('Generate a brief daily summary report of today\'s visitor activity.', [])
      .then(d => setSummary(d.reply || d.message || 'Summary generation requires more data.'))
      .catch(() => setSummary('Summary will be available once visitor data accumulates.'))
      .finally(() => setLoading(false));
  }, []);

  // Typewriter effect
  useEffect(() => {
    if (!summary) return;
    setTyped('');
    let i = 0;
    const interval = setInterval(() => {
      if (i < summary.length) {
        setTyped(summary.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 15);
    return () => clearInterval(interval);
  }, [summary]);

  const handleDownload = () => {
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OHCS-VMS-Report-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring.gentle}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 107, 63, 0.15), rgba(252, 209, 22, 0.1))',
              border: '1px solid rgba(0, 107, 63, 0.2)',
            }}
          >
            📋
          </div>
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">AI Daily Summary</h3>
        </div>
        {!loading && summary && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1.5 rounded-lg transition-colors"
              style={{
                background: 'var(--bg-card-inset)',
                border: '1px solid var(--border-separator)',
                color: 'var(--text-muted)',
              }}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18.75 12h.008v.008h-.008V12zm-8.25 0h.008v.008H10.5V12z" />
              </svg>
              Export PDF
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1.5 rounded-lg transition-colors"
              style={{
                background: 'var(--bg-card-inset)',
                border: '1px solid var(--border-separator)',
                color: 'var(--text-muted)',
              }}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Download
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-4">
          <div className="w-4 h-4 border-2 border-ghana-green/30 border-t-ghana-green rounded-full animate-spin" />
          <span className="text-sm text-text-muted">Generating report...</span>
        </div>
      ) : (
        <div
          className="p-3.5 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 107, 63, 0.04), rgba(252, 209, 22, 0.03))',
            border: '1px solid rgba(0, 107, 63, 0.08)',
          }}
        >
          <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
            {typed}
            {typed.length < summary.length && <span className="animate-pulse-glow text-ghana-gold">|</span>}
          </p>
        </div>
      )}
    </motion.div>
  );
}

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { backdrop, modalContent, spring } from '../../constants/motion';
import toast from 'react-hot-toast';
import useUXFeedback from '../../hooks/useUXFeedback';

const emojis = [
  { value: 1, emoji: '😞', label: 'Poor' },
  { value: 2, emoji: '😕', label: 'Fair' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '😊', label: 'Good' },
  { value: 5, emoji: '🤩', label: 'Excellent' },
];

export default function CheckoutModal({ visit, open, onClose, onConfirm }) {
  const [step, setStep] = useState(1); // 1=confirm, 2=survey
  const [rating, setRating] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const { celebrate } = useUXFeedback();

  if (!open || !visit) return null;

  const duration = visit.check_in
    ? Math.round((Date.now() - new Date(visit.check_in).getTime()) / 60000)
    : null;

  const handleCheckout = async () => {
    setLoading(true);
    try {
      await onConfirm(visit.id, { rating, feedback: feedback || null });
      celebrate('checkout', `${visit.visitor_name} checked out`, 'subtle');
      handleClose();
    } catch {
      toast.error('Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setRating(null);
    setFeedback('');
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50"
            style={{ background: 'var(--bg-backdrop)', backdropFilter: 'blur(4px)' }}
            variants={backdrop}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={handleClose}
          />
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              className="pointer-events-auto w-full max-w-sm rounded-3xl overflow-hidden modal-responsive"
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
              onClick={(e) => e.stopPropagation()}
            >
              {step === 1 ? (
                <>
                  {/* Confirm step */}
                  <div className="p-6 text-center">
                    {/* Badge return animation */}
                    <motion.div
                      className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, rgba(252, 209, 22, 0.12), rgba(245, 158, 11, 0.06))',
                        border: '1px solid rgba(252, 209, 22, 0.2)',
                      }}
                      initial={{ rotate: -10, scale: 0.8 }}
                      animate={{ rotate: 0, scale: 1 }}
                      transition={spring.bouncy}
                    >
                      <span className="text-2xl font-bold font-mono" style={{ color: '#FCD116' }}>
                        {visit.badge_number || '—'}
                      </span>
                    </motion.div>

                    <h2 className="text-lg font-semibold mb-1">Check Out</h2>
                    <p className="text-sm text-text-secondary mb-1">{visit.visitor_name}</p>

                    {duration != null && (
                      <p className="text-xs text-text-muted">
                        Duration: <span className="font-mono text-ghana-gold">{duration >= 60 ? `${Math.floor(duration / 60)}h ${duration % 60}m` : `${duration}m`}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3 p-5" style={{ borderTop: '1px solid var(--border-secondary)' }}>
                    <button
                      onClick={handleClose}
                      className="flex-1 px-4 py-2.5 rounded-xl text-sm text-text-secondary"
                      style={{ background: 'var(--bg-card-inset)', border: '1px solid var(--border-separator)' }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setStep(2)}
                      className="flex-1 btn-primary"
                    >
                      Continue
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Survey step */}
                  <div className="p-6">
                    <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Quick Feedback (Optional)</h2>

                    {/* Emoji rating */}
                    <div className="flex items-center justify-between mb-4">
                      {emojis.map((e) => (
                        <motion.button
                          key={e.value}
                          onClick={() => setRating(e.value)}
                          className="flex flex-col items-center gap-1 p-2 rounded-xl transition-colors"
                          style={{
                            background: rating === e.value ? 'rgba(252, 209, 22, 0.1)' : 'transparent',
                            border: `1px solid ${rating === e.value ? 'rgba(252, 209, 22, 0.2)' : 'transparent'}`,
                          }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <span className="text-2xl" style={{ filter: rating && rating !== e.value ? 'grayscale(0.6) opacity(0.5)' : 'none' }}>
                            {e.emoji}
                          </span>
                          <span className="text-[9px] text-text-muted">{e.label}</span>
                        </motion.button>
                      ))}
                    </div>

                    {/* Feedback text */}
                    <textarea
                      className="input"
                      rows={2}
                      placeholder="Any comments? (optional)"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-3 p-5" style={{ borderTop: '1px solid var(--border-secondary)' }}>
                    <button
                      onClick={() => setStep(1)}
                      className="px-4 py-2.5 rounded-xl text-sm text-text-secondary"
                      style={{ background: 'var(--bg-card-inset)', border: '1px solid var(--border-separator)' }}
                    >
                      Back
                    </button>
                    <button
                      onClick={() => handleCheckout()}
                      disabled={loading}
                      className="flex-1 btn-primary"
                    >
                      {loading ? 'Checking out...' : 'Complete Checkout'}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

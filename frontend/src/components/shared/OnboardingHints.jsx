import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { spring } from '../../constants/motion';

const STEPS = [
  {
    target: '[data-onboard="new-visitor"]',
    title: 'Register Visitors',
    description: 'Click here to register a new visitor. You can also press N on your keyboard.',
    position: 'bottom',
  },
  {
    target: '[data-onboard="scan-qr"]',
    title: 'Scan QR Codes',
    description: 'Pre-registered visitors get a QR code via WhatsApp. Scan it here for instant check-in.',
    position: 'bottom',
  },
  {
    target: '[data-onboard="ai-chat"]',
    title: 'AI Assistant',
    description: 'Ask questions about visitor data, get routing suggestions, and generate reports.',
    position: 'left',
  },
  {
    target: '[data-onboard="command-palette"]',
    title: 'Command Palette',
    description: 'Press Ctrl+K to open the command palette. Search visitors, navigate pages, and run quick actions.',
    position: 'bottom',
  },
  {
    target: '[data-onboard="analytics"]',
    title: 'AI Analytics',
    description: 'View traffic patterns, anomaly detection, sentiment analysis, and predictive insights.',
    position: 'right',
  },
];

const STORAGE_KEY = 'vms-onboarding';

export default function OnboardingHints() {
  const [currentStep, setCurrentStep] = useState(-1);
  const [targetRect, setTargetRect] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'complete') return;
      // Start after a brief delay to let the page render
      const timer = setTimeout(() => setCurrentStep(0), 1500);
      return () => clearTimeout(timer);
    } catch {
      // localStorage not available
    }
  }, []);

  useEffect(() => {
    if (currentStep < 0 || currentStep >= STEPS.length) return;

    const step = STEPS[currentStep];
    const el = document.querySelector(step.target);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      // Skip missing targets
      setTargetRect(null);
    }
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep >= STEPS.length - 1) {
      handleDismiss();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleDismiss = () => {
    setCurrentStep(-1);
    try { localStorage.setItem(STORAGE_KEY, 'complete'); } catch {}
  };

  if (currentStep < 0 || currentStep >= STEPS.length) return null;

  const step = STEPS[currentStep];
  const padding = 8;

  // Position the tooltip
  const getTooltipStyle = () => {
    if (!targetRect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    const pos = step.position;
    if (pos === 'bottom') {
      return {
        top: targetRect.bottom + 12,
        left: targetRect.left + targetRect.width / 2,
        transform: 'translateX(-50%)',
      };
    }
    if (pos === 'top') {
      return {
        top: targetRect.top - 12,
        left: targetRect.left + targetRect.width / 2,
        transform: 'translate(-50%, -100%)',
      };
    }
    if (pos === 'left') {
      return {
        top: targetRect.top + targetRect.height / 2,
        left: targetRect.left - 12,
        transform: 'translate(-100%, -50%)',
      };
    }
    // right
    return {
      top: targetRect.top + targetRect.height / 2,
      left: targetRect.right + 12,
      transform: 'translateY(-50%)',
    };
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop with spotlight cutout */}
        <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
          <defs>
            <mask id="spotlight-mask">
              <rect width="100%" height="100%" fill="white" />
              {targetRect && (
                <rect
                  x={targetRect.left - padding}
                  y={targetRect.top - padding}
                  width={targetRect.width + padding * 2}
                  height={targetRect.height + padding * 2}
                  rx="12"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            width="100%" height="100%"
            fill="rgba(0,0,0,0.6)"
            mask="url(#spotlight-mask)"
          />
        </svg>

        {/* Spotlight ring */}
        {targetRect && (
          <motion.div
            className="absolute rounded-xl pointer-events-none"
            style={{
              top: targetRect.top - padding,
              left: targetRect.left - padding,
              width: targetRect.width + padding * 2,
              height: targetRect.height + padding * 2,
              border: '2px solid rgba(252, 209, 22, 0.5)',
              boxShadow: '0 0 20px rgba(252, 209, 22, 0.2), 0 0 40px rgba(252, 209, 22, 0.1)',
            }}
            animate={{
              boxShadow: [
                '0 0 20px rgba(252, 209, 22, 0.2), 0 0 40px rgba(252, 209, 22, 0.1)',
                '0 0 30px rgba(252, 209, 22, 0.3), 0 0 60px rgba(252, 209, 22, 0.15)',
                '0 0 20px rgba(252, 209, 22, 0.2), 0 0 40px rgba(252, 209, 22, 0.1)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}

        {/* Tooltip */}
        <motion.div
          className="absolute z-10 max-w-xs"
          style={getTooltipStyle()}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={spring.gentle}
          key={currentStep}
        >
          <div
            className="p-4 rounded-2xl"
            style={{
              background: 'var(--bg-modal)',
              border: '1px solid rgba(252, 209, 22, 0.2)',
              backdropFilter: 'blur(24px)',
              boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold"
                style={{
                  background: 'linear-gradient(135deg, #FCD116, #F59E0B)',
                  color: '#050A18',
                }}
              >
                {currentStep + 1}
              </div>
              <h4 className="text-sm font-semibold text-text-primary">{step.title}</h4>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed mb-3">
              {step.description}
            </p>

            {/* Progress dots */}
            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                {STEPS.map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full transition-colors"
                    style={{
                      background: i === currentStep ? '#FCD116' : i < currentStep ? '#006B3F' : 'var(--border-separator)',
                    }}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleDismiss}
                  className="text-[10px] px-2 py-1 rounded-lg text-text-muted hover:text-text-secondary transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={handleNext}
                  className="text-[10px] font-medium px-3 py-1 rounded-lg transition-colors"
                  style={{
                    background: 'linear-gradient(135deg, #006B3F, #00915A)',
                    color: 'white',
                  }}
                >
                  {currentStep === STEPS.length - 1 ? 'Done' : 'Next'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Click blocker — allow clicking the spotlight target */}
        <div
          className="absolute inset-0"
          onClick={handleNext}
          style={{ cursor: 'pointer' }}
        />
      </motion.div>
    </AnimatePresence>
  );
}

// Reset onboarding (for settings page)
export function resetOnboarding() {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}

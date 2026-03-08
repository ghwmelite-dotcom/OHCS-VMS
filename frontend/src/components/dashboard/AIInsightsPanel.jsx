import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ConfidenceBar from '../shared/ConfidenceBar';
import LiveIndicator from '../shared/LiveIndicator';
import AnimatedCounter from '../shared/AnimatedCounter';
import { fadeInUp, staggerContainer, staggerItem, spring } from '../../constants/motion';

export default function AIInsightsPanel({ prediction, anomalyCount }) {
  const [typedRec, setTypedRec] = useState('');
  const recommendation = prediction?.staff_recommendation || prediction?.staffRecommendation || '';

  // Typewriter effect for recommendation
  useEffect(() => {
    if (!recommendation) { setTypedRec(''); return; }
    setTypedRec('');
    let i = 0;
    const interval = setInterval(() => {
      if (i < recommendation.length) {
        setTypedRec(recommendation.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 20);
    return () => clearInterval(interval);
  }, [recommendation]);

  const predictedCount = prediction?.predicted_count || prediction?.predictedCount || 0;
  const confidence = prediction?.confidence || 0;

  const insights = [];
  if (prediction) {
    insights.push({
      title: 'Peak Hour',
      value: prediction.peak_hour != null ? `${prediction.peak_hour || prediction.peakHour}:00` : '\u2014',
      icon: '⏰',
    });
    if (prediction.busiest_office || prediction.busiestOffice) {
      insights.push({
        title: 'Busiest Office',
        value: prediction.busiest_office || prediction.busiestOffice,
        icon: '🏛️',
      });
    }
  }
  if (anomalyCount != null) {
    insights.push({ title: 'Anomalies (24h)', value: anomalyCount, icon: '🚨' });
  }

  return (
    <motion.div
      className="card shimmer-border"
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      transition={spring.gentle}
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
            style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(59, 130, 246, 0.1))',
              border: '1px solid rgba(139, 92, 246, 0.2)',
            }}
          >
            🧠
          </div>
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">AI Insights</h3>
        </div>
        <LiveIndicator connected={true} />
      </div>

      {!prediction ? (
        <div className="text-center py-6">
          <p className="text-text-muted text-sm">AI insights appear once data is collected.</p>
        </div>
      ) : (
        <motion.div variants={staggerContainer} initial="initial" animate="animate">
          {/* Predicted count with radial progress */}
          <motion.div
            variants={staggerItem}
            className="flex items-center gap-4 p-4 rounded-2xl mb-3"
            style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.06), rgba(252, 209, 22, 0.04))',
              border: '1px solid rgba(139, 92, 246, 0.12)',
            }}
          >
            {/* Radial progress ring */}
            <div className="relative w-16 h-16 shrink-0">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="none" stroke="var(--bar-track)" strokeWidth="4" />
                <motion.circle
                  cx="32" cy="32" r="28"
                  fill="none"
                  stroke="url(#aiGradient)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 28 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 28 * (1 - confidence / 100) }}
                  transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                />
                <defs>
                  <linearGradient id="aiGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#FCD116" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold font-mono" style={{ color: '#FCD116' }}>
                  <AnimatedCounter value={predictedCount} />
                </span>
              </div>
            </div>
            <div>
              <div className="text-xs text-text-muted uppercase tracking-wider mb-1">Predicted Visitors</div>
              <div className="text-sm text-text-secondary">
                {confidence}% confidence
              </div>
              <ConfidenceBar confidence={confidence} />
            </div>
          </motion.div>

          {/* Other insights */}
          {insights.map((insight, i) => (
            <motion.div
              key={i}
              variants={staggerItem}
              className="p-3.5 rounded-2xl mb-2.5"
              style={{
                background: 'var(--bg-card-inset)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted flex items-center gap-1.5">
                  <span>{insight.icon}</span> {insight.title}
                </span>
                <span
                  className="text-lg font-bold font-mono"
                  style={{ color: '#FCD116', textShadow: 'var(--glow-gold-text)' }}
                >
                  {typeof insight.value === 'number' ? <AnimatedCounter value={insight.value} /> : insight.value}
                </span>
              </div>
            </motion.div>
          ))}

          {/* Staff recommendation with typewriter */}
          {recommendation && (
            <motion.div
              variants={staggerItem}
              className="p-3.5 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.06), rgba(139, 92, 246, 0.04))',
                border: '1px solid rgba(59, 130, 246, 0.1)',
              }}
            >
              <p className="text-xs leading-relaxed" style={{ color: '#818CF8' }}>
                {typedRec}
                <span className="animate-pulse-glow">|</span>
              </p>
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

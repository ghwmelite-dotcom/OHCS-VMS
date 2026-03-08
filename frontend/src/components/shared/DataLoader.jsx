import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Skeleton from './Skeleton';

/**
 * Three-phase loading: Skeleton → Shimmer → Cross-fade to content.
 *
 * Usage:
 *   <DataLoader loading={isLoading} skeleton={<Skeleton.StatsRow />}>
 *     <StatsRow data={data} />
 *   </DataLoader>
 */
export default function DataLoader({ loading, skeleton, children, minDuration = 300 }) {
  const [phase, setPhase] = useState(loading ? 'skeleton' : 'content');
  const [showContent, setShowContent] = useState(!loading);

  useEffect(() => {
    if (loading) {
      setPhase('skeleton');
      setShowContent(false);
    } else {
      // Shimmer phase — brief transition
      setPhase('shimmer');
      const timer = setTimeout(() => {
        setPhase('content');
        setShowContent(true);
      }, minDuration);
      return () => clearTimeout(timer);
    }
  }, [loading, minDuration]);

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {phase !== 'content' ? (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className={phase === 'shimmer' ? 'animate-pulse' : ''}
          >
            {skeleton || <Skeleton.Card />}
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {showContent && children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

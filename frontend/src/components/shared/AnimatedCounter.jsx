import { useEffect, useRef } from 'react';
import { useSpring, useTransform, motion, useMotionValue } from 'framer-motion';

export default function AnimatedCounter({ value, duration = 800, className = '' }) {
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    stiffness: 100,
    damping: 20,
    mass: 0.8,
    duration: duration,
  });
  const display = useTransform(springValue, (v) => Math.round(v));
  const ref = useRef(null);

  useEffect(() => {
    motionValue.set(typeof value === 'number' ? value : 0);
  }, [value, motionValue]);

  useEffect(() => {
    const unsubscribe = display.on('change', (v) => {
      if (ref.current) {
        ref.current.textContent = v;
      }
    });
    return unsubscribe;
  }, [display]);

  return <motion.span ref={ref} className={className}>0</motion.span>;
}

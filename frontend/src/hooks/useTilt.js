import { useRef, useCallback } from 'react';

/**
 * Subtle 3D tilt effect on mouse movement.
 * Returns a ref to attach to the element and event handlers.
 * Usage: const { ref, handlers } = useTilt({ maxDeg: 3 });
 *        <div ref={ref} {...handlers} />
 */
export default function useTilt({ maxDeg = 3, scale = 1.01, speed = 300 } = {}) {
  const ref = useRef(null);

  const onMouseMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;   // 0..1
    const y = (e.clientY - rect.top) / rect.height;    // 0..1
    const rotateX = (0.5 - y) * maxDeg * 2;
    const rotateY = (x - 0.5) * maxDeg * 2;
    el.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`;
    el.style.transition = `transform ${speed}ms cubic-bezier(0.03, 0.98, 0.52, 0.99)`;
  }, [maxDeg, scale, speed]);

  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)';
    el.style.transition = `transform ${speed}ms cubic-bezier(0.03, 0.98, 0.52, 0.99)`;
  }, [speed]);

  return {
    ref,
    handlers: { onMouseMove, onMouseLeave },
  };
}

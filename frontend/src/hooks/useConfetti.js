import { useCallback } from 'react';

/**
 * Ghana-themed confetti celebrations.
 * Triggers canvas-confetti with Ghana flag colors: Gold, Green, Red.
 */
export default function useConfetti() {
  const fire = useCallback(async (type = 'celebration') => {
    try {
      const confetti = (await import('canvas-confetti')).default;

      const ghanaColors = ['#FCD116', '#006B3F', '#CE1126'];

      if (type === 'celebration') {
        // Big burst from center
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ghanaColors,
        });
      } else if (type === 'milestone') {
        // Double burst from sides
        const end = Date.now() + 500;
        const frame = () => {
          confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ghanaColors,
          });
          confetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ghanaColors,
          });
          if (Date.now() < end) requestAnimationFrame(frame);
        };
        frame();
      } else if (type === 'subtle') {
        // Small poof
        confetti({
          particleCount: 30,
          spread: 40,
          origin: { y: 0.7 },
          colors: ghanaColors,
          scalar: 0.8,
        });
      }
    } catch {
      // canvas-confetti not available — silent fail
    }
  }, []);

  return { fire };
}

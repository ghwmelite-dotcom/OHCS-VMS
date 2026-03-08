import { useCallback, useRef } from 'react';

// Lightweight sound effects using Web Audio API oscillator synthesis
// No external audio files needed

function createOscillator(ctx, freq, type, duration, volume = 0.08) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = freq;
  osc.type = type;
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

const sounds = {
  checkin: (ctx) => {
    // Two-tone ascending chime
    createOscillator(ctx, 523, 'sine', 0.15, 0.06); // C5
    setTimeout(() => createOscillator(ctx, 659, 'sine', 0.2, 0.06), 100); // E5
  },
  checkout: (ctx) => {
    // Descending whoosh
    createOscillator(ctx, 659, 'sine', 0.12, 0.05); // E5
    setTimeout(() => createOscillator(ctx, 440, 'sine', 0.18, 0.05), 80); // A4
  },
  appointment: (ctx) => {
    // Triple chime notification
    createOscillator(ctx, 587, 'sine', 0.1, 0.05); // D5
    setTimeout(() => createOscillator(ctx, 659, 'sine', 0.1, 0.05), 120); // E5
    setTimeout(() => createOscillator(ctx, 784, 'sine', 0.2, 0.05), 240); // G5
  },
  success: (ctx) => {
    // Bright ascending
    createOscillator(ctx, 440, 'sine', 0.1, 0.04);
    setTimeout(() => createOscillator(ctx, 554, 'sine', 0.1, 0.04), 80);
    setTimeout(() => createOscillator(ctx, 659, 'sine', 0.15, 0.04), 160);
  },
  error: (ctx) => {
    // Low buzz
    createOscillator(ctx, 200, 'square', 0.15, 0.03);
    setTimeout(() => createOscillator(ctx, 180, 'square', 0.2, 0.03), 120);
  },
};

export default function useSound() {
  const ctxRef = useRef(null);

  const getEnabled = () => {
    try {
      return localStorage.getItem('vms-sound') !== 'off';
    } catch {
      return true;
    }
  };

  const setEnabled = (val) => {
    try {
      localStorage.setItem('vms-sound', val ? 'on' : 'off');
    } catch {}
  };

  const play = useCallback((name) => {
    if (!getEnabled()) return;
    const fn = sounds[name];
    if (!fn) return;

    try {
      if (!ctxRef.current) {
        ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = ctxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      fn(ctx);
    } catch {
      // Audio not supported — silent fail
    }
  }, []);

  return { play, getEnabled, setEnabled };
}

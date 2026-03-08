import { useState, useCallback } from 'react';

/**
 * Drop-in replacement for useState that persists to localStorage.
 *
 * Usage:
 *   const [value, setValue] = usePersistedState('vms-setting-x', true);
 */
export default function usePersistedState(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setPersistedState = useCallback((valueOrFn) => {
    setState((prev) => {
      const next = typeof valueOrFn === 'function' ? valueOrFn(prev) : valueOrFn;
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // storage full or unavailable
      }
      return next;
    });
  }, [key]);

  return [state, setPersistedState];
}

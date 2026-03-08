import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function useKeyboardShortcuts({ onCommandPalette, onShortcutsHelp }) {
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      // Don't fire in inputs/textareas
      const tag = e.target.tagName;
      const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target.isContentEditable;

      // Ctrl/Cmd + K — Command Palette (always works)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onCommandPalette?.();
        return;
      }

      // Escape — handled by individual modals
      if (isInput) return;

      switch (e.key) {
        case 'n':
        case 'N':
          // New visitor — dispatch custom event
          window.dispatchEvent(new CustomEvent('vms:new-visitor'));
          break;
        case 's':
        case 'S':
          // Focus search
          window.dispatchEvent(new CustomEvent('vms:focus-search'));
          break;
        case '1':
          navigate('/');
          break;
        case '2':
          navigate('/visitors');
          break;
        case '3':
          navigate('/analytics');
          break;
        case '4':
          navigate('/settings');
          break;
        case '?':
          onShortcutsHelp?.();
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate, onCommandPalette, onShortcutsHelp]);
}

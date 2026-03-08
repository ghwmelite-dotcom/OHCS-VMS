import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
import { AnimatePresence, motion } from 'framer-motion';
import { backdrop, modalContent } from '../../constants/motion';

const RECENT_KEY = 'vms-cmd-recent';
const MAX_RECENT = 5;

function getRecentSearches() {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; }
}
function saveRecentSearch(item) {
  try {
    const name = item.name || item.action;
    const arr = [{ name, path: item.path, action: item.action, icon: item.icon }, ...getRecentSearches().filter(r => r.name !== name)].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(arr));
    return arr;
  } catch { return []; }
}

const pages = [
  { name: 'Dashboard', path: '/', icon: '📊', keywords: 'home overview stats' },
  { name: 'Visitors', path: '/visitors', icon: '👥', keywords: 'people check-in guests' },
  { name: 'AI Analytics', path: '/analytics', icon: '✨', keywords: 'insights predictions anomaly sentiment' },
  { name: 'Settings', path: '/settings', icon: '⚙️', keywords: 'config office theme' },
];

const actions = [
  { name: 'New Visitor', action: 'new-visitor', icon: '➕', keywords: 'register add check-in' },
  { name: 'Scan QR Code', action: 'scan-qr', icon: '📱', keywords: 'scan barcode' },
  { name: 'Toggle Theme', action: 'toggle-theme', icon: '🎨', keywords: 'dark light mode' },
];

export default function CommandPalette({ open, onClose }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [recent, setRecent] = useState(getRecentSearches);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const handleSelect = (item) => {
    setRecent(saveRecentSearch(item));
    if (item.path) {
      navigate(item.path);
    }
    if (item.action === 'toggle-theme') {
      document.documentElement.getAttribute('data-theme') === 'dark'
        ? document.documentElement.setAttribute('data-theme', 'light')
        : document.documentElement.setAttribute('data-theme', 'dark');
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[100]"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
            variants={backdrop}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] pointer-events-none"
            variants={backdrop}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <motion.div
              className="pointer-events-auto w-full max-w-lg"
              variants={modalContent}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <Command
                className="rounded-2xl overflow-hidden"
                style={{
                  background: 'var(--bg-modal)',
                  border: '1px solid var(--border-separator)',
                  boxShadow: 'var(--shadow-modal)',
                  backdropFilter: 'blur(40px)',
                }}
                label="Command Menu"
              >
                <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid var(--border-secondary)' }}>
                  <svg className="w-4 h-4 text-text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                  <Command.Input
                    ref={inputRef}
                    placeholder="Search pages, visitors, actions..."
                    className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-text-muted"
                    style={{ color: 'var(--text-primary)' }}
                  />
                  <kbd
                    className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                    style={{
                      background: 'var(--bg-card-inset)',
                      border: '1px solid var(--border-secondary)',
                      color: 'var(--text-muted)',
                    }}
                  >
                    ESC
                  </kbd>
                </div>

                <Command.List className="max-h-72 overflow-y-auto p-2 custom-scrollbar">
                  <Command.Empty className="py-8 text-center text-sm text-text-muted">
                    No results found.
                  </Command.Empty>

                  {recent.length > 0 && (
                    <>
                      <Command.Group heading={<span className="text-[10px] text-text-muted uppercase tracking-widest font-medium px-2">Recent</span>}>
                        {recent.map((item) => (
                          <Command.Item
                            key={`recent-${item.name}`}
                            value={item.name}
                            onSelect={() => handleSelect(item)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            <span>{item.icon || '\u23F0'}</span>
                            <span>{item.name}</span>
                          </Command.Item>
                        ))}
                      </Command.Group>
                      <Command.Separator className="my-2 h-px" style={{ background: 'var(--border-secondary)' }} />
                    </>
                  )}

                  <Command.Group heading={<span className="text-[10px] text-text-muted uppercase tracking-widest font-medium px-2">Pages</span>}>
                    {pages.map((item) => (
                      <Command.Item
                        key={item.path}
                        value={`${item.name} ${item.keywords}`}
                        onSelect={() => handleSelect(item)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        <span>{item.icon}</span>
                        <span>{item.name}</span>
                      </Command.Item>
                    ))}
                  </Command.Group>

                  <Command.Separator className="my-2 h-px" style={{ background: 'var(--border-secondary)' }} />

                  <Command.Group heading={<span className="text-[10px] text-text-muted uppercase tracking-widest font-medium px-2">Quick Actions</span>}>
                    {actions.map((item) => (
                      <Command.Item
                        key={item.action}
                        value={`${item.name} ${item.keywords}`}
                        onSelect={() => handleSelect(item)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        <span>{item.icon}</span>
                        <span>{item.name}</span>
                      </Command.Item>
                    ))}
                  </Command.Group>
                </Command.List>

                <div
                  className="flex items-center justify-between px-4 py-2 text-[10px] text-text-muted"
                  style={{ borderTop: '1px solid var(--border-secondary)' }}
                >
                  <span>Navigate with arrow keys</span>
                  <span>Press Enter to select</span>
                </div>
              </Command>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

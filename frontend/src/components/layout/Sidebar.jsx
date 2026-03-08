import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { spring } from '../../constants/motion';
import NotificationCenter from './NotificationCenter';
import Tooltip from '../shared/Tooltip';

const allNavItems = [
  { path: '/', icon: DashboardIcon, label: 'Dashboard', roles: null },
  { path: '/visitors', icon: VisitorsIcon, label: 'Visitors', roles: null },
  { path: '/analytics', icon: AnalyticsIcon, label: 'AI Analytics', onboard: 'analytics', roles: ['admin', 'supervisor'] },
  { path: '/settings', icon: SettingsIcon, label: 'Settings', roles: ['admin'] },
];

const ROLE_COLORS = {
  admin: { bg: 'rgba(252, 209, 22, 0.12)', text: '#FCD116', border: 'rgba(252, 209, 22, 0.2)' },
  supervisor: { bg: 'rgba(0, 107, 63, 0.12)', text: '#34D399', border: 'rgba(0, 107, 63, 0.2)' },
  receptionist: { bg: 'rgba(59, 130, 246, 0.12)', text: '#60A5FA', border: 'rgba(59, 130, 246, 0.2)' },
};

export default function Sidebar({ onChatToggle, collapsed, onToggleCollapse }) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout, hasRole } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Filter nav items by role
  const navItems = allNavItems.filter(item => {
    if (!item.roles) return true;
    return hasRole(...item.roles);
  });

  // Listen for drawer toggle events from BottomNav / other components
  useEffect(() => {
    const handleToggle = () => setDrawerOpen(p => !p);
    window.addEventListener('vms:toggle-drawer', handleToggle);
    return () => window.removeEventListener('vms:toggle-drawer', handleToggle);
  }, []);

  const width = collapsed ? 72 : 220;
  const roleStyle = user ? ROLE_COLORS[user.role] || ROLE_COLORS.receptionist : ROLE_COLORS.receptionist;

  return (
    <>
      {/* Mobile drawer backdrop */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            className="fixed inset-0 z-[59] lg:hidden"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDrawerOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar — desktop: always visible, mobile: slide-in drawer */}
      <motion.aside
        className={`fixed left-0 top-0 h-screen flex flex-col py-5 z-[60] ${drawerOpen ? '' : 'hidden lg:flex'}`}
        animate={{ width: drawerOpen ? 220 : width }}
        transition={spring.snappy}
        style={{
          background: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--border-secondary)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
      >
      {/* Logo */}
      <div data-onboard="command-palette" className={`relative mb-6 group cursor-default flex items-center ${collapsed && !drawerOpen ? 'justify-center' : 'px-4'}`}>
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center relative z-10 shrink-0"
          style={{
            background: 'linear-gradient(135deg, #006B3F 0%, #34D399 50%, #FCD116 100%)',
            boxShadow: '0 0 24px rgba(0, 107, 63, 0.3), 0 4px 12px rgba(0, 0, 0, 0.3)',
          }}
        >
          <span className="text-[#050A18] font-bold text-sm tracking-tight">VMS</span>
        </div>
        <AnimatePresence>
          {(!collapsed || drawerOpen) && (
            <motion.div
              className="ml-3 overflow-hidden"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={spring.snappy}
            >
              <div className="text-sm font-semibold text-text-primary whitespace-nowrap">OHCS VMS</div>
              <div className="text-[10px] text-text-muted whitespace-nowrap">Visitor Management</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 flex flex-col gap-1 ${collapsed && !drawerOpen ? 'items-center px-0' : 'px-3'}`}>
        {navItems.map(({ path, icon: Icon, label, onboard }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className="relative group"
            {...(onboard ? { 'data-onboard': onboard } : {})}
          >
            {({ isActive }) => (
              <motion.div
                className={`flex items-center gap-3 rounded-xl transition-all duration-200 ${
                  collapsed && !drawerOpen ? 'w-10 h-10 justify-center' : 'px-3 py-2.5'
                } ${isActive ? 'text-ghana-gold' : 'text-text-muted hover:text-text-secondary'}`}
                style={isActive ? {
                  background: 'rgba(252, 209, 22, 0.08)',
                  boxShadow: '0 0 20px rgba(252, 209, 22, 0.05)',
                } : {}}
                whileHover={{ x: (collapsed && !drawerOpen) ? 0 : 2 }}
                onClick={() => drawerOpen && setDrawerOpen(false)}
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                    style={{
                      background: 'linear-gradient(180deg, #FCD116, #F59E0B)',
                      boxShadow: '0 0 12px rgba(252, 209, 22, 0.4)',
                    }}
                    layoutId="sidebarIndicator"
                    transition={spring.snappy}
                  />
                )}
                {collapsed && !drawerOpen ? (
                  <Tooltip text={label} position="right">
                    <Icon />
                  </Tooltip>
                ) : (
                  <Icon />
                )}
                <AnimatePresence>
                  {(!collapsed || drawerOpen) && (
                    <motion.span
                      className="text-sm font-medium whitespace-nowrap overflow-hidden"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={spring.snappy}
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User info */}
      {user && (
        <div className={`mb-2 ${collapsed && !drawerOpen ? 'px-2' : 'px-3'}`}>
          <AnimatePresence>
            {(!collapsed || drawerOpen) ? (
              <motion.div
                className="p-2.5 rounded-xl"
                style={{ background: 'var(--bg-card-inset)', border: '1px solid var(--border-subtle)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="text-xs font-medium text-text-primary truncate">{user.full_name}</div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span
                    className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                    style={{ background: roleStyle.bg, color: roleStyle.text, border: `1px solid ${roleStyle.border}` }}
                  >
                    {user.role}
                  </span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                className="w-10 h-10 rounded-xl mx-auto flex items-center justify-center"
                style={{ background: roleStyle.bg, border: `1px solid ${roleStyle.border}` }}
                title={`${user.full_name} (${user.role})`}
              >
                <span className="text-xs font-bold" style={{ color: roleStyle.text }}>
                  {user.full_name?.charAt(0)?.toUpperCase()}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Bottom actions */}
      <div className={`flex ${collapsed && !drawerOpen ? 'flex-col items-center gap-1.5' : 'flex-col gap-1.5 px-3'}`}>
        {/* Collapse toggle — always on its own row */}
        <button
          onClick={onToggleCollapse}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-text-muted hover:text-text-secondary transition-all duration-200 group mx-auto"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <motion.svg
            className="w-[18px] h-[18px]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            animate={{ rotate: collapsed ? 0 : 180 }}
            transition={spring.snappy}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </motion.svg>
        </button>

        {/* Separator */}
        <div className={`${collapsed && !drawerOpen ? 'w-6' : 'w-full'} h-px mx-auto`} style={{ background: 'var(--border-separator)' }} />

        {/* Action icons — horizontal when expanded, vertical when collapsed */}
        <div className={`flex ${collapsed && !drawerOpen ? 'flex-col items-center gap-1.5' : 'flex-row items-center justify-center gap-1'}`}>
          {/* Notification center */}
          <NotificationCenter />

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="relative w-10 h-10 rounded-xl flex items-center justify-center text-text-muted hover:text-text-secondary transition-all duration-200 group"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            <div
              className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: 'rgba(252, 209, 22, 0.08)', boxShadow: '0 0 20px rgba(252, 209, 22, 0.05)' }}
            />
          </button>

          {/* AI Chat toggle */}
          <button
            data-onboard="ai-chat"
            onClick={onChatToggle}
            className="relative w-10 h-10 rounded-xl flex items-center justify-center text-text-muted hover:text-accent-blue transition-all duration-200 group"
            title="AI Assistant"
          >
            <ChatIcon />
            <div
              className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: 'rgba(59, 130, 246, 0.08)', boxShadow: '0 0 20px rgba(59, 130, 246, 0.05)' }}
            />
            <span
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
              style={{ background: '#3B82F6', boxShadow: '0 0 8px rgba(59, 130, 246, 0.5)' }}
            />
          </button>

          {/* Logout */}
          <button
            onClick={logout}
            className="relative w-10 h-10 rounded-xl flex items-center justify-center text-text-muted hover:text-ghana-red transition-all duration-200 group"
            title="Sign out"
          >
            <LogoutIcon />
            <div
              className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: 'rgba(206, 17, 38, 0.06)', boxShadow: '0 0 20px rgba(206, 17, 38, 0.05)' }}
            />
          </button>
        </div>
      </div>
    </motion.aside>
    </>
  );
}

function LogoutIcon() {
  return (
    <svg className="w-[18px] h-[18px] relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg className="w-[18px] h-[18px] relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className="w-[18px] h-[18px] relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
    </svg>
  );
}

function DashboardIcon() {
  return (
    <svg className="w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  );
}

function VisitorsIcon() {
  return (
    <svg className="w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}

function AnalyticsIcon() {
  return (
    <svg className="w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg className="w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg className="w-[18px] h-[18px] relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
    </svg>
  );
}

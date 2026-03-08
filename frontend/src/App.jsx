import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Sidebar from './components/layout/Sidebar';
import AIChatPanel from './components/ai/AIChatPanel';
import FloatingOrbs from './components/shared/FloatingOrbs';
import DashboardPage from './pages/DashboardPage';
import VisitorsPage from './pages/VisitorsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import CommandPalette from './components/shared/CommandPalette';
import NotificationCenter from './components/layout/NotificationCenter';
import BottomNav from './components/layout/BottomNav';
import ShortcutsOverlay from './components/shared/ShortcutsOverlay';
import FAB from './components/shared/FAB';
import OnboardingHints from './components/shared/OnboardingHints';
import { pageTransition, pageTransitionConfig } from './constants/motion';
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={pageTransition.initial}
        animate={pageTransition.animate}
        exit={pageTransition.exit}
        transition={pageTransitionConfig}
      >
        <Routes location={location}>
          <Route path="/" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/visitors" element={
            <ProtectedRoute>
              <VisitorsPage />
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute roles={['admin', 'supervisor']}>
              <AnalyticsPage />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute roles={['admin']}>
              <SettingsPage />
            </ProtectedRoute>
          } />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
}

function AppRouter() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  if (isLoginPage) {
    return <LoginPage />;
  }

  return <AppShell />;
}

function AppShell() {
  const { isAuthenticated, loading } = useAuth();
  const [chatOpen, setChatOpen] = useState(false);
  const [cmdkOpen, setCmdkOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try { return localStorage.getItem('vms-sidebar') !== 'expanded'; } catch { return true; }
  });

  useEffect(() => {
    try { localStorage.setItem('vms-sidebar', sidebarCollapsed ? 'collapsed' : 'expanded'); } catch {}
  }, [sidebarCollapsed]);

  useKeyboardShortcuts({
    onCommandPalette: () => setCmdkOpen(true),
    onShortcutsHelp: () => setShortcutsOpen(true),
  });

  const sidebarWidth = sidebarCollapsed ? 72 : 220;
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : false
  );

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Don't render shell if still loading auth or not authenticated
  if (loading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen">
        <FloatingOrbs />
        <AnimatedRoutes />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <FloatingOrbs />
      <Sidebar
        onChatToggle={() => setChatOpen(prev => !prev)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
      />

      {/* Main content — margin matches sidebar width on desktop */}
      <main
        className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6"
        style={{
          marginLeft: isDesktop ? sidebarWidth : 0,
          transition: 'margin-left 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <AnimatedRoutes />
      </main>

      {/* AI Chat Panel */}
      <AIChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />

      {/* Command Palette */}
      <CommandPalette open={cmdkOpen} onClose={() => setCmdkOpen(false)} />

      {/* Keyboard Shortcuts Overlay */}
      <ShortcutsOverlay open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />

      {/* Bottom Nav for tablet */}
      <BottomNav onChatToggle={() => setChatOpen(prev => !prev)} />

      {/* FAB for tablet */}
      <FAB />

      {/* Onboarding tour */}
      <OnboardingHints />
    </div>
  );
}

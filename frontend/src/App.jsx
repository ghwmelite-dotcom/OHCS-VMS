import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import AIChatPanel from './components/ai/AIChatPanel';
import PageTransition from './components/shared/PageTransition';
import FloatingOrbs from './components/shared/FloatingOrbs';
import DashboardPage from './pages/DashboardPage';
import VisitorsPage from './pages/VisitorsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="flex min-h-screen">
        <FloatingOrbs />
        <Sidebar onChatToggle={() => setChatOpen(prev => !prev)} />

        {/* Main content */}
        <main className="flex-1 ml-[72px] p-6">
          <PageTransition>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/visitors" element={<VisitorsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </PageTransition>
        </main>

        {/* AI Chat Panel */}
        <AIChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />
      </div>
    </BrowserRouter>
  );
}

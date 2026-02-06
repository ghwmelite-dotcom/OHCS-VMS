import { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import StatsRow from '../components/dashboard/StatsRow';
import AIInsightsPanel from '../components/dashboard/AIInsightsPanel';
import RecentVisitors from '../components/dashboard/RecentVisitors';
import OfficeQuickView from '../components/dashboard/OfficeQuickView';
import WeeklyChart from '../components/dashboard/WeeklyChart';
import NewVisitorModal from '../components/visitors/NewVisitorModal';
import QRScannerModal from '../components/visitors/QRScannerModal';
import AppointmentRequests from '../components/dashboard/AppointmentRequests';
import { useDashboard, useWeeklyAnalytics } from '../hooks/useAnalytics';
import { useTodayVisits } from '../hooks/useVisitors';

export default function DashboardPage() {
  const { data: dashboard, loading: dashLoading, refresh } = useDashboard();
  const { data: weeklyData } = useWeeklyAnalytics();
  const { visits, refresh: refreshVisits } = useTodayVisits();
  const [modalOpen, setModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [prefillData, setPrefillData] = useState(null);

  // Auto-refresh every 30s
  useEffect(() => {
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [refresh]);

  const handleVisitorSuccess = () => {
    refresh();
    refreshVisits?.();
  };

  const handleQRResult = (preReg) => {
    setPrefillData(preReg);
    setModalOpen(true);
  };

  return (
    <div>
      <Header
        title="Visitor Management"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQrModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: 'var(--bg-card-inset)',
                border: '1px solid var(--border-separator)',
                color: 'var(--text-secondary)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-card-inset-hover)';
                e.currentTarget.style.borderColor = 'var(--border-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--bg-card-inset)';
                e.currentTarget.style.borderColor = 'var(--border-separator)';
              }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 14.625v1.875m0 3.75v-3.75m0 0h1.875m1.875 0h-1.875m0 0v-1.875m0 1.875h-1.875" />
              </svg>
              Scan QR
            </button>
            <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              New Visitor
            </button>
          </div>
        }
      />
      <StatsRow stats={dashboard?.stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <AIInsightsPanel prediction={dashboard?.prediction} />
        <RecentVisitors visits={visits} />
      </div>

      <AppointmentRequests />

      <div className="mb-4">
        <OfficeQuickView officeStats={dashboard?.officeStats} />
      </div>

      <WeeklyChart data={weeklyData} />

      <NewVisitorModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setPrefillData(null); }}
        onSuccess={handleVisitorSuccess}
        prefill={prefillData}
      />

      <QRScannerModal
        open={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        onResult={handleQRResult}
      />
    </div>
  );
}

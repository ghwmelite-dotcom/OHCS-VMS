import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '../components/layout/Header';
import StatsRow from '../components/dashboard/StatsRow';
import AIInsightsPanel from '../components/dashboard/AIInsightsPanel';
import OfficeQuickView from '../components/dashboard/OfficeQuickView';
import WeeklyChart from '../components/dashboard/WeeklyChart';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import VisitorHeatmap from '../components/dashboard/VisitorHeatmap';
import NewVisitorModal from '../components/visitors/NewVisitorModal';
import QRScannerModal from '../components/visitors/QRScannerModal';
import AppointmentRequests from '../components/dashboard/AppointmentRequests';
import Skeleton from '../components/shared/Skeleton';
import DataLoader from '../components/shared/DataLoader';
import { useDashboard, useWeeklyAnalytics } from '../hooks/useAnalytics';
import { useTodayVisits } from '../hooks/useVisitors';
import { getHourlyHeatmap } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { staggerContainer, staggerItem } from '../constants/motion';

function getGreeting(name) {
  const hour = new Date().getHours();
  const firstName = name ? name.split(' ')[0] : '';
  const suffix = firstName ? `, ${firstName}` : '';
  if (hour < 12) return { text: `Good Morning${suffix}`, icon: '🌅', subtitle: 'Start the day strong' };
  if (hour < 17) return { text: `Good Afternoon${suffix}`, icon: '☀️', subtitle: 'Keep the momentum going' };
  return { text: `Good Evening${suffix}`, icon: '🌙', subtitle: 'Wrapping up the day' };
}

function formatDate() {
  return new Date().toLocaleDateString('en-GH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Africa/Accra',
  });
}

export default function DashboardPage() {
  const { data: dashboard, loading: dashLoading, refresh } = useDashboard();
  const { data: weeklyData } = useWeeklyAnalytics();
  const { visits, refresh: refreshVisits } = useTodayVisits();
  const [modalOpen, setModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [prefillData, setPrefillData] = useState(null);
  const [heatmapData, setHeatmapData] = useState(null);
  const { user } = useAuth();
  const greeting = getGreeting(user?.full_name);

  // Auto-refresh every 30s
  useEffect(() => {
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [refresh]);

  // Fetch heatmap data
  useEffect(() => {
    getHourlyHeatmap().then(d => setHeatmapData(d.heatmap || [])).catch(() => {
      // heatmap is non-critical
    });
  }, []);

  // Listen for keyboard shortcut events
  useEffect(() => {
    const handleNewVisitor = () => setModalOpen(true);
    const handleScanQR = () => setQrModalOpen(true);
    window.addEventListener('vms:new-visitor', handleNewVisitor);
    window.addEventListener('vms:scan-qr', handleScanQR);
    return () => {
      window.removeEventListener('vms:new-visitor', handleNewVisitor);
      window.removeEventListener('vms:scan-qr', handleScanQR);
    };
  }, []);

  const [refreshing, setRefreshing] = useState(false);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    refresh();
    refreshVisits?.();
    setTimeout(() => setRefreshing(false), 800);
  };

  const handleVisitorSuccess = () => {
    refresh();
    refreshVisits?.();
  };

  const handleQRResult = (preReg) => {
    setPrefillData(preReg);
    setModalOpen(true);
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {/* Greeting */}
      <motion.div variants={staggerItem} className="mb-2">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{greeting.icon}</span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gradient-hero">
              {greeting.text}
            </h1>
            <p className="text-xs text-text-muted mt-0.5">{formatDate()} — {greeting.subtitle}</p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={staggerItem}>
        <Header
          title="Visitor Management"
          actions={
            <div className="flex items-center gap-2">
              <button
                onClick={handleManualRefresh}
                className="card-inset-interactive flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium"
                style={{ color: 'var(--text-secondary)' }}
                title="Refresh dashboard"
              >
                <svg
                  className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                </svg>
              </button>
              <button
                data-onboard="scan-qr"
                onClick={() => setQrModalOpen(true)}
                className="card-inset-interactive flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium"
                style={{ color: 'var(--text-secondary)' }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 14.625v1.875m0 3.75v-3.75m0 0h1.875m1.875 0h-1.875m0 0v-1.875m0 1.875h-1.875" />
                </svg>
                Scan QR
              </button>
              <button data-onboard="new-visitor" onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                New Visitor
              </button>
            </div>
          }
        />
      </motion.div>

      <DataLoader loading={dashLoading && !dashboard} skeleton={<Skeleton.Dashboard />}>
        <motion.div variants={staggerItem}>
          <StatsRow stats={dashboard?.stats} />
        </motion.div>

        <motion.div variants={staggerItem} className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <AIInsightsPanel prediction={dashboard?.prediction} />
          <ActivityFeed visits={visits} />
        </motion.div>

        <motion.div variants={staggerItem}>
          <AppointmentRequests />
        </motion.div>

        <motion.div variants={staggerItem} className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <div>
            <OfficeQuickView officeStats={dashboard?.officeStats} />
          </div>
          <VisitorHeatmap data={heatmapData} />
        </motion.div>

        <motion.div variants={staggerItem}>
          <WeeklyChart data={weeklyData} prediction={dashboard?.prediction} />
        </motion.div>
      </DataLoader>

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
    </motion.div>
  );
}

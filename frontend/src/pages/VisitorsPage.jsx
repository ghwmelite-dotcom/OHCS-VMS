import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Header from '../components/layout/Header';
import VisitorTable from '../components/visitors/VisitorTable';
import VisitorTimeline from '../components/visitors/VisitorTimeline';
import OfficeFilter from '../components/visitors/OfficeFilter';
import NewVisitorModal from '../components/visitors/NewVisitorModal';
import QRScannerModal from '../components/visitors/QRScannerModal';
import CheckoutModal from '../components/visitors/CheckoutModal';
import VisitorProfileCard from '../components/visitors/VisitorProfileCard';
import BulkActionsBar from '../components/visitors/BulkActionsBar';
import Skeleton from '../components/shared/Skeleton';
import { useTodayVisits } from '../hooks/useVisitors';
import { checkOutVisitorWithSurvey } from '../services/api';
import useUXFeedback from '../hooks/useUXFeedback';
import { staggerContainer, staggerItem } from '../constants/motion';

export default function VisitorsPage() {
  const [officeFilter, setOfficeFilter] = useState(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [prefillData, setPrefillData] = useState(null);
  const [checkoutVisit, setCheckoutVisit] = useState(null);
  const [profileVisitorId, setProfileVisitorId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'timeline'
  const { visits, loading, refresh } = useTodayVisits(officeFilter);
  const { celebrate, notify } = useUXFeedback();
  const searchRef = useRef(null);

  const filteredVisits = search
    ? visits.filter(v =>
        v.visitor_name?.toLowerCase().includes(search.toLowerCase()) ||
        v.visitor_id?.toLowerCase().includes(search.toLowerCase()) ||
        v.organization?.toLowerCase().includes(search.toLowerCase())
      )
    : visits;

  // Listen for keyboard shortcut events
  useEffect(() => {
    const handleNewVisitor = () => setModalOpen(true);
    const handleFocusSearch = () => searchRef.current?.focus();
    const handleScanQR = () => setQrModalOpen(true);
    window.addEventListener('vms:new-visitor', handleNewVisitor);
    window.addEventListener('vms:focus-search', handleFocusSearch);
    window.addEventListener('vms:scan-qr', handleScanQR);
    return () => {
      window.removeEventListener('vms:new-visitor', handleNewVisitor);
      window.removeEventListener('vms:focus-search', handleFocusSearch);
      window.removeEventListener('vms:scan-qr', handleScanQR);
    };
  }, []);

  const handleCheckOut = async (visitId, surveyData = {}) => {
    await checkOutVisitorWithSurvey(visitId, surveyData);
    refresh();
  };

  const handleBulkCheckout = async () => {
    const checkedInSelected = visits.filter(v => selectedIds.includes(v.id) && v.status === 'checked-in');
    if (checkedInSelected.length === 0) {
      toast.error('No checked-in visitors selected');
      return;
    }
    let failed = 0;
    for (const v of checkedInSelected) {
      try {
        await checkOutVisitorWithSurvey(v.id, {});
      } catch {
        failed++;
      }
    }
    if (failed > 0) {
      notify.error(`${failed} checkout(s) failed`);
    }
    celebrate('checkout', `${checkedInSelected.length - failed} visitors checked out`, 'subtle');
    setSelectedIds([]);
    refresh();
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
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
      <motion.div variants={staggerItem}>
        <Header title="Visitors" />
      </motion.div>

      {/* Toolbar */}
      <motion.div variants={staggerItem} className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <input
            ref={searchRef}
            className="input"
            placeholder="Search by name, ID, or organization... (S)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-64">
          <OfficeFilter value={officeFilter} onChange={setOfficeFilter} />
        </div>

        {/* View toggle */}
        <div
          className="flex rounded-xl overflow-hidden"
          style={{ border: '1px solid var(--border-separator)' }}
        >
          <button
            onClick={() => setViewMode('table')}
            className="px-3 py-2.5 text-xs font-medium transition-colors"
            style={{
              background: viewMode === 'table' ? 'rgba(252, 209, 22, 0.08)' : 'var(--bg-card-inset)',
              color: viewMode === 'table' ? '#FCD116' : 'var(--text-muted)',
            }}
          >
            Table
          </button>
          <button
            onClick={() => setViewMode('timeline')}
            className="px-3 py-2.5 text-xs font-medium transition-colors"
            style={{
              background: viewMode === 'timeline' ? 'rgba(252, 209, 22, 0.08)' : 'var(--bg-card-inset)',
              color: viewMode === 'timeline' ? '#FCD116' : 'var(--text-muted)',
              borderLeft: '1px solid var(--border-separator)',
            }}
          >
            Timeline
          </button>
        </div>

        <button
          onClick={() => setQrModalOpen(true)}
          className="card-inset-interactive whitespace-nowrap flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm font-medium"
          style={{ color: 'var(--text-secondary)' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 14.625v1.875m0 3.75v-3.75m0 0h1.875m1.875 0h-1.875m0 0v-1.875m0 1.875h-1.875" />
          </svg>
          Scan QR
        </button>
        <button onClick={() => setModalOpen(true)} className="btn-primary whitespace-nowrap">+ New Visitor</button>
      </motion.div>

      {/* Content */}
      <motion.div variants={staggerItem}>
        {loading ? (
          <Skeleton.VisitorTable />
        ) : viewMode === 'table' ? (
          <VisitorTable
            visits={filteredVisits}
            onCheckOut={(visit) => setCheckoutVisit(visit)}
            onViewProfile={(id) => setProfileVisitorId(id)}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
          />
        ) : (
          <VisitorTimeline visits={filteredVisits} />
        )}
      </motion.div>

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selectedIds.length}
        onBulkCheckout={handleBulkCheckout}
        onClearSelection={() => setSelectedIds([])}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        visit={checkoutVisit}
        open={!!checkoutVisit}
        onClose={() => setCheckoutVisit(null)}
        onConfirm={handleCheckOut}
      />

      {/* Visitor Profile */}
      <VisitorProfileCard
        visitorId={profileVisitorId}
        open={!!profileVisitorId}
        onClose={() => setProfileVisitorId(null)}
      />

      {/* Registration Modal */}
      <NewVisitorModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setPrefillData(null); }}
        onSuccess={refresh}
        prefill={prefillData}
      />

      {/* QR Scanner Modal */}
      <QRScannerModal
        open={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        onResult={handleQRResult}
      />
    </motion.div>
  );
}

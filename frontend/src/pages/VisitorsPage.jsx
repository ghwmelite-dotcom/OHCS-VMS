import { useState } from 'react';
import Header from '../components/layout/Header';
import VisitorTable from '../components/visitors/VisitorTable';
import OfficeFilter from '../components/visitors/OfficeFilter';
import NewVisitorModal from '../components/visitors/NewVisitorModal';
import QRScannerModal from '../components/visitors/QRScannerModal';
import { useTodayVisits } from '../hooks/useVisitors';
import { checkOutVisitor } from '../services/api';

export default function VisitorsPage() {
  const [officeFilter, setOfficeFilter] = useState(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [prefillData, setPrefillData] = useState(null);
  const { visits, loading, refresh } = useTodayVisits(officeFilter);

  const filteredVisits = search
    ? visits.filter(v =>
        v.visitor_name?.toLowerCase().includes(search.toLowerCase()) ||
        v.visitor_id?.toLowerCase().includes(search.toLowerCase()) ||
        v.organization?.toLowerCase().includes(search.toLowerCase())
      )
    : visits;

  const handleCheckOut = async (visitId) => {
    try {
      await checkOutVisitor(visitId);
      refresh();
    } catch (err) {
      console.error('Check-out failed:', err);
    }
  };

  const handleQRResult = (preReg) => {
    setPrefillData(preReg);
    setModalOpen(true);
  };

  return (
    <div>
      <Header title="Visitors" />

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1">
          <input
            className="input"
            placeholder="Search by name, ID, or organization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-64">
          <OfficeFilter value={officeFilter} onChange={setOfficeFilter} />
        </div>
        <button
          onClick={() => setQrModalOpen(true)}
          className="whitespace-nowrap flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{
            background: 'var(--bg-card-inset)',
            border: '1px solid var(--border-separator)',
            color: 'var(--text-secondary)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--bg-card-inset-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--bg-card-inset)';
          }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 14.625v1.875m0 3.75v-3.75m0 0h1.875m1.875 0h-1.875m0 0v-1.875m0 1.875h-1.875" />
          </svg>
          Scan QR
        </button>
        <button
          onClick={() => setModalOpen(true)}
          className="btn-primary whitespace-nowrap"
        >
          + New Visitor
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="card text-center py-8">
          <div className="w-6 h-6 border-2 border-ghana-gold/30 border-t-ghana-gold rounded-full animate-spin mx-auto mb-2" />
          <p className="text-text-secondary text-sm">Loading visitors...</p>
        </div>
      ) : (
        <VisitorTable visits={filteredVisits} onCheckOut={handleCheckOut} />
      )}

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
    </div>
  );
}

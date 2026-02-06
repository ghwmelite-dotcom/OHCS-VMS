import { useState, useEffect, useRef } from 'react';
import { lookupQRToken } from '../../services/api';
import OfficePill from '../shared/OfficePill';

export default function QRScannerModal({ open, onClose, onResult }) {
  const [scanning, setScanning] = useState(true);
  const [error, setError] = useState(null);
  const [preReg, setPreReg] = useState(null);
  const [manualToken, setManualToken] = useState('');
  const scannerRef = useRef(null);
  const scannerInstanceRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setScanning(true);
    setError(null);
    setPreReg(null);
    setManualToken('');

    let html5QrCode = null;

    const startScanner = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        if (!scannerRef.current) return;

        html5QrCode = new Html5Qrcode(scannerRef.current.id);
        scannerInstanceRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            handleTokenLookup(decodedText);
            html5QrCode?.stop().catch(() => {});
          },
          () => {} // ignore scan failures
        );
      } catch (err) {
        console.error('Camera error:', err);
        setError('Could not access camera. Use manual entry below.');
        setScanning(false);
      }
    };

    startScanner();

    return () => {
      if (html5QrCode) {
        html5QrCode.stop().catch(() => {});
      }
      scannerInstanceRef.current = null;
    };
  }, [open]);

  const handleTokenLookup = async (token) => {
    const cleanToken = token.trim();
    if (!cleanToken) return;

    setScanning(false);
    setError(null);

    try {
      const data = await lookupQRToken(cleanToken);
      setPreReg(data.preRegistration);
    } catch (err) {
      setError(err.message || 'No valid pre-registration found for this QR code');
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualToken.trim()) {
      handleTokenLookup(manualToken.trim());
    }
  };

  const handleCheckIn = () => {
    if (preReg && onResult) {
      onResult(preReg);
    }
    handleClose();
  };

  const handleClose = () => {
    if (scannerInstanceRef.current) {
      scannerInstanceRef.current.stop().catch(() => {});
      scannerInstanceRef.current = null;
    }
    setScanning(true);
    setError(null);
    setPreReg(null);
    setManualToken('');
    onClose();
  };

  const handleRescan = () => {
    setPreReg(null);
    setError(null);
    setScanning(true);
    setManualToken('');

    // Restart scanner
    const restartScanner = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        if (!scannerRef.current) return;

        const html5QrCode = new Html5Qrcode(scannerRef.current.id);
        scannerInstanceRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            handleTokenLookup(decodedText);
            html5QrCode?.stop().catch(() => {});
          },
          () => {}
        );
      } catch {
        setError('Could not access camera. Use manual entry below.');
        setScanning(false);
      }
    };
    restartScanner();
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 animate-fade-in"
        style={{ background: 'var(--bg-backdrop)', backdropFilter: 'blur(4px)' }}
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl animate-fade-in-up"
          style={{
            background: 'var(--bg-modal)',
            border: '1px solid var(--border-separator)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            boxShadow: 'var(--shadow-modal)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between p-5"
            style={{ borderBottom: '1px solid var(--border-secondary)' }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
                style={{
                  background: 'linear-gradient(135deg, rgba(0, 107, 63, 0.15), rgba(52, 211, 153, 0.1))',
                  border: '1px solid rgba(0, 107, 63, 0.2)',
                }}
              >
                {'\uD83D\uDCF7'}
              </div>
              <h2 className="text-lg font-semibold">Scan QR Code</h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-xl text-text-muted hover:text-text-secondary transition-colors"
              style={{ background: 'transparent' }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="p-5">
            {/* Scanner area */}
            {scanning && !preReg && (
              <div
                className="rounded-2xl overflow-hidden mb-4"
                style={{ background: '#000', minHeight: 280 }}
              >
                <div id="qr-reader" ref={scannerRef} style={{ width: '100%' }} />
              </div>
            )}

            {/* Error */}
            {error && (
              <div
                className="p-3.5 rounded-2xl text-sm flex items-center gap-2 mb-4"
                style={{
                  background: 'linear-gradient(135deg, rgba(206, 17, 38, 0.1), rgba(206, 17, 38, 0.04))',
                  border: '1px solid rgba(206, 17, 38, 0.2)',
                  color: '#CE1126',
                }}
              >
                <span>{'\u26A0'}</span> {error}
              </div>
            )}

            {/* Manual entry */}
            {!preReg && (
              <form onSubmit={handleManualSubmit} className="mb-4">
                <label className="text-[11px] text-text-muted uppercase tracking-wider mb-1.5 block font-medium">
                  Or enter QR token manually
                </label>
                <div className="flex gap-2">
                  <input
                    className="input flex-1 font-mono"
                    placeholder="e.g. a1b2c3d4"
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={!manualToken.trim()}
                    className="btn-primary px-4"
                    style={{ opacity: manualToken.trim() ? 1 : 0.5 }}
                  >
                    Look Up
                  </button>
                </div>
              </form>
            )}

            {/* Pre-registration result */}
            {preReg && (
              <div
                className="p-4 rounded-2xl mb-4"
                style={{
                  background: 'linear-gradient(135deg, rgba(0, 107, 63, 0.06), rgba(252, 209, 22, 0.04))',
                  border: '1px solid rgba(0, 107, 63, 0.15)',
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="text-sm px-2 py-0.5 rounded-lg font-semibold"
                    style={{
                      background: preReg.status === 'confirmed'
                        ? 'rgba(0, 107, 63, 0.15)'
                        : 'rgba(252, 209, 22, 0.15)',
                      color: preReg.status === 'confirmed' ? '#006B3F' : '#F59E0B',
                    }}
                  >
                    {preReg.status === 'confirmed' ? '\u2705 Confirmed' : '\u23F3 Pending'}
                  </span>
                  <span className="text-[11px] text-text-muted font-mono">#{preReg.id}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                      style={{
                        background: 'linear-gradient(135deg, #006B3F, #34D399)',
                        color: 'white',
                      }}
                    >
                      {preReg.visitor_name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{preReg.visitor_name}</div>
                      {preReg.visitor_organization && (
                        <div className="text-[11px] text-text-muted">{preReg.visitor_organization}</div>
                      )}
                    </div>
                  </div>

                  <div
                    className="grid grid-cols-2 gap-2 mt-3 p-3 rounded-xl"
                    style={{ background: 'var(--bg-card-inset)' }}
                  >
                    <div>
                      <div className="text-[10px] text-text-muted uppercase tracking-wider">Office</div>
                      <OfficePill abbreviation={preReg.office_abbr} type={preReg.office_type} />
                    </div>
                    <div>
                      <div className="text-[10px] text-text-muted uppercase tracking-wider">Purpose</div>
                      <div className="text-sm">{preReg.purpose}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-text-muted uppercase tracking-wider">Date</div>
                      <div className="text-sm">{preReg.expected_date}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-text-muted uppercase tracking-wider">Host</div>
                      <div className="text-sm">{preReg.host_officer}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-end gap-3 p-5"
            style={{ borderTop: '1px solid var(--border-secondary)' }}
          >
            {preReg ? (
              <>
                <button
                  onClick={handleRescan}
                  className="px-4 py-2.5 rounded-xl text-sm text-text-secondary"
                  style={{
                    background: 'var(--bg-card-inset)',
                    border: '1px solid var(--border-separator)',
                  }}
                >
                  Scan Another
                </button>
                <button onClick={handleCheckIn} className="btn-primary">
                  {'\u2713'} Check In
                </button>
              </>
            ) : (
              <button
                onClick={handleClose}
                className="px-4 py-2.5 rounded-xl text-sm text-text-secondary"
                style={{
                  background: 'var(--bg-card-inset)',
                  border: '1px solid var(--border-separator)',
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

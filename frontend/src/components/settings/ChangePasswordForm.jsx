import { useState } from 'react';
import { authChangePassword } from '../../services/api';

export default function ChangePasswordForm() {
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPw !== confirmPw) {
      setError('New passwords do not match');
      return;
    }

    setSaving(true);
    try {
      await authChangePassword(currentPw, newPw);
      setSuccess('Password changed successfully');
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  };

  return (
    <div className="card mb-4">
      <div className="flex items-center gap-2.5 mb-5">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 107, 63, 0.15), rgba(52, 211, 153, 0.1))',
            border: '1px solid rgba(0, 107, 63, 0.2)',
          }}
        >
          <svg className="w-4 h-4" style={{ color: '#34D399' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Change Password</h3>
      </div>

      {error && (
        <div
          className="mb-3 p-2.5 rounded-xl text-xs flex items-center gap-2"
          style={{
            background: 'linear-gradient(135deg, rgba(206, 17, 38, 0.1), rgba(206, 17, 38, 0.04))',
            border: '1px solid rgba(206, 17, 38, 0.2)',
            color: '#CE1126',
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          className="mb-3 p-2.5 rounded-xl text-xs flex items-center gap-2"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 107, 63, 0.1), rgba(0, 107, 63, 0.04))',
            border: '1px solid rgba(0, 107, 63, 0.2)',
            color: '#34D399',
          }}
        >
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-[11px] text-text-muted uppercase tracking-wider mb-1.5 font-medium">
            Current Password <span style={{ color: '#CE1126' }}>*</span>
          </label>
          <input
            type="password"
            className="input"
            value={currentPw}
            onChange={(e) => setCurrentPw(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-[11px] text-text-muted uppercase tracking-wider mb-1.5 font-medium">
            New Password <span style={{ color: '#CE1126' }}>*</span>
          </label>
          <input
            type="password"
            className="input"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            minLength={8}
            required
          />
          <p className="text-[10px] text-text-muted mt-1">Min 8 chars, uppercase, lowercase, number</p>
        </div>
        <div>
          <label className="block text-[11px] text-text-muted uppercase tracking-wider mb-1.5 font-medium">
            Confirm New Password <span style={{ color: '#CE1126' }}>*</span>
          </label>
          <input
            type="password"
            className="input"
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
            minLength={8}
            required
          />
        </div>
        <button
          type="submit"
          disabled={saving || !currentPw || !newPw || !confirmPw}
          className="btn-primary text-sm py-2 px-4"
        >
          {saving ? 'Changing...' : 'Change Password'}
        </button>
      </form>
    </div>
  );
}

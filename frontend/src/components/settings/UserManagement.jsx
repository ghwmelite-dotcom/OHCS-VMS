import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { getUsers, createUser, updateUser, resetUserPassword, getOffices } from '../../services/api';
import useUXFeedback from '../../hooks/useUXFeedback';
import { spring, modalContent, backdrop } from '../../constants/motion';

const ROLE_COLORS = {
  admin: { bg: 'rgba(252, 209, 22, 0.12)', text: '#FCD116', border: 'rgba(252, 209, 22, 0.2)' },
  supervisor: { bg: 'rgba(0, 107, 63, 0.12)', text: '#34D399', border: 'rgba(0, 107, 63, 0.2)' },
  receptionist: { bg: 'rgba(59, 130, 246, 0.12)', text: '#60A5FA', border: 'rgba(59, 130, 246, 0.2)' },
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // 'create' | 'edit' | 'reset' | null
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({ email: '', password: '', full_name: '', role: 'receptionist', office_id: '' });
  const [resetPw, setResetPw] = useState('');
  const { play, notify } = useUXFeedback();

  const loadData = async () => {
    setLoading(true);
    try {
      const [u, o] = await Promise.all([getUsers(), getOffices()]);
      setUsers(u);
      setOffices(o);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const openCreate = () => {
    setForm({ email: '', password: '', full_name: '', role: 'receptionist', office_id: '' });
    setError('');
    setModal('create');
  };

  const openEdit = (user) => {
    setSelected(user);
    setForm({ email: user.email, full_name: user.full_name, role: user.role, office_id: user.office_id || '', password: '' });
    setError('');
    setModal('edit');
  };

  const openReset = (user) => {
    setSelected(user);
    setResetPw('');
    setError('');
    setModal('reset');
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await createUser({
        email: form.email,
        password: form.password,
        full_name: form.full_name,
        role: form.role,
        office_id: form.office_id ? parseInt(form.office_id) : undefined,
      });
      play('success');
      toast.success(`User ${form.full_name} created`);
      setModal(null);
      loadData();
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Failed to create user');
    }
    setSaving(false);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await updateUser(selected.id, {
        role: form.role,
        office_id: form.office_id ? parseInt(form.office_id) : null,
        full_name: form.full_name,
        is_active: form.is_active !== undefined ? form.is_active : selected.is_active,
      });
      toast.success('User updated');
      setModal(null);
      loadData();
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Failed to update user');
    }
    setSaving(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await resetUserPassword(selected.id, resetPw);
      toast.success('Password reset successfully');
      setModal(null);
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Failed to reset password');
    }
    setSaving(false);
  };

  const toggleActive = async (user) => {
    try {
      await updateUser(user.id, { is_active: !user.is_active });
      toast.success(`${user.full_name} ${user.is_active ? 'deactivated' : 'activated'}`);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to update user status');
    }
  };

  if (loading) {
    return (
      <div className="card mb-4">
        <div className="text-center py-8">
          <div className="w-6 h-6 border-2 border-ghana-gold/30 border-t-ghana-gold rounded-full animate-spin mx-auto mb-2" />
          <p className="text-text-muted text-sm">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
              style={{
                background: 'linear-gradient(135deg, rgba(252, 209, 22, 0.12), rgba(245, 158, 11, 0.08))',
                border: '1px solid rgba(252, 209, 22, 0.2)',
              }}
            >
              <svg className="w-4 h-4" style={{ color: '#FCD116' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">User Management</h3>
          </div>
          <button onClick={openCreate} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add User
          </button>
        </div>

        <div className="space-y-2 stagger-children">
          {users.map((u) => {
            const rc = ROLE_COLORS[u.role] || ROLE_COLORS.receptionist;
            return (
              <div
                key={u.id}
                className="card-inset-interactive flex items-center justify-between group"
                style={{ opacity: u.is_active ? 1 : 0.5 }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold"
                    style={{ background: rc.bg, color: rc.text, border: `1px solid ${rc.border}` }}
                  >
                    {u.full_name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-text-primary truncate">{u.full_name}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-text-muted truncate">{u.email}</span>
                      <span
                        className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full shrink-0"
                        style={{ background: rc.bg, color: rc.text, border: `1px solid ${rc.border}` }}
                      >
                        {u.role}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(u)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-text-secondary"
                    style={{ background: 'var(--bg-card-inset)' }}
                    title="Edit user"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                    </svg>
                  </button>
                  <button
                    onClick={() => openReset(u)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-ghana-gold"
                    style={{ background: 'var(--bg-card-inset)' }}
                    title="Reset password"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => toggleActive(u)}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${u.is_active ? 'text-text-muted hover:text-ghana-red' : 'text-text-muted hover:text-ghana-green'}`}
                    style={{ background: 'var(--bg-card-inset)' }}
                    title={u.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {u.is_active ? (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
          {users.length === 0 && (
            <p className="text-center text-sm text-text-muted py-6">No users yet. Create the first one.</p>
          )}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {modal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: 'var(--bg-backdrop)', backdropFilter: 'blur(4px)' }}
            {...backdrop}
            onClick={() => setModal(null)}
          >
            <motion.div
              className="w-full max-w-md rounded-3xl p-5"
              style={{ background: 'var(--bg-modal)', border: '1px solid var(--border-separator)', boxShadow: 'var(--shadow-modal)', backdropFilter: 'blur(40px)' }}
              {...modalContent}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Create user */}
              {modal === 'create' && (
                <form onSubmit={handleCreate}>
                  <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Create User</h3>
                  {error && <ErrorBanner message={error} />}
                  <div className="space-y-3">
                    <Field label="Full Name" required>
                      <input className="input" value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} required />
                    </Field>
                    <Field label="Email" required>
                      <input type="email" className="input" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="user@ohcs.gov.gh" required />
                    </Field>
                    <Field label="Password" required>
                      <input type="password" className="input" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} minLength={8} required />
                      <p className="text-[10px] text-text-muted mt-1">Min 8 chars, uppercase, lowercase, number</p>
                    </Field>
                    <Field label="Role" required>
                      <select className="select" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                        <option value="receptionist">Receptionist</option>
                        <option value="supervisor">Supervisor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </Field>
                    <Field label="Office (optional)">
                      <select className="select" value={form.office_id} onChange={e => setForm(p => ({ ...p, office_id: e.target.value }))}>
                        <option value="">No specific office</option>
                        {offices.map(o => <option key={o.id} value={o.id}>{o.abbreviation} — {o.full_name}</option>)}
                      </select>
                    </Field>
                  </div>
                  <div className="flex justify-end gap-3 mt-5 pt-4" style={{ borderTop: '1px solid var(--border-secondary)' }}>
                    <button type="button" onClick={() => setModal(null)} className="btn-secondary text-sm py-2 px-4">Cancel</button>
                    <button type="submit" disabled={saving} className="btn-primary text-sm py-2 px-4">
                      {saving ? 'Creating...' : 'Create User'}
                    </button>
                  </div>
                </form>
              )}

              {/* Edit user */}
              {modal === 'edit' && selected && (
                <form onSubmit={handleEdit}>
                  <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Edit User</h3>
                  {error && <ErrorBanner message={error} />}
                  <div className="space-y-3">
                    <Field label="Full Name">
                      <input className="input" value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} />
                    </Field>
                    <Field label="Email">
                      <input className="input" value={form.email} disabled style={{ opacity: 0.5 }} />
                    </Field>
                    <Field label="Role">
                      <select className="select" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                        <option value="receptionist">Receptionist</option>
                        <option value="supervisor">Supervisor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </Field>
                    <Field label="Office">
                      <select className="select" value={form.office_id} onChange={e => setForm(p => ({ ...p, office_id: e.target.value }))}>
                        <option value="">No specific office</option>
                        {offices.map(o => <option key={o.id} value={o.id}>{o.abbreviation} — {o.full_name}</option>)}
                      </select>
                    </Field>
                  </div>
                  <div className="flex justify-end gap-3 mt-5 pt-4" style={{ borderTop: '1px solid var(--border-secondary)' }}>
                    <button type="button" onClick={() => setModal(null)} className="btn-secondary text-sm py-2 px-4">Cancel</button>
                    <button type="submit" disabled={saving} className="btn-primary text-sm py-2 px-4">
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}

              {/* Reset password */}
              {modal === 'reset' && selected && (
                <form onSubmit={handleResetPassword}>
                  <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Reset Password</h3>
                  <p className="text-sm text-text-muted mb-4">
                    Set a new password for <span className="text-text-primary font-medium">{selected.full_name}</span>. This will sign them out of all sessions.
                  </p>
                  {error && <ErrorBanner message={error} />}
                  <Field label="New Password" required>
                    <input type="password" className="input" value={resetPw} onChange={e => setResetPw(e.target.value)} minLength={8} required />
                    <p className="text-[10px] text-text-muted mt-1">Min 8 chars, uppercase, lowercase, number</p>
                  </Field>
                  <div className="flex justify-end gap-3 mt-5 pt-4" style={{ borderTop: '1px solid var(--border-secondary)' }}>
                    <button type="button" onClick={() => setModal(null)} className="btn-secondary text-sm py-2 px-4">Cancel</button>
                    <button type="submit" disabled={saving} className="btn-primary text-sm py-2 px-4">
                      {saving ? 'Resetting...' : 'Reset Password'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-[11px] text-text-muted uppercase tracking-wider mb-1.5 font-medium">
        {label} {required && <span style={{ color: '#CE1126' }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function ErrorBanner({ message }) {
  return (
    <div
      className="mb-3 p-2.5 rounded-xl text-xs flex items-center gap-2"
      style={{
        background: 'linear-gradient(135deg, rgba(206, 17, 38, 0.1), rgba(206, 17, 38, 0.04))',
        border: '1px solid rgba(206, 17, 38, 0.2)',
        color: '#CE1126',
      }}
    >
      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
      {message}
    </div>
  );
}

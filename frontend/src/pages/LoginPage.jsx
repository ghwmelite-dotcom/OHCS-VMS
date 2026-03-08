import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { authSetup } from '../services/api';
import FloatingOrbs from '../components/shared/FloatingOrbs';
import { spring } from '../constants/motion';

const EMAIL_DOMAIN = '@ohcs.gov.gh';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Setup mode (first admin bootstrap)
  const [isSetup, setIsSetup] = useState(false);
  const [fullName, setFullName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.endsWith(EMAIL_DOMAIN)) {
      setError(`Email must end with ${EMAIL_DOMAIN}`);
      return;
    }

    setLoading(true);
    try {
      if (isSetup) {
        if (!fullName.trim()) {
          setError('Full name is required');
          setLoading(false);
          return;
        }
        await authSetup(email, password, fullName);
        // After setup, log in automatically
      }
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      const msg = err.message || 'Login failed';
      if (msg.includes('Setup already completed')) {
        setIsSetup(false);
        setError('Setup already done. Please log in.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center px-4"
      style={{ background: 'var(--bg-page)' }}
    >
      <FloatingOrbs />

      {/* Subtle grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(148,163,184,0.03) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Ghana flag accent line at top */}
      <div className="fixed top-0 left-0 right-0 h-1 z-10 flex">
        <div className="flex-1" style={{ background: '#CE1126' }} />
        <div className="flex-1" style={{ background: '#FCD116' }} />
        <div className="flex-1" style={{ background: '#006B3F' }} />
      </div>

      <motion.div
        className="w-full max-w-[400px] relative z-10"
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={spring.snappy}
      >
        {/* Logo + Title */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring.gentle, delay: 0.1 }}
        >
          {/* Crest / Logo */}
          <div className="mx-auto mb-5 relative">
            <div
              className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center relative"
              style={{
                background: 'linear-gradient(135deg, #006B3F 0%, #34D399 50%, #FCD116 100%)',
                boxShadow: '0 0 40px rgba(0, 107, 63, 0.3), 0 8px 32px rgba(0, 0, 0, 0.4)',
              }}
            >
              <span className="text-[#050A18] font-bold text-xl tracking-tight">VMS</span>
            </div>
            {/* Glow ring */}
            <div
              className="absolute inset-0 mx-auto w-16 h-16 rounded-2xl animate-pulse-slow"
              style={{
                boxShadow: '0 0 60px rgba(252, 209, 22, 0.1), 0 0 120px rgba(0, 107, 63, 0.05)',
              }}
            />
          </div>

          <h1 className="text-xl font-bold text-text-primary mb-1">
            Office of the Head of Civil Service
          </h1>
          <p className="text-sm text-text-muted">
            Visitor Management System
          </p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring.gentle, delay: 0.2 }}
        >
          {/* Card header */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
              {isSetup ? 'Initial Setup' : 'Sign In'}
            </h2>
            <div className="flex items-center gap-1.5">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: '#006B3F', boxShadow: '0 0 8px rgba(0, 107, 63, 0.4)' }}
              />
              <span className="text-[10px] text-text-muted font-medium">Secure</span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              className="mb-4 p-3 rounded-xl text-sm flex items-start gap-2.5"
              style={{
                background: 'linear-gradient(135deg, rgba(206, 17, 38, 0.1), rgba(206, 17, 38, 0.04))',
                border: '1px solid rgba(206, 17, 38, 0.2)',
                color: '#CE1126',
              }}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full name (setup only) */}
            {isSetup && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={spring.gentle}
              >
                <label className="block text-[11px] text-text-muted uppercase tracking-wider mb-1.5 font-medium">
                  Full Name <span style={{ color: '#CE1126' }}>*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input"
                  placeholder="System Administrator"
                  autoComplete="name"
                />
              </motion.div>
            )}

            {/* Email */}
            <div>
              <label className="block text-[11px] text-text-muted uppercase tracking-wider mb-1.5 font-medium">
                Email <span style={{ color: '#CE1126' }}>*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pr-10"
                  placeholder={`user${EMAIL_DOMAIN}`}
                  autoComplete="email"
                  required
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
              </div>
              {email && !email.endsWith(EMAIL_DOMAIN) && (
                <p className="text-[10px] mt-1" style={{ color: '#CE1126' }}>
                  Must end with {EMAIL_DOMAIN}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] text-text-muted uppercase tracking-wider mb-1.5 font-medium">
                Password <span style={{ color: '#CE1126' }}>*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pr-10"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading || !email || !password}
              className="btn-primary w-full flex items-center justify-center gap-2"
              whileHover={!loading ? { scale: 1.01 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              transition={spring.snappy}
            >
              {loading ? (
                <>
                  <div
                    className="w-4 h-4 rounded-full border-2 animate-spin"
                    style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }}
                  />
                  <span>{isSetup ? 'Creating...' : 'Signing in...'}</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                  </svg>
                  <span>{isSetup ? 'Create Admin & Sign In' : 'Sign In'}</span>
                </>
              )}
            </motion.button>
          </form>

          {/* Setup toggle */}
          <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => { setIsSetup(!isSetup); setError(''); }}
              className="w-full text-center text-[11px] text-text-muted hover:text-text-secondary transition-colors"
            >
              {isSetup
                ? 'Already have an account? Sign in'
                : 'First time? Set up admin account'}
            </button>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          className="text-center text-[10px] text-text-muted mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          OHCS Visitor Management System &middot; Republic of Ghana
        </motion.p>
      </motion.div>
    </div>
  );
}

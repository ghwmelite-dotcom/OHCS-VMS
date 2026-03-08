import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authLogin, authLogout, authMe } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    try { return localStorage.getItem('ohcs-token'); } catch { return null; }
  });
  const [loading, setLoading] = useState(!!token); // only loading if we have a stored token to validate

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    authMe()
      .then((data) => setUser(data))
      .catch(() => {
        localStorage.removeItem('ohcs-token');
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Listen for forced logout (401 from api.js)
  useEffect(() => {
    const handleExpired = () => {
      setToken(null);
      setUser(null);
    };
    window.addEventListener('vms:auth-expired', handleExpired);
    return () => window.removeEventListener('vms:auth-expired', handleExpired);
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authLogin(email, password);
    localStorage.setItem('ohcs-token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try { await authLogout(); } catch { /* ignore */ }
    localStorage.removeItem('ohcs-token');
    setToken(null);
    setUser(null);
  }, []);

  const isAdmin = user?.role === 'admin';
  const isReceptionist = user?.role === 'receptionist';
  const isSupervisor = user?.role === 'supervisor';
  const hasRole = useCallback((...roles) => user && roles.includes(user.role), [user]);

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      login, logout,
      isAdmin, isReceptionist, isSupervisor, hasRole,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

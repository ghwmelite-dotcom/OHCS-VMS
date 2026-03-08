import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Header from '../components/layout/Header';
import { useOffices } from '../hooks/useOffices';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import OfficePill from '../components/shared/OfficePill';
import { OFFICE_TYPE_ICONS } from '../constants/offices';
import UserManagement from '../components/settings/UserManagement';
import ChangePasswordForm from '../components/settings/ChangePasswordForm';
import usePersistedState from '../hooks/usePersistedState';
import useSound from '../hooks/useSound';

export default function SettingsPage() {
  const { grouped, loading } = useOffices();
  const { theme, toggleTheme } = useTheme();
  const { isAdmin } = useAuth();
  const { getEnabled: getSoundEnabled, setEnabled: setSoundEnabled } = useSound();
  const [soundOn, setSoundOn] = useState(getSoundEnabled);
  const [aiSettings, setAiSettings] = usePersistedState('vms-ai-settings', {
    smartRouting: true,
    anomalyDetection: true,
    sentimentAnalysis: true,
    predictions: true,
    chatAssistant: true,
  });

  // WhatsApp dynamic status
  const [waStatus, setWaStatus] = useState('checking');
  useEffect(() => {
    fetch('/api/health').then(r => r.ok ? setWaStatus('connected') : setWaStatus('error'))
      .catch(() => setWaStatus('error'));
  }, []);

  const toggleSetting = (key) => {
    setAiSettings(prev => {
      const next = { ...prev, [key]: !prev[key] };
      toast.success(`${key === 'smartRouting' ? 'Smart Routing' : key === 'anomalyDetection' ? 'Anomaly Detection' : key === 'sentimentAnalysis' ? 'Sentiment Analysis' : key === 'predictions' ? 'Predictions' : 'AI Chat'} ${next[key] ? 'enabled' : 'disabled'}`);
      return next;
    });
  };

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    toast.success(`Sounds ${next ? 'enabled' : 'disabled'}`);
  };

  const features = [
    { key: 'smartRouting', label: 'Smart Routing', desc: 'AI suggests the best office for visitors', icon: '\u{1F9ED}' },
    { key: 'anomalyDetection', label: 'Anomaly Detection', desc: 'Detect unusual visitor patterns', icon: '\u{1F6A8}' },
    { key: 'sentimentAnalysis', label: 'Sentiment Analysis', desc: 'Analyze visitor feedback', icon: '\u{1F4AC}' },
    { key: 'predictions', label: 'Predictive Analytics', desc: 'Forecast daily visitor traffic', icon: '\u{1F52E}' },
    { key: 'chatAssistant', label: 'AI Chat Assistant', desc: 'Conversational data assistant', icon: '\u{1F916}' },
  ];

  return (
    <div>
      <Header title="Settings" />

      {/* User Management (admin only) */}
      {isAdmin && <UserManagement />}

      {/* Change Password (all roles) */}
      <ChangePasswordForm />

      {/* Appearance */}
      <div className="card mb-4">
        <div className="flex items-center gap-2.5 mb-5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
            style={{
              background: 'linear-gradient(135deg, rgba(252, 209, 22, 0.12), rgba(245, 158, 11, 0.08))',
              border: '1px solid rgba(252, 209, 22, 0.2)',
            }}
          >
            {theme === 'dark' ? '\u{1F319}' : '\u{2600}\u{FE0F}'}
          </div>
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Appearance</h3>
        </div>
        <div
          className="flex items-center justify-between p-3.5 rounded-2xl"
          style={{
            background: 'var(--bg-card-inset)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-base">{theme === 'dark' ? '\u{1F319}' : '\u{2600}\u{FE0F}'}</span>
            <div>
              <div className="text-sm font-medium">Theme</div>
              <div className="text-[11px] text-text-muted">{theme === 'dark' ? 'Dark mode' : 'Light mode'}</div>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="relative w-11 h-6 rounded-full"
            style={{
              background: theme === 'light'
                ? 'linear-gradient(135deg, #006B3F, #34D399)'
                : 'rgba(148, 163, 184, 0.12)',
              boxShadow: theme === 'light' ? '0 0 12px rgba(0, 107, 63, 0.2)' : 'none',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <div
              className="absolute top-0.5 w-5 h-5 rounded-full bg-white"
              style={{
                transform: theme === 'light' ? 'translateX(22px)' : 'translateX(2px)',
                transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
              }}
            />
          </button>
        </div>
      </div>

      {/* Sound Toggle */}
      <div
        className="card-inset-interactive flex items-center justify-between mt-3 mb-5"
      >
        <div className="flex items-center gap-3">
          <span className="text-base">{soundOn ? '\uD83D\uDD0A' : '\uD83D\uDD07'}</span>
          <div>
            <div className="text-sm font-medium">Sound Effects</div>
            <div className="text-[11px] text-text-muted">{soundOn ? 'Chimes on check-in/out' : 'Muted'}</div>
          </div>
        </div>
        <button
          onClick={toggleSound}
          className="relative w-11 h-6 rounded-full"
          style={{
            background: soundOn
              ? 'linear-gradient(135deg, #006B3F, #34D399)'
              : 'rgba(148, 163, 184, 0.12)',
            boxShadow: soundOn ? '0 0 12px rgba(0, 107, 63, 0.2)' : 'none',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div
            className="absolute top-0.5 w-5 h-5 rounded-full bg-white"
            style={{
              transform: soundOn ? 'translateX(22px)' : 'translateX(2px)',
              transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
            }}
          />
        </button>
      </div>

      {/* AI Feature Toggles */}
      <div className="card mb-4">
        <div className="flex items-center gap-2.5 mb-5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
            style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(59, 130, 246, 0.1))',
              border: '1px solid rgba(139, 92, 246, 0.2)',
            }}
          >
            {'\u{1F9E0}'}
          </div>
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">AI Features</h3>
        </div>
        <div className="space-y-2.5 stagger-children">
          {features.map(({ key, label, desc, icon }) => (
            <div
              key={key}
              className="card-inset-interactive flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <span className="text-base">{icon}</span>
                <div>
                  <div className="text-sm font-medium">{label}</div>
                  <div className="text-[11px] text-text-muted">{desc}</div>
                </div>
              </div>
              <button
                onClick={() => toggleSetting(key)}
                className="relative w-11 h-6 rounded-full"
                style={{
                  background: aiSettings[key]
                    ? 'linear-gradient(135deg, #006B3F, #34D399)'
                    : 'rgba(148, 163, 184, 0.12)',
                  boxShadow: aiSettings[key] ? '0 0 12px rgba(0, 107, 63, 0.2)' : 'none',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <div
                  className="absolute top-0.5 w-5 h-5 rounded-full bg-white"
                  style={{
                    transform: aiSettings[key] ? 'translateX(22px)' : 'translateX(2px)',
                    transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                  }}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* WhatsApp Integration */}
      <div className="card mb-4">
        <div className="flex items-center gap-2.5 mb-5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
            style={{
              background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.15), rgba(18, 140, 67, 0.1))',
              border: '1px solid rgba(37, 211, 102, 0.2)',
            }}
          >
            {'\uD83D\uDCF1'}
          </div>
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">WhatsApp Integration</h3>
        </div>

        <div className="space-y-2.5">
          {/* Connection status */}
          <div
            className="flex items-center justify-between p-3.5 rounded-2xl"
            style={{
              background: 'var(--bg-card-inset)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div className="flex items-center gap-3">
              <span className="text-base">{'\uD83D\uDD17'}</span>
              <div>
                <div className="text-sm font-medium">Connection Status</div>
                <div className="text-[11px] text-text-muted">WhatsApp Business API via Meta Cloud API</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: waStatus === 'connected' ? '#25D366' : waStatus === 'checking' ? '#FCD116' : '#CE1126',
                  boxShadow: waStatus === 'connected' ? '0 0 8px rgba(37, 211, 102, 0.4)' : 'none',
                }}
              />
              <span className="text-[11px] font-medium" style={{ color: waStatus === 'connected' ? '#25D366' : waStatus === 'checking' ? '#FCD116' : '#CE1126' }}>
                {waStatus === 'connected' ? 'Connected' : waStatus === 'checking' ? 'Checking...' : 'Unreachable'}
              </span>
            </div>
          </div>

          {/* Webhook URL */}
          <div
            className="flex items-center justify-between p-3.5 rounded-2xl"
            style={{
              background: 'var(--bg-card-inset)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div className="flex items-center gap-3">
              <span className="text-base">{'\uD83C\uDF10'}</span>
              <div>
                <div className="text-sm font-medium">Webhook Endpoint</div>
                <div className="text-[11px] text-text-muted font-mono">/webhook/whatsapp</div>
              </div>
            </div>
          </div>

          {/* Features list */}
          <div
            className="p-3.5 rounded-2xl"
            style={{
              background: 'var(--bg-card-inset)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div className="flex items-center gap-3 mb-2.5">
              <span className="text-base">{'\u2699\uFE0F'}</span>
              <div className="text-sm font-medium">Bot Features</div>
            </div>
            <div className="space-y-1.5 ml-8">
              {[
                'Pre-registration via conversational flow',
                'QR code generation for quick check-in',
                'Appointment booking for executive offices',
                'Status check for existing registrations',
                'Office directory lookup',
                'Checkout reminders (3 PM daily)',
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-[12px] text-text-muted">
                  <span style={{ color: '#25D366' }}>{'\u2713'}</span>
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Office Management */}
      <div className="card">
        <div className="flex items-center gap-2.5 mb-5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 107, 63, 0.15), rgba(252, 209, 22, 0.1))',
              border: '1px solid rgba(0, 107, 63, 0.2)',
            }}
          >
            {'\u{1F3DB}\u{FE0F}'}
          </div>
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Office Management</h3>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="w-6 h-6 border-2 border-ghana-gold/30 border-t-ghana-gold rounded-full animate-spin mx-auto mb-2" />
            <p className="text-text-muted text-sm">Loading offices...</p>
          </div>
        ) : (
          <div className="space-y-5">
            {[
              { label: 'Executive', icon: OFFICE_TYPE_ICONS.executive, items: grouped.executive },
              { label: 'Directorates', icon: OFFICE_TYPE_ICONS.directorate, items: grouped.directorates },
              { label: 'Units', icon: OFFICE_TYPE_ICONS.unit, items: grouped.units },
            ].map(({ label, icon, items }) => (
              <div key={label}>
                <div className="text-[10px] text-text-muted uppercase tracking-widest mb-2.5 font-medium flex items-center gap-1.5">
                  {icon} {label}
                </div>
                <div className="space-y-2 stagger-children">
                  {items.map(office => (
                    <div
                      key={office.id}
                      className="card-inset-interactive flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <OfficePill abbreviation={office.abbreviation} type={office.office_type} />
                        <div>
                          <div className="text-sm">{office.full_name}</div>
                          <div className="text-[11px] text-text-muted">
                            {office.floor} &middot; Room {office.room} &middot; {office.head_officer}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: office.is_active ? '#34D399' : 'var(--text-muted)',
                            boxShadow: office.is_active ? '0 0 8px rgba(52, 211, 153, 0.4)' : 'none',
                          }}
                        />
                        <span
                          className="text-[11px] font-medium"
                          style={{ color: office.is_active ? '#34D399' : 'var(--text-muted)' }}
                        >
                          {office.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

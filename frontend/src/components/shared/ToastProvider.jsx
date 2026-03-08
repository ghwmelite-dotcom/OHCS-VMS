import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      gutter={8}
      toastOptions={{
        duration: 4000,
        style: {
          background: 'var(--bg-modal)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-separator)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: 'var(--shadow-modal)',
          borderRadius: '16px',
          padding: '12px 16px',
          fontSize: '14px',
          fontFamily: 'DM Sans, system-ui, sans-serif',
          maxWidth: '400px',
        },
        success: {
          iconTheme: {
            primary: '#006B3F',
            secondary: '#FFFFFF',
          },
          style: {
            borderColor: 'rgba(0, 107, 63, 0.2)',
          },
        },
        error: {
          iconTheme: {
            primary: '#CE1126',
            secondary: '#FFFFFF',
          },
          style: {
            borderColor: 'rgba(206, 17, 38, 0.2)',
          },
        },
      }}
    />
  );
}

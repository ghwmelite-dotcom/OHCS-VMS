import React from 'react';
import ReactDOM from 'react-dom/client';
import { LazyMotion, domAnimation } from 'framer-motion';
import App from './App';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import ToastProvider from './components/shared/ToastProvider';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LazyMotion features={domAnimation}>
      <ThemeProvider>
        <AuthProvider>
          <App />
          <ToastProvider />
        </AuthProvider>
      </ThemeProvider>
    </LazyMotion>
  </React.StrictMode>
);

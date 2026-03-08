/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
        'tablet': '768px',
        'laptop': '1024px',
      },
      colors: {
        'ghana-gold': '#FCD116',
        'ghana-green': '#006B3F',
        'ghana-red': '#CE1126',
        'accent-blue': '#3B82F6',
        'surface': 'rgba(17, 24, 39, 0.6)',
        'surface-solid': '#111827',
        'surface-border': 'rgba(30, 41, 59, 0.5)',
        'surface-hover': 'rgba(30, 41, 59, 0.3)',
        'bg-deep': '#0B1120',
        'bg-card': 'rgba(15, 23, 42, 0.65)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'office-directorate': '#006B3F',
        'office-unit': '#3B82F6',
        'office-executive': '#FCD116',
        'glass': 'rgba(15, 23, 42, 0.4)',
        'glass-border': 'rgba(148, 163, 184, 0.08)',
        'glass-hover': 'rgba(148, 163, 184, 0.05)',
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      borderRadius: {
        'card': '20px',
        'pill': '12px',
      },
      backdropBlur: {
        'glass': '20px',
        'glass-lg': '40px',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'glass-sm': '0 4px 16px rgba(0, 0, 0, 0.2)',
        'glow-gold': '0 0 20px rgba(252, 209, 22, 0.15), 0 0 60px rgba(252, 209, 22, 0.05)',
        'glow-green': '0 0 20px rgba(0, 107, 63, 0.2), 0 0 60px rgba(0, 107, 63, 0.05)',
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.15), 0 0 60px rgba(59, 130, 246, 0.05)',
        'glow-red': '0 0 20px rgba(206, 17, 38, 0.15)',
        'elevation-1': '0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.4)',
        'elevation-2': '0 4px 12px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.3)',
        'elevation-3': '0 12px 40px rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 8s ease-in-out 2s infinite',
        'gradient-shift': 'gradientShift 8s ease infinite',
        'border-glow': 'borderGlow 3s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) scale(1)' },
          '50%': { transform: 'translateY(-20px) scale(1.05)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        borderGlow: {
          '0%, 100%': { borderColor: 'rgba(148, 163, 184, 0.08)' },
          '50%': { borderColor: 'rgba(252, 209, 22, 0.15)' },
        },
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};

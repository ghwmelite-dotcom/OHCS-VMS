import { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import AnimatedCounter from '../shared/AnimatedCounter';
import SparklineChart from './SparklineChart';
import { staggerContainer, staggerItem, spring, cardHover } from '../../constants/motion';
import Skeleton from '../shared/Skeleton';

// Inline tilt for stat cards (desktop only)
function useTiltHandlers(maxDeg = 3, scale = 1.01, speed = 300) {
  const ref = useRef(null);
  const onMouseMove = useCallback((e) => {
    const el = ref.current;
    if (!el || window.matchMedia('(pointer: coarse)').matches) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    el.style.transform = `perspective(600px) rotateX(${(0.5 - y) * maxDeg * 2}deg) rotateY(${(x - 0.5) * maxDeg * 2}deg) scale(${scale})`;
    el.style.transition = `transform ${speed}ms cubic-bezier(0.03, 0.98, 0.52, 0.99)`;
  }, [maxDeg, scale, speed]);
  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = '';
    el.style.transition = `transform ${speed}ms cubic-bezier(0.03, 0.98, 0.52, 0.99)`;
  }, [speed]);
  return { ref, onMouseMove, onMouseLeave };
}

const statCards = [
  {
    key: 'total', label: "Today's Visitors", icon: UsersIcon,
    gradient: 'linear-gradient(135deg, rgba(252, 209, 22, 0.08), rgba(245, 158, 11, 0.04))',
    borderColor: 'rgba(252, 209, 22, 0.12)',
    glowColor: 'rgba(252, 209, 22, 0.06)',
    numColor: '#FCD116',
    iconColor: '#FCD116',
    sparkColor: '#FCD116',
  },
  {
    key: 'checkedIn', label: 'Checked In', icon: CheckInIcon,
    gradient: 'linear-gradient(135deg, rgba(0, 107, 63, 0.08), rgba(52, 211, 153, 0.04))',
    borderColor: 'rgba(0, 107, 63, 0.15)',
    glowColor: 'rgba(0, 107, 63, 0.06)',
    numColor: '#34D399',
    iconColor: '#34D399',
    sparkColor: '#34D399',
  },
  {
    key: 'preRegistered', label: 'Pre-Registered', icon: ClockIcon,
    gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(99, 102, 241, 0.04))',
    borderColor: 'rgba(59, 130, 246, 0.12)',
    glowColor: 'rgba(59, 130, 246, 0.06)',
    numColor: '#60A5FA',
    iconColor: '#60A5FA',
    sparkColor: '#60A5FA',
  },
  {
    key: 'checkedOut', label: 'Checked Out', icon: CheckOutIcon,
    gradient: 'linear-gradient(135deg, rgba(100, 116, 139, 0.06), rgba(148, 163, 184, 0.03))',
    borderColor: 'rgba(100, 116, 139, 0.1)',
    glowColor: 'transparent',
    numColor: '#94A3B8',
    iconColor: '#64748B',
    sparkColor: '#94A3B8',
  },
];

export default function StatsRow({ stats, weeklyTrends }) {
  if (!stats) return <Skeleton.StatsRow />;

  return (
    <motion.div
      className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {statCards.map((card) => (
        <TiltStatCard key={card.key} card={card} stats={stats} weeklyTrends={weeklyTrends} />
      ))}
    </motion.div>
  );
}

function TiltStatCard({ card, stats, weeklyTrends }) {
  const { key, label, icon: Icon, gradient, borderColor, glowColor, numColor, iconColor, sparkColor } = card;
  const { ref, onMouseMove, onMouseLeave } = useTiltHandlers(3, 1.01, 300);
  const trend = weeklyTrends?.[key] || [];
  const prev = trend.length >= 2 ? trend[trend.length - 2] : null;
  const curr = stats?.[key] ?? 0;
  const pctChange = prev != null && prev > 0 ? Math.round(((curr - prev) / prev) * 100) : null;

  return (
    <motion.div
      ref={ref}
      variants={staggerItem}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="relative overflow-hidden rounded-card p-5 group cursor-default"
      style={{
        background: gradient,
        border: `1px solid ${borderColor}`,
        backdropFilter: 'blur(20px)',
        boxShadow: `0 0 40px ${glowColor}, var(--shadow-card)`,
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-[1px]"
        style={{
          background: `linear-gradient(90deg, transparent, ${borderColor}, transparent)`,
          opacity: 'var(--top-line-opacity)',
        }}
      />
      <div className="flex items-center justify-between mb-1">
        <span className="text-text-secondary text-xs font-medium tracking-wide uppercase">{label}</span>
        <Icon style={{ color: iconColor }} />
      </div>
      <div className="flex items-end justify-between gap-2">
        <div>
          <div className="text-3xl font-bold font-mono" style={{ color: numColor, textShadow: 'var(--glow-gold-text)' }}>
            {stats?.[key] != null ? (
              <AnimatedCounter value={stats[key]} />
            ) : (
              <span className="text-text-muted">{'\u2014'}</span>
            )}
          </div>
          {pctChange != null && (
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[10px] font-bold font-mono" style={{ color: pctChange >= 0 ? '#34D399' : '#CE1126' }}>
                {pctChange >= 0 ? '\u2191' : '\u2193'} {Math.abs(pctChange)}%
              </span>
              <span className="text-[9px] text-text-muted">vs yesterday</span>
            </div>
          )}
        </div>
        {trend.length > 1 && (
          <div className="w-20 opacity-60 group-hover:opacity-100 transition-opacity">
            <SparklineChart data={trend} color={sparkColor} height={28} />
          </div>
        )}
      </div>
      <div
        className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(circle, ${glowColor}, transparent)` }}
      />
    </motion.div>
  );
}

function UsersIcon({ style }) {
  return (
    <svg className="w-5 h-5" style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}

function CheckInIcon({ style }) {
  return (
    <svg className="w-5 h-5" style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
  );
}

function ClockIcon({ style }) {
  return (
    <svg className="w-5 h-5" style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function CheckOutIcon({ style }) {
  return (
    <svg className="w-5 h-5" style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
    </svg>
  );
}

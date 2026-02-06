export default function FloatingOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden" style={{ opacity: 'var(--orbs-opacity, 1)' }}>
      {/* Green orb - top left */}
      <div
        className="absolute animate-float"
        style={{
          top: '5%',
          left: '10%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 107, 63, 0.06) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      {/* Gold orb - bottom right */}
      <div
        className="absolute animate-float-delayed"
        style={{
          bottom: '10%',
          right: '5%',
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(252, 209, 22, 0.04) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      {/* Blue orb - center right */}
      <div
        className="absolute animate-float"
        style={{
          top: '40%',
          right: '20%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.03) 0%, transparent 70%)',
          filter: 'blur(50px)',
          animationDuration: '10s',
        }}
      />
    </div>
  );
}

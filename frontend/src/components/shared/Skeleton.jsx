// Skeleton loader system with shimmer animation

function Base({ className = '', style = {} }) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl ${className}`}
      style={{
        background: 'var(--bg-card-inset)',
        ...style,
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, var(--bg-card-inset-hover) 50%, transparent 100%)',
          animation: 'shimmer 1.8s linear infinite',
        }}
      />
    </div>
  );
}

function Line({ width = '100%', height = '14px', className = '' }) {
  return <Base className={className} style={{ width, height, borderRadius: '8px' }} />;
}

function Circle({ size = '40px', className = '' }) {
  return <Base className={className} style={{ width: size, height: size, borderRadius: '50%' }} />;
}

function Card({ className = '' }) {
  return (
    <div
      className={`rounded-card p-5 ${className}`}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-primary)',
      }}
    >
      <Line width="40%" height="12px" className="mb-4" />
      <Line width="100%" height="16px" className="mb-2" />
      <Line width="75%" height="16px" className="mb-2" />
      <Line width="60%" height="16px" />
    </div>
  );
}

// Dashboard-specific skeletons
function StatsRow() {
  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="rounded-card p-5"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-primary)',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <Line width="80px" height="10px" />
            <Base style={{ width: '20px', height: '20px', borderRadius: '6px' }} />
          </div>
          <Line width="60px" height="28px" />
        </div>
      ))}
    </div>
  );
}

function VisitorTable() {
  return (
    <div
      className="rounded-card overflow-hidden"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-primary)',
      }}
    >
      <div className="px-5 py-3.5" style={{ background: 'var(--bg-card-inset-deep)', borderBottom: '1px solid var(--border-secondary)' }}>
        <Line width="100%" height="10px" />
      </div>
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-5 py-3.5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <Circle size="32px" />
          <div className="flex-1">
            <Line width="120px" height="14px" className="mb-1" />
            <Line width="80px" height="10px" />
          </div>
          <Line width="60px" height="12px" />
          <Line width="50px" height="24px" />
        </div>
      ))}
    </div>
  );
}

function Chart() {
  return (
    <div
      className="rounded-card p-5"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-primary)',
      }}
    >
      <Line width="120px" height="12px" className="mb-6" />
      <div className="flex items-end gap-3 h-44">
        {[40, 65, 30, 80, 55, 70, 45].map((h, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <Base style={{ width: '100%', height: `${h}%`, borderRadius: '8px 8px 0 0' }} />
            <Line width="24px" height="10px" />
          </div>
        ))}
      </div>
    </div>
  );
}

function Insights() {
  return (
    <div
      className="rounded-card p-5"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-primary)',
      }}
    >
      <div className="flex items-center gap-2.5 mb-5">
        <Base style={{ width: '32px', height: '32px', borderRadius: '12px' }} />
        <Line width="100px" height="12px" />
      </div>
      {[...Array(3)].map((_, i) => (
        <div key={i} className="p-3.5 rounded-2xl mb-2.5" style={{ background: 'var(--bg-card-inset)', border: '1px solid var(--border-subtle)' }}>
          <div className="flex items-center justify-between mb-1.5">
            <Line width="80px" height="10px" />
            <Line width="40px" height="18px" />
          </div>
          <Line width="100%" height="6px" />
        </div>
      ))}
    </div>
  );
}

// Full Dashboard composite skeleton
function Dashboard() {
  return (
    <div>
      <StatsRow />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <Insights />
        <Card />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <Card />
        <Card />
      </div>
      <Chart />
    </div>
  );
}

// Analytics card skeleton
function AnalyticsCard({ className = '' }) {
  return (
    <div
      className={`rounded-card p-5 ${className}`}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-primary)',
      }}
    >
      <div className="flex items-center gap-2.5 mb-5">
        <Base style={{ width: '32px', height: '32px', borderRadius: '12px' }} />
        <Line width="120px" height="12px" />
      </div>
      <div className="space-y-3">
        <Line width="100%" height="14px" />
        <Line width="85%" height="14px" />
        <Line width="60%" height="14px" />
      </div>
      <div className="mt-4">
        <Base style={{ width: '100%', height: '120px', borderRadius: '12px' }} />
      </div>
    </div>
  );
}

const Skeleton = { Line, Circle, Card, Base, StatsRow, VisitorTable, Chart, Insights, Dashboard, AnalyticsCard };
export default Skeleton;

const GRADIENTS = [
  ['#006B3F', '#34D399'],
  ['#3B82F6', '#818CF8'],
  ['#FCD116', '#F59E0B'],
  ['#8B5CF6', '#C084FC'],
  ['#EC4899', '#F472B6'],
  ['#06B6D4', '#22D3EE'],
  ['#F97316', '#FB923C'],
  ['#10B981', '#6EE7B7'],
];

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function hashName(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export default function AvatarCircle({ name, size = 'md' }) {
  const initials = getInitials(name);
  const [from, to] = GRADIENTS[hashName(name || '') % GRADIENTS.length];
  const sizes = { sm: 32, md: 40, lg: 48 };
  const fontSizes = { sm: 11, md: 13, lg: 15 };
  const s = sizes[size];

  return (
    <div
      className="rounded-full flex items-center justify-center font-semibold text-white shrink-0 relative"
      style={{
        width: s,
        height: s,
        fontSize: fontSizes[size],
        background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
        boxShadow: `0 0 20px ${from}30, 0 4px 12px rgba(0,0,0,0.3)`,
      }}
    >
      {initials}
      {/* Subtle shine overlay */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%)',
        }}
      />
    </div>
  );
}

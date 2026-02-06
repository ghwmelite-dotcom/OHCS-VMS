const FLAG_STYLES = {
  returning: { bg: 'bg-accent-blue/15', text: 'text-accent-blue', border: 'border-accent-blue/30', label: 'Returning' },
  vip: { bg: 'bg-ghana-gold/15', text: 'text-ghana-gold', border: 'border-ghana-gold/30', label: 'VIP' },
  flagged: { bg: 'bg-ghana-red/15', text: 'text-ghana-red', border: 'border-ghana-red/30', label: 'Flagged' },
};

export default function AIFlagBadge({ flag }) {
  if (!flag || !FLAG_STYLES[flag]) return null;
  const style = FLAG_STYLES[flag];

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${style.bg} ${style.text} ${style.border}`}>
      {style.label}
    </span>
  );
}

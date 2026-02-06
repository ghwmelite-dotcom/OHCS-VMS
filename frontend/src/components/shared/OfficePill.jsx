const TYPE_CLASSES = {
  directorate: 'pill-directorate',
  unit: 'pill-unit',
  executive: 'pill-executive',
};

export default function OfficePill({ abbreviation, type, size = 'sm', glow = false }) {
  const baseClass = TYPE_CLASSES[type] || TYPE_CLASSES.directorate;
  const sizeClasses = size === 'lg' ? 'px-3.5 py-1.5 text-sm' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`${baseClass} ${sizeClasses} ${glow ? 'shadow-glow-gold' : ''}`}
    >
      {abbreviation}
    </span>
  );
}

import { useOffices } from '../../hooks/useOffices';

export default function OfficeFilter({ value, onChange }) {
  const { grouped, loading } = useOffices();

  return (
    <select
      className="select"
      value={value || ''}
      onChange={(e) => onChange(e.target.value || null)}
      disabled={loading}
    >
      <option value="">All Offices</option>
      {grouped.executive.length > 0 && (
        <optgroup label="Executive">
          {grouped.executive.map(o => (
            <option key={o.abbreviation} value={o.abbreviation}>
              {o.abbreviation} — {o.full_name}
            </option>
          ))}
        </optgroup>
      )}
      {grouped.directorates.length > 0 && (
        <optgroup label="Directorates">
          {grouped.directorates.map(o => (
            <option key={o.abbreviation} value={o.abbreviation}>
              {o.abbreviation} — {o.full_name}
            </option>
          ))}
        </optgroup>
      )}
      {grouped.units.length > 0 && (
        <optgroup label="Units">
          {grouped.units.map(o => (
            <option key={o.abbreviation} value={o.abbreviation}>
              {o.abbreviation} — {o.full_name}
            </option>
          ))}
        </optgroup>
      )}
    </select>
  );
}

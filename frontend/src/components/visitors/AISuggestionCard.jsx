import OfficePill from '../shared/OfficePill';
import ConfidenceBar from '../shared/ConfidenceBar';
import { OFFICE_TYPE_LABELS, OFFICE_TYPE_ICONS } from '../../constants/offices';

export default function AISuggestionCard({ suggestion, onAccept }) {
  if (!suggestion) return null;

  return (
    <div className="p-4 rounded-xl bg-accent-blue/10 border border-accent-blue/20 animate-fade-in-up">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-accent-blue text-sm font-medium">AI Routing Suggestion</span>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <OfficePill
              abbreviation={suggestion.office_abbreviation}
              type={suggestion.office_type}
              size="lg"
            />
            <span className="text-xs text-text-secondary">
              {OFFICE_TYPE_ICONS[suggestion.office_type]} {OFFICE_TYPE_LABELS[suggestion.office_type]}
            </span>
          </div>
          <p className="text-sm text-text-primary">{suggestion.office_full_name}</p>
          <p className="text-xs text-text-secondary mt-1">
            {suggestion.floor} &middot; Room {suggestion.room} &middot; Host: {suggestion.host}
          </p>
        </div>
        <button onClick={onAccept} className="btn-primary text-sm">
          Accept
        </button>
      </div>

      <div className="mt-3">
        <ConfidenceBar confidence={suggestion.confidence} />
      </div>

      {suggestion.reason && (
        <p className="text-xs text-text-secondary mt-2 italic">{suggestion.reason}</p>
      )}
    </div>
  );
}

import ConfidenceBar from '../shared/ConfidenceBar';
import LiveIndicator from '../shared/LiveIndicator';

export default function AIInsightsPanel({ prediction, anomalyCount }) {
  const insights = [];

  if (prediction) {
    insights.push({
      title: 'Predicted Visitors',
      value: prediction.predicted_count || prediction.predictedCount || '\u2014',
      confidence: prediction.confidence || 0,
      icon: '\u{1F52E}',
    });
    insights.push({
      title: 'Peak Hour',
      value: prediction.peak_hour != null ? `${prediction.peak_hour || prediction.peakHour}:00` : '\u2014',
      confidence: prediction.confidence || 0,
      icon: '\u{23F0}',
    });
    if (prediction.busiest_office || prediction.busiestOffice) {
      insights.push({
        title: 'Busiest Office',
        value: prediction.busiest_office || prediction.busiestOffice,
        confidence: prediction.confidence || 0,
        icon: '\u{1F3DB}\u{FE0F}',
      });
    }
  }

  if (anomalyCount != null) {
    insights.push({
      title: 'Anomalies (24h)',
      value: anomalyCount,
      confidence: null,
      icon: '\u{1F6A8}',
    });
  }

  return (
    <div className="card shimmer-border">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
            style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(59, 130, 246, 0.1))',
              border: '1px solid rgba(139, 92, 246, 0.2)',
            }}
          >
            {'\u{1F9E0}'}
          </div>
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">AI Insights</h3>
        </div>
        <LiveIndicator connected={true} />
      </div>

      {insights.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-text-muted text-sm">AI insights appear once data is collected.</p>
        </div>
      ) : (
        <div className="space-y-2.5 stagger-children">
          {insights.map((insight, i) => (
            <div
              key={i}
              className="p-3.5 rounded-2xl"
              style={{
                background: 'var(--bg-card-inset)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-text-muted flex items-center gap-1.5">
                  <span>{insight.icon}</span> {insight.title}
                </span>
                <span
                  className="text-lg font-bold font-mono"
                  style={{ color: '#FCD116', textShadow: 'var(--glow-gold-text)' }}
                >
                  {insight.value}
                </span>
              </div>
              {insight.confidence != null && (
                <ConfidenceBar confidence={insight.confidence} />
              )}
            </div>
          ))}
        </div>
      )}

      {(prediction?.staff_recommendation || prediction?.staffRecommendation) && (
        <div
          className="mt-3 p-3.5 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.06), rgba(139, 92, 246, 0.04))',
            border: '1px solid rgba(59, 130, 246, 0.1)',
          }}
        >
          <p className="text-xs leading-relaxed" style={{ color: '#818CF8' }}>
            {prediction.staff_recommendation || prediction.staffRecommendation}
          </p>
        </div>
      )}
    </div>
  );
}

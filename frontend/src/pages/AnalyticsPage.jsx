import Header from '../components/layout/Header';
import OfficeTraffic from '../components/analytics/OfficeTraffic';
import AnomalyDetection from '../components/analytics/AnomalyDetection';
import SentimentAnalysis from '../components/analytics/SentimentAnalysis';
import PredictiveAnalytics from '../components/analytics/PredictiveAnalytics';
import { useOfficeTraffic, useAnomalies, useSentiment, usePredictions } from '../hooks/useAnalytics';

export default function AnalyticsPage() {
  const { data: officeData } = useOfficeTraffic(7);
  const { data: anomalies } = useAnomalies();
  const { data: sentiment } = useSentiment();
  const { data: prediction } = usePredictions();

  return (
    <div>
      <Header title="AI Analytics" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <OfficeTraffic data={officeData} />
        <AnomalyDetection anomalies={anomalies} />
        <SentimentAnalysis data={sentiment} />
        <PredictiveAnalytics prediction={prediction} />
      </div>
    </div>
  );
}

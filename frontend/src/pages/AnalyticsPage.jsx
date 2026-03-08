import { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '../components/layout/Header';
import OfficeTraffic from '../components/analytics/OfficeTraffic';
import AnomalyDetection from '../components/analytics/AnomalyDetection';
import SentimentAnalysis from '../components/analytics/SentimentAnalysis';
import PredictiveAnalytics from '../components/analytics/PredictiveAnalytics';
import NLQueryBar from '../components/analytics/NLQueryBar';
import VisitorFlowSankey from '../components/analytics/VisitorFlowSankey';
import ReportSummary from '../components/analytics/ReportSummary';
import DataLoader from '../components/shared/DataLoader';
import Skeleton from '../components/shared/Skeleton';
import { useOfficeTraffic, useAnomalies, useSentiment, usePredictions } from '../hooks/useAnalytics';
import { staggerContainer, staggerItem } from '../constants/motion';

export default function AnalyticsPage() {
  const [days, setDays] = useState(7);
  const { data: officeData, loading: officeLoading } = useOfficeTraffic(days);
  const { data: anomalies, loading: anomalyLoading } = useAnomalies();
  const { data: sentiment, loading: sentimentLoading } = useSentiment();
  const { data: prediction, loading: predictionLoading } = usePredictions();

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      <motion.div variants={staggerItem}>
        <Header title="AI Analytics" />
      </motion.div>

      {/* Natural Language Query */}
      <motion.div variants={staggerItem} className="mb-4">
        <NLQueryBar />
      </motion.div>

      {/* Main grid */}
      <motion.div variants={staggerItem} className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <DataLoader loading={officeLoading} skeleton={<Skeleton.AnalyticsCard />}>
          <OfficeTraffic data={officeData} onPeriodChange={setDays} />
        </DataLoader>
        <DataLoader loading={anomalyLoading} skeleton={<Skeleton.AnalyticsCard />}>
          <AnomalyDetection anomalies={anomalies} />
        </DataLoader>
      </motion.div>

      <motion.div variants={staggerItem} className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <DataLoader loading={sentimentLoading} skeleton={<Skeleton.AnalyticsCard />}>
          <SentimentAnalysis data={sentiment} />
        </DataLoader>
        <DataLoader loading={predictionLoading} skeleton={<Skeleton.AnalyticsCard />}>
          <PredictiveAnalytics prediction={prediction} />
        </DataLoader>
      </motion.div>

      {/* Visitor Flow */}
      <motion.div variants={staggerItem} className="mb-4">
        <VisitorFlowSankey />
      </motion.div>

      {/* AI Report Summary */}
      <motion.div variants={staggerItem}>
        <ReportSummary />
      </motion.div>
    </motion.div>
  );
}

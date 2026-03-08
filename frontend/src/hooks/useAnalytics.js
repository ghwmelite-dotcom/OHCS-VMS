import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getDashboard, getWeeklyAnalytics, getOfficeTraffic, getAnomalies, getSentiment, getPredictions } from '../services/api';

export function useDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    setLoading(true);
    getDashboard()
      .then(setData)
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { refresh(); }, []);

  return { data, loading, refresh };
}

export function useWeeklyAnalytics() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWeeklyAnalytics()
      .then(d => setData(d.analytics || []))
      .catch(() => toast.error('Failed to load weekly analytics'))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}

export function useOfficeTraffic(days = 7) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOfficeTraffic(days)
      .then(d => setData(d.offices || []))
      .catch(() => toast.error('Failed to load office traffic'))
      .finally(() => setLoading(false));
  }, [days]);

  return { data, loading };
}

export function useAnomalies(limit = 20) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnomalies(limit)
      .then(d => setData(d.anomalies || []))
      .catch(() => toast.error('Failed to load anomalies'))
      .finally(() => setLoading(false));
  }, [limit]);

  return { data, loading };
}

export function useSentiment() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSentiment()
      .then(setData)
      .catch(() => toast.error('Failed to load sentiment data'))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}

export function usePredictions() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPredictions()
      .then(d => setData(d.prediction))
      .catch(() => toast.error('Failed to load predictions'))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}

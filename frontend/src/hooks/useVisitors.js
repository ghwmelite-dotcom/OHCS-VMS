import { useState, useEffect, useCallback } from 'react';
import { getTodayVisits, getVisitors } from '../services/api';

export function useTodayVisits(officeFilter) {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(() => {
    setLoading(true);
    getTodayVisits(officeFilter)
      .then(data => setVisits(data.visits || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [officeFilter]);

  useEffect(() => { refresh(); }, [refresh]);

  return { visits, loading, error, refresh };
}

export function useVisitorSearch(search, limit = 50) {
  const [visitors, setVisitors] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const doSearch = useCallback((searchTerm, offset = 0) => {
    setLoading(true);
    const params = { limit: String(limit), offset: String(offset) };
    if (searchTerm) params.search = searchTerm;
    getVisitors(params)
      .then(data => {
        setVisitors(data.visitors || []);
        setTotal(data.total || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [limit]);

  useEffect(() => {
    const timer = setTimeout(() => doSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search, doSearch]);

  return { visitors, total, loading, refresh: doSearch };
}

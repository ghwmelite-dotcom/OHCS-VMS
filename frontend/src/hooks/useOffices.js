import { useState, useEffect } from 'react';
import { getOffices } from '../services/api';

export function useOffices() {
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    getOffices()
      .then(data => { if (mounted) setOffices(data.offices || []); })
      .catch(err => { if (mounted) setError(err.message); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const grouped = {
    executive: offices.filter(o => o.office_type === 'executive'),
    directorates: offices.filter(o => o.office_type === 'directorate'),
    units: offices.filter(o => o.office_type === 'unit'),
  };

  return { offices, grouped, loading, error };
}

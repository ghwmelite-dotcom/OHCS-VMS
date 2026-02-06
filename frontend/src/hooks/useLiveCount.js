import { useState, useEffect, useRef } from 'react';

export function useLiveCount() {
  const [counts, setCounts] = useState({ total: 0, byOffice: {} });
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);

  useEffect(() => {
    function connect() {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${protocol}//${window.location.host}/api/live`);
      wsRef.current = ws;

      ws.onopen = () => setConnected(true);
      ws.onclose = () => {
        setConnected(false);
        // Reconnect after 3 seconds
        setTimeout(connect, 3000);
      };
      ws.onerror = () => ws.close();
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'counts') {
            setCounts(data.value);
          }
        } catch {}
      };
    }

    connect();
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  return { counts, connected };
}

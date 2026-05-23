import { useState, useCallback } from 'react';
import type { RealTimeMetrics } from '../mock/queues';
import { INITIAL_METRICS } from '../mock/queues';
import { useAutoRefresh } from './useAutoRefresh';

// TODO: wire fetchRealTimeMetrics() from supervisorService when APIs are ready
export function useLiveMetrics() {
  const [metrics, setMetrics] = useState<RealTimeMetrics>(INITIAL_METRICS);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const refresh = useCallback(() => {
    setMetrics(prev => ({
      contactsInQueue: Math.max(0, prev.contactsInQueue + (Math.random() > 0.5 ? 1 : -1)),
      agentsAvailable: Math.max(0, Math.min(8, prev.agentsAvailable + (Math.random() > 0.6 ? 1 : -1))),
      agentsOnContact: Math.max(0, Math.min(8, prev.agentsOnContact + (Math.random() > 0.5 ? 1 : -1))),
      oldestContactAge: Math.max(0, prev.oldestContactAge + Math.floor(Math.random() * 20 - 8)),
      serviceLevel: Math.max(60, Math.min(100, prev.serviceLevel + Math.floor(Math.random() * 4 - 1))),
      contactsToday: prev.contactsToday + (Math.random() > 0.8 ? 1 : 0),
    }));
    setLastRefresh(new Date());
  }, []);

  useAutoRefresh(refresh, 30_000);

  return { metrics, lastRefresh, refresh };
}

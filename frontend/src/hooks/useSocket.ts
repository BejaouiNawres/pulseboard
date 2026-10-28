import { useEffect, useRef, useCallback } from 'react';
import { getSocket } from '../services/socket';
import { Alert, Metric } from '../types';

interface UseSocketOptions {
  onMetric?: (metric: Metric) => void;
  onAlert?: (alert: Alert) => void;
  sources?: string[];
}

export const useSocket = ({ onMetric, onAlert, sources = [] }: UseSocketOptions) => {
  const socket = getSocket();
  const onMetricRef = useRef(onMetric);
  const onAlertRef = useRef(onAlert);

  // Keep refs updated
  useEffect(() => { onMetricRef.current = onMetric; }, [onMetric]);
  useEffect(() => { onAlertRef.current = onAlert; }, [onAlert]);

  useEffect(() => {
    // Subscribe to sources
    sources.forEach((source) => {
      socket.emit('subscribe:source', source);
    });

    // Listen to events
    const handleMetric = (metric: Metric) => onMetricRef.current?.(metric);
    const handleAlert = (alert: Alert) => onAlertRef.current?.(alert);

    socket.on('metric:feed', handleMetric);
    socket.on('alert:triggered', handleAlert);

    return () => {
      socket.off('metric:feed', handleMetric);
      socket.off('alert:triggered', handleAlert);
      sources.forEach((source) => {
        socket.emit('unsubscribe:source', source);
      });
    };
  }, [sources.join(',')]);

  const subscribeToSource = useCallback((source: string) => {
    socket.emit('subscribe:source', source);
  }, []);

  return { socket, subscribeToSource };
};

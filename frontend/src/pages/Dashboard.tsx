import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '../components/Navbar';
import { MetricCard } from '../components/MetricCard';
import { MetricChart } from '../components/MetricChart';
import { AlertList } from '../components/AlertList';
import { useSocket } from '../hooks/useSocket';
import api from '../services/api';
import { Alert, Metric } from '../types';

const METRIC_COLORS: Record<string, string> = {
  cpu_usage: '#6366F1',
  temperature: '#F59E0B',
  memory_usage: '#10B981',
  response_time: '#3B82F6',
};

const METRIC_UNITS: Record<string, string> = {
  cpu_usage: '%',
  temperature: '°C',
  memory_usage: '%',
  response_time: 'ms',
};

export const Dashboard = () => {
  const [liveMetrics, setLiveMetrics] = useState<Record<string, Metric[]>>({});
  const [liveAlerts, setLiveAlerts] = useState<Alert[]>([]);

  // Fetch historical metrics
  const { data: metrics = [] } = useQuery<Metric[]>({
    queryKey: ['metrics'],
    queryFn: async () => {
      const { data } = await api.get('/metrics?limit=200');
      return data;
    },
    refetchInterval: 30_000,
  });

  // Fetch active alerts
  const { data: alerts = [] } = useQuery<Alert[]>({
    queryKey: ['alerts'],
    queryFn: async () => {
      const { data } = await api.get('/alerts/active');
      return data;
    },
  });

  // Fetch available sources
  const { data: sources = [] } = useQuery<string[]>({
    queryKey: ['sources'],
    queryFn: async () => {
      const { data } = await api.get('/metrics/sources');
      return data;
    },
  });

  // Handle incoming real-time metric
  const handleMetric = useCallback((metric: Metric) => {
    setLiveMetrics((prev) => {
      const key = `${metric.source}:${metric.name}`;
      const existing = prev[key] || [];
      return {
        ...prev,
        [key]: [...existing.slice(-49), metric], // keep last 50
      };
    });
  }, []);

  // Handle incoming alert
  const handleAlert = useCallback((alert: Alert) => {
    setLiveAlerts((prev) => [alert, ...prev].slice(0, 10));
  }, []);

  useSocket({ onMetric: handleMetric, onAlert: handleAlert, sources });

  // Group historical metrics by name
  const metricsByName = metrics.reduce<Record<string, Metric[]>>((acc, m) => {
    if (!acc[m.name]) acc[m.name] = [];
    acc[m.name].push(m);
    return acc;
  }, {});

  // Get latest value per metric name
  const latestMetrics = Object.entries(metricsByName).map(([name, list]) => ({
    name,
    latest: list[0],
  }));

  const allAlerts = [...liveAlerts, ...alerts].slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Live Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">
              {sources.length} source{sources.length !== 1 ? 's' : ''} connected
            </p>
          </div>
          <span className="flex items-center gap-2 text-emerald-400 text-sm">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            Real-time
          </span>
        </div>

        {/* KPI Cards */}
        {latestMetrics.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {latestMetrics.map(({ name, latest }) => {
              const value = latest?.value ?? 0;
              const color =
                value > 85 ? 'red' : value > 70 ? 'yellow' : 'green';
              return (
                <MetricCard
                  key={name}
                  label={name.replace(/_/g, ' ').toUpperCase()}
                  value={value}
                  unit={METRIC_UNITS[name]}
                  color={color}
                  isLive
                />
              );
            })}
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {Object.entries(metricsByName).map(([name, data]) => (
            <MetricChart
              key={name}
              title={name.replace(/_/g, ' ')}
              metrics={data}
              color={METRIC_COLORS[name] || '#6366F1'}
              unit={METRIC_UNITS[name]}
            />
          ))}
        </div>

        {/* Active Alerts */}
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Active Alerts</h2>
            {liveAlerts.length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                {liveAlerts.length} new
              </span>
            )}
          </div>
          <AlertList alerts={allAlerts} />
        </div>

        {/* Empty state */}
        {metrics.length === 0 && sources.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            <p className="text-4xl mb-4">📡</p>
            <p className="text-lg font-medium text-slate-400">No data yet</p>
            <p className="text-sm mt-2">
              Push metrics to{' '}
              <code className="bg-slate-800 px-2 py-1 rounded text-indigo-400">
                POST /api/metrics
              </code>
            </p>
            <div className="mt-6 bg-slate-900 rounded-xl p-4 text-left max-w-md mx-auto">
              <p className="text-xs text-slate-400 mb-2">Example:</p>
              <pre className="text-xs text-emerald-400">
{`curl -X POST http://localhost:3000/api/metrics \\
  -H "Content-Type: application/json" \\
  -d '{
    "source": "server-01",
    "name": "cpu_usage",
    "value": 78.5,
    "unit": "%"
  }'`}
              </pre>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

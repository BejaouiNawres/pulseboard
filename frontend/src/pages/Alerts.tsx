import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '../components/Navbar';
import { AlertList } from '../components/AlertList';
import api from '../services/api';
import { Alert } from '../types';

const SEVERITY_COLORS = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-blue-500',
};

export const Alerts = () => {
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('all');

  const { data: alerts = [], isLoading } = useQuery<Alert[]>({
    queryKey: ['alerts', 'all'],
    queryFn: async () => {
      const { data } = await api.get('/alerts');
      return data;
    },
    refetchInterval: 10_000,
  });

  const filtered = alerts.filter((a) => {
    if (filter === 'active') return a.status === 'active';
    if (filter === 'resolved') return a.status === 'resolved';
    return true;
  });

  const counts = {
    critical: alerts.filter((a) => a.severity === 'critical' && a.status === 'active').length,
    high: alerts.filter((a) => a.severity === 'high' && a.status === 'active').length,
    medium: alerts.filter((a) => a.severity === 'medium' && a.status === 'active').length,
    low: alerts.filter((a) => a.severity === 'low' && a.status === 'active').length,
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-white mb-8">Alerts</h1>

        {/* Severity summary */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {(Object.entries(counts) as [keyof typeof counts, number][]).map(
            ([severity, count]) => (
              <div key={severity} className="bg-slate-900 border border-slate-700 rounded-xl p-4 text-center">
                <div className={`w-3 h-3 rounded-full ${SEVERITY_COLORS[severity]} mx-auto mb-2`} />
                <div className="text-2xl font-bold text-white">{count}</div>
                <div className="text-xs text-slate-400 capitalize">{severity}</div>
              </div>
            ),
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {(['all', 'active', 'resolved'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                filter === f
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {f} ({f === 'all' ? alerts.length : alerts.filter((a) => a.status === f).length})
            </button>
          ))}
        </div>

        {/* Alert list */}
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
          {isLoading ? (
            <div className="text-center text-slate-400 py-8">Loading alerts...</div>
          ) : (
            <AlertList alerts={filtered} />
          )}
        </div>
      </main>
    </div>
  );
};

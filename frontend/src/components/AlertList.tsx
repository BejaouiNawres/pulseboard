import { Alert } from '../types';
import api from '../services/api';
import { useQueryClient } from '@tanstack/react-query';

interface AlertListProps {
  alerts: Alert[];
}

const severityColors = {
  low: 'border-blue-500 bg-blue-500/10 text-blue-400',
  medium: 'border-yellow-500 bg-yellow-500/10 text-yellow-400',
  high: 'border-orange-500 bg-orange-500/10 text-orange-400',
  critical: 'border-red-500 bg-red-500/10 text-red-400',
};

export const AlertList = ({ alerts }: AlertListProps) => {
  const queryClient = useQueryClient();

  const resolveAlert = async (id: string) => {
    await api.put(`/alerts/${id}/resolve`);
    queryClient.invalidateQueries({ queryKey: ['alerts'] });
  };

  if (alerts.length === 0) {
    return (
      <div className="text-center text-slate-500 py-8">
        ✅ No active alerts
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`border rounded-lg p-4 ${severityColors[alert.severity]}`}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold">{alert.source}</span>
                <span className="text-xs uppercase px-2 py-0.5 rounded border">
                  {alert.severity}
                </span>
              </div>
              <p className="text-sm text-slate-300">{alert.message}</p>
              <p className="text-xs text-slate-500 mt-1">
                {new Date(alert.createdAt).toLocaleString()}
              </p>
            </div>
            {alert.status === 'active' && (
              <button
                onClick={() => resolveAlert(alert.id)}
                className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded-lg"
              >
                Resolve
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

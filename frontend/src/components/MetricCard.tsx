interface MetricCardProps {
  label: string;
  value: number;
  unit?: string;
  color?: 'green' | 'yellow' | 'red' | 'blue';
  isLive?: boolean;
}

const colorMap = {
  green: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  yellow: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  red: 'text-red-400 bg-red-400/10 border-red-400/20',
  blue: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
};

export const MetricCard = ({
  label,
  value,
  unit,
  color = 'blue',
  isLive = false,
}: MetricCardProps) => {
  const colors = colorMap[color];

  return (
    <div className={`rounded-xl border p-4 ${colors}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-400">{label}</span>
        {isLive && (
          <span className="flex items-center gap-1 text-xs text-emerald-400">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            LIVE
          </span>
        )}
      </div>
      <div className="text-3xl font-bold">
        {value.toFixed(1)}
        {unit && <span className="text-lg ml-1 font-normal">{unit}</span>}
      </div>
    </div>
  );
};

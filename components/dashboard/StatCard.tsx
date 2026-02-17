import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | null;
  trendLabel?: string;
  accent?: 'default' | 'green' | 'red' | 'orange';
}

const ACCENT_STYLES = {
  default: {
    icon: 'bg-gray-100 text-gray-600',
    value: 'text-gray-900',
  },
  green: {
    icon: 'bg-emerald-50 text-emerald-600',
    value: 'text-emerald-600',
  },
  red: {
    icon: 'bg-red-50 text-red-600',
    value: 'text-red-600',
  },
  orange: {
    icon: 'bg-orange-50 text-orange-600',
    value: 'text-orange-600',
  },
};

export default function StatCard({
  label,
  value,
  subValue,
  icon: Icon,
  trend,
  trendLabel,
  accent = 'default',
}: StatCardProps) {
  const styles = ACCENT_STYLES[accent];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <div className="flex items-baseline gap-1.5">
            <p className={`text-2xl font-semibold ${styles.value}`}>{value}</p>
            {subValue && (
              <span className="text-sm text-gray-400">{subValue}</span>
            )}
          </div>
          {trend && trendLabel && (
            <div className="flex items-center gap-1">
              <span
                className={`text-xs font-medium ${
                  trend === 'down' ? 'text-emerald-600' : 'text-red-500'
                }`}
              >
                {trend === 'down' ? '\u2193' : '\u2191'} {trendLabel}
              </span>
              <span className="text-xs text-gray-400">vs last scan</span>
            </div>
          )}
        </div>
        <div className={`rounded-lg p-2.5 ${styles.icon}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-4 w-24 rounded bg-gray-200" />
          <div className="h-8 w-16 rounded bg-gray-200" />
        </div>
        <div className="h-10 w-10 rounded-lg bg-gray-200" />
      </div>
    </div>
  );
}

import React from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface StatsCardProps {
  label: string;
  value: string | number;
  maxValue?: string | number;
  comparison?: string;
  isPositive?: boolean;
  icon?: React.ReactNode;
}

export function StatsCard({
  label,
  value,
  maxValue,
  comparison,
  isPositive,
  icon,
}: StatsCardProps) {
  const { isDark } = useTheme() as any;

  return (
    <div
      className={`p-6 rounded-3xl border transition-all duration-300 ${
        isDark ? 'bg-card-dark border-white/5 shadow-sm' : 'bg-white border-slate-200 shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-1">
          <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {label}
          </p>
          <div className="flex items-baseline gap-1">
            <h2
              className={`text-4xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}
            >
              {value}
            </h2>
            {maxValue && (
              <span
                className={`text-xl font-medium ${isDark ? 'text-slate-600' : 'text-slate-300'}`}
              >
                /{maxValue}
              </span>
            )}
          </div>
        </div>
        {icon && (
          <div
            className={`p-3 rounded-2xl ${isDark ? 'bg-white/5 text-white' : 'bg-slate-50 text-slate-600'}`}
          >
            {icon}
          </div>
        )}
      </div>

      {comparison && (
        <div className="flex items-center mt-2">
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
              isPositive
                ? isDark
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-emerald-50 text-emerald-600'
                : isDark
                  ? 'bg-red-500/10 text-red-400'
                  : 'bg-red-50 text-red-600'
            }`}
          >
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {comparison}
          </div>
        </div>
      )}
    </div>
  );
}

export default StatsCard;

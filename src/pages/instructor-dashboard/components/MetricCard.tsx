import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

type MetricCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  gradient?: string;
};

export function MetricCard({
  title,
  value,
  icon,
  trend,
  gradient = 'from-indigo-500 to-purple-600',
}: MetricCardProps) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-white border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
      {/* Gradient background accent */}
      <div
        className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 rounded-full -mr-16 -mt-16`}
      />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-lg bg-gradient-to-br ${gradient} text-white`}>{icon}</div>
          {trend && (
            <div
              className={`flex items-center gap-1 text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}
            >
              {trend.isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {trend.value}
            </div>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default MetricCard;

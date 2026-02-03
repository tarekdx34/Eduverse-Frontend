import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface StatsCardProps {
  label: string;
  value: string | number;
  comparison?: string;
  isPositive?: boolean;
  icon?: React.ReactNode;
}

export function StatsCard({ label, value, comparison, isPositive, icon }: StatsCardProps) {
  const { isDark } = useTheme();

  return (
    <div className={`rounded-xl p-6 border shadow-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{label}</p>
          <div className="flex items-baseline gap-1">
            <span className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</span>
          </div>
        </div>
        {icon && (
          <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
            {icon}
          </div>
        )}
      </div>
      {comparison && (
        <div className="flex items-center justify-between">
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>vs last period</p>
          <div className={`px-3 py-1 rounded text-sm font-medium ${isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {comparison}
          </div>
        </div>
      )}
    </div>
  );
}

export default StatsCard;

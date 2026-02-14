import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

export function StatsCard({ label, value, comparison, isPositive }: { label: string; value: string | number; comparison?: string; isPositive?: boolean }) {
  const { isDark } = useTheme();
  const cardCls = isDark ? 'bg-gray-800 border-gray-700 shadow-sm' : 'bg-white border-gray-200 shadow-sm';
  const textCls = isDark ? 'text-gray-100' : 'text-gray-900';
  const mutedCls = isDark ? 'text-gray-400' : 'text-gray-600';
  const comparisonCls = isPositive
    ? isDark ? 'bg-green-900/30 text-green-300' : 'bg-green-50 text-green-700'
    : isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-red-700';
  return (
    <div className={`${cardCls} border rounded-lg p-6 hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className={`text-sm ${mutedCls} mb-2`}>{label}</p>
          <div className="flex items-baseline gap-1">
            <span className={`text-3xl font-bold ${textCls}`}>{value}</span>
          </div>
        </div>
        <div className={`w-5 h-5 ${mutedCls} cursor-pointer ${isDark ? 'hover:text-gray-100' : 'hover:text-gray-900'} text-center`}>⋯</div>
      </div>
      {comparison && (
        <div className="flex items-center justify-between">
          <p className={`text-sm ${mutedCls}`}>Compared To Last Term</p>
          <div className={`px-3 py-2 rounded text-sm font-medium ${comparisonCls}`}>{comparison}</div>
        </div>
      )}
    </div>
  );
}

export default StatsCard;

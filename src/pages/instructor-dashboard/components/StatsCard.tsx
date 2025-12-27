import React from 'react';

export function StatsCard({ label, value, comparison, isPositive }: { label: string; value: string | number; comparison?: string; isPositive?: boolean }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-gray-600 mb-2">{label}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-gray-900">{value}</span>
          </div>
        </div>
        <div className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600 text-center">⋯</div>
      </div>
      {comparison && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">Compared To Last Term</p>
          <div className={`px-3 py-2 rounded text-sm font-medium ${isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{comparison}</div>
        </div>
      )}
    </div>
  );
}

export default StatsCard;
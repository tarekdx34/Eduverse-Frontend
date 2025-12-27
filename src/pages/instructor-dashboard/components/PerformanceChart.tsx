import React from 'react';

type PerformanceChartProps = {
  data: Record<string, number>;
};

const GRADE_COLORS: Record<string, string> = {
  A: '#10b981', // green
  'A-': '#34d399',
  'B+': '#3b82f6', // blue
  B: '#60a5fa',
  'B-': '#93c5fd',
  'C+': '#f59e0b', // amber
  C: '#fbbf24',
  'C-': '#fcd34d',
  D: '#ef4444', // red
  F: '#dc2626',
};

export function PerformanceChart({ data }: PerformanceChartProps) {
  const total = Object.values(data).reduce((sum, count) => sum + count, 0);
  const maxCount = Math.max(...Object.values(data));

  return (
    <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Grade Distribution</h3>
        <div className="text-sm text-gray-500">Total: {total} students</div>
      </div>

      <div className="space-y-4">
        {Object.entries(data).map(([grade, count]) => {
          const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
          const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;
          const color = GRADE_COLORS[grade] || '#6b7280';

          return (
            <div key={grade} className="group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 text-sm font-semibold text-gray-700">{grade}</div>
                  <div className="text-xs text-gray-500">{percentage}%</div>
                </div>
                <div className="text-sm font-medium text-gray-700">{count} students</div>
              </div>

              <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-lg transition-all duration-500 ease-out group-hover:opacity-90"
                  style={{
                    width: `${barWidth}%`,
                    backgroundColor: color,
                  }}
                />
                <div className="absolute inset-0 flex items-center px-3">
                  <div className="text-xs font-medium text-white drop-shadow-sm">
                    {count > 0 && barWidth > 15 ? `${count}` : ''}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-gray-600">Excellent (A)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-gray-600">Good (B)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-gray-600">Average (C)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-gray-600">Below Average (D/F)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PerformanceChart;

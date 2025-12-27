import React from 'react';

type TrendPoint = {
  month: string;
  count: number;
};

type TrendChartProps = {
  data: TrendPoint[];
  title: string;
  color?: string;
};

export function TrendChart({ data, title, color = '#6366f1' }: TrendChartProps) {
  const maxCount = Math.max(...data.map((p) => p.count), 1);
  const minCount = Math.min(...data.map((p) => p.count), 0);
  const range = maxCount - minCount || 1;

  return (
    <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-sm text-gray-500">Enrollment Count</span>
        </div>
      </div>

      <div className="relative">
        {/* Chart area */}
        <div className="h-64 flex items-end justify-between gap-2 relative">
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="border-t border-gray-100" />
            ))}
          </div>

          {/* Bars with gradient */}
          {data.map((point, index) => {
            const heightPercent = ((point.count - minCount) / range) * 100;
            const isHighest = point.count === maxCount;

            return (
              <div
                key={point.month}
                className="flex-1 flex flex-col items-center gap-2 relative group"
              >
                {/* Bar */}
                <div className="w-full flex flex-col justify-end" style={{ height: '240px' }}>
                  <div
                    className="w-full rounded-t-lg transition-all duration-300 relative overflow-hidden group-hover:opacity-90"
                    style={{
                      height: `${heightPercent}%`,
                      background: `linear-gradient(to top, ${color}, ${color}dd)`,
                      minHeight: '8px',
                    }}
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {point.count} students
                    </div>

                    {/* Value label */}
                    {isHighest && (
                      <div
                        className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-semibold"
                        style={{ color }}
                      >
                        {point.count}
                      </div>
                    )}
                  </div>
                </div>

                {/* Month label */}
                <div className="text-xs text-gray-600 font-medium">{point.month}</div>
              </div>
            );
          })}
        </div>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between -ml-12 text-xs text-gray-500">
          {[
            maxCount,
            Math.round(maxCount * 0.75),
            Math.round(maxCount * 0.5),
            Math.round(maxCount * 0.25),
            minCount,
          ].map((val, i) => (
            <div key={i} className="text-right">
              {val}
            </div>
          ))}
        </div>
      </div>

      {/* Stats summary */}
      <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-3 gap-4">
        <div>
          <div className="text-xs text-gray-500">Average</div>
          <div className="text-lg font-semibold text-gray-900">
            {Math.round(data.reduce((sum, p) => sum + p.count, 0) / data.length)}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Peak</div>
          <div className="text-lg font-semibold text-gray-900">{maxCount}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Growth</div>
          <div className="text-lg font-semibold text-green-600">
            +
            {data.length > 1
              ? Math.round(((data[data.length - 1].count - data[0].count) / data[0].count) * 100)
              : 0}
            %
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrendChart;

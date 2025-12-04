import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface GpaChartProps {
  data: Array<{
    semester: string;
    yourGpa: number;
    avgGpa: number;
  }>;
}

export default function GpaChart({ data }: GpaChartProps) {
  const currentYourGpa = data[data.length - 1]?.yourGpa || 0;
  const currentAvgGpa = data[data.length - 1]?.avgGpa || 0;

  return (
    <div className="col-span-2 bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Grade Point Average</h2>
          <p className="text-sm text-gray-600">Comparison between your GPA and Average Student GPA</p>
        </div>
        <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">All Semesters ▼</button>
      </div>

      {/* Legend */}
      <div className="flex gap-8 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-purple-500 rounded-full" />
          <span className="text-sm text-gray-600">Your GPA</span>
          <span className="font-semibold text-gray-900 ml-2">{currentYourGpa.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-pink-500 rounded-full" />
          <span className="text-sm text-gray-600">Average GPA</span>
          <span className="font-semibold text-gray-900 ml-2">{currentAvgGpa.toFixed(2)}</span>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="semester" tick={{ fontSize: 12, fill: '#9ca3af' }} />
          <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} />
          <Tooltip />
          <Line type="monotone" dataKey="yourGpa" stroke="#4f39f6" strokeWidth={2} dot={{ fill: '#4f39f6', r: 4 }} />
          <Line type="monotone" dataKey="avgGpa" stroke="#fb64b6" strokeWidth={2} dot={{ fill: '#fb64b6', r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

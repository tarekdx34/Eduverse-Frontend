interface StatsCardProps {
  label: string;
  value: string;
  maxValue: string;
  comparison: string;
  isPositive: boolean;
  icon?: string;
}

export default function StatsCard({ label, value, maxValue, comparison, isPositive }: StatsCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-gray-600 mb-2">{label}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-gray-900">{value}</span>
            <span className="text-2xl text-gray-400">/{maxValue}</span>
          </div>
        </div>
        <div className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600 text-center">⋯</div>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">Compared To Last Semester</p>
        <div className={`px-3 py-2 rounded text-sm font-medium ${isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{comparison}</div>
      </div>
    </div>
  );
}

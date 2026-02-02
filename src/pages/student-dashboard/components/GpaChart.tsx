import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronDown } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

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
  const { isDark } = useTheme();

  return (
    <div className={`rounded-lg p-6 border mb-6 col-span-2 ${
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className={`mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Grade Point Average</h3>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Comparison between your GPA and Average Student GPA</p>
        </div>
        <button className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm ${
          isDark 
            ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
            : 'border-gray-200 text-gray-700 hover:bg-gray-50'
        }`}>
          All Semesters
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-6 mb-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Your GPA</span>
          </div>
          <span className={isDark ? 'text-white' : 'text-gray-900'}>{currentYourGpa.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-pink-400"></div>
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Average GPA</span>
          </div>
          <span className={isDark ? 'text-white' : 'text-gray-900'}>{currentAvgGpa.toFixed(2)}</span>
        </div>
      </div>

      <div className="text-center mb-4">
        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>2nd Semester 2025</span>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorYourGPA" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorAvgGPA" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#f0f0f0'} />
          <XAxis 
            dataKey="semester" 
            tick={{ fill: isDark ? '#9ca3af' : '#9ca3af', fontSize: 12 }}
            axisLine={{ stroke: isDark ? '#4b5563' : '#e5e7eb' }}
          />
          <YAxis 
            domain={[1.0, 4.0]}
            ticks={[1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0]}
            tick={{ fill: isDark ? '#9ca3af' : '#9ca3af', fontSize: 12 }}
            axisLine={{ stroke: isDark ? '#4b5563' : '#e5e7eb' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: isDark ? '#1f2937' : 'white', 
              border: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              color: isDark ? '#f3f4f6' : '#111827'
            }}
          />
          <Area
            type="monotone"
            dataKey="yourGpa"
            stroke="#6366f1"
            strokeWidth={2}
            fill="url(#colorYourGPA)"
            dot={{ fill: '#6366f1', r: 4 }}
          />
          <Area
            type="monotone"
            dataKey="avgGpa"
            stroke="#ec4899"
            strokeWidth={2}
            strokeDasharray="5 5"
            fill="url(#colorAvgGPA)"
            dot={{ fill: '#ec4899', r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

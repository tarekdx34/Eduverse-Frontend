import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { CleanSelect } from '../../../components/shared';

interface GpaChartProps {
  data: Array<{
    semester: string;
    yourGpa: number;
    avgGpa: number;
  }>;
  className?: string;
}

export default function GpaChart({ data, className = '' }: GpaChartProps) {
  const safeData = Array.isArray(data) ? data : [];
  const hasTrendData = safeData.length > 1;
  const hasAnyGpaData = safeData.some((point) => point.yourGpa > 0 || point.avgGpa > 0);
  const currentYourGpa = safeData[safeData.length - 1]?.yourGpa || 0;
  const currentAvgGpa = safeData[safeData.length - 1]?.avgGpa || 0;
  const { isDark, primaryHex } = useTheme() as any;
  const accentColor = primaryHex || '#3b82f6';
  const { t } = useLanguage();

  return (
    <div
      className={`p-8 rounded-3xl border transition-all duration-300 h-full ${
        isDark
          ? 'bg-card-dark border-white/5 shadow-xl shadow-black/20'
          : 'bg-white border-slate-200 shadow-sm'
      } ${className}`}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <h3 className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {t('gradePointAverage') || 'GPA Performance'}
          </h3>
          <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} text-sm mb-0`}>
            {t('gpaComparison') || 'Academic growth over last 4 semesters'}
          </p>
        </div>
        <CleanSelect>
          <option value="all">{t('allSemesters') || 'All Semesters'}</option>
        </CleanSelect>
      </div>

      <ResponsiveContainer width="100%" height={hasTrendData ? 300 : 240}>
        <AreaChart data={safeData}>
          <defs>
            <linearGradient id="colorYourGPA" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={accentColor} stopOpacity={0.15} />
              <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorAvgGPA" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ec4899" stopOpacity={0.12} />
              <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'}
            vertical={false}
          />
          <XAxis
            dataKey="semester"
            tick={{ fill: isDark ? '#64748b' : '#94a3b8', fontSize: 11, fontWeight: 700 }}
            axisLine={false}
            tickLine={false}
            dy={10}
          />
          <YAxis
            domain={[0, 4.0]}
            ticks={[0, 1.0, 2.0, 3.0, 4.0]}
            tick={{ fill: isDark ? '#64748b' : '#94a3b8', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#1e1e22' : '#ffffff',
              border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
              borderRadius: '1rem',
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
              color: isDark ? '#f1f5f9' : '#1e293b',
            }}
            formatter={(value: number, name: string) => [
              Number(value).toFixed(2),
              name === 'avgGpa' ? t('averageGPA') || 'Average GPA' : t('yourGPA') || 'Your GPA',
            ]}
          />
          <Area
            type="monotone"
            dataKey="yourGpa"
            name={t('yourGPA') || 'Your GPA'}
            stroke={accentColor}
            strokeWidth={4}
            fill="url(#colorYourGPA)"
            dot={{ fill: accentColor, r: hasTrendData ? 5 : 7, strokeWidth: 0 }}
            activeDot={{
              fill: accentColor,
              r: hasTrendData ? 7 : 9,
              stroke: isDark ? '#16161a' : 'white',
              strokeWidth: 2,
            }}
          />
          <Area
            type="monotone"
            dataKey="avgGpa"
            name={t('averageGPA') || 'Average GPA'}
            stroke="#ec4899"
            strokeWidth={3}
            fill="url(#colorAvgGPA)"
            dot={{ fill: '#ec4899', r: hasTrendData ? 4 : 6, strokeWidth: 0 }}
            activeDot={{
              fill: '#ec4899',
              r: hasTrendData ? 6 : 8,
              stroke: isDark ? '#16161a' : 'white',
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
      {!hasTrendData && hasAnyGpaData && (
        <p className={`text-xs mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Only one semester is available right now. The trend line will become clearer once more
          semester GPA records are added.
        </p>
      )}
      {!hasAnyGpaData && (
        <p className={`text-xs mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          No GPA data yet. Values will appear after graded coursework is available.
        </p>
      )}

      <div className="mt-8 flex gap-8">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: accentColor }}></div>
          <span className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {t('yourGPA') || 'Your GPA'}:{' '}
            <span className={`text-lg ml-1 font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {currentYourGpa.toFixed(2)}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-[#ec4899]"></div>
          <span className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {t('averageGPA') || 'Average'}:{' '}
            <span
              className={`text-lg ml-1 font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}
            >
              {currentAvgGpa.toFixed(2)}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

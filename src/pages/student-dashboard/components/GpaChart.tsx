import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

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
  const { t } = useLanguage();

  return (
    <div className={`p-8 rounded-[2.5rem] relative overflow-hidden mb-0 ${
      isDark ? 'bg-card-dark border border-white/5' : 'glass'
    }`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <h3 className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>
            {t('gradePointAverage') || 'GPA Performance'}
          </h3>
          <p className="text-slate-500 text-sm mb-0">
            {t('gpaComparison') || 'Academic growth over last 4 semesters'}
          </p>
        </div>
        <select className={`border-none rounded-xl text-sm font-semibold px-4 py-2 focus:ring-[#7C3AED] cursor-pointer ${
          isDark ? 'bg-white/5 text-slate-300' : 'glass text-slate-800'
        }`}>
          <option className={isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'}>{t('allSemesters') || 'All Semesters'}</option>
        </select>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorYourGPA" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7C3AED" stopOpacity={isDark ? 0.15 : 0.2}/>
              <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="lineGradientStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#7C3AED"/>
              <stop offset="100%" stopColor="#ec4899"/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4" stroke={isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'} />
          <XAxis 
            dataKey="semester" 
            tick={{ fill: isDark ? '#64748b' : '#94a3b8', fontSize: 11, fontWeight: 700 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            domain={[1.0, 4.0]}
            ticks={[1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0]}
            tick={{ fill: isDark ? '#64748b' : '#94a3b8', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: isDark ? '#16161a' : 'rgba(255,255,255,0.9)', 
              border: isDark ? '1px solid rgba(255,255,255,0.05)' : 'none',
              borderRadius: '1rem',
              boxShadow: '0 10px 40px -10px rgba(0,0,0,0.3)',
              backdropFilter: 'blur(12px)',
              color: isDark ? '#f1f5f9' : '#1e293b',
              padding: '12px 16px'
            }}
          />
          <Area
            type="monotone"
            dataKey="yourGpa"
            stroke={isDark ? 'url(#lineGradientStroke)' : '#7C3AED'}
            strokeWidth={4}
            fill="url(#colorYourGPA)"
            dot={{ fill: '#7C3AED', r: 5, strokeWidth: 0 }}
            activeDot={{ fill: isDark ? '#ec4899' : '#7C3AED', r: 7, stroke: isDark ? '#0a0a0c' : 'white', strokeWidth: 2 }}
            style={{ filter: isDark ? 'drop-shadow(0 0 6px rgba(99, 102, 241, 0.4))' : 'drop-shadow(0 0 8px rgba(124, 58, 237, 0.6))' }}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-10 flex gap-8">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-[#7C3AED] neon-glow-primary"></div>
          <span className="text-sm font-semibold">
            {t('yourGPA') || 'Your GPA'}: <span className="text-lg">{currentYourGpa.toFixed(2)}</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-[#ec4899] neon-glow-accent"></div>
          <span className="text-sm font-semibold text-slate-500">
            {t('averageGPA') || 'Average'}: <span className="text-lg">{currentAvgGpa.toFixed(2)}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

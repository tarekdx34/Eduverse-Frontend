import React, { useState } from 'react';
import {
  Users,
  FileText,
  ArrowRight,
  Sparkles,
  TrendingUp,
  MapPin,
  Clock,
  BookOpen,
  Upload,
  CheckSquare,
  Headphones,
  BarChart2,
  Zap,
  Database,
  GraduationCap,
} from 'lucide-react';
import {
  BarChart,
  Bar,
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

type DashboardProps = {
  stats: any;
  sections: any[];
  upcomingClasses: any[];
  recentActivity: any[];
  pendingTasks: any[];
  onNavigate: (tab: string) => void;
};

export function ModernDashboard({
  stats,
  sections,
  upcomingClasses,
  recentActivity,
  pendingTasks,
  onNavigate,
}: DashboardProps) {
  const { isDark, primaryColor = 'blue' } = useTheme() as any;
  const { t, isRTL } = useLanguage();

  const themeColors: Record<string, any> = {
    blue: {
      light: '#93c5fd',
      main: '#3b82f6',
      dark: '#2563eb',
      darker: '#1d4ed8',
      bg50: 'bg-blue-50',
      bg10: 'bg-blue-500/10',
      bg900: 'bg-blue-900',
      border800: 'border-blue-800',
      text300: 'text-blue-300',
      text500: 'text-blue-500',
      text600: 'text-blue-600',
      darkText400: 'dark:text-blue-400',
      hover50: 'hover:bg-blue-50/50',
      hover600: 'hover:text-blue-600',
      colors: ['bg-blue-500', 'bg-blue-600', 'bg-blue-400', 'bg-blue-700', 'bg-blue-300'],
      gradientEvyLight: 'rgba(59,130,246,0.15), rgba(96,165,250,0.10)',
      gradientEvyDark: '#3b82f6, #60a5fa',
      coursesGradient1: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
      coursesGradient2: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      coursesGradient3: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
      coursesGradient4: 'linear-gradient(135deg, #93c5fd 0%, #60a5fa 100%)',
    },
    emerald: {
      light: '#6ee7b7',
      main: '#10b981',
      dark: '#059669',
      darker: '#047857',
      bg50: 'bg-emerald-50',
      bg10: 'bg-emerald-500/10',
      bg900: 'bg-emerald-900',
      border800: 'border-emerald-800',
      text300: 'text-emerald-300',
      text500: 'text-emerald-500',
      text600: 'text-emerald-600',
      darkText400: 'dark:text-emerald-400',
      hover50: 'hover:bg-emerald-50/50',
      hover600: 'hover:text-emerald-600',
      colors: [
        'bg-emerald-500',
        'bg-emerald-600',
        'bg-emerald-400',
        'bg-emerald-700',
        'bg-emerald-300',
      ],
      gradientEvyLight: 'rgba(16,185,129,0.15), rgba(110,231,183,0.10)',
      gradientEvyDark: '#10b981, #6ee7b7',
      coursesGradient1: 'linear-gradient(135deg, #6ee7b7 0%, #10b981 100%)',
      coursesGradient2: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      coursesGradient3: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
      coursesGradient4: 'linear-gradient(135deg, #a7f3d0 0%, #6ee7b7 100%)',
    },
    violet: {
      light: '#93c5fd',
      main: '#3b82f6',
      dark: '#2563eb',
      darker: '#1d4ed8',
      bg50: 'bg-blue-50',
      bg10: 'bg-blue-500/10',
      bg900: 'bg-blue-900',
      border800: 'border-blue-800',
      text300: 'text-blue-300',
      text500: 'text-blue-500',
      text600: 'text-blue-600',
      darkText400: 'dark:text-blue-400',
      hover50: 'hover:bg-blue-50/50',
      hover600: 'hover:text-blue-600',
      colors: ['bg-blue-500', 'bg-blue-600', 'bg-blue-400', 'bg-blue-700', 'bg-blue-300'],
      gradientEvyLight: 'rgba(59,130,246,0.15), rgba(147,197,253,0.10)',
      gradientEvyDark: '#3b82f6, #93c5fd',
      coursesGradient1: 'linear-gradient(135deg, #93c5fd 0%, #3b82f6 100%)',
      coursesGradient2: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      coursesGradient3: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
      coursesGradient4: 'linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%)',
    },
    rose: {
      light: '#fda4af',
      main: '#f43f5e',
      dark: '#e11d48',
      darker: '#be123c',
      bg50: 'bg-rose-50',
      bg10: 'bg-rose-500/10',
      bg900: 'bg-rose-900',
      border800: 'border-rose-800',
      text300: 'text-rose-300',
      text500: 'text-rose-500',
      text600: 'text-rose-600',
      darkText400: 'dark:text-rose-400',
      hover50: 'hover:bg-rose-50/50',
      hover600: 'hover:text-rose-600',
      colors: ['bg-rose-500', 'bg-rose-600', 'bg-rose-400', 'bg-rose-700', 'bg-rose-300'],
      gradientEvyLight: 'rgba(244,63,94,0.15), rgba(253,164,175,0.10)',
      gradientEvyDark: '#f43f5e, #fda4af',
      coursesGradient1: 'linear-gradient(135deg, #fda4af 0%, #f43f5e 100%)',
      coursesGradient2: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
      coursesGradient3: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
      coursesGradient4: 'linear-gradient(135deg, #ffe4e6 0%, #fda4af 100%)',
    },
    amber: {
      light: '#fcd34d',
      main: '#f59e0b',
      dark: '#d97706',
      darker: '#b45309',
      bg50: 'bg-amber-50',
      bg10: 'bg-amber-500/10',
      bg900: 'bg-amber-900',
      border800: 'border-amber-800',
      text300: 'text-amber-300',
      text500: 'text-amber-500',
      text600: 'text-amber-600',
      darkText400: 'dark:text-amber-400',
      hover50: 'hover:bg-amber-50/50',
      hover600: 'hover:text-amber-600',
      colors: ['bg-amber-500', 'bg-amber-600', 'bg-amber-400', 'bg-amber-700', 'bg-amber-300'],
      gradientEvyLight: 'rgba(245,158,11,0.15), rgba(252,211,77,0.10)',
      gradientEvyDark: '#f59e0b, #fcd34d',
      coursesGradient1: 'linear-gradient(135deg, #fcd34d 0%, #f59e0b 100%)',
      coursesGradient2: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      coursesGradient3: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
      coursesGradient4: 'linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%)',
    },
  };

  const th = themeColors[primaryColor] || themeColors.blue;

  const courses = [
    {
      id: 1,
      name: 'Introduction to Programming',
      code: 'CS101',
      students: 120,
      assignments: 7,
      background: th.coursesGradient1,
      icon: GraduationCap,
      color: th.main,
    },
    {
      id: 2,
      name: 'Data Structures',
      code: 'CS202',
      students: 100,
      assignments: 6,
      background: th.coursesGradient1,
      icon: BarChart2,
      color: th.main,
    },
    {
      id: 3,
      name: 'Advanced Algorithms',
      code: 'CS303',
      students: 90,
      assignments: 5,
      background: th.coursesGradient1,
      icon: Zap,
      color: th.main,
    },
    {
      id: 4,
      name: 'Databases',
      code: 'CS303',
      students: 90,
      assignments: 5,
      background: th.coursesGradient1,
      icon: Database,
      color: th.main,
    },
  ];

  const performanceData = [
    { course: 'Calc I', value: 85 },
    { course: 'Physics', value: 78 },
    { course: 'CS', value: 92 },
    { course: 'Logic', value: 88 },
  ];

  const engagementData = [
    { week: 'Week 1', value: 68 },
    { week: 'Week 2', value: 75 },
    { week: 'Week 3', value: 70 },
    { week: 'Week 4', value: 78 },
  ];

  const statCardClass = isDark
    ? 'bg-card-dark border border-white/5 hover:border-white/20'
    : 'bg-white border border-slate-200 hover:border-slate-300';

  const cardClass = isDark ? 'bg-card-dark border border-white/5' : 'glass';

  const activityColors = [
    'bg-violet-500',
    'bg-blue-500',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-rose-500',
  ];

  return (
    <div className="space-y-6">
      {/* ── Evy — AI Teaching Assistant ── */}
      <div
        className={`rounded-3xl p-6 relative overflow-hidden transition-all duration-300 ${
          isDark
            ? 'bg-card-dark border border-white/5 shadow-2xl shadow-black/20'
            : 'bg-white border border-slate-200 shadow-sm'
        }`}
        style={{
          borderColor: isDark ? `${th.main}40` : `${th.main}60`,
          backgroundColor: isDark ? `${th.main}08` : `${th.main}05`,
          borderWidth: '1.5px',
        }}
      >
        <div className="relative flex items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`p-1.5 rounded-lg backdrop-blur-sm ${isDark ? 'bg-white/10' : 'bg-white shadow-sm'}`}
              >
                <Sparkles size={18} className={isDark ? th.text300 : th.text600} />
              </div>
              <h3
                className={`text-lg font-semibold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}
              >
                {t('evyAiTeachingAssistant')}
              </h3>
            </div>
            <p
              className={`text-sm leading-relaxed mb-5 max-w-xl ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
            >
              &ldquo;{t('evyAssistantQuote')}&rdquo;
            </p>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => onNavigate('ai')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
                  isDark
                    ? 'bg-white text-slate-800 hover:bg-gray-100'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                <Sparkles size={14} />
                {t('reviewInsights')}
              </button>
              <button
                className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isDark
                    ? 'bg-white/10 backdrop-blur-sm text-white hover:bg-white/20'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {t('dismiss')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 12-col Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column — 8 cols */}
        <div className="lg:col-span-8 space-y-6">
          {/* Course Performance Chart */}
          <div className={`rounded-[2rem] p-6 ${cardClass}`}>
            <h3 className={`text-lg font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('coursePerformance')}
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={performanceData}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={th.light} stopOpacity={1} />
                    <stop offset="100%" stopColor={th.dark} stopOpacity={1} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDark ? '#ffffff08' : '#f0f0f0'}
                  vertical={false}
                />
                <XAxis
                  dataKey="course"
                  tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                  axisLine={{ stroke: isDark ? '#374151' : '#e5e7eb' }}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                  axisLine={{ stroke: isDark ? '#374151' : '#e5e7eb' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#1e1e22' : 'white',
                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    color: isDark ? '#fff' : '#111',
                  }}
                  cursor={{ fill: 'rgba(59, 130, 246, 0.08)' }}
                />
                <Bar
                  dataKey="value"
                  fill="url(#barGradient)"
                  radius={[8, 8, 0, 0]}
                  animationDuration={1000}
                  animationBegin={0}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Student Engagement Chart */}
          <div className={`rounded-[2rem] p-6 ${cardClass}`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('studentEngagement')}
              </h3>
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  72%
                </span>
                <TrendingUp className={th.text500} size={20} />
                <span className={`text-sm ${th.text500} font-medium`}>+2%</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={engagementData}>
                <defs>
                  <linearGradient id="engagementGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={th.main} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={th.main} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#ffffff08' : '#f0f0f0'} />
                <XAxis
                  dataKey="week"
                  tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                  axisLine={{ stroke: isDark ? '#374151' : '#e5e7eb' }}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                  axisLine={{ stroke: isDark ? '#374151' : '#e5e7eb' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#1e1e22' : 'white',
                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    color: isDark ? '#fff' : '#111',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={th.main}
                  strokeWidth={3}
                  fill="url(#engagementGradient)"
                  dot={{
                    fill: th.main,
                    r: 5,
                    strokeWidth: 2,
                    stroke: isDark ? '#16161a' : '#fff',
                  }}
                  activeDot={{ r: 7 }}
                  animationDuration={1500}
                  animationBegin={0}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column — 4 cols */}
        <div className="lg:col-span-4 space-y-6">
          {/* Upcoming Teaching */}
          <div className={`rounded-[2.5rem] p-6 ${cardClass}`}>
            <h3 className={`text-base font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('upcomingTeaching')}
            </h3>
            <div className="space-y-2">
              {upcomingClasses.length > 0 ? (
                upcomingClasses.slice(0, 4).map((cls: any, index: number) => {
                  const location = cls.room || cls.location || 'TBD';
                  return (
                    <div
                      key={index}
                      className={`p-3 rounded-xl transition-colors ${isDark ? 'hover:bg-white/5' : th.hover50}`}
                    >
                      <div className="flex-1 min-w-0">
                        <h4
                          className={`font-medium text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}
                        >
                          {cls.title || cls.name}
                        </h4>
                        <div
                          className={`flex items-center gap-1 text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}
                        >
                          <MapPin size={12} />
                          <span className="truncate">{location}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {t('noUpcomingClasses')}
                </p>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className={`rounded-[2.5rem] p-6 ${cardClass}`}>
            <h3 className={`text-base font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('recentActivity')}
            </h3>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.slice(0, 5).map((activity: any, index: number) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-2.5 h-2.5 rounded-full mt-1.5 ${
                          th.colors[index % th.colors.length]
                        }`}
                      />
                      {index < recentActivity.slice(0, 5).length - 1 && (
                        <div
                          className={`w-px flex-1 min-h-[24px] ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pb-1">
                      <p
                        className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}
                      >
                        {activity.title || activity.message}
                      </p>
                      <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {activity.time || activity.date}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {t('noRecentActivity')}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModernDashboard;

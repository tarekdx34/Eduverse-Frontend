import React, { useState } from 'react';
import {
  Users,
  FileText,
  ArrowRight,
  Sparkles,
  TrendingUp,
  MapPin,
  Clock,
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
  const { isDark } = useTheme();
  const { t, isRTL } = useLanguage();

  const courses = [
    {
      id: 1,
      name: 'Introduction to Programming',
      code: 'CS101',
      students: 120,
      assignments: 7,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      image: '🎓',
      color: '#667eea',
    },
    {
      id: 2,
      name: 'Data Structures',
      code: 'CS202',
      students: 100,
      assignments: 6,
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      image: '📊',
      color: '#f093fb',
    },
    {
      id: 3,
      name: 'Advanced Algorithms',
      code: 'CS303',
      students: 90,
      assignments: 5,
      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      image: '⚡',
      color: '#4facfe',
    },
    {
      id: 4,
      name: 'Databases',
      code: 'CS303',
      students: 90,
      assignments: 5,
      background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      image: '🗄️',
      color: '#43e97b',
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

  const cardClass = isDark
    ? 'bg-card-dark border border-white/5'
    : 'glass';

  const activityColors = ['bg-violet-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500'];

  return (
    <div className="space-y-6">
      {/* ── Evy — AI Teaching Assistant ── */}
      <div className={`rounded-[2.5rem] p-8 relative overflow-hidden ${
        isDark
          ? 'bg-gradient-to-br from-slate-800 to-slate-700 border border-transparent'
          : 'bg-gradient-to-br from-slate-800 to-slate-700'
      }`}
        style={isDark ? {
          borderImage: 'linear-gradient(135deg, #7C3AED, #3b82f6) 1',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderRadius: '2.5rem',
          backgroundClip: 'padding-box',
        } : undefined}
      >
        {isDark && (
          <div className="absolute inset-0 rounded-[2.5rem] pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(59,130,246,0.10))',
            }}
          />
        )}
        <div className="relative flex items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                <Sparkles size={22} className="text-violet-300" />
              </div>
              <h3 className="text-xl font-bold text-white">{t('evyAiTeachingAssistant')}</h3>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed mb-6 max-w-xl">
              &ldquo;{t('evyAssistantQuote')}&rdquo;
            </p>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => onNavigate('ai')}
                className="px-5 py-2.5 bg-white text-slate-800 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                <Sparkles size={16} />
                {t('reviewInsights')}
              </button>
              <button className="px-5 py-2.5 bg-white/10 backdrop-blur-sm text-white rounded-xl text-sm font-medium hover:bg-white/20 transition-colors">
                {t('dismiss')}
              </button>
            </div>
          </div>
          <div className="hidden md:flex items-center">
            <div className="w-28 h-28 bg-white/5 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/10">
              <Sparkles size={44} className="text-violet-300/60" />
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
                    <stop offset="0%" stopColor="#a78bfa" stopOpacity={1} />
                    <stop offset="100%" stopColor="#7C3AED" stopOpacity={1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#ffffff08' : '#f0f0f0'} vertical={false} />
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
                  cursor={{ fill: 'rgba(124, 58, 237, 0.08)' }}
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
                <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>72%</span>
                <TrendingUp className="text-emerald-500" size={20} />
                <span className="text-sm text-emerald-500 font-medium">+2%</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={engagementData}>
                <defs>
                  <linearGradient id="engagementGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
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
                  stroke="#10b981"
                  strokeWidth={3}
                  fill="url(#engagementGradient)"
                  dot={{ fill: '#10b981', r: 5, strokeWidth: 2, stroke: isDark ? '#16161a' : '#fff' }}
                  activeDot={{ r: 7 }}
                  animationDuration={1500}
                  animationBegin={0}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Course Cards */}
          <div>
            <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('myCourses')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className={`rounded-[2rem] overflow-hidden transition-all hover:scale-[1.02] cursor-pointer ${cardClass}`}
                >
                  {/* Gradient header */}
                  <div
                    className="h-28 flex items-center justify-center text-5xl relative"
                    style={{ background: course.background }}
                  >
                    <span className="opacity-50 drop-shadow-lg">{course.image}</span>
                  </div>
                  {/* Color bar */}
                  <div className="h-1" style={{ backgroundColor: course.color }} />
                  {/* Info */}
                  <div className="p-5">
                    <h4 className={`font-semibold text-sm mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {course.name}
                    </h4>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`flex items-center gap-1.5 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        <Users size={13} />
                        <span>{course.students} {t('students')}</span>
                      </div>
                      <div className={`flex items-center gap-1.5 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        <FileText size={13} />
                        <span>{course.assignments} {t('assignments')}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onNavigate('courses')}
                      className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-indigo-500 hover:text-indigo-400 transition-colors"
                    >
                      {t('viewCourse')}
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column — 4 cols */}
        <div className="lg:col-span-4 space-y-6">
          {/* Upcoming Teaching */}
          <div className={`rounded-[2.5rem] p-6 ${cardClass}`}>
            <h3 className={`text-base font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('upcomingTeaching')}
            </h3>
            <div className="space-y-3">
              {upcomingClasses.length > 0 ? (
                upcomingClasses.slice(0, 4).map((cls: any, index: number) => {
                  const dateObj = cls.date ? new Date(cls.date) : new Date();
                  const month = dateObj.toLocaleString('en', { month: 'short' }).toUpperCase();
                  const day = dateObj.getDate();
                  const timeStr = cls.time || cls.startTime || dateObj.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
                  const location = cls.room || cls.location || 'TBD';
                  const colors = ['bg-violet-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500'];
                  return (
                    <div key={index} className={`flex items-start gap-3 p-3 rounded-2xl transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
                      <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center text-white text-xs font-bold shrink-0 ${colors[index % colors.length]}`}>
                        <span className="text-[10px] leading-none opacity-80">{month}</span>
                        <span className="text-base leading-tight">{day}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-medium text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {cls.title || cls.name}
                        </h4>
                        <div className={`flex items-center gap-1 text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          <Clock size={12} />
                          <span>{timeStr}</span>
                        </div>
                        <div className={`flex items-center gap-1 text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          <MapPin size={12} />
                          <span className="truncate">{location}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('noUpcomingClasses')}</p>
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
                      <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${activityColors[index % activityColors.length]}`} />
                      {index < recentActivity.slice(0, 5).length - 1 && (
                        <div className={`w-px flex-1 min-h-[24px] ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pb-1">
                      <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {activity.title || activity.message}
                      </p>
                      <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {activity.time || activity.date}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('noRecentActivity')}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModernDashboard;

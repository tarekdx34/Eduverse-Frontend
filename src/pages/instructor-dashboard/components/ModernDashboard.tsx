import React, { useState, useMemo } from 'react';
import {
  Users,
  FileText,
  ArrowRight,
  Sparkles,
  TrendingUp,
  MapPin,
  Clock,
  Calendar,
  BookOpen,
  Upload,
  CheckSquare,
  BarChart2,
  Zap,
  GraduationCap,
} from 'lucide-react';
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

type DashboardProps = {
  stats: any;
  sections: any[];
  upcomingClasses: any[];
  recentActivity: any[];
  pendingTasks: any[];
  performanceData?: any[];
  engagementData?: any[];
  onNavigate: (tab: string) => void;
};

export function ModernDashboard({
  stats,
  sections,
  upcomingClasses,
  recentActivity,
  pendingTasks,
  performanceData,
  engagementData,
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
      text500: 'text-blue-500',
      colors: ['bg-blue-500', 'bg-blue-600', 'bg-blue-400', 'bg-blue-700', 'bg-blue-300'],
      coursesGradient1: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
      coursesGradient2: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    },
    emerald: {
      light: '#6ee7b7',
      main: '#10b981',
      dark: '#059669',
      darker: '#047857',
      text500: 'text-emerald-500',
      colors: ['bg-emerald-500', 'bg-emerald-600', 'bg-emerald-400', 'bg-emerald-700', 'bg-emerald-300'],
      coursesGradient1: 'linear-gradient(135deg, #6ee7b7 0%, #10b981 100%)',
      coursesGradient2: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    },
    rose: {
      light: '#fda4af',
      main: '#f43f5e',
      dark: '#e11d48',
      darker: '#be123c',
      text500: 'text-rose-500',
      colors: ['bg-rose-500', 'bg-rose-600', 'bg-rose-400', 'bg-rose-700', 'bg-rose-300'],
      coursesGradient1: 'linear-gradient(135deg, #fda4af 0%, #f43f5e 100%)',
      coursesGradient2: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
    },
    amber: {
      light: '#fcd34d',
      main: '#f59e0b',
      dark: '#d97706',
      darker: '#b45309',
      text500: 'text-amber-500',
      colors: ['bg-amber-500', 'bg-amber-600', 'bg-amber-400', 'bg-amber-700', 'bg-amber-300'],
      coursesGradient1: 'linear-gradient(135deg, #fcd34d 0%, #f59e0b 100%)',
      coursesGradient2: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    },
  };

  const th = themeColors[primaryColor] || themeColors.blue;

  const defaultPerformanceData = [
    { course: 'Calc I', value: 85, engagement: 72 },
    { course: 'Physics', value: 78, engagement: 65 },
    { course: 'CS', value: 92, engagement: 88 },
    { course: 'Logic', value: 88, engagement: 80 },
  ];

  const defaultEngagementData = [
    { week: 'Week 1', value: 68 },
    { week: 'Week 2', value: 75 },
    { week: 'Week 3', value: 70 },
    { week: 'Week 4', value: 78 },
  ];

  const chartPerformanceData = useMemo(() => {
    const data = performanceData && performanceData.length > 0 ? performanceData : defaultPerformanceData;
    // Add simulated engagement to each course if not present
    return data.map((d, idx) => ({
      ...d,
      engagement: d.engagement || (70 + (idx * 5) % 25)
    }));
  }, [performanceData]);

  const chartEngagementData = engagementData && engagementData.length > 0 ? engagementData : defaultEngagementData;

  const currentEngagement = chartEngagementData[chartEngagementData.length - 1]?.value || 72;
  const prevEngagement = chartEngagementData[chartEngagementData.length - 2]?.value || 70;
  const engagementTrend = currentEngagement - prevEngagement;

  const statCardClass = isDark
    ? 'bg-card-dark border border-white/5 hover:border-white/20'
    : 'bg-white border border-slate-200 hover:border-slate-300';

  const cardClass = isDark ? 'bg-card-dark border border-white/5' : 'glass';

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat: any, idx: number) => (
          <div key={idx} className={`rounded-2xl p-5 transition-all duration-300 group ${statCardClass} hover:shadow-lg`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${isDark ? 'bg-white/10' : 'bg-slate-50'}`}>
                <stat.icon size={24} className={isDark ? 'text-white' : `text-${stat.color || 'blue'}-600`} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${stat.trend === 'up' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-500'}`}>
                {stat.trend === 'up' && <TrendingUp size={12} />}
                {stat.value ? (stat.change || '') : '--'}
              </div>
            </div>
            <div>
              <p className={`text-sm font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</p>
              <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Evy AI Assistant */}
      <div className={`rounded-3xl p-6 border-1.5 transition-all duration-300 ${isDark ? 'bg-card-dark border-white/5 shadow-2xl' : 'bg-white border-slate-200 shadow-sm'}`} 
           style={{ borderColor: isDark ? `${th.main}40` : `${th.main}60`, backgroundColor: isDark ? `${th.main}08` : `${th.main}05` }}>
        <div className="flex items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-1.5 rounded-lg backdrop-blur-sm ${isDark ? 'bg-white/10' : 'bg-white shadow-sm'}`}>
                <Sparkles size={18} className="text-blue-500" />
              </div>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('evyAiTeachingAssistant')}</h3>
            </div>
            <p className={`text-sm leading-relaxed mb-5 max-w-xl ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>&ldquo;{t('evyAssistantQuote')}&rdquo;</p>
            <div className="flex gap-3">
              <button onClick={() => onNavigate('ai')} className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 ${isDark ? 'bg-white text-slate-800' : 'bg-slate-900 text-white'}`}>
                <Sparkles size={14} /> {t('reviewInsights')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Performance & Engagement Chart */}
          <div className={`rounded-[2rem] p-6 ${cardClass}`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('coursePerformance')} & {t('engagement')}</h3>
              <div className="flex items-center gap-4 text-xs font-medium">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-blue-500" /><span className={isDark ? 'text-slate-400' : 'text-slate-600'}>{t('performance')}</span></div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-500" /><span className={isDark ? 'text-slate-400' : 'text-slate-600'}>{t('engagement')}</span></div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartPerformanceData}>
                <defs>
                  <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                  <linearGradient id="colorEngage" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#ffffff08' : '#f0f0f0'} vertical={false} />
                <XAxis dataKey="course" tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 11 }} axisLine={{ stroke: isDark ? '#374151' : '#e5e7eb' }} />
                <YAxis domain={[0, 100]} tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 11 }} axisLine={{ stroke: isDark ? '#374151' : '#e5e7eb' }} />
                <Tooltip contentStyle={{ backgroundColor: isDark ? '#1e1e22' : 'white', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e5e7eb', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fill="url(#colorPerf)" name={t('performance')} />
                <Area type="monotone" dataKey="engagement" stroke="#10b981" strokeWidth={3} fill="url(#colorEngage)" name={t('engagement')} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Student Engagement Chart */}
          <div className={`rounded-[2rem] p-6 ${cardClass}`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('studentEngagement')}</h3>
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{currentEngagement}%</span>
                <TrendingUp className="text-emerald-500" size={20} />
              </div>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={chartEngagementData}>
                <defs>
                  <linearGradient id="engagementGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={th.main} stopOpacity={0.3} /><stop offset="95%" stopColor={th.main} stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#ffffff08' : '#f0f0f0'} />
                <XAxis dataKey="week" tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }} axisLine={{ stroke: isDark ? '#374151' : '#e5e7eb' }} />
                <YAxis domain={[0, 100]} tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }} axisLine={{ stroke: isDark ? '#374151' : '#e5e7eb' }} />
                <Tooltip contentStyle={{ backgroundColor: isDark ? '#1e1e22' : 'white', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e5e7eb', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="value" stroke={th.main} strokeWidth={3} fill="url(#engagementGradient)" dot={{ fill: th.main, r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Upcoming Teaching */}
          <div className={`rounded-[2.5rem] p-6 ${cardClass}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('upcomingTeaching')} (Monthly)</h3>
              <button onClick={() => onNavigate('schedule')} className={`text-xs font-semibold ${th.text500} hover:underline flex items-center gap-1`}>
                View Full <ArrowRight size={12} />
              </button>
            </div>
            <div className="space-y-3">
              {upcomingClasses.length > 0 ? (
                upcomingClasses.map((item: any, idx: number) => (
                  <div key={item.id || idx} className={`p-3 rounded-xl transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${item.type === 'Lecture' ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                        {item.type === 'Lecture' ? <GraduationCap size={20} /> : <Zap size={20} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.title}</h4>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{item.dayOfWeek?.substring(0, 3)}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <div className={`flex items-center gap-1 text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}><Clock size={12} /> {item.time}</div>
                          {item.location && <div className={`flex items-center gap-1 text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}><MapPin size={12} /> {item.location}</div>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={`py-8 text-center text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No upcoming classes</div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className={`rounded-[2.5rem] p-6 ${cardClass}`}>
            <h3 className={`text-base font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('recentActivity')}</h3>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.slice(0, 5).map((activity: any, index: number) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${th.colors[index % th.colors.length]}`} />
                      {index < recentActivity.slice(0, 5).length - 1 && <div className={`w-px flex-1 min-h-[24px] ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />}
                    </div>
                    <div className="flex-1 min-w-0 pb-1">
                      <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{activity.title || activity.message}</p>
                      <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{activity.time || activity.date}</p>
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

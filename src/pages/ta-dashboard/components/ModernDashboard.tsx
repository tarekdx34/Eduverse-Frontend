import React from 'react';
import {
  Calendar,
  Users,
  FileText,
  MapPin,
  TrendingUp,
  MessageSquare,
  BookOpen,
  Beaker,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  Trophy,
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
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { StatsCard } from './StatsCard';

type DashboardProps = {
  stats: {
    totalCourses: number;
    activeLabs: number;
    pendingSubmissions: number;
    averagePerformance: number;
    unreadMessages: number;
    upcomingLabs: number;
  };
  courses: any[];
  upcomingLabs: any[];
  recentActivity: any[];
  onNavigate: (tab: string) => void;
};

export function ModernDashboard({
  stats,
  courses,
  upcomingLabs,
  recentActivity,
  onNavigate,
}: DashboardProps) {
  const { t, isRTL } = useLanguage();
  const { theme, primaryHex } = useTheme() as any;
  const isDark = theme === 'dark';

  const performanceData = [
    { name: 'Week 1', value: 65 },
    { name: 'Week 2', value: 72 },
    { name: 'Week 3', value: 68 },
    { name: 'Week 4', value: 85 },
    { name: 'Week 5', value: 78 },
    { name: 'Week 6', value: 90 },
  ];

  const cardClass = isDark
    ? 'bg-card-dark border border-white/5 hover:border-white/10'
    : 'bg-white border border-slate-200 shadow-sm hover:shadow-md';

  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-500';

  const statItems = [
    {
      label: t('totalCourses') || 'Total Courses',
      value: stats.totalCourses,
      icon: <BookOpen size={24} />,
      trend: '+2 this sem',
      isPositive: true,
    },
    {
      label: t('activeLabs') || 'Active Labs',
      value: stats.activeLabs,
      icon: <Beaker size={24} />,
      trend: '3 closing soon',
      isPositive: false,
    },
    {
      label: t('pendingGrading') || 'Pending Grading',
      value: stats.pendingSubmissions,
      icon: <FileText size={24} />,
      trend: 'Needs attention',
      isPositive: false,
    },
    {
      label: t('avgPerformance') || 'Avg Performance',
      value: `${stats.averagePerformance}%`,
      icon: <TrendingUp size={24} />,
      trend: '+5% vs last week',
      isPositive: true,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold tracking-tight ${textPrimary}`}>
            {t('dashboardOverview') || 'Dashboard Overview'}
          </h1>
          <p className={`text-lg mt-1 ${textSecondary}`}>
            {t('dashboardSubtitle') || 'Welcome back! Here is what is happening in your courses.'}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statItems.map((item, idx) => (
          <StatsCard
            key={idx}
            label={item.label}
            value={item.value}
            icon={item.icon}
            comparison={item.trend}
            isPositive={item.isPositive}
          />
        ))}
      </div>

      {/* AI Insights Banner */}
      <div 
        className={`rounded-3xl p-8 border transition-all duration-300 relative overflow-hidden group ${
          isDark ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'
        }`}
      >
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
          <Sparkles size={120} className="text-indigo-500" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-indigo-500 font-bold tracking-wider text-xs uppercase">
              <Sparkles size={16} />
              <span>{t('aiInsights') || 'AI POWERED INSIGHTS'}</span>
            </div>
            <h2 className={`text-2xl font-bold ${textPrimary}`}>
              {t('evyAiTAAssistant') || 'Evy AI TA Assistant'}
            </h2>
            <p className={`text-lg max-w-2xl leading-relaxed ${textSecondary}`}>
              {t('aiRecommendation') || 'Based on recent lab submissions, 15% of students are struggling with the Pointer Arithmetic concepts. Consider scheduling a quick review session.'}
            </p>
          </div>
          <button
            onClick={() => onNavigate('ai-assistant')}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-95"
          >
            <span>{t('viewDetailedAnalysis') || 'View Analysis'}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Performance Chart & Recent Activity */}
        <div className="lg:col-span-2 space-y-8">
          {/* Performance Trend */}
          <div className={`p-8 rounded-3xl ${cardClass}`}>
            <div className="flex items-center justify-between mb-8">
              <h3 className={`text-xl font-bold ${textPrimary}`}>
                {t('studentEngagementTrend') || 'Student Engagement Trend'}
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-indigo-500" />
                  <span className={`text-sm ${textSecondary}`}>{t('currentWeek') || 'Current Week'}</span>
                </div>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={primaryHex || '#6366f1'} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={primaryHex || '#6366f1'} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDark ? '#1e293b' : '#fff', 
                      border: 'none', 
                      borderRadius: '16px', 
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' 
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={primaryHex || '#6366f1'}
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Activity */}
          <div className={`p-8 rounded-3xl ${cardClass}`}>
            <div className="flex items-center justify-between mb-8">
              <h3 className={`text-xl font-bold ${textPrimary}`}>{t('recentActivity') || 'Recent Activity'}</h3>
              <button 
                onClick={() => onNavigate('notifications')}
                className="text-sm font-semibold text-indigo-500 hover:text-indigo-600 transition-colors"
              >
                {t('viewAll') || 'View All'}
              </button>
            </div>
            <div className="space-y-6">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, idx) => (
                  <div key={idx} className="flex items-start gap-4 group cursor-pointer">
                    <div className={`mt-1 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isDark ? 'bg-white/5 group-hover:bg-white/10' : 'bg-slate-50 group-hover:bg-slate-100'
                    }`}>
                      {activity.type === 'submission' && <FileText className="text-blue-500" size={20} />}
                      {activity.type === 'question' && <MessageSquare className="text-amber-500" size={20} />}
                      {activity.type === 'grade' && <TrendingUp className="text-emerald-500" size={20} />}
                      {activity.type === 'attendance' && <CheckCircle2 className="text-indigo-500" size={20} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-base font-semibold truncate ${textPrimary}`}>
                        {activity.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400">
                          {activity.course}
                        </span>
                        <span className={`text-xs ${textSecondary}`}>
                          {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className={textSecondary}>{t('noRecentActivity') || 'No recent activity to show.'}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Upcoming Labs & Courses */}
        <div className="space-y-8">
          {/* Upcoming Labs */}
          <div className={`p-8 rounded-3xl ${cardClass}`}>
            <h3 className={`text-xl font-bold mb-6 ${textPrimary}`}>{t('upcomingLabs') || 'Upcoming Labs'}</h3>
            <div className="space-y-4">
              {upcomingLabs.length > 0 ? (
                upcomingLabs.map((lab, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => onNavigate('labs')}
                    className={`p-4 rounded-2xl border border-transparent transition-all cursor-pointer ${
                      isDark ? 'bg-white/5 hover:border-white/10' : 'bg-slate-50 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className={`font-bold truncate ${textPrimary}`}>{lab.title}</p>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500 shrink-0">
                        {lab.course}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                      <div className={`flex items-center gap-1.5 text-xs ${textSecondary}`}>
                        <Calendar size={14} />
                        <span>{lab.date}</span>
                      </div>
                      <div className={`flex items-center gap-1.5 text-xs ${textSecondary}`}>
                        <Clock size={14} />
                        <span>{lab.time}</span>
                      </div>
                      <div className={`flex items-center gap-1.5 text-xs ${textSecondary}`}>
                        <MapPin size={14} />
                        <span>{lab.location}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className={textSecondary}>{t('noUpcomingLabs') || 'No upcoming labs.'}</p>
                </div>
              )}
            </div>
            <button 
              onClick={() => onNavigate('labs')}
              className={`w-full mt-6 py-3 rounded-2xl border font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                isDark 
                  ? 'border-white/5 hover:bg-white/5 text-white' 
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <span>{t('viewLabSchedule') || 'View Lab Schedule'}</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Quick Stats Summary */}
          <div className={`p-8 rounded-3xl ${cardClass} bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-0 overflow-hidden relative`}>
            <div className="absolute -bottom-8 -right-8 opacity-10 rotate-12">
              <Trophy size={160} />
            </div>
            <h3 className="text-xl font-bold mb-2 relative z-10">{t('performanceSummary') || 'Quick Performance'}</h3>
            <p className="text-white/80 text-sm mb-6 relative z-10">{t('performanceSummarySubtitle') || 'Overall section progress'}</p>
            
            <div className="space-y-6 relative z-10">
              <div>
                <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-widest text-white/70">
                  <span>{t('completionRate') || 'Lab Completion'}</span>
                  <span>{stats.averagePerformance}%</span>
                </div>
                <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white rounded-full" 
                    style={{ width: `${stats.averagePerformance}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-widest text-white/70">
                  <span>{t('gradingProgress') || 'Grading Progress'}</span>
                  <span>{Math.round(100 - (stats.pendingSubmissions / 50 * 100))}%</span>
                </div>
                <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white rounded-full" 
                    style={{ width: `${Math.round(100 - (stats.pendingSubmissions / 50 * 100))}%` }}
                  />
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => onNavigate('analytics')}
              className="w-full mt-8 py-3 bg-white/10 hover:bg-white/20 rounded-2xl font-bold text-sm backdrop-blur-md transition-all active:scale-95"
            >
              {t('viewDetailedAnalytics') || 'View Detailed Analytics'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModernDashboard;

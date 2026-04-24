import React, { useState } from 'react';
import {
  Users,
  FileText,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Lightbulb,
  Clock,
  BarChart3,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const attendanceData = [
  { week: 'Week 1', value: 85 },
  { week: 'Week 2', value: 90 },
  { week: 'Week 3', value: 78 },
  { week: 'Week 4', value: 88 },
  { week: 'Week 5', value: 92 },
  { week: 'Week 6', value: 86 },
  { week: 'Week 7', value: 88 },
];

const submissionData = [
  { lab: 'Lab 1', value: 95 },
  { lab: 'Lab 2', value: 88 },
  { lab: 'Lab 3', value: 72 },
  { lab: 'Lab 4', value: 80 },
  { lab: 'Lab 5', value: 65 },
];

const scoreDistribution = [
  { range: '90-100', value: 25 },
  { range: '80-89', value: 35 },
  { range: '70-79', value: 22 },
  { range: '60-69', value: 12 },
  { range: '<60', value: 6 },
];

const CHART_COLORS = ['#22c55e', '#3b82f6', '#eab308', '#f97316', '#ef4444'];

const insights = [
  {
    message: '3 students showing attendance decline over last 2 weeks',
    type: 'warning' as const,
  },
  {
    message: 'Lab 5 has lowest submission rate (65%)',
    type: 'error' as const,
  },
  {
    message: 'Overall engagement increased by 5% this month',
    type: 'success' as const,
  },
  {
    message: 'Score distribution improved compared to last semester',
    type: 'info' as const,
  },
];

const deadlines = [
  { name: 'Lab 5 Submission', daysRemaining: 2 },
  { name: 'Midterm Review', daysRemaining: 5 },
  { name: 'Project Milestone', daysRemaining: 7 },
];

const comparisonMetrics = [
  { label: 'Attendance', current: 88, previous: 85, diff: 3 },
  { label: 'Submissions', current: 76, previous: 80, diff: -4 },
  { label: 'Avg. Score', current: 78, previous: 75, diff: 3 },
];

type DateRange = 'week' | 'month' | 'semester';

const insightStyles = {
  warning: {
    dark: 'bg-yellow-900/20 border-yellow-700/30 text-yellow-400',
    light: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    icon: 'text-yellow-400',
  },
  error: {
    dark: 'bg-red-900/20 border-red-700/30 text-red-400',
    light: 'bg-red-50 border-red-200 text-red-700',
    icon: 'text-red-400',
  },
  success: {
    dark: 'bg-green-900/20 border-green-700/30 text-green-400',
    light: 'bg-green-50 border-green-200 text-green-700',
    icon: 'text-green-400',
  },
  info: {
    dark: 'bg-blue-900/20 border-blue-700/30 text-blue-400',
    light: 'bg-blue-50 border-blue-200 text-blue-700',
    icon: 'text-blue-400',
  },
};

export function AnalyticsPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { t } = useLanguage();
  const [dateRange, setDateRange] = useState<DateRange>('month');

  const statCards = [
    {
      title: t('attendanceRate'),
      value: '88%',
      trend: '+3%',
      trendUp: true,
      icon: Users,
      color: 'green',
    },
    {
      title: t('submissionRate'),
      value: '76%',
      trend: '-2%',
      trendUp: false,
      icon: FileText,
      color: 'red',
    },
    {
      title: t('atRiskStudents'),
      value: '5',
      trend: t('needsAttention'),
      trendUp: null,
      icon: AlertTriangle,
      color: 'yellow',
    },
    {
      title: t('engagementScore'),
      value: '82',
      trend: '+5%',
      trendUp: true,
      icon: TrendingUp,
      color: 'green',
    },
  ];

  const dateRangeButtons: { key: DateRange; label: string }[] = [
    { key: 'week', label: t('thisWeek') },
    { key: 'month', label: t('thisMonth') },
    { key: 'semester', label: t('thisSemester') },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('analytics')}
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            {t('trackPerformance')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {dateRangeButtons.map((btn) => (
            <button
              key={btn.key}
              onClick={() => setDateRange(btn.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                dateRange === btn.key
                  ? isDark
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-blue-50 text-blue-600'
                  : isDark
                    ? 'text-slate-400 hover:bg-white/5'
                    : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className={`border rounded-lg p-6 ${
                isDark ? 'bg-card-dark border-white/5' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/20' : 'bg-blue-50'}`}>
                  <Icon className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                {stat.trendUp !== null && (
                  <div className="flex items-center gap-1">
                    {stat.trendUp ? (
                      <ArrowUpRight className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-500" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        stat.trendUp ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {stat.trend}
                    </span>
                  </div>
                )}
                {stat.trendUp === null && (
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      isDark ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-50 text-yellow-600'
                    }`}
                  >
                    {stat.trend}
                  </span>
                )}
              </div>
              <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {stat.value}
              </p>
              <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                {stat.title}
              </p>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trends */}
        <div
          className={`border rounded-lg p-6 ${
            isDark ? 'bg-card-dark border-white/5' : 'bg-white border-gray-200'
          }`}
        >
          <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('attendanceTrends')}
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}
                />
                <XAxis
                  dataKey="week"
                  tick={{ fill: isDark ? '#94a3b8' : '#6b7280', fontSize: 12 }}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: isDark ? '#94a3b8' : '#6b7280', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#1e293b' : '#fff',
                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e5e7eb',
                    borderRadius: '8px',
                    color: isDark ? '#fff' : '#111827',
                  }}
                />
                <Bar dataKey="value" name={t('attendancePercent')} fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Submission Performance */}
        <div
          className={`border rounded-lg p-6 ${
            isDark ? 'bg-card-dark border-white/5' : 'bg-white border-gray-200'
          }`}
        >
          <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('submissionPerformance')}
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={submissionData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}
                />
                <XAxis
                  dataKey="lab"
                  tick={{ fill: isDark ? '#94a3b8' : '#6b7280', fontSize: 12 }}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: isDark ? '#94a3b8' : '#6b7280', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#1e293b' : '#fff',
                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e5e7eb',
                    borderRadius: '8px',
                    color: isDark ? '#fff' : '#111827',
                  }}
                />
                <Bar dataKey="value" name={t('submissionPercent')} fill="#2563eb" radius={[4, 4, 0, 0]}>
                  {submissionData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.value >= 80 ? '#22c55e' : entry.value >= 70 ? '#eab308' : '#ef4444'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Score Distribution */}
        <div
          className={`border rounded-lg p-6 lg:col-span-2 ${
            isDark ? 'bg-card-dark border-white/5' : 'bg-white border-gray-200'
          }`}
        >
          <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('scoreDistribution')}
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreDistribution} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}
                />
                <XAxis
                  type="number"
                  domain={[0, 40]}
                  tick={{ fill: isDark ? '#94a3b8' : '#6b7280', fontSize: 12 }}
                  tickFormatter={(v) => `${v}%`}
                />
                <YAxis
                  type="category"
                  dataKey="range"
                  tick={{ fill: isDark ? '#94a3b8' : '#6b7280', fontSize: 12 }}
                  width={60}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#1e293b' : '#fff',
                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e5e7eb',
                    borderRadius: '8px',
                    color: isDark ? '#fff' : '#111827',
                  }}
                  formatter={(value: number) => [`${value}%`, t('students')]}
                />
                <Bar dataKey="value" name={t('students')} radius={[0, 4, 4, 0]}>
                  {scoreDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Insights Section */}
      <div
        className={`border rounded-lg p-6 ${
          isDark ? 'bg-card-dark border-white/5' : 'bg-white border-gray-200'
        }`}
      >
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
          <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('aiInsights')}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {insights.map((insight, index) => {
            const style = insightStyles[insight.type];
            return (
              <div
                key={index}
                className={`border rounded-lg p-4 ${isDark ? style.dark : style.light}`}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      isDark
                        ? style.icon
                        : insight.type === 'warning'
                          ? 'text-yellow-500'
                          : insight.type === 'error'
                            ? 'text-red-500'
                            : insight.type === 'success'
                              ? 'text-green-500'
                              : 'text-blue-500'
                    }`}
                  />
                  <p className="text-sm font-medium">
                    {index === 0 ? t('insightAttendanceDecline') : 
                     index === 1 ? t('insightLowestSubmission') :
                     index === 2 ? t('insightEngagementIncrease') :
                     t('insightScoreImprovement')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Deadlines & Comparison Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Deadlines */}
        <div
          className={`border rounded-lg p-6 ${
            isDark ? 'bg-card-dark border-white/5' : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center gap-2 mb-4">
            <Calendar className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('upcomingDeadlines')}
            </h2>
          </div>
          <div className="space-y-3">
            {deadlines.map((deadline, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  isDark ? 'border-white/10 hover:bg-white/5' : 'border-gray-200 hover:bg-gray-50'
                } transition-colors`}
              >
                <div className="flex items-center gap-3">
                  <Clock className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-gray-500'}`} />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t(deadline.name)}
                  </span>
                </div>
                <span
                  className={`text-sm px-3 py-1 rounded-full font-medium ${
                    deadline.daysRemaining <= 2
                      ? isDark
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-red-50 text-red-600'
                      : deadline.daysRemaining <= 5
                        ? isDark
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-yellow-50 text-yellow-600'
                        : isDark
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-green-50 text-green-600'
                  }`}
                >
                  {deadline.daysRemaining} {t('daysRemaining')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison Metrics */}
        <div
          className={`border rounded-lg p-6 ${
            isDark ? 'bg-card-dark border-white/5' : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('comparisonMetrics')}
            </h2>
          </div>
          <div className="space-y-3">
            <div
              className={`grid grid-cols-4 gap-4 pb-3 border-b text-sm font-medium ${
                isDark ? 'border-white/10 text-slate-400' : 'border-gray-200 text-gray-500'
              }`}
            >
              <span>{t('metric')}</span>
              <span className="text-center">{t('current')}</span>
              <span className="text-center">{t('previous')}</span>
              <span className="text-center">{t('change')}</span>
            </div>
            {comparisonMetrics.map((metric, index) => (
              <div
                key={index}
                className={`grid grid-cols-4 gap-4 py-3 ${
                  index < comparisonMetrics.length - 1
                    ? isDark
                      ? 'border-b border-white/10'
                      : 'border-b border-gray-100'
                    : ''
                }`}
              >
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {metric.label === 'Attendance' ? t('attendance') : 
                   metric.label === 'Submissions' ? t('submissions') : 
                   t('avgScore')}
                </span>
                <span className={`text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {metric.current}
                </span>
                <span className={`text-center ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  {metric.previous}
                </span>
                <span className="text-center">
                  <span
                    className={`inline-flex items-center gap-1 text-sm font-medium ${
                      metric.diff > 0 ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {metric.diff > 0 ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    {metric.diff > 0 ? `+${metric.diff}` : metric.diff}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

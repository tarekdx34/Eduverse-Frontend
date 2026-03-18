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
  ClipboardCheck,
  Trophy,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { StatsCard } from './StatsCard';

type DashboardProps = {
  stats: any;
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
  const { t } = useLanguage();
  const { isDark } = useTheme();

  const performanceData = courses.map((course) => ({
    course: course.code,
    value: course.averageGrade,
  }));

  // Trend data for area chart
  const trendData = [
    { week: 'W1', submissions: 12, graded: 10 },
    { week: 'W2', submissions: 18, graded: 15 },
    { week: 'W3', submissions: 25, graded: 22 },
    { week: 'W4', submissions: 30, graded: 28 },
    { week: 'W5', submissions: 22, graded: 20 },
    { week: 'W6', submissions: 35, graded: 30 },
  ];

  const cardClass = `rounded-2xl p-6 border ${isDark ? 'bg-white/5 border-white/10 backdrop-blur-sm' : 'bg-white/80 border-gray-200/60 backdrop-blur-sm shadow-sm'}`;
  const headingClass = `text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`;
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-gray-600';
  const textMuted = isDark ? 'text-slate-500' : 'text-gray-500';
  const innerCardClass = `rounded-xl border ${isDark ? 'border-white/10 hover:bg-white/5' : 'border-gray-200 hover:bg-gray-50'}`;

  return (
    <div className="space-y-6">
      {/* Stat Cards — consistent with Student Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          label="Total Courses"
          value={String(stats.totalCourses)}
          comparison="+1 This Semester"
          isPositive={true}
          icon={<BookOpen size={24} />}
        />
        <StatsCard
          label="Active Labs"
          value={String(stats.activeLabs)}
          maxValue={String(stats.activeLabs + stats.upcomingLabs)}
          comparison={`${stats.upcomingLabs} Upcoming`}
          isPositive={true}
          icon={<Beaker size={24} />}
        />
        <StatsCard
          label="Pending Submissions"
          value={String(stats.pendingSubmissions)}
          comparison="Needs Grading"
          isPositive={false}
          icon={<ClipboardCheck size={24} />}
        />
        <StatsCard
          label="Avg Performance"
          value={String(stats.averagePerformance) + '%'}
          comparison="+2.3% vs Last Semester"
          isPositive={true}
          icon={<Trophy size={24} />}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Performance Chart */}
        <div className={`${cardClass}`}>
          <h3 className={`${headingClass} mb-4`}>{t('coursePerformance')}</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
              <XAxis dataKey="course" tick={{ fill: isDark ? '#94a3b8' : '#6b7280' }} />
              <YAxis tick={{ fill: isDark ? '#94a3b8' : '#6b7280' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#1e293b' : '#fff',
                  border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
                  color: isDark ? '#f1f5f9' : '#111827',
                  borderRadius: '0.75rem',
                }}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Submissions Trend Chart */}
        <div className={`${cardClass}`}>
          <h3 className={`${headingClass} mb-4`}>Submissions Trend</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="submissionsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
              <XAxis dataKey="week" tick={{ fill: isDark ? '#94a3b8' : '#6b7280' }} />
              <YAxis tick={{ fill: isDark ? '#94a3b8' : '#6b7280' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#1e293b' : '#fff',
                  border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
                  color: isDark ? '#f1f5f9' : '#111827',
                  borderRadius: '0.75rem',
                }}
              />
              <Area
                type="monotone"
                dataKey="submissions"
                stroke="#3b82f6"
                fill="url(#submissionsGrad)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="graded"
                stroke="#10b981"
                fill="url(#gradedGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Upcoming Teaching + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Upcoming Teaching */}
        <div className={`${cardClass}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={headingClass}>Upcoming Teaching</h3>
            <button
              onClick={() => onNavigate('labs')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {t('viewAll')}
            </button>
          </div>
          <div className="space-y-3">
            {upcomingLabs.slice(0, 5).map((lab) => (
              <div
                key={lab.id}
                className={`p-3 ${innerCardClass} transition-colors cursor-pointer`}
                onClick={() => onNavigate('labs')}
              >
                <p className={`text-sm font-medium ${textPrimary}`}>{lab.course}</p>
                <p className={`text-xs ${textSecondary} mt-1`}>{lab.title}</p>
                <div className={`flex flex-wrap items-center gap-2 mt-2 text-xs ${textMuted}`}>
                  <MapPin className="w-3 h-3" />
                  <span>{lab.location}</span>
                  <span>•</span>
                  <Calendar className="w-3 h-3" />
                  <span>{lab.date}</span>
                  <span>•</span>
                  <span>{lab.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className={`lg:col-span-2 ${cardClass}`}>
          <h3 className={`${headingClass} mb-4`}>{t('recentActivity')}</h3>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className={`flex items-start gap-3 p-3 ${innerCardClass}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isDark ? 'bg-blue-500/20' : 'bg-blue-100'
                  }`}
                >
                  {activity.type === 'submission' && <FileText className="w-4 h-4 text-blue-500" />}
                  {activity.type === 'question' && (
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                  )}
                  {activity.type === 'grade' && <TrendingUp className="w-4 h-4 text-blue-500" />}
                  {activity.type === 'attendance' && <Users className="w-4 h-4 text-blue-500" />}
                </div>
                <div className="flex-1">
                  <p className={`text-sm ${textPrimary}`}>{activity.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs ${textMuted}`}>{activity.course}</span>
                    <span className={`text-xs ${isDark ? 'text-slate-600' : 'text-gray-400'}`}>
                      •
                    </span>
                    <span className={`text-xs ${textMuted}`}>
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModernDashboard;

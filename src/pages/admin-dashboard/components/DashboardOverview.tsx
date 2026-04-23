import React from 'react';
import { BookOpen, GraduationCap, Calendar, Clock, Users, TrendingUp } from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

interface DashboardOverviewProps {
  stats: any;
  analytics: any;
  recentActivity: any[];
  onNavigate: (tab: string) => void;
}

const cardClass = (isDark: boolean) =>
  `${isDark ? 'bg-slate-800/50 border-white/10' : 'bg-white border-slate-200'} rounded-3xl p-6 border`;

const headingClass = (isDark: boolean) => `${isDark ? 'text-white' : 'text-slate-900'}`;

export function DashboardOverview({ stats, analytics, recentActivity }: DashboardOverviewProps) {
  const { isDark, primaryHex } = useTheme() as any;
  const { t } = useLanguage();

  const enrollmentData: { course: string; enrolled: number; capacity: number }[] = Array.isArray(
    stats.enrollmentChart,
  )
    ? stats.enrollmentChart
    : [];

  const upcomingSchedule: {
    time: string;
    course: string;
    instructor: string;
    room: string;
  }[] = Array.isArray(stats.upcomingSchedule) ? stats.upcomingSchedule : [];

  const registrationLabel = (() => {
    switch (stats.registrationStatus) {
      case 'open':
        return t('open');
      case 'closed':
        return t('closed');
      case 'upcoming':
        return t('upcoming');
      default:
        return '—';
    }
  })();

  const topStats = [
    {
      label: t('totalCourses'),
      value: stats.totalCourses ?? 0,
      sub: `${stats.activeCourses ?? 0} ${t('activeCourses')}`,
      icon: BookOpen,
      iconBg: isDark ? `${primaryHex}20` : `${primaryHex}10`,
      iconColor: primaryHex,
      subColor: primaryHex,
    },
    {
      label: `${t('enrolled')} (${t('semester')})`,
      value: stats.enrolledSeatsThisSemester ?? 0,
      sub: stats.semesterLabel || stats.currentSemester || '—',
      icon: GraduationCap,
      iconBg: isDark ? `${primaryHex}20` : `${primaryHex}10`,
      iconColor: primaryHex,
      subColor: primaryHex,
    },
    {
      label: t('registrationPeriod'),
      value: registrationLabel,
      sub: stats.registrationSub || '—',
      icon: Calendar,
      iconBg: isDark ? `${primaryHex}20` : `${primaryHex}10`,
      iconColor: primaryHex,
      subColor: primaryHex,
    },
    {
      label: t('pendingRequests'),
      value: stats.pendingRequests ?? 0,
      sub: stats.pendingRequestsSub || '—',
      icon: Clock,
      iconBg: isDark ? `${primaryHex}20` : `${primaryHex}10`,
      iconColor: primaryHex,
      subColor: primaryHex,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {topStats.map((stat) => (
          <div
            key={stat.label}
            className={cardClass(isDark)}
            style={{
              transition: 'border-color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = primaryHex;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0';
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: stat.iconBg }}>
                <stat.icon size={20} style={{ color: stat.iconColor }} />
              </div>
            </div>
            <div
              className={`text-4xl font-bold mb-1 ${headingClass(isDark)}`}
              style={{ letterSpacing: '-0.02em' }}
            >
              {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
            </div>
            <div
              className={`text-sm mb-2 font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
            >
              {stat.label}
            </div>
            <div
              className={`text-xs font-semibold ${
                stat.subColor.startsWith('text-') ? stat.subColor : ''
              }`}
              style={
                stat.subColor.startsWith('text-') ? undefined : { color: stat.subColor as string }
              }
            >
              {stat.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Department Overview Banner */}
      <div
        className={`rounded-3xl p-8 relative overflow-hidden transition-all duration-300 ${
          isDark
            ? 'bg-card-dark border border-white/5 shadow-2xl shadow-black/20'
            : 'bg-white border border-slate-200 shadow-sm'
        }`}
        style={{
          borderColor: isDark ? `${primaryHex}30` : `${primaryHex}50`,
          backgroundColor: isDark ? `${primaryHex}08` : `${primaryHex}05`,
          borderWidth: '1.5px',
        }}
      >
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div
                className={`p-2.5 rounded-xl backdrop-blur-sm ${isDark ? 'bg-white/10' : 'bg-white shadow-sm'}`}
              >
                <GraduationCap size={22} style={{ color: primaryHex }} />
              </div>
              <h3
                className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}
              >
                {t('department')}
              </h3>
            </div>
            <p className={`text-sm mb-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {stats.semesterWeekLabel || '—'}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: t('instructors'), value: stats.instructorCount ?? 0 },
                { label: t('teachingAssistants'), value: stats.taCount ?? 0 },
                { label: t('activeCourses'), value: stats.activeCourses ?? 0 },
                { label: t('avgEnrollment'), value: stats.avgEnrollmentLabel || '—' },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`rounded-2xl p-5 transition-all duration-300 ${
                    isDark
                      ? 'bg-white/5 border border-white/5 hover:bg-white/10'
                      : 'bg-slate-50/50 border border-slate-100 hover:bg-slate-50 hover:border-slate-200'
                  }`}
                >
                  <div
                    className={`text-xs font-medium mb-1.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                  >
                    {item.label}
                  </div>
                  <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {(Array.isArray(analytics?.userGrowth) && analytics.userGrowth.length > 0) ||
      (Array.isArray(analytics?.courseEngagement) &&
        analytics.courseEngagement.some((c: any) => Number(c.activeStudents) > 0)) ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.isArray(analytics?.userGrowth) && analytics.userGrowth.length > 0 && (
            <div className={cardClass(isDark)}>
              <h3 className={`text-lg font-bold mb-4 ${headingClass(isDark)}`}>
                {t('userGrowthTrend')}
              </h3>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={analytics.userGrowth}>
                  <defs>
                    <linearGradient id="adminUserGrowth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={primaryHex} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={primaryHex} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#ffffff12' : '#f1f5f9'} />
                  <XAxis dataKey="month" tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }} />
                  <YAxis tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#1e293b' : '#ffffff',
                      border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                      borderRadius: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="students"
                    name="Students"
                    stroke={primaryHex}
                    strokeWidth={2}
                    fill="url(#adminUserGrowth)"
                  />
                  <Area
                    type="monotone"
                    dataKey="instructors"
                    name="Instructors"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={0}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
          {Array.isArray(analytics?.courseEngagement) &&
            analytics.courseEngagement.some((c: any) => Number(c.activeStudents) > 0) && (
              <div className={cardClass(isDark)}>
                <h3 className={`text-lg font-bold mb-4 ${headingClass(isDark)}`}>
                  {t('engagementByCourse')}
                </h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={analytics.courseEngagement.filter((c: any) => Number(c.activeStudents) > 0)}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#ffffff12' : '#f1f5f9'} />
                    <XAxis type="number" tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }} />
                    <YAxis
                      type="category"
                      dataKey="course"
                      width={100}
                      tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 10 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? '#1e293b' : '#ffffff',
                        border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                        borderRadius: 12,
                      }}
                    />
                    <Bar dataKey="activeStudents" name={t('students')} fill={primaryHex} radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
        </div>
      ) : null}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Course Enrollment Status */}
          <div className={cardClass(isDark)}>
            <div className="flex items-center justify-between mb-8">
              <h3 className={`text-lg font-bold ${headingClass(isDark)}`}>
                Course Enrollment Status
              </h3>
              <div
                className={`flex items-center gap-2 px-3 py-1 rounded-full`}
                style={{ backgroundColor: `${primaryHex}15` }}
              >
                <TrendingUp style={{ color: primaryHex }} size={14} />
                <span
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: primaryHex }}
                >
                  {typeof stats.sectionFillRate === 'number' ? `${stats.sectionFillRate}%` : '—'} fill (
                  {t('semester')})
                </span>
              </div>
            </div>
            {enrollmentData.length === 0 ? (
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                No section enrollment data for this view yet.
              </p>
            ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={enrollmentData} barGap={8}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDark ? '#ffffff08' : '#f1f5f9'}
                  vertical={false}
                />
                <XAxis
                  dataKey="course"
                  tick={{ fill: isDark ? '#e2e8f0' : '#1e293b', fontSize: 13, fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                  dy={12}
                />
                <YAxis
                  tick={{ fill: isDark ? '#9ca3af' : '#475569', fontSize: 11, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: isDark ? '#ffffff08' : '#f1f5f9' }}
                  contentStyle={{
                    backgroundColor: isDark ? '#1e293b' : '#ffffff',
                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                    borderRadius: '16px',
                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                    padding: '12px 16px',
                  }}
                  itemStyle={{
                    fontSize: '13px',
                    fontWeight: 600,
                    padding: '2px 0',
                  }}
                  labelStyle={{
                    fontSize: '14px',
                    fontWeight: 800,
                    color: isDark ? '#ffffff' : '#0f172a',
                    marginBottom: '8px',
                  }}
                />
                <Bar
                  dataKey="enrolled"
                  fill={primaryHex}
                  radius={[6, 6, 0, 0]}
                  name="Enrolled"
                  barSize={28}
                />
                <Bar
                  dataKey="capacity"
                  fill={isDark ? '#475569' : '#cbd5e1'}
                  radius={[6, 6, 0, 0]}
                  name="Capacity"
                  barSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
            )}
          </div>

          {/* Upcoming Schedule */}
          <div className={cardClass(isDark)}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-bold ${headingClass(isDark)}`}>Upcoming Schedule</h3>
              <button
                className={`text-sm font-semibold transition-colors`}
                style={{ color: primaryHex }}
              >
                View Full Calendar
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingSchedule.map((item, index) => (
                <div
                  key={index}
                  className={`flex flex-col gap-3 p-5 rounded-2xl transition-all duration-300 ${
                    isDark
                      ? 'bg-slate-800/50 hover:bg-slate-800'
                      : 'bg-slate-50 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div
                      className={`p-2 rounded-xl ${isDark ? 'bg-slate-700/50 text-slate-300' : 'bg-white text-slate-600 shadow-sm'}`}
                    >
                      <Calendar size={18} />
                    </div>
                    <span
                      className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                    >
                      {item.time}
                    </span>
                  </div>
                  <div>
                    <h4 className={`font-bold text-sm leading-tight ${headingClass(isDark)}`}>
                      {item.course}
                    </h4>
                    <div className="flex items-center gap-2 mt-2">
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: primaryHex }}
                      ></div>
                      <p
                        className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                      >
                        {item.instructor} · <span className="font-bold">{item.room}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - 1/3: Recent Activity */}
        <div className="space-y-6">
          <div className={cardClass(isDark)}>
            <h3 className={`text-lg font-bold mb-6 ${headingClass(isDark)}`}>
              {t('recentActivity')}
            </h3>
            <div className="space-y-6">
              {(!Array.isArray(recentActivity) || recentActivity.length === 0) && (
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  No audit log entries yet. Actions across the system will appear here as they are
                  recorded.
                </p>
              )}
              {(recentActivity ?? []).slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-start gap-4 relative">
                    {index < 4 && (
                      <div
                        className={`absolute left-[17px] top-10 bottom-[-24px] w-0.5 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}
                      ></div>
                    )}
                    <div
                      className={`relative z-10 p-2 rounded-full border-2 ${
                        activity.type === 'course'
                          ? isDark
                            ? `bg-slate-800 border-white/10`
                            : `bg-white border-slate-100 shadow-sm`
                          : isDark
                            ? `bg-slate-800 border-white/10`
                            : `bg-white border-slate-100 shadow-sm`
                      }`}
                      style={{ color: primaryHex, borderColor: `${primaryHex}30` }}
                    >
                      {activity.type === 'course' ? <BookOpen size={16} /> : <Users size={16} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`font-bold text-sm ${headingClass(isDark)}`}>
                          {activity.title}
                        </h4>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                        >
                          {activity.time}
                        </span>
                      </div>
                      <p
                        className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                      >
                        {activity.description}
                      </p>
                    </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardOverview;

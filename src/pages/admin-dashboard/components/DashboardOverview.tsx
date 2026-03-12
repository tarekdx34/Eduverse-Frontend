import React from 'react';
import { BookOpen, GraduationCap, Calendar, Clock, Users, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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

const enrollmentData = [
  { course: 'CS101', enrolled: 45, capacity: 50 },
  { course: 'CS201', enrolled: 38, capacity: 40 },
  { course: 'CS301', enrolled: 29, capacity: 35 },
  { course: 'CS401', enrolled: 52, capacity: 60 },
  { course: 'CS102', enrolled: 41, capacity: 45 },
  { course: 'CS202', enrolled: 22, capacity: 30 },
];

const upcomingSchedule = [
  {
    course: 'CS101 – Intro to Programming',
    time: 'Sun, 9:00 AM',
    room: 'Hall A-201',
    instructor: 'Dr. Ahmed Hassan',
  },
  {
    course: 'CS201 – Data Structures',
    time: 'Sun, 11:00 AM',
    room: 'Lab B-105',
    instructor: 'Dr. Sara Mostafa',
  },
  {
    course: 'CS301 – Operating Systems',
    time: 'Mon, 10:00 AM',
    room: 'Hall C-302',
    instructor: 'Dr. Mohamed Ali',
  },
  {
    course: 'CS401 – Machine Learning',
    time: 'Mon, 1:00 PM',
    room: 'Lab D-110',
    instructor: 'Dr. Nour El-Din',
  },
];

export function DashboardOverview({ stats, recentActivity }: DashboardOverviewProps) {
  const { isDark, primaryHex } = useTheme() as any;
  const { t } = useLanguage();

  const topStats = [
    {
      label: t('totalCourses'),
      value: stats.totalCourses ?? 24,
      sub: `${stats.activeCourses ?? 18} ${t('activeCourses')}`,
      icon: BookOpen,
      iconBg: isDark ? `${primaryHex}20` : `${primaryHex}10`,
      iconColor: primaryHex,
      subColor: primaryHex,
    },
    {
      label: 'Enrolled Students',
      value: 342,
      sub: '+26 this semester',
      icon: GraduationCap,
      iconBg: isDark ? `${primaryHex}20` : `${primaryHex}10`,
      iconColor: primaryHex,
      subColor: primaryHex,
    },
    {
      label: 'Enrollment Period',
      value: 'Spring 2025',
      sub: 'Ends Apr 15',
      icon: Calendar,
      iconBg: isDark ? `${primaryHex}20` : `${primaryHex}10`,
      iconColor: primaryHex,
      subColor: primaryHex,
    },
    {
      label: 'Pending Requests',
      value: 8,
      sub: '3 course overrides',
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
              <div 
                className="p-2 rounded-lg"
                style={{ backgroundColor: stat.iconBg }}
              >
                <stat.icon size={20} style={{ color: stat.iconColor }} />
              </div>
            </div>
            <div className={`text-4xl font-bold mb-1 ${headingClass(isDark)}`} style={{ letterSpacing: '-0.02em' }}>
              {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
            </div>
            <div className={`text-sm mb-2 font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {stat.label}
            </div>
            <div className="text-xs font-semibold" style={{ color: stat.subColor.startsWith('text-') ? undefined : stat.subColor }} className={stat.subColor.startsWith('text-') ? stat.subColor : ''}>
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
                Computer Science and Engineering
              </h3>
            </div>
            <p className={`text-sm mb-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Spring 2025 Semester — Week 8 of 16
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Instructors', value: 12 },
                { label: 'Teaching Assistants', value: 24 },
                { label: 'Active Courses', value: stats.activeCourses ?? 18 },
                { label: 'Avg. Enrollment', value: '38/course' },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`rounded-2xl p-5 transition-all duration-300 ${
                    isDark
                      ? 'bg-white/5 border border-white/5 hover:bg-white/10'
                      : 'bg-slate-50/50 border border-slate-100 hover:bg-slate-50 hover:border-slate-200'
                  }`}
                >
                  <div className={`text-xs font-medium mb-1.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
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
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full`} style={{ backgroundColor: `${primaryHex}15` }}>
                <TrendingUp style={{ color: primaryHex }} size={14} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: primaryHex }}>87% avg. fill rate</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={enrollmentData} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#ffffff08' : '#f1f5f9'} vertical={false} />
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
          </div>

          {/* Upcoming Schedule */}
          <div className={cardClass(isDark)}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-bold ${headingClass(isDark)}`}>
                Upcoming Schedule
              </h3>
              <button className={`text-sm font-semibold transition-colors`} style={{ color: primaryHex }}>
                View Full Calendar
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingSchedule.map((item, index) => (
                <div
                  key={index}
                  className={`flex flex-col gap-3 p-5 rounded-2xl transition-all duration-300 ${
                    isDark ? 'bg-slate-800/50 hover:bg-slate-800' : 'bg-slate-50 hover:bg-slate-100/80'
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
                    <h4 className={`font-bold text-sm leading-tight ${headingClass(isDark)}`}>{item.course}</h4>
                    <div className="flex items-center gap-2 mt-2">
                       <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primaryHex }}></div>
                       <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
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
              {recentActivity
                .filter((a) => a.type === 'course' || a.type === 'user')
                .slice(0, 5)
                .map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 relative"
                  >
                    {index < 4 && (
                      <div className={`absolute left-[17px] top-10 bottom-[-24px] w-0.5 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}></div>
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
                      <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {activity.description}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
            <button 
              className="w-full mt-8 py-4 rounded-2xl text-[10px] font-extrabold uppercase tracking-[0.2em] transition-all duration-300 border bg-transparent"
              style={{ 
                color: primaryHex,
                borderColor: `${primaryHex}30`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `${primaryHex}08`;
                e.currentTarget.style.borderColor = `${primaryHex}50`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = `${primaryHex}30`;
              }}
            >
              View All Activity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardOverview;

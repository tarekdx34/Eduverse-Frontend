import React from 'react';
import {
  BookOpen,
  GraduationCap,
  Calendar,
  Clock,
  Users,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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
  `${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 border shadow-sm`;

const headingClass = (isDark: boolean) =>
  `${isDark ? 'text-white' : 'text-gray-900'}`;

const enrollmentData = [
  { course: 'CS101', enrolled: 45, capacity: 50 },
  { course: 'CS201', enrolled: 38, capacity: 40 },
  { course: 'CS301', enrolled: 29, capacity: 35 },
  { course: 'CS401', enrolled: 52, capacity: 60 },
  { course: 'CS102', enrolled: 41, capacity: 45 },
  { course: 'CS202', enrolled: 22, capacity: 30 },
];

const upcomingSchedule = [
  { course: 'CS101 – Intro to Programming', time: 'Sun, 9:00 AM', room: 'Hall A-201', instructor: 'Dr. Ahmed Hassan' },
  { course: 'CS201 – Data Structures', time: 'Sun, 11:00 AM', room: 'Lab B-105', instructor: 'Dr. Sara Mostafa' },
  { course: 'CS301 – Operating Systems', time: 'Mon, 10:00 AM', room: 'Hall C-302', instructor: 'Dr. Mohamed Ali' },
  { course: 'CS401 – Machine Learning', time: 'Mon, 1:00 PM', room: 'Lab D-110', instructor: 'Dr. Nour El-Din' },
];

export function DashboardOverview({ stats, recentActivity }: DashboardOverviewProps) {
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const topStats = [
    {
      label: t('totalCourses'),
      value: stats.totalCourses ?? 24,
      sub: `${stats.activeCourses ?? 18} ${t('activeCourses')}`,
      icon: BookOpen,
      iconBg: isDark ? 'bg-rose-900/50' : 'bg-rose-50',
      iconColor: 'text-rose-600',
      subColor: 'text-green-600',
    },
    {
      label: 'Enrolled Students',
      value: 342,
      sub: '+26 this semester',
      icon: GraduationCap,
      iconBg: isDark ? 'bg-blue-900/50' : 'bg-blue-50',
      iconColor: 'text-blue-600',
      subColor: 'text-green-600',
    },
    {
      label: 'Enrollment Period',
      value: 'Spring 2025',
      sub: 'Ends Apr 15',
      icon: Calendar,
      iconBg: isDark ? 'bg-amber-900/50' : 'bg-amber-50',
      iconColor: 'text-amber-600',
      subColor: 'text-amber-600',
    },
    {
      label: 'Pending Requests',
      value: 8,
      sub: '3 course overrides',
      icon: Clock,
      iconBg: isDark ? 'bg-purple-900/50' : 'bg-purple-50',
      iconColor: 'text-purple-600',
      subColor: 'text-purple-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {topStats.map((stat) => (
          <div key={stat.label} className={cardClass(isDark)}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${stat.iconBg}`}>
                <stat.icon className={stat.iconColor} size={20} />
              </div>
            </div>
            <div className={`text-3xl font-bold mb-1 ${headingClass(isDark)}`}>
              {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
            </div>
            <div className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</div>
            <div className={`text-xs font-medium ${stat.subColor}`}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Department Overview Banner */}
      <div
        className="rounded-xl p-6 text-white relative overflow-hidden"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, #9f1239 0%, #9a3412 100%)'
            : 'linear-gradient(135deg, #E11D48 0%, #f97316 100%)',
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <GraduationCap size={20} />
          <h3 className="text-lg font-semibold">Computer Science and Engineering</h3>
        </div>
        <p className="text-rose-100 text-sm mb-4 max-w-lg">
          Spring 2025 Semester — Week 8 of 16
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Instructors', value: 12 },
            { label: 'Teaching Assistants', value: 24 },
            { label: 'Active Courses', value: stats.activeCourses ?? 18 },
            { label: 'Avg. Enrollment', value: '38/course' },
          ].map((item) => (
            <div key={item.label} className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <div className="text-xs text-rose-100 mb-1">{item.label}</div>
              <div className="text-xl font-bold">{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Course Enrollment Status */}
          <div className={cardClass(isDark)}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-semibold ${headingClass(isDark)}`}>Course Enrollment Status</h3>
              <div className="flex items-center gap-2">
                <TrendingUp className="text-green-600" size={16} />
                <span className="text-sm text-green-600 font-medium">87% avg. fill rate</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={enrollmentData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#f0f0f0'} />
                <XAxis
                  dataKey="course"
                  tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                  axisLine={{ stroke: isDark ? '#374151' : '#e5e7eb' }}
                />
                <YAxis
                  tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                  axisLine={{ stroke: isDark ? '#374151' : '#e5e7eb' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#1f2937' : 'white',
                    border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="enrolled" fill="#E11D48" radius={[4, 4, 0, 0]} name="Enrolled" />
                <Bar dataKey="capacity" fill={isDark ? '#374151' : '#e5e7eb'} radius={[4, 4, 0, 0]} name="Capacity" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Upcoming Schedule */}
          <div className={cardClass(isDark)}>
            <h3 className={`text-lg font-semibold mb-4 ${headingClass(isDark)}`}>Upcoming Schedule</h3>
            <div className="space-y-3">
              {upcomingSchedule.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-4 p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
                >
                  <div className={`p-2 rounded-lg ${isDark ? 'bg-rose-900/30 text-rose-400' : 'bg-rose-50 text-rose-600'}`}>
                    <Calendar size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-medium text-sm ${headingClass(isDark)}`}>{item.course}</h4>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {item.instructor} · {item.room}
                    </p>
                  </div>
                  <span className={`text-xs font-medium whitespace-nowrap ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - 1/3: Recent Activity */}
        <div className="space-y-6">
          <div className={cardClass(isDark)}>
            <h3 className={`text-lg font-semibold mb-4 ${headingClass(isDark)}`}>{t('recentActivity')}</h3>
            <div className="space-y-4">
              {recentActivity
                .filter((a) => a.type === 'course' || a.type === 'user')
                .slice(0, 5)
                .map((activity, index) => (
                  <div key={index} className={`flex items-start gap-3 p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div
                      className={`p-2 rounded-lg ${
                        activity.type === 'course'
                          ? isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'
                          : isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
                      }`}
                    >
                      {activity.type === 'course' ? <BookOpen size={14} /> : <Users size={14} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-medium text-sm ${headingClass(isDark)}`}>{activity.title}</h4>
                      <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{activity.description}</p>
                    </div>
                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} whitespace-nowrap`}>{activity.time}</span>
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

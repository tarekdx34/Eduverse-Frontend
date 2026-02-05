import React, { useState } from 'react';
import {
  Calendar,
  Users,
  FileText,
  BookOpen,
  ArrowRight,
  Sparkles,
  GraduationCap,
  Bell,
  TrendingUp,
  ClipboardCheck,
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

// Import shared UI components
import { StatsCard } from '../../../components/shared/ui/cards/StatsCard';
import { WelcomeHeader } from '../../../components/shared/ui/layout/WelcomeHeader';
import { FadeIn } from '../../../components/shared/ui/layout/PageTransition';

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
  
  // Get courses data from constants (we'll use sections for now)
  const courses = [
    {
      id: 1,
      name: 'Introduction to Programming',
      code: 'CS101',
      students: 120,
      assignments: 7,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      image: '🎓',
    },
    {
      id: 2,
      name: 'Data Structures',
      code: 'CS202',
      students: 100,
      assignments: 6,
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      image: '📊',
    },
    {
      id: 3,
      name: 'Advanced Algorithms',
      code: 'CS303',
      students: 90,
      assignments: 5,
      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      image: '⚡',
    },
    {
      id: 4,
      name: 'Databases',
      code: 'CS303',
      students: 90,
      assignments: 5,
      background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      image: '🗄️',
    },
  ];

  // Calculate stats
  const totalStudents = sections.reduce((sum, s) => sum + s.enrolled, 0);
  const activeCourses = sections.length;
  const pendingGradingTasks = 12;

  // Chart data
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

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <FadeIn direction="down" delay={0}>
        <WelcomeHeader
          greeting="Good morning"
          userName="Prof. Sarah"
          subtitle="You have"
          highlightText={`${pendingGradingTasks} assignments to grade and ${upcomingClasses.length} classes today`}
          role="instructor"
          actions={
            <button
              onClick={() => onNavigate('ai-tools')}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              AI Grading Assistant
            </button>
          }
        />
      </FadeIn>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <FadeIn delay={100}>
          <StatsCard
            title={t('activeCourses')}
            value={activeCourses}
            subtitle="this semester"
            icon={<BookOpen className="w-5 h-5" />}
            trend={{ value: 1, label: 'new course', isPositive: true }}
            color="indigo"
          />
        </FadeIn>
        <FadeIn delay={150}>
          <StatsCard
            title={t('pendingGrading')}
            value={pendingGradingTasks}
            subtitle="assignments"
            icon={<ClipboardCheck className="w-5 h-5" />}
            trend={{ value: 4, label: 'this week', isPositive: false }}
            color="amber"
          />
        </FadeIn>
        <FadeIn delay={200}>
          <StatsCard
            title={t('totalStudents')}
            value={totalStudents}
            subtitle="enrolled"
            icon={<Users className="w-5 h-5" />}
            trend={{ value: 16, label: 'new enrollments', isPositive: true }}
            color="green"
          />
        </FadeIn>
        <FadeIn delay={250}>
          <StatsCard
            title="Avg. Attendance"
            value={92}
            valueSuffix="%"
            subtitle="this month"
            icon={<Clock className="w-5 h-5" />}
            trend={{ value: 3, label: 'increase', isPositive: true }}
            color="cyan"
          />
        </FadeIn>
      </div>

      {/* Courses Overview */}
      <div className={`rounded-xl p-6 border shadow-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('myCourses')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className={`rounded-xl overflow-hidden border hover:shadow-lg transition-all cursor-pointer ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
            >
              {/* Course Image/Background */}
              <div
                className="h-32 flex items-center justify-center text-6xl relative"
                style={{ background: course.background, opacity: 0.85 }}
              >
                <span className="opacity-40">{course.image}</span>
              </div>

              {/* Course Info */}
              <div className={`p-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{course.name}</h3>
                <div className={`flex items-center gap-2 text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <Users size={14} />
                  <span>{course.students} {t('students')}</span>
                </div>
                <div className={`flex items-center gap-2 text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <FileText size={14} />
                  <span>{course.assignments} {t('assignments')}</span>
                </div>
                <button
                  onClick={() => onNavigate('courses')}
                  className="w-full flex items-center justify-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  {t('viewCourse')}
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Evy - AI Teaching Assistant */}
          <div
            className="rounded-xl p-6 text-white relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
              opacity: 0.95,
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={20} />
                  <h3 className="text-lg font-semibold">Evy — Your Teaching Assistant</h3>
                </div>
                <p className="text-purple-100 text-sm mb-4 max-w-lg">
                  Get summaries of class performance, generate quizzes, and analyze student
                  progress. Let AI help you focus on what matters most—teaching.
                </p>
                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-white text-purple-600 rounded-lg text-sm font-medium hover:bg-purple-50 transition-colors flex items-center gap-2">
                    <FileText size={16} />
                    Generate Quiz
                  </button>
                  <button className="px-4 py-2 bg-purple-500/30 backdrop-blur-sm text-white rounded-lg text-sm font-medium hover:bg-purple-500/40 transition-colors flex items-center gap-2">
                    <GraduationCap size={16} />
                    Explain Topic
                  </button>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="w-32 h-32 bg-purple-400/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <Sparkles size={48} className="text-purple-200" />
                </div>
              </div>
            </div>
          </div>

          {/* Course Performance Snapshot */}
          <div className={`rounded-xl p-6 border shadow-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Course Performance Snapshot
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={performanceData}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a78bfa" stopOpacity={1} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#f0f0f0'} vertical={false} />
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
                    backgroundColor: isDark ? '#1f2937' : 'white',
                    border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                  cursor={{ fill: isDark ? 'rgba(167, 139, 250, 0.2)' : 'rgba(167, 139, 250, 0.1)' }}
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

          {/* Student Engagement */}
          <div className={`rounded-xl p-6 border shadow-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Student Engagement</h3>
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>72%</span>
                <TrendingUp className="text-green-600" size={20} />
                <span className="text-sm text-green-600 font-medium">+2%</span>
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
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#f0f0f0'} />
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
                    backgroundColor: isDark ? '#1f2937' : 'white',
                    border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#10b981"
                  strokeWidth={3}
                  fill="url(#engagementGradient)"
                  dot={{ fill: '#10b981', r: 5, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 7 }}
                  animationDuration={1500}
                  animationBegin={0}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column - 1/3 */}
        <div className="space-y-6">
          {/* Quick Access */}
          <div className={`rounded-xl p-6 border shadow-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Quick Access</h3>
            <div className="space-y-3">
              <button
                onClick={() => onNavigate('grades')}
                className={`w-full flex items-center gap-3 p-4 rounded-lg transition-colors text-left ${isDark ? 'bg-blue-900/30 hover:bg-blue-900/50' : 'bg-blue-50 hover:bg-blue-100'}`}
              >
                <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
                  <FileText className="text-blue-600 dark:text-blue-400" size={18} />
                </div>
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Grade Assignments</span>
              </button>
              <button
                onClick={() => onNavigate('messages')}
                className={`w-full flex items-center gap-3 p-4 rounded-lg transition-colors text-left ${isDark ? 'bg-purple-900/30 hover:bg-purple-900/50' : 'bg-purple-50 hover:bg-purple-100'}`}
              >
                <div className={`p-2 rounded-lg ${isDark ? 'bg-purple-900/50' : 'bg-purple-100'}`}>
                  <Bell className="text-purple-600 dark:text-purple-400" size={18} />
                </div>
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Post Announcement</span>
              </button>
            </div>
          </div>

          {/* Upcoming Teaching Events */}
          <div className={`rounded-xl p-6 border shadow-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Upcoming Teaching Events</h3>
            <div className="space-y-4">
              {[
                {
                  title: 'Calculus Lecture',
                  time: '10:10 AM',
                  date: 'May 12',
                  icon: Calendar,
                  colorLight: 'bg-blue-50 text-blue-600',
                  colorDark: 'bg-blue-900/50 text-blue-400',
                },
                {
                  title: 'Physics Lab',
                  time: '2:00 PM',
                  date: 'May 13',
                  icon: Calendar,
                  colorLight: 'bg-purple-50 text-purple-600',
                  colorDark: 'bg-purple-900/50 text-purple-400',
                },
                {
                  title: 'Office Hours',
                  time: '3:00 PM',
                  date: 'May 14',
                  icon: Calendar,
                  colorLight: 'bg-green-50 text-green-600',
                  colorDark: 'bg-green-900/50 text-green-400',
                },
              ].map((event, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer ${isDark ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'}`}
                >
                  <div className={`p-2 rounded-lg ${isDark ? event.colorDark : event.colorLight}`}>
                    <event.icon size={16} />
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{event.title}</h4>
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{event.time}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded border ${isDark ? 'text-gray-400 bg-gray-700 border-gray-600' : 'text-gray-500 bg-white border-gray-200'}`}>
                    {event.date}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModernDashboard;

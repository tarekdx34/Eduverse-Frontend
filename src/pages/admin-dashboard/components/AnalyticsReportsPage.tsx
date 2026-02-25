import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  BookOpen,
  Brain,
  Download,
  FileText,
  FileSpreadsheet,
  Calendar,
  Filter,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

interface AnalyticsReportsPageProps {
  analytics: any;
  onExport: (format: string) => void;
}

export function AnalyticsReportsPage({ analytics, onExport }: AnalyticsReportsPageProps) {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [dateRange, setDateRange] = useState('lastMonth');
  const [activeReport, setActiveReport] = useState('users');

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const engagementData = [
    { name: 'Week 1', logins: 4200, submissions: 1800, messages: 3200 },
    { name: 'Week 2', logins: 4500, submissions: 2100, messages: 3500 },
    { name: 'Week 3', logins: 4100, submissions: 1950, messages: 3100 },
    { name: 'Week 4', logins: 4800, submissions: 2300, messages: 3800 },
  ];

  const coursePerformance = [
    { course: 'CS101', avgGrade: 82, completion: 78, engagement: 85 },
    { course: 'CS202', avgGrade: 78, completion: 72, engagement: 80 },
    { course: 'MATH101', avgGrade: 75, completion: 68, engagement: 72 },
    { course: 'ENG201', avgGrade: 80, completion: 75, engagement: 78 },
  ];

  const roleDistribution = [
    { name: 'Students', value: 5200 },
    { name: 'Instructors', value: 205 },
    { name: 'TAs', value: 85 },
    { name: 'Admins', value: 15 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('analytics')}</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('systemWideAnalytics')}</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
          >
            <option value="lastWeek">{t('lastWeek')}</option>
            <option value="lastMonth">{t('last30Days')}</option>
            <option value="lastQuarter">{t('last3Months')}</option>
            <option value="lastYear">{t('lastYear')}</option>
          </select>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onExport('pdf')}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <FileText size={18} />
              {t('exportPDF')}
            </button>
            <button
              onClick={() => onExport('excel')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
            >
              <FileSpreadsheet size={18} />
              {t('exportExcel')}
            </button>
          </div>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className={`p-2 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex gap-2">
          {[
            { id: 'users', label: t('userAnalytics'), icon: Users },
            { id: 'courses', label: t('courseAnalytics'), icon: BookOpen },
            { id: 'engagement', label: t('engagement'), icon: TrendingUp },
            { id: 'ai', label: t('aiUsage'), icon: Brain },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveReport(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeReport === tab.id
                  ? 'bg-red-600 text-white'
                  : isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* User Analytics */}
      {activeReport === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Growth Chart */}
          <div className={`lg:col-span-2 rounded-xl p-6 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('userGrowthTrend')}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.userGrowth}>
                <defs>
                  <linearGradient id="studentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="instructorGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#f0f0f0'} />
                <XAxis dataKey="month" tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }} />
                <YAxis tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: isDark ? '#1f2937' : 'white', border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`, borderRadius: '8px' }} />
                <Area type="monotone" dataKey="students" stroke="#3b82f6" strokeWidth={2} fill="url(#studentGrad)" name="Students" />
                <Area type="monotone" dataKey="instructors" stroke="#10b981" strokeWidth={2} fill="url(#instructorGrad)" name="Instructors" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Role Distribution */}
          <div className={`rounded-xl p-6 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('userDistribution')}</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={roleDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label>
                  {roleDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* User Stats Summary */}
          <div className={`lg:col-span-3 grid grid-cols-4 gap-4`}>
            {[
              { label: t('totalUsers'), value: '5,505', change: '+12%', positive: true },
              { label: t('activeTodayLabel'), value: '2,340', change: '+5%', positive: true },
              { label: t('newThisMonth'), value: '320', change: '+18%', positive: true },
              { label: t('inactiveUsers'), value: '245', change: '-8%', positive: true },
            ].map((stat, index) => (
              <div key={index} className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</div>
                <div className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{stat.value}</div>
                <div className={`text-sm mt-1 ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>{stat.change}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Course Analytics */}
      {activeReport === 'courses' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Course Performance Chart */}
          <div className={`rounded-xl p-6 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('coursePerformance')}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={coursePerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#f0f0f0'} />
                <XAxis dataKey="course" tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }} />
                <YAxis tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: isDark ? '#1f2937' : 'white', border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`, borderRadius: '8px' }} />
                <Bar dataKey="avgGrade" fill="#3b82f6" name="Avg Grade" />
                <Bar dataKey="completion" fill="#10b981" name="Completion %" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Course Engagement */}
          <div className={`rounded-xl p-6 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('engagementByCourse')}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.courseEngagement} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#f0f0f0'} />
                <XAxis type="number" tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }} />
                <YAxis dataKey="course" type="category" tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }} width={60} />
                <Tooltip contentStyle={{ backgroundColor: isDark ? '#1f2937' : 'white', border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`, borderRadius: '8px' }} />
                <Bar dataKey="avgAttendance" fill="#8b5cf6" name="Attendance %" />
                <Bar dataKey="activeStudents" fill="#f59e0b" name="Active Students" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Course Stats */}
          <div className={`lg:col-span-2 rounded-xl p-6 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('courseStatistics')}</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={isDark ? 'border-b border-gray-700' : 'border-b border-gray-200'}>
                    <th className={`text-left py-3 px-4 text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('course')}</th>
                    <th className={`text-left py-3 px-4 text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('avgGrade')}</th>
                    <th className={`text-left py-3 px-4 text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('attendance')}</th>
                    <th className={`text-left py-3 px-4 text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('activeUsers')}</th>
                    <th className={`text-left py-3 px-4 text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('enrollmentTrends')}</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.courseEngagement?.map((course: any, index: number) => (
                    <tr key={index} className={isDark ? 'border-b border-gray-700' : 'border-b border-gray-100'}>
                      <td className={`py-3 px-4 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{course.course}</td>
                      <td className={`py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{course.avgGrade}%</td>
                      <td className={`py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{course.avgAttendance}%</td>
                      <td className={`py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{course.activeStudents}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 ${isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700'} text-xs rounded-full`}>+5%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Engagement Analytics */}
      {activeReport === 'engagement' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`lg:col-span-2 rounded-xl p-6 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('weeklyEngagement')}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#f0f0f0'} />
                <XAxis dataKey="name" tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }} />
                <YAxis tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: isDark ? '#1f2937' : 'white', border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`, borderRadius: '8px' }} />
                <Legend />
                <Line type="monotone" dataKey="logins" stroke="#3b82f6" strokeWidth={2} name="Logins" />
                <Line type="monotone" dataKey="submissions" stroke="#10b981" strokeWidth={2} name="Submissions" />
                <Line type="monotone" dataKey="messages" stroke="#f59e0b" strokeWidth={2} name="Messages" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4">
            {[
              { label: 'Avg Daily Logins', value: '4,400', icon: Users, color: 'blue' },
              { label: 'Avg Daily Submissions', value: '2,040', icon: FileText, color: 'green' },
              { label: 'Avg Session Duration', value: '24 min', icon: Calendar, color: 'purple' },
              { label: 'Peak Hours', value: '2-4 PM', icon: TrendingUp, color: 'orange' },
            ].map((stat, index) => (
              <div key={index} className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: isDark ? { blue: 'rgba(59,130,246,0.2)', green: 'rgba(16,185,129,0.2)', purple: 'rgba(139,92,246,0.2)', orange: 'rgba(249,115,22,0.2)' }[stat.color] : { blue: '#dbeafe', green: '#dcfce7', purple: '#ede9fe', orange: '#ffedd5' }[stat.color] }}>
                    <stat.icon style={{ color: { blue: '#2563eb', green: '#16a34a', purple: '#7c3aed', orange: '#ea580c' }[stat.color] }} size={20} />
                  </div>
                  <div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</div>
                    <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stat.value}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Usage Analytics */}
      {activeReport === 'ai' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {analytics.aiUsage?.map((item: any, index: number) => (
              <div key={index} className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{item.feature}</span>
                  <span className={`text-xs font-medium ${isDark ? 'text-green-400' : 'text-green-600'}`}>{item.trend}</span>
                </div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.usage.toLocaleString()}</div>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>requests this month</div>
              </div>
            ))}
          </div>

          <div className={`rounded-xl p-6 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('aiUsageStats')}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.aiUsage}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#f0f0f0'} />
                <XAxis dataKey="feature" tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }} />
                <YAxis tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: isDark ? '#1f2937' : 'white', border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`, borderRadius: '8px' }} />
                <Bar dataKey="usage" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

export default AnalyticsReportsPage;

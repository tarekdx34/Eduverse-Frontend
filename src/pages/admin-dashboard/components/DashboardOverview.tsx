import React from 'react';
import {
  Users,
  BookOpen,
  Building2,
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

interface DashboardOverviewProps {
  stats: any;
  analytics: any;
  recentActivity: any[];
  onNavigate: (tab: string) => void;
}

export function DashboardOverview({ stats, analytics, recentActivity, onNavigate }: DashboardOverviewProps) {
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const userDistribution = [
    { name: 'Students', value: 5200, color: '#3b82f6' },
    { name: 'Instructors', value: 205, color: '#10b981' },
    { name: 'Admins', value: 15, color: '#f59e0b' },
  ];

  const systemHealth = [
    { label: 'CPU Usage', value: stats.systemMetrics?.cpuUsage || 45, color: 'bg-blue-500' },
    { label: 'Memory', value: stats.systemMetrics?.memoryUsage || 62, color: 'bg-green-500' },
    { label: 'Storage', value: stats.systemMetrics?.storageUsage || 48, color: 'bg-yellow-500' },
    { label: 'Network', value: stats.systemMetrics?.networkLoad || 35, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`rounded-xl p-6 border shadow-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-900/50' : 'bg-blue-50'}`}>
              <Users className="text-blue-600" size={20} />
            </div>
          </div>
          <div className={`text-3xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalUsers?.toLocaleString()}</div>
          <div className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('totalUsers')}</div>
          <div className="text-xs text-green-600 font-medium">+{stats.activeUsers?.toLocaleString()} {t('active')}</div>
        </div>

        <div className={`rounded-xl p-6 border shadow-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-green-900/50' : 'bg-green-50'}`}>
              <BookOpen className="text-green-600" size={20} />
            </div>
          </div>
          <div className={`text-3xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalCourses}</div>
          <div className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('totalCourses')}</div>
          <div className="text-xs text-green-600 font-medium">{stats.activeCourses} {t('activeCourses')}</div>
        </div>

        <div className={`rounded-xl p-6 border shadow-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-purple-900/50' : 'bg-purple-50'}`}>
              <Building2 className="text-purple-600" size={20} />
            </div>
          </div>
          <div className={`text-3xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalDepartments}</div>
          <div className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('totalDepartments')}</div>
          <div className="text-xs text-blue-600 font-medium">Across 4 faculties</div>
        </div>

        <div className={`rounded-xl p-6 border shadow-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-orange-900/50' : 'bg-orange-50'}`}>
              <Activity className="text-orange-600" size={20} />
            </div>
          </div>
          <div className={`text-3xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.systemUptime}</div>
          <div className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('systemUptime')}</div>
          <div className="text-xs text-green-600 font-medium flex items-center gap-1">
            <CheckCircle2 size={12} /> {t('allOperational')}
          </div>
        </div>
      </div>

      {/* System Health Banner */}
      <div
        className="rounded-xl p-6 text-white relative overflow-hidden"
        style={{ background: isDark ? 'linear-gradient(135deg, #991b1b 0%, #9a3412 100%)' : 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)' }}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={20} />
              <h3 className="text-lg font-semibold">{t('platformHealthDashboard')}</h3>
            </div>
            <p className="text-red-100 text-sm mb-4 max-w-lg">
              {t('monitorPerformance')}
            </p>
            <div className="grid grid-cols-4 gap-4">
              {systemHealth.map((metric) => (
                <div key={metric.label} className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                  <div className="text-xs text-red-100 mb-1">{metric.label}</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                      <div className={`h-full ${metric.color} rounded-full`} style={{ width: `${metric.value}%` }} />
                    </div>
                    <span className="text-sm font-semibold">{metric.value}%</span>
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
          {/* User Growth Chart */}
          <div className={`rounded-xl p-6 border shadow-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('userGrowthTrend')}</h3>
              <div className="flex items-center gap-2">
                <TrendingUp className="text-green-600" size={16} />
                <span className="text-sm text-green-600 font-medium">+12% this month</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={analytics.userGrowth}>
                <defs>
                  <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#f0f0f0'} />
                <XAxis dataKey="month" tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }} axisLine={{ stroke: isDark ? '#374151' : '#e5e7eb' }} />
                <YAxis tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }} axisLine={{ stroke: isDark ? '#374151' : '#e5e7eb' }} />
                <Tooltip contentStyle={{ backgroundColor: isDark ? '#1f2937' : 'white', border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`, borderRadius: '8px' }} />
                <Area type="monotone" dataKey="students" stroke="#3b82f6" strokeWidth={2} fill="url(#userGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* AI Usage Stats */}
          <div className={`rounded-xl p-6 border shadow-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('aiUsageStats')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analytics.aiUsage?.map((item: any, index: number) => (
                <div key={index} className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{item.feature}</span>
                    <span className="text-xs text-green-600 font-medium">{item.trend}</span>
                  </div>
                  <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.usage.toLocaleString()}</div>
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('requestsThisMonth')}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - 1/3 */}
        <div className="space-y-6">
          {/* User Distribution */}
          <div className={`rounded-xl p-6 border shadow-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('userDistribution')}</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={userDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {userDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Actions */}
          <div className={`rounded-xl p-6 border shadow-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('quickActions')}</h3>
            <div className="space-y-3">
              <button
                onClick={() => onNavigate('users')}
                className={`w-full flex items-center gap-3 p-4 rounded-lg transition-colors text-left ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-blue-50 hover:bg-blue-100'}`}
              >
                <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
                  <Users className="text-blue-600" size={18} />
                </div>
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('manageUsers')}</span>
                <ArrowRight size={16} className={`ml-auto ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              </button>
              <button
                onClick={() => onNavigate('communication')}
                className={`w-full flex items-center gap-3 p-4 rounded-lg transition-colors text-left ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-orange-50 hover:bg-orange-100'}`}
              >
                <div className={`p-2 rounded-lg ${isDark ? 'bg-orange-900/50' : 'bg-orange-100'}`}>
                  <AlertCircle className="text-orange-600" size={18} />
                </div>
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('sendBroadcast')}</span>
                <ArrowRight size={16} className={`ml-auto ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className={`rounded-xl p-6 border shadow-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('recentActivity')}</h3>
            <div className="space-y-4">
              {recentActivity.slice(0, 4).map((activity, index) => (
                <div key={index} className={`flex items-start gap-3 p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className={`p-2 rounded-lg ${
                    activity.type === 'user' ? (isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600') :
                    activity.type === 'course' ? (isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600') :
                    activity.type === 'alert' ? (isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600') :
                    (isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600')
                  }`}>
                    {activity.type === 'user' ? <Users size={14} /> :
                     activity.type === 'course' ? <BookOpen size={14} /> :
                     activity.type === 'alert' ? <AlertCircle size={14} /> :
                     <Activity size={14} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{activity.title}</h4>
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

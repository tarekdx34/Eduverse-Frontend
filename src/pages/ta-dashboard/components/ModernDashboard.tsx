import React from 'react';
import {
  Calendar,
  Users,
  FileText,
  BookOpen,
  ArrowRight,
  Clock,
  TrendingUp,
  MessageSquare,
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
  const { isDark } = useTheme();
  const { t, isRTL } = useLanguage();

  const performanceData = courses.map((course) => ({
    course: course.code,
    value: course.averageGrade,
  }));

  const cardCls = isDark
    ? 'bg-gray-800 border-gray-700 shadow-sm'
    : 'bg-white border-gray-200 shadow-sm';
  const textCls = isDark ? 'text-gray-100' : 'text-gray-900';
  const mutedCls = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderCls = isDark ? 'border-gray-700' : 'border-gray-200';
  const hoverCls = isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50';
  const iconBgCls = isDark ? 'bg-indigo-900/50' : 'bg-indigo-100';
  const iconCls = isDark ? 'text-indigo-300' : 'text-indigo-600';

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {[
          { key: 'assignedCourses', value: stats.totalCourses, Icon: BookOpen, color: 'indigo' },
          { key: 'activeLabs', value: stats.activeLabs, Icon: Clock, color: 'green' },
          { key: 'pendingSubmissions', value: stats.pendingSubmissions, Icon: FileText, color: 'orange' },
          { key: 'avgPerformance', value: `${stats.averagePerformance}%`, Icon: TrendingUp, color: 'indigo' },
          { key: 'unreadMessages', value: stats.unreadMessages, Icon: MessageSquare, color: 'red' },
          { key: 'upcomingLabs', value: stats.upcomingLabs, Icon: Calendar, color: 'indigo' },
        ].map(({ key, value, Icon }) => (
          <div
            key={key}
            className={`${cardCls} border rounded-lg p-6 hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBgCls}`}>
                <Icon className={`w-5 h-5 ${iconCls}`} />
              </div>
              <div>
                <p className={`text-xs ${mutedCls}`}>{t(key)}</p>
                <p className={`text-2xl font-bold ${textCls}`}>{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 ${cardCls} border rounded-lg p-6`}>
          <h3 className={`text-lg font-semibold ${textCls} mb-4`}>{t('coursePerformance')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
              <XAxis dataKey="course" stroke={isDark ? '#9ca3af' : '#6b7280'} />
              <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
              <Tooltip />
              <Bar dataKey="value" fill={isDark ? '#818cf8' : '#4f46e5'} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={`${cardCls} border rounded-lg p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${textCls}`}>{t('upcomingLabs')}</h3>
            <button
              onClick={() => onNavigate('labs')}
              className={`text-sm font-medium ${isDark ? 'text-indigo-300 hover:text-indigo-200' : 'text-indigo-600 hover:text-indigo-700'}`}
            >
              {t('viewAll')}
            </button>
          </div>
          <div className="space-y-3">
            {upcomingLabs.slice(0, 5).map((lab) => (
              <div
                key={lab.id}
                className={`p-3 border ${borderCls} rounded-lg ${hoverCls} transition-colors cursor-pointer`}
                onClick={() => onNavigate('labs')}
              >
                <p className={`text-sm font-medium ${textCls}`}>{lab.title}</p>
                <p className={`text-xs ${mutedCls} mt-1`}>{lab.course}</p>
                <div className={`flex items-center gap-2 mt-2 text-xs ${mutedCls}`}>
                  <Calendar className="w-3 h-3" />
                  <span>{lab.date}</span>
                  <span>•</span>
                  <span>{lab.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${cardCls} border rounded-lg p-6`}>
          <h3 className={`text-lg font-semibold ${textCls} mb-4`}>{t('recentActivity')}</h3>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className={`flex items-start gap-3 p-3 border ${borderCls} rounded-lg`}
              >
                <div className={`w-8 h-8 rounded-full ${iconBgCls} flex items-center justify-center flex-shrink-0`}>
                  {activity.type === 'submission' && <FileText className={`w-4 h-4 ${iconCls}`} />}
                  {activity.type === 'question' && <MessageSquare className={`w-4 h-4 ${iconCls}`} />}
                  {activity.type === 'grade' && <TrendingUp className={`w-4 h-4 ${iconCls}`} />}
                  {activity.type === 'attendance' && <Users className={`w-4 h-4 ${iconCls}`} />}
                </div>
                <div className="flex-1">
                  <p className={`text-sm ${textCls}`}>{activity.message}</p>
                  <div className={`flex items-center gap-2 mt-1 text-xs ${mutedCls}`}>
                    <span>{activity.course}</span>
                    <span>•</span>
                    <span>{new Date(activity.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`${cardCls} border rounded-lg p-6`}>
          <h3 className={`text-lg font-semibold ${textCls} mb-4`}>{t('quickActions')}</h3>
          <div className="space-y-2">
            <button
              onClick={() => onNavigate('courses')}
              className={`w-full flex items-center justify-between p-3 border ${borderCls} rounded-lg ${hoverCls} transition-colors`}
            >
              <div className="flex items-center gap-3">
                <BookOpen className={`w-5 h-5 ${iconCls}`} />
                <span className={`text-sm font-medium ${textCls}`}>{t('viewAllCourses')}</span>
              </div>
              <ArrowRight className={`w-4 h-4 ${mutedCls}`} />
            </button>
            <button
              onClick={() => onNavigate('grading')}
              className={`w-full flex items-center justify-between p-3 border ${borderCls} rounded-lg ${hoverCls} transition-colors`}
            >
              <div className="flex items-center gap-3">
                <FileText className={`w-5 h-5 ${iconCls}`} />
                <span className={`text-sm font-medium ${textCls}`}>
                  {t('gradePendingSubmissions')} ({stats.pendingSubmissions})
                </span>
              </div>
              <ArrowRight className={`w-4 h-4 ${mutedCls}`} />
            </button>
            <button
              onClick={() => onNavigate('communication')}
              className={`w-full flex items-center justify-between p-3 border ${borderCls} rounded-lg ${hoverCls} transition-colors`}
            >
              <div className="flex items-center gap-3">
                <MessageSquare className={`w-5 h-5 ${iconCls}`} />
                <span className={`text-sm font-medium ${textCls}`}>
                  {t('checkMessages')} ({stats.unreadMessages})
                </span>
              </div>
              <ArrowRight className={`w-4 h-4 ${mutedCls}`} />
            </button>
            <button
              onClick={() => onNavigate('labs')}
              className={`w-full flex items-center justify-between p-3 border ${borderCls} rounded-lg ${hoverCls} transition-colors`}
            >
              <div className="flex items-center gap-3">
                <Clock className={`w-5 h-5 ${iconCls}`} />
                <span className={`text-sm font-medium ${textCls}`}>{t('manageLabs')}</span>
              </div>
              <ArrowRight className={`w-4 h-4 ${mutedCls}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModernDashboard;

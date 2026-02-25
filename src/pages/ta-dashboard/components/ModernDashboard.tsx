import React from 'react';
import {
  Calendar,
  Users,
  FileText,
  MapPin,
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
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

type DashboardProps = {
  stats: any;
  courses: any[];
  upcomingLabs: any[];
  recentActivity: any[];
  onNavigate: (tab: string) => void;
};

export function ModernDashboard({
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

  const cardClass = `rounded-lg p-6 border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`;
  const headingClass = `text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`;
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-gray-600';
  const textMuted = isDark ? 'text-slate-500' : 'text-gray-500';
  const innerCardClass = `rounded-lg border ${isDark ? 'border-white/10 hover:bg-white/5' : 'border-gray-200 hover:bg-gray-50'}`;

  return (
    <div className="space-y-6">
      {/* Charts and Upcoming Teaching */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Chart */}
        <div className={`lg:col-span-2 ${cardClass}`}>
          <h3 className={`${headingClass} mb-4`}>{t('coursePerformance')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
              <XAxis dataKey="course" tick={{ fill: isDark ? '#94a3b8' : '#6b7280' }} />
              <YAxis tick={{ fill: isDark ? '#94a3b8' : '#6b7280' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#1e293b' : '#fff',
                  border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
                  color: isDark ? '#f1f5f9' : '#111827',
                }}
              />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Upcoming Teaching */}
        <div className={cardClass}>
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
                <div className={`flex items-center gap-2 mt-2 text-xs ${textMuted}`}>
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
      </div>

      {/* Recent Activity */}
      <div className={cardClass}>
        <h3 className={`${headingClass} mb-4`}>{t('recentActivity')}</h3>
        <div className="space-y-3">
          {recentActivity.map((activity) => (
            <div key={activity.id} className={`flex items-start gap-3 p-3 ${innerCardClass}`}>
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                {activity.type === 'submission' && <FileText className="w-4 h-4 text-blue-600" />}
                {activity.type === 'question' && <MessageSquare className="w-4 h-4 text-blue-600" />}
                {activity.type === 'grade' && <TrendingUp className="w-4 h-4 text-blue-600" />}
                {activity.type === 'attendance' && <Users className="w-4 h-4 text-blue-600" />}
              </div>
              <div className="flex-1">
                <p className={`text-sm ${textPrimary}`}>{activity.message}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs ${textMuted}`}>{activity.course}</span>
                  <span className={`text-xs ${isDark ? 'text-slate-600' : 'text-gray-400'}`}>•</span>
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
  );
}

export default ModernDashboard;

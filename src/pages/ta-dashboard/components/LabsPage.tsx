import React, { useState } from 'react';
import { Beaker, Calendar, MapPin, Users, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

type Lab = {
  id: string;
  courseId: string;
  courseName: string;
  labNumber: number;
  title: string;
  date: string;
  time: string;
  location: string;
  status: 'upcoming' | 'active' | 'completed';
  submissionCount: number;
  gradedCount: number;
  attendanceCount: number;
};

type LabsPageProps = {
  labs: Lab[];
  onViewLab: (labId: string) => void;
  disableCreateReason?: string;
  disableViewDetailsReason?: string;
};

export function LabsPage({
  labs,
  onViewLab,
  disableCreateReason,
  disableViewDetailsReason,
}: LabsPageProps) {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'active' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLabs = labs.filter((lab) => {
    const matchesFilter = filter === 'all' || lab.status === filter;
    const matchesSearch =
      lab.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lab.courseName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return (
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-800'}`}>
            {t('upcoming')}
          </span>
        );
      case 'active':
        return (
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${isDark ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-800'}`}>
            {t('active')}
          </span>
        );
      case 'completed':
        return (
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${isDark ? 'bg-gray-500/20 text-gray-300' : 'bg-gray-100 text-gray-800'}`}>
            {t('completed')}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('labManagement')}</h2>
          <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>{t('manageLabSessions')}</p>
        </div>
        <button
          disabled={Boolean(disableCreateReason)}
          title={disableCreateReason || undefined}
          className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
        >
          {t('createNewLab')}
        </button>
      </div>

      {/* Filters and Search */}
      <div className={`border rounded-lg p-4 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder={t('searchLabsPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-slate-400' : 'border-gray-300'}`}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(['all', 'upcoming', 'active', 'completed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : isDark
                      ? 'bg-white/10 text-slate-300 hover:bg-white/20'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? t('all') : status === 'upcoming' ? t('upcoming') : status === 'active' ? t('active') : t('completed')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Labs Table */}
      <div className={`border rounded-lg overflow-hidden ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`border-b ${isDark ? 'bg-transparent border-white/10' : 'bg-gray-50 border-gray-200'}`}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  {t('lab')}
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  {t('course')}
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  {t('dateAndTime')}
                </th>
                <th className={`hidden md:table-cell px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  {t('location')}
                </th>
                <th className={`hidden md:table-cell px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  {t('submissions')}
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  {t('status')}
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-white/10' : 'bg-white divide-gray-200'}`}>
              {filteredLabs.map((lab) => (
                <tr key={lab.id} className={`transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-50'}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <Beaker className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{lab.title}</div>
                        <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Lab #{lab.labNumber}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{lab.courseName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      <Calendar className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
                      <div>
                        <div>{lab.date}</div>
                        <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{lab.time}</div>
                      </div>
                    </div>
                  </td>
                  <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                    <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      <MapPin className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
                      {lab.location}
                    </div>
                  </td>
                  <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      <div className="flex items-center gap-2">
                        <FileText className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
                        <span>
                          {lab.gradedCount}/{lab.submissionCount} {t('graded')}
                        </span>
                      </div>
                      {lab.submissionCount - lab.gradedCount > 0 && (
                        <div className="text-xs text-orange-600 mt-1">
                          {lab.submissionCount - lab.gradedCount} {t('pending')}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(lab.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      <button
                        onClick={() => {
                          if (disableViewDetailsReason) return;
                          onViewLab(lab.id);
                        }}
                        disabled={Boolean(disableViewDetailsReason)}
                        title={disableViewDetailsReason || undefined}
                        className="p-1.5 sm:p-2 text-blue-600 hover:text-blue-700 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {t('viewDetails')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredLabs.length === 0 && (
        <div className={`text-center py-12 border rounded-lg ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
          <Beaker className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
          <p className={isDark ? 'text-slate-400' : 'text-gray-600'}>{t('noLabsFound')}</p>
        </div>
      )}
    </div>
  );
}

export default LabsPage;

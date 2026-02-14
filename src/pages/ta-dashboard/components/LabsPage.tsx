import React, { useState } from 'react';
import { Beaker, Calendar, MapPin, FileText } from 'lucide-react';
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
  onOpenCreateLab?: () => void;
};

export function LabsPage({ labs, onViewLab, onOpenCreateLab }: LabsPageProps) {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'active' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const cardCls = isDark ? 'bg-gray-800 border-gray-700 shadow-sm' : 'bg-white border-gray-200 shadow-sm';
  const textCls = isDark ? 'text-gray-100' : 'text-gray-900';
  const mutedCls = isDark ? 'text-gray-400' : 'text-gray-600';
  const inputCls = isDark
    ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
    : 'border-gray-300 text-gray-900';
  const btnPrimaryCls = isDark ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white';
  const btnSecondaryCls = isDark ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200';
  const theadCls = isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200';
  const thCls = `px-6 py-3 text-left text-xs font-medium ${mutedCls} uppercase tracking-wider`;
  const rowHoverCls = isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50';
  const divideCls = isDark ? 'divide-gray-700' : 'divide-gray-200';
  const linkCls = isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700';

  const filteredLabs = labs.filter((lab) => {
    const matchesFilter = filter === 'all' || lab.status === filter;
    const matchesSearch =
      lab.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lab.courseName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const labels: Record<string, string> = { upcoming: t('upcoming'), active: t('active'), completed: t('completed') };
    const styles: Record<string, string> = {
      upcoming: isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800',
      active: isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800',
      completed: isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800',
    };
    const cls = styles[status] || '';
    if (!cls) return null;
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${cls}`}>{labels[status] || status}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${textCls}`}>{t('labManagement')}</h2>
          <p className={`${mutedCls} mt-1`}>{t('manageLabSessions')}</p>
        </div>
        <button
          onClick={() => onOpenCreateLab?.()}
          className={`${btnPrimaryCls} px-4 py-2 rounded-lg transition-colors text-sm font-medium`}
        >
          {t('createNewLab')}
        </button>
      </div>

      <div className={`${cardCls} border rounded-lg p-4`}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder={t('searchLabs')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${inputCls}`}
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'upcoming', 'active', 'completed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === status ? btnPrimaryCls : btnSecondaryCls
                }`}
              >
                {status === 'all' ? t('all') : t(status)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={`${cardCls} border rounded-lg overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${theadCls} border-b`}>
              <tr>
                <th className={thCls}>{t('lab')}</th>
                <th className={thCls}>{t('course')}</th>
                <th className={thCls}>{t('dateTime')}</th>
                <th className={thCls}>{t('location')}</th>
                <th className={thCls}>{t('submissions')}</th>
                <th className={thCls}>{t('status')}</th>
                <th className={thCls}>{t('actions')}</th>
              </tr>
            </thead>
            <tbody className={`${cardCls} divide-y ${divideCls}`}>
              {filteredLabs.map((lab) => (
                <tr key={lab.id} className={`${rowHoverCls} transition-colors`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <Beaker className={`w-5 h-5 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                      <div>
                        <div className={`text-sm font-medium ${textCls}`}>{lab.title}</div>
                        <div className={`text-xs ${mutedCls}`}>#{lab.labNumber}</div>
                      </div>
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${textCls}`}>{lab.courseName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`flex items-center gap-2 text-sm ${textCls}`}>
                      <Calendar className={`w-4 h-4 ${mutedCls}`} />
                      <div>
                        <div>{lab.date}</div>
                        <div className={`text-xs ${mutedCls}`}>{lab.time}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`flex items-center gap-2 text-sm ${textCls}`}>
                      <MapPin className={`w-4 h-4 ${mutedCls}`} />
                      {lab.location}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${textCls}`}>
                      <div className="flex items-center gap-2">
                        <FileText className={`w-4 h-4 ${mutedCls}`} />
                        <span>{lab.gradedCount}/{lab.submissionCount} {t('graded')}</span>
                      </div>
                      {lab.submissionCount - lab.gradedCount > 0 && (
                        <div className={`text-xs mt-1 ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                          {lab.submissionCount - lab.gradedCount} {t('pending')}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(lab.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button onClick={() => onViewLab(lab.id)} className={`${linkCls} text-sm font-medium`}>
                      {t('viewDetailsAction')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredLabs.length === 0 && (
        <div className={`text-center py-12 ${cardCls} border rounded-lg`}>
          <Beaker className={`w-12 h-12 ${mutedCls} mx-auto mb-4`} />
          <p className={mutedCls}>{t('noLabsFound')}</p>
        </div>
      )}
    </div>
  );
}

export default LabsPage;

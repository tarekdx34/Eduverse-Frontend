import { useState } from 'react';
import { Building2, Globe, Users, BookOpen, HardDrive, Settings, Plus, Edit2, Trash2, ExternalLink } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

interface MultiCampusPageProps {
  campuses: any[];
  onAddCampus: (campus: any) => void;
  onEditCampus: (id: number, campus: any) => void;
  onDeleteCampus: (id: number) => void;
}

export function MultiCampusPage({ campuses, onAddCampus, onEditCampus, onDeleteCampus }: MultiCampusPageProps) {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [showAddModal, setShowAddModal] = useState(false);

  const totalStudents = campuses.reduce((sum, c) => sum + c.students, 0);
  const totalInstructors = campuses.reduce((sum, c) => sum + c.instructors, 0);
  const totalStorage = campuses.reduce((sum, c) => sum + parseFloat(c.storage), 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'maintenance': return 'bg-yellow-100 text-yellow-700';
      case 'inactive': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('multiCampusManagement')}
          </h1>
          <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('multiCampusDescription')}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('addCampus')}
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`rounded-xl border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-cyan-900/50' : 'bg-cyan-50'}`}>
              <Building2 className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('totalCampuses')}</p>
          </div>
          <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{campuses.length}</p>
        </div>

        <div className={`rounded-xl border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-900/50' : 'bg-blue-50'}`}>
              <Users className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('totalStudents')}</p>
          </div>
          <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {(totalStudents / 1000).toFixed(1)}K
          </p>
        </div>

        <div className={`rounded-xl border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-green-900/50' : 'bg-green-50'}`}>
              <BookOpen className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('totalInstructors')}</p>
          </div>
          <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {totalInstructors.toLocaleString()}
          </p>
        </div>

        <div className={`rounded-xl border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-purple-900/50' : 'bg-purple-50'}`}>
              <HardDrive className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('totalStorage')}</p>
          </div>
          <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {totalStorage.toFixed(1)} TB
          </p>
        </div>
      </div>

      {/* Campus List */}
      <div className={`rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('campusOverview')}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
          {campuses.map((campus) => (
            <div
              key={campus.id}
              className={`rounded-xl border p-6 ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isDark ? 'bg-cyan-900/50' : 'bg-cyan-50'}`}>
                    <Building2 className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {campus.name}
                    </h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(campus.status)}`}>
                      {campus.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditCampus(campus.id, campus)}
                    className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                  >
                    <Edit2 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  </button>
                  <button
                    onClick={() => onDeleteCampus(campus.id)}
                    className={`p-1.5 rounded-lg transition-colors hover:bg-red-100 ${isDark ? 'hover:bg-red-900/30' : ''}`}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <Globe className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <a
                  href={`https://${campus.domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-sm flex items-center gap-1 ${
                    isDark ? 'text-cyan-400 hover:text-cyan-300' : 'text-cyan-600 hover:text-cyan-700'
                  }`}
                >
                  {campus.domain}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {(campus.students / 1000).toFixed(1)}K
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('students')}</p>
                </div>
                <div>
                  <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {campus.instructors}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('instructors')}</p>
                </div>
                <div>
                  <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {campus.storage}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('storage')}</p>
                </div>
              </div>

              <button
                className={`w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isDark
                    ? 'bg-gray-600 hover:bg-gray-500 text-gray-200'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                <Settings className="w-4 h-4" />
                {t('configure')}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MultiCampusPage;

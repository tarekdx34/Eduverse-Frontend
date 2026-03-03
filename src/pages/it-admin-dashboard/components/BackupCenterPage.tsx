import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Database, Download, Upload, Clock, HardDrive, RefreshCw, Calendar } from 'lucide-react';

interface Backup {
  id: number;
  date: string;
  type: string;
  size: string;
  duration: string;
  status: 'success' | 'failed' | 'in_progress';
}

const mockBackups: Backup[] = [
  {
    id: 1,
    date: '2025-01-15 02:00',
    type: 'Full',
    size: '4.2 GB',
    duration: '45 min',
    status: 'success',
  },
  {
    id: 2,
    date: '2025-01-14 02:00',
    type: 'Incremental',
    size: '890 MB',
    duration: '12 min',
    status: 'success',
  },
  {
    id: 3,
    date: '2025-01-13 02:00',
    type: 'Incremental',
    size: '1.1 GB',
    duration: '15 min',
    status: 'success',
  },
  {
    id: 4,
    date: '2025-01-12 02:00',
    type: 'Full',
    size: '4.1 GB',
    duration: '43 min',
    status: 'failed',
  },
  {
    id: 5,
    date: '2025-01-11 02:00',
    type: 'Differential',
    size: '2.3 GB',
    duration: '28 min',
    status: 'success',
  },
];

const statusConfig = {
  success: {
    label: 'Success',
    bg: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  },
  failed: { label: 'Failed', bg: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  in_progress: {
    label: 'In Progress',
    bg: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
};

export function BackupCenterPage() {
  const { isDark, primaryHex } = useTheme() as any;
  const accentColor = primaryHex || '#3b82f6';
  const { t } = useLanguage();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedType, setSelectedType] = useState('Full');
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true);
  const [scheduleFrequency, setScheduleFrequency] = useState('daily');
  const [scheduleTime, setScheduleTime] = useState('02:00');

  const card = isDark
    ? 'bg-[#1e293b]/80 border border-white/5'
    : 'bg-white border border-slate-200 shadow-sm';
  const heading = isDark ? 'text-white' : 'text-slate-900';
  const label = isDark ? 'text-slate-300' : 'text-slate-600';
  const subtleBg = isDark ? 'bg-[#0f172a]' : 'bg-slate-50';

  const overviewCards = [
    {
      title: t('totalBackups') || 'Total Backups',
      value: '142',
      icon: Database,
      color: `text-[${accentColor}]`,
    },
    {
      title: t('lastBackup') || 'Last Backup',
      value: 'Jan 15, 02:00',
      icon: Clock,
      color: 'text-green-500',
    },
    {
      title: t('storageUsed') || 'Storage Used',
      value: '128.4 GB',
      icon: HardDrive,
      color: 'text-amber-500',
    },
    {
      title: t('nextScheduled') || 'Next Scheduled',
      value: 'Jan 16, 02:00',
      icon: Calendar,
      color: 'text-blue-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${heading}`}>
            {t('backupCenter') || 'Backup Center'}
          </h1>
          <p className={`mt-1 text-sm ${label}`}>
            {t('backupCenterDescription') || 'Manage system backups, schedules, and restoration'}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-medium hover:opacity-90 transition-colors"
          style={{ backgroundColor: accentColor }}
        >
          <Upload className="w-4 h-4" />
          {t('createBackup') || 'Create Backup'}
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewCards.map((item) => (
          <div key={item.title} className={`${card} rounded-2xl p-5`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${label}`}>{item.title}</p>
                <p className={`text-2xl font-bold mt-1 ${heading}`}>{item.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Backup History Table */}
      <div className={`${card} rounded-2xl overflow-hidden`}>
        <div className="p-5 border-b ${isDark ? 'border-white/5' : 'border-slate-200'}">
          <h2 className={`text-lg font-semibold ${heading}`}>
            {t('backupHistory') || 'Backup History'}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={subtleBg}>
                {['Date', 'Type', 'Size', 'Duration', 'Status', 'Actions'].map((col) => (
                  <th
                    key={col}
                    className={`px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider ${label}`}
                  >
                    {t(col.toLowerCase()) || col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-slate-100'}`}>
              {mockBackups.map((backup) => {
                const status = statusConfig[backup.status];
                return (
                  <tr
                    key={backup.id}
                    className={`transition-colors ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'}`}
                  >
                    <td className={`px-5 py-4 text-sm ${heading}`}>{backup.date}</td>
                    <td className={`px-5 py-4 text-sm ${label}`}>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          isDark ? 'bg-white/5 text-slate-300' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {backup.type}
                      </span>
                    </td>
                    <td className={`px-5 py-4 text-sm ${label}`}>{backup.size}</td>
                    <td className={`px-5 py-4 text-sm ${label}`}>{backup.duration}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bg}`}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          title={t('restore') || 'Restore'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isDark
                              ? 'hover:bg-white/10 text-slate-400 hover:text-white'
                              : 'hover:bg-slate-100 text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                          title={t('download') || 'Download'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isDark
                              ? 'hover:bg-white/10 text-slate-400 hover:text-white'
                              : 'hover:bg-slate-100 text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Auto-Backup Schedule Settings */}
      <div className={`${card} rounded-2xl p-5`}>
        <h2 className={`text-lg font-semibold mb-4 ${heading}`}>
          {t('autoBackupSchedule') || 'Auto-Backup Schedule'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Enable Toggle */}
          <div className="flex items-center justify-between md:flex-col md:items-start gap-2">
            <span className={`text-sm font-medium ${label}`}>
              {t('autoBackup') || 'Auto Backup'}
            </span>
            <button
              onClick={() => setAutoBackupEnabled(!autoBackupEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
              style={{
                backgroundColor: autoBackupEnabled ? accentColor : isDark ? '#475569' : '#cbd5e1',
              }}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  autoBackupEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Frequency */}
          <div className="flex flex-col gap-2">
            <label className={`text-sm font-medium ${label}`}>
              {t('frequency') || 'Frequency'}
            </label>
            <select
              value={scheduleFrequency}
              onChange={(e) => setScheduleFrequency(e.target.value)}
              className={`rounded-xl px-3 py-2 text-sm border outline-none transition-colors ${
                isDark
                  ? 'bg-[#0f172a] border-white/10 text-white'
                  : 'bg-white border-slate-300 text-slate-900'
              }`}
            >
              <option value="daily">{t('daily') || 'Daily'}</option>
              <option value="weekly">{t('weekly') || 'Weekly'}</option>
              <option value="monthly">{t('monthly') || 'Monthly'}</option>
            </select>
          </div>

          {/* Time */}
          <div className="flex flex-col gap-2">
            <label className={`text-sm font-medium ${label}`}>{t('time') || 'Time'}</label>
            <input
              type="time"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
              className={`rounded-xl px-3 py-2 text-sm border outline-none transition-colors ${
                isDark
                  ? 'bg-[#0f172a] border-white/10 text-white'
                  : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Create Backup Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className={`${card} rounded-2xl p-6 w-full max-w-md`}>
            <h3 className={`text-lg font-semibold mb-4 ${heading}`}>
              {t('createBackup') || 'Create Backup'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${label}`}>
                  {t('backupType') || 'Backup Type'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Full', 'Incremental', 'Differential'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                        selectedType === type
                          ? ''
                          : isDark
                            ? 'bg-white/5 text-slate-300 hover:bg-white/10'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                      style={
                        selectedType === type
                          ? { backgroundColor: accentColor, color: 'white' }
                          : undefined
                      }
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isDark
                      ? 'bg-white/5 text-slate-300 hover:bg-white/10'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {t('cancel') || 'Cancel'}
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90 transition-colors"
                  style={{ backgroundColor: accentColor }}
                >
                  {t('startBackup') || 'Start Backup'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

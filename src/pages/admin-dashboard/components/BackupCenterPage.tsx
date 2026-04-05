import React, { useState } from 'react';
import {
  Database,
  Download,
  Upload,
  Clock,
  HardDrive,
  FileText,
  RefreshCw,
  Trash2,
  CheckCircle,
  XCircle,
  Archive,
  Settings,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { CleanSelect } from '../../../components/shared';

type TabId = 'overview' | 'backups' | 'export';
type ExportFormat = 'csv' | 'xlsx' | 'pdf' | 'json';
type BackupFrequency = 'daily' | 'weekly' | 'monthly';

interface BackupEntry {
  id: number;
  type: string;
  size: string;
  date: string;
  trigger: 'Auto' | 'Manual';
  status: 'completed' | 'failed';
}

interface ExportHistoryItem {
  id: number;
  name: string;
  format: string;
  size: string;
  date: string;
}

const backupHistory: BackupEntry[] = [
  {
    id: 1,
    type: 'Full Backup',
    size: '2.1 GB',
    date: 'Feb 25, 2025 02:00',
    trigger: 'Auto',
    status: 'completed',
  },
  {
    id: 2,
    type: 'Full Backup',
    size: '2.0 GB',
    date: 'Feb 24, 2025 02:00',
    trigger: 'Auto',
    status: 'completed',
  },
  {
    id: 3,
    type: 'Manual Backup',
    size: '1.8 GB',
    date: 'Feb 23, 2025 14:30',
    trigger: 'Manual',
    status: 'completed',
  },
  {
    id: 4,
    type: 'Full Backup',
    size: '2.0 GB',
    date: 'Feb 22, 2025 02:00',
    trigger: 'Auto',
    status: 'completed',
  },
  {
    id: 5,
    type: 'Full Backup',
    size: '1.9 GB',
    date: 'Feb 21, 2025 02:00',
    trigger: 'Auto',
    status: 'failed',
  },
];

const exportHistoryData: ExportHistoryItem[] = [
  { id: 1, name: 'Users Export', format: 'CSV', size: '12.4 MB', date: 'Feb 24, 2025' },
  { id: 2, name: 'Grades Report', format: 'PDF', size: '3.2 MB', date: 'Feb 22, 2025' },
  { id: 3, name: 'Full Analytics', format: 'XLSX', size: '8.7 MB', date: 'Feb 20, 2025' },
];

const dataCategories = [
  { key: 'users', label: 'Users Data', records: '5,420 records' },
  { key: 'courses', label: 'Course Data', records: '156 records' },
  { key: 'grades', label: 'Grades & Transcripts', records: '28,400 records' },
  { key: 'attendance', label: 'Attendance Records', records: '142,000 records' },
  { key: 'analytics', label: 'Analytics Data', records: '15,600 records' },
];

export function BackupCenterPage() {
  const { isDark, primaryHex } = useTheme() as any;
  const accentColor = primaryHex || '#3b82f6';
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true);
  const [backupFrequency, setBackupFrequency] = useState<BackupFrequency>('daily');
  const [retentionDays, setRetentionDays] = useState(30);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv');
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: t('overview') || 'Overview', icon: <HardDrive size={18} /> },
    { id: 'backups', label: t('backups') || 'Backups', icon: <Database size={18} /> },
    { id: 'export', label: t('export') || 'Export', icon: <FileText size={18} /> },
  ];

  const cardClass = `rounded-xl border shadow-sm p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`;
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-500';
  const btnPrimary = 'hover:opacity-90 text-white';
  const btnOutline = `border ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`;

  const toggleCategory = (key: string) => {
    setSelectedCategories((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleExport = () => {
    if (selectedCategories.length === 0) return;
    setExporting(true);
    setExportProgress(0);
    const interval = setInterval(() => {
      setExportProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setExporting(false);
          return 0;
        }
        return prev + 10;
      });
    }, 300);
  };

  // ── Overview Tab ──
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Status Card */}
      <div className={cardClass}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Database size={20} className="text-blue-600" />
          </div>
          <h3 className={`text-lg font-semibold ${textPrimary}`}>Backup Status</h3>
          <span className="ml-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle size={14} /> Healthy
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <p className={`text-sm ${textSecondary}`}>Last Backup</p>
            <p className={`text-lg font-semibold ${textPrimary}`}>2 hours ago</p>
          </div>
          <div>
            <p className={`text-sm ${textSecondary}`}>Total Backups</p>
            <p className={`text-lg font-semibold ${textPrimary}`}>12</p>
          </div>
          <div>
            <p className={`text-sm ${textSecondary}`}>Storage Used</p>
            <p className={`text-lg font-semibold ${textPrimary}`}>4.8 GB / 10 GB</p>
          </div>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div className=" h-2.5 rounded-full" style={{ width: '48%' }} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className={cardClass}>
        <h3 className={`text-lg font-semibold mb-4 ${textPrimary}`}>Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button
            className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors ${btnPrimary}`}
          >
            <Upload size={16} /> Backup Now
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors ${btnOutline}`}
          >
            <Clock size={16} /> Schedule Backup
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors ${btnOutline}`}
          >
            <Download size={16} /> Export Data
          </button>
        </div>
      </div>

      {/* Storage Breakdown */}
      <div className={cardClass}>
        <h3 className={`text-lg font-semibold mb-4 ${textPrimary}`}>Storage Breakdown</h3>
        <div className="space-y-3">
          {[
            { label: 'Database', size: '2.1 GB', pct: 43.75, color: 'bg-blue-500' },
            { label: 'Files', size: '1.5 GB', pct: 31.25, color: 'bg-blue-500' },
            { label: 'Media', size: '0.8 GB', pct: 16.67, color: 'bg-amber-500' },
            { label: 'Logs', size: '0.4 GB', pct: 8.33, color: 'bg-emerald-500' },
          ].map((item) => (
            <div key={item.label}>
              <div className="flex justify-between text-sm mb-1">
                <span className={textPrimary}>{item.label}</span>
                <span className={textSecondary}>{item.size}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`${item.color} h-2 rounded-full`}
                  style={{ width: `${item.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Backups Tab ──
  const renderBackups = () => (
    <div className="space-y-6">
      {/* Auto-Backup Settings */}
      <div className={cardClass}>
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Settings size={20} className="text-blue-600" />
          </div>
          <h3 className={`text-lg font-semibold ${textPrimary}`}>Auto-Backup Settings</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Enable toggle */}
          <div className="flex items-center justify-between">
            <span className={`text-sm font-medium ${textPrimary}`}>Enable Auto-Backup</span>
            <button
              onClick={() => setAutoBackupEnabled(!autoBackupEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoBackupEnabled ? '' : 'bg-gray-300 dark:bg-gray-600'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoBackupEnabled ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>

          {/* Frequency */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${textPrimary}`}>Frequency</label>
            <CleanSelect
              value={backupFrequency}
              onChange={(e) => setBackupFrequency(e.target.value as BackupFrequency)}
              className={`w-full rounded-lg border px-3 py-2 text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </CleanSelect>
          </div>

          {/* Retention */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${textPrimary}`}>
              Retention: Keep last {retentionDays} days
            </label>
            <input
              type="range"
              min={7}
              max={90}
              value={retentionDays}
              onChange={(e) => setRetentionDays(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>

          {/* Time */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${textPrimary}`}>Backup Time</label>
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
            >
              <Clock size={16} className={textSecondary} />
              02:00 AM
            </div>
          </div>
        </div>
      </div>

      {/* Backup History */}
      <div className={cardClass}>
        <h3 className={`text-lg font-semibold mb-4 ${textPrimary}`}>Backup History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                {['Type', 'Size', 'Date', 'Trigger', 'Status', 'Actions'].map((h) => (
                  <th key={h} className={`text-left py-3 px-3 font-medium ${textSecondary}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {backupHistory.map((b) => (
                <tr
                  key={b.id}
                  className={`border-b ${isDark ? 'border-gray-700/50' : 'border-gray-100'}`}
                >
                  <td className={`py-3 px-3 ${textPrimary}`}>
                    <div className="flex items-center gap-2">
                      <Archive size={16} className="text-blue-500" />
                      {b.type}
                    </div>
                  </td>
                  <td className={`py-3 px-3 ${textSecondary}`}>{b.size}</td>
                  <td className={`py-3 px-3 ${textSecondary}`}>{b.date}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        b.trigger === 'Auto'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}
                    >
                      {b.trigger}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    {b.status === 'completed' ? (
                      <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                        <CheckCircle size={14} /> Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400">
                        <XCircle size={14} /> Failed
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      {b.status === 'completed' ? (
                        <button
                          className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                          title="Download"
                        >
                          <Download size={15} className={textSecondary} />
                        </button>
                      ) : (
                        <button
                          className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                          title="Retry"
                        >
                          <RefreshCw size={15} className="text-amber-500" />
                        </button>
                      )}
                      <button
                        className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        title="Delete"
                      >
                        <Trash2 size={15} className="text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ── Export Tab ──
  const renderExport = () => (
    <div className="space-y-6">
      {/* Data Selection */}
      <div className={cardClass}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${textPrimary}`}>Data Selection</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedCategories(dataCategories.map((c) => c.key))}
              className={`text-xs px-3 py-1 rounded-lg transition-colors ${btnOutline}`}
            >
              Select All
            </button>
            <button
              onClick={() => setSelectedCategories([])}
              className={`text-xs px-3 py-1 rounded-lg transition-colors ${btnOutline}`}
            >
              Deselect All
            </button>
          </div>
        </div>
        <div className="space-y-3">
          {dataCategories.map((cat) => (
            <label
              key={cat.key}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                selectedCategories.includes(cat.key)
                  ? isDark
                    ? 'bg-blue-900/20 border border-blue-700'
                    : 'bg-blue-50 border border-blue-200'
                  : isDark
                    ? 'hover:bg-gray-700/50'
                    : 'hover:bg-gray-50'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat.key)}
                onChange={() => toggleCategory(cat.key)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <div className="flex-1">
                <span className={`text-sm font-medium ${textPrimary}`}>{cat.label}</span>
                <span className={`text-xs ml-2 ${textSecondary}`}>({cat.records})</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Export Format */}
      <div className={cardClass}>
        <h3 className={`text-lg font-semibold mb-4 ${textPrimary}`}>Export Format</h3>
        <div className="flex flex-wrap gap-3">
          {(['csv', 'xlsx', 'pdf', 'json'] as ExportFormat[]).map((fmt) => (
            <label
              key={fmt}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                exportFormat === fmt
                  ? ' border-blue-600 text-white'
                  : isDark
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="exportFormat"
                value={fmt}
                checked={exportFormat === fmt}
                onChange={() => setExportFormat(fmt)}
                className="sr-only"
              />
              {fmt.toUpperCase()}
            </label>
          ))}
        </div>
      </div>

      {/* Export Button + Progress */}
      <div className={cardClass}>
        <button
          onClick={handleExport}
          disabled={exporting || selectedCategories.length === 0}
          className={`w-full sm:w-auto px-6 py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${btnPrimary}`}
        >
          {exporting ? <RefreshCw size={16} className="animate-spin" /> : <Download size={16} />}
          {exporting ? 'Exporting...' : 'Export Selected Data'}
        </button>
        {exporting && (
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className={textSecondary}>Exporting...</span>
              <span className={textPrimary}>{exportProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className=" h-2 rounded-full transition-all duration-300"
                style={{ width: `${exportProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Export History */}
      <div className={cardClass}>
        <h3 className={`text-lg font-semibold mb-4 ${textPrimary}`}>Export History</h3>
        <div className="space-y-3">
          {exportHistoryData.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}
            >
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-blue-500" />
                <div>
                  <p className={`text-sm font-medium ${textPrimary}`}>{item.name}</p>
                  <p className={`text-xs ${textSecondary}`}>
                    {item.format} · {item.size} · {item.date}
                  </p>
                </div>
              </div>
              <button
                className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                title="Download"
              >
                <Download size={16} className={textSecondary} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-2xl font-bold ${textPrimary}`}>Backup Center</h1>
        <p className={textSecondary}>Manage backups, schedules, and data exports</p>
      </div>

      {/* Tabs */}
      <div className={`flex gap-1 p-1 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? `${btnPrimary} shadow-sm`
                : isDark
                  ? 'text-gray-400 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'backups' && renderBackups()}
      {activeTab === 'export' && renderExport()}
    </div>
  );
}

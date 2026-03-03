import { useState } from 'react';
import { Database, HardDrive, Clock, Play, Download, Upload, RefreshCw, CheckCircle, AlertCircle, Loader, Shield, Sparkles, FileText, CheckCircle2, Server, BookOpen } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

interface DatabasePageProps {
  backups: any[];
  onRunBackup: (type: string) => void;
  onRestoreBackup: (id: number) => void;
  onDownloadBackup: (id: number) => void;
}

export function DatabasePage({ backups, onRunBackup, onRestoreBackup, onDownloadBackup }: DatabasePageProps) {
  const { isDark, primaryHex } = useTheme() as any;
  const accentColor = primaryHex || '#3b82f6';
  const { t } = useLanguage();
  const [selectedBackupType, setSelectedBackupType] = useState('full');
  const [activeTab, setActiveTab] = useState<'backups' | 'dr-runbooks' | 'integrity' | 'ai-recommendations'>('backups');

  const tabs = [
    { id: 'backups' as const, label: 'Backups', icon: Database },
    { id: 'dr-runbooks' as const, label: 'DR Runbooks', icon: BookOpen },
    { id: 'integrity' as const, label: 'Integrity', icon: Shield },
    { id: 'ai-recommendations' as const, label: 'AI Recommendations', icon: Sparkles },
  ];

  const runbooks = [
    {
      title: 'Database Failure Recovery',
      priority: 'Critical',
      lastTested: 'Jan 15, 2025',
      rto: '15 min',
      rpo: '5 min',
      steps: ['Verify failure', 'Failover to replica', 'Verify data integrity', 'Notify stakeholders'],
    },
    {
      title: 'Complete System Restore',
      priority: 'Critical',
      lastTested: 'Dec 20, 2024',
      rto: '2 hours',
      rpo: '1 hour',
      steps: ['Activate DR site', 'Restore from latest backup', 'Verify services', 'DNS failover'],
    },
    {
      title: 'Network Outage',
      priority: 'High',
      lastTested: 'Feb 1, 2025',
      rto: '30 min',
      rpo: 'N/A',
      steps: ['Switch to backup ISP', 'Update DNS', 'Monitor connectivity'],
    },
    {
      title: 'Data Corruption',
      priority: 'High',
      lastTested: 'Nov 10, 2024',
      rto: '1 hour',
      rpo: '15 min',
      steps: ['Isolate affected tables', 'Point-in-time recovery', 'Verify data', 'Resume operations'],
    },
  ];

  const integrityChecks = [
    { name: 'PostgreSQL Main DB', details: 'Tables: 45/45 passed • Indexes: 120/120 valid • FK constraints: 85/85 valid', healthy: true },
    { name: 'MongoDB Analytics', details: 'Collections: 12/12 passed • Indexes: 28/28 valid', healthy: true },
    { name: 'Redis Cache', details: 'Keys: 15,200 • Memory: 2.1GB/4GB • Evictions: 0', healthy: true },
    { name: 'Elasticsearch', details: 'Indices: 8/8 green • Shards: 24/24 active', healthy: true },
  ];

  const aiRecommendations = [
    { text: 'Consider adding a read replica for PostgreSQL - query load increased 25% this month', type: 'info' as const },
    { text: 'Redis memory usage at 52%. Current growth rate suggests upgrade needed in ~3 months', type: 'warning' as const },
    { text: "Elasticsearch index 'access_logs' hasn't been optimized in 45 days. Force merge recommended", type: 'caution' as const },
    { text: 'Backup retention of 30 days is optimal for current data growth rate. No changes needed.', type: 'positive' as const },
  ];

  const storageDistribution = [
    { name: 'PostgreSQL', size: 45, color: 'bg-blue-500' },
    { name: 'MongoDB', size: 12, color: 'bg-green-500' },
    { name: 'Redis', size: 2.1, color: 'bg-red-500' },
    { name: 'Elasticsearch', size: 8.5, color: 'bg-yellow-500' },
    { name: 'Backups', size: 32, color: 'bg-blue-500' },
  ];

  const totalStorage = storageDistribution.reduce((sum, item) => sum + item.size, 0);

  const getRecommendationStyle = (type: 'info' | 'warning' | 'caution' | 'positive') => {
    switch (type) {
      case 'info': return isDark ? 'border-blue-500/50 bg-blue-500/10' : 'border-blue-300 bg-blue-50';
      case 'warning': return isDark ? 'border-yellow-500/50 bg-yellow-500/10' : 'border-yellow-300 bg-yellow-50';
      case 'caution': return isDark ? 'border-orange-500/50 bg-orange-500/10' : 'border-orange-300 bg-orange-50';
      case 'positive': return isDark ? 'border-green-500/50 bg-green-500/10' : 'border-green-300 bg-green-50';
    }
  };

  const getRecommendationIcon = (type: 'info' | 'warning' | 'caution' | 'positive') => {
    switch (type) {
      case 'info': return 'text-blue-400';
      case 'warning': return 'text-yellow-400';
      case 'caution': return 'text-orange-400';
      case 'positive': return 'text-green-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'running': return <Loader className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'failed': return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return isDark ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-700';
      case 'running': return isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700';
      case 'failed': return isDark ? 'bg-red-500/20 text-red-300' : 'bg-red-100 text-red-700';
      default: return isDark ? 'bg-gray-500/20 text-gray-300' : 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {t('database')}
        </h1>
        <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {t('databaseDescription')}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className={`flex gap-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-3 px-1 text-sm font-medium transition-colors ${
                isActive
                  ? isDark ? 'text-blue-400 border-b-2 border-blue-400' : 'text-blue-600 border-b-2 border-blue-600'
                  : isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Backups Tab */}
      {activeTab === 'backups' && (
        <>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`rounded-xl border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-900/50' : 'bg-blue-50'}`}>
              <Database className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('databaseSize')}</p>
          </div>
          <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>125.8 GB</p>
        </div>

        <div className={`rounded-xl border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-green-900/50' : 'bg-green-50'}`}>
              <HardDrive className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('backupStorage')}</p>
          </div>
          <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>1.2 TB</p>
        </div>

        <div className={`rounded-xl border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-900/50' : 'bg-blue-50'}`}>
              <Clock className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('lastBackup')}</p>
          </div>
          <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>2h ago</p>
        </div>

        <div className={`rounded-xl border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-orange-900/50' : 'bg-orange-50'}`}>
              <RefreshCw className={`w-5 h-5 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('recoveryPoint')}</p>
          </div>
          <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>15 min</p>
        </div>
      </div>

      {/* Storage Distribution */}
      <div className={`rounded-xl border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Storage Distribution
        </h2>
        {/* Stacked Bar */}
        <div className="w-full h-6 rounded-full overflow-hidden flex mb-4">
          {storageDistribution.map((item) => (
            <div
              key={item.name}
              className={`${item.color} h-full`}
              style={{ width: `${(item.size / totalStorage) * 100}%` }}
              title={`${item.name}: ${item.size}GB`}
            />
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {storageDistribution.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${item.color}`} />
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {item.name}: {item.size}GB
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Run Backup Section */}
      <div className={`rounded-xl border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {t('runManualBackup')}
        </h2>
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('backupType')}
            </label>
            <select
              value={selectedBackupType}
              onChange={(e) => setSelectedBackupType(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="full">{t('fullBackup')}</option>
              <option value="incremental">{t('incrementalBackup')}</option>
              <option value="differential">{t('differentialBackup')}</option>
            </select>
          </div>
          <button
            onClick={() => onRunBackup(selectedBackupType)}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:opacity-90 transition-colors"
          >
            <Play className="w-4 h-4" />
            {t('runBackup')}
          </button>
        </div>
      </div>

      {/* Backup Schedule */}
      <div className={`rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('backupScheduleHistory')}
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={isDark ? 'bg-gray-700/50' : 'bg-gray-50'}>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('backupName')}
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('schedule')}
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('lastRun')}
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('status')}
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('size')}
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('retention')}
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {backups.map((backup) => (
                <tr key={backup.id} className={isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(backup.status)}
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {backup.name}
                      </span>
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {backup.schedule}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {backup.lastRun}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(backup.status)}`}>
                      {backup.status}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {backup.size}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {backup.retention}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onDownloadBackup(backup.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                        }`}
                        title={t('download')}
                      >
                        <Download className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                      </button>
                      <button
                        onClick={() => onRestoreBackup(backup.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                        }`}
                        title={t('restore')}
                      >
                        <Upload className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
        </>
      )}

      {/* DR Runbooks Tab */}
      {activeTab === 'dr-runbooks' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {runbooks.map((runbook, index) => (
            <div key={index} className={`rounded-xl border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-900/50' : 'bg-blue-50'}`}>
                    <FileText className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{runbook.title}</h3>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Last tested: {runbook.lastTested}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  runbook.priority === 'Critical'
                    ? isDark ? 'bg-red-500/20 text-red-300' : 'bg-red-100 text-red-700'
                    : isDark ? 'bg-orange-500/20 text-orange-300' : 'bg-orange-100 text-orange-700'
                }`}>
                  {runbook.priority}
                </span>
              </div>

              <div className="flex gap-4 mb-4">
                <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>RTO:</span> {runbook.rto}
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>RPO:</span> {runbook.rpo}
                </div>
              </div>

              <div className={`rounded-lg p-3 mb-4 ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <p className={`text-xs font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Steps:</p>
                <ol className="space-y-1">
                  {runbook.steps.map((step, i) => (
                    <li key={i} className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {i + 1}. {step}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="flex gap-2">
                <button className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:opacity-90 transition-colors">
                  <Play className="w-3.5 h-3.5" />
                  Run Drill
                </button>
                <button className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                  isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}>
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Integrity Tab */}
      {activeTab === 'integrity' && (
        <div className="space-y-6">
          {/* Last Check Card */}
          <div className={`rounded-xl border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${isDark ? 'bg-green-900/50' : 'bg-green-50'}`}>
                  <Shield className={`w-6 h-6 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                </div>
                <div>
                  <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Last Integrity Check</h2>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Feb 24, 2025 10:00 AM</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className={`font-medium ${isDark ? 'text-green-400' : 'text-green-600'}`}>Passed</span>
                  </div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Duration: 12 min</p>
                </div>
              </div>
            </div>
          </div>

          {/* Check Results */}
          <div className={`rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Check Results</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:opacity-90 transition-colors">
                <RefreshCw className="w-4 h-4" />
                Run Check Now
              </button>
            </div>
            <div className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {integrityChecks.map((check, index) => (
                <div key={index} className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <Server className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
                    </div>
                    <div>
                      <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{check.name}</h3>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{check.details}</p>
                    </div>
                  </div>
                  {check.healthy && (
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <span className={`text-sm font-medium ${isDark ? 'text-green-400' : 'text-green-600'}`}>Healthy</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Recommendations Tab */}
      {activeTab === 'ai-recommendations' && (
        <div className="space-y-4">
          {aiRecommendations.map((rec, index) => (
            <div key={index} className={`rounded-xl border p-5 ${getRecommendationStyle(rec.type)}`}>
              <div className="flex items-start gap-4">
                <Sparkles className={`w-5 h-5 mt-0.5 flex-shrink-0 ${getRecommendationIcon(rec.type)}`} />
                <div className="flex-1">
                  <p className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{rec.text}</p>
                  <div className="flex gap-2 mt-3">
                    <button className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:opacity-90 transition-colors">
                      Apply
                    </button>
                    <button className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                      isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}>
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DatabasePage;

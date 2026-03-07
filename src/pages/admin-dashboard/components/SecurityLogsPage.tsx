import React, { useState } from 'react';
import {
  Shield,
  AlertTriangle,
  Lock,
  Globe,
  Monitor,
  Clock,
  Search,
  Filter,
  Ban,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { CleanSelect } from '../../../components/shared';


type Tab = 'all' | 'threats' | 'sessions';
type ActivityType = 'All' | 'Login' | 'Logout' | 'Password Change' | 'Permission Change' | 'Data Export' | 'Failed Login';

interface ActivityLog {
  id: number;
  timestamp: string;
  user: string;
  activity: string;
  ip: string;
  status: 'Success' | 'Failed' | 'Warning';
  details: string;
}

interface ThreatAlert {
  id: number;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  timeAgo: string;
}

interface BlockedIP {
  id: number;
  ip: string;
  blockDate: string;
  reason: string;
}

interface ActiveSession {
  id: number;
  user: string;
  ip: string;
  browser: string;
  lastActive: string;
  duration: string;
}

const activityLogs: ActivityLog[] = [
  { id: 1, timestamp: '2025-02-25 10:30', user: 'admin@uni.edu', activity: 'Login', ip: '192.168.1.100', status: 'Success', details: 'Dashboard access' },
  { id: 2, timestamp: '2025-02-25 10:15', user: 'dr.smith@uni.edu', activity: 'Password Change', ip: '192.168.1.101', status: 'Success', details: 'Self-service' },
  { id: 3, timestamp: '2025-02-25 09:45', user: 'unknown', activity: 'Failed Login', ip: '45.33.32.156', status: 'Failed', details: 'Invalid credentials (3rd attempt)' },
  { id: 4, timestamp: '2025-02-25 09:30', user: 'admin@uni.edu', activity: 'Permission Change', ip: '192.168.1.100', status: 'Success', details: 'Updated TA role' },
  { id: 5, timestamp: '2025-02-25 09:00', user: 'dr.johnson@uni.edu', activity: 'Data Export', ip: '192.168.1.102', status: 'Success', details: 'Student grades CSV' },
  { id: 6, timestamp: '2025-02-24 23:45', user: 'unknown', activity: 'Failed Login', ip: '89.43.107.22', status: 'Failed', details: 'Brute force detected' },
  { id: 7, timestamp: '2025-02-24 22:00', user: 'system', activity: 'Auto Backup', ip: '10.0.0.1', status: 'Success', details: 'Nightly backup' },
  { id: 8, timestamp: '2025-02-24 18:30', user: 'ta.ahmed@uni.edu', activity: 'Login', ip: '192.168.1.103', status: 'Success', details: 'Mobile access' },
];

const threatAlerts: ThreatAlert[] = [
  { id: 1, severity: 'critical', message: 'Brute force attempt detected from IP 89.43.107.22', timeAgo: '2h ago' },
  { id: 2, severity: 'warning', message: '3 failed login attempts for dr.smith@uni.edu', timeAgo: '4h ago' },
  { id: 3, severity: 'info', message: 'Unusual login location for ta.ahmed@uni.edu', timeAgo: '6h ago' },
];

const blockedIPs: BlockedIP[] = [
  { id: 1, ip: '89.43.107.22', blockDate: '2025-02-25', reason: 'Brute force attack' },
  { id: 2, ip: '45.33.32.156', blockDate: '2025-02-24', reason: 'Multiple failed logins' },
  { id: 3, ip: '103.21.244.0', blockDate: '2025-02-20', reason: 'Suspicious activity' },
];

const activeSessions: ActiveSession[] = [
  { id: 1, user: 'admin@uni.edu', ip: '192.168.1.100', browser: 'Chrome/Windows', lastActive: 'Active now', duration: '2h 30m' },
  { id: 2, user: 'dr.smith@uni.edu', ip: '192.168.1.101', browser: 'Firefox/Mac', lastActive: '5 min ago', duration: '45m' },
  { id: 3, user: 'dr.johnson@uni.edu', ip: '192.168.1.102', browser: 'Safari/iOS', lastActive: '15 min ago', duration: '1h 20m' },
  { id: 4, user: 'ta.ahmed@uni.edu', ip: '192.168.1.103', browser: 'Chrome/Android', lastActive: '30 min ago', duration: '20m' },
  { id: 5, user: 'student1@uni.edu', ip: '192.168.1.104', browser: 'Edge/Windows', lastActive: '1h ago', duration: '3h 15m' },
];

const activityTypes: ActivityType[] = ['All', 'Login', 'Logout', 'Password Change', 'Permission Change', 'Data Export', 'Failed Login'];

export function SecurityLogsPage() {
  const { isDark, primaryHex } = useTheme() as any;
  const accentColor = primaryHex || '#3b82f6';
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activityFilter, setActivityFilter] = useState<ActivityType>('All');
  const [showIPModal, setShowIPModal] = useState(false);
  const [ipForm, setIpForm] = useState({ ip: '', ruleType: 'Block', reason: '' });

  const cardClass = `rounded-xl border shadow-sm p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`;
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-500';
  const tableHeaderBg = isDark ? 'bg-gray-700' : 'bg-gray-50';
  const inputClass = `w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-blue-500`;

  const filteredLogs = activityLogs.filter((log) => {
    const matchesSearch =
      searchQuery === '' ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ip.includes(searchQuery) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = activityFilter === 'All' || log.activity === activityFilter;
    return matchesSearch && matchesType;
  });

  const statusBadge = (status: string) => {
    const base = 'px-2 py-1 rounded-full text-xs font-medium';
    switch (status) {
      case 'Success':
        return `${base} bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400`;
      case 'Failed':
        return `${base} bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400`;
      case 'Warning':
        return `${base} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400`;
      default:
        return base;
    }
  };

  const severityStyles = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          border: 'border-red-500',
          bg: isDark ? 'bg-red-900/20' : 'bg-red-50',
          icon: 'text-red-500',
          badge: 'bg-red-100 text-red-800',
        };
      case 'warning':
        return {
          border: 'border-yellow-500',
          bg: isDark ? 'bg-yellow-900/20' : 'bg-yellow-50',
          icon: 'text-yellow-500',
          badge: 'bg-yellow-100 text-yellow-800',
        };
      case 'info':
        return {
          border: 'border-blue-500',
          bg: isDark ? 'bg-blue-900/20' : 'bg-blue-50',
          icon: 'text-blue-500',
          badge: 'bg-blue-100 text-blue-800',
        };
      default:
        return { border: '', bg: '', icon: '', badge: '' };
    }
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'all', label: 'All Activities', icon: <Eye className="w-4 h-4" /> },
    { key: 'threats', label: 'Threats', icon: <AlertTriangle className="w-4 h-4" /> },
    { key: 'sessions', label: 'Active Sessions', icon: <Monitor className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className={`text-2xl font-bold ${textPrimary}`}>Security & Logs</h1>
            <p className={textSecondary}>Monitor system security, activity logs, and active sessions</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex gap-1 p-1 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? ''
                : `${textSecondary} hover:${isDark ? 'bg-gray-700' : 'bg-gray-200'}`
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: All Activities */}
      {activeTab === 'all' && (
        <div className="space-y-6">
          {/* Security Alerts Banner */}
          <div className={`rounded-xl border border-yellow-500 ${isDark ? 'bg-yellow-900/20' : 'bg-yellow-50'} p-4 flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <span className={`font-medium ${isDark ? 'text-yellow-300' : 'text-yellow-800'}`}>
                3 security alerts require attention
              </span>
            </div>
            <button
              onClick={() => setActiveTab('threats')}
              className="hover:opacity-90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              View Alerts
            </button>
          </div>

          {/* Filter Bar */}
          <div className={cardClass}>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textSecondary}`} />
                <input
                  type="text"
                  placeholder="Search by user, IP, or details..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`pl-10 ${inputClass}`}
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className={`w-4 h-4 ${textSecondary}`} />
                <CleanSelect
                  value={activityFilter}
                  onChange={(e) => setActivityFilter(e.target.value as ActivityType)}
                  className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  {activityTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </CleanSelect>
              </div>
            </div>
          </div>

          {/* Activity Logs Table */}
          <div className={cardClass}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={tableHeaderBg}>
                    <th className={`text-left px-4 py-3 text-xs font-medium uppercase tracking-wider ${textSecondary}`}>Timestamp</th>
                    <th className={`text-left px-4 py-3 text-xs font-medium uppercase tracking-wider ${textSecondary}`}>User</th>
                    <th className={`text-left px-4 py-3 text-xs font-medium uppercase tracking-wider ${textSecondary}`}>Activity</th>
                    <th className={`text-left px-4 py-3 text-xs font-medium uppercase tracking-wider ${textSecondary}`}>IP Address</th>
                    <th className={`text-left px-4 py-3 text-xs font-medium uppercase tracking-wider ${textSecondary}`}>Status</th>
                    <th className={`text-left px-4 py-3 text-xs font-medium uppercase tracking-wider ${textSecondary}`}>Details</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {filteredLogs.map((log, idx) => (
                    <tr
                      key={log.id}
                      className={idx % 2 === 0 ? '' : isDark ? 'bg-gray-750' : 'bg-gray-50/50'}
                    >
                      <td className={`px-4 py-3 text-sm ${textSecondary}`}>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          {log.timestamp}
                        </div>
                      </td>
                      <td className={`px-4 py-3 text-sm font-medium ${textPrimary}`}>{log.user}</td>
                      <td className={`px-4 py-3 text-sm ${textSecondary}`}>{log.activity}</td>
                      <td className={`px-4 py-3 text-sm font-mono ${textSecondary}`}>{log.ip}</td>
                      <td className="px-4 py-3">
                        <span className={statusBadge(log.status)}>{log.status}</span>
                      </td>
                      <td className={`px-4 py-3 text-sm ${textSecondary}`}>{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredLogs.length === 0 && (
                <div className={`text-center py-8 ${textSecondary}`}>No activity logs match your filters.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Threats */}
      {activeTab === 'threats' && (
        <div className="space-y-6">
          {/* Threat Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Active Threats', value: '3', icon: <AlertTriangle className="w-6 h-6 text-red-500" />, color: 'text-red-500' },
              { label: 'Blocked IPs', value: '12', icon: <Ban className="w-6 h-6 text-yellow-500" />, color: 'text-yellow-500' },
              { label: 'Failed Logins (24h)', value: '8', icon: <XCircle className="w-6 h-6 text-orange-500" />, color: 'text-orange-500' },
            ].map((stat) => (
              <div key={stat.label} className={cardClass}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${textSecondary}`}>{stat.label}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                  {stat.icon}
                </div>
              </div>
            ))}
          </div>

          {/* Security Alerts List */}
          <div className={cardClass}>
            <h2 className={`text-lg font-semibold mb-4 ${textPrimary}`}>Security Alerts</h2>
            <div className="space-y-4">
              {threatAlerts.map((alert) => {
                const styles = severityStyles(alert.severity);
                return (
                  <div
                    key={alert.id}
                    className={`rounded-lg border-l-4 ${styles.border} ${styles.bg} p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
                  >
                    <div className="flex items-start gap-3">
                      {alert.severity === 'critical' && <XCircle className={`w-5 h-5 mt-0.5 ${styles.icon}`} />}
                      {alert.severity === 'warning' && <AlertTriangle className={`w-5 h-5 mt-0.5 ${styles.icon}`} />}
                      {alert.severity === 'info' && <Eye className={`w-5 h-5 mt-0.5 ${styles.icon}`} />}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${styles.badge}`}>
                            {alert.severity}
                          </span>
                          <span className={`text-xs ${textSecondary}`}>{alert.timeAgo}</span>
                        </div>
                        <p className={`text-sm font-medium ${textPrimary}`}>{alert.message}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-8 sm:ml-0">
                      <button className="hover:opacity-90 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
                        Investigate
                      </button>
                      <button className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}>
                        Dismiss
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* IP Blocklist */}
          <div className={cardClass}>
            <h2 className={`text-lg font-semibold mb-4 ${textPrimary}`}>IP Blocklist</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={tableHeaderBg}>
                    <th className={`text-left px-4 py-3 text-xs font-medium uppercase tracking-wider ${textSecondary}`}>IP Address</th>
                    <th className={`text-left px-4 py-3 text-xs font-medium uppercase tracking-wider ${textSecondary}`}>Block Date</th>
                    <th className={`text-left px-4 py-3 text-xs font-medium uppercase tracking-wider ${textSecondary}`}>Reason</th>
                    <th className={`text-left px-4 py-3 text-xs font-medium uppercase tracking-wider ${textSecondary}`}>Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {blockedIPs.map((entry, idx) => (
                    <tr key={entry.id} className={idx % 2 === 0 ? '' : isDark ? 'bg-gray-750' : 'bg-gray-50/50'}>
                      <td className={`px-4 py-3 text-sm font-mono ${textPrimary}`}>
                        <div className="flex items-center gap-2">
                          <Ban className="w-4 h-4 text-red-500" />
                          {entry.ip}
                        </div>
                      </td>
                      <td className={`px-4 py-3 text-sm ${textSecondary}`}>{entry.blockDate}</td>
                      <td className={`px-4 py-3 text-sm ${textSecondary}`}>{entry.reason}</td>
                      <td className="px-4 py-3">
                        <button className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}>
                          Unblock
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Active Sessions */}
      {activeTab === 'sessions' && (
        <div className="space-y-6">
          {/* Session List */}
          <div className={cardClass}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-lg font-semibold ${textPrimary}`}>Active Sessions</h2>
              <button
                onClick={() => setShowIPModal(true)}
                className="hover:opacity-90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                Add IP Rule
              </button>
            </div>
            <div className="space-y-3">
              {activeSessions.map((session) => (
                <div
                  key={session.id}
                  className={`rounded-lg border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isDark ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50/50'}`}
                >
                  <div className="flex items-center gap-4 flex-1 flex-wrap">
                    <div className="flex items-center gap-2 min-w-[180px]">
                      <Lock className={`w-4 h-4 ${session.lastActive === 'Active now' ? 'text-green-500' : textSecondary}`} />
                      <span className={`text-sm font-medium ${textPrimary}`}>{session.user}</span>
                    </div>
                    <div className="flex items-center gap-2 min-w-[130px]">
                      <Globe className={`w-4 h-4 ${textSecondary}`} />
                      <span className={`text-sm font-mono ${textSecondary}`}>{session.ip}</span>
                    </div>
                    <div className="flex items-center gap-2 min-w-[130px]">
                      <Monitor className={`w-4 h-4 ${textSecondary}`} />
                      <span className={`text-sm ${textSecondary}`}>{session.browser}</span>
                    </div>
                    <div className="flex items-center gap-2 min-w-[100px]">
                      <Clock className={`w-4 h-4 ${textSecondary}`} />
                      <span className={`text-sm ${session.lastActive === 'Active now' ? 'text-green-500 font-medium' : textSecondary}`}>
                        {session.lastActive}
                      </span>
                    </div>
                    <span className={`text-sm ${textSecondary}`}>Duration: {session.duration}</span>
                  </div>
                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors">
                    <Trash2 className="w-3 h-3" />
                    Revoke Session
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add IP Rule Modal */}
      {showIPModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl border shadow-xl p-6 w-full max-w-md ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${textPrimary}`}>Add IP Rule</h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>IP Address</label>
                <input
                  type="text"
                  placeholder="e.g. 192.168.1.100"
                  value={ipForm.ip}
                  onChange={(e) => setIpForm({ ...ipForm, ip: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>Rule Type</label>
                <CleanSelect
                  value={ipForm.ruleType}
                  onChange={(e) => setIpForm({ ...ipForm, ruleType: e.target.value })}
                  className={`px-3 py-2 rounded-lg border w-full ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="Block">Block</option>
                  <option value="Allow">Allow</option>
                </CleanSelect>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>Reason</label>
                <input
                  type="text"
                  placeholder="Reason for this rule"
                  value={ipForm.reason}
                  onChange={(e) => setIpForm({ ...ipForm, reason: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowIPModal(false)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowIPModal(false);
                  setIpForm({ ip: '', ruleType: 'Block', reason: '' });
                }}
                className="hover:opacity-90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

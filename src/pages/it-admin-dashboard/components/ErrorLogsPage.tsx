import React, { useState } from 'react';
import {
  AlertTriangle, AlertCircle, Bug, Code, Search, Filter, Download, Trash2,
  CheckCircle, Flag, Copy, ChevronDown, ChevronUp, XCircle, Monitor, Server,
  Database, Globe
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { CleanSelect } from '../../../components/shared';


type Severity = 'Critical' | 'Error' | 'Warning' | 'Info';
type ErrorType = 'Frontend' | 'Backend' | 'Database' | 'Network';
type Status = 'Active' | 'Flagged' | 'Resolved';

interface ErrorLog {
  id: number;
  time: string;
  severity: Severity;
  type: ErrorType;
  message: string;
  status: Status;
  stackTrace: string;
  occurrences: number;
  firstSeen: string;
  lastSeen: string;
}

const errorLogs: ErrorLog[] = [
  {
    id: 1, time: 'Feb 25, 10:30', severity: 'Critical', type: 'Backend',
    message: 'NullPointerException in UserService.getUser()', status: 'Active',
    stackTrace: 'at UserService.getUser(UserService.java:142)\nat UserController.handleRequest(UserController.java:85)\nat SpringFramework.dispatchRequest(Dispatcher.java:231)\nat Server.processConnection(Server.java:44)',
    occurrences: 15, firstSeen: 'Feb 25, 08:00', lastSeen: 'Feb 25, 10:30',
  },
  {
    id: 2, time: 'Feb 25, 10:15', severity: 'Error', type: 'Database',
    message: 'Connection pool exhausted - max 100 connections', status: 'Active',
    stackTrace: 'at ConnectionPool.acquire(ConnectionPool.java:98)\nat DatabaseManager.getConnection(DatabaseManager.java:54)\nat QueryExecutor.execute(QueryExecutor.java:37)\nat Server.processConnection(Server.java:44)',
    occurrences: 42, firstSeen: 'Feb 25, 09:00', lastSeen: 'Feb 25, 10:15',
  },
  {
    id: 3, time: 'Feb 25, 09:45', severity: 'Warning', type: 'Frontend',
    message: 'React hydration mismatch on /dashboard', status: 'Active',
    stackTrace: 'at hydrate(react-dom.js:1234)\nat renderRoot(react-dom.js:890)\nat Dashboard.render(Dashboard.tsx:45)\nat App.mount(App.tsx:12)',
    occurrences: 8, firstSeen: 'Feb 25, 09:00', lastSeen: 'Feb 25, 09:45',
  },
  {
    id: 4, time: 'Feb 25, 09:30', severity: 'Error', type: 'Network',
    message: 'Timeout connecting to payment gateway (30s)', status: 'Flagged',
    stackTrace: 'at HttpClient.connect(HttpClient.java:201)\nat PaymentGateway.processPayment(PaymentGateway.java:78)\nat PaymentService.charge(PaymentService.java:55)\nat Server.processConnection(Server.java:44)',
    occurrences: 5, firstSeen: 'Feb 25, 09:15', lastSeen: 'Feb 25, 09:30',
  },
  {
    id: 5, time: 'Feb 25, 09:00', severity: 'Critical', type: 'Backend',
    message: 'OutOfMemoryError in report generation service', status: 'Flagged',
    stackTrace: 'at ReportGenerator.generate(ReportGenerator.java:312)\nat ReportService.createReport(ReportService.java:89)\nat ReportController.handleRequest(ReportController.java:42)\nat Server.processConnection(Server.java:44)',
    occurrences: 3, firstSeen: 'Feb 25, 08:30', lastSeen: 'Feb 25, 09:00',
  },
  {
    id: 6, time: 'Feb 24, 23:45', severity: 'Warning', type: 'Database',
    message: 'Slow query detected: 4.2s on students table', status: 'Resolved',
    stackTrace: 'at QueryAnalyzer.analyze(QueryAnalyzer.java:67)\nat SlowQueryDetector.check(SlowQueryDetector.java:34)\nat DatabaseMonitor.monitor(DatabaseMonitor.java:21)\nat Server.processConnection(Server.java:44)',
    occurrences: 12, firstSeen: 'Feb 24, 20:00', lastSeen: 'Feb 24, 23:45',
  },
  {
    id: 7, time: 'Feb 24, 22:00', severity: 'Info', type: 'Backend',
    message: 'Deprecated API endpoint /v1/users still receiving traffic', status: 'Resolved',
    stackTrace: 'at DeprecationWarning.log(DeprecationWarning.java:15)\nat ApiRouter.route(ApiRouter.java:102)\nat RequestHandler.handle(RequestHandler.java:58)\nat Server.processConnection(Server.java:44)',
    occurrences: 230, firstSeen: 'Feb 20, 10:00', lastSeen: 'Feb 24, 22:00',
  },
  {
    id: 8, time: 'Feb 24, 18:30', severity: 'Error', type: 'Network',
    message: 'SSL handshake failure with SMTP server', status: 'Resolved',
    stackTrace: 'at SSLHandler.handshake(SSLHandler.java:88)\nat SmtpClient.connect(SmtpClient.java:45)\nat EmailService.send(EmailService.java:67)\nat Server.processConnection(Server.java:44)',
    occurrences: 7, firstSeen: 'Feb 24, 17:00', lastSeen: 'Feb 24, 18:30',
  },
];

export function ErrorLogsPage() {
  const { isDark, primaryHex } = useTheme() as any;
  const accentColor = primaryHex || '#3b82f6';
  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'All' | Severity>('All');
  const [typeFilter, setTypeFilter] = useState<'All' | ErrorType>('All');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const cardClass = `rounded-xl border shadow-sm p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`;
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-500';
  const codeBlock = `font-mono text-sm p-4 rounded-lg overflow-x-auto ${isDark ? 'bg-gray-900 text-green-400' : 'bg-gray-100 text-gray-800'}`;

  const filteredLogs = errorLogs.filter((log) => {
    if (searchQuery && !log.message.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (severityFilter !== 'All' && log.severity !== severityFilter) return false;
    if (typeFilter !== 'All' && log.type !== typeFilter) return false;
    return true;
  });

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredLogs.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredLogs.map((l) => l.id)));
    }
  };

  const getSeverityBadge = (severity: Severity) => {
    const colors: Record<Severity, string> = {
      Critical: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
      Error: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300',
      Warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300',
      Info: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
    };
    const icons: Record<Severity, React.ReactNode> = {
      Critical: <XCircle className="w-3.5 h-3.5" />,
      Error: <AlertCircle className="w-3.5 h-3.5" />,
      Warning: <AlertTriangle className="w-3.5 h-3.5" />,
      Info: <Bug className="w-3.5 h-3.5" />,
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${isDark ? colors[severity].split('dark:')[1] : colors[severity].split(' dark:')[0]}`}>
        {icons[severity]} {severity}
      </span>
    );
  };

  const getStatusIndicator = (status: Status) => {
    switch (status) {
      case 'Active':
        return <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-500"><span className="w-2 h-2 rounded-full bg-red-500" /> Active</span>;
      case 'Flagged':
        return <span className="inline-flex items-center gap-1.5 text-xs font-medium text-orange-500"><Flag className="w-3.5 h-3.5" /> Flagged</span>;
      case 'Resolved':
        return <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-500"><CheckCircle className="w-3.5 h-3.5" /> Resolved</span>;
    }
  };

  const getTypeIcon = (type: ErrorType) => {
    switch (type) {
      case 'Frontend': return <Monitor className="w-4 h-4" />;
      case 'Backend': return <Server className="w-4 h-4" />;
      case 'Database': return <Database className="w-4 h-4" />;
      case 'Network': return <Globe className="w-4 h-4" />;
    }
  };

  const stats = [
    { label: 'Total Errors', value: '1,247', color: 'text-red-500', bgColor: isDark ? 'bg-red-500/10' : 'bg-red-50', icon: <AlertCircle className="w-6 h-6 text-red-500" /> },
    { label: 'Today', value: '23', color: 'text-yellow-500', bgColor: isDark ? 'bg-yellow-500/10' : 'bg-yellow-50', icon: <AlertTriangle className="w-6 h-6 text-yellow-500" /> },
    { label: 'Flagged', value: '8', color: 'text-orange-500', bgColor: isDark ? 'bg-orange-500/10' : 'bg-orange-50', icon: <Flag className="w-6 h-6 text-orange-500" /> },
    { label: 'Resolved', value: '1,189', color: 'text-green-500', bgColor: isDark ? 'bg-green-500/10' : 'bg-green-50', icon: <CheckCircle className="w-6 h-6 text-green-500" /> },
  ];

  const severityChips: { label: string; value: 'All' | Severity; color: string }[] = [
    { label: 'All', value: 'All', color: 'bg-blue-600 text-white' },
    { label: 'Critical', value: 'Critical', color: 'bg-red-600 text-white' },
    { label: 'Error', value: 'Error', color: 'bg-orange-600 text-white' },
    { label: 'Warning', value: 'Warning', color: 'bg-yellow-500 text-white' },
    { label: 'Info', value: 'Info', color: 'bg-blue-600 text-white' },
  ];

  const typeOptions: ('All' | ErrorType)[] = ['All', 'Frontend', 'Backend', 'Database', 'Network'];

  const handleCopyStackTrace = (stackTrace: string) => {
    navigator.clipboard.writeText(stackTrace);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${textPrimary}`}>Error Logs</h1>
          <p className={textSecondary}>Monitor and manage system errors across all services</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:opacity-90 text-white rounded-lg text-sm font-medium transition-colors">
            <Download className="w-4 h-4" /> Export Logs
          </button>
          <button className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
            <Trash2 className="w-4 h-4" /> Clear Resolved
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className={cardClass}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${textSecondary}`}>{stat.label}</p>
                <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className={cardClass}>
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textSecondary}`} />
            <input
              type="text"
              placeholder="Search error messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          {/* Severity Chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className={`w-4 h-4 ${textSecondary}`} />
            {severityChips.map((chip) => (
              <button
                key={chip.value}
                onClick={() => setSeverityFilter(chip.value)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  severityFilter === chip.value
                    ? chip.color
                    : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Type Filter */}
          <CleanSelect
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as 'All' | ErrorType)}
            className={`px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            {typeOptions.map((opt) => (
              <option key={opt} value={opt}>{opt === 'All' ? 'All Types' : opt}</option>
            ))}
          </CleanSelect>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${isDark ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
          <span className={`text-sm font-medium ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
            {selectedIds.size} selected
          </span>
          <button
            onClick={toggleSelectAll}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {selectedIds.size === filteredLogs.length ? 'Deselect All' : 'Select All'}
          </button>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-colors">
            <CheckCircle className="w-3.5 h-3.5" /> Mark Selected as Resolved
          </button>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition-colors">
            <Trash2 className="w-3.5 h-3.5" /> Delete Selected
          </button>
        </div>
      )}

      {/* Error Logs List */}
      <div className="space-y-2">
        {filteredLogs.map((log) => (
          <div key={log.id} className={`rounded-xl border shadow-sm overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            {/* Error Row */}
            <div
              className={`flex items-center gap-4 p-4 cursor-pointer transition-colors ${isDark ? 'hover:bg-gray-750' : 'hover:bg-gray-50'}`}
              onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
            >
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={selectedIds.has(log.id)}
                onChange={(e) => { e.stopPropagation(); toggleSelect(log.id); }}
                onClick={(e) => e.stopPropagation()}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />

              {/* Time */}
              <span className={`text-xs whitespace-nowrap ${textSecondary}`}>{log.time}</span>

              {/* Severity */}
              {getSeverityBadge(log.severity)}

              {/* Type */}
              <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${textSecondary}`}>
                {getTypeIcon(log.type)} {log.type}
              </span>

              {/* Message */}
              <span className={`flex-1 text-sm truncate ${textPrimary}`}>{log.message}</span>

              {/* Status */}
              {getStatusIndicator(log.status)}

              {/* Expand Icon */}
              {expandedId === log.id
                ? <ChevronUp className={`w-4 h-4 ${textSecondary}`} />
                : <ChevronDown className={`w-4 h-4 ${textSecondary}`} />
              }
            </div>

            {/* Expanded Detail */}
            {expandedId === log.id && (
              <div className={`border-t px-6 py-4 space-y-4 ${isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50/50'}`}>
                {/* Full Message */}
                <div>
                  <h4 className={`text-xs font-semibold uppercase tracking-wider mb-1 ${textSecondary}`}>Error Message</h4>
                  <p className={`text-sm ${textPrimary}`}>{log.message}</p>
                </div>

                {/* Stack Trace */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>Stack Trace</h4>
                    <button
                      onClick={() => handleCopyStackTrace(log.stackTrace)}
                      className={`inline-flex items-center gap-1 text-xs ${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      <Copy className="w-3.5 h-3.5" /> Copy
                    </button>
                  </div>
                  <pre className={codeBlock}>
                    <code>{log.stackTrace}</code>
                  </pre>
                </div>

                {/* Meta Info */}
                <div className="flex flex-wrap gap-6">
                  <div>
                    <span className={`text-xs ${textSecondary}`}>Occurrences</span>
                    <p className={`text-sm font-medium ${textPrimary}`}>Occurred {log.occurrences} times in last 24h</p>
                  </div>
                  <div>
                    <span className={`text-xs ${textSecondary}`}>First Seen</span>
                    <p className={`text-sm font-medium ${textPrimary}`}>{log.firstSeen}</p>
                  </div>
                  <div>
                    <span className={`text-xs ${textSecondary}`}>Last Seen</span>
                    <p className={`text-sm font-medium ${textPrimary}`}>{log.lastSeen}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2">
                  <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-colors">
                    <CheckCircle className="w-3.5 h-3.5" /> Mark Resolved
                  </button>
                  <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-medium transition-colors">
                    <Flag className="w-3.5 h-3.5" /> Flag
                  </button>
                  <button
                    onClick={() => handleCopyStackTrace(log.stackTrace)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                  >
                    <Code className="w-3.5 h-3.5" /> Copy Stack Trace
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {filteredLogs.length === 0 && (
          <div className={`text-center py-12 ${cardClass}`}>
            <CheckCircle className={`w-12 h-12 mx-auto mb-3 ${textSecondary}`} />
            <p className={`text-lg font-medium ${textPrimary}`}>No errors found</p>
            <p className={textSecondary}>No errors match your current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ErrorLogsPage;

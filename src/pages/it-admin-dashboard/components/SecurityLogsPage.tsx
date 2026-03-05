import React, { useState } from 'react';
import { Shield, AlertTriangle, Lock, Eye, Download, Filter, Clock } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { CleanSelect } from '../../../components/shared';


type Severity = 'info' | 'warning' | 'error' | 'critical';
type EventTypeFilter = 'all' | 'login' | 'access' | 'config_change' | 'threat';
type Status = 'success' | 'failure' | 'blocked';

interface SecurityEvent {
  id: number;
  timestamp: string;
  eventType: string;
  user: string;
  ip: string;
  location: string;
  severity: Severity;
  status: Status;
}

const mockEvents: SecurityEvent[] = [
  {
    id: 1,
    timestamp: '2025-01-15 11:30:45',
    eventType: 'Login',
    user: 'admin@university.edu',
    ip: '192.168.1.100',
    location: 'Cairo, Egypt',
    severity: 'info',
    status: 'success',
  },
  {
    id: 2,
    timestamp: '2025-01-15 10:15:22',
    eventType: 'Failed Login',
    user: 'unknown@test.com',
    ip: '45.33.32.156',
    location: 'Unknown',
    severity: 'warning',
    status: 'failure',
  },
  {
    id: 3,
    timestamp: '2025-01-15 09:45:10',
    eventType: 'Config Change',
    user: 'it.admin@university.edu',
    ip: '192.168.1.50',
    location: 'Cairo, Egypt',
    severity: 'info',
    status: 'success',
  },
  {
    id: 4,
    timestamp: '2025-01-15 08:20:33',
    eventType: 'Threat Detected',
    user: 'N/A',
    ip: '103.21.244.0',
    location: 'Beijing, China',
    severity: 'critical',
    status: 'blocked',
  },
  {
    id: 5,
    timestamp: '2025-01-15 07:55:18',
    eventType: 'Access Denied',
    user: 'sara@university.edu',
    ip: '192.168.1.75',
    location: 'Cairo, Egypt',
    severity: 'warning',
    status: 'failure',
  },
  {
    id: 6,
    timestamp: '2025-01-14 23:10:05',
    eventType: 'Failed Login',
    user: 'admin@university.edu',
    ip: '10.0.0.1',
    location: 'Cairo, Egypt',
    severity: 'error',
    status: 'failure',
  },
];

const severityConfig: Record<
  Severity,
  { label: string; color: string; darkColor: string; bg: string; darkBg: string }
> = {
  critical: {
    label: 'Critical',
    color: 'text-red-700',
    darkColor: 'text-red-400',
    bg: 'bg-red-100',
    darkBg: 'bg-red-500/20',
  },
  error: {
    label: 'Error',
    color: 'text-orange-700',
    darkColor: 'text-orange-400',
    bg: 'bg-orange-100',
    darkBg: 'bg-orange-500/20',
  },
  warning: {
    label: 'Warning',
    color: 'text-yellow-700',
    darkColor: 'text-yellow-400',
    bg: 'bg-yellow-100',
    darkBg: 'bg-yellow-500/20',
  },
  info: {
    label: 'Info',
    color: 'text-blue-700',
    darkColor: 'text-blue-400',
    bg: 'bg-blue-100',
    darkBg: 'bg-blue-500/20',
  },
};

export function SecurityLogsPage() {
  const { isDark, primaryHex } = useTheme() as any;
  const accentColor = primaryHex || '#3b82f6';
  const { t } = useLanguage();
  const [severityFilter, setSeverityFilter] = useState<'all' | Severity>('all');
  const [eventTypeFilter, setEventTypeFilter] = useState<EventTypeFilter>('all');

  const filteredEvents = mockEvents.filter((event) => {
    if (severityFilter !== 'all' && event.severity !== severityFilter) return false;
    if (eventTypeFilter !== 'all') {
      const typeMap: Record<EventTypeFilter, string[]> = {
        all: [],
        login: ['Login', 'Failed Login'],
        access: ['Access Denied'],
        config_change: ['Config Change'],
        threat: ['Threat Detected'],
      };
      if (!typeMap[eventTypeFilter].includes(event.eventType)) return false;
    }
    return true;
  });

  const totalEvents = mockEvents.length;
  const failedLogins = mockEvents.filter((e) => e.eventType === 'Failed Login').length;
  const activeSessions = 42;
  const threatsBlocked = mockEvents.filter((e) => e.status === 'blocked').length;

  const overviewCards = [
    { title: 'Total Events (24h)', value: totalEvents, icon: Shield, color: accentColor },
    { title: 'Failed Logins', value: failedLogins, icon: Lock, color: '#EF4444' },
    { title: 'Active Sessions', value: activeSessions, icon: Eye, color: '#10B981' },
    { title: 'Threats Blocked', value: threatsBlocked, icon: AlertTriangle, color: '#F59E0B' },
  ];

  const handleExport = () => {
    const headers = [
      'Timestamp',
      'Event Type',
      'User',
      'IP Address',
      'Location',
      'Severity',
      'Status',
    ];
    const rows = filteredEvents.map((e) =>
      [e.timestamp, e.eventType, e.user, e.ip, e.location, e.severity, e.status].join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'security_logs.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Security Logs
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Monitor and review security events across the system
          </p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors hover:opacity-90"
          style={{ backgroundColor: accentColor }}
        >
          <Download className="w-4 h-4" />
          Export Logs
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewCards.map((card) => (
          <div
            key={card.title}
            className={`rounded-xl p-5 ${isDark ? 'bg-[#1e293b]/80 border border-white/5' : 'bg-white border border-slate-200 shadow-sm'}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  {card.title}
                </p>
                <p
                  className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}
                >
                  {card.value}
                </p>
              </div>
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${card.color}20` }}
              >
                <card.icon className="w-5 h-5" style={{ color: card.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div
        className={`rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center ${isDark ? 'bg-[#1e293b]/80 border border-white/5' : 'bg-white border border-slate-200 shadow-sm'}`}
      >
        <div className="flex items-center gap-2">
          <Filter className={`w-4 h-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`} />
          <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Filters:
          </span>
        </div>
        <div className="flex flex-wrap gap-3">
          <CleanSelect
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as 'all' | Severity)}
            className={`text-sm rounded-lg px-3 py-1.5 border outline-none ${
              isDark
                ? 'bg-[#0f172a] border-white/10 text-white'
                : 'bg-white border-slate-300 text-slate-900'
            }`}
          >
            <option value="all">All Severities</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
            <option value="critical">Critical</option>
          </CleanSelect>
          <CleanSelect
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value as EventTypeFilter)}
            className={`text-sm rounded-lg px-3 py-1.5 border outline-none ${
              isDark
                ? 'bg-[#0f172a] border-white/10 text-white'
                : 'bg-white border-slate-300 text-slate-900'
            }`}
          >
            <option value="all">All Event Types</option>
            <option value="login">Login</option>
            <option value="access">Access</option>
            <option value="config_change">Config Change</option>
            <option value="threat">Threat</option>
          </CleanSelect>
        </div>
      </div>

      {/* Security Event Log Table */}
      <div
        className={`rounded-xl overflow-hidden ${isDark ? 'bg-[#1e293b]/80 border border-white/5' : 'bg-white border border-slate-200 shadow-sm'}`}
      >
        <div className="p-4 flex items-center gap-2 border-b ${isDark ? 'border-white/5' : 'border-slate-200'}">
          <Clock className={`w-4 h-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`} />
          <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Security Event Log
          </h2>
          <span className={`ml-auto text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {filteredEvents.length} events
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={isDark ? 'bg-[#0f172a]/50' : 'bg-slate-50'}>
                {[
                  'Timestamp',
                  'Event Type',
                  'User',
                  'IP Address',
                  'Location',
                  'Severity',
                  'Status',
                ].map((header) => (
                  <th
                    key={header}
                    className={`px-4 py-3 text-left font-medium whitespace-nowrap ${
                      isDark ? 'text-slate-300' : 'text-slate-600'
                    }`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-slate-100'}`}>
              {filteredEvents.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className={`px-4 py-8 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                  >
                    No events match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((event) => {
                  const sev = severityConfig[event.severity];
                  return (
                    <tr
                      key={event.id}
                      className={`transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}
                    >
                      <td
                        className={`px-4 py-3 whitespace-nowrap font-mono text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}
                      >
                        {event.timestamp}
                      </td>
                      <td
                        className={`px-4 py-3 whitespace-nowrap font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}
                      >
                        {event.eventType}
                      </td>
                      <td
                        className={`px-4 py-3 whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-600'}`}
                      >
                        {event.user}
                      </td>
                      <td
                        className={`px-4 py-3 whitespace-nowrap font-mono text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}
                      >
                        {event.ip}
                      </td>
                      <td
                        className={`px-4 py-3 whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-600'}`}
                      >
                        {event.location}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            isDark ? `${sev.darkBg} ${sev.darkColor}` : `${sev.bg} ${sev.color}`
                          }`}
                        >
                          {sev.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`text-xs font-medium capitalize ${
                            event.status === 'success'
                              ? isDark
                                ? 'text-green-400'
                                : 'text-green-600'
                              : event.status === 'blocked'
                                ? isDark
                                  ? 'text-yellow-400'
                                  : 'text-yellow-600'
                                : isDark
                                  ? 'text-red-400'
                                  : 'text-red-600'
                          }`}
                        >
                          {event.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

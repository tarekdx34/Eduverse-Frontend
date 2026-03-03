import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Bell, AlertTriangle, Mail, MessageSquare, Phone, Clock, Shield, Settings,
  Plus, Edit2, Trash2, Search, Sparkles, CheckCircle, XCircle, Pause, Play, ArrowRight,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type TabKey = 'rules' | 'channels' | 'escalation' | 'suppression' | 'history' | 'ai';
type Severity = 'Critical' | 'Warning' | 'Info';
type RuleStatus = 'Active' | 'Paused';

interface AlertRule {
  id: number;
  name: string;
  metric: string;
  condition: string;
  threshold: number;
  duration: string;
  severity: Severity;
  status: RuleStatus;
  triggered: string;
}

interface HistoryItem {
  id: number;
  timestamp: string;
  rule: string;
  severity: Severity;
  value: string;
  status: 'Triggered' | 'Resolved' | 'Acknowledged';
  duration: string;
}

// ─── Static Data ─────────────────────────────────────────────────────────────

const initialRules: AlertRule[] = [
  { id: 1, name: 'CPU > 90% for 5min', metric: 'CPU', condition: '>', threshold: 90, duration: '5 min', severity: 'Critical', status: 'Active', triggered: '3 times today' },
  { id: 2, name: 'Memory > 85% for 10min', metric: 'Memory', condition: '>', threshold: 85, duration: '10 min', severity: 'Warning', status: 'Active', triggered: '1 time today' },
  { id: 3, name: 'Disk > 95%', metric: 'Disk', condition: '>', threshold: 95, duration: '0 min', severity: 'Critical', status: 'Active', triggered: '0' },
  { id: 4, name: 'API Error Rate > 5%', metric: 'API', condition: '>', threshold: 5, duration: '0 min', severity: 'Warning', status: 'Active', triggered: '2 times today' },
  { id: 5, name: 'Response Time > 2000ms', metric: 'Response Time', condition: '>', threshold: 2000, duration: '0 min', severity: 'Info', status: 'Paused', triggered: '0' },
];

const historyItems: HistoryItem[] = [
  { id: 1, timestamp: '2024-02-28 14:32:00', rule: 'CPU > 90%', severity: 'Critical', value: '94.2%', status: 'Resolved', duration: '8 min' },
  { id: 2, timestamp: '2024-02-28 13:15:00', rule: 'API Error Rate > 5%', severity: 'Warning', value: '6.8%', status: 'Acknowledged', duration: '12 min' },
  { id: 3, timestamp: '2024-02-28 11:45:00', rule: 'CPU > 90%', severity: 'Critical', value: '92.1%', status: 'Resolved', duration: '5 min' },
  { id: 4, timestamp: '2024-02-28 09:20:00', rule: 'Memory > 85%', severity: 'Warning', value: '87.3%', status: 'Resolved', duration: '15 min' },
  { id: 5, timestamp: '2024-02-27 22:10:00', rule: 'CPU > 90%', severity: 'Critical', value: '91.5%', status: 'Resolved', duration: '3 min' },
  { id: 6, timestamp: '2024-02-27 18:30:00', rule: 'API Error Rate > 5%', severity: 'Warning', value: '5.4%', status: 'Resolved', duration: '7 min' },
  { id: 7, timestamp: '2024-02-27 14:00:00', rule: 'Disk > 95%', severity: 'Critical', value: '96.1%', status: 'Acknowledged', duration: '25 min' },
  { id: 8, timestamp: '2024-02-27 10:45:00', rule: 'Response Time > 2000ms', severity: 'Info', value: '2450ms', status: 'Triggered', duration: '—' },
];

const aiSuggestions = [
  { id: 1, text: "Rule 'CPU > 90%' triggered 15 times this week. Consider raising threshold to 95%." },
  { id: 2, text: 'Memory alerts peak between 2-4 AM during backups. Add suppression window.' },
  { id: 3, text: "API error rate rule hasn't triggered in 30 days. Consider lowering threshold from 5% to 3%." },
];

// ─── Component ───────────────────────────────────────────────────────────────

export function AlertsManagementPage() {
  const { isDark, primaryHex } = useTheme() as any;
  const accentColor = primaryHex || '#3b82f6';
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<TabKey>('rules');
  const [rules, setRules] = useState<AlertRule[]>(initialRules);
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [suggestions, setSuggestions] = useState(aiSuggestions);

  // Modal form state
  const [formName, setFormName] = useState('');
  const [formMetric, setFormMetric] = useState('CPU');
  const [formCondition, setFormCondition] = useState('>');
  const [formThreshold, setFormThreshold] = useState(0);
  const [formDuration, setFormDuration] = useState(0);
  const [formSeverity, setFormSeverity] = useState<Severity>('Warning');
  const [formChannels, setFormChannels] = useState<string[]>([]);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const card = `rounded-xl border shadow-sm p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`;
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const btnPrimary = 'bg-blue-600 hover:opacity-90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors';
  const inputClass = `w-full rounded-lg border px-3 py-2 text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`;
  const selectClass = inputClass;

  const severityBadge = (s: Severity) => {
    const map: Record<Severity, string> = {
      Critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      Warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      Info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    };
    return `px-2 py-0.5 rounded-full text-xs font-medium ${isDark ? map[s].split('dark:').pop() : map[s].split(' dark:')[0]}`;
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      Triggered: isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700',
      Resolved: isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700',
      Acknowledged: isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700',
    };
    return `px-2 py-0.5 rounded-full text-xs font-medium ${map[status] || ''}`;
  };

  const openCreateModal = () => {
    setEditingRule(null);
    setFormName('');
    setFormMetric('CPU');
    setFormCondition('>');
    setFormThreshold(0);
    setFormDuration(0);
    setFormSeverity('Warning');
    setFormChannels([]);
    setShowModal(true);
  };

  const openEditModal = (rule: AlertRule) => {
    setEditingRule(rule);
    setFormName(rule.name);
    setFormMetric(rule.metric);
    setFormCondition(rule.condition);
    setFormThreshold(rule.threshold);
    setFormDuration(parseInt(rule.duration) || 0);
    setFormSeverity(rule.severity);
    setFormChannels([]);
    setShowModal(true);
  };

  const handleSaveRule = () => {
    const newRule: AlertRule = {
      id: editingRule ? editingRule.id : Date.now(),
      name: formName,
      metric: formMetric,
      condition: formCondition,
      threshold: formThreshold,
      duration: `${formDuration} min`,
      severity: formSeverity,
      status: editingRule ? editingRule.status : 'Active',
      triggered: editingRule ? editingRule.triggered : '0',
    };
    if (editingRule) {
      setRules(rules.map((r) => (r.id === editingRule.id ? newRule : r)));
    } else {
      setRules([...rules, newRule]);
    }
    setShowModal(false);
  };

  const toggleRule = (id: number) => {
    setRules(rules.map((r) => (r.id === id ? { ...r, status: r.status === 'Active' ? 'Paused' : 'Active' } : r)));
  };

  const deleteRule = (id: number) => {
    setRules(rules.filter((r) => r.id !== id));
  };

  const toggleChannel = (ch: string) => {
    setFormChannels((prev) => (prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]));
  };

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'rules', label: 'Rules', icon: <Bell size={16} /> },
    { key: 'channels', label: 'Channels', icon: <Mail size={16} /> },
    { key: 'escalation', label: 'Escalation', icon: <ArrowRight size={16} /> },
    { key: 'suppression', label: 'Suppression', icon: <Pause size={16} /> },
    { key: 'history', label: 'History', icon: <Clock size={16} /> },
    { key: 'ai', label: 'AI Tuning', icon: <Sparkles size={16} /> },
  ];

  const filteredHistory = historyItems.filter((h) => {
    const matchSearch = h.rule.toLowerCase().includes(searchQuery.toLowerCase());
    const matchSeverity = severityFilter === 'all' || h.severity === severityFilter;
    return matchSearch && matchSeverity;
  });

  // ── Render Tabs ─────────────────────────────────────────────────────────

  const renderTabs = () => (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              isActive
                ? isDark
                  ? 'bg-blue-500/20 text-blue-400 border-blue-500'
                  : 'bg-blue-50 text-blue-700 border-blue-500'
                : isDark
                  ? 'bg-gray-800 text-gray-400 border-gray-700 hover:text-gray-200'
                  : 'bg-white text-gray-600 border-gray-200 hover:text-gray-900'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        );
      })}
    </div>
  );

  // ── Tab 1: Rules ────────────────────────────────────────────────────────

  const renderRules = () => (
    <div className="space-y-6">
      {/* Stats bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Active Rules', value: rules.filter((r) => r.status === 'Active').length, icon: <Bell size={20} className="text-blue-500" /> },
          { label: 'Triggered (24h)', value: 12, icon: <AlertTriangle size={20} className="text-yellow-500" /> },
          { label: 'Suppressed', value: 3, icon: <Pause size={20} className="text-gray-500" /> },
        ].map((stat) => (
          <div key={stat.label} className={card}>
            <div className="flex items-center gap-3">
              {stat.icon}
              <div>
                <p className={`text-2xl font-bold ${textPrimary}`}>{stat.value}</p>
                <p className={`text-sm ${textSecondary}`}>{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Rule button */}
      <div className="flex justify-end">
        <button onClick={openCreateModal} className={`${btnPrimary} flex items-center gap-2`}>
          <Plus size={16} />
          Create Rule
        </button>
      </div>

      {/* Rules List */}
      <div className={card}>
        <h3 className={`text-lg font-semibold mb-4 ${textPrimary}`}>Alert Rules</h3>
        <div className="space-y-3">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border ${
                isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`font-medium ${textPrimary}`}>{rule.name}</span>
                  <span className={severityBadge(rule.severity)}>{rule.severity}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      rule.status === 'Active'
                        ? isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
                        : isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {rule.status}
                  </span>
                </div>
                <p className={`text-sm mt-1 ${textSecondary}`}>Triggered: {rule.triggered}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => openEditModal(rule)} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}>
                  <Edit2 size={16} />
                </button>
                <button onClick={() => deleteRule(rule.id)} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-red-900/30 text-red-400' : 'hover:bg-red-50 text-red-500'}`}>
                  <Trash2 size={16} />
                </button>
                <button onClick={() => toggleRule(rule.id)} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}>
                  {rule.status === 'Active' ? <Pause size={16} /> : <Play size={16} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Tab 2: Channels ─────────────────────────────────────────────────────

  const renderChannels = () => {
    const channels = [
      { name: 'Email', detail: 'smtp://mail.university.edu', active: true, sent: 45, icon: <Mail size={24} className="text-blue-500" /> },
      { name: 'SMS (Twilio)', detail: '+1-555-ALERTS', active: true, sent: 12, icon: <MessageSquare size={24} className="text-blue-500" /> },
      { name: 'Slack', detail: '#it-alerts channel', active: true, sent: 38, icon: <MessageSquare size={24} className="text-blue-500" /> },
      { name: 'PagerDuty', detail: 'IT On-Call Team', active: false, sent: 0, icon: <Phone size={24} className="text-orange-500" /> },
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {channels.map((ch) => (
          <div key={ch.name} className={card}>
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>{ch.icon}</div>
              <div className="flex-1 min-w-0">
                <h4 className={`font-semibold ${textPrimary}`}>{ch.name}</h4>
                <p className={`text-sm ${textSecondary}`}>{ch.detail}</p>
                <div className="flex items-center gap-2 mt-2">
                  {ch.active ? (
                    <span className={`flex items-center gap-1 text-xs font-medium ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                      <CheckCircle size={14} /> Active
                    </span>
                  ) : (
                    <span className={`flex items-center gap-1 text-xs font-medium ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                      <XCircle size={14} /> Inactive
                    </span>
                  )}
                  <span className={`text-xs ${textSecondary}`}>• {ch.sent} alerts sent</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}">
              <button className={`${btnPrimary} text-xs px-3 py-1.5`}>Configure</button>
              {ch.active ? (
                <button className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                  Test
                </button>
              ) : (
                <button className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${isDark ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}>
                  Enable
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ── Tab 3: Escalation ───────────────────────────────────────────────────

  const renderEscalation = () => {
    const policies = [
      {
        name: 'Default Policy',
        levels: [
          { level: 1, delay: '0 min', action: 'Email to IT Team' },
          { level: 2, delay: '15 min', action: 'SMS to Senior Admin' },
          { level: 3, delay: '30 min', action: 'PagerDuty On-Call' },
        ],
      },
      {
        name: 'Critical Policy',
        levels: [
          { level: 1, delay: '0 min', action: 'SMS + Slack' },
          { level: 2, delay: '5 min', action: 'PagerDuty' },
          { level: 3, delay: '10 min', action: 'Phone call to CTO' },
        ],
      },
    ];

    return (
      <div className="space-y-6">
        <div className="flex justify-end">
          <button className={`${btnPrimary} flex items-center gap-2`}>
            <Plus size={16} />
            Add Policy
          </button>
        </div>

        {policies.map((policy) => (
          <div key={policy.name} className={card}>
            <div className="flex items-center justify-between mb-4">
              <h4 className={`font-semibold ${textPrimary}`}>{policy.name}</h4>
              <button className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                <Edit2 size={16} />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {policy.levels.map((lvl, i) => (
                <div key={lvl.level} className="flex items-center gap-3">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isDark ? 'bg-blue-900/40 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
                    {lvl.level}
                  </div>
                  <div className={`flex-1 p-3 rounded-lg border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                    <span className={`text-sm font-medium ${textPrimary}`}>{lvl.action}</span>
                    <span className={`text-xs ml-2 ${textSecondary}`}>after {lvl.delay}</span>
                  </div>
                  {i < policy.levels.length - 1 && <ArrowRight size={16} className={textSecondary} />}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ── Tab 4: Suppression ──────────────────────────────────────────────────

  const renderSuppression = () => {
    const windows = [
      { name: 'Weekly Maintenance', schedule: 'Sundays 02:00-06:00', recurrence: 'Recurring', status: 'Active', suppress: 'Suppress all non-critical' },
      { name: 'Deployment Window', schedule: 'Feb 28, 14:00-16:00', recurrence: 'One-time', status: 'Scheduled', suppress: 'Suppress all' },
    ];

    return (
      <div className="space-y-6">
        <div className="flex justify-end">
          <button className={`${btnPrimary} flex items-center gap-2`}>
            <Plus size={16} />
            Add Window
          </button>
        </div>

        {windows.map((w) => (
          <div key={w.name} className={card}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className={`font-semibold ${textPrimary}`}>{w.name}</h4>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className={`flex items-center gap-1 text-sm ${textSecondary}`}>
                    <Clock size={14} /> {w.schedule}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                    {w.recurrence}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      w.status === 'Active'
                        ? isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
                        : isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {w.status}
                  </span>
                </div>
                <p className={`text-sm mt-1 ${textSecondary}`}>{w.suppress}</p>
              </div>
              <div className="flex items-center gap-2">
                <button className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                  <Edit2 size={16} />
                </button>
                <button className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-red-900/30 text-red-400' : 'hover:bg-red-50 text-red-500'}`}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ── Tab 5: History ──────────────────────────────────────────────────────

  const renderHistory = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textSecondary}`} />
          <input
            type="text"
            placeholder="Search alerts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`${inputClass} pl-9`}
          />
        </div>
        <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className={selectClass} style={{ maxWidth: 180 }}>
          <option value="all">All Severities</option>
          <option value="Critical">Critical</option>
          <option value="Warning">Warning</option>
          <option value="Info">Info</option>
        </select>
      </div>

      {/* History list */}
      <div className={card}>
        <h3 className={`text-lg font-semibold mb-4 ${textPrimary}`}>Alert History</h3>
        <div className="space-y-3">
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-lg border ${
                isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`font-medium ${textPrimary}`}>{item.rule}</span>
                  <span className={severityBadge(item.severity)}>{item.severity}</span>
                  <span className={statusBadge(item.status)}>{item.status}</span>
                </div>
                <div className={`flex items-center gap-3 mt-1 text-sm ${textSecondary}`}>
                  <span>{item.timestamp}</span>
                  <span>Value: {item.value}</span>
                  <span>Duration: {item.duration}</span>
                </div>
              </div>
            </div>
          ))}
          {filteredHistory.length === 0 && (
            <p className={`text-center py-8 ${textSecondary}`}>No alerts match your filters.</p>
          )}
        </div>
      </div>
    </div>
  );

  // ── Tab 6: AI Tuning ────────────────────────────────────────────────────

  const renderAI = () => (
    <div className="space-y-4">
      <div className={card}>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={20} className="text-blue-500" />
          <h3 className={`text-lg font-semibold ${textPrimary}`}>AI-Powered Suggestions</h3>
        </div>
        <p className={`text-sm mb-4 ${textSecondary}`}>
          Recommendations based on alert patterns and historical data.
        </p>

        <div className="space-y-3">
          {suggestions.map((s) => (
            <div
              key={s.id}
              className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
            >
              <p className={`text-sm ${textPrimary}`}>{s.text}</p>
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => setSuggestions(suggestions.filter((x) => x.id !== s.id))}
                  className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${isDark ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
                >
                  <CheckCircle size={14} /> Accept
                </button>
                <button
                  onClick={() => setSuggestions(suggestions.filter((x) => x.id !== s.id))}
                  className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${isDark ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}
                >
                  <XCircle size={14} /> Dismiss
                </button>
              </div>
            </div>
          ))}
          {suggestions.length === 0 && (
            <p className={`text-center py-8 ${textSecondary}`}>No suggestions at this time.</p>
          )}
        </div>
      </div>
    </div>
  );

  // ── Modal ───────────────────────────────────────────────────────────────

  const renderModal = () => {
    if (!showModal) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className={`w-full max-w-lg mx-4 rounded-xl border shadow-xl p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${textPrimary}`}>
            {editingRule ? 'Edit Rule' : 'Create Rule'}
          </h3>

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>Name</label>
              <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} className={inputClass} placeholder="Rule name" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>Metric</label>
                <select value={formMetric} onChange={(e) => setFormMetric(e.target.value)} className={selectClass}>
                  <option>CPU</option>
                  <option>Memory</option>
                  <option>Disk</option>
                  <option>API</option>
                  <option>Response Time</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>Condition</label>
                <select value={formCondition} onChange={(e) => setFormCondition(e.target.value)} className={selectClass}>
                  <option value=">">&gt;</option>
                  <option value="<">&lt;</option>
                  <option value="=">=</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>Threshold</label>
                <input type="number" value={formThreshold} onChange={(e) => setFormThreshold(Number(e.target.value))} className={inputClass} />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>Duration (minutes)</label>
                <input type="number" value={formDuration} onChange={(e) => setFormDuration(Number(e.target.value))} className={inputClass} />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>Severity</label>
              <select value={formSeverity} onChange={(e) => setFormSeverity(e.target.value as Severity)} className={selectClass}>
                <option>Critical</option>
                <option>Warning</option>
                <option>Info</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Channels</label>
              <div className="flex flex-wrap gap-3">
                {['Email', 'SMS', 'Slack', 'PagerDuty'].map((ch) => (
                  <label key={ch} className={`flex items-center gap-2 text-sm ${textPrimary}`}>
                    <input
                      type="checkbox"
                      checked={formChannels.includes(ch)}
                      onChange={() => toggleChannel(ch)}
                      className="rounded border-gray-300"
                    />
                    {ch}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t" style={{ borderColor: isDark ? '#374151' : '#e5e7eb' }}>
            <button
              onClick={() => setShowModal(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Cancel
            </button>
            <button onClick={handleSaveRule} className={btnPrimary}>
              Save
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ── Main Return ─────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-2xl font-bold ${textPrimary}`}>Alerts Management</h1>
        <p className={`mt-1 ${textSecondary}`}>Configure alert rules, notification channels, and escalation policies</p>
      </div>

      {/* Tabs */}
      {renderTabs()}

      {/* Tab Content */}
      {activeTab === 'rules' && renderRules()}
      {activeTab === 'channels' && renderChannels()}
      {activeTab === 'escalation' && renderEscalation()}
      {activeTab === 'suppression' && renderSuppression()}
      {activeTab === 'history' && renderHistory()}
      {activeTab === 'ai' && renderAI()}

      {/* Modal */}
      {renderModal()}
    </div>
  );
}

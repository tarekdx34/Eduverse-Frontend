import { useState, useMemo } from 'react';
import { Activity, Server, Cpu, HardDrive, Wifi, TrendingUp, TrendingDown, RefreshCw, AlertTriangle, CheckCircle, Plus, Edit2, Trash2, Search, Filter, Terminal, X, ServerCrash } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

interface ServerEntry {
  id: number;
  name: string;
  location: string;
  ip: string;
  type: 'Web' | 'API' | 'Database' | 'Cache';
  status: string;
  cpu: number;
  memory: number;
  uptime: string;
  sshConnected: boolean;
}

const cpuChartData = [
  { time: '00:00', cpu: 45 },
  { time: '02:00', cpu: 52 },
  { time: '04:00', cpu: 48 },
  { time: '06:00', cpu: 65 },
  { time: '08:00', cpu: 72 },
  { time: '10:00', cpu: 58 },
  { time: '12:00', cpu: 42 },
  { time: '14:00', cpu: 55 },
  { time: '16:00', cpu: 68 },
  { time: '18:00', cpu: 75 },
  { time: '20:00', cpu: 62 },
  { time: '22:00', cpu: 48 },
];

const defaultServerForm = { name: '', location: '', ip: '', type: 'Web' as const, cpu: 50, memory: 50 };

interface MonitoringPageProps {
  serverStatus: any[];
  performanceMetrics: any;
  onRefresh: () => void;
  onRestartServer: (id: number) => void;
}

export function MonitoringPage({ serverStatus, performanceMetrics, onRefresh, onRestartServer }: MonitoringPageProps) {
  const { isDark, primaryHex } = useTheme() as any;
  const accentColor = primaryHex || '#3b82f6';
  const { t } = useLanguage();

  const [localServers, setLocalServers] = useState<ServerEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingServer, setEditingServer] = useState<ServerEntry | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [serverForm, setServerForm] = useState(defaultServerForm);

  // Merge prop servers with locally added servers
  const allServers: ServerEntry[] = useMemo(() => {
    const fromProps = serverStatus.map((s: any) => ({
      ...s,
      ip: s.ip || '0.0.0.0',
      type: s.type || 'Web',
      sshConnected: s.sshConnected ?? true,
    }));
    return [...fromProps, ...localServers];
  }, [serverStatus, localServers]);

  const filteredServers = useMemo(() => {
    return allServers.filter((s) => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [allServers, searchQuery, statusFilter]);

  const stats = useMemo(() => ({
    total: allServers.length,
    online: allServers.filter((s) => s.status === 'healthy').length,
    warning: allServers.filter((s) => s.status === 'warning').length,
    offline: allServers.filter((s) => s.status === 'critical').length,
  }), [allServers]);

  const nextId = () => Math.max(0, ...allServers.map((s) => s.id)) + 1;

  const openAddModal = () => {
    setEditingServer(null);
    setServerForm(defaultServerForm);
    setModalOpen(true);
  };

  const openEditModal = (server: ServerEntry) => {
    setEditingServer(server);
    setServerForm({ name: server.name, location: server.location, ip: server.ip, type: server.type, cpu: server.cpu, memory: server.memory });
    setModalOpen(true);
  };

  const handleSaveServer = () => {
    if (!serverForm.name.trim()) return;
    if (editingServer) {
      // Check if editing a prop server or local server
      const isLocal = localServers.some((s) => s.id === editingServer.id);
      if (isLocal) {
        setLocalServers((prev) => prev.map((s) => s.id === editingServer.id ? { ...s, ...serverForm } : s));
      } else {
        // Move prop server to local with edits
        setLocalServers((prev) => [...prev, { ...editingServer, ...serverForm }]);
      }
    } else {
      const newServer: ServerEntry = {
        id: nextId(),
        name: serverForm.name,
        location: serverForm.location,
        ip: serverForm.ip,
        type: serverForm.type,
        status: 'healthy',
        cpu: serverForm.cpu,
        memory: serverForm.memory,
        uptime: '0d 0h',
        sshConnected: true,
      };
      setLocalServers((prev) => [...prev, newServer]);
    }
    setModalOpen(false);
  };

  const handleDeleteServer = (id: number) => {
    setLocalServers((prev) => prev.filter((s) => s.id !== id));
    setDeleteConfirm(null);
  };

  const typeBadgeColor = (type: string) => {
    switch (type) {
      case 'Web': return 'bg-blue-500/20 text-blue-400';
      case 'API': return 'bg-blue-500/20 text-blue-400';
      case 'Database': return 'bg-orange-500/20 text-orange-400';
      case 'Cache': return 'bg-teal-500/20 text-teal-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'healthy': return isDark ? 'bg-green-900/30 border-green-700' : 'bg-green-50 border-green-200';
      case 'warning': return isDark ? 'bg-yellow-900/30 border-yellow-700' : 'bg-yellow-50 border-yellow-200';
      case 'critical': return isDark ? 'bg-red-900/30 border-red-700' : 'bg-red-50 border-red-200';
      default: return isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200';
    }
  };

  const getUsageColor = (value: number) => {
    if (value >= 90) return 'bg-red-500';
    if (value >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('monitoring')}
          </h1>
          <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('monitoringDescription')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Server
          </button>
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:opacity-90 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            {t('refresh')}
          </button>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`rounded-xl border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('avgResponseTime')}</p>
            <Activity className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
          </div>
          <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>185ms</p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingDown className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-500">-12% {t('fromLastHour')}</span>
          </div>
        </div>

        <div className={`rounded-xl border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('errorRate')}</p>
            <AlertTriangle className={`w-5 h-5 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
          </div>
          <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>0.3%</p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-500">+0.1% {t('fromLastHour')}</span>
          </div>
        </div>

        <div className={`rounded-xl border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('requestThroughput')}</p>
            <Wifi className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
          </div>
          <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>12.4K/min</p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-500">+8% {t('fromLastHour')}</span>
          </div>
        </div>
      </div>

      {/* Server Status Grid */}
      <div className={`rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('serverStatus')}
          </h2>
        </div>

        {/* Server Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-6 pt-6">
          <div className={`rounded-lg border p-3 text-center ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.total}</p>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Servers</p>
          </div>
          <div className={`rounded-lg border p-3 text-center ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'}`}>
            <p className="text-2xl font-bold text-green-500">{stats.online}</p>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Online</p>
          </div>
          <div className={`rounded-lg border p-3 text-center ${isDark ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'}`}>
            <p className="text-2xl font-bold text-yellow-500">{stats.warning}</p>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Warning</p>
          </div>
          <div className={`rounded-lg border p-3 text-center ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'}`}>
            <p className="text-2xl font-bold text-red-500">{stats.offline}</p>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Offline</p>
          </div>
        </div>

        {/* Search + Status Filter */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-6 pt-4">
          <div className="relative flex-1 w-full">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              placeholder="Search servers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'}`}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            {['all', 'healthy', 'warning', 'critical'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white'
                    : isDark ? 'bg-gray-700 border border-gray-600 text-white hover:bg-gray-600' : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {status === 'all' ? 'All' : status}
              </button>
            ))}
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {filteredServers.length > 0 && (
          <div className="flex items-center gap-2 px-6 pt-4">
            <button className="flex items-center gap-1 px-3 py-1.5 bg-yellow-500 text-white rounded-lg text-xs font-medium hover:bg-yellow-600 transition-colors">
              <RefreshCw className="w-3 h-3" /> Restart All
            </button>
            <button className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600 transition-colors">
              <TrendingUp className="w-3 h-3" /> Update All
            </button>
            <button className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600 transition-colors">
              <HardDrive className="w-3 h-3" /> Backup All
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
          {filteredServers.map((server) => (
            <div
              key={server.id}
              className={`rounded-xl border p-4 ${getStatusBg(server.status)}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Server className={`w-5 h-5 ${getStatusColor(server.status)}`} />
                  <div>
                    <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{server.name}</p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{server.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {/* SSH Indicator */}
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${server.sshConnected ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                    <Terminal className="w-3 h-3 inline mr-0.5" />SSH
                  </span>
                  {/* Type Badge */}
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${typeBadgeColor(server.type)}`}>
                    {server.type === 'Database' ? 'DB' : server.type}
                  </span>
                  {/* Status Badge */}
                  <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                    server.status === 'healthy'
                      ? isDark ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-700'
                      : server.status === 'warning'
                        ? isDark ? 'bg-yellow-500/20 text-yellow-300' : 'bg-yellow-100 text-yellow-700'
                        : isDark ? 'bg-red-500/20 text-red-300' : 'bg-red-100 text-red-700'
                  }`}>
                    {server.status}
                  </span>
                </div>
              </div>

              {/* CPU Usage */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Cpu className="w-3 h-3" /> {t('cpu')}
                  </span>
                  <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{server.cpu}%</span>
                </div>
                <div className={`h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div className={`h-2 rounded-full ${getUsageColor(server.cpu)}`} style={{ width: `${server.cpu}%` }} />
                </div>
              </div>

              {/* Memory Usage */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <HardDrive className="w-3 h-3" /> {t('memory')}
                  </span>
                  <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{server.memory}%</span>
                </div>
                <div className={`h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div className={`h-2 rounded-full ${getUsageColor(server.memory)}`} style={{ width: `${server.memory}%` }} />
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t ${isDark ? 'border-gray-600' : 'border-gray-200'}">
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('uptime')}: {server.uptime}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(server)}
                    className={`p-1 rounded ${isDark ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(server.id)}
                    className={`p-1 rounded ${isDark ? 'hover:bg-red-900/40 text-red-400' : 'hover:bg-red-100 text-red-500'}`}
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onRestartServer(server.id)}
                    className={`text-xs px-2 py-1 rounded ${
                      isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {t('restart')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Chart */}
      <div className={`rounded-xl border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {t('performanceTrends24h')}
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={cpuChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
              <XAxis dataKey="time" tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }} />
              <YAxis tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#fff', border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`, borderRadius: '8px', color: isDark ? '#fff' : '#111827' }}
              />
              <Line type="monotone" dataKey="cpu" stroke="#06b6d4" strokeWidth={2} dot={{ fill: '#06b6d4', r: 4 }} name="CPU %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Add/Edit Server Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className={`rounded-xl border p-6 w-full max-w-md mx-4 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {editingServer ? 'Edit Server' : 'Add Server'}
              </h3>
              <button onClick={() => setModalOpen(false)} className={`p-1 rounded ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Name</label>
                <input type="text" value={serverForm.name} onChange={(e) => setServerForm({ ...serverForm, name: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 bg-white text-gray-900'}`} />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Location</label>
                <input type="text" value={serverForm.location} onChange={(e) => setServerForm({ ...serverForm, location: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 bg-white text-gray-900'}`} />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>IP Address</label>
                <input type="text" value={serverForm.ip} onChange={(e) => setServerForm({ ...serverForm, ip: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 bg-white text-gray-900'}`} />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Type</label>
                <select value={serverForm.type} onChange={(e) => setServerForm({ ...serverForm, type: e.target.value as any })}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 bg-white text-gray-900'}`}>
                  <option value="Web">Web</option>
                  <option value="API">API</option>
                  <option value="Database">Database</option>
                  <option value="Cache">Cache</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>CPU %</label>
                  <input type="range" min="0" max="100" value={serverForm.cpu} onChange={(e) => setServerForm({ ...serverForm, cpu: Number(e.target.value) })} className="w-full" />
                  <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{serverForm.cpu}%</span>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Memory %</label>
                  <input type="range" min="0" max="100" value={serverForm.memory} onChange={(e) => setServerForm({ ...serverForm, memory: Number(e.target.value) })} className="w-full" />
                  <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{serverForm.memory}%</span>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setModalOpen(false)}
                className={`px-4 py-2 rounded-lg text-sm ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                Cancel
              </button>
              <button onClick={handleSaveServer}
                className="px-4 py-2 rounded-lg text-sm bg-blue-600 text-white hover:opacity-90">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className={`rounded-xl border p-6 w-full max-w-sm mx-4 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center gap-3 mb-4">
              <ServerCrash className="w-6 h-6 text-red-500" />
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Delete Server</h3>
            </div>
            <p className={`text-sm mb-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Are you sure you want to delete this server? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteConfirm(null)}
                className={`px-4 py-2 rounded-lg text-sm ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                Cancel
              </button>
              <button onClick={() => handleDeleteServer(deleteConfirm)}
                className="px-4 py-2 rounded-lg text-sm bg-red-600 text-white hover:bg-red-700">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MonitoringPage;

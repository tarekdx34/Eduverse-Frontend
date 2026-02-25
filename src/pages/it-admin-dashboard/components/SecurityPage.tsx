import { useState } from 'react';
import { Shield, Key, Lock, AlertTriangle, CheckCircle, Eye, Clock, FileText, RefreshCw, Download, Users, Settings, Sparkles, UserCheck, UserX, Wifi } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

interface SecurityPageProps {
  securityEvents: any[];
  sslCertificates: any[];
  onRenewCertificate: (id: number) => void;
  onExportLogs: () => void;
}

export function SecurityPage({ securityEvents, sslCertificates, onRenewCertificate, onExportLogs }: SecurityPageProps) {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'events' | 'certificates' | 'access' | 'policies' | 'ai'>('events');

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return isDark ? 'bg-red-500/20 text-red-300' : 'bg-red-100 text-red-700';
      case 'medium': return isDark ? 'bg-yellow-500/20 text-yellow-300' : 'bg-yellow-100 text-yellow-700';
      case 'low': return isDark ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-700';
      default: return isDark ? 'bg-gray-500/20 text-gray-300' : 'bg-gray-100 text-gray-700';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'info': return <CheckCircle className="w-5 h-5 text-blue-500" />;
      default: return <Shield className="w-5 h-5 text-gray-500" />;
    }
  };

  const getCertStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return isDark ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-700';
      case 'expiring': return isDark ? 'bg-yellow-500/20 text-yellow-300' : 'bg-yellow-100 text-yellow-700';
      case 'expired': return isDark ? 'bg-red-500/20 text-red-300' : 'bg-red-100 text-red-700';
      default: return isDark ? 'bg-gray-500/20 text-gray-300' : 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('security')}
          </h1>
          <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('securityDescription')}
          </p>
        </div>
        <button
          onClick={onExportLogs}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          {t('exportLogs')}
        </button>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`rounded-xl border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-green-900/50' : 'bg-green-50'}`}>
              <Shield className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('securityScore')}</p>
          </div>
          <p className={`text-3xl font-bold text-green-500`}>95/100</p>
        </div>

        <div className={`rounded-xl border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-yellow-900/50' : 'bg-yellow-50'}`}>
              <AlertTriangle className={`w-5 h-5 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('activeAlerts')}</p>
          </div>
          <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>3</p>
        </div>

        <div className={`rounded-xl border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-cyan-900/50' : 'bg-cyan-50'}`}>
              <Lock className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('failedLogins24h')}</p>
          </div>
          <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>47</p>
        </div>

        <div className={`rounded-xl border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-purple-900/50' : 'bg-purple-50'}`}>
              <Key className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('activeCertificates')}</p>
          </div>
          <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{sslCertificates.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className={`rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className={`flex border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'events'
                ? isDark ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-cyan-600 border-b-2 border-cyan-600'
                : isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t('securityEvents')}
          </button>
          <button
            onClick={() => setActiveTab('certificates')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'certificates'
                ? isDark ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-cyan-600 border-b-2 border-cyan-600'
                : isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t('sslCertificates')}
          </button>
          <button
            onClick={() => setActiveTab('access')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'access'
                ? isDark ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-cyan-600 border-b-2 border-cyan-600'
                : isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Access Requests
          </button>
          <button
            onClick={() => setActiveTab('policies')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'policies'
                ? isDark ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-cyan-600 border-b-2 border-cyan-600'
                : isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Policies
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'ai'
                ? isDark ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-cyan-600 border-b-2 border-cyan-600'
                : isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            AI Insights
          </button>
        </div>

        {/* Security Events */}
        {activeTab === 'events' && (
          <div className="p-6">
            <div className="space-y-3">
              {securityEvents.map((event) => (
                <div
                  key={event.id}
                  className={`flex items-start gap-4 p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}
                >
                  {getEventIcon(event.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {event.message}
                      </p>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSeverityColor(event.severity)}`}>
                        {t(event.severity)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-sm flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        <Clock className="w-3 h-3" />
                        {event.timestamp}
                      </span>
                    </div>
                  </div>
                  <button className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}>
                    <Eye className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SSL Certificates */}
        {activeTab === 'certificates' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={isDark ? 'bg-gray-700/50' : 'bg-gray-50'}>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('domain')}
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('issuer')}
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('validFrom')}
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('validTo')}
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('status')}
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {sslCertificates.map((cert) => (
                  <tr key={cert.id} className={isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Lock className={`w-4 h-4 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {cert.domain}
                        </span>
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {cert.issuer}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {cert.validFrom}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {cert.validTo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getCertStatusColor(cert.status)}`}>
                        {t(cert.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => onRenewCertificate(cert.id)}
                        className={`flex items-center gap-1 text-sm ${
                          isDark ? 'text-cyan-400 hover:text-cyan-300' : 'text-cyan-600 hover:text-cyan-700'
                        }`}
                      >
                        <RefreshCw className="w-4 h-4" />
                        {t('renew')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Access Requests */}
        {activeTab === 'access' && (
          <div className="p-6">
            <div className="space-y-3">
              {[
                { id: 1, name: 'Dr. Smith', request: 'Admin Panel Access', role: 'Instructor', status: 'Pending', time: '2h ago' },
                { id: 2, name: 'Sara Ibrahim', request: 'Grade Export', role: 'TA', status: 'Approved', time: '1 day ago' },
                { id: 3, name: 'Ahmed Hassan', request: 'Server SSH', role: 'TA', status: 'Denied', time: '2 days ago' },
                { id: 4, name: 'Dr. Johnson', request: 'API Key Generation', role: 'Instructor', status: 'Pending', time: '3h ago' },
                { id: 5, name: 'Mohamed Ali', request: 'Database Read', role: 'Student', status: 'Denied', time: '5 days ago' },
              ].map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-4 p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}
                >
                  <Users className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
                  <div className="flex-1">
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.name}</p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Request: {item.request} · Role: {item.role}
                    </p>
                  </div>
                  <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Clock className="w-3 h-3 inline mr-1" />
                    {item.time}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    item.status === 'Pending'
                      ? isDark ? 'bg-yellow-500/20 text-yellow-300' : 'bg-yellow-100 text-yellow-700'
                      : item.status === 'Approved'
                        ? isDark ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-700'
                        : isDark ? 'bg-red-500/20 text-red-300' : 'bg-red-100 text-red-700'
                  }`}>
                    {item.status}
                  </span>
                  {item.status === 'Pending' && (
                    <div className="flex gap-2">
                      <button className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors">
                        <UserCheck className="w-3 h-3" />
                        Approve
                      </button>
                      <button className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors">
                        <UserX className="w-3 h-3" />
                        Deny
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Policies */}
        {activeTab === 'policies' && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Password Policy */}
              <div className={`rounded-xl border p-6 ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center gap-2 mb-4">
                  <Key className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Password Policy</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Min 8 characters', defaultOn: true },
                    { label: 'Uppercase required', defaultOn: true },
                    { label: 'Numbers required', defaultOn: true },
                    { label: 'Special chars optional', defaultOn: false },
                  ].map((rule, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{rule.label}</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked={rule.defaultOn} className="sr-only peer" />
                        <div className="w-9 h-5 bg-gray-300 peer-checked:bg-cyan-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-cyan-300 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
                      </label>
                    </div>
                  ))}
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Password expiry (days)</span>
                    <input type="number" defaultValue={90} className={`w-20 px-2 py-1 rounded border text-sm ${isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`} />
                  </div>
                </div>
                <button className="mt-4 px-4 py-2 bg-cyan-600 text-white text-sm rounded-lg hover:bg-cyan-700 transition-colors">Save</button>
              </div>

              {/* Login Policy */}
              <div className={`rounded-xl border p-6 ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center gap-2 mb-4">
                  <Lock className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Login Policy</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Max login attempts</span>
                    <input type="number" defaultValue={5} className={`w-20 px-2 py-1 rounded border text-sm ${isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Lockout duration (min)</span>
                    <input type="number" defaultValue={30} className={`w-20 px-2 py-1 rounded border text-sm ${isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>2FA required for admins</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-9 h-5 bg-gray-300 peer-checked:bg-cyan-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-cyan-300 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
                    </label>
                  </div>
                </div>
                <button className="mt-4 px-4 py-2 bg-cyan-600 text-white text-sm rounded-lg hover:bg-cyan-700 transition-colors">Save</button>
              </div>

              {/* Network Policy */}
              <div className={`rounded-xl border p-6 ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center gap-2 mb-4">
                  <Wifi className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Network Policy</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>IP whitelist enabled</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-9 h-5 bg-gray-300 peer-checked:bg-cyan-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-cyan-300 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>VPN required for admin</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-9 h-5 bg-gray-300 peer-checked:bg-cyan-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-cyan-300 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Rate limiting (req/min)</span>
                    <input type="number" defaultValue={1000} className={`w-20 px-2 py-1 rounded border text-sm ${isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`} />
                  </div>
                </div>
                <button className="mt-4 px-4 py-2 bg-cyan-600 text-white text-sm rounded-lg hover:bg-cyan-700 transition-colors">Save</button>
              </div>

              {/* Data Policy */}
              <div className={`rounded-xl border p-6 ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center gap-2 mb-4">
                  <Settings className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Data Policy</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Encryption at rest</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-9 h-5 bg-gray-300 peer-checked:bg-cyan-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-cyan-300 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Backup encryption</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-9 h-5 bg-gray-300 peer-checked:bg-cyan-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-cyan-300 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Data retention (days)</span>
                    <input type="number" defaultValue={365} className={`w-20 px-2 py-1 rounded border text-sm ${isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`} />
                  </div>
                </div>
                <button className="mt-4 px-4 py-2 bg-cyan-600 text-white text-sm rounded-lg hover:bg-cyan-700 transition-colors">Save</button>
              </div>
            </div>
          </div>
        )}

        {/* AI Insights */}
        {activeTab === 'ai' && (
          <div className="p-6">
            <div className="space-y-4">
              {[
                { id: 1, severity: 'critical', border: 'border-red-500', icon: '🔴', text: 'Critical: 3 accounts with weak passwords detected. Force password reset recommended.' },
                { id: 2, severity: 'warning', border: 'border-yellow-500', icon: '🟡', text: 'Warning: Unusual login pattern detected for dr.smith@uni.edu - 15 logins from 5 different IPs in 24h.' },
                { id: 3, severity: 'info', border: 'border-blue-500', icon: '🔵', text: 'Info: SSL certificate for api.university.edu expires in 30 days. Auto-renewal is configured.' },
                { id: 4, severity: 'positive', border: 'border-green-500', icon: '🟢', text: 'Positive: No brute force attempts detected in the last 7 days. Security posture improving.' },
              ].map((insight) => (
                <div
                  key={insight.id}
                  className={`flex items-start gap-4 p-4 rounded-lg border-l-4 ${insight.border} ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}
                >
                  <Sparkles className={`w-5 h-5 mt-0.5 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
                  <div className="flex-1">
                    <p className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                      {insight.icon} {insight.text}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button className="px-3 py-1.5 bg-cyan-600 text-white text-xs rounded-lg hover:bg-cyan-700 transition-colors">
                      Take Action
                    </button>
                    <button className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${isDark ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SecurityPage;

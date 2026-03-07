import React, { useState } from 'react';
import {
  Settings,
  FileText,
  Trophy,
  Award,
  Star,
  Zap,
  Link2,
  Shield,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Search,
  Filter,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { CleanSelect } from '../../../components/shared';


interface AuditLog {
  id: number;
  action: string;
  user: string;
  target: string;
  timestamp: string;
  ip: string;
}

interface GamificationSettings {
  pointsEnabled: boolean;
  badgesEnabled: boolean;
  leaderboardsEnabled: boolean;
  pointsConfig: Record<string, number>;
  badges: Array<{ id: number; name: string; description: string; icon: string; enabled: boolean }>;
}

interface ApiIntegration {
  id: number;
  name: string;
  status: string;
  lastSync: string | null;
  syncFrequency: string | null;
  dataTypes: string[];
}

interface SystemConfigPageProps {
  auditLogs: AuditLog[];
  gamificationSettings: GamificationSettings;
  apiIntegrations: ApiIntegration[];
  onUpdateGamification: (settings: any) => void;
  onToggleIntegration: (id: number, enabled: boolean) => void;
  onSyncIntegration: (id: number) => void;
}

export function SystemConfigPage({
  auditLogs,
  gamificationSettings,
  apiIntegrations,
  onUpdateGamification,
  onToggleIntegration,
  onSyncIntegration,
}: SystemConfigPageProps) {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState<'logs' | 'gamification' | 'integrations'>('logs');
  const [logSearch, setLogSearch] = useState('');
  const [logFilter, setLogFilter] = useState('all');

  const [localGamification, setLocalGamification] = useState(gamificationSettings);

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.user.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.target.toLowerCase().includes(logSearch.toLowerCase());
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-700';
      case 'disconnected': return 'bg-red-100 text-red-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle size={14} />;
      case 'disconnected': return <XCircle size={14} />;
      case 'pending': return <Clock size={14} />;
      default: return <AlertCircle size={14} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('systemConfig')}</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('manageSystemSub')}</p>
        </div>
      </div>

      {/* Section Tabs */}
      <div className={`p-2 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex gap-2">
          {[
            { id: 'logs', label: t('auditLogs'), icon: FileText },
            { id: 'gamification', label: t('gamificationSettings'), icon: Trophy },
            { id: 'integrations', label: t('apiIntegrations'), icon: Link2 },
          ].map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === section.id
                  ? 'bg-red-600 text-white'
                  : isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <section.icon size={18} />
              {section.label}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Logs Section */}
      {activeSection === 'logs' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} size={18} />
                  <input
                    type="text"
                    placeholder={t('searchLogs')}
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
                  />
                </div>
              </div>
              <CleanSelect
                value={logFilter}
                onChange={(e) => setLogFilter(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
              >
                <option value="all">{t('allActions')}</option>
                <option value="user">{t('userActionsFilter')}</option>
                <option value="course">{t('courseActionsFilter')}</option>
                <option value="system">{t('systemActionsFilter')}</option>
              </CleanSelect>
              <button className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                <Download size={18} />
                {t('exportLogs')}
              </button>
            </div>
          </div>

          {/* Logs Table */}
          <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('timestamp')}</th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('action')}</th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('user')}</th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('target')}</th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('ipAddress')}</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className={isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                      <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{log.timestamp}</td>
                      <td className={`px-6 py-4 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{log.action}</td>
                      <td className={`px-6 py-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{log.user}</td>
                      <td className={`px-6 py-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{log.target}</td>
                      <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{log.ip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Gamification Settings Section */}
      {activeSection === 'gamification' && (
        <div className="space-y-6">
          {/* Main Toggles */}
          <div className={`rounded-xl p-6 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('featureToggles')}</h3>
            <div className="space-y-4">
              {[
                { key: 'pointsEnabled', label: t('enablePoints'), icon: Zap, description: t('awardPointsDesc') },
                { key: 'badgesEnabled', label: t('enableBadges'), icon: Award, description: t('enableBadgesDesc') },
                { key: 'leaderboardsEnabled', label: t('enableLeaderboards'), icon: Trophy, description: t('showLeaderboardsDesc') },
              ].map(feature => (
                <div key={feature.key} className={`flex items-center justify-between p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-600' : 'bg-white'}`}>
                      <feature.icon className={isDark ? 'text-yellow-400' : 'text-yellow-600'} size={20} />
                    </div>
                    <div>
                      <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{feature.label}</div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{feature.description}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setLocalGamification({
                      ...localGamification,
                      [feature.key]: !localGamification[feature.key as keyof typeof localGamification],
                    })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      localGamification[feature.key as keyof typeof localGamification] ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        localGamification[feature.key as keyof typeof localGamification] ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Points Configuration */}
          <div className={`rounded-xl p-6 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('pointsConfiguration')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(localGamification.pointsConfig).map(([key, value]) => (
                <div key={key} className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setLocalGamification({
                      ...localGamification,
                      pointsConfig: {
                        ...localGamification.pointsConfig,
                        [key]: parseInt(e.target.value) || 0,
                      },
                    })}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-200'}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Badges Management */}
          <div className={`rounded-xl p-6 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('badgesLabel')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {localGamification.badges.map(badge => (
                <div key={badge.id} className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{badge.icon}</span>
                      <div>
                        <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{badge.name}</div>
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{badge.description}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setLocalGamification({
                        ...localGamification,
                        badges: localGamification.badges.map(b =>
                          b.id === badge.id ? { ...b, enabled: !b.enabled } : b
                        ),
                      })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        badge.enabled ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          badge.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={() => onUpdateGamification(localGamification)}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              {t('saveChanges')}
            </button>
          </div>
        </div>
      )}

      {/* API Integrations Section */}
      {activeSection === 'integrations' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {apiIntegrations.map(integration => (
              <div key={integration.id} className={`rounded-xl border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <Link2 className={isDark ? 'text-gray-300' : 'text-gray-600'} size={24} />
                      </div>
                      <div>
                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{integration.name}</h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(integration.status)}`}>
                          {getStatusIcon(integration.status)}
                          {integration.status.charAt(0).toUpperCase() + integration.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => onToggleIntegration(integration.id, integration.status !== 'connected')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        integration.status === 'connected' ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          integration.status === 'connected' ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
                
                <div className="p-4">
                  {integration.status === 'connected' ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('lastSync')}</span>
                        <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{integration.lastSync}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('syncFrequencyLabel')}</span>
                        <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{integration.syncFrequency}</span>
                      </div>
                      <div>
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('dataTypes')}</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {integration.dataTypes.map((type, index) => (
                            <span key={index} className={`px-2 py-1 rounded text-xs ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                              {type}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => onSyncIntegration(integration.id)}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-2 mt-2 rounded-lg border ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                      >
                        <RefreshCw size={16} />
                        {t('syncNow')}
                      </button>
                    </div>
                  ) : (
                    <div className={`text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <p className="mb-3">{t('notConnected')}</p>
                      <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                        {t('configureConnection')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SystemConfigPage;

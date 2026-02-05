import { useState } from 'react';
import { Key, RefreshCw, ExternalLink, AlertCircle, CheckCircle, Wifi, Cloud, Mail, Video, Brain, ToggleLeft, ToggleRight } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

interface IntegrationsPageProps {
  integrations: any[];
  onToggleIntegration: (id: number, enabled: boolean) => void;
  onSyncIntegration: (id: number) => void;
  onUpdateApiKey: (id: number, key: string) => void;
}

export function IntegrationsPage({ 
  integrations, 
  onToggleIntegration, 
  onSyncIntegration,
  onUpdateApiKey 
}: IntegrationsPageProps) {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [editingKey, setEditingKey] = useState<number | null>(null);
  const [newKey, setNewKey] = useState('');

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'AI': return <Brain className="w-5 h-5" />;
      case 'Cloud': return <Cloud className="w-5 h-5" />;
      case 'Storage': return <Cloud className="w-5 h-5" />;
      case 'Email': return <Mail className="w-5 h-5" />;
      case 'Video': return <Video className="w-5 h-5" />;
      default: return <Wifi className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'AI': return isDark ? 'text-purple-400 bg-purple-900/30' : 'text-purple-600 bg-purple-50';
      case 'Cloud': return isDark ? 'text-blue-400 bg-blue-900/30' : 'text-blue-600 bg-blue-50';
      case 'Storage': return isDark ? 'text-green-400 bg-green-900/30' : 'text-green-600 bg-green-50';
      case 'Email': return isDark ? 'text-orange-400 bg-orange-900/30' : 'text-orange-600 bg-orange-50';
      case 'Video': return isDark ? 'text-cyan-400 bg-cyan-900/30' : 'text-cyan-600 bg-cyan-50';
      default: return isDark ? 'text-gray-400 bg-gray-700' : 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Integrations & APIs
        </h1>
        <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Manage external service integrations and API configurations
        </p>
      </div>

      {/* Usage Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`rounded-xl border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-cyan-900/50' : 'bg-cyan-50'}`}>
              <Wifi className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Active Integrations</p>
          </div>
          <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {integrations.filter(i => i.status === 'active').length}
          </p>
        </div>

        <div className={`rounded-xl border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-green-900/50' : 'bg-green-50'}`}>
              <CheckCircle className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total API Calls Today</p>
          </div>
          <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>245,800</p>
        </div>

        <div className={`rounded-xl border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-purple-900/50' : 'bg-purple-50'}`}>
              <Brain className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Monthly Cost</p>
          </div>
          <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>$2,750</p>
        </div>
      </div>

      {/* Integrations List */}
      <div className={`rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}">
          <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Configured Integrations
          </h2>
        </div>

        <div className="divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}">
          {integrations.map((integration) => (
            <div key={integration.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${getTypeColor(integration.type)}`}>
                    {getTypeIcon(integration.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {integration.name}
                      </h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        integration.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {integration.status}
                      </span>
                    </div>
                    <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Type: {integration.type}
                    </p>
                    
                    {/* API Key */}
                    <div className="flex items-center gap-2 mt-2">
                      <Key className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      {editingKey === integration.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={newKey}
                            onChange={(e) => setNewKey(e.target.value)}
                            placeholder="Enter new API key"
                            className={`px-2 py-1 text-sm rounded border ${
                              isDark 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300'
                            }`}
                          />
                          <button
                            onClick={() => {
                              onUpdateApiKey(integration.id, newKey);
                              setEditingKey(null);
                              setNewKey('');
                            }}
                            className="text-cyan-500 text-sm hover:underline"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingKey(null);
                              setNewKey('');
                            }}
                            className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <code className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {integration.apiKey}
                          </code>
                          <button
                            onClick={() => setEditingKey(integration.id)}
                            className={`text-sm ${isDark ? 'text-cyan-400 hover:text-cyan-300' : 'text-cyan-600 hover:text-cyan-700'}`}
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Usage Stats */}
                    {integration.usage !== null && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Usage: {integration.usage.toLocaleString()} / {integration.limit.toLocaleString()}
                          </span>
                          <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {Math.round((integration.usage / integration.limit) * 100)}%
                          </span>
                        </div>
                        <div className={`h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                          <div
                            className={`h-2 rounded-full ${
                              (integration.usage / integration.limit) > 0.9
                                ? 'bg-red-500'
                                : (integration.usage / integration.limit) > 0.7
                                  ? 'bg-yellow-500'
                                  : 'bg-cyan-500'
                            }`}
                            style={{ width: `${Math.min((integration.usage / integration.limit) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {integration.cost}
                  </span>
                  <button
                    onClick={() => onSyncIntegration(integration.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}
                    title="Sync"
                  >
                    <RefreshCw className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  </button>
                  <button
                    onClick={() => onToggleIntegration(integration.id, integration.status !== 'active')}
                    className={`p-1 ${integration.status === 'active' ? 'text-cyan-500' : 'text-gray-400'}`}
                  >
                    {integration.status === 'active' ? (
                      <ToggleRight className="w-10 h-6" />
                    ) : (
                      <ToggleLeft className="w-10 h-6" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default IntegrationsPage;

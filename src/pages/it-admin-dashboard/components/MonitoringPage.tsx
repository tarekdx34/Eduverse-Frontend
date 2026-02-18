import { useState } from 'react';
import { Activity, Server, Cpu, HardDrive, Wifi, TrendingUp, TrendingDown, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

interface MonitoringPageProps {
  serverStatus: any[];
  performanceMetrics: any;
  onRefresh: () => void;
  onRestartServer: (id: number) => void;
}

export function MonitoringPage({ serverStatus, performanceMetrics, onRefresh, onRestartServer }: MonitoringPageProps) {
  const { isDark } = useTheme();
  const { t } = useLanguage();

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
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          {t('refresh')}
        </button>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`rounded-xl border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('avgResponseTime')}</p>
            <Activity className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
          {serverStatus.map((server) => (
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
          ))}
        </div>
      </div>

      {/* Performance Charts Placeholder */}
      <div className={`rounded-xl border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {t('performanceTrends24h')}
        </h2>
        <div className={`h-64 flex items-center justify-center ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg`}>
          <div className="text-center">
            <Activity className={`w-12 h-12 mx-auto mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('performanceChartsPlaceholder')}
            </p>
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {t('integrateChartingLibrary')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MonitoringPage;

import { Server, Activity, HardDrive, Wifi, Clock, AlertTriangle, CheckCircle, TrendingUp, Shield, Database } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

// Import shared UI components
import { StatsCard } from '../../../components/shared/ui/cards/StatsCard';
import { WelcomeHeader } from '../../../components/shared/ui/layout/WelcomeHeader';
import { FadeIn } from '../../../components/shared/ui/layout/PageTransition';

interface DashboardOverviewProps {
  stats: any[];
  serverStatus: any[];
  recentActivity: any[];
  onNavigate: (tab: string) => void;
}

export function DashboardOverview({ stats, serverStatus, recentActivity, onNavigate }: DashboardOverviewProps) {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const healthyServers = serverStatus?.filter(s => s.status === 'healthy').length || 0;
  const totalServers = serverStatus?.length || 0;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <FadeIn direction="down" delay={0}>
        <WelcomeHeader
          greeting="Welcome"
          userName="IT Admin"
          subtitle="All systems operational -"
          highlightText={`${healthyServers}/${totalServers} servers healthy`}
          role="it-admin"
          actions={
            <button
              onClick={() => onNavigate('monitoring')}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors"
            >
              <Activity className="w-4 h-4" />
              System Monitor
            </button>
          }
        />
      </FadeIn>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <FadeIn delay={100}>
          <StatsCard
            title="System Uptime"
            value={99.9}
            valueSuffix="%"
            subtitle="this month"
            icon={<Activity className="w-5 h-5" />}
            trend={{ value: 0.1, label: 'improvement', isPositive: true }}
            color="cyan"
          />
        </FadeIn>
        <FadeIn delay={150}>
          <StatsCard
            title="API Requests"
            value="2.4M"
            subtitle="today"
            icon={<Wifi className="w-5 h-5" />}
            trend={{ value: 12, label: 'vs yesterday', isPositive: true }}
            color="indigo"
          />
        </FadeIn>
        <FadeIn delay={200}>
          <StatsCard
            title="Active Servers"
            value={healthyServers}
            subtitle={`of ${totalServers} total`}
            icon={<Server className="w-5 h-5" />}
            color="green"
          />
        </FadeIn>
        <FadeIn delay={250}>
          <StatsCard
            title="Storage Used"
            value={68}
            valueSuffix="%"
            subtitle="of 10TB"
            icon={<Database className="w-5 h-5" />}
            progress={{ current: 68, max: 100 }}
            color="purple"
          />
        </FadeIn>
      </div>

      {/* Server Status & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Server Status */}
        <div className={`rounded-xl border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Server Status
            </h2>
            <button
              onClick={() => onNavigate('monitoring')}
              className={`text-sm ${isDark ? 'text-cyan-400 hover:text-cyan-300' : 'text-cyan-600 hover:text-cyan-700'}`}
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {serverStatus.slice(0, 4).map((server) => (
              <div
                key={server.id}
                className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(server.status)}
                  <div>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{server.name}</p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{server.location}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    CPU: {server.cpu}%
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Memory: {server.memory}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className={`rounded-xl border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Recent IT Activity
            </h2>
            <button
              onClick={() => onNavigate('security')}
              className={`text-sm ${isDark ? 'text-cyan-400 hover:text-cyan-300' : 'text-cyan-600 hover:text-cyan-700'}`}
            >
              View Logs
            </button>
          </div>
          <div className="space-y-3">
            {recentActivity.slice(0, 5).map((activity) => (
              <div
                key={activity.id}
                className={`flex items-start gap-3 p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}
              >
                <div className={`p-2 rounded-lg ${isDark ? 'bg-cyan-900/50' : 'bg-cyan-50'}`}>
                  <Activity className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{activity.action}</p>
                  <p className={`text-sm truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{activity.details}</p>
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={`rounded-xl border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Run Backup', icon: HardDrive, onClick: () => onNavigate('database') },
            { label: 'View Logs', icon: Activity, onClick: () => onNavigate('security') },
            { label: 'Check APIs', icon: Wifi, onClick: () => onNavigate('integrations') },
            { label: 'AI Usage', icon: TrendingUp, onClick: () => onNavigate('ai') },
          ].map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-colors ${
                isDark
                  ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <action.icon className={`w-6 h-6 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
              <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DashboardOverview;

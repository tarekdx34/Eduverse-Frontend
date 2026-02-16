import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  LayoutGrid,
  Settings,
  Wifi,
  Database,
  Activity,
  Shield,
  Brain,
  Building2,
  MessageCircle,
} from 'lucide-react';
import {
  Sidebar,
  Header,
  DashboardOverview,
  SystemConfigPage,
  IntegrationsPage,
  DatabasePage,
  MonitoringPage,
  SecurityPage,
  AIManagementPage,
  MultiCampusPage,
} from './components';
import { MessagingChat } from '../../components/shared';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import {
  IT_DASHBOARD_STATS,
  SERVER_STATUS,
  API_INTEGRATIONS,
  DATABASE_BACKUPS,
  SECURITY_EVENTS,
  SSL_CERTIFICATES,
  AI_MODELS,
  CAMPUSES,
  SYSTEM_SETTINGS,
  BRANDING_SETTINGS,
  PERFORMANCE_METRICS,
  RECENT_IT_ACTIVITY,
} from './constants';

type TabKey =
  | 'dashboard'
  | 'config'
  | 'integrations'
  | 'database'
  | 'monitoring'
  | 'security'
  | 'ai'
  | 'campus'
  | 'chat';

const TABS: { key: TabKey; label: string; labelAr: string; icon: any }[] = [
  { key: 'dashboard', label: 'Dashboard', labelAr: 'لوحة التحكم', icon: LayoutGrid },
  { key: 'config', label: 'System Config', labelAr: 'إعدادات النظام', icon: Settings },
  { key: 'integrations', label: 'Integrations & APIs', labelAr: 'التكاملات', icon: Wifi },
  { key: 'database', label: 'Database', labelAr: 'قاعدة البيانات', icon: Database },
  { key: 'monitoring', label: 'Monitoring', labelAr: 'المراقبة', icon: Activity },
  { key: 'security', label: 'Security', labelAr: 'الأمان', icon: Shield },
  { key: 'ai', label: 'AI Management', labelAr: 'إدارة الذكاء الاصطناعي', icon: Brain },
  { key: 'campus', label: 'Multi-Campus', labelAr: 'متعدد الحرم', icon: Building2 },
  { key: 'chat', label: 'Chat', labelAr: 'الدردشة', icon: MessageCircle },
];

function ITAdminDashboardContent() {
  const navigate = useNavigate();
  const params = useParams();
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const { isDark } = useTheme();
  const { language } = useLanguage();

  // State for data management
  const [serverStatus, setServerStatus] = useState(SERVER_STATUS);
  const [integrations, setIntegrations] = useState(API_INTEGRATIONS);
  const [backups, setBackups] = useState(DATABASE_BACKUPS);
  const [securityEvents] = useState(SECURITY_EVENTS);
  const [sslCertificates, setSslCertificates] = useState(SSL_CERTIFICATES);
  const [aiModels, setAiModels] = useState(AI_MODELS);
  const [campuses, setCampuses] = useState(CAMPUSES);
  const [systemSettings, setSystemSettings] = useState(SYSTEM_SETTINGS);
  const [brandingSettings, setBrandingSettings] = useState(BRANDING_SETTINGS);

  // Sync tab from URL
  useEffect(() => {
    const tabParam = (params.tab as TabKey) || 'dashboard';
    if (TABS.some((t) => t.key === tabParam)) {
      setActiveTab(tabParam);
    } else {
      setActiveTab('dashboard');
    }
  }, [params.tab]);

  // Navigate on tab change
  const handleTabChange = (key: TabKey) => {
    setActiveTab(key);
    navigate(`/itadmindashboard/${key}`);
  };

  // Translate tabs based on language
  const translatedTabs = TABS.map(tab => ({
    ...tab,
    label: language === 'ar' ? tab.labelAr : tab.label
  }));

  // Integration handlers
  const handleToggleIntegration = (id: number, enabled: boolean) => {
    setIntegrations(integrations.map(i => 
      i.id === id ? { ...i, status: enabled ? 'active' : 'inactive' } : i
    ));
  };

  const handleSyncIntegration = (id: number) => {
    alert(`Syncing integration ${id}...`);
  };

  const handleUpdateApiKey = (id: number, key: string) => {
    setIntegrations(integrations.map(i =>
      i.id === id ? { ...i, apiKey: key } : i
    ));
    alert('API key updated!');
  };

  // Database handlers
  const handleRunBackup = (type: string) => {
    alert(`Running ${type} backup...`);
  };

  const handleRestoreBackup = (id: number) => {
    if (confirm('Are you sure you want to restore this backup?')) {
      alert(`Restoring backup ${id}...`);
    }
  };

  const handleDownloadBackup = (id: number) => {
    alert(`Downloading backup ${id}...`);
  };

  // Monitoring handlers
  const handleRefreshMonitoring = () => {
    alert('Refreshing monitoring data...');
  };

  const handleRestartServer = (id: number) => {
    if (confirm('Are you sure you want to restart this server?')) {
      alert(`Restarting server ${id}...`);
    }
  };

  // Security handlers
  const handleRenewCertificate = (id: number) => {
    setSslCertificates(sslCertificates.map(c =>
      c.id === id ? { ...c, status: 'valid', validTo: '2027-02-05' } : c
    ));
    alert('Certificate renewal initiated!');
  };

  const handleExportLogs = () => {
    alert('Exporting security logs...');
  };

  // AI handlers
  const handleToggleAIModel = (id: number, enabled: boolean) => {
    setAiModels(aiModels.map(m =>
      m.id === id ? { ...m, status: enabled ? 'active' : 'inactive' } : m
    ));
  };

  const handleUpdateAIModelSettings = (id: number, settings: any) => {
    console.log('Update AI model settings:', id, settings);
  };

  // Campus handlers
  const handleAddCampus = (campus: any) => {
    const newCampus = {
      id: Math.max(...campuses.map(c => c.id)) + 1,
      ...campus,
      students: 0,
      instructors: 0,
      storage: '0 TB',
      status: 'active',
    };
    setCampuses([...campuses, newCampus]);
  };

  const handleEditCampus = (id: number, campus: any) => {
    setCampuses(campuses.map(c => c.id === id ? { ...c, ...campus } : c));
  };

  const handleDeleteCampus = (id: number) => {
    if (confirm('Are you sure you want to delete this campus?')) {
      setCampuses(campuses.filter(c => c.id !== id));
    }
  };

  // System config handlers
  const handleUpdateSystemSettings = (settings: any) => {
    setSystemSettings(settings);
  };

  const handleUpdateBrandingSettings = (settings: any) => {
    setBrandingSettings(settings);
  };

  return (
    <div
      className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      {/* Header */}
      <Header userName="IT Administrator" />

      <div className="flex">
        {/* Sidebar */}
        <Sidebar tabs={translatedTabs} activeTab={activeTab} onChangeTab={handleTabChange} />

        {/* Main Content */}
        <main className="flex-1 p-6 mt-14">
          {/* Dashboard Overview */}
          {activeTab === 'dashboard' && (
            <DashboardOverview
              stats={IT_DASHBOARD_STATS}
              serverStatus={serverStatus}
              recentActivity={RECENT_IT_ACTIVITY}
              onNavigate={(tab) => handleTabChange(tab as TabKey)}
            />
          )}

          {/* System Configuration */}
          {activeTab === 'config' && (
            <SystemConfigPage
              systemSettings={systemSettings}
              brandingSettings={brandingSettings}
              onUpdateSystemSettings={handleUpdateSystemSettings}
              onUpdateBrandingSettings={handleUpdateBrandingSettings}
            />
          )}

          {/* Integrations & APIs */}
          {activeTab === 'integrations' && (
            <IntegrationsPage
              integrations={integrations}
              onToggleIntegration={handleToggleIntegration}
              onSyncIntegration={handleSyncIntegration}
              onUpdateApiKey={handleUpdateApiKey}
            />
          )}

          {/* Database Management */}
          {activeTab === 'database' && (
            <DatabasePage
              backups={backups}
              onRunBackup={handleRunBackup}
              onRestoreBackup={handleRestoreBackup}
              onDownloadBackup={handleDownloadBackup}
            />
          )}

          {/* Monitoring & Performance */}
          {activeTab === 'monitoring' && (
            <MonitoringPage
              serverStatus={serverStatus}
              performanceMetrics={PERFORMANCE_METRICS}
              onRefresh={handleRefreshMonitoring}
              onRestartServer={handleRestartServer}
            />
          )}

          {/* Security Management */}
          {activeTab === 'security' && (
            <SecurityPage
              securityEvents={securityEvents}
              sslCertificates={sslCertificates}
              onRenewCertificate={handleRenewCertificate}
              onExportLogs={handleExportLogs}
            />
          )}

          {/* AI Management */}
          {activeTab === 'ai' && (
            <AIManagementPage
              aiModels={aiModels}
              onToggleModel={handleToggleAIModel}
              onUpdateModelSettings={handleUpdateAIModelSettings}
            />
          )}

          {/* Multi-Campus */}
          {activeTab === 'campus' && (
            <MultiCampusPage
              campuses={campuses}
              onAddCampus={handleAddCampus}
              onEditCampus={handleEditCampus}
              onDeleteCampus={handleDeleteCampus}
            />
          )}

          {/* Chat */}
          {activeTab === 'chat' && (
            <MessagingChat
              height="calc(100vh - 160px)"
              currentUserName="IT Administrator"
              showVideoCall={true}
              showVoiceCall={true}
            />
          )}
        </main>
      </div>
    </div>
  );
}

// Main component wrapped with providers
function ITAdminDashboard() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ITAdminDashboardContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default ITAdminDashboard;

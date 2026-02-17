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
  User,
} from 'lucide-react';
import {
  DashboardOverview,
  SystemConfigPage,
  IntegrationsPage,
  DatabasePage,
  MonitoringPage,
  SecurityPage,
  AIManagementPage,
  MultiCampusPage,
} from './components';
import { DashboardHeader, DashboardSidebar, MessagingChat } from '../../components/shared';
import { DashboardProfileTab } from '../../components/shared/DashboardProfileTab';
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
  | 'chat'
  | 'profile';

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
  { key: 'profile', label: 'Profile', labelAr: 'الملف الشخصي', icon: User },
];

function ITAdminDashboardContent() {
  const navigate = useNavigate();
  const params = useParams();
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const { isDark, toggleTheme } = useTheme();
  const { language, isRTL, setLanguage, t } = useLanguage();

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
      className={`flex min-h-screen ${isRTL ? 'flex-row-reverse' : ''} ${isDark ? 'bg-background-dark' : 'bg-background-light'} text-slate-800 dark:text-slate-100 transition-colors duration-300`}
      style={{ fontFamily: "'Montserrat', sans-serif" }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Fixed Sidebar */}
      <div className={`fixed ${isRTL ? 'right-0' : 'left-0'} top-0 z-50 h-screen`}>
        <DashboardSidebar
          tabs={translatedTabs.map(tab => ({ id: tab.key, label: tab.label, icon: tab.icon }))}
          activeTab={activeTab}
          onTabChange={(key) => handleTabChange(key as TabKey)}
          onLogout={() => navigate('/login')}
          isDark={isDark}
          isRTL={isRTL}
          accentColor="#0891B2"
        />
      </div>

      {/* Main Content */}
      <main className={`flex-1 ${isRTL ? 'mr-64' : 'ml-64'} p-6 lg:p-10`}>
        <DashboardHeader
          userName="IT Administrator"
          userRole="IT Admin"
          isDark={isDark}
          isRTL={isRTL}
          accentColor="#0891B2"
          avatarGradient="from-cyan-500 to-blue-600"
          language={language}
          onToggleTheme={toggleTheme}
          onSetLanguage={setLanguage}
          searchRole="admin"
          onProfileClick={() => handleTabChange('profile')}
          translations={{
            search: t('search') || 'Search...',
            language: t('language'),
            english: t('english'),
            arabic: t('arabic'),
            darkMode: t('darkMode'),
            lightMode: t('lightMode'),
            viewProfile: t('viewProfile'),
            logout: t('logout'),
          }}
        />
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

          {/* Profile */}
          {activeTab === 'profile' && (
            <DashboardProfileTab
              isDark={isDark}
              accentColor="#0891B2"
              bannerGradient="from-cyan-500 to-blue-600"
              profileData={{
                fullName: 'IT Administrator',
                role: 'IT Admin',
                department: 'Information Technology',
                email: 'it.admin@university.edu',
                phone: '+1 (555) 900-1234',
                address: 'IT Building, Server Room 1',
                dateOfBirth: '1982-07-20',
                bio: 'Senior IT Administrator managing university infrastructure, server systems, network security, and technology integrations. Ensuring 99.9% uptime and system reliability.',
                specialization: ['Infrastructure Management', 'Network Security', 'Cloud Architecture', 'DevOps', 'System Integration'],
                skills: ['AWS', 'Azure', 'Docker', 'Kubernetes', 'Linux', 'Terraform', 'Ansible'],
                badges: [
                  { name: 'Uptime Hero', description: '99.9% uptime', icon: 'dns', color: '#0891B2', unlocked: true },
                  { name: 'Security Pro', description: 'Zero breaches', icon: 'security', color: '#3B82F6', unlocked: true },
                  { name: 'Cloud Expert', description: 'Multi-cloud', icon: 'cloud', color: '#10B981', unlocked: true },
                  { name: 'Automator', description: '100+ scripts', icon: 'terminal', color: '#F59E0B', unlocked: true },
                  { name: 'Architect', description: 'System redesign', icon: 'architecture', color: '#EC4899', unlocked: false },
                  { name: 'Certified', description: 'AWS Solutions', icon: 'workspace_premium', color: '#6366F1', unlocked: false },
                ],
                achievements: [
                  { title: 'Infrastructure Excellence', description: 'Yearly IT Award 2023', emoji: '🏆' },
                  { title: 'Zero Downtime Migration', description: 'Cloud migration success', emoji: '☁️' },
                ],
              }}
            />
          )}
      </main>
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

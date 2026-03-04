import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { campusService } from '../../services/api/campusService';
import {
  LayoutGrid,
  Settings,
  Wifi,
  Database,
  Activity,
  Shield,
  Building2,
  MessageCircle,
  User,
  Menu,
  Bell,
  Cloud,
  Bug,
  Users,
  HeadphonesIcon,
  Lock,
} from 'lucide-react';
import {
  DashboardOverview,
  SystemConfigPage,
  IntegrationsPage,
  DatabasePage,
  MonitoringPage,
  SecurityPage,
  MultiCampusPage,
  AlertsManagementPage,
  CloudServicesPage,
  ErrorLogsPage,
} from './components';
import { UserManagementPage } from './components/UserManagementPage';
import { RoleManagementPage } from './components/RoleManagementPage';
import { BackupCenterPage } from './components/BackupCenterPage';
import { FeedbackSupportPage } from './components/FeedbackSupportPage';
import { SecurityLogsPage } from './components/SecurityLogsPage';
import { DashboardHeader, DashboardSidebar, MessagingChat, LoadingSkeleton, ErrorMessage } from '../../components/shared';
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
  SYSTEM_SETTINGS,
  BRANDING_SETTINGS,
  PERFORMANCE_METRICS,
  RECENT_IT_ACTIVITY,
} from './constants';

type TabKey =
  | 'dashboard'
  | 'users'
  | 'roles'
  | 'config'
  | 'integrations'
  | 'database'
  | 'monitoring'
  | 'security'
  | 'security-logs'
  | 'backup'
  | 'campus'
  | 'alerts'
  | 'cloud'
  | 'error-logs'
  | 'feedback'
  | 'chat'
  | 'profile';

const TABS: { key: TabKey; label: string; labelAr: string; icon: any; group: string }[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    labelAr: 'لوحة التحكم',
    icon: LayoutGrid,
    group: 'Overview',
  },
  {
    key: 'users',
    label: 'User Management',
    labelAr: 'إدارة المستخدمين',
    icon: Users,
    group: 'Access',
  },
  {
    key: 'roles',
    label: 'Role Management',
    labelAr: 'إدارة الأدوار',
    icon: Shield,
    group: 'Access',
  },
  {
    key: 'config',
    label: 'System Config',
    labelAr: 'إعدادات النظام',
    icon: Settings,
    group: 'Infrastructure',
  },
  {
    key: 'integrations',
    label: 'Integrations & APIs',
    labelAr: 'التكاملات',
    icon: Wifi,
    group: 'Infrastructure',
  },
  {
    key: 'database',
    label: 'Database',
    labelAr: 'قاعدة البيانات',
    icon: Database,
    group: 'Infrastructure',
  },
  {
    key: 'monitoring',
    label: 'Monitoring',
    labelAr: 'المراقبة',
    icon: Activity,
    group: 'Monitoring',
  },
  { key: 'security', label: 'Security', labelAr: 'الأمان', icon: Shield, group: 'Security' },
  {
    key: 'security-logs',
    label: 'Security Logs',
    labelAr: 'سجلات الأمان',
    icon: Lock,
    group: 'Security',
  },
  {
    key: 'backup',
    label: 'Backup Center',
    labelAr: 'مركز النسخ الاحتياطي',
    icon: Database,
    group: 'Security',
  },
  {
    key: 'campus',
    label: 'Multi-Campus',
    labelAr: 'متعدد الحرم',
    icon: Building2,
    group: 'Organization',
  },
  { key: 'alerts', label: 'Alerts', labelAr: 'التنبيهات', icon: Bell, group: 'Monitoring' },
  {
    key: 'cloud',
    label: 'Cloud Services',
    labelAr: 'الخدمات السحابية',
    icon: Cloud,
    group: 'Infrastructure',
  },
  {
    key: 'error-logs',
    label: 'Error Logs',
    labelAr: 'سجلات الأخطاء',
    icon: Bug,
    group: 'Monitoring',
  },
  {
    key: 'feedback',
    label: 'Feedback & Support',
    labelAr: 'الملاحظات والدعم',
    icon: HeadphonesIcon,
    group: 'Organization',
  },
  { key: 'chat', label: 'Chat', labelAr: 'الدردشة', icon: MessageCircle, group: 'Communication' },
  { key: 'profile', label: 'Profile', labelAr: 'الملف الشخصي', icon: User, group: 'Account' },
];

function ITAdminDashboardContent() {
  const navigate = useNavigate();
  const params = useParams();
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isDark, toggleTheme, primaryHex, primaryColor, setPrimaryColor } = useTheme() as any;
  const { language, isRTL, setLanguage, t } = useLanguage();
  const { user } = useAuth();

  // State for data management
  const [serverStatus, setServerStatus] = useState(SERVER_STATUS);
  const [integrations, setIntegrations] = useState(API_INTEGRATIONS);
  const [backups, setBackups] = useState(DATABASE_BACKUPS);
  const [securityEvents] = useState(SECURITY_EVENTS);
  const [sslCertificates, setSslCertificates] = useState(SSL_CERTIFICATES);
  const { data: campusesRaw, error: campusesError, loading: campusesLoading, refetch: refetchCampuses } = useApi(() => campusService.listCampuses(), []);
  const [campuses, setCampuses] = useState<any[]>([]);
  const [systemSettings, setSystemSettings] = useState(SYSTEM_SETTINGS);
  const [brandingSettings, setBrandingSettings] = useState(BRANDING_SETTINGS);

  useEffect(() => { if (campusesError) toast.error('Failed to load campuses'); }, [campusesError]);

  useEffect(() => {
    if (campusesRaw) setCampuses(campusesRaw.map((c: any) => ({
      id: c.id,
      name: c.name,
      domain: c.domain || `${c.name?.toLowerCase().replace(/\s+/g, '')}.eduverse.com`,
      students: c.students || 0,
      instructors: c.instructors || 0,
      status: c.status || 'active',
      storage: c.storage || '0 TB',
    })));
  }, [campusesRaw]);

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
  const translatedTabs = TABS.map((tab) => ({
    ...tab,
    label: language === 'ar' ? tab.labelAr : tab.label,
  }));

  // Integration handlers
  const handleToggleIntegration = (id: number, enabled: boolean) => {
    setIntegrations(
      integrations.map((i) => (i.id === id ? { ...i, status: enabled ? 'active' : 'inactive' } : i))
    );
  };

  const handleSyncIntegration = (id: number) => {
    alert(`Syncing integration ${id}...`);
  };

  const handleUpdateApiKey = (id: number, key: string) => {
    setIntegrations(integrations.map((i) => (i.id === id ? { ...i, apiKey: key } : i)));
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
    setSslCertificates(
      sslCertificates.map((c) =>
        c.id === id ? { ...c, status: 'valid', validTo: '2027-02-05' } : c
      )
    );
    alert('Certificate renewal initiated!');
  };

  const handleExportLogs = () => {
    alert('Exporting security logs...');
  };

  // Campus handlers
  const handleAddCampus = async (campus: any) => {
    try {
      await campusService.createCampus(campus);
      await refetchCampuses();
      toast.success('Campus added successfully');
    } catch (err) {
      toast.error('Failed to add campus');
    }
  };

  const handleEditCampus = async (id: number, campus: any) => {
    try {
      await campusService.updateCampus(id, campus);
      await refetchCampuses();
      toast.success('Campus updated successfully');
    } catch (err) {
      toast.error('Failed to update campus');
    }
  };

  const handleDeleteCampus = async (id: number) => {
    if (confirm('Are you sure you want to delete this campus?')) {
      try {
        await campusService.deleteCampus(id);
        await refetchCampuses();
        toast.success('Campus deleted successfully');
      } catch (err) {
        toast.error('Failed to delete campus');
      }
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
      {/* Sidebar */}
      <DashboardSidebar
        tabs={translatedTabs.map((tab) => ({
          id: tab.key,
          label: tab.label,
          icon: tab.icon,
          group: tab.group,
        }))}
        activeTab={activeTab}
        onTabChange={(key) => handleTabChange(key as TabKey)}
        onLogout={() => navigate('/login')}
        isDark={isDark}
        isRTL={isRTL}
        accentColor={primaryHex || '#3b82f6'}
        isMobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
        groupOrder={[
          'Overview',
          'Access',
          'Infrastructure',
          'Monitoring',
          'Security',
          'Organization',
          'Communication',
          'Account',
        ]}
      />

      {/* Main Content */}
      <main className={`flex-1 ${isRTL ? 'lg:mr-64' : 'lg:ml-64'} ${activeTab === 'chat' ? 'p-0' : 'p-4 lg:p-10'}`}>
        {activeTab !== 'chat' && (
        <DashboardHeader
          userName={user?.fullName || user?.firstName || 'IT Administrator'}
          userRole="IT Admin"
          isDark={isDark}
          isRTL={isRTL}
          accentColor={primaryHex || '#3b82f6'}
          avatarGradient="from-[#3b82f6] to-[#06b6d4]"
          language={language}
          onToggleTheme={toggleTheme}
          onSetLanguage={setLanguage}
          searchRole="admin"
          onProfileClick={() => handleTabChange('profile')}
          onMenuClick={() => setSidebarOpen(true)}
          primaryColor={primaryColor}
          onSetPrimaryColor={setPrimaryColor}
          availableColors={[
            { id: 'blue', colorClass: 'bg-blue-500', hex: '#3b82f6' },
            { id: 'emerald', colorClass: 'bg-emerald-500', hex: '#10b981' },
            { id: 'rose', colorClass: 'bg-blue-500', hex: '#f43f5e' },
            { id: 'amber', colorClass: 'bg-amber-500', hex: '#f59e0b' },
          ]}
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
        )}
        {/* Dashboard Overview */}
        {activeTab === 'dashboard' && (
          <DashboardOverview
            stats={IT_DASHBOARD_STATS}
            serverStatus={serverStatus}
            recentActivity={RECENT_IT_ACTIVITY}
            onNavigate={(tab) => handleTabChange(tab as TabKey)}
          />
        )}

        {/* User Management (moved from Admin) */}
        {activeTab === 'users' && <UserManagementPage />}

        {/* Role Management (moved from Admin) */}
        {activeTab === 'roles' && <RoleManagementPage />}

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

        {/* Multi-Campus */}
        {activeTab === 'campus' && (
          campusesLoading ? <LoadingSkeleton variant="card" count={3} /> :
          campusesError ? <ErrorMessage error={campusesError} onRetry={refetchCampuses} /> :
          <MultiCampusPage
            campuses={campuses}
            onAddCampus={handleAddCampus}
            onEditCampus={handleEditCampus}
            onDeleteCampus={handleDeleteCampus}
          />
        )}

        {/* Alerts Management */}
        {activeTab === 'alerts' && <AlertsManagementPage />}

        {/* Cloud Services */}
        {activeTab === 'cloud' && <CloudServicesPage />}

        {/* Error Logs */}
        {activeTab === 'error-logs' && <ErrorLogsPage />}

        {/* Security Logs (moved from Admin) */}
        {activeTab === 'security-logs' && <SecurityLogsPage />}

        {/* Backup Center (moved from Admin) */}
        {activeTab === 'backup' && <BackupCenterPage />}

        {/* Feedback & Support (moved from Admin) */}
        {activeTab === 'feedback' && <FeedbackSupportPage />}

        {/* Chat */}
        {activeTab === 'chat' && (
          <MessagingChat
            height="100vh"
            accentColor={primaryHex || '#4f46e5'}
            className="rounded-none border-0"
            currentUserName={user?.fullName || user?.firstName || 'IT Administrator'}
            showVideoCall={true}
            showVoiceCall={true}
            isDark={isDark}
          />
        )}

        {/* Profile */}
        {activeTab === 'profile' && (
          <DashboardProfileTab
            isDark={isDark}
            accentColor={primaryHex || '#3b82f6'}
            bannerGradient="from-[#3b82f6] to-[#06b6d4]"
            profileData={{
              fullName: user?.fullName || `${user?.firstName || 'IT'} ${user?.lastName || 'Administrator'}`,
              role: 'IT Admin',
              department: 'Information Technology',
              email: user?.email || 'it.admin@university.edu',
              phone: '+1 (555) 900-1234',
              address: 'IT Building, Server Room 1',
              dateOfBirth: '1982-07-20',
              bio: 'Senior IT Administrator managing university infrastructure, server systems, network security, and technology integrations. Ensuring 99.9% uptime and system reliability.',
              specialization: [
                'Infrastructure Management',
                'Network Security',
                'Cloud Architecture',
                'DevOps',
                'System Integration',
              ],
              skills: ['AWS', 'Azure', 'Docker', 'Kubernetes', 'Linux', 'Terraform', 'Ansible'],
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

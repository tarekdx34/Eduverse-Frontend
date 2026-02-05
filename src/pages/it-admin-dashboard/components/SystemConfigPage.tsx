import { useState } from 'react';
import { Settings, Globe, Palette, Clock, Shield, Save, RefreshCw, ToggleLeft, ToggleRight } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

interface SystemConfigPageProps {
  systemSettings: any;
  brandingSettings: any;
  onUpdateSystemSettings: (settings: any) => void;
  onUpdateBrandingSettings: (settings: any) => void;
}

export function SystemConfigPage({ 
  systemSettings, 
  brandingSettings, 
  onUpdateSystemSettings, 
  onUpdateBrandingSettings 
}: SystemConfigPageProps) {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [settings, setSettings] = useState(systemSettings);
  const [branding, setBranding] = useState(brandingSettings);
  const [activeSection, setActiveSection] = useState('general');

  const handleSettingChange = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleBrandingChange = (key: string, value: any) => {
    setBranding({ ...branding, [key]: value });
  };

  const handleSave = () => {
    onUpdateSystemSettings(settings);
    onUpdateBrandingSettings(branding);
    alert('Settings saved successfully!');
  };

  const sections = [
    { id: 'general', label: 'General Settings', icon: Settings },
    { id: 'security', label: 'Security Policies', icon: Shield },
    { id: 'branding', label: 'Branding & Domain', icon: Palette },
    { id: 'session', label: 'Session Management', icon: Clock },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            System Configuration
          </h1>
          <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Configure system settings, security policies, and branding
          </p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className={`rounded-xl border p-4 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  activeSection === section.id
                    ? isDark
                      ? 'bg-cyan-900/50 text-cyan-300'
                      : 'bg-cyan-50 text-cyan-700'
                    : isDark
                      ? 'hover:bg-gray-700 text-gray-300'
                      : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <section.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{section.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className={`lg:col-span-3 rounded-xl border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          {activeSection === 'general' && (
            <div className="space-y-6">
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>General Settings</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Maintenance Mode</p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Temporarily disable access to the platform
                    </p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('maintenanceMode', !settings.maintenanceMode)}
                    className={`p-1 rounded-lg ${settings.maintenanceMode ? 'text-cyan-500' : 'text-gray-400'}`}
                  >
                    {settings.maintenanceMode ? <ToggleRight className="w-10 h-6" /> : <ToggleLeft className="w-10 h-6" />}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Debug Mode</p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Enable detailed error logging
                    </p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('debugMode', !settings.debugMode)}
                    className={`p-1 rounded-lg ${settings.debugMode ? 'text-cyan-500' : 'text-gray-400'}`}
                  >
                    {settings.debugMode ? <ToggleRight className="w-10 h-6" /> : <ToggleLeft className="w-10 h-6" />}
                  </button>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Rate Limit (requests per minute)
                  </label>
                  <input
                    type="number"
                    value={settings.rateLimitPerMinute}
                    onChange={(e) => handleSettingChange('rateLimitPerMinute', parseInt(e.target.value))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Max File Upload Size (MB)
                  </label>
                  <input
                    type="number"
                    value={settings.maxFileUploadSize}
                    onChange={(e) => handleSettingChange('maxFileUploadSize', parseInt(e.target.value))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="space-y-6">
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Security Policies</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Two-Factor Authentication</p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Require 2FA for all users
                    </p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('twoFactorEnabled', !settings.twoFactorEnabled)}
                    className={`p-1 rounded-lg ${settings.twoFactorEnabled ? 'text-cyan-500' : 'text-gray-400'}`}
                  >
                    {settings.twoFactorEnabled ? <ToggleRight className="w-10 h-6" /> : <ToggleLeft className="w-10 h-6" />}
                  </button>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Max Login Attempts
                  </label>
                  <input
                    type="number"
                    value={settings.maxLoginAttempts}
                    onChange={(e) => handleSettingChange('maxLoginAttempts', parseInt(e.target.value))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Password Expiry (days)
                  </label>
                  <input
                    type="number"
                    value={settings.passwordExpiry}
                    onChange={(e) => handleSettingChange('passwordExpiry', parseInt(e.target.value))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'branding' && (
            <div className="space-y-6">
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Branding & Domain</h2>
              
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={branding.companyName}
                    onChange={(e) => handleBrandingChange('companyName', e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Support Email
                  </label>
                  <input
                    type="email"
                    value={branding.supportEmail}
                    onChange={(e) => handleBrandingChange('supportEmail', e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Primary Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={branding.primaryColor}
                        onChange={(e) => handleBrandingChange('primaryColor', e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={branding.primaryColor}
                        onChange={(e) => handleBrandingChange('primaryColor', e.target.value)}
                        className={`flex-1 px-3 py-2 rounded-lg border ${
                          isDark 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Secondary Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={branding.secondaryColor}
                        onChange={(e) => handleBrandingChange('secondaryColor', e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={branding.secondaryColor}
                        onChange={(e) => handleBrandingChange('secondaryColor', e.target.value)}
                        className={`flex-1 px-3 py-2 rounded-lg border ${
                          isDark 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'session' && (
            <div className="space-y-6">
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Session Management</h2>
              
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Session Timeout (minutes)
                  </label>
                  <input
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Users will be logged out after this period of inactivity
                  </p>
                </div>

                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <h3 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Active Sessions Overview
                  </h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className={`text-2xl font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>2,847</p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Active Now</p>
                    </div>
                    <div>
                      <p className={`text-2xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>12,450</p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Today</p>
                    </div>
                    <div>
                      <p className={`text-2xl font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>45,200</p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>This Week</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SystemConfigPage;

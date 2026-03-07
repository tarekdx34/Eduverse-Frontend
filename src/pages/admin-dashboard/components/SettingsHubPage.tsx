import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { CleanSelect } from '../../../components/shared';

import {
  Settings,
  Shield,
  Plug,
  Briefcase,
  Server,
  Globe,
  Lock,
  Mail,
  MessageSquare,
  Bell,
  CreditCard,
  Video,
  Code,
  Bug,
  Save,
  RotateCcw,
  Key,
  Clock,
  Webhook,
} from 'lucide-react';

type SectionKey = 'general' | 'security' | 'integrations' | 'business' | 'system';

const SECTIONS: { key: SectionKey; label: string; icon: React.ElementType }[] = [
  { key: 'general', label: 'General', icon: Settings },
  { key: 'security', label: 'Security', icon: Shield },
  { key: 'integrations', label: 'Integrations', icon: Plug },
  { key: 'business', label: 'Business', icon: Briefcase },
  { key: 'system', label: 'System', icon: Server },
];

interface SettingsState {
  // General - Semester
  currentSemester: string;
  semesterStart: string;
  semesterEnd: string;
  // General - Registration
  openRegistration: boolean;
  registrationDeadline: string;
  maxCredits: number;
  // General - Branding
  institutionName: string;
  primaryColor: string;
  logoUrl: string;
  // General - Language
  defaultLanguage: string;
  allowLanguageOverride: boolean;

  // Security - Password
  minPasswordLength: number;
  requireUppercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  passwordExpiry: number;
  // Security - 2FA
  require2FAAdmins: boolean;
  require2FAAll: boolean;
  twoFAMethod: string;
  // Security - Session
  sessionTimeout: number;
  maxConcurrentSessions: number;
  autoLockIdle: boolean;

  // Integrations - Email
  smtpServer: string;
  smtpPort: number;
  senderEmail: string;
  // Integrations - SMS
  smsProvider: string;
  smsApiKey: string;
  smsEnabled: boolean;
  // Integrations - Push
  firebaseEnabled: boolean;
  firebaseServerKey: string;
  // Integrations - Webhooks
  webhooks: { name: string; url: string; active: boolean }[];

  // Business - Payment
  stripeEnabled: boolean;
  stripeApiKey: string;
  paypalEnabled: boolean;
  currency: string;
  // Business - Video
  videoProvider: string;
  videoApiKey: string;
  autoCreateMeetings: boolean;

  // System - API
  rateLimit: number;
  apiVersion: string;
  enableApiDocs: boolean;
  // System - Developer
  debugMode: boolean;
  verboseLogging: boolean;
  betaFeatures: boolean;
  newDashboard: boolean;
  aiGrading: boolean;
  // System - Logs
  logLevel: string;
  logRetention: string;
  // System - Updates
  currentVersion: string;
  latestVersion: string;
  autoUpdate: boolean;
}

const DEFAULT_SETTINGS: SettingsState = {
  currentSemester: 'Fall 2024',
  semesterStart: '2024-09-01',
  semesterEnd: '2024-12-20',
  openRegistration: true,
  registrationDeadline: '2024-08-25',
  maxCredits: 21,
  institutionName: 'EduVerse University',
  primaryColor: '#3b82f6',
  logoUrl: '',
  defaultLanguage: 'English',
  allowLanguageOverride: true,

  minPasswordLength: 8,
  requireUppercase: true,
  requireNumbers: true,
  requireSpecialChars: false,
  passwordExpiry: 90,
  require2FAAdmins: true,
  require2FAAll: false,
  twoFAMethod: 'App',
  sessionTimeout: 30,
  maxConcurrentSessions: 3,
  autoLockIdle: true,

  smtpServer: 'smtp.university.edu',
  smtpPort: 587,
  senderEmail: 'noreply@university.edu',
  smsProvider: 'Twilio',
  smsApiKey: '••••••••••••••••',
  smsEnabled: false,
  firebaseEnabled: true,
  firebaseServerKey: '••••••••••••••••',
  webhooks: [
    { name: 'Grade Updates', url: 'https://api.example.com/grades', active: true },
    { name: 'Enrollment', url: 'https://api.example.com/enroll', active: false },
  ],

  stripeEnabled: true,
  stripeApiKey: '••••••••••••••••',
  paypalEnabled: false,
  currency: 'USD',
  videoProvider: 'Zoom',
  videoApiKey: '••••••••••••••••',
  autoCreateMeetings: true,

  rateLimit: 1000,
  apiVersion: 'v2.1',
  enableApiDocs: true,
  debugMode: false,
  verboseLogging: false,
  betaFeatures: false,
  newDashboard: true,
  aiGrading: true,
  logLevel: 'Info',
  logRetention: '30',
  currentVersion: '3.2.1',
  latestVersion: '3.3.0',
  autoUpdate: false,
};

export function SettingsHubPage() {
  const { isDark, primaryHex } = useTheme() as any;
  const accentColor = primaryHex || '#3b82f6';
  const { isRTL } = useLanguage();
  const [activeSection, setActiveSection] = useState<SectionKey>('general');
  const [settings, setSettings] = useState<SettingsState>({ ...DEFAULT_SETTINGS });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const changed = JSON.stringify(settings) !== JSON.stringify(DEFAULT_SETTINGS);
    setHasChanges(changed);
  }, [settings]);

  const update = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => setHasChanges(false);
  const handleDiscard = () => {
    setSettings({ ...DEFAULT_SETTINGS });
    setHasChanges(false);
  };

  // Reusable UI helpers
  const cardClass = `rounded-xl border shadow-sm p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`;
  const headingClass = `text-sm font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`;
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const subTextClass = isDark ? 'text-gray-400' : 'text-gray-500';
  const inputClass = `w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 ${
    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
  }`;
  const inputStyle = { '--tw-ring-color': `${accentColor}80` } as React.CSSProperties;
  const selectClass = inputClass;

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
      style={{ backgroundColor: checked ? accentColor : isDark ? '#4b5563' : '#d1d5db' }}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked
            ? isRTL
              ? 'translate-x-1.5'
              : 'translate-x-6'
            : isRTL
              ? 'translate-x-6'
              : 'translate-x-1'
        }`}
      />
    </button>
  );

  const SettingRow = ({
    label,
    description,
    children,
  }: {
    label: string;
    description?: string;
    children: React.ReactNode;
  }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3">
      <div className="flex-1">
        <p className={`text-sm font-medium ${textClass}`}>{label}</p>
        {description && <p className={`text-xs ${subTextClass}`}>{description}</p>}
      </div>
      <div className="sm:w-64 flex-shrink-0">{children}</div>
    </div>
  );

  // ─── Section renderers ────────────────────────────────────
  const renderGeneral = () => (
    <div className="space-y-6">
      {/* Semester */}
      <div className={cardClass}>
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5" style={{ color: accentColor }} />
          <h3 className={headingClass}>Semester Settings</h3>
        </div>
        <div className="divide-y divide-gray-700/20">
          <SettingRow label="Current Semester">
            <CleanSelect
              value={settings.currentSemester}
              onChange={(e) => update('currentSemester', e.target.value)}
              className={selectClass}
            >
              <option>Fall 2024</option>
              <option>Spring 2025</option>
              <option>Summer 2025</option>
            </CleanSelect>
          </SettingRow>
          <SettingRow label="Semester Start Date">
            <input
              type="date"
              value={settings.semesterStart}
              onChange={(e) => update('semesterStart', e.target.value)}
              className={inputClass}
            />
          </SettingRow>
          <SettingRow label="Semester End Date">
            <input
              type="date"
              value={settings.semesterEnd}
              onChange={(e) => update('semesterEnd', e.target.value)}
              className={inputClass}
            />
          </SettingRow>
        </div>
      </div>

      {/* Registration */}
      <div className={cardClass}>
        <div className="flex items-center gap-2 mb-4">
          <Key className="w-5 h-5" style={{ color: accentColor }} />
          <h3 className={headingClass}>Registration</h3>
        </div>
        <div className="divide-y divide-gray-700/20">
          <SettingRow label="Open Registration">
            <Toggle
              checked={settings.openRegistration}
              onChange={(v) => update('openRegistration', v)}
            />
          </SettingRow>
          <SettingRow label="Registration Deadline">
            <input
              type="date"
              value={settings.registrationDeadline}
              onChange={(e) => update('registrationDeadline', e.target.value)}
              className={inputClass}
            />
          </SettingRow>
          <SettingRow label="Max Credits Per Student">
            <input
              type="number"
              value={settings.maxCredits}
              onChange={(e) => update('maxCredits', Number(e.target.value))}
              className={inputClass}
            />
          </SettingRow>
        </div>
      </div>

      {/* Branding */}
      <div className={cardClass}>
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5" style={{ color: accentColor }} />
          <h3 className={headingClass}>Branding</h3>
        </div>
        <div className="divide-y divide-gray-700/20">
          <SettingRow label="Institution Name">
            <input
              type="text"
              value={settings.institutionName}
              onChange={(e) => update('institutionName', e.target.value)}
              className={inputClass}
            />
          </SettingRow>
          <SettingRow label="Primary Color">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.primaryColor}
                onChange={(e) => update('primaryColor', e.target.value)}
                className="h-9 w-9 rounded border-0 cursor-pointer"
              />
              <span className={`text-sm font-mono ${subTextClass}`}>{settings.primaryColor}</span>
            </div>
          </SettingRow>
          <SettingRow label="Logo URL">
            <input
              type="text"
              value={settings.logoUrl}
              onChange={(e) => update('logoUrl', e.target.value)}
              placeholder="https://..."
              className={inputClass}
            />
          </SettingRow>
        </div>
      </div>

      {/* Language */}
      <div className={cardClass}>
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5" style={{ color: accentColor }} />
          <h3 className={headingClass}>Language</h3>
        </div>
        <div className="divide-y divide-gray-700/20">
          <SettingRow label="Default Language">
            <CleanSelect
              value={settings.defaultLanguage}
              onChange={(e) => update('defaultLanguage', e.target.value)}
              className={selectClass}
            >
              <option>English</option>
              <option>Arabic</option>
            </CleanSelect>
          </SettingRow>
          <SettingRow label="Allow User Language Override">
            <Toggle
              checked={settings.allowLanguageOverride}
              onChange={(v) => update('allowLanguageOverride', v)}
            />
          </SettingRow>
        </div>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6">
      {/* Password Policy */}
      <div className={cardClass}>
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-5 h-5" style={{ color: accentColor }} />
          <h3 className={headingClass}>Password Policy</h3>
        </div>
        <div className="divide-y divide-gray-700/20">
          <SettingRow label="Minimum Length">
            <input
              type="number"
              value={settings.minPasswordLength}
              onChange={(e) => update('minPasswordLength', Number(e.target.value))}
              className={inputClass}
            />
          </SettingRow>
          <SettingRow label="Require Uppercase">
            <Toggle
              checked={settings.requireUppercase}
              onChange={(v) => update('requireUppercase', v)}
            />
          </SettingRow>
          <SettingRow label="Require Numbers">
            <Toggle
              checked={settings.requireNumbers}
              onChange={(v) => update('requireNumbers', v)}
            />
          </SettingRow>
          <SettingRow label="Require Special Characters">
            <Toggle
              checked={settings.requireSpecialChars}
              onChange={(v) => update('requireSpecialChars', v)}
            />
          </SettingRow>
          <SettingRow label="Password Expiry (days)">
            <input
              type="number"
              value={settings.passwordExpiry}
              onChange={(e) => update('passwordExpiry', Number(e.target.value))}
              className={inputClass}
            />
          </SettingRow>
        </div>
      </div>

      {/* 2FA */}
      <div className={cardClass}>
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5" style={{ color: accentColor }} />
          <h3 className={headingClass}>Two-Factor Authentication</h3>
        </div>
        <div className="divide-y divide-gray-700/20">
          <SettingRow label="Require 2FA for Admins">
            <Toggle
              checked={settings.require2FAAdmins}
              onChange={(v) => update('require2FAAdmins', v)}
            />
          </SettingRow>
          <SettingRow label="Require 2FA for All Users">
            <Toggle checked={settings.require2FAAll} onChange={(v) => update('require2FAAll', v)} />
          </SettingRow>
          <SettingRow label="2FA Method">
            <CleanSelect
              value={settings.twoFAMethod}
              onChange={(e) => update('twoFAMethod', e.target.value)}
              className={selectClass}
            >
              <option>App</option>
              <option>SMS</option>
              <option>Email</option>
            </CleanSelect>
          </SettingRow>
        </div>
      </div>

      {/* Session Security */}
      <div className={cardClass}>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5" style={{ color: accentColor }} />
          <h3 className={headingClass}>Session Security</h3>
        </div>
        <div className="divide-y divide-gray-700/20">
          <SettingRow label="Session Timeout (minutes)">
            <input
              type="number"
              value={settings.sessionTimeout}
              onChange={(e) => update('sessionTimeout', Number(e.target.value))}
              className={inputClass}
            />
          </SettingRow>
          <SettingRow label="Max Concurrent Sessions">
            <input
              type="number"
              value={settings.maxConcurrentSessions}
              onChange={(e) => update('maxConcurrentSessions', Number(e.target.value))}
              className={inputClass}
            />
          </SettingRow>
          <SettingRow label="Auto-Lock on Idle">
            <Toggle checked={settings.autoLockIdle} onChange={(v) => update('autoLockIdle', v)} />
          </SettingRow>
        </div>
      </div>

      {/* Blocked Users */}
      <div className={cardClass}>
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-5 h-5" style={{ color: accentColor }} />
          <h3 className={headingClass}>Blocked Users</h3>
        </div>
        <div className="flex items-center justify-between">
          <p className={`text-sm ${textClass}`}>
            <span className="font-semibold" style={{ color: accentColor }}>
              5
            </span>{' '}
            users currently blocked
          </p>
          <button
            className="px-4 py-2 text-sm font-medium rounded-lg text-white hover:opacity-90 transition-colors"
            style={{ backgroundColor: accentColor }}
          >
            Manage Blocked Users
          </button>
        </div>
      </div>
    </div>
  );

  const renderIntegrations = () => (
    <div className="space-y-6">
      {/* Email */}
      <div className={cardClass}>
        <div className="flex items-center gap-2 mb-4">
          <Mail className="w-5 h-5" style={{ color: accentColor }} />
          <h3 className={headingClass}>Email</h3>
        </div>
        <div className="divide-y divide-gray-700/20">
          <SettingRow label="SMTP Server">
            <input
              type="text"
              value={settings.smtpServer}
              onChange={(e) => update('smtpServer', e.target.value)}
              className={inputClass}
            />
          </SettingRow>
          <SettingRow label="Port">
            <input
              type="number"
              value={settings.smtpPort}
              onChange={(e) => update('smtpPort', Number(e.target.value))}
              className={inputClass}
            />
          </SettingRow>
          <SettingRow label="Sender Email">
            <input
              type="text"
              value={settings.senderEmail}
              onChange={(e) => update('senderEmail', e.target.value)}
              className={inputClass}
            />
          </SettingRow>
        </div>
        <div className="mt-4">
          <button
            className="px-4 py-2 text-sm font-medium rounded-lg text-white hover:opacity-90 transition-colors"
            style={{ backgroundColor: accentColor }}
          >
            Test Connection
          </button>
        </div>
      </div>

      {/* SMS */}
      <div className={cardClass}>
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5" style={{ color: accentColor }} />
          <h3 className={headingClass}>SMS</h3>
        </div>
        <div className="divide-y divide-gray-700/20">
          <SettingRow label="Provider">
            <CleanSelect
              value={settings.smsProvider}
              onChange={(e) => update('smsProvider', e.target.value)}
              className={selectClass}
            >
              <option>Twilio</option>
              <option>Vonage</option>
            </CleanSelect>
          </SettingRow>
          <SettingRow label="API Key">
            <input
              type="password"
              value={settings.smsApiKey}
              onChange={(e) => update('smsApiKey', e.target.value)}
              className={inputClass}
            />
          </SettingRow>
          <SettingRow label="Enabled">
            <Toggle checked={settings.smsEnabled} onChange={(v) => update('smsEnabled', v)} />
          </SettingRow>
        </div>
      </div>

      {/* Push Notifications */}
      <div className={cardClass}>
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5" style={{ color: accentColor }} />
          <h3 className={headingClass}>Push Notifications</h3>
        </div>
        <div className="divide-y divide-gray-700/20">
          <SettingRow label="Firebase Enabled">
            <Toggle
              checked={settings.firebaseEnabled}
              onChange={(v) => update('firebaseEnabled', v)}
            />
          </SettingRow>
          <SettingRow label="Server Key">
            <input
              type="password"
              value={settings.firebaseServerKey}
              onChange={(e) => update('firebaseServerKey', e.target.value)}
              className={inputClass}
            />
          </SettingRow>
        </div>
      </div>

      {/* Webhooks */}
      <div className={cardClass}>
        <div className="flex items-center gap-2 mb-4">
          <Webhook className="w-5 h-5" style={{ color: accentColor }} />
          <h3 className={headingClass}>Webhooks</h3>
        </div>
        <div className="space-y-3">
          {settings.webhooks.map((wh, i) => (
            <div
              key={i}
              className={`flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}
            >
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${textClass}`}>{wh.name}</p>
                <p className={`text-xs truncate ${subTextClass}`}>{wh.url}</p>
              </div>
              <Toggle
                checked={wh.active}
                onChange={(v) => {
                  const updated = [...settings.webhooks];
                  updated[i] = { ...updated[i], active: v };
                  update('webhooks', updated);
                }}
              />
            </div>
          ))}
        </div>
        <div className="mt-4">
          <button
            onClick={() =>
              update('webhooks', [
                ...settings.webhooks,
                { name: 'New Webhook', url: '', active: false },
              ])
            }
            className="px-4 py-2 text-sm font-medium rounded-lg text-white hover:opacity-90 transition-colors"
            style={{ backgroundColor: accentColor }}
          >
            Add Webhook
          </button>
        </div>
      </div>
    </div>
  );

  const renderBusiness = () => (
    <div className="space-y-6">
      {/* Payment Gateways */}
      <div className={cardClass}>
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5" style={{ color: accentColor }} />
          <h3 className={headingClass}>Payment Gateways</h3>
        </div>
        <div className="divide-y divide-gray-700/20">
          <SettingRow label="Stripe Enabled">
            <Toggle checked={settings.stripeEnabled} onChange={(v) => update('stripeEnabled', v)} />
          </SettingRow>
          <SettingRow label="Stripe API Key">
            <input
              type="password"
              value={settings.stripeApiKey}
              onChange={(e) => update('stripeApiKey', e.target.value)}
              className={inputClass}
            />
          </SettingRow>
          <SettingRow label="PayPal Enabled">
            <Toggle checked={settings.paypalEnabled} onChange={(v) => update('paypalEnabled', v)} />
          </SettingRow>
          <SettingRow label="Currency">
            <CleanSelect
              value={settings.currency}
              onChange={(e) => update('currency', e.target.value)}
              className={selectClass}
            >
              <option>USD</option>
              <option>EUR</option>
              <option>GBP</option>
            </CleanSelect>
          </SettingRow>
        </div>
      </div>

      {/* Video Conferencing */}
      <div className={cardClass}>
        <div className="flex items-center gap-2 mb-4">
          <Video className="w-5 h-5" style={{ color: accentColor }} />
          <h3 className={headingClass}>Video Conferencing</h3>
        </div>
        <div className="divide-y divide-gray-700/20">
          <SettingRow label="Provider">
            <CleanSelect
              value={settings.videoProvider}
              onChange={(e) => update('videoProvider', e.target.value)}
              className={selectClass}
            >
              <option>Zoom</option>
              <option>Teams</option>
              <option>Meet</option>
            </CleanSelect>
          </SettingRow>
          <SettingRow label="API Key">
            <input
              type="password"
              value={settings.videoApiKey}
              onChange={(e) => update('videoApiKey', e.target.value)}
              className={inputClass}
            />
          </SettingRow>
          <SettingRow label="Auto-Create Meetings">
            <Toggle
              checked={settings.autoCreateMeetings}
              onChange={(v) => update('autoCreateMeetings', v)}
            />
          </SettingRow>
        </div>
      </div>
    </div>
  );

  const renderSystem = () => (
    <div className="space-y-6">
      {/* API Settings */}
      <div className={cardClass}>
        <div className="flex items-center gap-2 mb-4">
          <Code className="w-5 h-5" style={{ color: accentColor }} />
          <h3 className={headingClass}>API Settings</h3>
        </div>
        <div className="divide-y divide-gray-700/20">
          <SettingRow label="Rate Limit (per hour)">
            <input
              type="number"
              value={settings.rateLimit}
              onChange={(e) => update('rateLimit', Number(e.target.value))}
              className={inputClass}
            />
          </SettingRow>
          <SettingRow label="API Version">
            <input
              type="text"
              value={settings.apiVersion}
              onChange={(e) => update('apiVersion', e.target.value)}
              className={inputClass}
            />
          </SettingRow>
          <SettingRow label="Enable API Docs">
            <Toggle checked={settings.enableApiDocs} onChange={(v) => update('enableApiDocs', v)} />
          </SettingRow>
        </div>
      </div>

      {/* Developer Options */}
      <div className={cardClass}>
        <div className="flex items-center gap-2 mb-4">
          <Bug className="w-5 h-5" style={{ color: accentColor }} />
          <h3 className={headingClass}>Developer Options</h3>
        </div>
        <div className="divide-y divide-gray-700/20">
          <SettingRow
            label="Debug Mode"
            description="⚠️ Enabling debug mode may expose sensitive data"
          >
            <Toggle checked={settings.debugMode} onChange={(v) => update('debugMode', v)} />
          </SettingRow>
          <SettingRow label="Verbose Logging">
            <Toggle
              checked={settings.verboseLogging}
              onChange={(v) => update('verboseLogging', v)}
            />
          </SettingRow>
        </div>
        <div className="mt-4">
          <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${subTextClass}`}>
            Feature Flags
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className={`text-sm ${textClass}`}>Beta Features</span>
              <Toggle checked={settings.betaFeatures} onChange={(v) => update('betaFeatures', v)} />
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-sm ${textClass}`}>New Dashboard</span>
              <Toggle checked={settings.newDashboard} onChange={(v) => update('newDashboard', v)} />
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-sm ${textClass}`}>AI Grading</span>
              <Toggle checked={settings.aiGrading} onChange={(v) => update('aiGrading', v)} />
            </div>
          </div>
        </div>
      </div>

      {/* System Logs */}
      <div className={cardClass}>
        <div className="flex items-center gap-2 mb-4">
          <Server className="w-5 h-5" style={{ color: accentColor }} />
          <h3 className={headingClass}>System Logs</h3>
        </div>
        <div className="divide-y divide-gray-700/20">
          <SettingRow label="Log Level">
            <CleanSelect
              value={settings.logLevel}
              onChange={(e) => update('logLevel', e.target.value)}
              className={selectClass}
            >
              <option>Info</option>
              <option>Warning</option>
              <option>Error</option>
            </CleanSelect>
          </SettingRow>
          <SettingRow label="Retention (days)">
            <CleanSelect
              value={settings.logRetention}
              onChange={(e) => update('logRetention', e.target.value)}
              className={selectClass}
            >
              <option value="30">30</option>
              <option value="60">60</option>
              <option value="90">90</option>
            </CleanSelect>
          </SettingRow>
        </div>
        <div className="mt-4">
          <button
            className="px-4 py-2 text-sm font-medium rounded-lg text-white hover:opacity-90 transition-colors"
            style={{ backgroundColor: accentColor }}
          >
            View Logs
          </button>
        </div>
      </div>

      {/* Updates */}
      <div className={cardClass}>
        <div className="flex items-center gap-2 mb-4">
          <RotateCcw className="w-5 h-5" style={{ color: accentColor }} />
          <h3 className={headingClass}>Updates</h3>
        </div>
        <div className="divide-y divide-gray-700/20">
          <SettingRow label="Current Version">
            <span className={`text-sm font-mono ${textClass}`}>{settings.currentVersion}</span>
          </SettingRow>
          <SettingRow label="Latest Version">
            <span className={`text-sm font-mono`} style={{ color: accentColor }}>
              {settings.latestVersion}
            </span>
          </SettingRow>
          <SettingRow label="Auto-Update">
            <Toggle checked={settings.autoUpdate} onChange={(v) => update('autoUpdate', v)} />
          </SettingRow>
        </div>
        <div className="mt-4">
          <button
            className="px-4 py-2 text-sm font-medium rounded-lg text-white hover:opacity-90 transition-colors"
            style={{ backgroundColor: accentColor }}
          >
            Check for Updates
          </button>
        </div>
      </div>
    </div>
  );

  const sectionRenderers: Record<SectionKey, () => React.ReactNode> = {
    general: renderGeneral,
    security: renderSecurity,
    integrations: renderIntegrations,
    business: renderBusiness,
    system: renderSystem,
  };

  return (
    <div
      className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} ${isRTL ? 'rtl' : 'ltr'}`}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-2xl font-bold ${textClass}`}>Settings</h1>
          <p className={`text-sm mt-1 ${subTextClass}`}>Configure system preferences</p>
        </div>

        {/* Section Tabs */}
        <div
          className={`flex gap-1 overflow-x-auto mb-8 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
        >
          {SECTIONS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveSection(key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeSection === key
                  ? 'border-current'
                  : `border-transparent ${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
              }`}
              style={
                activeSection === key ? { color: accentColor, borderColor: accentColor } : undefined
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Active Section Content */}
        {sectionRenderers[activeSection]()}
      </div>

      {/* Save Bar */}
      {hasChanges && (
        <div
          className={`fixed bottom-0 inset-x-0 z-50 border-t ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg`}
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <p className={`text-sm font-medium ${subTextClass}`}>Unsaved changes</p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDiscard}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  isDark
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
                Discard
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-white hover:opacity-90 transition-colors"
                style={{ backgroundColor: accentColor }}
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

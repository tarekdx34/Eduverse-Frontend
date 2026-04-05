import React, { useState } from 'react';
import {
  User,
  Lock,
  Bell,
  Globe,
  GraduationCap,
  Brain,
  Shield,
  AlertTriangle,
  Camera,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { CleanSelect } from '../../../components/shared';

export function SettingsPage() {
  const { t, isRTL } = useLanguage();
  const { isDark, primaryHex = '#3b82f6' } = useTheme() as any;
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [notifications, setNotifications] = useState({
    newAssignments: true,
    lateSubmissions: true,
    newMessages: true,
    courseChatMentions: false,
    aiAssistantAlerts: true,
  });
  const [teachingPreferences, setTeachingPreferences] = useState({
    showStudentAnalytics: true,
    enableAutoGrading: true,
    enableSmartAttendance: false,
    showStudentsAtRisk: true,
  });
  const [privacy, setPrivacy] = useState({
    allowTAsAccess: true,
    allowAutoAnnouncements: false,
    hideEmailFromStudents: false,
  });
  const [aiDifficulty, setAiDifficulty] = useState('medium');

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('profileSettings')}
          </h1>
          <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('profileSettingsDescription')}
          </p>
        </div>

        {/* Profile Information */}
        <div
          className={`rounded-xl p-6 border shadow-sm ${isDark ? 'bg-gray-800/50 border-white/10' : 'bg-white border-gray-200'}`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
              <User className="text-blue-600" size={20} />
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('profileInformation')}
              </h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('updateProfileDescription')}
              </p>
            </div>
          </div>

          {/* Profile Photo */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                style={{ backgroundColor: primaryHex }}
              >
                SM
              </div>
              <button
                className={`absolute bottom-0 right-0 p-1.5 rounded-full border-2 shadow-lg transition-colors ${isDark ? 'bg-gray-700 border-gray-700 hover:bg-gray-600' : 'bg-white border-white hover:bg-gray-50'}`}
              >
                <Camera size={14} className={isDark ? 'text-gray-300' : 'text-gray-600'} />
              </button>
            </div>
            <div>
              <button
                className="px-4 py-2 text-sm rounded-lg transition-colors border"
                style={{ color: primaryHex, borderColor: primaryHex + '40' }}
              >
                {t('changePhoto')}
              </button>
              <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                JPG, PNG or GIF. Max size 2MB
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
              >
                {t('fullName')}
              </label>
              <input
                type="text"
                defaultValue="Sarah Martinez"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              />
            </div>
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
              >
                {t('academicTitle')}
              </label>
              <input
                type="text"
                defaultValue="Assistant Professor"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              />
            </div>
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
              >
                {t('email')}
              </label>
              <input
                type="email"
                defaultValue="sarah.martinez@university.edu"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              />
            </div>
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
              >
                {t('phoneNumber')}
              </label>
              <input
                type="tel"
                defaultValue="+1 (555) 123-4567"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              />
            </div>
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
              >
                {t('department')}
              </label>
              <input
                type="text"
                defaultValue="Mathematics"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              />
            </div>
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
              >
                {t('officeLocationLabel')}
              </label>
              <input
                type="text"
                defaultValue="Building A, Room 304"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              />
            </div>
          </div>

          <div className="mb-6">
            <label
              className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
            >
              {t('bioDescription')}
            </label>
            <textarea
              rows={4}
              placeholder={t('bioPlaceholder')}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
            />
          </div>

          <div className="flex justify-end">
            <button
              className="px-6 py-2 text-white rounded-lg transition-colors"
              style={{ backgroundColor: primaryHex }}
            >
              {t('saveChanges')}
            </button>
          </div>
        </div>

        {/* Account Settings */}
        <div
          className={`rounded-xl p-6 border shadow-sm ${isDark ? 'bg-gray-800/50 border-white/10' : 'bg-white border-gray-200'}`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-indigo-900/30' : 'bg-indigo-100'}`}>
              <Lock className="text-indigo-600" size={20} />
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('accountSettings')}
              </h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('accountSettingsDescription')}
              </p>
            </div>
          </div>

          {/* Password & Security */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Lock size={18} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('passwordSecurity')}
              </h3>
            </div>

            <button
              className={`w-full flex items-center justify-between px-4 py-3 border rounded-lg transition-colors mb-3 ${isDark ? 'border-white/10 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'}`}
            >
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('changePassword')}
              </span>
              <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>›</span>
            </button>

            <div
              className={`flex items-center justify-between px-4 py-3 border rounded-lg ${isDark ? 'border-white/10' : 'border-gray-200'}`}
            >
              <div>
                <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('twoFactorAuth')}
                </div>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('twoFactorDescription')}
                </div>
              </div>
              <button
                onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  twoFactorEnabled ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div
              className={`mt-3 px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}
            >
              <div className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('loginActivity')}
              </div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Last login: May 10, 2025 at 9:14 AM
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Bell size={18} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('notificationPreferences')}
              </h3>
            </div>

            <div className="space-y-3">
              {Object.entries({
                newAssignments: t('newAssignmentSubmissions'),
                lateSubmissions: t('lateSubmissions'),
                newMessages: t('newMessages'),
                courseChatMentions: t('courseChatMentions'),
                aiAssistantAlerts: t('aiAssistantAlerts'),
              }).map(([key, label]) => (
                <div
                  key={key}
                  className={`flex items-center justify-between px-4 py-2 border rounded-lg ${isDark ? 'border-white/10' : 'border-gray-200'}`}
                >
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {label}
                  </span>
                  <button
                    onClick={() =>
                      setNotifications({
                        ...notifications,
                        [key]: !notifications[key as keyof typeof notifications],
                      })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications[key as keyof typeof notifications]
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications[key as keyof typeof notifications]
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Language Preference */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Globe size={18} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('languagePreference')}
              </h3>
            </div>
            <CleanSelect
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
            >
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
              <option>Arabic</option>
            </CleanSelect>
          </div>
        </div>

        {/* Teaching Preferences */}
        <div
          className={`rounded-xl p-6 border shadow-sm ${isDark ? 'bg-gray-800/50 border-white/10' : 'bg-white border-gray-200'}`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-green-900/30' : 'bg-green-100'}`}>
              <GraduationCap className="text-green-600" size={20} />
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('teachingPreferences')}
              </h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('teachingPreferencesDescription')}
              </p>
            </div>
          </div>

          {/* Classroom Preferences */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap size={18} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('classroomPreferences')}
              </h3>
            </div>

            <div className="space-y-3">
              {Object.entries({
                showStudentAnalytics: t('showStudentAnalyticsLabel'),
                enableAutoGrading: t('enableAutoGradingLabel'),
                enableSmartAttendance: t('enableSmartAttendanceLabel'),
                showStudentsAtRisk: t('showStudentsAtRiskLabel'),
              }).map(([key, label]) => (
                <div
                  key={key}
                  className={`flex items-center justify-between px-4 py-2 border rounded-lg ${isDark ? 'border-white/10' : 'border-gray-200'}`}
                >
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {label}
                  </span>
                  <button
                    onClick={() =>
                      setTeachingPreferences({
                        ...teachingPreferences,
                        [key]: !teachingPreferences[key as keyof typeof teachingPreferences],
                      })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      teachingPreferences[key as keyof typeof teachingPreferences]
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        teachingPreferences[key as keyof typeof teachingPreferences]
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* AI Preferences */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Brain size={18} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('aiPreferences')}
              </h3>
            </div>

            <div className="mb-4">
              <label
                className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
              >
                {t('difficultyForQuizzes')}
              </label>
              <div className="flex gap-2">
                {['easy', 'medium', 'hard'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setAiDifficulty(level)}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                      aiDifficulty === level
                        ? 'text-white'
                        : isDark
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    style={aiDifficulty === level ? { backgroundColor: primaryHex } : undefined}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label
                className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
              >
                {t('preferredExplanationStyle')}
              </label>
              <CleanSelect
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              >
                <option>{t('detailedWithExamples')}</option>
                <option>{t('conciseAndDirect')}</option>
                <option>{t('stepByStep')}</option>
              </CleanSelect>
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
              >
                {t('defaultAiTone')}
              </label>
              <CleanSelect
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              >
                <option>{t('professional')}</option>
                <option>{t('friendly')}</option>
                <option>{t('formal')}</option>
              </CleanSelect>
            </div>
          </div>
        </div>

        {/* Privacy & Sharing */}
        <div
          className={`rounded-xl p-6 border shadow-sm ${isDark ? 'bg-gray-800/50 border-white/10' : 'bg-white border-gray-200'}`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-indigo-900/30' : 'bg-indigo-100'}`}>
              <Shield className="text-indigo-600" size={20} />
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('privacySharing')}
              </h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('privacyDescription')}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {Object.entries({
              allowTAsAccess: t('allowTAsAccess'),
              allowAutoAnnouncements: t('allowAutoAnnouncements'),
              hideEmailFromStudents: t('hideEmailFromStudents'),
            }).map(([key, label]) => (
              <div
                key={key}
                className={`flex items-center justify-between px-4 py-2 border rounded-lg ${isDark ? 'border-white/10' : 'border-gray-200'}`}
              >
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {label}
                </span>
                <button
                  onClick={() =>
                    setPrivacy({ ...privacy, [key]: !privacy[key as keyof typeof privacy] })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    privacy[key as keyof typeof privacy] ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      privacy[key as keyof typeof privacy] ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div
          className={`rounded-xl p-6 border shadow-sm ${isDark ? 'bg-red-900/20 border-red-800/50' : 'bg-red-50 border-red-200'}`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-red-900/30' : 'bg-red-100'}`}>
              <AlertTriangle className="text-red-600" size={20} />
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('dangerZone')}
              </h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('dangerZoneDescription')}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div
              className={`flex items-center justify-between px-4 py-3 border rounded-lg ${isDark ? 'bg-gray-800/50 border-red-800/50' : 'bg-white border-red-200'}`}
            >
              <div>
                <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('deactivateAccount')}
                </div>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('deactivateDescription')}
                </div>
              </div>
              <button
                className={`px-4 py-2 text-sm text-red-600 border rounded-lg transition-colors ${isDark ? 'border-red-800 hover:bg-red-900/30' : 'border-red-300 hover:bg-red-50'}`}
              >
                {t('deactivate')}
              </button>
            </div>

            <div
              className={`flex items-center justify-between px-4 py-3 border rounded-lg ${isDark ? 'bg-gray-800/50 border-red-800/50' : 'bg-white border-red-200'}`}
            >
              <div>
                <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('deleteAccount')}
                </div>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('deleteAccountDescription')}
                </div>
              </div>
              <button className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                {t('delete')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;

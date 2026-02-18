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

export function SettingsPage() {
  const { t, isRTL } = useLanguage();
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('profileSettings')}</h1>
          <p className="text-gray-600 mt-1">
            {t('profileSettingsDescription')}
          </p>
        </div>

        {/* Profile Information */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="text-blue-600" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{t('profileInformation')}</h2>
              <p className="text-sm text-gray-600">
                {t('updateProfileDescription')}
              </p>
            </div>
          </div>

          {/* Profile Photo */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                SM
              </div>
              <button className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full border-2 border-white shadow-lg hover:bg-gray-50 transition-colors">
                <Camera size={14} className="text-gray-600" />
              </button>
            </div>
            <div>
              <button className="px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-indigo-200">
                {t('changePhoto')}
              </button>
              <p className="text-xs text-gray-500 mt-1">JPG, PNG or GIF. Max size 2MB</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('fullName')}</label>
              <input
                type="text"
                defaultValue="Sarah Martinez"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('academicTitle')}</label>
              <input
                type="text"
                defaultValue="Assistant Professor"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('email')}</label>
              <input
                type="email"
                defaultValue="sarah.martinez@university.edu"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('phoneNumber')}</label>
              <input
                type="tel"
                defaultValue="+1 (555) 123-4567"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('department')}</label>
              <input
                type="text"
                defaultValue="Mathematics"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('officeLocationLabel')}
              </label>
              <input
                type="text"
                defaultValue="Building A, Room 304"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('bioDescription')}
            </label>
            <textarea
              rows={4}
              placeholder={t('bioPlaceholder')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end">
            <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              {t('saveChanges')}
            </button>
          </div>
        </div>

        {/* Account Settings */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Lock className="text-purple-600" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{t('accountSettings')}</h2>
              <p className="text-sm text-gray-600">
                {t('accountSettingsDescription')}
              </p>
            </div>
          </div>

          {/* Password & Security */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Lock size={18} className="text-gray-600" />
              <h3 className="font-semibold text-gray-900">{t('passwordSecurity')}</h3>
            </div>

            <button className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors mb-3">
              <span className="text-sm text-gray-700">{t('changePassword')}</span>
              <span className="text-gray-400">›</span>
            </button>

            <div className="flex items-center justify-between px-4 py-3 border border-gray-200 rounded-lg">
              <div>
                <div className="text-sm font-medium text-gray-900">{t('twoFactorAuth')}</div>
                <div className="text-xs text-gray-600">{t('twoFactorDescription')}</div>
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

            <div className="mt-3 px-4 py-2 bg-gray-50 rounded-lg">
              <div className="text-xs font-medium text-gray-700">{t('loginActivity')}</div>
              <div className="text-xs text-gray-600">Last login: May 10, 2025 at 9:14 AM</div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Bell size={18} className="text-gray-600" />
              <h3 className="font-semibold text-gray-900">{t('notificationPreferences')}</h3>
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
                  className="flex items-center justify-between px-4 py-2 border border-gray-200 rounded-lg"
                >
                  <span className="text-sm text-gray-700">{label}</span>
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
              <Globe size={18} className="text-gray-600" />
              <h3 className="font-semibold text-gray-900">{t('languagePreference')}</h3>
            </div>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
              <option>Arabic</option>
            </select>
          </div>
        </div>

        {/* Teaching Preferences */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <GraduationCap className="text-green-600" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{t('teachingPreferences')}</h2>
              <p className="text-sm text-gray-600">{t('teachingPreferencesDescription')}</p>
            </div>
          </div>

          {/* Classroom Preferences */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap size={18} className="text-gray-600" />
              <h3 className="font-semibold text-gray-900">{t('classroomPreferences')}</h3>
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
                  className="flex items-center justify-between px-4 py-2 border border-gray-200 rounded-lg"
                >
                  <span className="text-sm text-gray-700">{label}</span>
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
              <Brain size={18} className="text-gray-600" />
              <h3 className="font-semibold text-gray-900">{t('aiPreferences')}</h3>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('difficultyForQuizzes')}
              </label>
              <div className="flex gap-2">
                {['easy', 'medium', 'hard'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setAiDifficulty(level)}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                      aiDifficulty === level
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('preferredExplanationStyle')}
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option>{t('detailedWithExamples')}</option>
                <option>{t('conciseAndDirect')}</option>
                <option>{t('stepByStep')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('defaultAiTone')}
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option>{t('professional')}</option>
                <option>{t('friendly')}</option>
                <option>{t('formal')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Privacy & Sharing */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Shield className="text-indigo-600" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{t('privacySharing')}</h2>
              <p className="text-sm text-gray-600">{t('privacyDescription')}</p>
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
                className="flex items-center justify-between px-4 py-2 border border-gray-200 rounded-lg"
              >
                <span className="text-sm text-gray-700">{label}</span>
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
        <div className="bg-red-50 rounded-xl p-6 border border-red-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="text-red-600" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{t('dangerZone')}</h2>
              <p className="text-sm text-gray-600">{t('dangerZoneDescription')}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between px-4 py-3 bg-white border border-red-200 rounded-lg">
              <div>
                <div className="text-sm font-medium text-gray-900">{t('deactivateAccount')}</div>
                <div className="text-xs text-gray-600">
                  {t('deactivateDescription')}
                </div>
              </div>
              <button className="px-4 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors">
                {t('deactivate')}
              </button>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-white border border-red-200 rounded-lg">
              <div>
                <div className="text-sm font-medium text-gray-900">{t('deleteAccount')}</div>
                <div className="text-xs text-gray-600">
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

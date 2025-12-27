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

export function SettingsPage() {
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
          <h1 className="text-3xl font-bold text-gray-900">Profile & Settings</h1>
          <p className="text-gray-600 mt-1">
            Manage your personal information, account preferences, teaching preferences, and
            security settings.
          </p>
        </div>

        {/* Profile Information */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="text-blue-600" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
              <p className="text-sm text-gray-600">
                Update your personal details and profile photo
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
                Change Photo
              </button>
              <p className="text-xs text-gray-500 mt-1">JPG, PNG or GIF. Max size 2MB</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                defaultValue="Sarah Martinez"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Academic Title</label>
              <input
                type="text"
                defaultValue="Assistant Professor"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                defaultValue="sarah.martinez@university.edu"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                defaultValue="+1 (555) 123-4567"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <input
                type="text"
                defaultValue="Mathematics"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Office Location
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
              Bio / Short Description
            </label>
            <textarea
              rows={4}
              placeholder="Tell students about yourself, your research interests, and teaching philosophy..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end">
            <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              Save Changes
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
              <h2 className="text-lg font-semibold text-gray-900">Account Settings</h2>
              <p className="text-sm text-gray-600">
                Manage security, notifications, and preferences
              </p>
            </div>
          </div>

          {/* Password & Security */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Lock size={18} className="text-gray-600" />
              <h3 className="font-semibold text-gray-900">Password & Security</h3>
            </div>

            <button className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors mb-3">
              <span className="text-sm text-gray-700">Change Password</span>
              <span className="text-gray-400">›</span>
            </button>

            <div className="flex items-center justify-between px-4 py-3 border border-gray-200 rounded-lg">
              <div>
                <div className="text-sm font-medium text-gray-900">Two-Factor Authentication</div>
                <div className="text-xs text-gray-600">Add an extra layer of security</div>
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
              <div className="text-xs font-medium text-gray-700">Login Activity</div>
              <div className="text-xs text-gray-600">Last login: May 10, 2025 at 9:14 AM</div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Bell size={18} className="text-gray-600" />
              <h3 className="font-semibold text-gray-900">Notification Preferences</h3>
            </div>

            <div className="space-y-3">
              {Object.entries({
                newAssignments: 'New Assignment Submissions',
                lateSubmissions: 'Late Submissions',
                newMessages: 'New Messages',
                courseChatMentions: 'Course Chat Mentions',
                aiAssistantAlerts: 'AI Assistant Alerts',
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
              <h3 className="font-semibold text-gray-900">Language Preference</h3>
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
              <h2 className="text-lg font-semibold text-gray-900">Teaching Preferences</h2>
              <p className="text-sm text-gray-600">Customize your teaching tools and AI settings</p>
            </div>
          </div>

          {/* Classroom Preferences */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap size={18} className="text-gray-600" />
              <h3 className="font-semibold text-gray-900">Classroom Preferences</h3>
            </div>

            <div className="space-y-3">
              {Object.entries({
                showStudentAnalytics: 'Show Student Analytics on Course Page',
                enableAutoGrading: 'Enable Auto-Grading Suggestions',
                enableSmartAttendance: 'Enable Smart Attendance Alerts',
                showStudentsAtRisk: 'Show "Students at Risk" Panel',
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
              <h3 className="font-semibold text-gray-900">AI Preferences</h3>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level for Generated Quizzes
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
                Preferred Explanation Style
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option>Detailed with Examples</option>
                <option>Concise and Direct</option>
                <option>Step-by-Step</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default AI Tone
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option>Professional</option>
                <option>Friendly</option>
                <option>Formal</option>
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
              <h2 className="text-lg font-semibold text-gray-900">Privacy & Sharing</h2>
              <p className="text-sm text-gray-600">Control who can access your information</p>
            </div>
          </div>

          <div className="space-y-3">
            {Object.entries({
              allowTAsAccess: 'Allow TAs to access analytics',
              allowAutoAnnouncements: 'Allow auto-generated announcements',
              hideEmailFromStudents: 'Hide instructor email from students',
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
              <h2 className="text-lg font-semibold text-gray-900">Danger Zone</h2>
              <p className="text-sm text-gray-600">Irreversible actions — proceed with caution</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between px-4 py-3 bg-white border border-red-200 rounded-lg">
              <div>
                <div className="text-sm font-medium text-gray-900">Deactivate Account</div>
                <div className="text-xs text-gray-600">
                  Temporarily disable your account. You can reactivate it anytime.
                </div>
              </div>
              <button className="px-4 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors">
                Deactivate
              </button>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-white border border-red-200 rounded-lg">
              <div>
                <div className="text-sm font-medium text-gray-900">Delete Account</div>
                <div className="text-xs text-gray-600">
                  Permanently delete your account and all associated data. This cannot be undone.
                </div>
              </div>
              <button className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;

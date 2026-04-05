import React, { useState, useCallback } from 'react';
import {
  Shield,
  Users,
  BookOpen,
  Beaker,
  FileText,
  GraduationCap,
  MessageSquare,
  Brain,
  Settings,
  Plus,
  Save,
  RotateCcw,
  Check,
  X,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { CleanSelect } from '../../../components/shared';

type RoleId = 'student' | 'instructor' | 'ta' | 'admin' | 'custom';
type Permission = 'view' | 'create' | 'edit' | 'delete';

interface RoleInfo {
  id: RoleId;
  name: string;
  count: number;
  color: string;
  borderColor: string;
  bgColor: string;
  description: string;
}

interface PermissionRow {
  module: string;
  icon: React.ReactNode;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

const modules = [
  'Courses',
  'Labs',
  'Assignments',
  'Grades',
  'Discussion',
  'AI Assistant',
  'Users',
  'System',
] as const;

const moduleIcons: Record<string, React.ReactNode> = {
  Courses: <BookOpen size={16} />,
  Labs: <Beaker size={16} />,
  Assignments: <FileText size={16} />,
  Grades: <GraduationCap size={16} />,
  Discussion: <MessageSquare size={16} />,
  'AI Assistant': <Brain size={16} />,
  Users: <Users size={16} />,
  System: <Settings size={16} />,
};

const defaultPermissions: Record<RoleId, Record<string, Record<Permission, boolean>>> = {
  student: {
    Courses: { view: true, create: false, edit: false, delete: false },
    Labs: { view: true, create: false, edit: false, delete: false },
    Assignments: { view: true, create: false, edit: false, delete: false },
    Grades: { view: true, create: false, edit: false, delete: false },
    Discussion: { view: true, create: true, edit: true, delete: true },
    'AI Assistant': { view: true, create: false, edit: false, delete: false },
    Users: { view: false, create: false, edit: false, delete: false },
    System: { view: false, create: false, edit: false, delete: false },
  },
  instructor: {
    Courses: { view: true, create: true, edit: true, delete: false },
    Labs: { view: true, create: true, edit: true, delete: false },
    Assignments: { view: true, create: true, edit: true, delete: false },
    Grades: { view: true, create: true, edit: true, delete: false },
    Discussion: { view: true, create: true, edit: true, delete: false },
    'AI Assistant': { view: true, create: false, edit: false, delete: false },
    Users: { view: false, create: false, edit: false, delete: false },
    System: { view: false, create: false, edit: false, delete: false },
  },
  ta: {
    Courses: { view: true, create: false, edit: false, delete: false },
    Labs: { view: true, create: true, edit: true, delete: false },
    Assignments: { view: true, create: true, edit: true, delete: false },
    Grades: { view: true, create: true, edit: true, delete: false },
    Discussion: { view: true, create: true, edit: true, delete: false },
    'AI Assistant': { view: true, create: false, edit: false, delete: false },
    Users: { view: false, create: false, edit: false, delete: false },
    System: { view: false, create: false, edit: false, delete: false },
  },
  admin: {
    Courses: { view: true, create: true, edit: true, delete: true },
    Labs: { view: true, create: true, edit: true, delete: true },
    Assignments: { view: true, create: true, edit: true, delete: true },
    Grades: { view: true, create: true, edit: true, delete: true },
    Discussion: { view: true, create: true, edit: true, delete: true },
    'AI Assistant': { view: true, create: true, edit: true, delete: true },
    Users: { view: true, create: true, edit: true, delete: true },
    System: { view: true, create: true, edit: true, delete: true },
  },
  custom: {
    Courses: { view: false, create: false, edit: false, delete: false },
    Labs: { view: false, create: false, edit: false, delete: false },
    Assignments: { view: false, create: false, edit: false, delete: false },
    Grades: { view: false, create: false, edit: false, delete: false },
    Discussion: { view: false, create: false, edit: false, delete: false },
    'AI Assistant': { view: false, create: false, edit: false, delete: false },
    Users: { view: false, create: false, edit: false, delete: false },
    System: { view: false, create: false, edit: false, delete: false },
  },
};

const roles: RoleInfo[] = [
  {
    id: 'student',
    name: 'Student',
    count: 5200,
    color: 'text-blue-600',
    borderColor: 'border-blue-500',
    bgColor: 'bg-blue-50',
    description: 'Can view courses, submit assignments, participate in discussions',
  },
  {
    id: 'instructor',
    name: 'Instructor',
    count: 205,
    color: 'text-green-600',
    borderColor: 'border-green-500',
    bgColor: 'bg-green-50',
    description: 'Can create and manage courses, grade assignments, moderate discussions',
  },
  {
    id: 'ta',
    name: 'TA',
    count: 48,
    color: 'text-blue-600',
    borderColor: 'border-blue-500',
    bgColor: 'bg-blue-50',
    description: 'Can assist with labs, grade assignments, participate in discussions',
  },
  {
    id: 'admin',
    name: 'Admin',
    count: 15,
    color: 'text-blue-600',
    borderColor: 'border-blue-500',
    bgColor: 'bg-blue-50',
    description: 'Full access to all system features and settings',
  },
  {
    id: 'custom',
    name: 'Custom',
    count: 3,
    color: 'text-gray-600',
    borderColor: 'border-gray-500',
    bgColor: 'bg-gray-50',
    description: 'Create a custom role with specific permissions',
  },
];

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function RoleManagementPage() {
  const { isDark, primaryHex } = useTheme() as any;
  const accentColor = primaryHex || '#3b82f6';
  const { t } = useLanguage();

  const [selectedRole, setSelectedRole] = useState<RoleId>('student');
  const [permissions, setPermissions] = useState(() => deepClone(defaultPermissions));
  const [hasChanges, setHasChanges] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [customRoleName, setCustomRoleName] = useState('');
  const [customRoleDescription, setCustomRoleDescription] = useState('');
  const [baseTemplate, setBaseTemplate] = useState<'none' | 'student' | 'instructor' | 'ta'>(
    'none'
  );

  const currentRole = roles.find((r) => r.id === selectedRole)!;
  const currentPermissions = permissions[selectedRole];

  const togglePermission = useCallback(
    (module: string, perm: Permission) => {
      setPermissions((prev) => {
        const next = deepClone(prev);
        next[selectedRole][module][perm] = !next[selectedRole][module][perm];
        return next;
      });
      setHasChanges(true);
    },
    [selectedRole]
  );

  const handleSave = () => {
    setHasChanges(false);
  };

  const handleDiscard = () => {
    setPermissions(deepClone(defaultPermissions));
    setHasChanges(false);
  };

  const handleCreateRole = () => {
    setShowModal(false);
    setCustomRoleName('');
    setCustomRoleDescription('');
    setBaseTemplate('none');
  };

  const cardClass = `rounded-xl border shadow-sm p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`;
  const headingClass = isDark ? 'text-white' : 'text-gray-900';
  const secondaryClass = isDark ? 'text-gray-400' : 'text-gray-600';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${headingClass}`}>Role Management</h1>
          <p className={`text-sm mt-1 ${secondaryClass}`}>
            Manage user roles and permissions across the system
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 hover:opacity-90 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Create Custom Role
        </button>
      </div>

      {/* Role Selector */}
      <div className={cardClass}>
        <div className="grid grid-cols-5 gap-3">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                selectedRole === role.id
                  ? `${role.borderColor} ${isDark ? 'bg-gray-700' : role.bgColor}`
                  : `border-transparent ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`
              }`}
            >
              <Shield size={24} className={role.color} />
              <span className={`text-sm font-medium ${headingClass}`}>{role.name}</span>
              <span className={`text-xs ${secondaryClass}`}>
                {role.count.toLocaleString()} users
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Role Info Card */}
      <div className={cardClass}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : currentRole.bgColor}`}>
            <Shield size={20} className={currentRole.color} />
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${headingClass}`}>{currentRole.name} Role</h3>
            <p className={`text-sm ${secondaryClass}`}>{currentRole.description}</p>
          </div>
        </div>
      </div>

      {/* Permissions Table */}
      <div className={cardClass}>
        <h2 className={`text-lg font-semibold mb-4 ${headingClass}`}>Permissions</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <th className={`text-left py-3 px-4 text-sm font-medium ${secondaryClass}`}>
                  Module
                </th>
                {(['view', 'create', 'edit', 'delete'] as Permission[]).map((perm) => (
                  <th
                    key={perm}
                    className={`text-center py-3 px-4 text-sm font-medium capitalize ${secondaryClass}`}
                  >
                    {perm}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {modules.map((module) => (
                <tr
                  key={module}
                  className={`border-b last:border-b-0 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className={secondaryClass}>{moduleIcons[module]}</span>
                      <span className={`text-sm font-medium ${headingClass}`}>{module}</span>
                    </div>
                  </td>
                  {(['view', 'create', 'edit', 'delete'] as Permission[]).map((perm) => (
                    <td key={perm} className="py-3 px-4 text-center">
                      <button
                        onClick={() => togglePermission(module, perm)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          currentPermissions[module][perm]
                            ? ''
                            : isDark
                              ? 'bg-gray-600'
                              : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                            currentPermissions[module][perm] ? 'translate-x-4.5' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Unsaved Changes Bar */}
      {hasChanges && (
        <div
          className={`rounded-xl border shadow-sm p-4 flex items-center justify-between ${
            isDark ? 'bg-gray-800 border-yellow-600' : 'bg-yellow-50 border-yellow-300'
          }`}
        >
          <span className={`text-sm font-medium ${isDark ? 'text-yellow-400' : 'text-yellow-800'}`}>
            You have unsaved changes
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDiscard}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                isDark
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <RotateCcw size={14} />
              Discard
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 hover:opacity-90 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Save size={14} />
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Create Custom Role Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div
            className={`w-full max-w-md rounded-xl border shadow-lg p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-lg font-semibold ${headingClass}`}>Create Custom Role</h2>
              <button
                onClick={() => setShowModal(false)}
                className={`p-1 rounded-lg hover:bg-gray-100 ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'text-gray-500'}`}
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${headingClass}`}>
                  Role Name
                </label>
                <input
                  type="text"
                  value={customRoleName}
                  onChange={(e) => setCustomRoleName(e.target.value)}
                  placeholder="e.g. Lab Supervisor"
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${headingClass}`}>
                  Description
                </label>
                <textarea
                  value={customRoleDescription}
                  onChange={(e) => setCustomRoleDescription(e.target.value)}
                  placeholder="Describe the role's responsibilities"
                  rows={3}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${headingClass}`}>
                  Base Template
                </label>
                <CleanSelect
                  value={baseTemplate}
                  onChange={(e) => setBaseTemplate(e.target.value as any)}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="none">None</option>
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                  <option value="ta">TA</option>
                </CleanSelect>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  isDark
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRole}
                className="flex items-center gap-2 px-4 py-2 hover:opacity-90 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Check size={14} />
                Save Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RoleManagementPage;

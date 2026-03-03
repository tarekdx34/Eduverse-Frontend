import { useState } from 'react';
import { Shield, Users, Check, X, ChevronDown } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

interface Role {
  id: string;
  name: string;
  description: string;
  userCount: number;
  permissions: string[];
}

const ALL_PERMISSIONS = [
  'view_courses',
  'edit_courses',
  'manage_courses',
  'submit_assignments',
  'grade_assignments',
  'view_grades',
  'join_discussions',
  'access_materials',
  'create_materials',
  'manage_attendance',
  'view_attendance',
  'manage_labs',
  'view_analytics',
  'manage_enrollment',
  'manage_schedule',
  'manage_departments',
  'manage_users',
  'manage_roles',
  'system_config',
  'security_management',
  'backup_management',
  'full_access',
];

const ROLES: Role[] = [
  {
    id: 'student',
    name: 'Student',
    description: 'Regular student with course access',
    userCount: 1250,
    permissions: [
      'view_courses',
      'submit_assignments',
      'view_grades',
      'join_discussions',
      'access_materials',
    ],
  },
  {
    id: 'instructor',
    name: 'Instructor',
    description: 'Course instructor with teaching privileges',
    userCount: 85,
    permissions: [
      'view_courses',
      'edit_courses',
      'grade_assignments',
      'create_materials',
      'manage_attendance',
      'view_analytics',
    ],
  },
  {
    id: 'ta',
    name: 'Teaching Assistant',
    description: 'Assists instructors with course management',
    userCount: 120,
    permissions: [
      'view_courses',
      'grade_assignments',
      'manage_labs',
      'view_attendance',
      'create_materials',
    ],
  },
  {
    id: 'admin',
    name: 'Admin',
    description: 'Department head with academic management',
    userCount: 15,
    permissions: [
      'manage_courses',
      'manage_enrollment',
      'manage_schedule',
      'view_analytics',
      'manage_departments',
    ],
  },
  {
    id: 'it-admin',
    name: 'IT Admin',
    description: 'System administrator with full access',
    userCount: 5,
    permissions: [
      'full_access',
      'manage_users',
      'manage_roles',
      'system_config',
      'security_management',
      'backup_management',
    ],
  },
];

function formatPermission(permission: string): string {
  return permission.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function RoleManagementPage() {
  const { isDark, primaryHex } = useTheme() as any;
  const accentColor = primaryHex || '#3b82f6';
  const { t } = useLanguage();
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [roles, setRoles] = useState<Role[]>(ROLES);

  const handleTogglePermission = (roleId: string, permission: string) => {
    setRoles((prev) =>
      prev.map((role) => {
        if (role.id !== roleId) return role;
        const has = role.permissions.includes(permission);
        return {
          ...role,
          permissions: has
            ? role.permissions.filter((p) => p !== permission)
            : [...role.permissions, permission],
        };
      })
    );
  };

  const selectedRole = roles.find((r) => r.id === selectedRoleId) ?? null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {t('roleManagement') !== 'roleManagement' ? t('roleManagement') : 'Role Management'}
        </h1>
        <p className={`mt-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Manage user roles and their associated permissions
        </p>
      </div>

      {/* Role Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role) => {
          const isSelected = selectedRoleId === role.id;
          return (
            <button
              key={role.id}
              type="button"
              onClick={() => setSelectedRoleId(isSelected ? null : role.id)}
              className={`text-left rounded-2xl p-5 transition-all duration-200 ${
                isDark
                  ? 'bg-[#1e293b]/80 border border-white/5'
                  : 'bg-white border border-slate-200 shadow-sm'
              } ${isSelected ? 'ring-2' : ''}`}
              style={
                isSelected ? ({ '--tw-ring-color': accentColor } as React.CSSProperties) : undefined
              }
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-xl"
                    style={{ backgroundColor: `${accentColor}20` }}
                  >
                    <Shield className="w-5 h-5" style={{ color: accentColor }} />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {role.name}
                    </h3>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {role.description}
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 flex-shrink-0 mt-1 transition-transform duration-200 ${
                    isDark ? 'text-slate-400' : 'text-slate-400'
                  } ${isSelected ? 'rotate-180' : ''}`}
                />
              </div>

              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-1.5">
                  <Users className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                  <span
                    className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}
                  >
                    {role.userCount.toLocaleString()} users
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                  <span
                    className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}
                  >
                    {role.permissions.length} permissions
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Permissions Panel */}
      {selectedRole && (
        <div
          className={`rounded-2xl p-6 ${
            isDark
              ? 'bg-[#1e293b]/80 border border-white/5'
              : 'bg-white border border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-3 mb-5">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-xl"
              style={{ backgroundColor: `${accentColor}20` }}
            >
              <Shield className="w-5 h-5" style={{ color: accentColor }} />
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {selectedRole.name} Permissions
              </h2>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {selectedRole.permissions.length} of {ALL_PERMISSIONS.length} permissions enabled
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ALL_PERMISSIONS.map((permission) => {
              const enabled = selectedRole.permissions.includes(permission);
              return (
                <div
                  key={permission}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 ${
                    isDark
                      ? 'bg-slate-800/60 border border-white/5'
                      : 'bg-slate-50 border border-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {enabled ? (
                      <Check className="w-4 h-4" style={{ color: accentColor }} />
                    ) : (
                      <X className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                    )}
                    <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {formatPermission(permission)}
                    </span>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => handleTogglePermission(selectedRole.id, permission)}
                    className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none`}
                    style={{
                      backgroundColor: enabled ? accentColor : isDark ? '#475569' : '#cbd5e1',
                    }}
                    aria-label={`Toggle ${formatPermission(permission)}`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        enabled ? 'translate-x-4' : 'translate-x-0.5'
                      } mt-0.5`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

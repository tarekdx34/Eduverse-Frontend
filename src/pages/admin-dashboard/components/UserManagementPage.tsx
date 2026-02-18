import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, MoreVertical, Filter, Download, UserPlus, Shield, Mail } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  lastActive: string;
  department: string;
}

interface UserManagementPageProps {
  users: User[];
  onAddUser: (user: any) => void;
  onEditUser: (id: number, user: any) => void;
  onDeleteUser: (id: number) => void;
}

export function UserManagementPage({ users, onAddUser, onEditUser, onDeleteUser }: UserManagementPageProps) {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return isDark ? 'bg-red-500/20 text-red-300' : 'bg-red-100 text-red-700';
      case 'instructor': return isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700';
      case 'ta': return isDark ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700';
      case 'student': return isDark ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-700';
      default: return isDark ? 'bg-gray-500/20 text-gray-300' : 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return isDark ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-700';
      case 'inactive': return isDark ? 'bg-gray-500/20 text-gray-300' : 'bg-gray-100 text-gray-700';
      case 'suspended': return isDark ? 'bg-red-500/20 text-red-300' : 'bg-red-100 text-red-700';
      default: return isDark ? 'bg-gray-500/20 text-gray-300' : 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('userManagement')}</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Manage all users, roles, and permissions</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-rose-500 transition-colors"
        >
          <UserPlus size={18} />
          {t('addUser')}
        </button>
      </div>

      {/* Filters */}
      <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} size={18} />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
              />
            </div>
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="instructor">Instructors</option>
            <option value="ta">Teaching Assistants</option>
            <option value="admin">Admins</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
          <button className={`flex items-center gap-2 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-rose-500 ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th className={`px-3 md:px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>User</th>
                <th className={`px-3 md:px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Role</th>
                <th className={`px-3 md:px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Department</th>
                <th className={`px-3 md:px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Status</th>
                <th className={`px-3 md:px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Last Active</th>
                <th className={`px-3 md:px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {filteredUsers.map((user) => (
                <tr key={user.id} className={isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                  <td className="px-3 md:px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-orange-400 flex items-center justify-center text-white font-semibold">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.name}</div>
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 md:px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className={`px-3 md:px-6 py-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{user.department}</td>
                  <td className="px-3 md:px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className={`px-3 md:px-6 py-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{user.lastActive}</td>
                  <td className="px-3 md:px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setEditingUser(user)}
                        className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                      >
                        <Edit2 size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                      </button>
                      <button className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}>
                        <Mail size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                      </button>
                      <button className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}>
                        <Shield size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                      </button>
                      <button 
                        onClick={() => onDeleteUser(user.id)}
                        className={`p-2 rounded-lg hover:bg-red-50 ${isDark ? 'hover:bg-red-900/20' : ''}`}
                      >
                        <Trash2 size={16} className="text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className={`px-6 py-4 border-t flex items-center justify-between ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Showing {filteredUsers.length} of {users.length} users
          </p>
          <div className="flex items-center gap-2">
            <button className={`px-3 py-1 rounded border ${isDark ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-gray-700'}`}>Previous</button>
            <button className="px-3 py-1 rounded bg-red-600 text-white">1</button>
            <button className={`px-3 py-1 rounded border ${isDark ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-gray-700'}`}>2</button>
            <button className={`px-3 py-1 rounded border ${isDark ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-gray-700'}`}>Next</button>
          </div>
        </div>
      </div>

      {/* Add/Edit User Modal would go here */}
      {(showAddModal || editingUser) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`w-full max-w-md rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {editingUser ? t('editUser') : t('addUser')}
            </h2>
            <form className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Name</label>
                <input type="text" defaultValue={editingUser?.name} className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`} />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
                <input type="email" defaultValue={editingUser?.email} className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`} />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Role</label>
                <select defaultValue={editingUser?.role} className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}>
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                  <option value="ta">Teaching Assistant</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Department</label>
                <select defaultValue={editingUser?.department} className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Business">Business</option>
                  <option value="Arts">Arts</option>
                  <option value="Science">Science</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setEditingUser(null); }}
                  className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                >
                  {t('cancel')}
                </button>
                <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  {editingUser ? t('save') : t('addUser')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagementPage;

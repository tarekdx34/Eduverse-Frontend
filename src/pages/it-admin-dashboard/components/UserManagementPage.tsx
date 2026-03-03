import { useState, useMemo } from 'react';
import { Users, Search, Plus, Edit2, Trash2, Filter, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
  status: 'active' | 'inactive';
  lastActive: string;
}

const initialUsers: User[] = [
  { id: 1, name: 'Dr. Ahmed Hassan', email: 'ahmed@university.edu', role: 'Instructor', department: 'Computer Science', status: 'active', lastActive: '2025-01-15 09:30' },
  { id: 2, name: 'Sara Mohamed', email: 'sara@university.edu', role: 'Student', department: 'Engineering', status: 'active', lastActive: '2025-01-15 10:45' },
  { id: 3, name: 'Omar Ali', email: 'omar@university.edu', role: 'TA', department: 'Computer Science', status: 'active', lastActive: '2025-01-14 14:20' },
  { id: 4, name: 'Fatima Nour', email: 'fatima@university.edu', role: 'Instructor', department: 'Mathematics', status: 'inactive', lastActive: '2025-01-10 08:00' },
  { id: 5, name: 'Hassan Youssef', email: 'hassan@university.edu', role: 'Admin', department: 'Administration', status: 'active', lastActive: '2025-01-15 11:15' },
];

const roles = ['All', 'Instructor', 'Student', 'TA', 'Admin'];

function getRoleBadgeClasses(role: string, isDark: boolean): string {
  switch (role) {
    case 'Instructor':
      return isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700';
    case 'Student':
      return isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700';
    case 'TA':
      return isDark ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-100 text-amber-700';
    case 'Admin':
      return isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700';
    default:
      return isDark ? 'bg-gray-500/20 text-gray-300' : 'bg-gray-100 text-gray-700';
  }
}

function getStatusBadgeClasses(status: 'active' | 'inactive', isDark: boolean): string {
  if (status === 'active') {
    return isDark ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-700';
  }
  return isDark ? 'bg-red-500/20 text-red-300' : 'bg-red-100 text-red-700';
}

const emptyForm = { name: '', email: '', role: 'Student', department: '', status: 'active' as const };

export function UserManagementPage() {
  const { isDark, primaryHex } = useTheme() as any;
  const accentColor = primaryHex || '#3b82f6';
  const { t } = useLanguage();

  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        searchQuery === '' ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.department.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'All' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  const openAddModal = () => {
    setEditingUser(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, role: user.role, department: user.department, status: user.status });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.email) return;
    if (editingUser) {
      setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? { ...u, ...formData } : u)));
    } else {
      const newUser: User = {
        id: Math.max(...users.map((u) => u.id)) + 1,
        ...formData,
        status: formData.status as 'active' | 'inactive',
        lastActive: new Date().toISOString().slice(0, 16).replace('T', ' '),
      };
      setUsers((prev) => [...prev, newUser]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: number) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const inputClasses = `w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    isDark ? 'bg-slate-800/50 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
  }`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-600/20">
            <Users className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {t('userManagement') !== 'userManagement' ? t('userManagement') : 'User Management'}
            </h1>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'} found
            </p>
          </div>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:opacity-90 text-white text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className={`rounded-2xl p-4 ${isDark ? 'bg-[#1e293b]/80 border border-white/5' : 'bg-white border border-slate-200 shadow-sm'}`}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
            <input
              type="text"
              placeholder="Search by name, email, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-10 ${inputClasses}`}
            />
          </div>
          <div className="relative sm:w-48">
            <Filter className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className={`pl-10 ${inputClasses} appearance-none cursor-pointer`}
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r === 'All' ? 'All Roles' : r}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className={`rounded-2xl overflow-hidden ${isDark ? 'bg-[#1e293b]/80 border border-white/5' : 'bg-white border border-slate-200 shadow-sm'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={isDark ? 'bg-slate-800/50' : 'bg-slate-50'}>
                {['Name', 'Email', 'Role', 'Department', 'Status', 'Last Active', 'Actions'].map((header) => (
                  <th
                    key={header}
                    className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-slate-100'}`}>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className={`px-4 py-12 text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    No users found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className={`transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}>
                    <td className={`px-4 py-3 font-medium whitespace-nowrap ${isDark ? 'text-white' : 'text-slate-900'}`}>{user.name}</td>
                    <td className={`px-4 py-3 whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{user.email}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeClasses(user.role, isDark)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className={`px-4 py-3 whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{user.department}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusBadgeClasses(user.status, isDark)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className={`px-4 py-3 whitespace-nowrap ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{user.lastActive}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(user)}
                          className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-slate-400 hover:text-blue-400' : 'hover:bg-slate-100 text-slate-500 hover:text-blue-600'}`}
                          title="Edit user"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-slate-400 hover:text-red-400' : 'hover:bg-slate-100 text-slate-500 hover:text-red-600'}`}
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className={`relative w-full max-w-md rounded-2xl p-6 space-y-5 ${isDark ? 'bg-[#1e293b] border border-white/10' : 'bg-white border border-slate-200 shadow-xl'}`}>
            <div className="flex items-center justify-between">
              <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {editingUser ? 'Edit User' : 'Add New User'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Name</label>
                <input
                  type="text"
                  placeholder="Full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={inputClasses}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Email</label>
                <input
                  type="email"
                  placeholder="email@university.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={inputClasses}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className={`${inputClasses} appearance-none cursor-pointer`}
                  >
                    {roles.filter((r) => r !== 'All').map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                    className={`${inputClasses} appearance-none cursor-pointer`}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Department</label>
                <input
                  type="text"
                  placeholder="Department name"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className={inputClasses}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowModal(false)}
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:opacity-90 text-white text-sm font-medium transition-colors"
              >
                {editingUser ? 'Save Changes' : 'Add User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

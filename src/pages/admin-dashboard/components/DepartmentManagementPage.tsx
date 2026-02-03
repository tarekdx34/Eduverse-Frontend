import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Building2, Users, BookOpen, DollarSign, Download } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

interface Department {
  id: number;
  name: string;
  faculty: string;
  head: string;
  courses: number;
  students: number;
  instructors: number;
  budget: string;
}

interface DepartmentManagementPageProps {
  departments: Department[];
  onAddDepartment: (department: any) => void;
  onEditDepartment: (id: number, department: any) => void;
  onDeleteDepartment: (id: number) => void;
}

export function DepartmentManagementPage({ departments, onAddDepartment, onEditDepartment, onDeleteDepartment }: DepartmentManagementPageProps) {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [facultyFilter, setFacultyFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

  const filteredDepartments = departments.filter(dept => {
    const matchesSearch = dept.name.toLowerCase().includes(searchTerm.toLowerCase()) || dept.head.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFaculty = facultyFilter === 'all' || dept.faculty === facultyFilter;
    return matchesSearch && matchesFaculty;
  });

  const faculties = [...new Set(departments.map(d => d.faculty))];

  const totalStats = departments.reduce((acc, dept) => ({
    courses: acc.courses + dept.courses,
    students: acc.students + dept.students,
    instructors: acc.instructors + dept.instructors,
  }), { courses: 0, students: 0, instructors: 0 });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('departmentManagement')}</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Manage academic departments and their structure</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus size={18} />
          {t('addDepartment')}
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-purple-900/50' : 'bg-purple-100'}`}>
              <Building2 className="text-purple-600" size={20} />
            </div>
            <div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{departments.length}</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Departments</div>
            </div>
          </div>
        </div>
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
              <Users className="text-blue-600" size={20} />
            </div>
            <div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{totalStats.students.toLocaleString()}</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Students</div>
            </div>
          </div>
        </div>
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-green-900/50' : 'bg-green-100'}`}>
              <BookOpen className="text-green-600" size={20} />
            </div>
            <div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{totalStats.courses}</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Courses</div>
            </div>
          </div>
        </div>
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-orange-900/50' : 'bg-orange-100'}`}>
              <Users className="text-orange-600" size={20} />
            </div>
            <div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{totalStats.instructors}</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Instructors</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} size={18} />
              <input
                type="text"
                placeholder="Search departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
              />
            </div>
          </div>
          <select
            value={facultyFilter}
            onChange={(e) => setFacultyFilter(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
          >
            <option value="all">All Faculties</option>
            {faculties.map(faculty => (
              <option key={faculty} value={faculty}>{faculty}</option>
            ))}
          </select>
          <button className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDepartments.map((dept) => (
          <div key={dept.id} className={`rounded-xl border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="h-20 bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <Building2 className="text-white opacity-50" size={40} />
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${isDark ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700'}`}>
                    {dept.faculty}
                  </span>
                  <h3 className={`font-semibold mt-2 text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{dept.name}</h3>
                </div>
              </div>

              <div className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <p className="font-medium">Head: {dept.head}</p>
              </div>
              
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className={`text-center p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{dept.courses}</div>
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Courses</div>
                </div>
                <div className={`text-center p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{dept.students}</div>
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Students</div>
                </div>
                <div className={`text-center p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{dept.instructors}</div>
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Faculty</div>
                </div>
              </div>

              <div className={`flex items-center justify-between mb-4 p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Budget</span>
                <span className={`font-semibold ${isDark ? 'text-green-400' : 'text-green-600'}`}>{dept.budget}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingDepartment(dept)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                >
                  <Edit2 size={14} />
                  Edit
                </button>
                <button
                  onClick={() => onDeleteDepartment(dept.id)}
                  className={`p-2 rounded-lg border text-red-500 hover:bg-red-50 ${isDark ? 'border-gray-600 hover:bg-red-900/20' : 'border-gray-200'}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingDepartment) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`w-full max-w-lg rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {editingDepartment ? t('editDepartment') : t('addDepartment')}
            </h2>
            <form className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Department Name</label>
                <input type="text" defaultValue={editingDepartment?.name} className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`} />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Faculty</label>
                <select defaultValue={editingDepartment?.faculty} className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}>
                  <option value="Engineering">Engineering</option>
                  <option value="Science">Science</option>
                  <option value="Commerce">Commerce</option>
                  <option value="Humanities">Humanities</option>
                  <option value="Medicine">Medicine</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Head of Department</label>
                <input type="text" defaultValue={editingDepartment?.head} className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`} />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Budget</label>
                <input type="text" defaultValue={editingDepartment?.budget} placeholder="e.g., $2.5M" className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`} />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setEditingDepartment(null); }}
                  className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                >
                  {t('cancel')}
                </button>
                <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  {editingDepartment ? t('save') : t('addDepartment')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DepartmentManagementPage;

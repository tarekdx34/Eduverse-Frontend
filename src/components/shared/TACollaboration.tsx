import { useState } from 'react';
import {
  Users,
  Shield,
  Check,
  X,
  Edit,
  Trash2,
  Plus,
  Search,
  Mail,
  GraduationCap,
  FileText,
  BarChart3,
  MessageSquare,
  Settings,
} from 'lucide-react';

export interface TAUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  assignedCourses: string[];
  permissions: Permission[];
  status: 'active' | 'pending' | 'inactive';
  lastActive?: Date;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'grading' | 'content' | 'communication' | 'analytics';
}

const ALL_PERMISSIONS: Permission[] = [
  { id: 'grade-assignments', name: 'Grade Assignments', description: 'Grade and provide feedback on assignments', category: 'grading' },
  { id: 'grade-quizzes', name: 'Grade Quizzes', description: 'Grade quiz submissions', category: 'grading' },
  { id: 'view-grades', name: 'View All Grades', description: 'View all student grades', category: 'grading' },
  { id: 'edit-content', name: 'Edit Course Content', description: 'Modify course materials and lectures', category: 'content' },
  { id: 'upload-materials', name: 'Upload Materials', description: 'Upload new course materials', category: 'content' },
  { id: 'manage-assignments', name: 'Manage Assignments', description: 'Create and edit assignments', category: 'content' },
  { id: 'send-announcements', name: 'Send Announcements', description: 'Post announcements to students', category: 'communication' },
  { id: 'message-students', name: 'Message Students', description: 'Send direct messages to students', category: 'communication' },
  { id: 'view-analytics', name: 'View Analytics', description: 'Access course analytics and reports', category: 'analytics' },
  { id: 'export-data', name: 'Export Data', description: 'Export grades and reports', category: 'analytics' },
];

interface TACollaborationProps {
  tas: TAUser[];
  courses: { id: string; name: string }[];
  onAddTA: (email: string, courses: string[], permissions: string[]) => void;
  onUpdateTA: (taId: string, updates: Partial<TAUser>) => void;
  onRemoveTA: (taId: string) => void;
  className?: string;
}

export function TACollaboration({
  tas: initialTAs,
  courses,
  onAddTA,
  onUpdateTA,
  onRemoveTA,
  className = '',
}: TACollaborationProps) {
  const [tas, setTAs] = useState<TAUser[]>(initialTAs);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTA, setEditingTA] = useState<TAUser | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Add TA form state
  const [newTAEmail, setNewTAEmail] = useState('');
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const filteredTAs = tas.filter(
    (ta) =>
      ta.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ta.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddTA = () => {
    if (!newTAEmail) return;

    onAddTA(newTAEmail, selectedCourses, selectedPermissions);

    // Simulate adding TA locally
    const newTA: TAUser = {
      id: `ta-${Date.now()}`,
      name: newTAEmail.split('@')[0],
      email: newTAEmail,
      assignedCourses: selectedCourses,
      permissions: ALL_PERMISSIONS.filter((p) => selectedPermissions.includes(p.id)),
      status: 'pending',
    };
    setTAs([...tas, newTA]);

    // Reset form
    setNewTAEmail('');
    setSelectedCourses([]);
    setSelectedPermissions([]);
    setShowAddModal(false);
  };

  const handleUpdatePermissions = (taId: string, permissionIds: string[]) => {
    const permissions = ALL_PERMISSIONS.filter((p) => permissionIds.includes(p.id));
    const updatedTAs = tas.map((ta) =>
      ta.id === taId ? { ...ta, permissions } : ta
    );
    setTAs(updatedTAs);
    onUpdateTA(taId, { permissions });
  };

  const handleUpdateCourses = (taId: string, courseIds: string[]) => {
    const updatedTAs = tas.map((ta) =>
      ta.id === taId ? { ...ta, assignedCourses: courseIds } : ta
    );
    setTAs(updatedTAs);
    onUpdateTA(taId, { assignedCourses: courseIds });
  };

  const handleRemoveTA = (taId: string) => {
    setTAs(tas.filter((ta) => ta.id !== taId));
    onRemoveTA(taId);
  };

  const getPermissionIcon = (category: string) => {
    switch (category) {
      case 'grading':
        return GraduationCap;
      case 'content':
        return FileText;
      case 'communication':
        return MessageSquare;
      case 'analytics':
        return BarChart3;
      default:
        return Settings;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'grading':
        return 'bg-blue-100 text-blue-600';
      case 'content':
        return 'bg-purple-100 text-purple-600';
      case 'communication':
        return 'bg-green-100 text-green-600';
      case 'analytics':
        return 'bg-orange-100 text-orange-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Users className="text-indigo-600" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">TA Collaboration</h3>
              <p className="text-sm text-gray-600">
                {tas.length} Teaching Assistants assigned
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Add TA
          </button>
        </div>

        {/* Search */}
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search TAs..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* TA List */}
      <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
        {filteredTAs.length === 0 ? (
          <div className="p-8 text-center">
            <Users size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600">No teaching assistants assigned yet</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Add your first TA
            </button>
          </div>
        ) : (
          filteredTAs.map((ta) => (
            <div key={ta.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold">
                    {ta.avatar ? (
                      <img src={ta.avatar} alt={ta.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      ta.name.split(' ').map((n) => n[0]).join('').toUpperCase()
                    )}
                  </div>

                  {/* Info */}
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900">{ta.name}</h4>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          ta.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : ta.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {ta.status.charAt(0).toUpperCase() + ta.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{ta.email}</p>

                    {/* Assigned Courses */}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {ta.assignedCourses.map((courseId) => {
                        const course = courses.find((c) => c.id === courseId);
                        return (
                          <span
                            key={courseId}
                            className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                          >
                            {course?.name || courseId}
                          </span>
                        );
                      })}
                    </div>

                    {/* Permissions Summary */}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {Array.from(new Set(ta.permissions.map((p) => p.category))).map((category) => {
                        const Icon = getPermissionIcon(category);
                        const count = ta.permissions.filter((p) => p.category === category).length;
                        return (
                          <span
                            key={category}
                            className={`px-2 py-0.5 rounded text-xs flex items-center gap-1 ${getCategoryColor(category)}`}
                          >
                            <Icon size={12} />
                            {count} {category}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditingTA(ta)}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Edit permissions"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleRemoveTA(ta.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove TA"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add TA Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Add Teaching Assistant</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    value={newTAEmail}
                    onChange={(e) => setNewTAEmail(e.target.value)}
                    placeholder="ta@university.edu"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Courses */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign to Courses
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {courses.map((course) => (
                    <label
                      key={course.id}
                      className="flex items-center gap-3 p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCourses.includes(course.id)}
                        onChange={(e) =>
                          setSelectedCourses(
                            e.target.checked
                              ? [...selectedCourses, course.id]
                              : selectedCourses.filter((id) => id !== course.id)
                          )
                        }
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">{course.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Permissions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permissions
                </label>
                <div className="space-y-4">
                  {['grading', 'content', 'communication', 'analytics'].map((category) => {
                    const categoryPermissions = ALL_PERMISSIONS.filter(
                      (p) => p.category === category
                    );
                    const Icon = getPermissionIcon(category);

                    return (
                      <div key={category}>
                        <div className={`flex items-center gap-2 mb-2 ${getCategoryColor(category)} px-2 py-1 rounded`}>
                          <Icon size={14} />
                          <span className="text-xs font-medium capitalize">{category}</span>
                        </div>
                        <div className="space-y-1 pl-4">
                          {categoryPermissions.map((permission) => (
                            <label
                              key={permission.id}
                              className="flex items-center gap-2 cursor-pointer py-1"
                            >
                              <input
                                type="checkbox"
                                checked={selectedPermissions.includes(permission.id)}
                                onChange={(e) =>
                                  setSelectedPermissions(
                                    e.target.checked
                                      ? [...selectedPermissions, permission.id]
                                      : selectedPermissions.filter((id) => id !== permission.id)
                                  )
                                }
                                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                              />
                              <div>
                                <span className="text-sm text-gray-700">{permission.name}</span>
                                <p className="text-xs text-gray-500">{permission.description}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTA}
                disabled={!newTAEmail || selectedCourses.length === 0}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 transition-colors"
              >
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit TA Modal */}
      {editingTA && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Edit TA Permissions</h3>
              <button
                onClick={() => setEditingTA(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* TA Info */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold">
                  {editingTA.name.split(' ').map((n) => n[0]).join('').toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{editingTA.name}</p>
                  <p className="text-sm text-gray-500">{editingTA.email}</p>
                </div>
              </div>

              {/* Courses */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned Courses
                </label>
                <div className="space-y-2">
                  {courses.map((course) => (
                    <label
                      key={course.id}
                      className="flex items-center gap-3 p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={editingTA.assignedCourses.includes(course.id)}
                        onChange={(e) => {
                          const newCourses = e.target.checked
                            ? [...editingTA.assignedCourses, course.id]
                            : editingTA.assignedCourses.filter((id) => id !== course.id);
                          setEditingTA({ ...editingTA, assignedCourses: newCourses });
                        }}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">{course.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Permissions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permissions
                </label>
                <div className="space-y-2">
                  {ALL_PERMISSIONS.map((permission) => (
                    <label
                      key={permission.id}
                      className="flex items-center gap-3 p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={editingTA.permissions.some((p) => p.id === permission.id)}
                        onChange={(e) => {
                          const newPermissions = e.target.checked
                            ? [...editingTA.permissions, permission]
                            : editingTA.permissions.filter((p) => p.id !== permission.id);
                          setEditingTA({ ...editingTA, permissions: newPermissions });
                        }}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <div>
                        <span className="text-sm text-gray-700">{permission.name}</span>
                        <p className="text-xs text-gray-500">{permission.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setEditingTA(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleUpdateCourses(editingTA.id, editingTA.assignedCourses);
                  handleUpdatePermissions(
                    editingTA.id,
                    editingTA.permissions.map((p) => p.id)
                  );
                  setEditingTA(null);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TACollaboration;

import { useState } from 'react';
import { Calendar, Clock, Users, Check, X, AlertCircle, Settings } from 'lucide-react';
import { CleanSelect } from './';

export interface RegistrationPeriod {
  id: string;
  courseId: string;
  courseName: string;
  startDate: Date;
  endDate: Date;
  capacity: number;
  enrolled: number;
  waitlistEnabled: boolean;
  waitlistCapacity: number;
  isActive: boolean;
  prerequisites?: string[];
  restrictions?: string[];
}

interface CourseRegistrationPeriodProps {
  registrationPeriods: RegistrationPeriod[];
  onUpdatePeriod: (periodId: string, updates: Partial<RegistrationPeriod>) => void;
  onCreatePeriod?: (courseId: string, data: Partial<RegistrationPeriod>) => void;
  courses?: { id: string; name: string }[];
  className?: string;
  userRole?: 'instructor' | 'admin';
}

export function CourseRegistrationPeriod({
  registrationPeriods: initialPeriods,
  onUpdatePeriod,
  onCreatePeriod,
  courses = [],
  className = '',
  userRole = 'instructor',
}: CourseRegistrationPeriodProps) {
  const [periods, setPeriods] = useState<RegistrationPeriod[]>(initialPeriods);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form state for editing
  const [editForm, setEditForm] = useState<Partial<RegistrationPeriod>>({});

  // Form state for creating
  const [newPeriod, setNewPeriod] = useState({
    courseId: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    capacity: 30,
    waitlistEnabled: true,
    waitlistCapacity: 10,
  });

  const getStatusBadge = (period: RegistrationPeriod) => {
    const now = new Date();
    const start = new Date(period.startDate);
    const end = new Date(period.endDate);

    if (now < start) {
      return (
        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
          Upcoming
        </span>
      );
    } else if (now >= start && now <= end && period.isActive) {
      return (
        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          Active
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
          Closed
        </span>
      );
    }
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(date));
  };

  const getEnrollmentProgress = (period: RegistrationPeriod) => {
    const percentage = (period.enrolled / period.capacity) * 100;
    return Math.min(percentage, 100);
  };

  const startEditing = (period: RegistrationPeriod) => {
    setEditingId(period.id);
    setEditForm({
      startDate: period.startDate,
      endDate: period.endDate,
      capacity: period.capacity,
      waitlistEnabled: period.waitlistEnabled,
      waitlistCapacity: period.waitlistCapacity,
      isActive: period.isActive,
    });
  };

  const saveEditing = () => {
    if (!editingId || !editForm) return;

    const updatedPeriods = periods.map((p) => (p.id === editingId ? { ...p, ...editForm } : p));
    setPeriods(updatedPeriods);
    onUpdatePeriod(editingId, editForm);
    setEditingId(null);
    setEditForm({});
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
  };

  const togglePeriodActive = (periodId: string) => {
    const period = periods.find((p) => p.id === periodId);
    if (!period) return;

    const newStatus = !period.isActive;
    const updatedPeriods = periods.map((p) =>
      p.id === periodId ? { ...p, isActive: newStatus } : p
    );
    setPeriods(updatedPeriods);
    onUpdatePeriod(periodId, { isActive: newStatus });
  };

  const handleCreatePeriod = () => {
    if (!newPeriod.courseId || !newPeriod.startDate || !newPeriod.endDate) return;

    const course = courses.find((c) => c.id === newPeriod.courseId);
    const periodData: RegistrationPeriod = {
      id: `period-${Date.now()}`,
      courseId: newPeriod.courseId,
      courseName: course?.name || 'Unknown Course',
      startDate: new Date(`${newPeriod.startDate}T${newPeriod.startTime || '00:00'}`),
      endDate: new Date(`${newPeriod.endDate}T${newPeriod.endTime || '23:59'}`),
      capacity: newPeriod.capacity,
      enrolled: 0,
      waitlistEnabled: newPeriod.waitlistEnabled,
      waitlistCapacity: newPeriod.waitlistCapacity,
      isActive: true,
    };

    setPeriods([...periods, periodData]);
    if (onCreatePeriod) {
      onCreatePeriod(newPeriod.courseId, periodData);
    }

    // Reset form
    setNewPeriod({
      courseId: '',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      capacity: 30,
      waitlistEnabled: true,
      waitlistCapacity: 10,
    });
    setShowCreateModal(false);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className={`bg-white rounded-xl border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="text-green-600" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Registration Periods</h3>
              <p className="text-sm text-gray-600">
                Manage when students can enroll in your courses
              </p>
            </div>
          </div>
          {onCreatePeriod && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Calendar size={16} />
              New Period
            </button>
          )}
        </div>
      </div>

      {/* Periods List */}
      <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
        {periods.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600">No registration periods configured</p>
            {onCreatePeriod && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 text-green-600 hover:text-green-700 font-medium"
              >
                Create your first registration period
              </button>
            )}
          </div>
        ) : (
          periods.map((period) => (
            <div key={period.id} className="p-4 hover:bg-gray-50 transition-colors">
              {editingId === period.id ? (
                /* Editing Mode */
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Start Date & Time</label>
                      <input
                        type="datetime-local"
                        value={
                          editForm.startDate
                            ? new Date(editForm.startDate).toISOString().slice(0, 16)
                            : ''
                        }
                        onChange={(e) =>
                          setEditForm({ ...editForm, startDate: new Date(e.target.value) })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">End Date & Time</label>
                      <input
                        type="datetime-local"
                        value={
                          editForm.endDate
                            ? new Date(editForm.endDate).toISOString().slice(0, 16)
                            : ''
                        }
                        onChange={(e) =>
                          setEditForm({ ...editForm, endDate: new Date(e.target.value) })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Capacity</label>
                      <input
                        type="number"
                        min="1"
                        value={editForm.capacity || 0}
                        onChange={(e) =>
                          setEditForm({ ...editForm, capacity: parseInt(e.target.value) })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Waitlist Capacity</label>
                      <input
                        type="number"
                        min="0"
                        value={editForm.waitlistCapacity || 0}
                        onChange={(e) =>
                          setEditForm({ ...editForm, waitlistCapacity: parseInt(e.target.value) })
                        }
                        disabled={!editForm.waitlistEnabled}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.waitlistEnabled || false}
                      onChange={(e) =>
                        setEditForm({ ...editForm, waitlistEnabled: e.target.checked })
                      }
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">Enable waitlist</span>
                  </label>

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={cancelEditing}
                      className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveEditing}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm transition-colors flex items-center gap-2"
                    >
                      <Check size={16} />
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                /* View Mode */
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">{period.courseName}</h4>
                        {getStatusBadge(period)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {formatDateTime(period.startDate)} - {formatDateTime(period.endDate)}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => togglePeriodActive(period.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          period.isActive
                            ? 'text-green-600 hover:bg-green-50'
                            : 'text-gray-400 hover:bg-gray-100'
                        }`}
                        title={period.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {period.isActive ? <Check size={16} /> : <X size={16} />}
                      </button>
                      <button
                        onClick={() => startEditing(period)}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Settings size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Enrollment Progress */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Enrollment</span>
                      <span className="font-medium">
                        {period.enrolled}/{period.capacity}
                        {period.enrolled >= period.capacity && (
                          <span className="text-orange-600 ml-2">Full</span>
                        )}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          period.enrolled >= period.capacity
                            ? 'bg-orange-500'
                            : period.enrolled >= period.capacity * 0.8
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                        }`}
                        style={{ width: `${getEnrollmentProgress(period)}%` }}
                      />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users size={12} />
                      Capacity: {period.capacity}
                    </span>
                    {period.waitlistEnabled && (
                      <span>Waitlist: {period.waitlistCapacity} spots</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">New Registration Period</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Course Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
                <CleanSelect
                  value={newPeriod.courseId}
                  onChange={(e) => setNewPeriod({ ...newPeriod, courseId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select a course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </CleanSelect>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    min={today}
                    value={newPeriod.startDate}
                    onChange={(e) => setNewPeriod({ ...newPeriod, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                  <input
                    type="time"
                    value={newPeriod.startTime}
                    onChange={(e) => setNewPeriod({ ...newPeriod, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    min={newPeriod.startDate || today}
                    value={newPeriod.endDate}
                    onChange={(e) => setNewPeriod({ ...newPeriod, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                  <input
                    type="time"
                    value={newPeriod.endTime}
                    onChange={(e) => setNewPeriod({ ...newPeriod, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Capacity */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Capacity</label>
                  <input
                    type="number"
                    min="1"
                    value={newPeriod.capacity}
                    onChange={(e) =>
                      setNewPeriod({ ...newPeriod, capacity: parseInt(e.target.value) || 30 })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Waitlist Capacity
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newPeriod.waitlistCapacity}
                    onChange={(e) =>
                      setNewPeriod({
                        ...newPeriod,
                        waitlistCapacity: parseInt(e.target.value) || 0,
                      })
                    }
                    disabled={!newPeriod.waitlistEnabled}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                  />
                </div>
              </div>

              {/* Waitlist Toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newPeriod.waitlistEnabled}
                  onChange={(e) =>
                    setNewPeriod({ ...newPeriod, waitlistEnabled: e.target.checked })
                  }
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">Enable waitlist when course is full</span>
              </label>
            </div>

            <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePeriod}
                disabled={!newPeriod.courseId || !newPeriod.startDate || !newPeriod.endDate}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 transition-colors"
              >
                Create Period
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CourseRegistrationPeriod;

import { useState } from 'react';
import { Calendar, Clock, Bell, Send, X, Check, AlertCircle } from 'lucide-react';

interface ScheduledAnnouncementProps {
  onSchedule: (data: {
    title: string;
    content: string;
    scheduledTime: Date;
    targetAudience: string[];
    notifyEmail: boolean;
    notifyPush: boolean;
  }) => void;
  onCancel: () => void;
  courses?: { id: string; name: string }[];
  className?: string;
}

export function ScheduledAnnouncement({
  onSchedule,
  onCancel,
  courses = [
    { id: '1', name: 'Calculus I' },
    { id: '2', name: 'Physics I' },
    { id: '3', name: 'Computer Science 101' },
  ],
  className = '',
}: ScheduledAnnouncementProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyPush, setNotifyPush] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isScheduleNow, setIsScheduleNow] = useState(true);

  const handleCourseToggle = (courseId: string) => {
    setSelectedCourses((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCourses.length === courses.length) {
      setSelectedCourses([]);
    } else {
      setSelectedCourses(courses.map((c) => c.id));
    }
  };

  const validateForm = (): boolean => {
    if (!title.trim()) {
      setError('Title is required');
      return false;
    }
    if (!content.trim()) {
      setError('Content is required');
      return false;
    }
    if (selectedCourses.length === 0) {
      setError('Please select at least one course');
      return false;
    }
    if (!isScheduleNow && (!scheduledDate || !scheduledTime)) {
      setError('Please select a date and time for scheduling');
      return false;
    }
    if (!isScheduleNow) {
      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
      if (scheduledDateTime <= new Date()) {
        setError('Scheduled time must be in the future');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = () => {
    setError(null);
    if (!validateForm()) return;

    const scheduledDateTime = isScheduleNow
      ? new Date()
      : new Date(`${scheduledDate}T${scheduledTime}`);

    onSchedule({
      title,
      content,
      scheduledTime: scheduledDateTime,
      targetAudience: selectedCourses,
      notifyEmail,
      notifyPush,
    });
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className={`bg-white rounded-xl border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Bell className="text-blue-600" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Schedule Announcement</h3>
            <p className="text-sm text-gray-600">Send now or schedule for later</p>
          </div>
        </div>
        <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <X size={20} className="text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Announcement Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter announcement title..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Message Content *</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your announcement message..."
            rows={5}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">{content.length} characters</p>
        </div>

        {/* Target Audience */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Target Courses *</label>
            <button onClick={handleSelectAll} className="text-xs text-blue-600 hover:text-blue-700">
              {selectedCourses.length === courses.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {courses.map((course) => (
              <label
                key={course.id}
                className={`
                  flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors
                  ${
                    selectedCourses.includes(course.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }
                `}
              >
                <input
                  type="checkbox"
                  checked={selectedCourses.includes(course.id)}
                  onChange={() => handleCourseToggle(course.id)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{course.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Scheduling */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">When to Send</label>
          <div className="flex gap-4 mb-4">
            <label
              className={`
                flex-1 flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors
                ${isScheduleNow ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}
              `}
            >
              <input
                type="radio"
                name="scheduleType"
                checked={isScheduleNow}
                onChange={() => setIsScheduleNow(true)}
                className="w-4 h-4 text-blue-600"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">Send Now</span>
                <p className="text-xs text-gray-500">Publish immediately</p>
              </div>
            </label>
            <label
              className={`
                flex-1 flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors
                ${!isScheduleNow ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}
              `}
            >
              <input
                type="radio"
                name="scheduleType"
                checked={!isScheduleNow}
                onChange={() => setIsScheduleNow(false)}
                className="w-4 h-4 text-blue-600"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">Schedule</span>
                <p className="text-xs text-gray-500">Choose date & time</p>
              </div>
            </label>
          </div>

          {!isScheduleNow && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Date</label>
                <div className="relative">
                  <Calendar
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={today}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Time</label>
                <div className="relative">
                  <Clock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notification Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notification Method
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Send email notification</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyPush}
                onChange={(e) => setNotifyPush(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Send push notification</span>
            </label>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto p-1 hover:bg-red-100 rounded">
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          {isScheduleNow ? (
            <>
              <Send size={18} />
              Send Now
            </>
          ) : (
            <>
              <Clock size={18} />
              Schedule
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default ScheduledAnnouncement;

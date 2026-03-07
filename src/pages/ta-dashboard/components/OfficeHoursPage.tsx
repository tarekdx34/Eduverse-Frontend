import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Users, Plus, Edit2, Trash2, Video, Check, X, Settings } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { CleanSelect } from '../../../components/shared';


type ScheduleSlot = {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  location: string;
  type: 'in-person' | 'online';
  active: boolean;
};

type Appointment = {
  id: string;
  studentName: string;
  date: string;
  time: string;
  topic: string;
  status: 'confirmed' | 'pending';
};

const MOCK_SLOTS: ScheduleSlot[] = [
  { id: 's1', day: 'Monday', startTime: '14:00', endTime: '16:00', location: 'Room 205', type: 'in-person', active: true },
  { id: 's2', day: 'Wednesday', startTime: '10:00', endTime: '12:00', location: 'Room 205', type: 'in-person', active: true },
  { id: 's3', day: 'Friday', startTime: '15:00', endTime: '17:00', location: 'Online - Zoom', type: 'online', active: true },
];

const MOCK_APPOINTMENTS: Appointment[] = [
  { id: 'a1', studentName: 'John Smith', date: 'Mon, Feb 10', time: '2:30 PM', topic: 'Assignment Help', status: 'confirmed' },
  { id: 'a2', studentName: 'Emily Davis', date: 'Mon, Feb 10', time: '3:00 PM', topic: 'Grade Discussion', status: 'pending' },
  { id: 'a3', studentName: 'Michael Brown', date: 'Wed, Feb 12', time: '10:30 AM', topic: 'Lab Questions', status: 'confirmed' },
];

export function OfficeHoursPage() {
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const [slots, setSlots] = useState(MOCK_SLOTS);
  const [appointments, setAppointments] = useState(MOCK_APPOINTMENTS);
  const [showModal, setShowModal] = useState(false);
  const [enableOfficeHours, setEnableOfficeHours] = useState(true);
  const [allowRequests, setAllowRequests] = useState(true);
  const [calendarIntegration, setCalendarIntegration] = useState(false);
  const [newSlot, setNewSlot] = useState({ day: 'Monday', startTime: '', endTime: '', location: '', type: 'in-person' as 'in-person' | 'online' });

  const cardClass = `border rounded-lg p-6 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`;
  const headingClass = isDark ? 'text-white' : 'text-gray-900';
  const subTextClass = isDark ? 'text-slate-400' : 'text-gray-600';
  const inputClass = `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-slate-400' : 'border-gray-300'}`;

  const handleAddSlot = () => {
    if (!newSlot.startTime || !newSlot.endTime || !newSlot.location) return;
    const slot: ScheduleSlot = {
      id: `s${Date.now()}`,
      day: newSlot.day,
      startTime: newSlot.startTime,
      endTime: newSlot.endTime,
      location: newSlot.location,
      type: newSlot.type,
      active: true,
    };
    setSlots([...slots, slot]);
    setNewSlot({ day: 'Monday', startTime: '', endTime: '', location: '', type: 'in-person' });
    setShowModal(false);
  };

  const handleDeleteSlot = (id: string) => {
    setSlots(slots.filter((s) => s.id !== id));
  };

  const handleConfirm = (id: string) => {
    setAppointments(appointments.map((a) => (a.id === id ? { ...a, status: 'confirmed' as const } : a)));
  };

  const handleDecline = (id: string) => {
    setAppointments(appointments.filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${headingClass}`}>Office Hours</h2>
          <p className={`mt-1 ${subTextClass}`}>Manage your office hours schedule and student appointments</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New Slot
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={cardClass}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 text-green-600">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className={`text-sm ${subTextClass}`}>Active Slots</p>
              <p className={`text-2xl font-bold ${headingClass}`}>3</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className={`text-sm ${subTextClass}`}>Upcoming Appointments</p>
              <p className={`text-2xl font-bold ${headingClass}`}>3</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-100 text-yellow-600">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className={`text-sm ${subTextClass}`}>Pending Requests</p>
              <p className={`text-2xl font-bold ${headingClass}`}>1</p>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Schedule */}
      <div className={cardClass}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${headingClass}`}>Weekly Schedule</h3>
          <button className={`text-sm font-medium flex items-center gap-1 ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} transition-colors`}>
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
        </div>
        <div className="space-y-3">
          {slots.map((slot) => (
            <div
              key={slot.id}
              className={`border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-l-4 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} ${isDark ? 'border-l-green-400' : 'border-l-green-500'}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div>
                  <p className={`font-medium ${headingClass}`}>{slot.day}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className={`w-4 h-4 ${subTextClass}`} />
                    <span className={`text-sm ${subTextClass}`}>{slot.startTime} - {slot.endTime}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className={`w-4 h-4 ${subTextClass}`} />
                    <span className={`text-sm ${subTextClass}`}>{slot.location}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${slot.type === 'online' ? 'bg-blue-100 text-blue-700' : 'bg-blue-100 text-blue-700'}`}>
                    {slot.type === 'online' ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                    {slot.type === 'online' ? 'Online' : 'In-person'}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    <Check className="w-3 h-3" />
                    Active
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className={`p-2 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:text-blue-400 hover:bg-white/10' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}>
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteSlot(slot.id)}
                  className={`p-2 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:text-red-400 hover:bg-white/10' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className={cardClass}>
        <h3 className={`text-lg font-semibold mb-4 ${headingClass}`}>Upcoming Appointments</h3>
        <div className="space-y-3">
          {appointments.map((appt) => (
            <div
              key={appt.id}
              className={`border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}
            >
              <div className="flex-1">
                <p className={`font-medium ${headingClass}`}>{appt.studentName}</p>
                <div className="flex flex-wrap items-center gap-3 mt-1">
                  <span className={`text-sm flex items-center gap-1 ${subTextClass}`}>
                    <Calendar className="w-4 h-4" />
                    {appt.date}
                  </span>
                  <span className={`text-sm flex items-center gap-1 ${subTextClass}`}>
                    <Clock className="w-4 h-4" />
                    {appt.time}
                  </span>
                  <span className={`text-sm ${subTextClass}`}>{appt.topic}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${appt.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {appt.status === 'confirmed' ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                  {appt.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                </span>
                {appt.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleConfirm(appt.id)}
                      className="p-2 rounded-lg text-green-600 hover:bg-green-50 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDecline(appt.id)}
                      className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Availability Settings */}
      <div className={cardClass}>
        <div className="flex items-center gap-2 mb-4">
          <Settings className={`w-5 h-5 ${subTextClass}`} />
          <h3 className={`text-lg font-semibold ${headingClass}`}>Availability Settings</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className={`font-medium ${headingClass}`}>Enable Office Hours</p>
              <p className={`text-sm ${subTextClass}`}>Make your office hours visible to students</p>
            </div>
            <button
              onClick={() => setEnableOfficeHours(!enableOfficeHours)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enableOfficeHours ? 'bg-blue-600' : isDark ? 'bg-white/20' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enableOfficeHours ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className={`font-medium ${headingClass}`}>Allow Student Requests</p>
              <p className={`text-sm ${subTextClass}`}>Students can request appointment slots</p>
            </div>
            <button
              onClick={() => setAllowRequests(!allowRequests)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${allowRequests ? 'bg-blue-600' : isDark ? 'bg-white/20' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${allowRequests ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className={`font-medium ${headingClass}`}>Calendar Integration</p>
              <p className={`text-sm ${subTextClass}`}>Sync with Google Calendar or Outlook</p>
            </div>
            <button
              onClick={() => setCalendarIntegration(!calendarIntegration)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${calendarIntegration ? 'bg-blue-600' : isDark ? 'bg-white/20' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${calendarIntegration ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Add New Slot Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className={`w-full max-w-md mx-4 rounded-lg p-6 ${isDark ? 'bg-gray-800 border border-white/10' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${headingClass}`}>Add New Slot</h3>
              <button onClick={() => setShowModal(false)} className={`p-1 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${headingClass}`}>Day</label>
                <CleanSelect
                  value={newSlot.day}
                  onChange={(e) => setNewSlot({ ...newSlot, day: e.target.value })}
                  className={inputClass}
                >
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </CleanSelect>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${headingClass}`}>Start Time</label>
                  <input
                    type="time"
                    value={newSlot.startTime}
                    onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${headingClass}`}>End Time</label>
                  <input
                    type="time"
                    value={newSlot.endTime}
                    onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${headingClass}`}>Location</label>
                <input
                  type="text"
                  placeholder="e.g. Room 205 or Zoom link"
                  value={newSlot.location}
                  onChange={(e) => setNewSlot({ ...newSlot, location: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${headingClass}`}>Type</label>
                <CleanSelect
                  value={newSlot.type}
                  onChange={(e) => setNewSlot({ ...newSlot, type: e.target.value as 'in-person' | 'online' })}
                  className={inputClass}
                >
                  <option value="in-person">In-person</option>
                  <option value="online">Online</option>
                </CleanSelect>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className={`px-6 py-2 border rounded-lg transition-colors text-sm font-medium ${isDark ? 'border-white/10 text-slate-300 hover:bg-white/5' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
              >
                Cancel
              </button>
              <button
                onClick={handleAddSlot}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 transition-colors text-sm font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

export type AttendanceFormData = {
  id?: number;
  date: string;
  present: number;
  absent: number;
};

type AttendanceModalProps = {
  open: boolean;
  attendanceData: AttendanceFormData | null;
  onClose: () => void;
  onSave: (data: AttendanceFormData) => void;
};

export function AttendanceModal({ open, attendanceData, onClose, onSave }: AttendanceModalProps) {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [formData, setFormData] = useState<AttendanceFormData>({
    date: '',
    present: 0,
    absent: 0,
  });

  useEffect(() => {
    if (attendanceData) {
      setFormData(attendanceData);
    } else {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        date: today,
        present: 0,
        absent: 0,
      });
    }
  }, [attendanceData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className={`rounded-xl shadow-2xl w-full max-w-md ${isDark ? 'bg-card-dark border border-white/10' : 'bg-white border border-gray-100'}`}
      >
        <div
          className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-white/10' : 'border-gray-100'}`}
        >
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {attendanceData
              ? t('editAttendance') || 'Edit Attendance'
              : t('addRecord') || 'Create Attendance Record'}
          </h2>
          <button
            onClick={onClose}
            className={`transition-colors p-1 rounded-full ${isDark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label
              className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}
            >
              {t('date') || 'Date'}
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${isDark ? 'bg-white/5 border-white/10 text-slate-100 placeholder:text-slate-500' : 'border-gray-300 bg-white text-gray-900'}`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}
              >
                {t('present') || 'Present'}
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.present}
                onChange={(e) =>
                  setFormData({ ...formData, present: parseInt(e.target.value) || 0 })
                }
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${isDark ? 'bg-white/5 border-white/10 text-green-400 font-medium' : 'border-gray-300 bg-white text-green-700 font-medium'}`}
              />
            </div>

            <div>
              <label
                className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}
              >
                {t('absent') || 'Absent'}
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.absent}
                onChange={(e) =>
                  setFormData({ ...formData, absent: parseInt(e.target.value) || 0 })
                }
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${isDark ? 'bg-white/5 border-white/10 text-red-400 font-medium' : 'border-gray-300 bg-white text-red-700 font-medium'}`}
              />
            </div>
          </div>

          <div
            className={`p-4 rounded-lg flex items-center justify-between ${isDark ? 'bg-white/5 border border-white/5' : 'bg-gray-50 border border-gray-100'}`}
          >
            <span className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              Total Students:
            </span>
            <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {formData.present + formData.absent}
            </span>
          </div>

          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-4 py-2.5 border rounded-lg font-medium transition-all ${isDark ? 'border-white/10 text-slate-300 hover:bg-white/5' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
            >
              {t('cancel') || 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all shadow-md active:scale-95"
            >
              {attendanceData
                ? t('saveChanges') || 'Save Changes'
                : t('confirm') || 'Create Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AttendanceModal;

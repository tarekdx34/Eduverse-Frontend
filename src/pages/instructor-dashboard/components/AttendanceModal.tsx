import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

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
    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {attendanceData ? 'Edit Attendance' : 'Create Attendance Record'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Present</label>
            <input
              type="number"
              required
              min="0"
              value={formData.present}
              onChange={(e) => setFormData({ ...formData, present: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Absent</label>
            <input
              type="number"
              required
              min="0"
              value={formData.absent}
              onChange={(e) => setFormData({ ...formData, absent: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="bg-gray-50 p-3 rounded-md">
            <div className="text-sm text-gray-600">
              Total Students:{' '}
              <span className="font-semibold">{formData.present + formData.absent}</span>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              {attendanceData ? 'Save Changes' : 'Create Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AttendanceModal;

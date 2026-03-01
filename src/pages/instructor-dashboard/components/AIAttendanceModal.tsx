import React from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { AIAttendanceContainer } from './ai-features/attendance/AIAttendanceContainer';

interface AIAttendanceModalProps {
  open: boolean;
  onClose: () => void;
  courseSection: string;
}

export function AIAttendanceModal({ open, onClose, courseSection }: AIAttendanceModalProps) {
  const { isDark } = useTheme();

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div
        className={`w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-auto ${
          isDark ? 'bg-card-dark border border-white/10' : 'bg-white border border-gray-100'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-white/10' : 'border-gray-100'}`}
        >
          <div>
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              AI Attendance System
            </h2>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              Section: {courseSection}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              isDark
                ? 'text-slate-400 hover:text-white hover:bg-white/10'
                : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
          <AIAttendanceContainer courseSection={courseSection} />
        </div>
      </div>
    </div>
  );
}

export default AIAttendanceModal;

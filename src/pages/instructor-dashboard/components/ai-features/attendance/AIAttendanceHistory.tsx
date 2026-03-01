import React from 'react';
import { History, Clock, Users, Eye } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

interface AttendanceSession {
  id: number;
  date: Date;
  courseSection: string;
  photoName: string;
  totalDetected: number;
  totalStudents: number;
  results: any[];
}

interface AIAttendanceHistoryProps {
  sessions: AttendanceSession[];
  onViewDetails: (session: AttendanceSession) => void;
}

export function AIAttendanceHistory({ sessions, onViewDetails }: AIAttendanceHistoryProps) {
  const { isDark, primaryHex = '#4f46e5' } = useTheme() as any;

  if (sessions.length === 0) {
    return (
      <div
        className={`rounded-xl border-2 border-dashed p-12 text-center ${isDark ? 'bg-white/5 border-white/20' : 'bg-gray-50 border-gray-300'}`}
      >
        <History
          className={`mx-auto mb-4 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}
          size={48}
        />
        <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          No History Yet
        </h3>
        <p className={isDark ? 'text-slate-400' : 'text-gray-500'}>
          AI attendance sessions will appear here after you process class photos
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-3 rounded-lg ${isDark ? 'bg-indigo-500/10' : 'bg-indigo-100'}`}>
          <History className={isDark ? 'text-indigo-400' : 'text-indigo-600'} size={24} />
        </div>
        <div>
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Attendance History
          </h3>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            View past AI attendance sessions
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {sessions.map((session) => {
          const attendanceRate = ((session.totalDetected / session.totalStudents) * 100).toFixed(1);

          return (
            <div
              key={session.id}
              className={`rounded-lg border p-5 transition-shadow hover:shadow-md ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                    <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {session.courseSection}
                    </h4>
                    <span
                      className={`text-sm hidden sm:inline ${isDark ? 'text-slate-500' : 'text-gray-500'}`}
                    >
                      •
                    </span>
                    <div
                      className={`flex items-center gap-1 text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}
                    >
                      <Clock size={14} />
                      {new Date(session.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Users size={16} className={isDark ? 'text-slate-500' : 'text-gray-400'} />
                      <span className={isDark ? 'text-slate-300' : 'text-gray-600'}>
                        <span
                          className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
                        >
                          {session.totalDetected}
                        </span>
                        /{session.totalStudents} detected
                      </span>
                    </div>
                    <div
                      className={`font-semibold ${
                        parseFloat(attendanceRate) >= 80
                          ? isDark
                            ? 'text-green-400'
                            : 'text-green-600'
                          : parseFloat(attendanceRate) >= 60
                            ? isDark
                              ? 'text-yellow-400'
                              : 'text-yellow-600'
                            : isDark
                              ? 'text-red-400'
                              : 'text-red-600'
                      }`}
                    >
                      {attendanceRate}% attendance
                    </div>
                  </div>

                  <div
                    className={`mt-2 text-xs truncate ${isDark ? 'text-slate-500' : 'text-gray-500'}`}
                  >
                    Photo: {session.photoName}
                  </div>
                </div>

                <div className="flex justify-end mt-2 sm:mt-0">
                  <button
                    onClick={() => onViewDetails(session)}
                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors w-full sm:w-auto ${
                      isDark
                        ? 'bg-white/10 text-white hover:bg-white/20'
                        : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                    }`}
                  >
                    <Eye size={16} />
                    View Details
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AIAttendanceHistory;

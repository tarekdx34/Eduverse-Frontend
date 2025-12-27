import React from 'react';
import { History, Clock, Users, Eye } from 'lucide-react';

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
  if (sessions.length === 0) {
    return (
      <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
        <History className="mx-auto text-gray-400 mb-4" size={48} />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No History Yet</h3>
        <p className="text-gray-500">
          AI attendance sessions will appear here after you process class photos
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-purple-100 rounded-lg">
          <History className="text-purple-600" size={24} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Attendance History</h3>
          <p className="text-sm text-gray-500">View past AI attendance sessions</p>
        </div>
      </div>

      <div className="space-y-3">
        {sessions.map((session) => {
          const attendanceRate = ((session.totalDetected / session.totalStudents) * 100).toFixed(1);

          return (
            <div
              key={session.id}
              className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-gray-900">{session.courseSection}</h4>
                    <span className="text-sm text-gray-500">•</span>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
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

                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-gray-400" />
                      <span className="text-gray-600">
                        <span className="font-semibold text-gray-900">{session.totalDetected}</span>
                        /{session.totalStudents} detected
                      </span>
                    </div>
                    <div
                      className={`font-semibold ${
                        parseFloat(attendanceRate) >= 80
                          ? 'text-green-600'
                          : parseFloat(attendanceRate) >= 60
                            ? 'text-yellow-600'
                            : 'text-red-600'
                      }`}
                    >
                      {attendanceRate}% attendance
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-gray-500">Photo: {session.photoName}</div>
                </div>

                <button
                  onClick={() => onViewDetails(session)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  <Eye size={16} />
                  View Details
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AIAttendanceHistory;

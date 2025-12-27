import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';

export type AttendanceSession = {
  id: number;
  date: string;
  present: number;
  absent: number;
};

type AttendanceTableProps = {
  sessions: AttendanceSession[];
  onCreate: () => void;
  onEdit: (session: AttendanceSession) => void;
  onDelete: (id: number) => void;
};

export function AttendanceTable({ sessions, onCreate, onEdit, onDelete }: AttendanceTableProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSessions = sessions.filter((session) => session.date.includes(searchTerm));

  return (
    <div className="rounded-lg border bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Attendance Records</h3>
        <button
          onClick={onCreate}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          <Plus size={18} />
          Add Record
        </button>
      </div>

      <div className="mb-4 relative">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={18}
        />
        <input
          type="text"
          placeholder="Search by date..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Present</th>
              <th className="p-2 text-left">Absent</th>
              <th className="p-2 text-left">Total</th>
              <th className="p-2 text-left">Attendance %</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSessions.map((s) => {
              const total = s.present + s.absent;
              const percentage = total > 0 ? ((s.present / total) * 100).toFixed(1) : '0.0';
              return (
                <tr key={s.id} className="border-t hover:bg-gray-50">
                  <td className="p-2 font-medium">{s.date}</td>
                  <td className="p-2 text-green-700 font-medium">{s.present}</td>
                  <td className="p-2 text-red-700 font-medium">{s.absent}</td>
                  <td className="p-2">{total}</td>
                  <td className="p-2">
                    <span
                      className={`px-2 py-1 rounded text-xs ${parseFloat(percentage) >= 80 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}
                    >
                      {percentage}%
                    </span>
                  </td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(s)}
                        className="p-1 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(s.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredSessions.length === 0 && (
              <tr>
                <td className="p-4 text-center text-gray-500" colSpan={6}>
                  {searchTerm
                    ? 'No attendance records match your search.'
                    : 'No attendance records.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AttendanceTable;

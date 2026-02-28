import React, { useState } from 'react';
import { Check, X, AlertTriangle, Save, Download, Edit2 } from 'lucide-react';
import { ConfidenceIndicator } from '../shared';
import { useTheme } from '../../../contexts/ThemeContext';

interface AttendanceResult {
  studentId: number;
  studentName: string;
  status: 'present' | 'absent' | 'uncertain';
  confidence: number;
  manualOverride?: boolean;
}

interface AIAttendanceResultsProps {
  results: AttendanceResult[];
  courseSection: string;
  photoName: string;
  totalDetected: number;
  totalStudents: number;
  onSave: (results: AttendanceResult[]) => void;
  onCancel: () => void;
}

export function AIAttendanceResults({
  results: initialResults,
  courseSection,
  photoName,
  totalDetected,
  totalStudents,
  onSave,
  onCancel,
}: AIAttendanceResultsProps) {
  const [results, setResults] = useState(initialResults);
  const [editMode, setEditMode] = useState(false);
  const { isDark, primaryHex = '#4f46e5' } = useTheme() as any;

  const handleStatusChange = (studentId: number, newStatus: 'present' | 'absent' | 'uncertain') => {
    setResults(
      results.map((r) =>
        r.studentId === studentId ? { ...r, status: newStatus, manualOverride: true } : r
      )
    );
  };

  const handleSave = () => {
    onSave(results);
  };

  const handleExport = () => {
    // Create CSV content
    const csvContent = [
      ['Student ID', 'Student Name', 'Status', 'Confidence', 'Manual Override'],
      ...results.map((r) => [
        r.studentId,
        r.studentName,
        r.status,
        r.manualOverride ? 'Manual' : r.confidence + '%',
        r.manualOverride ? 'Yes' : 'No',
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${courseSection.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const presentCount = results.filter((r) => r.status === 'present').length;
  const absentCount = results.filter((r) => r.status === 'absent').length;
  const uncertainCount = results.filter((r) => r.status === 'uncertain').length;

  // Separate students by status for prioritization
  const uncertainStudents = results.filter((r) => r.status === 'uncertain');
  const absentStudents = results.filter((r) => r.status === 'absent');
  const presentStudents = results.filter((r) => r.status === 'present');

  const renderStudentRow = (result: AttendanceResult) => (
    <tr
      key={result.studentId}
      className={`transition-colors ${isDark ? 'hover:bg-white/5 border-b border-white/5' : 'hover:bg-gray-50 border-b border-gray-100'}`}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
              {result.studentName
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </span>
          </div>
          <div className="ml-4">
            <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {result.studentName}
            </div>
            <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              ID: {result.studentId}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          {result.status === 'present' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              <Check size={16} className="mr-1" />
              Present
            </span>
          )}
          {result.status === 'absent' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
              <X size={16} className="mr-1" />
              Absent
            </span>
          )}
          {result.status === 'uncertain' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
              <AlertTriangle size={16} className="mr-1" />
              Uncertain
            </span>
          )}
          {result.manualOverride && (
            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-medium">
              Manual
            </span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {result.manualOverride ? (
          <span className="text-sm px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">
            Manual Override
          </span>
        ) : result.status !== 'absent' ? (
          <ConfidenceIndicator confidence={result.confidence} showLabel={false} size="sm" />
        ) : (
          <span className="text-sm text-gray-400">N/A</span>
        )}
      </td>
      {editMode && (
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex gap-2">
            <button
              onClick={() => handleStatusChange(result.studentId, 'present')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                result.status === 'present'
                  ? 'bg-green-600 text-white'
                  : isDark
                    ? 'bg-white/5 text-slate-300 hover:bg-green-500/20 hover:text-green-400'
                    : 'bg-gray-100 text-gray-600 hover:bg-green-100'
              }`}
            >
              Present
            </button>
            <button
              onClick={() => handleStatusChange(result.studentId, 'absent')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                result.status === 'absent'
                  ? 'bg-red-600 text-white'
                  : isDark
                    ? 'bg-white/5 text-slate-300 hover:bg-red-500/20 hover:text-red-400'
                    : 'bg-gray-100 text-gray-600 hover:bg-red-100'
              }`}
            >
              Absent
            </button>
          </div>
        </td>
      )}
    </tr>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} rounded-xl border p-6 shadow-sm`}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Attendance Results
            </h3>
            <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              {courseSection} • {photoName}
            </p>
          </div>
          <button
            onClick={() => setEditMode(!editMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isDark ? 'text-indigo-400 hover:bg-white/10' : 'text-indigo-600 hover:bg-indigo-50'}`}
          >
            <Edit2 size={16} />
            {editMode ? 'View Mode' : 'Edit Mode'}
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div
            className={`${isDark ? 'bg-black/20 border-white/5' : 'bg-gray-50 border-gray-200'} rounded-lg p-4 border`}
          >
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {totalStudents}
            </div>
            <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              Total Students
            </div>
          </div>
          <div
            className={`${isDark ? 'bg-green-500/10 border-green-500/20' : 'bg-green-50 border-green-200'} rounded-lg p-4 border`}
          >
            <div className={`text-2xl font-bold ${isDark ? 'text-green-400' : 'text-green-700'}`}>
              {presentCount}
            </div>
            <div className={`text-sm ${isDark ? 'text-green-500' : 'text-green-600'}`}>Present</div>
          </div>
          <div
            className={`${isDark ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-200'} rounded-lg p-4 border`}
          >
            <div className={`text-2xl font-bold ${isDark ? 'text-red-400' : 'text-red-700'}`}>
              {absentCount}
            </div>
            <div className={`text-sm ${isDark ? 'text-red-500' : 'text-red-600'}`}>Absent</div>
          </div>
          <div
            className={`${isDark ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-yellow-50 border-yellow-200'} rounded-lg p-4 border`}
          >
            <div className={`text-2xl font-bold ${isDark ? 'text-yellow-400' : 'text-yellow-700'}`}>
              {uncertainCount}
            </div>
            <div className={`text-sm ${isDark ? 'text-yellow-500' : 'text-yellow-600'}`}>
              Uncertain
            </div>
          </div>
        </div>
      </div>

      {/* Priority Section - Uncertain & Absent Students */}
      {(uncertainStudents.length > 0 || absentStudents.length > 0) && (
        <div
          className={`${isDark ? 'bg-yellow-500/5 border-yellow-500/20' : 'bg-yellow-50 border-yellow-300'} border-2 rounded-xl p-6`}
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className={isDark ? 'text-yellow-500' : 'text-yellow-600'} size={20} />
            <h4
              className={`text-lg font-semibold ${isDark ? 'text-yellow-400' : 'text-yellow-900'}`}
            >
              Needs Review ({uncertainStudents.length + absentStudents.length} students)
            </h4>
          </div>
          <p className={`text-sm mb-4 ${isDark ? 'text-yellow-200/70' : 'text-yellow-800'}`}>
            These students require your attention. Please verify their attendance status.
          </p>

          <div
            className={`${isDark ? 'bg-black/20 border-yellow-500/20' : 'bg-white border-yellow-200'} rounded-lg border shadow-sm overflow-hidden`}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead
                  className={`${isDark ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-yellow-100 border-yellow-200'} border-b`}
                >
                  <tr>
                    <th
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-yellow-500' : 'text-yellow-900'}`}
                    >
                      Student
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-yellow-500' : 'text-yellow-900'}`}
                    >
                      Status
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-yellow-500' : 'text-yellow-900'}`}
                    >
                      Confidence
                    </th>
                    {editMode && (
                      <th
                        className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-yellow-500' : 'text-yellow-900'}`}
                      >
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-transparent">
                  {uncertainStudents.map(renderStudentRow)}
                  {absentStudents.map(renderStudentRow)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* All Students Table */}
      <div
        className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} rounded-xl border shadow-sm overflow-hidden`}
      >
        <div
          className={`px-6 py-4 border-b ${isDark ? 'border-white/10 bg-black/20' : 'border-gray-200 bg-gray-50'}`}
        >
          <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            All Students ({presentStudents.length} Present)
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead
              className={`${isDark ? 'bg-black/20 border-white/10' : 'bg-gray-50 border-gray-200'} border-b`}
            >
              <tr>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-gray-500'}`}
                >
                  Student
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-gray-500'}`}
                >
                  Status
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-gray-500'}`}
                >
                  Confidence
                </th>
                {editMode && (
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-gray-500'}`}
                  >
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-transparent">
              {presentStudents.map(renderStudentRow)}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          onClick={handleExport}
          className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors w-full sm:w-auto justify-center ${
            isDark
              ? 'border-white/10 text-slate-300 hover:bg-white/10'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Download size={18} />
          Export to Excel/CSV
        </button>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={onCancel}
            className={`flex-1 sm:flex-none px-6 py-2 border rounded-lg transition-colors ${
              isDark
                ? 'border-white/10 text-slate-300 hover:bg-white/10'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 text-white rounded-lg transition-colors"
            style={{ backgroundColor: primaryHex }}
          >
            <Save size={18} />
            Save Attendance
          </button>
        </div>
      </div>
    </div>
  );
}

export default AIAttendanceResults;

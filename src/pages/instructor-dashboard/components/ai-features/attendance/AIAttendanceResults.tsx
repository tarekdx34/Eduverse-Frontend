import React, { useState } from 'react';
import { Check, X, AlertTriangle, Save, Download, Edit2 } from 'lucide-react';
import { ConfidenceIndicator } from '../shared';

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
    <tr key={result.studentId} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-indigo-600 font-semibold">
              {result.studentName
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </span>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{result.studentName}</div>
            <div className="text-sm text-gray-500">ID: {result.studentId}</div>
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
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Attendance Results</h3>
            <p className="text-sm text-gray-500 mt-1">
              {courseSection} • {photoName}
            </p>
          </div>
          <button
            onClick={() => setEditMode(!editMode)}
            className="flex items-center gap-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            <Edit2 size={16} />
            {editMode ? 'View Mode' : 'Edit Mode'}
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{totalStudents}</div>
            <div className="text-sm text-gray-600">Total Students</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="text-2xl font-bold text-green-700">{presentCount}</div>
            <div className="text-sm text-green-600">Present</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <div className="text-2xl font-bold text-red-700">{absentCount}</div>
            <div className="text-sm text-red-600">Absent</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-700">{uncertainCount}</div>
            <div className="text-sm text-yellow-600">Uncertain</div>
          </div>
        </div>
      </div>

      {/* Priority Section - Uncertain & Absent Students */}
      {(uncertainStudents.length > 0 || absentStudents.length > 0) && (
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="text-yellow-600" size={20} />
            <h4 className="text-lg font-semibold text-yellow-900">
              Needs Review ({uncertainStudents.length + absentStudents.length} students)
            </h4>
          </div>
          <p className="text-sm text-yellow-800 mb-4">
            These students require your attention. Please verify their attendance status.
          </p>

          <div className="bg-white rounded-lg border border-yellow-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-yellow-100 border-b border-yellow-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-yellow-900 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-yellow-900 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-yellow-900 uppercase tracking-wider">
                      Confidence
                    </th>
                    {editMode && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-yellow-900 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {uncertainStudents.map(renderStudentRow)}
                  {absentStudents.map(renderStudentRow)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* All Students Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h4 className="text-lg font-semibold text-gray-900">
            All Students ({presentStudents.length} Present)
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Confidence
                </th>
                {editMode && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {presentStudents.map(renderStudentRow)}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Download size={18} />
          Export CSV
        </button>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
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

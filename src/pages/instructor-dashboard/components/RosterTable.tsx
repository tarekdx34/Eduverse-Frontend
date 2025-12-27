import React, { useState } from 'react';
import { Search, Edit2, Trash2, ArrowUpDown, UserPlus, Mail } from 'lucide-react';

export type RosterEntry = {
  id: number;
  name: string;
  email: string;
  status: string;
  grade?: string;
};

type RosterTableProps = {
  data: RosterEntry[];
  onEdit: (student: RosterEntry) => void;
  onDelete?: (id: number) => void;
  onToggleStatus?: (id: number) => void;
};

export function RosterTable({ data, onEdit, onDelete, onToggleStatus }: RosterTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'name' | 'email' | 'status'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: 'name' | 'email' | 'status') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedData = data
    .filter((student) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        student.name.toLowerCase().includes(searchLower) ||
        student.email.toLowerCase().includes(searchLower) ||
        student.status.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === 'email') {
        comparison = a.email.localeCompare(b.email);
      } else if (sortField === 'status') {
        comparison = a.status.localeCompare(b.status);
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'enrolled':
        return 'bg-green-100 text-green-700';
      case 'auditing':
        return 'bg-blue-100 text-blue-700';
      case 'dropped':
        return 'bg-red-100 text-red-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Enrolled Students</h3>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm">
          <UserPlus size={16} />
          Add Student
        </button>
      </div>

      <div className="mb-4 relative">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={18}
        />
        <input
          type="text"
          placeholder="Search by name, email, or status..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="p-3 text-left">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-1 hover:text-indigo-600 font-semibold"
                >
                  Student Name
                  <ArrowUpDown size={14} />
                </button>
              </th>
              <th className="p-3 text-left">
                <button
                  onClick={() => handleSort('email')}
                  className="flex items-center gap-1 hover:text-indigo-600 font-semibold"
                >
                  Email
                  <ArrowUpDown size={14} />
                </button>
              </th>
              <th className="p-3 text-left">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center gap-1 hover:text-indigo-600 font-semibold"
                >
                  Status
                  <ArrowUpDown size={14} />
                </button>
              </th>
              <th className="p-3 text-left font-semibold">Grade</th>
              <th className="p-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedData.slice(0, 100).map((student) => (
              <tr key={student.id} className="border-t hover:bg-gray-50 transition-colors">
                <td className="p-3">
                  <div className="font-medium text-gray-900">{student.name}</div>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2 text-gray-600 text-xs">
                    <Mail size={14} className="text-gray-400" />
                    {student.email}
                  </div>
                </td>
                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(student.status)}`}
                  >
                    {student.status}
                  </span>
                </td>
                <td className="p-3">
                  <span className="font-medium text-gray-900">{student.grade || '-'}</span>
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(student)}
                      className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                      title="Edit Student"
                    >
                      <Edit2 size={16} />
                    </button>
                    {onToggleStatus && (
                      <button
                        onClick={() => onToggleStatus(student.id)}
                        className="px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded transition-colors border border-gray-300"
                        title="Toggle Status"
                      >
                        Toggle Status
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(student.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Remove Student"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredAndSortedData.length === 0 && (
              <tr>
                <td className="p-6 text-center text-gray-500" colSpan={5}>
                  {searchTerm ? 'No students match your search.' : 'No students enrolled.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {filteredAndSortedData.length > 100 && (
          <div className="mt-4 text-sm text-gray-500 text-center">
            Showing first 100 of {filteredAndSortedData.length} results
          </div>
        )}
      </div>
    </div>
  );
}

export default RosterTable;

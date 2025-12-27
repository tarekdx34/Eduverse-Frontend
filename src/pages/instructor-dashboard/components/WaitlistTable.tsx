import React, { useState } from 'react';
import { Search, ArrowUpDown, UserCheck, UserX, Mail, Calendar } from 'lucide-react';

export type WaitlistEntry = {
  id: number;
  name: string;
  email: string;
  requestedAt: string;
  priority?: number;
};

type WaitlistTableProps = {
  data: WaitlistEntry[];
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
};

export function WaitlistTable({ data, onApprove, onReject }: WaitlistTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'name' | 'email' | 'requestedAt'>('requestedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: 'name' | 'email' | 'requestedAt') => {
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
        student.requestedAt.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === 'email') {
        comparison = a.email.localeCompare(b.email);
      } else if (sortField === 'requestedAt') {
        comparison = new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime();
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Waitlist</h3>
          <p className="text-sm text-gray-600 mt-1">
            {data.length} student{data.length !== 1 ? 's' : ''} waiting for enrollment
          </p>
        </div>
      </div>

      <div className="mb-4 relative">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={18}
        />
        <input
          type="text"
          placeholder="Search by name, email, or date..."
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
                  onClick={() => handleSort('requestedAt')}
                  className="flex items-center gap-1 hover:text-indigo-600 font-semibold"
                >
                  Requested Date
                  <ArrowUpDown size={14} />
                </button>
              </th>
              <th className="p-3 text-left font-semibold">Priority</th>
              <th className="p-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedData.slice(0, 100).map((student, index) => (
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
                  <div className="flex items-center gap-2 text-gray-600 text-xs">
                    <Calendar size={14} className="text-gray-400" />
                    {student.requestedAt}
                  </div>
                </td>
                <td className="p-3">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                    #{student.priority || index + 1}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    {onApprove && (
                      <button
                        onClick={() => onApprove(student.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-green-700 bg-green-50 hover:bg-green-100 rounded transition-colors border border-green-200"
                        title="Approve & Enroll"
                      >
                        <UserCheck size={14} />
                        Approve
                      </button>
                    )}
                    {onReject && (
                      <button
                        onClick={() => onReject(student.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-700 bg-red-50 hover:bg-red-100 rounded transition-colors border border-red-200"
                        title="Reject Request"
                      >
                        <UserX size={14} />
                        Reject
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredAndSortedData.length === 0 && (
              <tr>
                <td className="p-6 text-center text-gray-500" colSpan={5}>
                  {searchTerm ? 'No students match your search.' : 'No students on waitlist.'}
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

export default WaitlistTable;

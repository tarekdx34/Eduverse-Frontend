import React, { useState } from 'react';
import { Search, Edit2, Trash2, ArrowUpDown } from 'lucide-react';

export type GradeEntry = {
  id: number;
  student: string;
  email: string;
  assignment: string;
  score: number;
  grade: string;
};

type GradesTableProps = {
  data: GradeEntry[];
  onEdit: (grade: GradeEntry) => void;
  onDelete: (id: number) => void;
};

export function GradesTable({ data, onEdit, onDelete }: GradesTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'student' | 'assignment' | 'score'>('student');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: 'student' | 'assignment' | 'score') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedData = data
    .filter((grade) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        grade.student.toLowerCase().includes(searchLower) ||
        grade.assignment.toLowerCase().includes(searchLower) ||
        grade.email.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === 'student') {
        comparison = a.student.localeCompare(b.student);
      } else if (sortField === 'assignment') {
        comparison = a.assignment.localeCompare(b.assignment);
      } else if (sortField === 'score') {
        comparison = a.score - b.score;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  return (
    <div className="rounded-lg border bg-white p-6">
      <h3 className="text-lg font-semibold mb-4">Grades</h3>

      <div className="mb-4 relative">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={18}
        />
        <input
          type="text"
          placeholder="Search by student, assignment, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="p-2 text-left">
                <button
                  onClick={() => handleSort('student')}
                  className="flex items-center gap-1 hover:text-indigo-600"
                >
                  Student
                  <ArrowUpDown size={14} />
                </button>
              </th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">
                <button
                  onClick={() => handleSort('assignment')}
                  className="flex items-center gap-1 hover:text-indigo-600"
                >
                  Assignment
                  <ArrowUpDown size={14} />
                </button>
              </th>
              <th className="p-2 text-left">
                <button
                  onClick={() => handleSort('score')}
                  className="flex items-center gap-1 hover:text-indigo-600"
                >
                  Score
                  <ArrowUpDown size={14} />
                </button>
              </th>
              <th className="p-2 text-left">Grade</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedData.slice(0, 100).map((g) => (
              <tr key={g.id} className="border-t hover:bg-gray-50">
                <td className="p-2">{g.student}</td>
                <td className="p-2 text-gray-600 text-xs">{g.email}</td>
                <td className="p-2">{g.assignment}</td>
                <td className="p-2 font-medium">{g.score}</td>
                <td className="p-2">
                  <span className="px-2 py-1 rounded bg-indigo-100 text-indigo-700 text-xs font-medium">
                    {g.grade}
                  </span>
                </td>
                <td className="p-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(g)}
                      className="p-1 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(g.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredAndSortedData.length === 0 && (
              <tr>
                <td className="p-4 text-center text-gray-500" colSpan={6}>
                  {searchTerm ? 'No grades match your search.' : 'No grades recorded.'}
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

export default GradesTable;

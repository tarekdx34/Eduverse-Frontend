import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export type AssignmentItem = {
  id: number;
  title: string;
  dueDate: string;
  submissions: number;
  status: 'draft' | 'open' | 'closed';
};

type AssignmentsListProps = {
  data: AssignmentItem[];
  onEdit: (assignment: AssignmentItem) => void;
  onDelete: (id: number) => void;
  onCreate: () => void;
  onStatusChange: (id: number, newStatus: 'draft' | 'open' | 'closed') => void;
};

export function AssignmentsList({
  data,
  onEdit,
  onDelete,
  onCreate,
  onStatusChange,
}: AssignmentsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'open' | 'closed'>('all');
  const { isDark } = useTheme();

  const filteredData = data.filter((assignment) => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || assignment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className={`rounded-lg border p-6 ${isDark ? 'bg-card-dark border-white/10' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Assignments</h3>
        <button
          onClick={onCreate}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          <Plus size={18} />
          Create Assignment
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <Search
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}
            size={18}
          />
          <input
            type="text"
            placeholder="Search assignments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              isDark ? 'bg-white/5 border-white/10 text-slate-200 placeholder:text-slate-500' : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as 'all' | 'draft' | 'open' | 'closed')}
          className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            isDark ? 'bg-white/5 border-white/10 text-slate-200' : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredData.map((a) => (
          <div
            key={a.id}
            className={`border rounded-lg p-4 shadow-sm hover:shadow-md transition-all ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className={`font-semibold flex-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{a.title}</div>
              <div className="flex gap-1 ml-2">
                <button
                  onClick={() => onEdit(a)}
                  className={`p-1 text-indigo-600 rounded transition-colors ${isDark ? 'hover:bg-indigo-500/20' : 'hover:bg-indigo-50'}`}
                  title="Edit"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => onDelete(a.id)}
                  className={`p-1 text-red-600 rounded transition-colors ${isDark ? 'hover:bg-red-500/20' : 'hover:bg-red-50'}`}
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className={`text-xs mb-2 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>Due: {a.dueDate}</div>
            <div className={`text-sm mb-2 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Submissions: {a.submissions}</div>
            <div className="mb-3">
              <span
                className={`px-2 py-1 rounded text-xs ${
                  a.status === 'open'
                    ? 'bg-green-100 text-green-700'
                    : a.status === 'closed'
                      ? isDark ? 'bg-white/10 text-slate-300' : 'bg-gray-200 text-gray-700'
                      : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {a.status.toUpperCase()}
              </span>
            </div>
            <div className="flex gap-2">
              {a.status !== 'open' && (
                <button
                  onClick={() => onStatusChange(a.id, 'open')}
                  className="flex-1 text-xs px-3 py-2 rounded bg-green-50 text-green-700 border border-green-100 hover:bg-green-100 transition-colors"
                >
                  Open
                </button>
              )}
              {a.status !== 'closed' && (
                <button
                  onClick={() => onStatusChange(a.id, 'closed')}
                  className={`flex-1 text-xs px-3 py-2 rounded border hover:opacity-80 transition-colors ${
                    isDark ? 'bg-white/5 text-slate-300 border-white/10' : 'bg-gray-50 text-gray-700 border-gray-200'
                  }`}
                >
                  Close
                </button>
              )}
            </div>
          </div>
        ))}
        {filteredData.length === 0 && (
          <div className={`col-span-full text-center py-8 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
            {searchTerm || filterStatus !== 'all'
              ? 'No assignments match your search.'
              : 'No assignments for this section.'}
          </div>
        )}
      </div>
    </div>
  );
}

export default AssignmentsList;

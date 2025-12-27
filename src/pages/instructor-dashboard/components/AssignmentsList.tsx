import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';

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

  const filteredData = data.filter((assignment) => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || assignment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="rounded-lg border bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Assignments</h3>
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
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search assignments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as 'all' | 'draft' | 'open' | 'closed')}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="font-semibold flex-1">{a.title}</div>
              <div className="flex gap-1 ml-2">
                <button
                  onClick={() => onEdit(a)}
                  className="p-1 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                  title="Edit"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => onDelete(a.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="text-xs text-gray-500 mb-2">Due: {a.dueDate}</div>
            <div className="text-sm text-gray-600 mb-2">Submissions: {a.submissions}</div>
            <div className="mb-3">
              <span
                className={`px-2 py-1 rounded text-xs ${
                  a.status === 'open'
                    ? 'bg-green-100 text-green-700'
                    : a.status === 'closed'
                      ? 'bg-gray-200 text-gray-700'
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
                  className="flex-1 text-xs px-3 py-2 rounded bg-gray-50 text-gray-700 border hover:bg-gray-100 transition-colors"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        ))}
        {filteredData.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-8">
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

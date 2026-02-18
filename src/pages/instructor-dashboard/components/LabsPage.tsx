import React, { useState } from 'react';
import { Beaker, Users, TrendingUp, Upload, Sparkles, Search, Eye, Edit } from 'lucide-react';
import { CustomDropdown } from './CustomDropdown';
import { useTheme } from '../contexts/ThemeContext';

export function LabsPage() {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-transparent' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with filters */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Labs Management</h1>
            <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              Create labs, manage submissions, track attendance, and use AI to assist lab
              evaluation.
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            <Beaker size={20} />
            Create New Lab
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <CustomDropdown
            label="Course:"
            value="all"
            options={[
              { value: 'all', label: 'All Courses' },
              { value: 'physics', label: 'Physics I' },
              { value: 'chemistry', label: 'Chemistry I' },
            ]}
            onChange={() => {}}
          />
          <CustomDropdown
            label="Status:"
            value="active"
            options={[
              { value: 'all', label: 'All' },
              { value: 'active', label: 'Active' },
              { value: 'graded', label: 'Graded' },
            ]}
            onChange={() => {}}
          />
          <div className="relative flex-1 max-w-md">
            <Search
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}
              size={18}
            />
            <input
              type="text"
              placeholder="Search labs..."
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500' : 'border-gray-300 bg-white'}`}
            />
          </div>
        </div>

        {/* Lab Cards */}
        <div className="space-y-4">
          {[
            {
              title: 'Lab 2 — Electric Fields',
              subject: 'Physics I',
              subjectColor: isDark ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700',
              dueDate: 'Due May 14, 2025',
              submitted: 28,
              total: 43,
              attendance: 89,
              description:
                'Measure electric field strength and visualize field lines using charged particles.',
              status: 'Active',
              statusColor: isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700',
            },
            {
              title: 'Lab 3 — Chemical Reactions',
              subject: 'Chemistry I',
              subjectColor: isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-700',
              dueDate: 'Due May 15, 2025',
              submitted: 15,
              total: 38,
              attendance: 92,
              description: 'Observe and document exothermic and endothermic chemical reactions.',
              status: 'Pending',
              statusColor: isDark ? 'bg-yellow-500/20 text-yellow-300' : 'bg-yellow-100 text-yellow-700',
            },
            {
              title: 'Lab 4 — Data Structures Implementation',
              subject: 'Computer Science',
              subjectColor: isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700',
              dueDate: 'Due May 18, 2025',
              submitted: 42,
              total: 48,
              attendance: 95,
              description:
                'Implement linked lists, stacks, and queues in Python with performance analysis.',
              status: 'Active',
              statusColor: isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700',
            },
          ].map((lab, index) => (
            <div key={index} className={`rounded-xl p-6 border shadow-sm ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
              <div className="flex items-start gap-4">
                <div className={`w-24 h-24 rounded-lg flex items-center justify-center ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                  <Beaker size={32} className={isDark ? 'text-slate-400' : 'text-gray-400'} />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{lab.title}</h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${lab.subjectColor}`}
                        >
                          {lab.subject}
                        </span>
                      </div>
                      <div className={`text-sm mb-3 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>{lab.dueDate}</div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${lab.statusColor}`}
                    >
                      {lab.status}
                    </span>
                  </div>
                  <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>{lab.description}</p>
                  <div className="flex items-center gap-6 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Users size={16} className={isDark ? 'text-slate-500' : 'text-gray-400'} />
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {lab.submitted}/{lab.total}
                      </span>
                      <span className={isDark ? 'text-slate-400' : 'text-gray-600'}>Submitted</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp size={16} className="text-green-600" />
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{lab.attendance}%</span>
                      <span className={isDark ? 'text-slate-400' : 'text-gray-600'}>Attendance</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${isDark ? 'text-slate-300 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-50'}`}>
                      <Eye size={16} />
                      View Submissions
                    </button>
                    <button className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${isDark ? 'text-slate-300 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-50'}`}>
                      <Edit size={16} />
                      Edit Lab
                    </button>
                    <button className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${isDark ? 'text-slate-300 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-50'}`}>
                      <Upload size={16} />
                      Upload Instructions
                    </button>
                    <button className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${isDark ? 'text-slate-300 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-50'}`}>
                      Grade Lab
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                      <Sparkles size={16} />
                      AI Auto-Grading
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LabsPage;

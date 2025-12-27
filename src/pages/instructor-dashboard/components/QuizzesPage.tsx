import React, { useState } from 'react';
import {
  ClipboardList,
  Users,
  Calendar,
  Clock,
  BarChart3,
  Sparkles,
  Search,
  Eye,
  Edit,
} from 'lucide-react';
import { CustomDropdown } from './CustomDropdown';

export function QuizzesPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quizzes Management</h1>
            <p className="text-gray-600 mt-1">
              Create quizzes, manage attempts, auto-generate questions, and review student
              performance.
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            <ClipboardList size={20} />
            Create New Quiz
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <CustomDropdown
            label="Course:"
            value="all"
            options={[
              { value: 'all', label: 'All Courses' },
              { value: 'calculus', label: 'Calculus I' },
              { value: 'physics', label: 'Physics I' },
            ]}
            onChange={() => {}}
          />
          <CustomDropdown
            label="Status:"
            value="active"
            options={[
              { value: 'all', label: 'All' },
              { value: 'active', label: 'Active' },
              { value: 'closed', label: 'Closed' },
            ]}
            onChange={() => {}}
          />
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search quizzes..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Quiz Cards */}
        <div className="space-y-4">
          {[
            {
              title: 'Quiz 3 — Derivatives',
              subject: 'Calculus II',
              subjectColor: 'bg-blue-100 text-blue-700',
              date: 'May 14, 10:00 AM',
              questions: 12,
              attempted: 52,
              total: 52,
              difficulty: 'Medium',
              difficultyColor: 'bg-yellow-100 text-yellow-700',
              duration: 30,
              status: 'Active',
              statusColor: 'bg-green-100 text-green-700',
            },
            {
              title: 'Quiz 2 — Limits and Continuity',
              subject: 'Calculus I',
              subjectColor: 'bg-blue-100 text-blue-700',
              date: 'May 10, 10:00 AM',
              questions: 10,
              attempted: 52,
              total: 52,
              difficulty: 'Easy',
              difficultyColor: 'bg-green-100 text-green-700',
              duration: 25,
              status: 'Closed',
              statusColor: 'bg-gray-100 text-gray-700',
            },
            {
              title: 'Quiz 4 — Kinematics',
              subject: 'Physics I',
              subjectColor: 'bg-purple-100 text-purple-700',
              date: 'May 18, 2:00 PM',
              questions: 15,
              attempted: 0,
              total: 43,
              difficulty: 'Hard',
              difficultyColor: 'bg-red-100 text-red-700',
              duration: 45,
              status: 'Scheduled',
              statusColor: 'bg-blue-100 text-blue-700',
            },
          ].map((quiz, index) => (
            <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{quiz.title}</h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${quiz.subjectColor}`}
                    >
                      {quiz.subject}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <Calendar size={14} />
                    <span>{quiz.date}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-sm">
                      <ClipboardList size={16} className="text-gray-400" />
                      <span className="text-gray-900 font-medium">{quiz.questions}</span>
                      <span className="text-gray-600">Questions</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users size={16} className="text-gray-400" />
                      <span className="text-gray-900 font-medium">
                        {quiz.attempted}/{quiz.total}
                      </span>
                      <span className="text-gray-600">Attempted</span>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${quiz.difficultyColor}`}
                    >
                      {quiz.difficulty}
                    </span>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock size={16} className="text-gray-400" />
                      <span className="text-gray-600">{quiz.duration} min Duration</span>
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${quiz.statusColor}`}>
                  {quiz.status}
                </span>
              </div>
              <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  <Eye size={16} />
                  View Attempts
                </button>
                <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  <Edit size={16} />
                  Edit Quiz
                </button>
                <button className="flex items-center gap-2 px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                  <Sparkles size={16} />
                  Generate with AI
                </button>
                <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  <BarChart3 size={16} />
                  Analyze Results
                </button>
                {quiz.status === 'Scheduled' && (
                  <button className="flex items-center gap-2 px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors ml-auto">
                    Publish
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default QuizzesPage;

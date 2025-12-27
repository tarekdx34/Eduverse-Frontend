import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  AlertTriangle,
  Sparkles,
  MessageSquare,
  BookOpen,
  Target,
} from 'lucide-react';
import { CustomDropdown } from './CustomDropdown';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const performanceData = [
  { week: 'Week 1', grade: 78 },
  { week: 'Week 2', grade: 82 },
  { week: 'Week 3', grade: 80 },
  { week: 'Week 4', grade: 85 },
  { week: 'Week 5', grade: 83 },
  { week: 'Week 6', grade: 87 },
];

const engagementData = [
  { week: 'Week 1', lectures: 85, labs: 72, assignments: 78 },
  { week: 'Week 2', lectures: 88, labs: 75, assignments: 82 },
  { week: 'Week 3', lectures: 82, labs: 78, assignments: 80 },
  { week: 'Week 4', lectures: 90, labs: 82, assignments: 85 },
  { week: 'Week 5', lectures: 87, labs: 80, assignments: 83 },
  { week: 'Week 6', lectures: 92, labs: 85, assignments: 88 },
];

const attendanceData = [
  { name: 'Calculus', value: 88 },
  { name: 'Labs', value: 85 },
  { name: 'Sections', value: 82 },
];

const courseComparisonData = [
  { course: 'Calculus I', value: 85 },
  { course: 'Physics I', value: 78 },
  { course: 'CS', value: 82 },
  { course: 'Logic Design', value: 80 },
];

export function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600 mt-1">
              Track course performance, student progress, engagement, and AI insights.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <CustomDropdown
            label="Course:"
            value="calculus"
            options={[
              { value: 'calculus', label: 'Calculus I' },
              { value: 'physics', label: 'Physics I' },
              { value: 'all', label: 'All Courses' },
            ]}
            onChange={() => {}}
          />
          <CustomDropdown
            label="Teachings:"
            value="this-month"
            options={[
              { value: 'this-week', label: 'This Week' },
              { value: 'this-month', label: 'This Month' },
              { value: 'this-semester', label: 'This Semester' },
            ]}
            onChange={() => {}}
          />
          <CustomDropdown
            label="Analytics Type:"
            value="all"
            options={[
              { value: 'all', label: 'All Metrics' },
              { value: 'performance', label: 'Performance' },
              { value: 'engagement', label: 'Engagement' },
            ]}
            onChange={() => {}}
          />
        </div>

        {/* Top Row - Performance and Engagement */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Course Performance Overview */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Course Performance Overview</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-600">Average Grade:</span>
                <span className="text-sm font-semibold text-gray-900">82%</span>
                <span className="text-xs text-green-600">↑ +5.8% this month</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} domain={[70, 100]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="grade"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ fill: '#6366f1' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Engagement Analytics */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Engagement Analytics</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-600">Engagement Rate:</span>
                <span className="text-sm font-semibold text-gray-900">76%</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} domain={[60, 100]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="lectures"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Lectures"
                />
                <Line type="monotone" dataKey="labs" stroke="#f59e0b" strokeWidth={2} name="Labs" />
                <Line
                  type="monotone"
                  dataKey="assignments"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="Assignments"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Middle Row - Attendance, Low Performance, Students at Risk */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Attendance Overview */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="text-green-600" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Attendance Overview</h3>
                <p className="text-sm text-gray-600">88% Average</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Low-Performance Topics */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="text-orange-600" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Low-Performance Topics</h3>
                <p className="text-sm text-gray-600">4 Detected</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { topic: 'Derivatives Applications', score: 62 },
                { topic: 'Electric Fields', score: 58 },
                { topic: 'Problems in C', score: 55 },
                { topic: 'Phase Voltage Design', score: 54 },
              ].map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700">{item.topic}</span>
                    <span className="text-sm font-semibold text-orange-600">{item.score}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full"
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Students at Risk */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="text-red-600" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Students at Risk</h3>
                <p className="text-sm text-gray-600">5 flagged students</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                {
                  name: 'James Rodriguez',
                  issue: 'Low attendance, low grade',
                  color: 'bg-blue-500',
                },
                { name: 'Sarah Lee', issue: 'Missing assignments', color: 'bg-purple-500' },
                { name: 'Alex Kim', issue: 'Low engagement', color: 'bg-green-500' },
                { name: 'Tom Wilson', issue: 'Failing quizzes', color: 'bg-orange-500' },
                { name: 'Lisa Chen', issue: 'Lab absences', color: 'bg-pink-500' },
              ].map((student, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 ${student.color} rounded-full flex items-center justify-center text-white text-xs font-semibold`}
                  >
                    {student.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{student.name}</div>
                    <div className="text-xs text-gray-600">{student.issue}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
              <button className="flex-1 text-sm text-gray-700 hover:bg-gray-50 py-2 rounded-lg transition-colors">
                View All
              </button>
              <button className="flex-1 text-sm text-indigo-600 bg-indigo-50 hover:bg-indigo-100 py-2 rounded-lg transition-colors">
                Message
              </button>
            </div>
          </div>
        </div>

        {/* Course Comparison */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Comparison</h3>
          <p className="text-sm text-gray-600 mb-4">Average Completion Rate by Course</p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={courseComparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="course" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* AI Insights */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="text-purple-600" size={24} />
            <h3 className="text-lg font-semibold text-gray-900">AI Insights — Powered by Evy</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="text-green-600" size={16} />
                <span className="text-sm font-semibold text-gray-900">Performance Improvement</span>
              </div>
              <p className="text-xs text-gray-600">Your students improved by 6% this month.</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="text-orange-600" size={16} />
                <span className="text-sm font-semibold text-gray-900">Struggling Topic</span>
              </div>
              <p className="text-xs text-gray-600">
                56% of students struggle with derivative applications.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="text-blue-600" size={16} />
                <span className="text-sm font-semibold text-gray-900">Recommendation</span>
              </div>
              <p className="text-xs text-gray-600">
                Recommend 3 extra practice sessions this week.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="text-purple-600" size={16} />
                <span className="text-sm font-semibold text-gray-900">Generate Teaching Plan</span>
              </div>
              <p className="text-xs text-gray-600">Let AI create a personalized plan.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">
              <Sparkles size={16} />
              Generate Teaching Plan
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-purple-200 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors text-sm">
              <MessageSquare size={16} />
              Send Feedback to Students
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsPage;

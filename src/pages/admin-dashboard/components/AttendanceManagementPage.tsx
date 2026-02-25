import React, { useState } from 'react';
import { Users, CheckCircle, XCircle, Clock, TrendingUp, Search, Filter, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const weeklyTrendsData = [
  { day: 'Mon', rate: 85 },
  { day: 'Tue', rate: 88 },
  { day: 'Wed', rate: 82 },
  { day: 'Thu', rate: 90 },
  { day: 'Fri', rate: 87 },
  { day: 'Sat', rate: 78 },
  { day: 'Sun', rate: 83 },
];

const departmentStats = [
  { name: 'Computer Science', rate: 91 },
  { name: 'Engineering', rate: 87 },
  { name: 'Business', rate: 84 },
  { name: 'Sciences', rate: 89 },
  { name: 'Arts', rate: 82 },
];

const coursesData = [
  { code: 'CS101', name: 'Intro to Programming', instructor: 'Dr. Smith', rate: 92, present: 110, total: 120, absent: 8, late: 2 },
  { code: 'CS202', name: 'Data Structures', instructor: 'Dr. Johnson', rate: 85, present: 81, total: 95, absent: 10, late: 4 },
  { code: 'ENG101', name: 'Engineering Basics', instructor: 'Dr. Lee', rate: 88, present: 106, total: 120, absent: 10, late: 4 },
  { code: 'BUS201', name: 'Business Analytics', instructor: 'Dr. Clark', rate: 79, present: 63, total: 80, absent: 12, late: 5 },
  { code: 'SCI301', name: 'Physics Lab', instructor: 'Dr. Adams', rate: 94, present: 47, total: 50, absent: 2, late: 1 },
];

const studentsData = [
  { name: 'Mohamed Ali', course: 'CS101', rate: 95, status: 'Present', risk: 'Low Risk' },
  { name: 'Fatima Ahmed', course: 'CS202', rate: 72, status: 'Absent', risk: 'High Risk' },
  { name: 'Omar Hassan', course: 'ENG101', rate: 88, status: 'Present', risk: 'Medium Risk' },
  { name: 'Sara Ibrahim', course: 'CS101', rate: 96, status: 'Present', risk: 'Low Risk' },
  { name: 'Ahmed Youssef', course: 'BUS201', rate: 65, status: 'Late', risk: 'High Risk' },
  { name: 'Layla Mohamed', course: 'SCI301', rate: 91, status: 'Present', risk: 'Low Risk' },
  { name: 'Khaled Mansour', course: 'CS303', rate: 78, status: 'Absent', risk: 'Medium Risk' },
  { name: 'Nour El-Din', course: 'CS202', rate: 85, status: 'Present', risk: 'Medium Risk' },
];

export function AttendanceManagementPage() {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'students'>('overview');
  const [courseSearch, setCourseSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [studentSearch, setStudentSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const cardClass = `rounded-xl border shadow-sm p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`;
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-500';

  const tabs = [
    { key: 'overview' as const, label: 'Overview' },
    { key: 'courses' as const, label: 'Courses' },
    { key: 'students' as const, label: 'Students' },
  ];

  const getRateColor = (rate: number) => {
    if (rate >= 90) return 'text-green-500';
    if (rate >= 80) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getRateBg = (rate: number) => {
    if (rate >= 90) return 'bg-green-500';
    if (rate >= 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Present':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'Absent':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'Late':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'Low Risk':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'Medium Risk':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'High Risk':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const filteredCourses = coursesData.filter((c) => {
    const matchesSearch = c.code.toLowerCase().includes(courseSearch.toLowerCase()) ||
      c.name.toLowerCase().includes(courseSearch.toLowerCase()) ||
      c.instructor.toLowerCase().includes(courseSearch.toLowerCase());
    const matchesDept = departmentFilter === 'All' || c.code.startsWith(departmentFilter);
    return matchesSearch && matchesDept;
  });

  const filteredStudents = studentsData.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.course.toLowerCase().includes(studentSearch.toLowerCase());
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${textPrimary}`}>Attendance Management</h1>
          <p className={textSecondary}>Monitor and manage student attendance across all courses</p>
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex gap-1 p-1 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-rose-600 text-white shadow-sm'
                : `${textSecondary} hover:${isDark ? 'text-white' : 'text-gray-900'}`
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={cardClass}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${textSecondary}`}>Total Present Today</p>
                  <p className={`text-2xl font-bold text-green-500`}>4,250</p>
                  <p className={`text-xs ${textSecondary}`}>/ 5,200 (82%)</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </div>

            <div className={cardClass}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${textSecondary}`}>Total Absent</p>
                  <p className={`text-2xl font-bold text-red-500`}>650</p>
                </div>
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <XCircle className="w-6 h-6 text-red-500" />
                </div>
              </div>
            </div>

            <div className={cardClass}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${textSecondary}`}>Late Arrivals</p>
                  <p className={`text-2xl font-bold text-yellow-500`}>300</p>
                </div>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-500" />
                </div>
              </div>
            </div>

            <div className={cardClass}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${textSecondary}`}>Average Rate</p>
                  <p className={`text-2xl font-bold text-blue-500`}>88%</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Trends Chart */}
          <div className={cardClass}>
            <h2 className={`text-lg font-semibold mb-4 ${textPrimary}`}>Weekly Attendance Trends</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyTrendsData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                <XAxis dataKey="day" stroke={isDark ? '#9ca3af' : '#6b7280'} />
                <YAxis domain={[70, 100]} stroke={isDark ? '#9ca3af' : '#6b7280'} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#1f2937' : '#ffffff',
                    border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    color: isDark ? '#ffffff' : '#111827',
                  }}
                />
                <Line type="monotone" dataKey="rate" stroke="#e11d48" strokeWidth={2} dot={{ fill: '#e11d48', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Department Statistics */}
          <div className={cardClass}>
            <h2 className={`text-lg font-semibold mb-4 ${textPrimary}`}>Department Statistics</h2>
            <div className="space-y-4">
              {departmentStats.map((dept) => (
                <div key={dept.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-medium ${textPrimary}`}>{dept.name}</span>
                    <span className={`text-sm font-semibold ${getRateColor(dept.rate)}`}>{dept.rate}%</span>
                  </div>
                  <div className={`w-full h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div
                      className={`h-2 rounded-full ${getRateBg(dept.rate)}`}
                      style={{ width: `${dept.rate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Courses Tab */}
      {activeTab === 'courses' && (
        <div className="space-y-6">
          {/* Search + Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textSecondary}`} />
              <input
                type="text"
                placeholder="Search courses..."
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                } focus:outline-none focus:ring-2 focus:ring-rose-500`}
              />
            </div>
            <div className="relative">
              <Filter className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textSecondary}`} />
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className={`pl-10 pr-8 py-2 rounded-lg border appearance-none ${
                  isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-rose-500`}
              >
                <option value="All">All Departments</option>
                <option value="CS">Computer Science</option>
                <option value="ENG">Engineering</option>
                <option value="BUS">Business</option>
                <option value="SCI">Sciences</option>
              </select>
            </div>
          </div>

          {/* Course Table */}
          <div className={`${cardClass} overflow-x-auto`}>
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <th className={`text-left py-3 px-4 text-sm font-semibold ${textSecondary}`}>Code</th>
                  <th className={`text-left py-3 px-4 text-sm font-semibold ${textSecondary}`}>Course Name</th>
                  <th className={`text-left py-3 px-4 text-sm font-semibold ${textSecondary}`}>Instructor</th>
                  <th className={`text-left py-3 px-4 text-sm font-semibold ${textSecondary}`}>Rate</th>
                  <th className={`text-left py-3 px-4 text-sm font-semibold ${textSecondary}`}>Present</th>
                  <th className={`text-left py-3 px-4 text-sm font-semibold ${textSecondary}`}>Absent</th>
                  <th className={`text-left py-3 px-4 text-sm font-semibold ${textSecondary}`}>Late</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((course) => (
                  <tr key={course.code} className={`border-b last:border-0 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <td className={`py-3 px-4 text-sm font-medium ${textPrimary}`}>{course.code}</td>
                    <td className={`py-3 px-4 text-sm ${textPrimary}`}>{course.name}</td>
                    <td className={`py-3 px-4 text-sm ${textSecondary}`}>{course.instructor}</td>
                    <td className={`py-3 px-4 text-sm font-semibold ${getRateColor(course.rate)}`}>{course.rate}%</td>
                    <td className={`py-3 px-4 text-sm ${textPrimary}`}>{course.present}/{course.total}</td>
                    <td className="py-3 px-4 text-sm text-red-500">{course.absent}</td>
                    <td className="py-3 px-4 text-sm text-yellow-500">{course.late}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Students Tab */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          {/* Search + Status Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textSecondary}`} />
              <input
                type="text"
                placeholder="Search students..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                } focus:outline-none focus:ring-2 focus:ring-rose-500`}
              />
            </div>
            <div className="relative">
              <Filter className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textSecondary}`} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`pl-10 pr-8 py-2 rounded-lg border appearance-none ${
                  isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-rose-500`}
              >
                <option value="All">All</option>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Late">Late</option>
              </select>
            </div>
          </div>

          {/* Student List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredStudents.map((student, idx) => (
              <div key={idx} className={cardClass}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                      <Users className="w-5 h-5 text-rose-500" />
                    </div>
                    <div>
                      <p className={`font-medium ${textPrimary}`}>{student.name}</p>
                      <p className={`text-sm ${textSecondary}`}>{student.course}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${getRateColor(student.rate)}`}>{student.rate}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(student.status)}`}>
                    {student.status === 'Present' && <CheckCircle className="w-3 h-3" />}
                    {student.status === 'Absent' && <XCircle className="w-3 h-3" />}
                    {student.status === 'Late' && <Clock className="w-3 h-3" />}
                    {student.status}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskBadge(student.risk)}`}>
                    {student.risk === 'High Risk' && <AlertTriangle className="w-3 h-3" />}
                    {student.risk}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AttendanceManagementPage;

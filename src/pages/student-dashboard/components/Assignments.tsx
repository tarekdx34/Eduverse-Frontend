import { 
  Calendar, 
  Clock, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Circle, 
  Filter, 
  Plus, 
  TrendingUp,
  Award,
  Target,
  ChevronRight,
  Search,
  SlidersHorizontal,
  Download,
  Eye
} from 'lucide-react';
import { useState } from 'react';

const assignments = [
  {
    id: 1,
    title: 'Database Design Project',
    course: 'Database Management Systems',
    courseCode: 'CS220',
    type: 'Project',
    dueDate: '2025-12-10',
    dueTime: '11:59 PM',
    status: 'pending',
    priority: 'high',
    description: 'Design and implement a relational database for a library management system',
    points: 100,
    submittedPoints: null,
    progress: 45,
    color: 'bg-orange-500',
    colorLight: 'bg-orange-50',
    colorBorder: 'border-orange-500'
  },
  {
    id: 2,
    title: 'Mobile App Prototype',
    course: 'Mobile Application Development',
    courseCode: 'CS350',
    type: 'Project',
    dueDate: '2025-12-08',
    dueTime: '11:59 PM',
    status: 'pending',
    priority: 'high',
    description: 'Create a functional prototype of a mobile application using React Native',
    points: 150,
    submittedPoints: null,
    progress: 60,
    color: 'bg-indigo-500',
    colorLight: 'bg-indigo-50',
    colorBorder: 'border-indigo-500'
  },
  {
    id: 3,
    title: 'Algorithm Analysis Report',
    course: 'Data Structures & Algorithms',
    courseCode: 'CS201',
    type: 'Report',
    dueDate: '2025-12-06',
    dueTime: '11:59 PM',
    status: 'in-progress',
    priority: 'medium',
    description: 'Analyze time and space complexity of sorting algorithms',
    points: 50,
    submittedPoints: null,
    progress: 75,
    color: 'bg-purple-500',
    colorLight: 'bg-purple-50',
    colorBorder: 'border-purple-500'
  },
  {
    id: 4,
    title: 'Software Requirements Document',
    course: 'Software Engineering Principles',
    courseCode: 'CS305',
    type: 'Documentation',
    dueDate: '2025-12-05',
    dueTime: '11:59 PM',
    status: 'in-progress',
    priority: 'medium',
    description: 'Write comprehensive software requirements specification',
    points: 75,
    submittedPoints: null,
    progress: 90,
    color: 'bg-pink-500',
    colorLight: 'bg-pink-50',
    colorBorder: 'border-pink-500'
  },
  {
    id: 5,
    title: 'Web Portfolio Project',
    course: 'Web Development Fundamentals',
    courseCode: 'CS150',
    type: 'Project',
    dueDate: '2025-11-30',
    dueTime: '11:59 PM',
    status: 'submitted',
    priority: 'low',
    description: 'Build a personal portfolio website using HTML, CSS, and JavaScript',
    points: 100,
    submittedPoints: 95,
    progress: 100,
    color: 'bg-green-500',
    colorLight: 'bg-green-50',
    colorBorder: 'border-green-500'
  },
  {
    id: 6,
    title: 'Unit Testing Assignment',
    course: 'Software Engineering Principles',
    courseCode: 'CS305',
    type: 'Assignment',
    dueDate: '2025-11-28',
    dueTime: '11:59 PM',
    status: 'graded',
    priority: 'low',
    description: 'Write comprehensive unit tests for the provided codebase',
    points: 50,
    submittedPoints: 48,
    progress: 100,
    color: 'bg-pink-500',
    colorLight: 'bg-pink-50',
    colorBorder: 'border-pink-500'
  },
  {
    id: 7,
    title: 'SQL Query Exercises',
    course: 'Database Management Systems',
    courseCode: 'CS220',
    type: 'Exercise',
    dueDate: '2025-11-25',
    dueTime: '11:59 PM',
    status: 'graded',
    priority: 'low',
    description: 'Complete advanced SQL query exercises covering joins and subqueries',
    points: 30,
    submittedPoints: 30,
    progress: 100,
    color: 'bg-orange-500',
    colorLight: 'bg-orange-50',
    colorBorder: 'border-orange-500'
  }
];

const getDaysUntilDue = (dueDate: string) => {
  const today = new Date('2025-12-04');
  const due = new Date(dueDate);
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'in-progress':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'submitted':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'graded':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Circle className="w-3 h-3" />;
    case 'in-progress':
      return <AlertCircle className="w-3 h-3" />;
    case 'submitted':
    case 'graded':
      return <CheckCircle className="w-3 h-3" />;
    default:
      return <Circle className="w-3 h-3" />;
  }
};

const getUrgencyLabel = (daysUntil: number) => {
  if (daysUntil < 0) return { label: 'Overdue', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-500' };
  if (daysUntil === 0) return { label: 'Due Today', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-500' };
  if (daysUntil === 1) return { label: 'Due Tomorrow', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-500' };
  if (daysUntil <= 3) return { label: `${daysUntil} days left`, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-500' };
  return { label: `${daysUntil} days left`, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-300' };
};

export default function Assignments() {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const pendingAssignments = assignments.filter(a => a.status === 'pending' || a.status === 'in-progress');
  const completedAssignments = assignments.filter(a => a.status === 'submitted' || a.status === 'graded');
  
  const avgScore = Math.round(
    completedAssignments
      .filter(a => a.submittedPoints)
      .reduce((sum, a) => sum + ((a.submittedPoints! / a.points) * 100), 0) /
      completedAssignments.filter(a => a.submittedPoints).length
  );

  const totalPoints = assignments.reduce((sum, a) => sum + a.points, 0);
  const earnedPoints = completedAssignments
    .filter(a => a.submittedPoints)
    .reduce((sum, a) => sum + a.submittedPoints!, 0);

  const filteredCompleted = completedAssignments.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         a.course.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || a.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="max-w-4xl">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-6 h-6" />
            <span className="text-sm bg-white/20 px-3 py-1 rounded-full">Assignment Tracker</span>
          </div>
          <h1 className="text-3xl mb-3 font-bold">Stay on Top of Your Assignments</h1>
          <p className="text-indigo-100 text-lg">
            Track your progress, manage deadlines, and achieve your academic goals with confidence
          </p>
        </div>
      </div>

      {/* Enhanced Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Assignments</p>
              <p className="text-gray-900 text-3xl font-bold">{assignments.length}</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="w-7 h-7 text-white" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <span>This semester</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-600 text-sm mb-1">Active Tasks</p>
              <p className="text-gray-900 text-3xl font-bold">{pendingAssignments.length}</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
              <AlertCircle className="w-7 h-7 text-white" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm text-amber-600">
            <TrendingUp className="w-4 h-4" />
            <span>Needs attention</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-600 text-sm mb-1">Completion Rate</p>
              <p className="text-gray-900 text-3xl font-bold">{Math.round((completedAssignments.length / assignments.length) * 100)}%</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <CheckCircle className="w-7 h-7 text-white" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm text-emerald-600">
            <span>{completedAssignments.length}/{assignments.length} completed</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-600 text-sm mb-1">Average Score</p>
              <p className="text-gray-900 text-3xl font-bold">{avgScore}%</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Award className="w-7 h-7 text-white" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm text-purple-600">
            <span>{earnedPoints}/{totalPoints} points earned</span>
          </div>
        </div>
      </div>

      {/* Active Assignments */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-gray-900 font-semibold mb-1">Active Assignments</h2>
              <p className="text-gray-600 text-sm">Track and manage your ongoing work</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-all">
                <SlidersHorizontal className="w-4 h-4" />
                Filter
              </button>
              <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl text-sm hover:shadow-lg transition-all">
                <Plus className="w-4 h-4" />
                Add Assignment
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {pendingAssignments.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-gray-900 mb-2 font-semibold">All Caught Up!</h3>
              <p className="text-gray-600 text-sm">You have no pending assignments at the moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {pendingAssignments.map((assignment) => {
                const daysUntil = getDaysUntilDue(assignment.dueDate);
                const urgency = getUrgencyLabel(daysUntil);
                
                return (
                  <div
                    key={assignment.id}
                    className={`border-2 rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer group ${
                      daysUntil <= 2 ? 'border-red-200 bg-red-50/30' : 'border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="text-gray-900 group-hover:text-indigo-600 transition-colors text-base font-semibold">
                            {assignment.title}
                          </h3>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-xs ${getStatusBadge(assignment.status)}`}>
                            {getStatusIcon(assignment.status)}
                            <span className="capitalize">{assignment.status === 'in-progress' ? 'In Progress' : 'Pending'}</span>
                          </span>
                        </div>
                        <p className="text-gray-600 text-xs mb-3 leading-relaxed">{assignment.description}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-600 flex-wrap mb-3">
                          <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-lg border border-gray-200">
                            <span className={`w-2 h-2 rounded-full ${assignment.color}`}></span>
                            <span className="text-gray-900 font-medium">{assignment.courseCode}</span>
                          </div>
                          <span className="px-2 py-1 bg-gray-100 rounded-lg text-gray-700 border border-gray-200">
                            {assignment.type}
                          </span>
                          {assignment.priority === 'high' && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-lg border border-red-200">
                              <AlertCircle className="w-3 h-3" />
                              High Priority
                            </span>
                          )}
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-xs ${urgency.bg} ${urgency.color} ${urgency.border}`}>
                            <Clock className="w-3 h-3" />
                            {urgency.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-3 bg-gray-50 rounded-xl p-3 border border-gray-200">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <Calendar className="w-3 h-3 text-indigo-600" />
                          <p className="text-xs text-gray-600">Due Date</p>
                        </div>
                        <p className="text-xs font-semibold text-gray-900">
                          {new Date(assignment.dueDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric'
                          })}
                        </p>
                        <p className="text-xs text-gray-500">{assignment.dueTime}</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <Clock className="w-3 h-3 text-indigo-600" />
                          <p className="text-xs text-gray-600">Time Left</p>
                        </div>
                        <p className={`text-xs font-semibold ${daysUntil <= 2 ? 'text-red-600' : 'text-gray-900'}`}>
                          {daysUntil > 0 ? `${daysUntil} days` : daysUntil === 0 ? 'Due today' : 'Overdue'}
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <Award className="w-3 h-3 text-indigo-600" />
                          <p className="text-xs text-gray-600">Worth</p>
                        </div>
                        <p className="text-xs font-semibold text-gray-900">{assignment.points} pts</p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-gray-700 font-medium">Progress</span>
                        <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-semibold">{assignment.progress}%</span>
                      </div>
                      <div className="relative">
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`${assignment.color} h-2 rounded-full transition-all duration-500 shadow-sm`}
                            style={{ width: `${assignment.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button className="flex-1 px-3 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-1.5 text-sm font-medium">
                        <span>Continue</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                      <button className="px-3 py-2 border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="px-3 py-2 border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Completed Assignments */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-gray-900 font-semibold mb-1">Completed Assignments</h2>
              <p className="text-gray-600 text-sm">Review your submitted and graded work</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-all">
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search assignments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-all"
            >
              <option value="all">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="graded">Graded</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Assignment</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Course</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Type</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Submitted</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Score</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompleted.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <FileText className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="text-gray-600">No completed assignments found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCompleted.map((assignment) => (
                  <tr key={assignment.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-gray-900 font-medium mb-1">{assignment.title}</p>
                        <p className="text-xs text-gray-500">{assignment.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${assignment.color} shadow-sm`}></span>
                        <div>
                          <p className="text-gray-900 text-sm font-medium">{assignment.courseCode}</p>
                          <p className="text-xs text-gray-500">{assignment.course}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-lg text-xs text-indigo-700 font-medium">
                        {assignment.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600 text-sm">
                      {new Date(assignment.dueDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {assignment.submittedPoints !== null ? (
                        <div>
                          <p className="text-gray-900 font-semibold">
                            {assignment.submittedPoints}/{assignment.points}
                          </p>
                          <p className={`text-sm font-medium ${
                            (assignment.submittedPoints / assignment.points) * 100 >= 90 ? 'text-emerald-600' :
                            (assignment.submittedPoints / assignment.points) * 100 >= 80 ? 'text-green-600' :
                            (assignment.submittedPoints / assignment.points) * 100 >= 70 ? 'text-amber-600' :
                            'text-red-600'
                          }`}>
                            {Math.round((assignment.submittedPoints / assignment.points) * 100)}%
                          </p>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">Pending</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 text-sm font-medium ${getStatusBadge(assignment.status)}`}>
                        {getStatusIcon(assignment.status)}
                        <span className="capitalize">{assignment.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="View Details">
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Download">
                          <Download className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

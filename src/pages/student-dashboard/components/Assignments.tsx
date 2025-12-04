import { Download, Filter, Search, ChevronRight, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useState } from 'react';

interface Assignment {
  id: string;
  title: string;
  description: string;
  courseCode: string;
  courseName: string;
  type: 'Project' | 'Assignment' | 'Exercise' | 'Report' | 'Documentation';
  dueDate: string;
  daysLeft: number;
  hoursLeft: number;
  pointsWorth: number;
  percentOfTotal: number;
  progress: number;
  status: 'Pending' | 'In Progress' | 'Submitted' | 'Graded';
  priority: 'High Priority' | 'Normal';
  submitted?: boolean;
  score?: number;
  totalScore?: number;
  submittedDate?: string;
}

interface AssignmentStats {
  total: number;
  active: number;
  completionRate: number;
  averageScore: number;
  pointsEarned: number;
}

interface AssignmentsProps {
  stats?: AssignmentStats;
  activeAssignments?: Assignment[];
  completedAssignments?: Assignment[];
}

const defaultStats: AssignmentStats = {
  total: 7,
  active: 4,
  completionRate: 43,
  averageScore: 97,
  pointsEarned: 173,
};

const defaultActiveAssignments: Assignment[] = [
  {
    id: '1',
    title: 'Database Design Project',
    description: 'Design and implement a relational database for a library management system',
    courseCode: 'CS220',
    courseName: 'Database Management Systems',
    type: 'Project',
    dueDate: 'Dec 10, 2025',
    daysLeft: 6,
    hoursLeft: 144,
    pointsWorth: 100,
    percentOfTotal: 18,
    progress: 45,
    status: 'Pending',
    priority: 'High Priority',
  },
  {
    id: '2',
    title: 'Mobile App Prototype',
    description: 'Create a functional prototype of a mobile application using Flutter',
    courseCode: 'CS350',
    courseName: 'Mobile Application Development',
    type: 'Project',
    dueDate: 'Dec 8, 2025',
    daysLeft: 4,
    hoursLeft: 96,
    pointsWorth: 150,
    percentOfTotal: 27,
    progress: 60,
    status: 'Pending',
    priority: 'High Priority',
  },
  {
    id: '3',
    title: 'Algorithm Analysis Report',
    description: 'Analyze time and space complexity of sorting algorithms',
    courseCode: 'CS201',
    courseName: 'Data Structures & Algorithms',
    type: 'Report',
    dueDate: 'Dec 6, 2025',
    daysLeft: 2,
    hoursLeft: 48,
    pointsWorth: 50,
    percentOfTotal: 9,
    progress: 75,
    status: 'In Progress',
    priority: 'Normal',
  },
  {
    id: '4',
    title: 'Software Requirements Document',
    description: 'Write comprehensive software requirements specifications',
    courseCode: 'CS305',
    courseName: 'Software Engineering Principles',
    type: 'Documentation',
    dueDate: 'Dec 5, 2025',
    daysLeft: 1,
    hoursLeft: 24,
    pointsWorth: 75,
    percentOfTotal: 14,
    progress: 90,
    status: 'In Progress',
    priority: 'Normal',
  },
];

const defaultCompletedAssignments: Assignment[] = [
  {
    id: '5',
    title: 'Web Portfolio Project',
    description: 'Build a personal portfolio website using HTML, CSS, and JavaScript',
    courseCode: 'CS150',
    courseName: 'Web Development Fundamentals',
    type: 'Project',
    dueDate: 'Nov 30, 2025',
    daysLeft: 0,
    hoursLeft: 0,
    pointsWorth: 100,
    percentOfTotal: 18,
    progress: 100,
    status: 'Graded',
    priority: 'High Priority',
    submitted: true,
    score: 95,
    totalScore: 100,
    submittedDate: 'Nov 30, 2025',
  },
  {
    id: '6',
    title: 'Unit Testing Assignment',
    description: 'Write comprehensive unit tests for the provided codebase',
    courseCode: 'CS305',
    courseName: 'Software Engineering Principles',
    type: 'Assignment',
    dueDate: 'Nov 28, 2025',
    daysLeft: 0,
    hoursLeft: 0,
    pointsWorth: 50,
    percentOfTotal: 9,
    progress: 100,
    status: 'Graded',
    priority: 'Normal',
    submitted: true,
    score: 48,
    totalScore: 50,
    submittedDate: 'Nov 28, 2025',
  },
  {
    id: '7',
    title: 'SQL Query Exercises',
    description: 'Complete advanced SQL query exercises covering joins and aggregations',
    courseCode: 'CS220',
    courseName: 'Database Management Systems',
    type: 'Exercise',
    dueDate: 'Nov 25, 2025',
    daysLeft: 0,
    hoursLeft: 0,
    pointsWorth: 30,
    percentOfTotal: 5,
    progress: 100,
    status: 'Graded',
    priority: 'Normal',
    submitted: true,
    score: 30,
    totalScore: 30,
    submittedDate: 'Nov 25, 2025',
  },
];

const StatBox = ({
  label,
  value,
  subtext,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  subtext: string;
  icon?: any;
}) => (
  <div className="bg-white border border-gray-200 rounded-lg p-6">
    <div className="flex justify-between items-start gap-4">
      <div>
        <p className="text-sm text-gray-600 mb-2">{label}</p>
        <p className="text-4xl font-bold text-gray-900 mb-3">{value}</p>
        <p className="text-sm text-gray-500">{subtext}</p>
      </div>
      {Icon && (
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <Icon size={24} className="text-blue-600" />
        </div>
      )}
    </div>
  </div>
);

const ActiveAssignmentCard = ({ assignment }: { assignment: Assignment }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
    {/* Header */}
    <div className="flex justify-between items-start mb-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{assignment.title}</h3>
        <div className="flex gap-4 mt-2">
          <span
            className={`flex items-center gap-2 text-sm ${
              assignment.status === 'Pending' ? 'text-yellow-600' : 'text-blue-600'
            }`}
          >
            <Clock size={14} />
            {assignment.status}
          </span>
          <span className="text-sm text-red-600 font-medium">{assignment.priority}</span>
          <span className="text-sm text-gray-600">{assignment.daysLeft} days left</span>
        </div>
      </div>
    </div>

    {/* Description */}
    <p className="text-sm text-gray-600 mb-4">{assignment.description}</p>

    {/* Course info */}
    <div className="flex gap-6 mb-6 pb-6 border-b border-gray-100 text-sm">
      <div>
        <span className="text-gray-600">●</span>
        <span className="ml-2 text-gray-900">{assignment.courseName}</span>
      </div>
      <span className="text-gray-600">{assignment.courseCode}</span>
      <span className="text-gray-600">{assignment.type}</span>
    </div>

    {/* Details Grid */}
    <div className="grid grid-cols-4 gap-6 mb-6 pb-6 border-b border-gray-100">
      <div>
        <p className="text-sm text-gray-600 mb-2">Due Date</p>
        <p className="font-medium text-gray-900">{assignment.dueDate}</p>
        <p className="text-xs text-gray-600 mt-2">11:59 PM</p>
      </div>
      <div>
        <p className="text-sm text-gray-600 mb-2">Time Left</p>
        <p className="font-medium text-gray-900">{assignment.daysLeft} days</p>
        <p className="text-xs text-gray-600 mt-2">{assignment.hoursLeft} hours</p>
      </div>
      <div>
        <p className="text-sm text-gray-600 mb-2">Worth</p>
        <p className="font-medium text-gray-900">{assignment.pointsWorth} points</p>
        <p className="text-xs text-gray-600 mt-2">{assignment.percentOfTotal}% of total</p>
      </div>
    </div>

    {/* Progress */}
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-600">Completion Progress</span>
        <span className="font-semibold text-gray-900">{assignment.progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="h-3 bg-blue-600 rounded-full"
          style={{ width: `${assignment.progress}%` }}
        />
      </div>
    </div>

    {/* Buttons */}
    <div className="flex gap-3">
      <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
        Continue Working
        <ChevronRight size={16} />
      </button>
      <button className="px-6 py-3 border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors">
        Details
      </button>
      <button className="px-4 py-3 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-lg transition-colors">
        ⋮
      </button>
    </div>
  </div>
);

const CompletedAssignmentsTable = ({ assignments }: { assignments: Assignment[] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Completed Assignments</h3>
            <p className="text-sm text-gray-600 mt-1">Review your submitted and graded work</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <Download size={16} />
            Export Report
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search assignments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>All Status</option>
            <option>Submitted</option>
            <option>Graded</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-600">Assignment</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-600">Course</th>
              <th className="px-6 py-4 text-center text-sm font-bold text-gray-600">Type</th>
              <th className="px-6 py-4 text-center text-sm font-bold text-gray-600">Submitted</th>
              <th className="px-6 py-4 text-center text-sm font-bold text-gray-600">Score</th>
              <th className="px-6 py-4 text-center text-sm font-bold text-gray-600">Status</th>
              <th className="px-6 py-4 text-center text-sm font-bold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((assignment) => (
              <tr key={assignment.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="px-6 py-5">
                  <div>
                    <p className="font-medium text-gray-900">{assignment.title}</p>
                    <p className="text-sm text-gray-600">{assignment.description}</p>
                  </div>
                </td>
                <td className="px-6 py-5 text-sm text-gray-600">
                  <p className="font-medium text-gray-900">{assignment.courseCode}</p>
                  <p className="text-xs text-gray-600">{assignment.courseName}</p>
                </td>
                <td className="px-6 py-5 text-center text-sm text-gray-600">{assignment.type}</td>
                <td className="px-6 py-5 text-center text-sm text-gray-900">
                  {assignment.submittedDate}
                </td>
                <td className="px-6 py-5">
                  <div className="text-center">
                    <p className="font-semibold text-gray-900">
                      {assignment.score}/{assignment.totalScore}
                    </p>
                    <p className="text-sm text-gray-600">
                      {Math.round((assignment.score! / assignment.totalScore!) * 100)}%
                    </p>
                  </div>
                </td>
                <td className="px-6 py-5 text-center">
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded text-sm font-medium ${
                      assignment.status === 'Graded'
                        ? 'text-green-700'
                        : 'text-yellow-700'
                    }`}
                  >
                    {assignment.status === 'Graded' ? (
                      <CheckCircle size={14} />
                    ) : (
                      <Clock size={14} />
                    )}
                    {assignment.status}
                  </span>
                </td>
                <td className="px-6 py-5 text-center">
                  <div className="flex justify-center gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded transition-colors">
                      👁️
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded transition-colors">
                      ⋮
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default function Assignments({
  stats = defaultStats,
  activeAssignments = defaultActiveAssignments,
  completedAssignments = defaultCompletedAssignments,
}: AssignmentsProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <AlertCircle size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assignment Tracker</h1>
          <p className="text-gray-600">Track your progress, manage deadlines, and achieve</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatBox
          label="Total Assignments"
          value={stats.total}
          subtext="This semester"
          icon={AlertCircle}
        />
        <StatBox
          label="Active Tasks"
          value={stats.active}
          subtext="Needs attention"
          icon={Clock}
        />
        <StatBox
          label="Completion Rate"
          value={`${stats.completionRate}%`}
          subtext={`${Math.floor(stats.completionRate / 100 * stats.total)}/${stats.total} completed`}
        />
        <StatBox
          label="Average Score"
          value={`${stats.averageScore}%`}
          subtext={`${stats.pointsEarned}/555 points earned`}
        />
      </div>

      {/* Active Assignments */}
      <div>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Active Assignments</h2>
            <p className="text-sm text-gray-600">Track and manage your ongoing work</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors">
              <Filter size={16} />
              Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              <ChevronRight size={16} />
              Add Assignment
            </button>
          </div>
        </div>

        {activeAssignments.map((assignment) => (
          <ActiveAssignmentCard key={assignment.id} assignment={assignment} />
        ))}
      </div>

      {/* Completed Assignments */}
      <CompletedAssignmentsTable assignments={completedAssignments} />
    </div>
  );
}

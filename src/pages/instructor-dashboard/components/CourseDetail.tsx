import React, { useState } from 'react';
import {
  ArrowLeft,
  Users,
  TrendingUp,
  Calendar,
  FileText,
  BookOpen,
  BarChart3,
  MessageSquare,
  Sparkles,
  Video,
  Download,
  Upload,
  CheckCircle,
  Bell,
} from 'lucide-react';

type Course = {
  id: number;
  courseCode: string;
  courseName: string;
  semester: string;
  credits: number;
  prerequisites: string[];
  description: string;
  enrolled: number;
  capacity: number;
  schedule: string;
  room: string;
  status: 'active' | 'archived';
  averageGrade: number;
  attendanceRate: number;
};

type CourseDetailProps = {
  courseId: number;
  onBack: () => void;
  courses: Course[];
};

export function CourseDetail({ courseId, onBack, courses }: CourseDetailProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // Get actual course data
  const course = courses.find((c) => c.id === courseId);

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Course not found</h2>
          <button onClick={onBack} className="text-indigo-600 hover:text-indigo-700 font-medium">
            ← Back to Courses
          </button>
        </div>
      </div>
    );
  }

  const instructor = {
    name: 'Prof. Sarah Martinez',
    department: 'Computer Science Dept.',
    avatar: 'SM',
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'lectures', label: 'Lectures', icon: Video },
    { id: 'materials', label: 'Materials', icon: FileText },
    { id: 'assignments', label: 'Assignments', icon: FileText },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'announcements', label: 'Announcements', icon: MessageSquare },
    { id: 'ai-tools', label: 'AI Tools', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-semibold">
                  E
                </div>
                <span className="text-sm text-gray-600">EduVerse</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{instructor.name}</div>
                <div className="text-xs text-gray-500">{instructor.department}</div>
              </div>
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                {instructor.avatar}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Title */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.courseName}</h1>
          <p className="text-gray-600">
            Manage lectures, assignments, materials, students, analytics, and announcements.
          </p>
        </div>
      </div>

      {/* Tabs - Fixed scrollbar issue */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-6 -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon size={18} />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Course Summary */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="text-blue-600" size={20} />
                  </div>
                  <h3 className="font-semibold text-gray-900">Course Summary</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Students</div>
                    <div className="text-2xl font-bold text-gray-900">{course.enrolled}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Average Grade</div>
                    <div className="text-2xl font-bold text-gray-900">{course.averageGrade}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Engagement</div>
                    <div className="text-2xl font-bold text-green-600">
                      {course.attendanceRate}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Upcoming Events */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Calendar className="text-purple-600" size={20} />
                  </div>
                  <h3 className="font-semibold text-gray-900">Upcoming Events</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-900">Lecture</span>
                    <span className="text-sm text-gray-600">May 12</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-900">Quiz</span>
                    <span className="text-sm text-gray-600">May 13</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-900">Office Hour</span>
                    <span className="text-sm text-gray-600">May 14</span>
                  </div>
                </div>
              </div>

              {/* AI Insights */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="text-green-600" size={20} />
                  </div>
                  <h3 className="font-semibold text-gray-900">AI Insights</h3>
                </div>

                <div className="space-y-4">
                  <div className="text-sm text-gray-700">
                    Students struggled with {course.courseName.split(' ')[0]} concepts last week.
                  </div>
                  <div className="text-sm text-green-700 font-medium">
                    Engagement improved by 5%
                  </div>
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                    <Sparkles size={16} />
                    Generate Teaching Plan
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mt-6">
              <h3 className="font-semibold text-gray-900 mb-6">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    New assignment submitted
                  </div>
                  <span className="text-sm text-gray-900">John Smith</span>
                  <span className="text-sm text-gray-500 ml-auto">2 hours ago</span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                    Quiz completed
                  </div>
                  <span className="text-sm text-gray-900">15 students</span>
                  <span className="text-sm text-gray-500 ml-auto">4 hours ago</span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    Material uploaded
                  </div>
                  <span className="text-sm text-gray-900">Prof. Martinez</span>
                  <span className="text-sm text-gray-500 ml-auto">Yesterday</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Lectures Tab */}
        {activeTab === 'lectures' && (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((week) => (
              <div key={week} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">Week {week}</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Video size={20} className="text-indigo-600" />
                      <div>
                        <div className="font-medium text-gray-900">
                          Lecture {week}.1 - Introduction
                        </div>
                        <div className="text-sm text-gray-600">{course.schedule}</div>
                      </div>
                    </div>
                    <CheckCircle size={20} className="text-green-600" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Materials Tab */}
        {activeTab === 'materials' && (
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-900">Course Materials</h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm">
                <Upload size={16} />
                Upload Material
              </button>
            </div>
            <div className="space-y-3">
              {['Syllabus.pdf', 'Lecture Notes - Week 1.pdf', 'Assignment Guidelines.pdf'].map(
                (file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText size={20} className="text-gray-600" />
                      <span className="text-sm text-gray-900">{file}</span>
                    </div>
                    <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                      <Download size={16} className="text-gray-600" />
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* Assignments Tab */}
        {activeTab === 'assignments' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Assignments</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm">
                <FileText size={16} />
                Create New Assignment
              </button>
            </div>

            {/* Assignment Cards */}
            <div className="space-y-4">
              {[
                {
                  title: 'Assignment 03 — Derivatives Practice',
                  subject: 'Calculus I',
                  subjectColor: 'bg-blue-100 text-blue-700',
                  dueDate: 'Due May 15, 2025',
                  submitted: 32,
                  total: 52,
                  description:
                    'Complete problems 1-20 on derivatives, including chain rule and implicit differentiation.',
                  files: ['Problem-Set.pdf', 'Formula-Sheet.pdf'],
                  status: 'Published',
                  statusColor: 'bg-green-100 text-green-700',
                },
                {
                  title: 'Lab Report 02 — Projectile Motion',
                  subject: 'Physics I',
                  subjectColor: 'bg-purple-100 text-purple-700',
                  dueDate: 'Due May 14, 2025',
                  submitted: 28,
                  total: 43,
                  description:
                    'Analyze projectile motion data collected during lab session and write a comprehensive report.',
                  files: ['Lab-Instructions.pdf'],
                  status: 'Published',
                  statusColor: 'bg-green-100 text-green-700',
                },
                {
                  title: 'Programming Assignment 04 — Sorting Algorithms',
                  subject: 'Intro to Computer Science',
                  subjectColor: 'bg-emerald-100 text-emerald-700',
                  dueDate: 'Due May 20, 2025',
                  submitted: 0,
                  total: 48,
                  description:
                    'Implement and compare quicksort, mergesort, and heapsort algorithms.',
                  files: ['Starter-Code.zip', 'Requirements.pdf'],
                  status: 'Draft',
                  statusColor: 'bg-yellow-100 text-yellow-700',
                },
              ].map((assignment, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{assignment.title}</h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${assignment.subjectColor}`}
                        >
                          {assignment.subject}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>{assignment.dueDate}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users size={14} />
                          <span>
                            {assignment.submitted}/{assignment.total} Submitted
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{assignment.description}</p>
                      <div className="flex items-center gap-2">
                        {assignment.files.map((file, fileIndex) => (
                          <div
                            key={fileIndex}
                            className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg text-sm text-gray-700"
                          >
                            <FileText size={14} />
                            <span>{file}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${assignment.statusColor}`}
                    >
                      {assignment.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                    <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                      View Submissions
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                      Edit
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                      Grade Manually
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                      <Sparkles size={16} />
                      AI Auto-Grading
                    </button>
                    {assignment.status === 'Draft' && (
                      <button className="flex items-center gap-2 px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors ml-auto">
                        Publish
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-6">
              Enrolled Students ({course.enrolled})
            </h3>
            <div className="space-y-2">
              {Array.from({ length: Math.min(10, course.enrolled) }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Student {index + 1}</div>
                      <div className="text-sm text-gray-600">student{index + 1}@edu.com</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">Grade: A-</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="text-sm text-gray-600 mb-2">Average Grade</div>
                <div className="text-3xl font-bold text-gray-900">{course.averageGrade}%</div>
                <div className="text-sm text-green-600 mt-2">↑ 3% from last month</div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="text-sm text-gray-600 mb-2">Attendance Rate</div>
                <div className="text-3xl font-bold text-gray-900">{course.attendanceRate}%</div>
                <div className="text-sm text-green-600 mt-2">↑ 2% from last month</div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="text-sm text-gray-600 mb-2">Completion Rate</div>
                <div className="text-3xl font-bold text-gray-900">89%</div>
                <div className="text-sm text-green-600 mt-2">↑ 5% from last month</div>
              </div>
            </div>
          </div>
        )}

        {/* Announcements Tab */}
        {activeTab === 'announcements' && (
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-900">Announcements</h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm">
                <Bell size={16} />
                New Announcement
              </button>
            </div>
            <div className="space-y-4">
              {[
                { title: 'Midterm Schedule', date: 'May 10', content: 'Midterm exam on June 1st' },
                { title: 'Office Hours Update', date: 'May 8', content: 'New office hours posted' },
              ].map((announcement, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-gray-900">{announcement.title}</div>
                    <div className="text-sm text-gray-600">{announcement.date}</div>
                  </div>
                  <div className="text-sm text-gray-600">{announcement.content}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Tools Tab */}
        {activeTab === 'ai-tools' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Sparkles className="text-purple-600" size={24} />
                </div>
                <h3 className="font-semibold text-gray-900">Generate Quiz</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Automatically generate quizzes based on course materials
              </p>
              <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">
                Generate Quiz
              </button>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-indigo-100 rounded-xl">
                  <BarChart3 className="text-indigo-600" size={24} />
                </div>
                <h3 className="font-semibold text-gray-900">Analyze Performance</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Get AI-powered insights on student performance
              </p>
              <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm">
                Analyze Course
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CourseDetail;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, FileText, BookOpen, Video, CheckCircle, Users,
  MessageSquare, Calendar, Sparkles, Download, Bell, ArrowRight,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

type Course = {
  id: string;
  name: string;
  code: string;
  instructor: {
    id: string;
    name: string;
    email: string;
  };
  semester: string;
  labCount: number;
  studentCount: number;
  pendingSubmissions: number;
  averageGrade: number;
  attendanceRate: number;
};

type CoursesPageProps = {
  courses: Course[];
  onViewCourse: (courseId: string) => void;
};

// --- Mock data for detail view ---
const MOCK_LECTURES = [
  { id: '1', title: 'Lecture 1: Introduction', date: '2025-01-15' },
  { id: '2', title: 'Lecture 2: Variables & Types', date: '2025-01-22' },
  { id: '3', title: 'Lecture 3: Control Flow', date: '2025-01-29' },
];

const MOCK_MATERIALS: Record<string, { id: string; name: string; type: string }[]> = {
  '1': [
    { id: 'm1', name: 'Intro Slides.pdf', type: 'pdf' },
    { id: 'm2', name: 'Welcome Video.mp4', type: 'video' },
  ],
  '2': [
    { id: 'm3', name: 'Variables Cheat Sheet.pdf', type: 'pdf' },
  ],
  '3': [],
};

const MOCK_ASSIGNMENTS = [
  { id: 'a1', title: 'Assignment 1: Hello World', dueDate: '2025-02-01', type: 'written' as const, submissions: 38 },
  { id: 'a2', title: 'Quiz 1: Basics', dueDate: '2025-02-05', type: 'MCQ' as const, submissions: 42 },
  { id: 'a3', title: 'Project: Calculator', dueDate: '2025-02-15', type: 'project' as const, submissions: 25 },
];

const MOCK_STUDENTS = [
  { id: 's1', name: 'Ali Mohamed', email: 'ali@edu.com', grade: 88 },
  { id: 's2', name: 'Sara Ahmed', email: 'sara@edu.com', grade: 92 },
  { id: 's3', name: 'Omar Khaled', email: 'omar@edu.com', grade: 76 },
  { id: 's4', name: 'Nour Hassan', email: 'nour@edu.com', grade: 95 },
];

const MOCK_ANNOUNCEMENTS = [
  { id: 'an1', title: 'Lab 3 Postponed', date: '2025-01-28', body: 'Lab 3 has been moved to next week due to scheduling conflicts.' },
  { id: 'an2', title: 'Midterm Grades Released', date: '2025-02-10', body: 'Midterm grades are now available in the grading section.' },
];

type DetailTab = 'overview' | 'lectures' | 'materials' | 'assignments' | 'grading' | 'students' | 'announcements';
type GradingSubTab = 'manual' | 'auto';

// --- CourseDetail component ---
function CourseDetail({ course, isDark, onBack }: { course: Course; isDark: boolean; onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [gradingSubTab, setGradingSubTab] = useState<GradingSubTab>('manual');
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [newAssignment, setNewAssignment] = useState({ title: '', description: '', dueDate: '', type: 'written' });

  const tabs: { key: DetailTab; label: string; icon: React.ElementType }[] = [
    { key: 'overview', label: 'Overview', icon: BookOpen },
    { key: 'lectures', label: 'Lectures', icon: Video },
    { key: 'materials', label: 'Materials', icon: FileText },
    { key: 'assignments', label: 'Assignments', icon: CheckCircle },
    { key: 'grading', label: 'Grading', icon: Sparkles },
    { key: 'students', label: 'Students', icon: Users },
    { key: 'announcements', label: 'Announcements', icon: Bell },
  ];

  const cardClass = `border rounded-lg p-4 sm:p-6 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`;
  const headingClass = `text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`;
  const subTextClass = isDark ? 'text-slate-400' : 'text-gray-600';
  const inputClass = `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-slate-400' : 'border-gray-300 bg-white'}`;

  return (
    <div className="space-y-6">
      {/* Back button + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-slate-300' : 'hover:bg-gray-100 text-gray-600'}`}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{course.name}</h2>
          <p className={`text-sm ${subTextClass}`}>{course.code} &middot; {course.semester} &middot; {course.instructor.name}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
        <div className="scrollbar-hide flex gap-1 min-w-max">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === key
                  ? 'bg-blue-600 text-white'
                  : isDark ? 'text-slate-400 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Students', value: course.studentCount, icon: Users },
            { label: 'Labs', value: course.labCount, icon: FileText },
            { label: 'Avg Grade', value: `${course.averageGrade}%`, icon: Sparkles },
            { label: 'Attendance', value: `${course.attendanceRate}%`, icon: Calendar },
          ].map((stat) => (
            <div key={stat.label} className={cardClass}>
              <div className="flex items-center gap-3">
                <stat.icon className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                <div>
                  <p className={`text-xs ${subTextClass}`}>{stat.label}</p>
                  <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
          {course.pendingSubmissions > 0 && (
            <div className={`sm:col-span-2 lg:col-span-4 border rounded-lg p-4 ${isDark ? 'bg-orange-500/20 border-orange-500/30' : 'bg-orange-50 border-orange-200'}`}>
              <p className={`text-sm font-medium ${isDark ? 'text-orange-300' : 'text-orange-900'}`}>
                {course.pendingSubmissions} pending submissions require grading
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'lectures' && (
        <div className={cardClass}>
          <h3 className={headingClass}>Lectures</h3>
          <div className="mt-4 space-y-3">
            {MOCK_LECTURES.map((lec) => (
              <div key={lec.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                  <Video className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>{lec.title}</span>
                </div>
                <span className={`text-sm ${subTextClass}`}>{lec.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'materials' && (
        <div className={cardClass}>
          <h3 className={headingClass}>Materials by Lecture</h3>
          <div className="mt-4 space-y-4">
            {MOCK_LECTURES.map((lec) => (
              <div key={lec.id}>
                <h4 className={`text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{lec.title}</h4>
                {(MOCK_MATERIALS[lec.id] || []).length === 0 ? (
                  <p className={`text-sm italic ${subTextClass}`}>No materials uploaded yet.</p>
                ) : (
                  <div className="space-y-2">
                    {MOCK_MATERIALS[lec.id].map((mat) => (
                      <div key={mat.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                        <div className="flex items-center gap-2">
                          {mat.type === 'video' ? <Video className="w-4 h-4 text-purple-500" /> : <FileText className="w-4 h-4 text-blue-500" />}
                          <span className={isDark ? 'text-white' : 'text-gray-900'}>{mat.name}</span>
                        </div>
                        <button className="flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600 mt-2 sm:mt-0">
                          <Download className="w-3 h-3" /> Download
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'assignments' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className={headingClass}>Assignments</h3>
            <button
              onClick={() => setShowAssignmentForm(!showAssignmentForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              {showAssignmentForm ? 'Cancel' : 'Create New Assignment'}
            </button>
          </div>

          {showAssignmentForm && (
            <div className={cardClass}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${subTextClass}`}>Title</label>
                  <input className={inputClass} value={newAssignment.title} onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })} placeholder="Assignment title" />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${subTextClass}`}>Due Date</label>
                  <input type="date" className={inputClass} value={newAssignment.dueDate} onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })} />
                </div>
                <div className="sm:col-span-2">
                  <label className={`block text-sm font-medium mb-1 ${subTextClass}`}>Description</label>
                  <textarea className={inputClass} rows={3} value={newAssignment.description} onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })} placeholder="Assignment description" />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${subTextClass}`}>Type</label>
                  <select className={inputClass} value={newAssignment.type} onChange={(e) => setNewAssignment({ ...newAssignment, type: e.target.value })}>
                    <option value="written">Written</option>
                    <option value="MCQ">MCQ</option>
                    <option value="project">Project</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button onClick={() => { alert('Assignment created!'); setShowAssignmentForm(false); }} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium">
                    Save Assignment
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className={cardClass}>
            <div className="space-y-3">
              {MOCK_ASSIGNMENTS.map((a) => (
                <div key={a.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <div className="mb-2 sm:mb-0">
                    <div className="flex items-center gap-2">
                      <CheckCircle className={`w-4 h-4 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{a.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-white/10 text-slate-300' : 'bg-gray-200 text-gray-700'}`}>{a.type}</span>
                    </div>
                    <p className={`text-xs mt-1 ${subTextClass}`}>Due: {a.dueDate} &middot; {a.submissions} submissions</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => alert(`Viewing submissions for ${a.title}`)} className="text-xs px-3 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700">View Submissions</button>
                    <button onClick={() => alert(`Editing ${a.title}`)} className={`text-xs px-3 py-1 rounded-lg ${isDark ? 'bg-white/10 text-slate-300 hover:bg-white/20' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>Edit</button>
                    <button onClick={() => alert(`Grading ${a.title}`)} className="text-xs px-3 py-1 rounded-lg bg-green-600 text-white hover:bg-green-700">Grade</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'grading' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => setGradingSubTab('manual')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${gradingSubTab === 'manual' ? 'bg-blue-600 text-white' : isDark ? 'text-slate-400 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Manual Grading
            </button>
            <button
              onClick={() => setGradingSubTab('auto')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${gradingSubTab === 'auto' ? 'bg-blue-600 text-white' : isDark ? 'text-slate-400 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Auto-Graded Results
            </button>
          </div>

          {gradingSubTab === 'manual' && (
            <div className={cardClass}>
              <h3 className={headingClass}>Written / Uploaded Assignments</h3>
              <p className={`text-sm mt-1 mb-4 ${subTextClass}`}>Grade written and project submissions.</p>
              <div className="space-y-3">
                {MOCK_ASSIGNMENTS.filter((a) => a.type !== 'MCQ').map((a) => (
                  <div key={a.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                    <div>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{a.title}</span>
                      <p className={`text-xs ${subTextClass}`}>{a.submissions} submissions &middot; Due: {a.dueDate}</p>
                    </div>
                    <button onClick={() => alert(`Opening grading for ${a.title}`)} className="mt-2 sm:mt-0 text-xs px-3 py-1 rounded-lg bg-green-600 text-white hover:bg-green-700">
                      Grade Now
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {gradingSubTab === 'auto' && (
            <div className={cardClass}>
              <h3 className={headingClass}>MCQ Auto-Graded Results</h3>
              <p className={`text-sm mt-1 mb-4 ${subTextClass}`}>View-only results for auto-graded quizzes.</p>
              <div className="space-y-3">
                {MOCK_ASSIGNMENTS.filter((a) => a.type === 'MCQ').map((a) => (
                  <div key={a.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                    <div>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{a.title}</span>
                      <p className={`text-xs ${subTextClass}`}>{a.submissions} graded &middot; Due: {a.dueDate}</p>
                    </div>
                    <span className={`mt-2 sm:mt-0 text-xs px-3 py-1 rounded-full ${isDark ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-700'}`}>Auto-Graded</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'students' && (
        <div className={cardClass}>
          <h3 className={headingClass}>Enrolled Students</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={isDark ? 'text-slate-400' : 'text-gray-600'}>
                  <th className="text-left py-2 pr-4">Name</th>
                  <th className="text-left py-2 pr-4 hidden sm:table-cell">Email</th>
                  <th className="text-left py-2">Grade</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_STUDENTS.map((s) => (
                  <tr key={s.id} className={`border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                    <td className={`py-2 pr-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{s.name}</td>
                    <td className={`py-2 pr-4 hidden sm:table-cell ${subTextClass}`}>{s.email}</td>
                    <td className={`py-2 font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{s.grade}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'announcements' && (
        <div className={cardClass}>
          <h3 className={headingClass}>Announcements</h3>
          <div className="mt-4 space-y-4">
            {MOCK_ANNOUNCEMENTS.map((an) => (
              <div key={an.id} className={`p-4 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Bell className={`w-4 h-4 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{an.title}</span>
                  </div>
                  <span className={`text-xs ${subTextClass}`}>{an.date}</span>
                </div>
                <p className={`text-sm ${subTextClass}`}>{an.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Main CoursesPage ---
export function CoursesPage({ courses, onViewCourse }: CoursesPageProps) {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const filteredCourses = courses.filter(
    (course) =>
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCourse = selectedCourseId ? courses.find((c) => c.id === selectedCourseId) : null;

  if (selectedCourse) {
    return <CourseDetail course={selectedCourse} isDark={isDark} onBack={() => setSelectedCourseId(null)} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('assignedCourses')}</h2>
          <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>{t('manageYourCourses')}</p>
        </div>
      </div>

      {/* Search */}
      <div className={`border rounded-lg p-4 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
        <input
          type="text"
          placeholder={t('searchCoursesPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-slate-400' : 'border-gray-300'}`}
        />
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className={`border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}
            onClick={() => onViewCourse(course.id)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{course.name}</h3>
                </div>
                <p className={`text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>{t('code')}: {course.code}</p>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{t('instructor')}: {course.instructor.name}</p>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{course.semester}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className={`rounded-lg p-3 ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <FileText className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-gray-600'}`} />
                  <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>{t('labs')}</span>
                </div>
                <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{course.labCount}</p>
              </div>

              <div className={`rounded-lg p-3 ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Users className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-gray-600'}`} />
                  <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>{t('students')}</span>
                </div>
                <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{course.studentCount}</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className={isDark ? 'text-slate-400' : 'text-gray-600'}>{t('avgGrade')}</span>
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{course.averageGrade}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className={isDark ? 'text-slate-400' : 'text-gray-600'}>{t('attendance')}</span>
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{course.attendanceRate}%</span>
              </div>
            </div>

            {course.pendingSubmissions > 0 && (
              <div className={`border rounded-lg p-3 mb-4 ${isDark ? 'bg-orange-500/20 border-orange-500/30' : 'bg-orange-50 border-orange-200'}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${isDark ? 'text-orange-300' : 'text-orange-900'}`}>
                    {course.pendingSubmissions} {t('pendingSubmissions')}
                  </span>
                  <ArrowRight className={`w-4 h-4 ${isDark ? 'text-orange-300' : 'text-orange-600'}`} />
                </div>
              </div>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/tadashboard/courses/${course.id}`);
                setSelectedCourseId(course.id);
              }}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              {t('viewDetails')}
            </button>
          </div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className={`text-center py-12 border rounded-lg ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
          <BookOpen className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
          <p className={isDark ? 'text-slate-400' : 'text-gray-600'}>{t('noCoursesFound')}</p>
        </div>
      )}
    </div>
  );
}

export default CoursesPage;

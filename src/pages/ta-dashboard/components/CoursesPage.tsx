import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  BookOpen,
  Video,
  CheckCircle,
  Users,
  MessageSquare,
  Calendar,
  Sparkles,
  Download,
  Bell,
  ArrowRight,
  Plus,
  Pencil,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { CleanSelect } from '../../../components/shared';

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
  disableDetailsReason?: string;
  disableRouteNavigation?: boolean;
  /** Parent renders course detail (e.g. LiveCourseDetailsPage); only show the grid */
  listOnly?: boolean;
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
  '2': [{ id: 'm3', name: 'Variables Cheat Sheet.pdf', type: 'pdf' }],
  '3': [],
};

const MOCK_ASSIGNMENTS = [
  {
    id: 'a1',
    title: 'Assignment 1: Hello World',
    dueDate: '2025-02-01',
    type: 'written' as const,
    submissions: 38,
  },
  {
    id: 'a2',
    title: 'Quiz 1: Basics',
    dueDate: '2025-02-05',
    type: 'MCQ' as const,
    submissions: 42,
  },
  {
    id: 'a3',
    title: 'Project: Calculator',
    dueDate: '2025-02-15',
    type: 'project' as const,
    submissions: 25,
  },
];

const MOCK_STUDENTS = [
  { id: 's1', name: 'Ali Mohamed', email: 'ali@edu.com', grade: 88, courses: ['c1', 'c2'] },
  { id: 's2', name: 'Sara Ahmed', email: 'sara@edu.com', grade: 92, courses: ['c1'] },
  { id: 's3', name: 'Omar Khaled', email: 'omar@edu.com', grade: 76, courses: ['c2', 'c3'] },
  { id: 's4', name: 'Nour Hassan', email: 'nour@edu.com', grade: 95, courses: ['c1', 'c3'] },
];

const MOCK_ANNOUNCEMENTS = [
  {
    id: 'an1',
    title: 'Lab 3 Postponed',
    date: '2025-01-28',
    body: 'Lab 3 has been moved to next week due to scheduling conflicts.',
  },
  {
    id: 'an2',
    title: 'Midterm Grades Released',
    date: '2025-02-10',
    body: 'Midterm grades are now available in the grading section.',
  },
];

type DetailTab =
  | 'overview'
  | 'sections-labs'
  | 'lectures'
  | 'materials'
  | 'assignments'
  | 'grading'
  | 'attendance'
  | 'students'
  | 'announcements';
type GradingSubTab = 'manual' | 'auto';
type SectionItem = { id: string; name: string; schedule: string; room: string; capacity: number };
type LabItem = {
  id: string;
  title: string;
  sectionId: string;
  day: string;
  time: string;
  room: string;
  instructorNotes: string;
};
type AttendanceSession = {
  id: string;
  sectionId: string;
  sessionTitle: string;
  date: string;
  presentCount: number;
  totalCount: number;
};

// --- CourseDetail component ---
function CourseDetail({
  course,
  isDark,
  onBack,
}: {
  course: Course;
  isDark: boolean;
  onBack: () => void;
}) {
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [gradingSubTab, setGradingSubTab] = useState<GradingSubTab>('manual');
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    dueDate: '',
    type: 'written',
  });
  const [sections, setSections] = useState<SectionItem[]>([
    {
      id: 'sec-1',
      name: 'Section A',
      schedule: 'Sun/Tue 10:00 AM',
      room: 'Room 204',
      capacity: 30,
    },
    {
      id: 'sec-2',
      name: 'Section B',
      schedule: 'Mon/Wed 12:00 PM',
      room: 'Room 205',
      capacity: 28,
    },
  ]);
  const [labs, setLabs] = useState<LabItem[]>([
    {
      id: 'lab-1',
      title: 'Lab 1: Environment Setup',
      sectionId: 'sec-1',
      day: 'Sunday',
      time: '12:00 PM',
      room: 'Lab A-101',
      instructorNotes: 'Bring laptop.',
    },
    {
      id: 'lab-2',
      title: 'Lab 2: Debugging Basics',
      sectionId: 'sec-2',
      day: 'Monday',
      time: '2:00 PM',
      room: 'Lab A-102',
      instructorNotes: 'Review lecture 2 first.',
    },
  ]);
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [showLabForm, setShowLabForm] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingLabId, setEditingLabId] = useState<string | null>(null);
  const [sectionForm, setSectionForm] = useState<Omit<SectionItem, 'id'>>({
    name: '',
    schedule: '',
    room: '',
    capacity: 25,
  });
  const [labForm, setLabForm] = useState<Omit<LabItem, 'id'>>({
    title: '',
    sectionId: 'sec-1',
    day: '',
    time: '',
    room: '',
    instructorNotes: '',
  });
  const [attendanceSessions, setAttendanceSessions] = useState<AttendanceSession[]>([
    {
      id: 'att-1',
      sectionId: 'sec-1',
      sessionTitle: 'Week 1 Lab Attendance',
      date: '2025-02-16',
      presentCount: 25,
      totalCount: 30,
    },
    {
      id: 'att-2',
      sectionId: 'sec-2',
      sessionTitle: 'Week 1 Lab Attendance',
      date: '2025-02-17',
      presentCount: 23,
      totalCount: 28,
    },
  ]);

  // --- Modal state ---
  const [modal, setModal] = useState<{
    open: boolean;
    title: string;
    type: string;
    itemId: string;
  }>({
    open: false,
    title: '',
    type: '',
    itemId: '',
  });
  const [modalGrade, setModalGrade] = useState('');
  const [modalComment, setModalComment] = useState('');
  const [modalFile, setModalFile] = useState<File | null>(null);

  const openModal = (title: string, type: string, itemId: string = '') => {
    setModal({ open: true, title, type, itemId });
    setModalGrade('');
    setModalComment('');
    setModalFile(null);
  };
  const closeModal = () => setModal({ open: false, title: '', type: '', itemId: '' });
  const handleModalSubmit = () => {
    // Mock submit — just close
    closeModal();
  };

  const tabs: { key: DetailTab; label: string; icon: React.ElementType }[] = [
    { key: 'overview', label: 'Overview', icon: BookOpen },
    { key: 'sections-labs', label: 'Sections & Labs', icon: FileText },
    { key: 'lectures', label: 'Lectures', icon: Video },
    { key: 'materials', label: 'Materials', icon: FileText },
    { key: 'assignments', label: 'Assignments', icon: CheckCircle },
    { key: 'grading', label: 'Grading', icon: Sparkles },
    { key: 'attendance', label: 'Attendance', icon: Calendar },
    { key: 'students', label: 'Students', icon: Users },
    { key: 'announcements', label: 'Announcements', icon: Bell },
  ];

  const cardClass = `border rounded-lg p-4 sm:p-6 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`;
  const headingClass = `text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`;
  const subTextClass = isDark ? 'text-slate-400' : 'text-gray-600';
  const inputClass = `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-slate-400' : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'}`;

  const resetSectionForm = () => {
    setSectionForm({ name: '', schedule: '', room: '', capacity: 25 });
    setEditingSectionId(null);
    setShowSectionForm(false);
  };

  const resetLabForm = () => {
    setLabForm({
      title: '',
      sectionId: sections[0]?.id || '',
      day: '',
      time: '',
      room: '',
      instructorNotes: '',
    });
    setEditingLabId(null);
    setShowLabForm(false);
  };

  const saveSection = () => {
    if (!sectionForm.name.trim() || !sectionForm.schedule.trim() || !sectionForm.room.trim())
      return;
    if (editingSectionId) {
      setSections((prev) =>
        prev.map((section) =>
          section.id === editingSectionId ? { ...section, ...sectionForm } : section
        )
      );
    } else {
      setSections((prev) => [...prev, { id: `sec-${Date.now()}`, ...sectionForm }]);
    }
    resetSectionForm();
  };

  const saveLab = () => {
    if (!labForm.title.trim() || !labForm.sectionId || !labForm.day.trim() || !labForm.time.trim())
      return;
    if (editingLabId) {
      setLabs((prev) =>
        prev.map((lab) => (lab.id === editingLabId ? { ...lab, ...labForm } : lab))
      );
    } else {
      setLabs((prev) => [...prev, { id: `lab-${Date.now()}`, ...labForm }]);
    }
    resetLabForm();
  };

  const editSection = (section: SectionItem) => {
    setEditingSectionId(section.id);
    setSectionForm({
      name: section.name,
      schedule: section.schedule,
      room: section.room,
      capacity: section.capacity,
    });
    setShowSectionForm(true);
  };

  const editLab = (lab: LabItem) => {
    setEditingLabId(lab.id);
    setLabForm({
      title: lab.title,
      sectionId: lab.sectionId,
      day: lab.day,
      time: lab.time,
      room: lab.room,
      instructorNotes: lab.instructorNotes,
    });
    setShowLabForm(true);
  };

  const deleteSection = (sectionId: string) => {
    setSections((prev) => prev.filter((section) => section.id !== sectionId));
    setLabs((prev) => prev.filter((lab) => lab.sectionId !== sectionId));
  };

  const deleteLab = (labId: string) => {
    setLabs((prev) => prev.filter((lab) => lab.id !== labId));
  };

  const updateAttendanceCount = (sessionId: string, delta: number) => {
    setAttendanceSessions((prev) =>
      prev.map((session) => {
        if (session.id !== sessionId) return session;
        const nextPresent = Math.max(0, Math.min(session.totalCount, session.presentCount + delta));
        return { ...session, presentCount: nextPresent };
      })
    );
  };

  const assignedStudents = MOCK_STUDENTS.filter((student) => student.courses.includes(course.id));

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
          <h2
            className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
          >
            {course.name}
          </h2>
          <p className={`text-sm ${subTextClass}`}>
            {course.code} &middot; {course.semester} &middot; {course.instructor.name}
          </p>
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
                  : isDark
                    ? 'text-slate-400 hover:bg-white/10'
                    : 'text-gray-600 hover:bg-gray-100'
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
                  <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {course.pendingSubmissions > 0 && (
            <div
              className={`sm:col-span-2 lg:col-span-4 border rounded-lg p-4 ${isDark ? 'bg-orange-500/20 border-orange-500/30' : 'bg-orange-50 border-orange-200'}`}
            >
              <p
                className={`text-sm font-medium ${isDark ? 'text-orange-300' : 'text-orange-900'}`}
              >
                {course.pendingSubmissions} pending submissions require grading
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'sections-labs' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h3 className={headingClass}>Sections & Labs</h3>
            <div className="flex flex-wrap gap-2">
              <span
                className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'}`}
              >
                Scheduling set by Admin
              </span>
              <button
                onClick={() => setShowLabForm((prev) => !prev)}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm bg-emerald-600 text-white hover:bg-emerald-700"
              >
                <Plus className="w-4 h-4" /> Create Lab
              </button>
            </div>
          </div>

          {showLabForm && (
            <div className={cardClass}>
              <h4 className={`${headingClass} text-base mb-3`}>
                {editingLabId ? 'Edit Lab' : 'Create Lab'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  className={inputClass}
                  placeholder="Lab title"
                  value={labForm.title}
                  onChange={(e) => setLabForm((prev) => ({ ...prev, title: e.target.value }))}
                />
                <CleanSelect
                  className={inputClass}
                  value={labForm.sectionId}
                  onChange={(e) => setLabForm((prev) => ({ ...prev, sectionId: e.target.value }))}
                >
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.name}
                    </option>
                  ))}
                </CleanSelect>
                <input
                  className={inputClass}
                  placeholder="Day"
                  value={labForm.day}
                  onChange={(e) => setLabForm((prev) => ({ ...prev, day: e.target.value }))}
                />
                <input
                  className={inputClass}
                  placeholder="Time"
                  value={labForm.time}
                  onChange={(e) => setLabForm((prev) => ({ ...prev, time: e.target.value }))}
                />
                <input
                  className={inputClass}
                  placeholder="Room"
                  value={labForm.room}
                  onChange={(e) => setLabForm((prev) => ({ ...prev, room: e.target.value }))}
                />
                <input
                  className={inputClass}
                  placeholder="Instructor notes"
                  value={labForm.instructorNotes}
                  onChange={(e) =>
                    setLabForm((prev) => ({ ...prev, instructorNotes: e.target.value }))
                  }
                />
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={saveLab}
                  className="px-3 py-2 rounded-lg text-sm bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  Save
                </button>
                <button
                  onClick={resetLabForm}
                  className={`px-3 py-2 rounded-lg text-sm ${isDark ? 'bg-white/10 text-slate-300' : 'bg-gray-100 text-gray-700'}`}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className={cardClass}>
              <h4 className={`${headingClass} text-base mb-3`}>Sections</h4>
              <div className="space-y-2">
                {sections.map((section) => (
                  <div
                    key={section.id}
                    className={`p-3 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}
                  >
                    <div>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {section.name}
                      </p>
                      <p className={`text-xs ${subTextClass}`}>
                        {section.schedule} • {section.room} • cap {section.capacity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={cardClass}>
              <h4 className={`${headingClass} text-base mb-3`}>Labs</h4>
              <div className="space-y-2">
                {labs.map((lab) => {
                  const sectionName =
                    sections.find((s) => s.id === lab.sectionId)?.name || 'Unknown Section';
                  return (
                    <div
                      key={lab.id}
                      className={`p-3 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}
                    >
                      <div>
                        <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {lab.title}
                        </p>
                        <p className={`text-xs ${subTextClass}`}>
                          {sectionName} • {lab.day} {lab.time} • {lab.room}
                        </p>
                        {lab.instructorNotes && (
                          <p className={`text-xs mt-1 ${subTextClass}`}>{lab.instructorNotes}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'lectures' && (
        <div className={cardClass}>
          <h3 className={headingClass}>Lectures</h3>
          <div className="mt-4 space-y-3">
            {MOCK_LECTURES.map((lec) => (
              <div
                key={lec.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}
              >
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
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h3 className={headingClass}>Materials</h3>
            <button
              onClick={() => openModal('Upload Material', 'upload')}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm bg-blue-600 text-white hover:bg-blue-700"
            >
              <Upload className="w-4 h-4" /> Upload Material
            </button>
          </div>
          <div className={cardClass}>
            <h4
              className={`text-sm font-semibold mb-3 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}
            >
              Lab & Section Materials
            </h4>
            <div className="space-y-4">
              {MOCK_LECTURES.map((lec) => (
                <div key={lec.id}>
                  <h4
                    className={`text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}
                  >
                    {lec.title}
                  </h4>
                  {(MOCK_MATERIALS[lec.id] || []).length === 0 ? (
                    <p className={`text-sm italic ${subTextClass}`}>No materials uploaded yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {MOCK_MATERIALS[lec.id].map((mat) => (
                        <div
                          key={mat.id}
                          className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}
                        >
                          <div className="flex items-center gap-2">
                            {mat.type === 'video' ? (
                              <Video className="w-4 h-4 text-blue-500" />
                            ) : (
                              <FileText className="w-4 h-4 text-blue-500" />
                            )}
                            <span className={isDark ? 'text-white' : 'text-gray-900'}>
                              {mat.name}
                            </span>
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
                  <input
                    className={inputClass}
                    value={newAssignment.title}
                    onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                    placeholder="Assignment title"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${subTextClass}`}>
                    Due Date
                  </label>
                  <input
                    type="date"
                    className={inputClass}
                    value={newAssignment.dueDate}
                    onChange={(e) =>
                      setNewAssignment({ ...newAssignment, dueDate: e.target.value })
                    }
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={`block text-sm font-medium mb-1 ${subTextClass}`}>
                    Description
                  </label>
                  <textarea
                    className={inputClass}
                    rows={3}
                    value={newAssignment.description}
                    onChange={(e) =>
                      setNewAssignment({ ...newAssignment, description: e.target.value })
                    }
                    placeholder="Assignment description"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${subTextClass}`}>Type</label>
                  <CleanSelect
                    className={inputClass}
                    value={newAssignment.type}
                    onChange={(e) => setNewAssignment({ ...newAssignment, type: e.target.value })}
                  >
                    <option value="written">Written</option>
                    <option value="MCQ">MCQ</option>
                    <option value="project">Project</option>
                  </CleanSelect>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setShowAssignmentForm(false);
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium"
                  >
                    Save Assignment
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className={cardClass}>
            <div className="space-y-3">
              {MOCK_ASSIGNMENTS.map((a) => (
                <div
                  key={a.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}
                >
                  <div className="mb-2 sm:mb-0">
                    <div className="flex items-center gap-2">
                      <CheckCircle
                        className={`w-4 h-4 ${isDark ? 'text-green-400' : 'text-green-600'}`}
                      />
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {a.title}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-white/10 text-slate-300' : 'bg-gray-200 text-gray-700'}`}
                      >
                        {a.type}
                      </span>
                    </div>
                    <p className={`text-xs mt-1 ${subTextClass}`}>
                      Due: {a.dueDate} &middot; {a.submissions} submissions
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => openModal(`Submissions: ${a.title}`, 'view-submissions', a.id)}
                      className="text-xs px-3 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                    >
                      View Submissions
                    </button>
                    <button
                      onClick={() => openModal(`Edit: ${a.title}`, 'edit-assignment', a.id)}
                      className={`text-xs px-3 py-1 rounded-lg ${isDark ? 'bg-white/10 text-slate-300 hover:bg-white/20' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => openModal(`Grade: ${a.title}`, 'grade', a.id)}
                      className="text-xs px-3 py-1 rounded-lg bg-green-600 text-white hover:bg-green-700"
                    >
                      Grade
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'grading' && (
        <div className="space-y-4">
          <h3 className={headingClass}>Grading</h3>

          {/* Grade a Lab */}
          <div className={cardClass}>
            <h4
              className={`text-base font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}
            >
              Grade Lab
            </h4>
            <div className="space-y-3">
              {labs.map((lab) => {
                const sectionName = sections.find((s) => s.id === lab.sectionId)?.name || 'Section';
                return (
                  <div
                    key={lab.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}
                  >
                    <div>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {lab.title}
                      </span>
                      <p className={`text-xs ${subTextClass}`}>
                        {sectionName} • {lab.day} {lab.time}
                      </p>
                    </div>
                    <button
                      onClick={() => openModal(`Grade Lab: ${lab.title}`, 'grade-lab', lab.id)}
                      className="mt-2 sm:mt-0 text-xs px-3 py-1 rounded-lg bg-green-600 text-white hover:bg-green-700"
                    >
                      Grade Lab
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Grade Section Quiz */}
          <div className={cardClass}>
            <h4
              className={`text-base font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}
            >
              Grade Section Quiz
            </h4>
            <div className="space-y-3">
              {MOCK_ASSIGNMENTS.filter((a) => a.type === 'MCQ').map((a) => (
                <div
                  key={a.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}
                >
                  <div>
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {a.title}
                    </span>
                    <p className={`text-xs ${subTextClass}`}>
                      {a.submissions} submissions &middot; Due: {a.dueDate}
                    </p>
                  </div>
                  <button
                    onClick={() => openModal(`Grade Quiz: ${a.title}`, 'grade-quiz', a.id)}
                    className="mt-2 sm:mt-0 text-xs px-3 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Grade Quiz
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Grade Attendance */}
          <div className={cardClass}>
            <h4
              className={`text-base font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}
            >
              Grade Attendance
            </h4>
            <div className="space-y-3">
              {attendanceSessions.map((session) => {
                const section = sections.find((s) => s.id === session.sectionId);
                const rate = Math.round(
                  (session.presentCount / Math.max(1, session.totalCount)) * 100
                );
                return (
                  <div
                    key={session.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}
                  >
                    <div>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {session.sessionTitle}
                      </span>
                      <p className={`text-xs ${subTextClass}`}>
                        {section?.name || 'Section'} • {session.date} • {rate}% attendance
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        openModal(
                          `Grade Attendance: ${session.sessionTitle}`,
                          'grade-attendance',
                          session.id
                        )
                      }
                      className="mt-2 sm:mt-0 text-xs px-3 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Grade Attendance
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className={cardClass}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <h3 className={headingClass}>Attendance in Course</h3>
            <span
              className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'}`}
            >
              Integrated per section/lab
            </span>
          </div>
          <div className="space-y-3">
            {attendanceSessions.map((session) => {
              const section = sections.find((s) => s.id === session.sectionId);
              const attendanceRate = Math.round(
                (session.presentCount / Math.max(1, session.totalCount)) * 100
              );
              return (
                <div
                  key={session.id}
                  className={`p-3 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {session.sessionTitle}
                      </p>
                      <p className={`text-xs ${subTextClass}`}>
                        {session.date} • {section?.name || 'Section'} • {session.presentCount}/
                        {session.totalCount} present ({attendanceRate}%)
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateAttendanceCount(session.id, -1)}
                        className={`px-3 py-1 rounded text-sm ${isDark ? 'bg-white/10 text-slate-300 hover:bg-white/20' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                      >
                        -1
                      </button>
                      <button
                        onClick={() => updateAttendanceCount(session.id, 1)}
                        className="px-3 py-1 rounded text-sm bg-green-600 text-white hover:bg-green-700"
                      >
                        +1
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'students' && (
        <div className={cardClass}>
          <div className="flex items-center justify-between gap-2">
            <h3 className={headingClass}>Assigned Students</h3>
            <span
              className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}`}
            >
              Read-only
            </span>
          </div>
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
                {assignedStudents.map((s) => (
                  <tr
                    key={s.id}
                    className={`border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}
                  >
                    <td className={`py-2 pr-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {s.name}
                    </td>
                    <td className={`py-2 pr-4 hidden sm:table-cell ${subTextClass}`}>{s.email}</td>
                    <td className={`py-2 font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {s.grade}%
                    </td>
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
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {an.title}
                    </span>
                  </div>
                  <span className={`text-xs ${subTextClass}`}>{an.date}</span>
                </div>
                <p className={`text-sm ${subTextClass}`}>{an.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* --- Modal --- */}
      {modal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={closeModal}
        >
          <div
            className={`w-full max-w-md mx-4 rounded-xl shadow-2xl ${isDark ? 'bg-slate-800 border border-white/10' : 'bg-white border border-gray-200'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/10">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {modal.title}
              </h3>
              <button
                onClick={closeModal}
                className={`p-1 rounded-lg ${isDark ? 'hover:bg-white/10 text-slate-300' : 'hover:bg-gray-100 text-gray-600'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {modal.type === 'upload' ? (
                <>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${subTextClass}`}>
                      Select File
                    </label>
                    <input
                      type="file"
                      className={`w-full text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}
                      onChange={(e) => setModalFile(e.target.files?.[0] || null)}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${subTextClass}`}>
                      Description (optional)
                    </label>
                    <input
                      className={inputClass}
                      placeholder="Brief description"
                      value={modalComment}
                      onChange={(e) => setModalComment(e.target.value)}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${subTextClass}`}>
                      Grade / Score
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      className={inputClass}
                      placeholder="0 - 100"
                      value={modalGrade}
                      onChange={(e) => setModalGrade(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${subTextClass}`}>
                      Comment
                    </label>
                    <textarea
                      className={inputClass}
                      rows={3}
                      placeholder="Add a comment..."
                      value={modalComment}
                      onChange={(e) => setModalComment(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-white/10">
              <button
                onClick={closeModal}
                className={`px-4 py-2 rounded-lg text-sm ${isDark ? 'bg-white/10 text-slate-300 hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Cancel
              </button>
              <button
                onClick={handleModalSubmit}
                className="px-4 py-2 rounded-lg text-sm bg-blue-600 text-white hover:bg-blue-700"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Main CoursesPage ---
export function CoursesPage({
  courses,
  onViewCourse,
  disableDetailsReason,
  disableRouteNavigation = false,
  listOnly = false,
}: CoursesPageProps) {
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

  if (selectedCourse && !listOnly) {
    return (
      <CourseDetail
        course={selectedCourse}
        isDark={isDark}
        onBack={() => setSelectedCourseId(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('assignedCourses')}
          </h2>
          <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            {t('manageYourCourses')}
          </p>
        </div>
      </div>

      {/* Search */}
      <div
        className={`border rounded-lg p-4 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}
      >
        <input
          type="text"
          placeholder={t('searchCoursesPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-slate-400' : 'border-gray-300 text-gray-900 placeholder-gray-500'}`}
        />
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className={`border rounded-lg p-4 sm:p-6 hover:shadow-lg transition-shadow cursor-pointer ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}
            onClick={() => {
              if (disableDetailsReason) return;
              onViewCourse(course.id);
              if (!listOnly) setSelectedCourseId(course.id);
            }}
            title={disableDetailsReason || undefined}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <h3
                    className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
                  >
                    {course.name}
                  </h3>
                </div>
                <p className={`text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                  {t('code')}: {course.code}
                </p>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  {t('instructor')}: {course.instructor.name}
                </p>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  {course.semester}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className={`rounded-lg p-3 ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <FileText className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-gray-600'}`} />
                  <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                    {t('labs')}
                  </span>
                </div>
                <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {course.labCount}
                </p>
              </div>

              <div className={`rounded-lg p-3 ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Users className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-gray-600'}`} />
                  <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                    {t('students')}
                  </span>
                </div>
                <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {course.studentCount}
                </p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className={isDark ? 'text-slate-400' : 'text-gray-600'}>{t('avgGrade')}</span>
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {course.averageGrade}%
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className={isDark ? 'text-slate-400' : 'text-gray-600'}>
                  {t('attendance')}
                </span>
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {course.attendanceRate}%
                </span>
              </div>
            </div>

            {course.pendingSubmissions > 0 && (
              <div
                className={`border rounded-lg p-3 mb-4 ${isDark ? 'bg-orange-500/20 border-orange-500/30' : 'bg-orange-50 border-orange-200'}`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm font-medium ${isDark ? 'text-orange-300' : 'text-orange-900'}`}
                  >
                    {course.pendingSubmissions} {t('pendingSubmissions')}
                  </span>
                  <ArrowRight
                    className={`w-4 h-4 ${isDark ? 'text-orange-300' : 'text-orange-600'}`}
                  />
                </div>
              </div>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (disableDetailsReason) return;
                if (!disableRouteNavigation) {
                  navigate(`/tadashboard/courses/${course.id}`);
                }
                onViewCourse(course.id);
                if (!listOnly) setSelectedCourseId(course.id);
              }}
              disabled={Boolean(disableDetailsReason)}
              title={disableDetailsReason || undefined}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
            >
              {t('viewDetails')}
            </button>
          </div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div
          className={`text-center py-12 border rounded-lg ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}
        >
          <BookOpen
            className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-slate-400' : 'text-gray-400'}`}
          />
          <p className={isDark ? 'text-slate-400' : 'text-gray-600'}>{t('noCoursesFound')}</p>
        </div>
      )}
    </div>
  );
}

export default CoursesPage;

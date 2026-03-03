import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import {
  Beaker,
  Clock,
  Calendar,
  FileText,
  Upload,
  Download,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  Play,
  BookOpen,
  Users,
  MapPin,
  Award,
  Send,
  File,
  X,
  Eye,
  Code,
  Terminal
} from 'lucide-react';

interface LabSession {
  id: string;
  title: string;
  courseCode: string;
  courseName: string;
  instructor: string;
  date: string;
  time: string;
  room: string;
  status: 'upcoming' | 'in-progress' | 'completed' | 'missed';
  deliverable?: {
    title: string;
    dueDate: string;
    submitted: boolean;
    grade?: number;
    maxGrade: number;
  };
  instructions: string[];
  objectives: string[];
  resources: { name: string; type: string; size: string }[];
}

const labSessions: LabSession[] = [
  {
    id: '1',
    title: 'Lab 8: Database Indexing & Query Optimization',
    courseCode: 'CS220',
    courseName: 'Database Management Systems',
    instructor: 'Dr. James Wilson',
    date: 'December 5, 2025',
    time: '2:00 PM - 4:00 PM',
    room: 'Lab 302',
    status: 'upcoming',
    deliverable: {
      title: 'Query Optimization Report',
      dueDate: 'December 7, 2025 11:59 PM',
      submitted: false,
      maxGrade: 25
    },
    instructions: [
      'Create indexes on the provided database tables',
      'Analyze query execution plans before and after indexing',
      'Optimize at least 5 slow queries using appropriate techniques',
      'Document your optimization strategies and performance improvements',
      'Submit a detailed report with screenshots of execution plans'
    ],
    objectives: [
      'Understand how database indexes work',
      'Learn to analyze query execution plans',
      'Apply optimization techniques to improve query performance',
      'Document and present technical findings'
    ],
    resources: [
      { name: 'Lab8_Instructions.pdf', type: 'pdf', size: '245 KB' },
      { name: 'sample_database.sql', type: 'sql', size: '1.2 MB' },
      { name: 'query_samples.txt', type: 'txt', size: '12 KB' }
    ]
  },
  {
    id: '2',
    title: 'Lab 7: SQL Joins and Subqueries',
    courseCode: 'CS220',
    courseName: 'Database Management Systems',
    instructor: 'Dr. James Wilson',
    date: 'November 28, 2025',
    time: '2:00 PM - 4:00 PM',
    room: 'Lab 302',
    status: 'completed',
    deliverable: {
      title: 'SQL Joins Exercise',
      dueDate: 'November 30, 2025 11:59 PM',
      submitted: true,
      grade: 23,
      maxGrade: 25
    },
    instructions: [
      'Complete all join exercises in the worksheet',
      'Write subqueries for the advanced problems',
      'Test your queries against the sample database',
      'Submit your SQL file with all solutions'
    ],
    objectives: [
      'Master different types of SQL joins',
      'Understand when to use subqueries',
      'Practice writing complex queries'
    ],
    resources: [
      { name: 'Lab7_Worksheet.pdf', type: 'pdf', size: '180 KB' },
      { name: 'joins_database.sql', type: 'sql', size: '800 KB' }
    ]
  },
  {
    id: '3',
    title: 'Lab 5: React Native Navigation',
    courseCode: 'CS350',
    courseName: 'Mobile Application Development',
    instructor: 'Dr. Robert Taylor',
    date: 'December 6, 2025',
    time: '10:00 AM - 12:00 PM',
    room: 'Lab 401',
    status: 'upcoming',
    deliverable: {
      title: 'Navigation App Prototype',
      dueDate: 'December 8, 2025 11:59 PM',
      submitted: false,
      maxGrade: 30
    },
    instructions: [
      'Set up React Navigation in your project',
      'Implement stack, tab, and drawer navigation',
      'Create at least 5 screens with proper navigation flow',
      'Add deep linking support for at least 2 routes',
      'Test navigation on both iOS and Android simulators'
    ],
    objectives: [
      'Understand React Navigation architecture',
      'Implement multiple navigation patterns',
      'Handle navigation state and parameters',
      'Configure deep linking'
    ],
    resources: [
      { name: 'Lab5_Guide.pdf', type: 'pdf', size: '320 KB' },
      { name: 'starter_project.zip', type: 'zip', size: '2.5 MB' },
      { name: 'navigation_cheatsheet.pdf', type: 'pdf', size: '150 KB' }
    ]
  },
  {
    id: '4',
    title: 'Lab 4: State Management with Redux',
    courseCode: 'CS350',
    courseName: 'Mobile Application Development',
    instructor: 'Dr. Robert Taylor',
    date: 'November 22, 2025',
    time: '10:00 AM - 12:00 PM',
    room: 'Lab 401',
    status: 'completed',
    deliverable: {
      title: 'Redux Todo App',
      dueDate: 'November 24, 2025 11:59 PM',
      submitted: true,
      grade: 28,
      maxGrade: 30
    },
    instructions: [
      'Set up Redux store with proper configuration',
      'Create actions and reducers for todo operations',
      'Connect React components to Redux store',
      'Implement async actions with Redux Thunk'
    ],
    objectives: [
      'Understand Redux architecture and data flow',
      'Create and manage application state',
      'Handle asynchronous operations'
    ],
    resources: [
      { name: 'Lab4_Instructions.pdf', type: 'pdf', size: '280 KB' },
      { name: 'redux_template.zip', type: 'zip', size: '1.8 MB' }
    ]
  }
];

export function LabInstructions() {
  const { isDark, primaryHex } = useTheme() as any;
  const accentColor = primaryHex || '#3b82f6';
  const [selectedLab, setSelectedLab] = useState<LabSession | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const filteredLabs = filterStatus === 'all' 
    ? labSessions 
    : labSessions.filter(lab => lab.status === filterStatus);

  const upcomingLabs = labSessions.filter(l => l.status === 'upcoming' || l.status === 'in-progress');
  const completedLabs = labSessions.filter(l => l.status === 'completed');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'in-progress':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'missed':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachedFiles([...attachedFiles, ...Array.from(e.target.files)]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setAttachedFiles(attachedFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    setShowSubmitModal(true);
  };

  const confirmSubmit = () => {
    alert('Lab deliverable submitted successfully!');
    setShowSubmitModal(false);
    setAttachedFiles([]);
  };

  if (selectedLab) {
    return (
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => setSelectedLab(null)}
          className={`flex items-center gap-2 ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-800'} transition-colors`}
        >
          <ChevronRight className="w-5 h-5 rotate-180" />
          <span>Back to Labs</span>
        </button>

        {/* Lab Header */}
        <div className="bg-gradient-to-br from-blue-600 via-[var(--accent-color)] to-blue-600 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Beaker className="w-8 h-8" />
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedLab.status === 'upcoming' ? 'bg-blue-400/30' :
                  selectedLab.status === 'completed' ? 'bg-green-400/30' : 'bg-amber-400/30'
                }`}>
                  {selectedLab.status.charAt(0).toUpperCase() + selectedLab.status.slice(1)}
                </span>
              </div>
              <h1 className="text-3xl font-bold mb-2">{selectedLab.title}</h1>
              <p className="text-blue-100 text-lg">{selectedLab.courseName}</p>
              
              <div className="flex items-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{selectedLab.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{selectedLab.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{selectedLab.room}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Learning Objectives */}
            <div className="glass rounded-[2.5rem] overflow-hidden">
              <div className={`${isDark ? 'bg-white/5 border-b border-white/5' : 'bg-gradient-to-r from-background-light to-white border-b border-slate-100'} p-4`}>
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'} flex items-center gap-2`}>
                  <Award className="w-5 h-5 text-[var(--accent-color)]" />
                  Learning Objectives
                </h3>
              </div>
              <div className="p-4">
                <ul className="space-y-3">
                  {selectedLab.objectives.map((objective, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className={`${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Lab Instructions */}
            <div className="glass rounded-[2.5rem] overflow-hidden">
              <div className={`${isDark ? 'bg-white/5 border-b border-white/5' : 'bg-gradient-to-r from-background-light to-white border-b border-slate-100'} p-4`}>
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'} flex items-center gap-2`}>
                  <Terminal className="w-5 h-5 text-blue-500" />
                  Lab Instructions
                </h3>
              </div>
              <div className="p-4">
                <ol className="space-y-4">
                  {selectedLab.instructions.map((instruction, idx) => (
                    <li key={idx} className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-[var(--accent-color)]/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-[var(--accent-color)]">{idx + 1}</span>
                      </div>
                      <div className="flex-1 pt-1">
                        <p className={`${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{instruction}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Deliverable Submission */}
            {selectedLab.deliverable && selectedLab.status !== 'completed' && (
              <div className="glass rounded-[2.5rem] overflow-hidden">
                <div className={`${isDark ? 'bg-white/5 border-b border-white/5' : 'bg-gradient-to-r from-background-light to-white border-b border-slate-100'} p-4`}>
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'} flex items-center gap-2`}>
                    <Upload className="w-5 h-5 text-green-500" />
                    Submit Deliverable
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'} mt-1`}>
                    Due: {selectedLab.deliverable.dueDate}
                  </p>
                </div>
                <div className="p-4">
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-[var(--accent-color)] hover:bg-[var(--accent-color)]/10/50 transition-all mb-4">
                    <Upload className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                    <p className={`${isDark ? 'text-white' : 'text-slate-800'} mb-2 font-medium`}>Drop your files here</p>
                    <p className="text-slate-500 text-sm mb-4">or click to browse</p>
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent-color)] text-white rounded-lg cursor-pointer hover:opacity-90 transition-colors">
                      <FileText className="w-4 h-4" />
                      <span>Choose Files</span>
                      <input
                        type="file"
                        multiple
                        onChange={handleFileAttach}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {attachedFiles.length > 0 && (
                    <div className="mb-4 space-y-2">
                      {attachedFiles.map((file, idx) => (
                        <div key={idx} className={`flex items-center justify-between p-3 ${isDark ? 'bg-white/5' : 'bg-background-light'} rounded-lg`}>
                          <div className="flex items-center gap-3">
                            <File className="w-5 h-5 text-[var(--accent-color)]" />
                            <span className={`text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>{file.name}</span>
                          </div>
                          <button
                            onClick={() => handleRemoveFile(idx)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={attachedFiles.length === 0}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    <Send className="w-5 h-5" />
                    Submit Deliverable
                  </button>
                </div>
              </div>
            )}

            {/* Completed Submission */}
            {selectedLab.deliverable && selectedLab.status === 'completed' && (
              <div className={`${isDark ? 'bg-card-dark' : 'bg-white'} rounded-xl border border-green-200 overflow-hidden`}>
                <div className="bg-gradient-to-r from-green-50 to-white p-4 border-b border-green-200">
                  <h3 className="font-semibold text-green-900 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Submission Completed
                  </h3>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`${isDark ? 'text-white' : 'text-slate-800'} font-medium`}>{selectedLab.deliverable.title}</p>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Submitted on time</p>
                    </div>
                    {selectedLab.deliverable.grade !== undefined && (
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">
                          {selectedLab.deliverable.grade}/{selectedLab.deliverable.maxGrade}
                        </p>
                        <p className="text-sm text-slate-600">
                          {Math.round((selectedLab.deliverable.grade / selectedLab.deliverable.maxGrade) * 100)}%
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Resources */}
            <div className="glass rounded-[2.5rem] overflow-hidden">
              <div className={`${isDark ? 'bg-white/5 border-b border-white/5' : 'bg-gradient-to-r from-background-light to-white border-b border-slate-100'} p-4`}>
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'} flex items-center gap-2`}>
                  <Download className="w-5 h-5 text-blue-500" />
                  Lab Resources
                </h3>
              </div>
              <div className="p-4 space-y-2">
                {selectedLab.resources.map((resource, idx) => (
                  <button
                    key={idx}
                    className={`w-full flex items-center justify-between p-3 border ${isDark ? 'border-white/5' : 'border-slate-100'} rounded-lg hover:bg-[var(--accent-color)]/10 hover:border-[var(--accent-color)]/50 transition-all group`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[var(--accent-color)]/10 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-[var(--accent-color)]" />
                      </div>
                      <div className="text-left">
                        <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{resource.name}</p>
                        <p className="text-xs text-slate-500">{resource.size}</p>
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-slate-500 group-hover:text-[var(--accent-color)]" />
                  </button>
                ))}
              </div>
            </div>

            {/* Instructor */}
            <div className="glass rounded-[2.5rem] overflow-hidden">
              <div className={`${isDark ? 'bg-white/5 border-b border-white/5' : 'bg-gradient-to-r from-background-light to-white border-b border-slate-100'} p-4`}>
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Lab Instructor</h3>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[var(--accent-color)] to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {selectedLab.instructor.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{selectedLab.instructor}</p>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{selectedLab.courseCode}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Confirmation Modal */}
        {showSubmitModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${isDark ? 'bg-card-dark' : 'bg-white'} rounded-2xl p-8 max-w-md w-full shadow-2xl`}>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-green-600" />
              </div>
              <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-800'} text-center mb-2`}>Submit Lab Deliverable?</h2>
              <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} text-center mb-6`}>
                You are about to submit {attachedFiles.length} file(s) for {selectedLab.deliverable?.title}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className={`flex-1 px-4 py-3 border-2 ${isDark ? 'border-white/5 text-slate-300 hover:bg-white/5' : 'border-slate-100 text-slate-700 hover:bg-slate-50'} rounded-xl transition-all font-medium`}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSubmit}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-medium"
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 via-[var(--accent-color)] to-blue-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-3">
          <Beaker className="w-8 h-8" />
          <span className="text-sm bg-white/20 px-3 py-1 rounded-full">Lab Sessions</span>
        </div>
        <h1 className="text-3xl font-bold mb-2">Lab Instructions & Deliverables</h1>
        <p className="text-blue-100 text-lg">Access lab materials, view instructions, and submit your work</p>
        
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-sm text-blue-200 mb-1">Upcoming Labs</p>
            <p className="text-2xl font-bold">{upcomingLabs.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-sm text-blue-200 mb-1">Completed</p>
            <p className="text-2xl font-bold">{completedLabs.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-sm text-blue-200 mb-1">Pending Submissions</p>
            <p className="text-2xl font-bold">{upcomingLabs.filter(l => l.deliverable && !l.deliverable.submitted).length}</p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['all', 'upcoming', 'in-progress', 'completed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              filterStatus === status
                ? 'bg-[var(--accent-color)]/10 text-[var(--accent-color)] border-2 border-[var(--accent-color)]/30'
                : `${isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-50 text-slate-600'} border-2 border-transparent ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-200'}`
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Lab Sessions List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredLabs.map((lab) => (
          <div
            key={lab.id}
            className={`${isDark ? 'bg-card-dark border-white/5' : 'bg-white border-slate-100'} rounded-xl border-2 p-5 hover:border-[var(--accent-color)]/50 hover:shadow-lg transition-all cursor-pointer`}
            onClick={() => setSelectedLab(lab)}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-[var(--accent-color)]">{lab.courseCode}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(lab.status)}`}>
                    {lab.status.charAt(0).toUpperCase() + lab.status.slice(1)}
                  </span>
                </div>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{lab.title}</h3>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{lab.courseName}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500" />
            </div>

            <div className={`grid grid-cols-3 gap-4 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-4`}>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span>{lab.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <span>{lab.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-500" />
                <span>{lab.room}</span>
              </div>
            </div>

            {lab.deliverable && (
              <div className={`p-3 rounded-lg ${
                lab.deliverable.submitted ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {lab.deliverable.submitted ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                    )}
                    <span className={`text-sm font-medium ${
                      lab.deliverable.submitted ? 'text-green-700' : 'text-amber-700'
                    }`}>
                      {lab.deliverable.title}
                    </span>
                  </div>
                  {lab.deliverable.grade !== undefined ? (
                    <span className="text-sm font-bold text-green-600">
                      {lab.deliverable.grade}/{lab.deliverable.maxGrade}
                    </span>
                  ) : (
                    <span className="text-xs text-amber-600">Due: {lab.deliverable.dueDate.split(' ')[0]}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default LabInstructions;

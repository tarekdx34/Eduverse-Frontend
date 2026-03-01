import React, { useState, useCallback } from 'react';
import {
  Camera,
  Upload,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Calendar,
  Search,
  Save,
  Download,
  Edit2,
  X,
  Brain,
  Sparkles,
  Zap,
  History,
  Eye,
  Image as ImageIcon,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

// --- Types ---
type DetectedStudent = {
  studentId: number;
  studentName: string;
  status: 'present' | 'absent' | 'uncertain';
  confidence: number;
  manualOverride: boolean;
};

type AttendanceSession = {
  id: number;
  date: Date;
  labTitle: string;
  courseName: string;
  photoName: string;
  totalDetected: number;
  totalStudents: number;
  results: DetectedStudent[];
};

// --- Mock data generator ---
function generateMockAttendance(labTitle: string, courseName: string) {
  const students = [
    'Mohamed Ali',
    'Fatima Ahmed',
    'Omar Hassan',
    'Layla Mohamed',
    'Ahmed Youssef',
    'Sara Ibrahim',
    'Khaled Mansour',
    'Nour El-Din',
    'Mona Farid',
    'Hassan Mahmoud',
    'Dina Youssef',
    'Tarek Nabil',
    'Rania Hossam',
    'Amr Sayed',
    'Heba Mostafa',
    'Karim Ashraf',
    'Salma Hassan',
    'Mahmoud Ali',
    'Yasmin Khaled',
    'Adel Ibrahim',
  ];

  const results: DetectedStudent[] = students.map((name, index) => {
    const random = Math.random();
    let status: 'present' | 'absent' | 'uncertain';
    let confidence: number;

    if (random > 0.85) {
      status = 'absent';
      confidence = 0;
    } else if (random > 0.75) {
      status = 'uncertain';
      confidence = Math.floor(Math.random() * 20) + 50;
    } else {
      status = 'present';
      confidence = Math.floor(Math.random() * 20) + 80;
    }

    return { studentId: index + 1, studentName: name, status, confidence, manualOverride: false };
  });

  const totalDetected = results.filter((r) => r.status === 'present').length;
  return {
    date: new Date(),
    labTitle,
    courseName,
    totalDetected,
    totalStudents: students.length,
    results,
  };
}

// --- Processing Animation ---
function ProcessingAnimation({
  message,
  isDark,
  t,
}: {
  message: string;
  isDark: boolean;
  t: (key: string) => string;
}) {
  const [progress, setProgress] = React.useState(0);
  const [tipIdx, setTipIdx] = React.useState(0);
  const tips = [
    t('analyzingImage'),
    t('detectingFacesTip'),
    t('matchingStudents'),
    t('almostThere'),
    t('finalizingResults'),
  ];

  React.useEffect(() => {
    const pi = setInterval(() => setProgress((p) => Math.min(p + 2, 100)), 100);
    const ti = setInterval(() => setTipIdx((i) => (i + 1) % tips.length), 1500);
    return () => {
      clearInterval(pi);
      clearInterval(ti);
    };
  }, []);

  return (
    <div
      className={`flex flex-col items-center justify-center p-12 rounded-xl min-h-[400px] ${isDark ? 'bg-gradient-to-br from-indigo-500/10 to-purple-500/10' : 'bg-gradient-to-br from-indigo-50 to-purple-50'}`}
    >
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-indigo-400 rounded-full blur-xl opacity-30 animate-pulse" />
        <div className="relative p-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full">
          <Brain className="text-white animate-pulse" size={48} />
        </div>
        <div className="absolute -top-2 -right-2 animate-bounce">
          <Sparkles className="text-yellow-400" size={20} />
        </div>
        <div className="absolute -bottom-2 -left-2 animate-bounce">
          <Zap className="text-indigo-400" size={20} />
        </div>
      </div>
      <div className="relative mb-6" style={{ width: 140, height: 140 }}>
        <svg
          className="transform -rotate-90"
          width="140"
          height="140"
          viewBox="0 0 140 140"
          style={{ overflow: 'visible' }}
        >
          <circle
            cx="70"
            cy="70"
            r="60"
            stroke="currentColor"
            strokeWidth="10"
            fill="transparent"
            className={isDark ? 'text-white/10' : 'text-gray-200'}
          />
          <circle
            cx="70"
            cy="70"
            r="60"
            stroke="currentColor"
            strokeWidth="10"
            fill="transparent"
            strokeDasharray={`${2 * Math.PI * 60}`}
            strokeDashoffset={`${2 * Math.PI * 60 * (1 - progress / 100)}`}
            className="text-indigo-600 transition-all duration-300"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-3xl font-bold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
            {Math.round(progress)}%
          </span>
        </div>
      </div>
      <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {message}
      </h3>
      <p className={`text-sm mb-6 h-6 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
        {tips[tipIdx]}
      </p>
      <div
        className={`w-full max-w-md rounded-full h-2 overflow-hidden ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}
      >
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div
        className={`mt-6 p-4 rounded-lg max-w-md border ${isDark ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-yellow-50 border-yellow-200'}`}
      >
        <p className={`text-xs text-center ${isDark ? 'text-yellow-300' : 'text-yellow-800'}`}>
          <strong>{t('demoNote').split('.')[0]}.</strong>{' '}
          {t('demoNote').split('. ').slice(1).join('. ')}
        </p>
      </div>
    </div>
  );
}

// --- Main Component ---
export function AttendancePage() {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [view, setView] = useState<'upload' | 'processing' | 'results' | 'history'>('upload');
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [currentResults, setCurrentResults] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedLab, setSelectedLab] = useState('Lab 2: Control Structures');
  const [selectedCourse, setSelectedCourse] = useState('Introduction to Programming');

  const labs = [
    { lab: 'Lab 1: Basic Syntax and Variables', course: 'Introduction to Programming' },
    { lab: 'Lab 2: Control Structures', course: 'Introduction to Programming' },
    { lab: 'Lab 1: Arrays and Linked Lists', course: 'Data Structures' },
    { lab: 'Lab 1: Sorting Algorithms', course: 'Advanced Algorithms' },
  ];

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type.startsWith('image/') || file.name.match(/\.(jpg|jpeg|png)$/i))) {
      setSelectedFile(file);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleProcess = () => {
    if (!selectedFile) return;
    setView('processing');
    setTimeout(() => {
      const results = generateMockAttendance(selectedLab, selectedCourse);
      setCurrentResults({ ...results, photoName: selectedFile.name });
      setView('results');
    }, 5000);
  };

  const handleStatusChange = (studentId: number, newStatus: 'present' | 'absent' | 'uncertain') => {
    if (!currentResults) return;
    setCurrentResults({
      ...currentResults,
      results: currentResults.results.map((r: DetectedStudent) =>
        r.studentId === studentId ? { ...r, status: newStatus, manualOverride: true } : r
      ),
    });
  };

  const handleSave = () => {
    const newSession: AttendanceSession = {
      id: sessions.length + 1,
      date: currentResults.date,
      labTitle: currentResults.labTitle,
      courseName: currentResults.courseName,
      photoName: currentResults.photoName,
      totalDetected: currentResults.results.filter((r: DetectedStudent) => r.status === 'present')
        .length,
      totalStudents: currentResults.totalStudents,
      results: currentResults.results,
    };
    setSessions([newSession, ...sessions]);
    setCurrentResults(null);
    setSelectedFile(null);
    setView('upload');
  };

  const handleExport = () => {
    if (!currentResults) return;
    const csv = [
      ['Student ID', 'Student Name', 'Status', 'Confidence', 'Manual Override'],
      ...currentResults.results.map((r: DetectedStudent) => [
        r.studentId,
        r.studentName,
        r.status,
        r.manualOverride ? 'Manual' : r.confidence + '%',
        r.manualOverride ? 'Yes' : 'No',
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${selectedLab.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleViewHistoryDetails = (session: AttendanceSession) => {
    setCurrentResults(session);
    setView('results');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {t('aiPoweredAttendance')}
        </h2>
        <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
          {t('uploadPhotoDescription')}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className={`flex gap-2 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
        <button
          onClick={() => {
            setView('upload');
            setCurrentResults(null);
            setSelectedFile(null);
          }}
          className={`px-4 py-2 font-medium transition-colors ${
            view === 'upload' || view === 'processing'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : `${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-gray-500 hover:text-gray-700'}`
          }`}
        >
          {t('uploadPhoto')}
        </button>
        {view === 'results' && (
          <button className="px-4 py-2 font-medium text-indigo-600 border-b-2 border-indigo-600">
            {t('results')}
          </button>
        )}
        <button
          onClick={() => setView('history')}
          className={`px-4 py-2 font-medium transition-colors ${
            view === 'history'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : `${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-gray-500 hover:text-gray-700'}`
          }`}
        >
          {t('history')} ({sessions.length})
        </button>
      </div>

      {/* --- Upload View --- */}
      {view === 'upload' && (
        <div className="space-y-6">
          {/* Lab Selection */}
          <div
            className={`rounded-lg p-6 border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}
          >
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('selectLabSession')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {labs.map((l) => (
                <button
                  key={l.lab}
                  onClick={() => {
                    setSelectedLab(l.lab);
                    setSelectedCourse(l.course);
                  }}
                  className={`text-left p-4 rounded-lg border transition-colors ${
                    selectedLab === l.lab
                      ? `border-indigo-500 ${isDark ? 'bg-indigo-500/10' : 'bg-indigo-50'}`
                      : `${isDark ? 'border-white/10 hover:bg-white/10' : 'border-gray-200 hover:bg-gray-50'}`
                  }`}
                >
                  <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {l.lab}
                  </p>
                  <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                    {l.course}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Upload Zone */}
          <div
            className={`rounded-lg p-6 border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-3 rounded-lg ${isDark ? 'bg-indigo-500/20' : 'bg-indigo-100'}`}>
                <Camera className={isDark ? 'text-indigo-400' : 'text-indigo-600'} size={24} />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('uploadClassPhoto')}
                </h3>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  {t('uploadPhotoForAI')}
                </p>
              </div>
            </div>

            {!selectedFile ? (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                }}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                  isDragging
                    ? `border-indigo-500 ${isDark ? 'bg-indigo-500/10' : 'bg-indigo-50'}`
                    : `${isDark ? 'border-white/20 hover:border-indigo-400 hover:bg-white/10' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'}`
                }`}
              >
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={handleFileInput}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center gap-3">
                  <div
                    className={`p-4 rounded-full ${isDark ? 'bg-indigo-500/20' : 'bg-indigo-100'}`}
                  >
                    <Upload className={isDark ? 'text-indigo-400' : 'text-indigo-600'} size={32} />
                  </div>
                  <div>
                    <p
                      className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
                    >
                      {t('uploadClassPhoto')}
                    </p>
                    <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                      {t('dragAndDrop')}
                    </p>
                    <p className={`text-xs mt-2 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                      {t('maxSizeFormats')}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className={`border-2 rounded-xl p-6 ${isDark ? 'border-green-500/30 bg-green-500/10' : 'border-green-300 bg-green-50'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-lg ${isDark ? 'bg-green-500/20' : 'bg-green-100'}`}
                    >
                      <ImageIcon
                        className={isDark ? 'text-green-400' : 'text-green-600'}
                        size={24}
                      />
                    </div>
                    <div>
                      <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {selectedFile.name}
                      </p>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-red-500/20' : 'hover:bg-red-100'}`}
                  >
                    <X className={isDark ? 'text-red-400' : 'text-red-600'} size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Photo Guidelines */}
          <div
            className={`rounded-lg p-4 border ${isDark ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-200'}`}
          >
            <h4
              className={`font-semibold mb-2 ${isDark ? 'text-blue-300' : 'text-blue-900'} flex items-center gap-2`}
            >
              <Camera size={18} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
              {t('photoGuidelines')}
            </h4>
            <ul
              className={`text-sm space-y-1 list-disc list-inside ${isDark ? 'text-blue-300/80' : 'text-blue-800'}`}
            >
              <li>{t('guidelineVisible')}</li>
              <li>{t('guidelineLighting')}</li>
              <li>{t('guidelineBlurry')}</li>
              <li>{t('guidelineFacing')}</li>
            </ul>
          </div>

          {/* Process Button */}
          {selectedFile && (
            <button
              onClick={handleProcess}
              className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold flex items-center justify-center gap-2"
            >
              <Brain size={20} />
              {t('processWithAI')}
            </button>
          )}
        </div>
      )}

      {/* --- Processing View --- */}
      {view === 'processing' && (
        <ProcessingAnimation message={t('detectingFaces')} isDark={isDark} t={t} />
      )}

      {/* --- Results View --- */}
      {view === 'results' &&
        currentResults &&
        (() => {
          const results: DetectedStudent[] = currentResults.results;
          const presentCount = results.filter((r) => r.status === 'present').length;
          const absentCount = results.filter((r) => r.status === 'absent').length;
          const uncertainCount = results.filter((r) => r.status === 'uncertain').length;
          const uncertainStudents = results.filter((r) => r.status === 'uncertain');
          const absentStudents = results.filter((r) => r.status === 'absent');
          const presentStudents = results.filter((r) => r.status === 'present');

          return (
            <div className="space-y-6">
              {/* Summary Header */}
              <div
                className={`rounded-xl border p-6 shadow-sm ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {t('attendanceResults')}
                    </h3>
                    <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                      {currentResults.labTitle} • {currentResults.courseName} •{' '}
                      {currentResults.photoName}
                    </p>
                  </div>
                  <button
                    onClick={() => setEditMode(!editMode)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isDark ? 'text-indigo-400 hover:bg-indigo-500/10' : 'text-indigo-600 hover:bg-indigo-50'}`}
                  >
                    <Edit2 size={16} />
                    {editMode ? t('viewMode') : t('editMode')}
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
                  <div
                    className={`rounded-lg p-4 border ${isDark ? 'bg-transparent border-white/10' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <div
                      className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
                    >
                      {currentResults.totalStudents}
                    </div>
                    <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                      {t('totalStudents')}
                    </div>
                  </div>
                  <div
                    className={`rounded-lg p-4 border ${isDark ? 'bg-green-500/10 border-green-500/20' : 'bg-green-50 border-green-200'}`}
                  >
                    <div
                      className={`text-2xl font-bold ${isDark ? 'text-green-400' : 'text-green-700'}`}
                    >
                      {presentCount}
                    </div>
                    <div className={`text-sm ${isDark ? 'text-green-400/80' : 'text-green-600'}`}>
                      {t('present')}
                    </div>
                  </div>
                  <div
                    className={`rounded-lg p-4 border ${isDark ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-200'}`}
                  >
                    <div
                      className={`text-2xl font-bold ${isDark ? 'text-red-400' : 'text-red-700'}`}
                    >
                      {absentCount}
                    </div>
                    <div className={`text-sm ${isDark ? 'text-red-400/80' : 'text-red-600'}`}>
                      {t('absent')}
                    </div>
                  </div>
                  <div
                    className={`rounded-lg p-4 border ${isDark ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-yellow-50 border-yellow-200'}`}
                  >
                    <div
                      className={`text-2xl font-bold ${isDark ? 'text-yellow-400' : 'text-yellow-700'}`}
                    >
                      {uncertainCount}
                    </div>
                    <div className={`text-sm ${isDark ? 'text-yellow-400/80' : 'text-yellow-600'}`}>
                      {t('uncertain')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Needs Review */}
              {(uncertainStudents.length > 0 || absentStudents.length > 0) && (
                <div
                  className={`rounded-xl p-6 border-2 ${isDark ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-yellow-50 border-yellow-300'}`}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle
                      className={isDark ? 'text-yellow-400' : 'text-yellow-600'}
                      size={20}
                    />
                    <h4
                      className={`text-lg font-semibold ${isDark ? 'text-yellow-300' : 'text-yellow-900'}`}
                    >
                      {t('needsReview')} ({uncertainStudents.length + absentStudents.length}{' '}
                      {t('students')})
                    </h4>
                  </div>
                  <p
                    className={`text-sm mb-4 ${isDark ? 'text-yellow-300/80' : 'text-yellow-800'}`}
                  >
                    {t('needsReviewDescription')}
                  </p>
                  <div
                    className={`rounded-lg border shadow-sm overflow-hidden ${isDark ? 'bg-white/5 border-yellow-500/20' : 'bg-white border-yellow-200'}`}
                  >
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead
                          className={`border-b ${isDark ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-yellow-100 border-yellow-200'}`}
                        >
                          <tr>
                            <th
                              className={`px-3 md:px-6 py-3 text-left text-xs font-medium uppercase ${isDark ? 'text-yellow-300' : 'text-yellow-900'}`}
                            >
                              {t('student')}
                            </th>
                            <th
                              className={`px-3 md:px-6 py-3 text-left text-xs font-medium uppercase ${isDark ? 'text-yellow-300' : 'text-yellow-900'}`}
                            >
                              {t('status')}
                            </th>
                            <th
                              className={`px-3 md:px-6 py-3 text-left text-xs font-medium uppercase ${isDark ? 'text-yellow-300' : 'text-yellow-900'}`}
                            >
                              {t('confidence')}
                            </th>
                            {editMode && (
                              <th
                                className={`px-3 md:px-6 py-3 text-left text-xs font-medium uppercase ${isDark ? 'text-yellow-300' : 'text-yellow-900'}`}
                              >
                                {t('actions')}
                              </th>
                            )}
                          </tr>
                        </thead>
                        <tbody
                          className={`divide-y ${isDark ? 'divide-white/10' : 'divide-gray-200'}`}
                        >
                          {[...uncertainStudents, ...absentStudents].map((r) => (
                            <tr
                              key={r.studentId}
                              className={isDark ? 'hover:bg-white/10' : 'hover:bg-gray-50'}
                            >
                              <td className="px-3 md:px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-indigo-500/20' : 'bg-indigo-100'}`}
                                  >
                                    <span
                                      className={`font-semibold text-sm ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}
                                    >
                                      {r.studentName
                                        .split(' ')
                                        .map((n) => n[0])
                                        .join('')}
                                    </span>
                                  </div>
                                  <div>
                                    <div
                                      className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}
                                    >
                                      {r.studentName}
                                    </div>
                                    <div
                                      className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}
                                    >
                                      ID: {r.studentId}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-3 md:px-6 py-4">
                                {r.status === 'uncertain' && (
                                  <span
                                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${isDark ? 'bg-yellow-500/20 text-yellow-300' : 'bg-yellow-100 text-yellow-800'}`}
                                  >
                                    <AlertTriangle size={14} className="mr-1" />
                                    {t('uncertain')}
                                  </span>
                                )}
                                {r.status === 'absent' && (
                                  <span
                                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${isDark ? 'bg-red-500/20 text-red-300' : 'bg-red-100 text-red-800'}`}
                                  >
                                    <XCircle size={14} className="mr-1" />
                                    {t('absent')}
                                  </span>
                                )}
                                {r.manualOverride && (
                                  <span
                                    className={`ml-2 text-xs px-2 py-0.5 rounded font-medium ${isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'}`}
                                  >
                                    {t('manual')}
                                  </span>
                                )}
                              </td>
                              <td className="px-3 md:px-6 py-4">
                                {r.status !== 'absent' ? (
                                  <span
                                    className={`text-sm font-medium px-3 py-1 rounded-full ${
                                      r.confidence >= 80
                                        ? isDark
                                          ? 'bg-green-500/20 text-green-300'
                                          : 'bg-green-100 text-green-700'
                                        : r.confidence >= 60
                                          ? isDark
                                            ? 'bg-yellow-500/20 text-yellow-300'
                                            : 'bg-yellow-100 text-yellow-700'
                                          : isDark
                                            ? 'bg-red-500/20 text-red-300'
                                            : 'bg-red-100 text-red-700'
                                    }`}
                                  >
                                    {r.confidence}%
                                  </span>
                                ) : (
                                  <span
                                    className={`text-sm ${isDark ? 'text-slate-500' : 'text-gray-400'}`}
                                  >
                                    N/A
                                  </span>
                                )}
                              </td>
                              {editMode && (
                                <td className="px-3 md:px-6 py-4">
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleStatusChange(r.studentId, 'present')}
                                      className={`px-3 py-1 rounded text-xs font-medium ${r.status === 'present' ? 'bg-green-600 text-white' : isDark ? 'bg-white/10 text-slate-300 hover:bg-green-500/20' : 'bg-gray-100 text-gray-600 hover:bg-green-100'}`}
                                    >
                                      {t('present')}
                                    </button>
                                    <button
                                      onClick={() => handleStatusChange(r.studentId, 'absent')}
                                      className={`px-3 py-1 rounded text-xs font-medium ${r.status === 'absent' ? 'bg-red-600 text-white' : isDark ? 'bg-white/10 text-slate-300 hover:bg-red-500/20' : 'bg-gray-100 text-gray-600 hover:bg-red-100'}`}
                                    >
                                      {t('absent')}
                                    </button>
                                  </div>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* All Present Students */}
              <div
                className={`rounded-xl border shadow-sm overflow-hidden ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}
              >
                <div
                  className={`px-6 py-4 border-b ${isDark ? 'border-white/10 bg-transparent' : 'border-gray-200 bg-gray-50'}`}
                >
                  <h4
                    className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
                  >
                    {t('allStudents')} ({presentStudents.length} {t('present')})
                  </h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead
                      className={`border-b ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}
                    >
                      <tr>
                        <th
                          className={`px-3 md:px-6 py-3 text-left text-xs font-medium uppercase ${isDark ? 'text-slate-400' : 'text-gray-500'}`}
                        >
                          {t('student')}
                        </th>
                        <th
                          className={`px-3 md:px-6 py-3 text-left text-xs font-medium uppercase ${isDark ? 'text-slate-400' : 'text-gray-500'}`}
                        >
                          {t('status')}
                        </th>
                        <th
                          className={`px-3 md:px-6 py-3 text-left text-xs font-medium uppercase ${isDark ? 'text-slate-400' : 'text-gray-500'}`}
                        >
                          {t('confidence')}
                        </th>
                        {editMode && (
                          <th
                            className={`px-3 md:px-6 py-3 text-left text-xs font-medium uppercase ${isDark ? 'text-slate-400' : 'text-gray-500'}`}
                          >
                            {t('actions')}
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? 'divide-white/10' : 'divide-gray-200'}`}>
                      {presentStudents.map((r) => (
                        <tr
                          key={r.studentId}
                          className={isDark ? 'hover:bg-white/10' : 'hover:bg-gray-50'}
                        >
                          <td className="px-3 md:px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-indigo-500/20' : 'bg-indigo-100'}`}
                              >
                                <span
                                  className={`font-semibold text-sm ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}
                                >
                                  {r.studentName
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')}
                                </span>
                              </div>
                              <div>
                                <div
                                  className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}
                                >
                                  {r.studentName}
                                </div>
                                <div
                                  className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}
                                >
                                  ID: {r.studentId}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 md:px-6 py-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${isDark ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-800'}`}
                            >
                              <CheckCircle size={14} className="mr-1" />
                              {t('present')}
                            </span>
                            {r.manualOverride && (
                              <span
                                className={`ml-2 text-xs px-2 py-0.5 rounded font-medium ${isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'}`}
                              >
                                {t('manual')}
                              </span>
                            )}
                          </td>
                          <td className="px-3 md:px-6 py-4">
                            <span
                              className={`text-sm font-medium px-3 py-1 rounded-full ${
                                r.confidence >= 80
                                  ? isDark
                                    ? 'bg-green-500/20 text-green-300'
                                    : 'bg-green-100 text-green-700'
                                  : r.confidence >= 60
                                    ? isDark
                                      ? 'bg-yellow-500/20 text-yellow-300'
                                      : 'bg-yellow-100 text-yellow-700'
                                    : isDark
                                      ? 'bg-red-500/20 text-red-300'
                                      : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {r.confidence}%
                            </span>
                          </td>
                          {editMode && (
                            <td className="px-3 md:px-6 py-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleStatusChange(r.studentId, 'present')}
                                  className="px-3 py-1 rounded text-xs font-medium bg-green-600 text-white"
                                >
                                  {t('present')}
                                </button>
                                <button
                                  onClick={() => handleStatusChange(r.studentId, 'absent')}
                                  className={`px-3 py-1 rounded text-xs font-medium ${isDark ? 'bg-white/10 text-slate-300 hover:bg-red-500/20' : 'bg-gray-100 text-gray-600 hover:bg-red-100'}`}
                                >
                                  {t('absent')}
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <button
                  onClick={handleExport}
                  className={`flex items-center gap-2 px-4 py-2 border rounded-lg ${isDark ? 'border-white/10 text-slate-300 hover:bg-white/10' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  <Download size={18} />
                  {t('exportCSV')}
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setCurrentResults(null);
                      setSelectedFile(null);
                      setView('upload');
                    }}
                    className={`px-6 py-2 border rounded-lg ${isDark ? 'border-white/10 text-slate-300 hover:bg-white/10' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  >
                    {t('cancel')}
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    <Save size={18} />
                    {t('saveAttendance')}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

      {/* --- History View --- */}
      {view === 'history' && (
        <div className="space-y-4">
          {sessions.length === 0 ? (
            <div
              className={`rounded-xl border-2 border-dashed p-12 text-center ${isDark ? 'bg-transparent border-white/10' : 'bg-gray-50 border-gray-300'}`}
            >
              <History
                className={`mx-auto mb-4 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}
                size={48}
              />
              <h3
                className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
              >
                {t('noHistoryYet')}
              </h3>
              <p className={isDark ? 'text-slate-400' : 'text-gray-500'}>
                {t('noHistoryDescription')}
              </p>
            </div>
          ) : (
            sessions.map((session) => {
              const rate = ((session.totalDetected / session.totalStudents) * 100).toFixed(1);
              return (
                <div
                  key={session.id}
                  className={`rounded-lg border p-5 transition-shadow ${isDark ? 'bg-white/5 border-white/10 hover:shadow-lg hover:shadow-black/20' : 'bg-white border-gray-200 hover:shadow-md'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {session.labTitle}
                        </h4>
                        <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                          •
                        </span>
                        <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                          {session.courseName}
                        </span>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock
                            size={14}
                            className={isDark ? 'text-slate-500' : 'text-gray-400'}
                          />
                          <span className={isDark ? 'text-slate-400' : 'text-gray-600'}>
                            {new Date(session.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users
                            size={16}
                            className={isDark ? 'text-slate-500' : 'text-gray-400'}
                          />
                          <span className={isDark ? 'text-slate-400' : 'text-gray-600'}>
                            <span
                              className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
                            >
                              {session.totalDetected}
                            </span>
                            /{session.totalStudents} {t('detected')}
                          </span>
                        </div>
                        <div
                          className={`font-semibold ${parseFloat(rate) >= 80 ? (isDark ? 'text-green-400' : 'text-green-600') : parseFloat(rate) >= 60 ? (isDark ? 'text-yellow-400' : 'text-yellow-600') : isDark ? 'text-red-400' : 'text-red-600'}`}
                        >
                          {rate}% {t('attendance')}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewHistoryDetails(session)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isDark ? 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
                    >
                      <Eye size={16} />
                      {t('viewDetails')}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default AttendancePage;

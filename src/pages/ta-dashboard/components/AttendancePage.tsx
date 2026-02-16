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
    'Mohamed Ali', 'Fatima Ahmed', 'Omar Hassan', 'Layla Mohamed',
    'Ahmed Youssef', 'Sara Ibrahim', 'Khaled Mansour', 'Nour El-Din',
    'Mona Farid', 'Hassan Mahmoud', 'Dina Youssef', 'Tarek Nabil',
    'Rania Hossam', 'Amr Sayed', 'Heba Mostafa', 'Karim Ashraf',
    'Salma Hassan', 'Mahmoud Ali', 'Yasmin Khaled', 'Adel Ibrahim',
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
  return { date: new Date(), labTitle, courseName, totalDetected, totalStudents: students.length, results };
}

// --- Processing Animation ---
function ProcessingAnimation({ message }: { message: string }) {
  const [progress, setProgress] = React.useState(0);
  const [tipIdx, setTipIdx] = React.useState(0);
  const tips = ['Analyzing image...', 'Detecting faces...', 'Matching students...', 'Almost there...', 'Finalizing results...'];

  React.useEffect(() => {
    const pi = setInterval(() => setProgress((p) => Math.min(p + 2, 100)), 100);
    const ti = setInterval(() => setTipIdx((i) => (i + 1) % tips.length), 1500);
    return () => { clearInterval(pi); clearInterval(ti); };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-12 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl min-h-[400px]">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-indigo-400 rounded-full blur-xl opacity-30 animate-pulse" />
        <div className="relative p-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full">
          <Brain className="text-white animate-pulse" size={48} />
        </div>
        <div className="absolute -top-2 -right-2 animate-bounce"><Sparkles className="text-yellow-400" size={20} /></div>
        <div className="absolute -bottom-2 -left-2 animate-bounce"><Zap className="text-indigo-400" size={20} /></div>
      </div>
      <div className="relative mb-6" style={{ width: 140, height: 140 }}>
        <svg className="transform -rotate-90" width="140" height="140" viewBox="0 0 140 140" style={{ overflow: 'visible' }}>
          <circle cx="70" cy="70" r="60" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-gray-200" />
          <circle cx="70" cy="70" r="60" stroke="currentColor" strokeWidth="10" fill="transparent"
            strokeDasharray={`${2 * Math.PI * 60}`} strokeDashoffset={`${2 * Math.PI * 60 * (1 - progress / 100)}`}
            className="text-indigo-600 transition-all duration-300" strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-bold text-indigo-600">{Math.round(progress)}%</span>
        </div>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{message}</h3>
      <p className="text-sm text-gray-600 mb-6 h-6">{tips[tipIdx]}</p>
      <div className="w-full max-w-md bg-gray-200 rounded-full h-2 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-md">
        <p className="text-xs text-yellow-800 text-center"><strong>Note:</strong> This is a demo simulation. Real AI processing may vary.</p>
      </div>
    </div>
  );
}

// --- Main Component ---
export function AttendancePage() {
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
      totalDetected: currentResults.results.filter((r: DetectedStudent) => r.status === 'present').length,
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
        r.studentId, r.studentName, r.status,
        r.manualOverride ? 'Manual' : r.confidence + '%',
        r.manualOverride ? 'Yes' : 'No',
      ]),
    ].map((row) => row.join(',')).join('\n');

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
        <h2 className="text-2xl font-bold text-gray-900">AI-Powered Attendance</h2>
        <p className="text-gray-600 mt-1">Upload a photo of your lab/class and AI will detect and mark attendance automatically</p>
      </div>

      {/* AI Attendance Hero */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white shadow-md">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <Camera size={24} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">AI Face Detection Attendance</h3>
              <span className="px-2 py-0.5 bg-yellow-400 text-yellow-900 text-xs font-bold rounded">AI</span>
            </div>
            <p className="text-indigo-100 text-sm mt-0.5">
              Take a photo of your lab session and the AI will identify students and mark their attendance
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => { setView('upload'); setCurrentResults(null); setSelectedFile(null); }}
          className={`px-4 py-2 font-medium transition-colors ${
            view === 'upload' || view === 'processing'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Upload Photo
        </button>
        {view === 'results' && (
          <button className="px-4 py-2 font-medium text-indigo-600 border-b-2 border-indigo-600">
            Results
          </button>
        )}
        <button
          onClick={() => setView('history')}
          className={`px-4 py-2 font-medium transition-colors ${
            view === 'history'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          History ({sessions.length})
        </button>
      </div>

      {/* --- Upload View --- */}
      {view === 'upload' && (
        <div className="space-y-6">
          {/* Lab Selection */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Lab Session</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {labs.map((l) => (
                <button
                  key={l.lab}
                  onClick={() => { setSelectedLab(l.lab); setSelectedCourse(l.course); }}
                  className={`text-left p-4 rounded-lg border transition-colors ${
                    selectedLab === l.lab
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <p className="font-medium text-gray-900 text-sm">{l.lab}</p>
                  <p className="text-xs text-gray-500 mt-1">{l.course}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Upload Zone */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <Camera className="text-indigo-600" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Upload Class Photo</h3>
                <p className="text-sm text-gray-500">Upload a clear photo of your lab session for AI detection</p>
              </div>
            </div>

            {!selectedFile ? (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                  isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
                }`}
              >
                <input type="file" accept=".jpg,.jpeg,.png" onChange={handleFileInput} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <div className="flex flex-col items-center gap-3">
                  <div className="p-4 rounded-full bg-indigo-100">
                    <Upload className="text-indigo-600" size={32} />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900">Upload Class Photo</p>
                    <p className="text-sm text-gray-500 mt-1">Drag and drop or click to browse</p>
                    <p className="text-xs text-gray-400 mt-2">Max size: 5MB • Formats: .jpg, .jpeg, .png</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border-2 border-green-300 bg-green-50 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <ImageIcon className="text-green-600" size={24} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedFile(null)} className="p-2 hover:bg-red-100 rounded-lg transition-colors">
                    <X className="text-red-600" size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Photo Guidelines */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">📸 Photo Guidelines:</h4>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Ensure all students are clearly visible</li>
              <li>Good lighting and focus are important</li>
              <li>Avoid blurry or low-resolution images</li>
              <li>Students should face the camera</li>
            </ul>
          </div>

          {/* Process Button */}
          {selectedFile && (
            <button
              onClick={handleProcess}
              className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold flex items-center justify-center gap-2"
            >
              <Brain size={20} />
              Process with AI — Detect Students
            </button>
          )}
        </div>
      )}

      {/* --- Processing View --- */}
      {view === 'processing' && (
        <ProcessingAnimation message="Detecting faces and marking attendance..." />
      )}

      {/* --- Results View --- */}
      {view === 'results' && currentResults && (() => {
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
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Attendance Results</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {currentResults.labTitle} • {currentResults.courseName} • {currentResults.photoName}
                  </p>
                </div>
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="flex items-center gap-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <Edit2 size={16} />
                  {editMode ? 'View Mode' : 'Edit Mode'}
                </button>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-2xl font-bold text-gray-900">{currentResults.totalStudents}</div>
                  <div className="text-sm text-gray-600">Total Students</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="text-2xl font-bold text-green-700">{presentCount}</div>
                  <div className="text-sm text-green-600">Present</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <div className="text-2xl font-bold text-red-700">{absentCount}</div>
                  <div className="text-sm text-red-600">Absent</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <div className="text-2xl font-bold text-yellow-700">{uncertainCount}</div>
                  <div className="text-sm text-yellow-600">Uncertain</div>
                </div>
              </div>
            </div>

            {/* Needs Review */}
            {(uncertainStudents.length > 0 || absentStudents.length > 0) && (
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="text-yellow-600" size={20} />
                  <h4 className="text-lg font-semibold text-yellow-900">
                    Needs Review ({uncertainStudents.length + absentStudents.length} students)
                  </h4>
                </div>
                <p className="text-sm text-yellow-800 mb-4">These students need your attention. Please verify their attendance.</p>
                <div className="bg-white rounded-lg border border-yellow-200 shadow-sm overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-yellow-100 border-b border-yellow-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-yellow-900 uppercase">Student</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-yellow-900 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-yellow-900 uppercase">Confidence</th>
                        {editMode && <th className="px-6 py-3 text-left text-xs font-medium text-yellow-900 uppercase">Actions</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {[...uncertainStudents, ...absentStudents].map((r) => (
                        <tr key={r.studentId} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                <span className="text-indigo-600 font-semibold text-sm">
                                  {r.studentName.split(' ').map((n) => n[0]).join('')}
                                </span>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{r.studentName}</div>
                                <div className="text-xs text-gray-500">ID: {r.studentId}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {r.status === 'uncertain' && (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                                <AlertTriangle size={14} className="mr-1" />Uncertain
                              </span>
                            )}
                            {r.status === 'absent' && (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                                <XCircle size={14} className="mr-1" />Absent
                              </span>
                            )}
                            {r.manualOverride && (
                              <span className="ml-2 text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-medium">Manual</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {r.status !== 'absent' ? (
                              <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                                r.confidence >= 80 ? 'bg-green-100 text-green-700' :
                                r.confidence >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                              }`}>{r.confidence}%</span>
                            ) : <span className="text-sm text-gray-400">N/A</span>}
                          </td>
                          {editMode && (
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <button onClick={() => handleStatusChange(r.studentId, 'present')}
                                  className={`px-3 py-1 rounded text-xs font-medium ${r.status === 'present' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-green-100'}`}>
                                  Present
                                </button>
                                <button onClick={() => handleStatusChange(r.studentId, 'absent')}
                                  className={`px-3 py-1 rounded text-xs font-medium ${r.status === 'absent' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-red-100'}`}>
                                  Absent
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
            )}

            {/* All Present Students */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h4 className="text-lg font-semibold text-gray-900">All Students ({presentStudents.length} Present)</h4>
              </div>
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Confidence</th>
                    {editMode && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {presentStudents.map((r) => (
                    <tr key={r.studentId} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-indigo-600 font-semibold text-sm">
                              {r.studentName.split(' ').map((n) => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{r.studentName}</div>
                            <div className="text-xs text-gray-500">ID: {r.studentId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          <CheckCircle size={14} className="mr-1" />Present
                        </span>
                        {r.manualOverride && (
                          <span className="ml-2 text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-medium">Manual</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                          r.confidence >= 80 ? 'bg-green-100 text-green-700' :
                          r.confidence >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                        }`}>{r.confidence}%</span>
                      </td>
                      {editMode && (
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button onClick={() => handleStatusChange(r.studentId, 'present')}
                              className="px-3 py-1 rounded text-xs font-medium bg-green-600 text-white">Present</button>
                            <button onClick={() => handleStatusChange(r.studentId, 'absent')}
                              className="px-3 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600 hover:bg-red-100">Absent</button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                <Download size={18} />Export CSV
              </button>
              <div className="flex gap-3">
                <button onClick={() => { setCurrentResults(null); setSelectedFile(null); setView('upload'); }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancel</button>
                <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  <Save size={18} />Save Attendance
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
            <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
              <History className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No History Yet</h3>
              <p className="text-gray-500">AI attendance sessions will appear here after you process class photos</p>
            </div>
          ) : (
            sessions.map((session) => {
              const rate = ((session.totalDetected / session.totalStudents) * 100).toFixed(1);
              return (
                <div key={session.id} className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-900">{session.labTitle}</h4>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">{session.courseName}</span>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-gray-400" />
                          <span className="text-gray-600">{new Date(session.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users size={16} className="text-gray-400" />
                          <span className="text-gray-600">
                            <span className="font-semibold text-gray-900">{session.totalDetected}</span>/{session.totalStudents} detected
                          </span>
                        </div>
                        <div className={`font-semibold ${parseFloat(rate) >= 80 ? 'text-green-600' : parseFloat(rate) >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {rate}% attendance
                        </div>
                      </div>
                    </div>
                    <button onClick={() => handleViewHistoryDetails(session)}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100">
                      <Eye size={16} />View Details
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

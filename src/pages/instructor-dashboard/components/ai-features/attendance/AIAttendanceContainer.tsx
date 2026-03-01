import React, { useState } from 'react';
import { AIAttendanceUpload } from './AIAttendanceUpload';
import { AIAttendanceResults } from './AIAttendanceResults';
import { AIAttendanceHistory } from './AIAttendanceHistory';
import { useTheme } from '../../../contexts/ThemeContext';

interface AttendanceSession {
  id: number;
  date: Date;
  courseSection: string;
  photoName: string;
  totalDetected: number;
  totalStudents: number;
  results: any[];
}

interface AIAttendanceContainerProps {
  courseSection: string;
}

export function AIAttendanceContainer({ courseSection }: AIAttendanceContainerProps) {
  const [view, setView] = useState<'upload' | 'results' | 'history'>('upload');
  const [currentResults, setCurrentResults] = useState<any>(null);
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<AttendanceSession | null>(null);
  const { isDark, primaryHex } = useTheme() as any;

  const handleProcessingComplete = (results: any) => {
    setCurrentResults(results);
    setView('results');
  };

  const handleSave = (results: any[]) => {
    const newSession: AttendanceSession = {
      id: sessions.length + 1,
      date: currentResults.date,
      courseSection: currentResults.courseSection,
      photoName: currentResults.photoName,
      totalDetected: currentResults.totalDetected,
      totalStudents: currentResults.totalStudents,
      results,
    };

    setSessions([newSession, ...sessions]);
    setCurrentResults(null);
    setView('upload');
  };

  const handleCancel = () => {
    setCurrentResults(null);
    setView('upload');
  };

  const handleViewHistory = () => {
    setView('history');
  };

  const handleViewDetails = (session: AttendanceSession) => {
    setSelectedSession(session);
    setCurrentResults(session);
    setView('results');
  };

  const handleBackToUpload = () => {
    setSelectedSession(null);
    setCurrentResults(null);
    setView('upload');
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className={`flex gap-4 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
        <button
          onClick={handleBackToUpload}
          className={`px-4 py-2 font-semibold transition-all relative ${
            view === 'upload'
              ? isDark
                ? 'text-white'
                : 'text-indigo-600'
              : isDark
                ? 'text-slate-500 hover:text-slate-300'
                : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Upload Photo
          {view === 'upload' && (
            <div
              className="absolute bottom-0 left-0 right-0 h-0.5"
              style={{ backgroundColor: primaryHex || '#4f46e5' }}
            />
          )}
        </button>
        <button
          onClick={handleViewHistory}
          className={`px-4 py-2 font-semibold transition-all relative ${
            view === 'history'
              ? isDark
                ? 'text-white'
                : 'text-indigo-600'
              : isDark
                ? 'text-slate-500 hover:text-slate-300'
                : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          History ({sessions.length})
          {view === 'history' && (
            <div
              className="absolute bottom-0 left-0 right-0 h-0.5"
              style={{ backgroundColor: primaryHex || '#4f46e5' }}
            />
          )}
        </button>
      </div>

      {/* Content */}
      {view === 'upload' && !currentResults && (
        <AIAttendanceUpload
          onProcessingComplete={handleProcessingComplete}
          courseSection={courseSection}
        />
      )}

      {view === 'results' && currentResults && (
        <AIAttendanceResults
          results={currentResults.results}
          courseSection={currentResults.courseSection}
          photoName={currentResults.photoName}
          totalDetected={currentResults.totalDetected}
          totalStudents={currentResults.totalStudents}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      {view === 'history' && (
        <AIAttendanceHistory sessions={sessions} onViewDetails={handleViewDetails} />
      )}
    </div>
  );
}

export default AIAttendanceContainer;

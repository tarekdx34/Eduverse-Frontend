import React, { useState } from 'react';
import { AIAttendanceUpload } from './AIAttendanceUpload';
import { AIAttendanceResults } from './AIAttendanceResults';
import { AIAttendanceHistory } from './AIAttendanceHistory';

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
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={handleBackToUpload}
          className={`px-4 py-2 font-medium transition-colors ${
            view === 'upload'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Upload Photo
        </button>
        <button
          onClick={handleViewHistory}
          className={`px-4 py-2 font-medium transition-colors ${
            view === 'history'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          History ({sessions.length})
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

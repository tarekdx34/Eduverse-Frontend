/**
 * QuizList - Filterable list of quizzes with actions
 */

import React, { useState } from 'react';
import {
  ClipboardList,
  Users,
  Calendar,
  Clock,
  BarChart3,
  Search,
  Eye,
  Edit,
  Trash2,
  Loader2,
  Send,
  Lock,
  Plus,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { CustomDropdown } from '../CustomDropdown';
import { QuizUIData, STATUS_STYLES } from './types';
import { AttemptsList } from './AttemptsList';
import { QuizStatistics } from './QuizStatistics';
import { QuizAttempt, QuizStatistics as QuizStatsType } from '../../../../services/api/quizService';
import { Skeleton } from '../../../../components/ui/skeleton';

interface QuizListProps {
  quizzes: QuizUIData[];
  loading: boolean;
  error: string | null;
  courseOptions: { value: string; label: string }[];
  selectedCourse: string;
  onCourseChange: (courseId: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCreateClick: () => void;
  onEditClick: (quiz: QuizUIData) => void;
  onDeleteClick: (quiz: QuizUIData) => void;
  onPublishClick: (quiz: QuizUIData) => void;
  onCloseClick: (quiz: QuizUIData) => void;
  onViewAttemptsClick: (quiz: QuizUIData) => void;
  onViewStatsClick: (quiz: QuizUIData) => void;
  activePanel: 'none' | 'attempts' | 'grading' | 'statistics';
  selectedQuizId: string | null;
  fetchAttempts: (quizId: string) => Promise<QuizAttempt[]>;
  fetchStatistics: (quizId: string) => Promise<QuizStatsType>;
  onGradeClick: (quiz: QuizUIData, attemptId: string) => void;
}

export function QuizList({
  quizzes,
  loading,
  error,
  courseOptions,
  selectedCourse,
  onCourseChange,
  selectedStatus,
  onStatusChange,
  searchQuery,
  onSearchChange,
  onCreateClick,
  onEditClick,
  onDeleteClick,
  onPublishClick,
  onCloseClick,
  onViewAttemptsClick,
  onViewStatsClick,
  activePanel,
  selectedQuizId,
  fetchAttempts,
  fetchStatistics,
  onGradeClick,
}: QuizListProps) {
  const { isRTL } = useLanguage();
  const { isDark, primaryHex = '#3b82f6' } = useTheme() as any;

  // Inline panel loading states
  const [attemptsData, setAttemptsData] = useState<QuizAttempt[]>([]);
  const [statsData, setStatsData] = useState<QuizStatsType | null>(null);
  const [loadingAttempts, setLoadingAttempts] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Shared classes
  const cardCls = isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200';
  const headingCls = isDark ? 'text-white' : 'text-gray-900';
  const subCls = isDark ? 'text-slate-400' : 'text-gray-600';
  const emptyHeadingCls = isDark ? 'text-slate-200' : 'text-slate-800';
  const emptySubCls = isDark ? 'text-slate-400' : 'text-slate-500';
  const inputCls = isDark
    ? 'bg-white/5 border-white/10 text-white placeholder-slate-500'
    : 'bg-white border-gray-300 text-gray-900 placeholder-slate-400';
  const btnSecCls = isDark ? 'text-slate-300 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-50';
  const getStatusBadgeClass = (status: QuizStatus) => {
    if (status === 'published') {
      return isDark
        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
        : 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    }
    if (status === 'draft') {
      return isDark
        ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
        : 'bg-amber-50 text-amber-700 border border-amber-200';
    }
    if (status === 'closed') {
      return isDark
        ? 'bg-slate-500/20 text-slate-200 border border-slate-400/30'
        : 'bg-slate-100 text-slate-700 border border-slate-200';
    }
    return isDark
      ? 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
      : 'bg-rose-50 text-rose-700 border border-rose-200';
  };

  // Handle viewing attempts with data loading
  const handleViewAttempts = async (quiz: QuizUIData) => {
    if (selectedQuizId === quiz.id && activePanel === 'attempts') {
      onViewAttemptsClick(quiz);
      return;
    }
    
    setLoadingAttempts(true);
    try {
      const data = await fetchAttempts(quiz.id);
      setAttemptsData(Array.isArray(data) ? data : []);
      onViewAttemptsClick(quiz);
    } catch (err) {
      console.error('Failed to load attempts:', err);
    } finally {
      setLoadingAttempts(false);
    }
  };

  // Handle viewing statistics with data loading
  const handleViewStats = async (quiz: QuizUIData) => {
    if (selectedQuizId === quiz.id && activePanel === 'statistics') {
      onViewStatsClick(quiz);
      return;
    }
    
    setLoadingStats(true);
    try {
      const data = await fetchStatistics(quiz.id);
      setStatsData(data);
      onViewStatsClick(quiz);
    } catch (err) {
      console.error('Failed to load statistics:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  // Format date for display
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Not set';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderLoadingSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className={`rounded-xl p-4 sm:p-6 border shadow-sm ${cardCls}`}>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="h-4 w-1/2" />
            <div className="flex flex-wrap gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <div className={`mt-4 pt-4 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-9 w-28" />
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${headingCls}`}>Quizzes Management</h2>
          <p className={`${subCls} mt-1 text-sm`}>Create and manage quizzes for your courses</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onCreateClick}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors"
            style={{ backgroundColor: primaryHex }}
          >
            <Plus size={20} />
            Create New Quiz
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div className="w-full flex flex-col gap-1.5 sm:col-span-2 lg:col-span-1">
          <span className={`text-sm font-medium whitespace-nowrap ${subCls}`}>
            Search
          </span>
          <div className="relative w-full">
            <Search
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}
              size={18}
            />
            <input
              type="text"
              placeholder="Search quizzes..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className={`w-full h-10 pl-10 pr-4 border rounded-lg text-sm focus:outline-none focus:ring-2 ${inputCls}`}
              style={{ '--tw-ring-color': `${primaryHex}80` } as React.CSSProperties}
            />
          </div>
        </div>

        <CustomDropdown
          label="Course"
          value={selectedCourse}
          options={[
            { value: 'all', label: 'All Courses' },
            ...courseOptions,
          ]}
          onChange={(val) => onCourseChange(val as string)}
          stackLabel
          fullWidth
        />
        <CustomDropdown
          label="Status"
          value={selectedStatus}
          options={[
            { value: 'all', label: 'All' },
            { value: 'draft', label: 'Draft' },
            { value: 'published', label: 'Published' },
            { value: 'closed', label: 'Closed' },
            { value: 'archived', label: 'Archived' },
          ]}
          onChange={(val) => onStatusChange(val as string)}
          stackLabel
          fullWidth
        />
      </div>

      {/* Quiz Cards */}
      <div className="space-y-4" id="walkthrough-quizzes-list">
        {loading ? (
          renderLoadingSkeleton()
        ) : error ? (
          <div className={`p-4 rounded-lg border ${isDark ? 'border-red-500/40 bg-red-500/10 text-red-200' : 'border-red-200 bg-red-50 text-red-700'}`}>
            {error}
          </div>
        ) : quizzes.length === 0 ? (
          <div className={`p-8 text-center rounded-lg border ${cardCls}`}>
            <ClipboardList className={`mx-auto mb-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} size={48} />
            <h3 className={`text-lg font-semibold ${emptyHeadingCls} mb-2`}>No quizzes found</h3>
            <p className={`${emptySubCls} mb-4`}>Get started by creating your first quiz.</p>
            <button
              onClick={onCreateClick}
              className="inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors"
              style={{ backgroundColor: primaryHex }}
            >
              <Plus size={20} />
              Create New Quiz
            </button>
          </div>
        ) : (
          quizzes.map((quiz) => (
            <div key={quiz.id} className={`rounded-xl p-4 sm:p-6 border shadow-sm ${cardCls}`}>
              {/* Quiz Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h3 className={`text-lg font-semibold truncate ${headingCls}`}>
                      {quiz.title}
                    </h3>
                    <span
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: isDark ? `${primaryHex}2E` : `${primaryHex}1A`,
                        color: primaryHex,
                      }}
                    >
                      {quiz.courseName}
                    </span>
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${subCls} mb-4`}>
                    <Calendar size={14} />
                    <span>{formatDate(quiz.availableFrom)}</span>
                    {quiz.availableUntil && (
                      <>
                        <span>→</span>
                        <span>{formatDate(quiz.availableUntil)}</span>
                      </>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                    <div className="flex items-center gap-2 text-sm">
                      <ClipboardList size={16} className={isDark ? 'text-slate-500' : 'text-gray-400'} />
                      <span className={`${headingCls} font-medium`}>{quiz.questionCount}</span>
                      <span className={subCls}>Questions</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock size={16} className={isDark ? 'text-slate-500' : 'text-gray-400'} />
                      <span className={subCls}>
                        {quiz.timeLimitMinutes ? `${quiz.timeLimitMinutes} min` : 'No limit'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users size={16} className={isDark ? 'text-slate-500' : 'text-gray-400'} />
                      <span className={subCls}>
                        Max {quiz.maxAttempts} attempt{quiz.maxAttempts !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {quiz.passingScore && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className={subCls}>Pass: {quiz.passingScore}%</span>
                      </div>
                    )}
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium self-start ${getStatusBadgeClass(
                    quiz.status
                  )}`}
                >
                  {STATUS_STYLES[quiz.status].label}
                </span>
              </div>

              {/* Quiz Actions */}
              <div className={`flex flex-wrap items-center gap-2 pt-4 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                <button
                  onClick={() => handleViewAttempts(quiz)}
                  disabled={loadingAttempts && selectedQuizId === quiz.id}
                  className={`flex items-center gap-2 px-3 py-2 text-sm ${btnSecCls} focus:outline-none focus:ring-2 focus:ring-offset-1 rounded-lg transition-colors`}
                  style={{ '--tw-ring-color': primaryHex } as React.CSSProperties}
                >
                  {loadingAttempts && selectedQuizId === quiz.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Eye size={16} />
                  )}
                  View Attempts
                </button>
                <button
                  onClick={() => onEditClick(quiz)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm ${btnSecCls} focus:outline-none focus:ring-2 focus:ring-offset-1 rounded-lg transition-colors`}
                >
                  <Edit size={16} />
                  Edit
                </button>
                <button
                  onClick={() => handleViewStats(quiz)}
                  disabled={loadingStats && selectedQuizId === quiz.id}
                  className={`flex items-center gap-2 px-3 py-2 text-sm ${btnSecCls} focus:outline-none focus:ring-2 focus:ring-offset-1 rounded-lg transition-colors`}
                >
                  {loadingStats && selectedQuizId === quiz.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <BarChart3 size={16} />
                  )}
                  Statistics
                </button>
                <button
                  onClick={() => onDeleteClick(quiz)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                  Delete
                </button>

                {/* Status transition buttons */}
                {quiz.status === 'draft' && (
                  <button
                    onClick={() => onPublishClick(quiz)}
                    disabled={actionLoadingId === quiz.id}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-500 rounded-lg transition-colors ml-auto"
                  >
                    <Send size={16} />
                    Publish
                  </button>
                )}
                {quiz.status === 'published' && (
                  <button
                    onClick={() => onCloseClick(quiz)}
                    disabled={actionLoadingId === quiz.id}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-500/10 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-orange-500 rounded-lg transition-colors ml-auto"
                  >
                    <Lock size={16} />
                    Close
                  </button>
                )}
              </div>

              {/* Inline Attempts Panel */}
              {selectedQuizId === quiz.id && activePanel === 'attempts' && (
                <AttemptsList
                  attempts={attemptsData}
                  loading={loadingAttempts}
                  onGradeClick={(attemptId) => onGradeClick(quiz, attemptId)}
                />
              )}

              {/* Inline Statistics Panel */}
              {selectedQuizId === quiz.id && activePanel === 'statistics' && (
                <QuizStatistics
                  statistics={statsData}
                  loading={loadingStats}
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

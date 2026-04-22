/**
 * QuizzesDashboard - Main container component for quizzes management
 * Orchestrates all quiz sub-components
 */

import React, { useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../../../context/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { QuizList } from './QuizList';
import { QuizCreate } from './QuizCreate';
import { QuizEdit } from './QuizEdit';
import { AttemptsList } from './AttemptsList';
import { GradingPanel } from './GradingPanel';
import { QuizStatistics } from './QuizStatistics';
import { useQuizzes } from './hooks/useQuizzes';
import { QuizUIData, QuizFormData, DEFAULT_QUIZ_FORM } from './types';
import { ConfirmDialog } from '../ConfirmDialog';

export interface QuizzesDashboardProps {
  courses?: { id?: string; courseId?: string; name?: string; courseName?: string }[];
}

type ActivePanel = 'none' | 'attempts' | 'grading' | 'statistics';

export function QuizzesDashboard({ courses = [] }: QuizzesDashboardProps) {
  const { t } = useLanguage();
  const { isDark, primaryHex = '#3b82f6' } = useTheme() as any;
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const isMockMode = !isAuthenticated || Boolean(location.state?.isMock);

  // Normalize course options
  const courseOptions = React.useMemo(() => {
    const seen = new Set<string>();
    return courses
      .map((c) => {
        const value = String(c.courseId ?? c.id ?? '');
        const label = c.courseName || c.name || '';
        if (!value || !label) return null;
        return { value, label };
      })
      .filter((item): item is { value: string; label: string } => {
        if (!item || seen.has(item.value)) return false;
        seen.add(item.value);
        return true;
      });
  }, [courses]);

  // Quiz data hook
  const {
    filteredQuizzes,
    loading,
    error,
    selectedCourse,
    setSelectedCourse,
    selectedStatus,
    setSelectedStatus,
    searchQuery,
    setSearchQuery,
    refresh,
    deleteQuiz,
    updateQuizStatus,
    fetchQuizDetails,
    fetchAttempts,
    fetchStatistics,
  } = useQuizzes({ 
    limitToCourseIds: courseOptions.map(c => c.value) 
  });

  // Modal states
  const [showCreate, setShowCreate] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<QuizUIData | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<QuizUIData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Panel states (inline under quiz card)
  const [activePanel, setActivePanel] = useState<ActivePanel>('none');
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);

  // Action handlers
  const handleCreateClick = useCallback(() => {
    setShowCreate(true);
  }, []);

  const handleEditClick = useCallback((quiz: QuizUIData) => {
    setEditingQuiz(quiz);
  }, []);

  const handleDeleteClick = useCallback((quiz: QuizUIData) => {
    setQuizToDelete(quiz);
    setShowDeleteConfirm(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!quizToDelete) return;

    try {
      setIsDeleting(true);
      await deleteQuiz(quizToDelete.id);
      toast.success('Quiz deleted successfully');
      setShowDeleteConfirm(false);
      setQuizToDelete(null);
    } catch (err) {
      console.error('Failed to delete quiz:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to delete quiz');
    } finally {
      setIsDeleting(false);
    }
  }, [quizToDelete, deleteQuiz]);

  const handlePublishClick = useCallback(async (quiz: QuizUIData) => {
    try {
      await updateQuizStatus(quiz.id, 'published');
      toast.success('Quiz published successfully');
    } catch (err) {
      console.error('Failed to publish quiz:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to publish quiz');
    }
  }, [updateQuizStatus]);

  const handleCloseQuizClick = useCallback(async (quiz: QuizUIData) => {
    try {
      await updateQuizStatus(quiz.id, 'closed');
      toast.success('Quiz closed successfully');
    } catch (err) {
      console.error('Failed to close quiz:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to close quiz');
    }
  }, [updateQuizStatus]);

  const handleViewAttemptsClick = useCallback((quiz: QuizUIData) => {
    if (selectedQuizId === quiz.id && activePanel === 'attempts') {
      setActivePanel('none');
      setSelectedQuizId(null);
    } else {
      setSelectedQuizId(quiz.id);
      setActivePanel('attempts');
    }
  }, [selectedQuizId, activePanel]);

  const handleViewStatsClick = useCallback((quiz: QuizUIData) => {
    if (selectedQuizId === quiz.id && activePanel === 'statistics') {
      setActivePanel('none');
      setSelectedQuizId(null);
    } else {
      setSelectedQuizId(quiz.id);
      setActivePanel('statistics');
    }
  }, [selectedQuizId, activePanel]);

  const handleGradeClick = useCallback((quiz: QuizUIData, attemptId: string) => {
    setSelectedQuizId(quiz.id);
    setActivePanel('grading');
  }, []);

  const handleCreateSuccess = useCallback(() => {
    setShowCreate(false);
    refresh();
    toast.success('Quiz created successfully');
  }, [refresh]);

  const handleEditSuccess = useCallback(() => {
    setEditingQuiz(null);
    refresh();
    toast.success('Quiz updated successfully');
  }, [refresh]);

  const handleCreateCancel = useCallback(() => {
    setShowCreate(false);
  }, []);

  const handleEditCancel = useCallback(() => {
    setEditingQuiz(null);
  }, []);

  return (
    <div className="space-y-6">
      {isMockMode && (
        <div
          className={`rounded-xl border p-4 ${isDark ? 'border-white/10 bg-card-dark' : 'border-gray-200 bg-white'}`}
        >
          <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
            AI question generation is available inside <strong>Create New Quiz</strong> → Questions tab in{' '}
            <strong>Live mode</strong> (sign in without mock preview).
          </p>
        </div>
      )}

      {/* Quiz List with integrated actions */}
      <QuizList
        quizzes={filteredQuizzes}
        loading={loading}
        error={error}
        courseOptions={courseOptions}
        selectedCourse={selectedCourse}
        onCourseChange={setSelectedCourse}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCreateClick={handleCreateClick}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
        onPublishClick={handlePublishClick}
        onCloseClick={handleCloseQuizClick}
        onViewAttemptsClick={handleViewAttemptsClick}
        onViewStatsClick={handleViewStatsClick}
        activePanel={activePanel}
        selectedQuizId={selectedQuizId}
        fetchAttempts={fetchAttempts}
        fetchStatistics={fetchStatistics}
        onGradeClick={handleGradeClick}
      />

      {/* Create Quiz Modal */}
      {showCreate && (
        <QuizCreate
          courseOptions={courseOptions}
          onSuccess={handleCreateSuccess}
          onCancel={handleCreateCancel}
          isMockMode={isMockMode}
        />
      )}

      {/* Edit Quiz Modal */}
      {editingQuiz && (
        <QuizEdit
          quiz={editingQuiz}
          courseOptions={courseOptions}
          fetchQuizDetails={fetchQuizDetails}
          onSuccess={handleEditSuccess}
          onCancel={handleEditCancel}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete Quiz"
        message={`Are you sure you want to delete "${quizToDelete?.title}"? This action cannot be undone and will remove all associated questions and attempts.`}
        confirmText={isDeleting ? 'Deleting...' : 'Delete'}
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}

export default QuizzesDashboard;

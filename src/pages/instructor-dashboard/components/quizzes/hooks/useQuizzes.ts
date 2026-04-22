/**
 * useQuizzes Hook
 * Centralized data fetching and state management for quizzes list
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import QuizService, { Quiz, QuizAttempt, QuizStatistics } from '../../../../../services/api/quizService';
import { QuizUIData, mapQuizToUI, QuizStatus } from '../types';

export interface UseQuizzesOptions {
  courseId?: string;
  initialStatus?: 'all' | QuizStatus;
  limitToCourseIds?: string[]; // Optional: limit results to these courses if 'all' is selected
}

export interface UseQuizzesReturn {
  // Data
  quizzes: QuizUIData[];
  loading: boolean;
  error: string | null;

  // Filters
  selectedCourse: string;
  setSelectedCourse: (courseId: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Filtered results
  filteredQuizzes: QuizUIData[];

  // Actions
  refresh: () => void;
  deleteQuiz: (quizId: string) => Promise<void>;
  updateQuizStatus: (quizId: string, status: QuizStatus) => Promise<void>;

  // Detailed data fetchers
  fetchQuizDetails: (quizId: string) => Promise<Quiz & { questions?: any[] }>;
  fetchAttempts: (quizId: string) => Promise<QuizAttempt[]>;
  fetchStatistics: (quizId: string) => Promise<QuizStatistics>;
}

export function useQuizzes(options: UseQuizzesOptions = {}): UseQuizzesReturn {
  const { courseId: initialCourseId, initialStatus = 'all', limitToCourseIds } = options;

  // State
  const [quizzes, setQuizzes] = useState<QuizUIData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Filters
  const [selectedCourse, setSelectedCourse] = useState(initialCourseId || 'all');
  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatus);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch quizzes
  useEffect(() => {
    let cancelled = false;

    async function fetchQuizzes() {
      try {
        setLoading(true);
        setError(null);

        const params = selectedCourse !== 'all' ? { courseId: selectedCourse } : undefined;
        const response = await QuizService.getAll(params);
        
        if (cancelled) return;

        const liveQuizzes = response.data || [];
        const mapped = liveQuizzes.map(mapQuizToUI);
        setQuizzes(mapped);
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to load quizzes:', err);
        setError(err instanceof Error ? err.message : 'Failed to load quizzes');
        setQuizzes([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchQuizzes();

    return () => {
      cancelled = true;
    };
  }, [selectedCourse, refreshKey]);

  // Filtered quizzes based on search and status
  const filteredQuizzes = useMemo(() => {
    return quizzes.filter((quiz) => {
      // Search filter
      const matchesSearch = 
        searchQuery === '' ||
        quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quiz.courseName.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus = 
        selectedStatus === 'all' || 
        quiz.status === selectedStatus;

      // Course access filter
      const isAllowedCourse = 
        !limitToCourseIds || 
        limitToCourseIds.length === 0 || 
        limitToCourseIds.includes(String(quiz.courseId));

      return matchesSearch && matchesStatus && isAllowedCourse;
    });
  }, [quizzes, searchQuery, selectedStatus, limitToCourseIds]);

  // Refresh function
  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  // Delete quiz
  const deleteQuiz = useCallback(async (quizId: string) => {
    await QuizService.delete(quizId);
    refresh();
  }, [refresh]);

  // Update quiz status
  const updateQuizStatus = useCallback(async (quizId: string, status: QuizStatus) => {
    // The backend may use PATCH /status endpoint or we update via PUT
    // For now, we update using availableFrom to simulate status changes
    const now = new Date().toISOString();
    
    if (status === 'published') {
      await QuizService.update(quizId, { availableFrom: now });
    } else if (status === 'closed') {
      await QuizService.update(quizId, { availableUntil: now });
    } else if (status === 'draft') {
      await QuizService.update(quizId, { availableFrom: null as any, availableUntil: null as any });
    }
    
    refresh();
  }, [refresh]);

  // Fetch detailed quiz with questions
  const fetchQuizDetails = useCallback(async (quizId: string) => {
    return QuizService.getById(quizId);
  }, []);

  // Fetch attempts for a quiz
  const fetchAttempts = useCallback(async (quizId: string) => {
    return QuizService.getAttempts({ quizId });
  }, []);

  // Fetch statistics for a quiz
  const fetchStatistics = useCallback(async (quizId: string) => {
    return QuizService.getStatistics(quizId);
  }, []);

  return {
    quizzes,
    loading,
    error,
    selectedCourse,
    setSelectedCourse,
    selectedStatus,
    setSelectedStatus,
    searchQuery,
    setSearchQuery,
    filteredQuizzes,
    refresh,
    deleteQuiz,
    updateQuizStatus,
    fetchQuizDetails,
    fetchAttempts,
    fetchStatistics,
  };
}

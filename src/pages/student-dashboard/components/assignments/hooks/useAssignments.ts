import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { StudentAssignmentService } from '../assignmentService';
import type {
  Assignment,
  AssignmentSubmission,
  AssignmentWithSubmission,
  AssignmentStats,
  FilterState,
  FilterStatus,
  DueDateInfo,
} from '../types';

/**
 * Calculate due date information for an assignment
 */
export function getDueDateInfo(dueDate: string | null): DueDateInfo {
  if (!dueDate) {
    return {
      daysUntil: Infinity,
      isOverdue: false,
      isDueToday: false,
      isDueSoon: false,
      label: 'No due date',
      urgency: 'normal',
    };
  }

  const now = new Date();
  const due = new Date(dueDate);
  const diffTime = due.getTime() - now.getTime();
  const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysUntil < 0) {
    return {
      daysUntil,
      isOverdue: true,
      isDueToday: false,
      isDueSoon: false,
      label: 'Overdue',
      urgency: 'overdue',
    };
  }
  if (daysUntil === 0) {
    return {
      daysUntil,
      isOverdue: false,
      isDueToday: true,
      isDueSoon: true,
      label: 'Due Today',
      urgency: 'today',
    };
  }
  if (daysUntil === 1) {
    return {
      daysUntil,
      isOverdue: false,
      isDueToday: false,
      isDueSoon: true,
      label: 'Due Tomorrow',
      urgency: 'soon',
    };
  }
  if (daysUntil <= 3) {
    return {
      daysUntil,
      isOverdue: false,
      isDueToday: false,
      isDueSoon: true,
      label: `${daysUntil} days left`,
      urgency: 'soon',
    };
  }
  return {
    daysUntil,
    isOverdue: false,
    isDueToday: false,
    isDueSoon: false,
    label: `${daysUntil} days left`,
    urgency: 'normal',
  };
}

/**
 * Get submission status for an assignment
 */
export function getSubmissionStatus(
  submission: AssignmentSubmission | null | undefined
): FilterStatus {
  if (!submission) return 'pending';
  if (submission.submissionStatus === 'graded') return 'graded';
  if (submission.submissionStatus === 'submitted') return 'submitted';
  return 'pending';
}

/**
 * Main hook for managing assignments
 */
export function useAssignments(courseId?: string) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Map<string, AssignmentSubmission | null>>(
    new Map()
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    search: '',
    sortBy: 'dueDate',
    sortDirection: 'asc',
  });

  // Fetch all assignments
  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('[useAssignments] Fetching assignments...', courseId ? { courseId } : 'all');
      const response = await StudentAssignmentService.getAll(courseId ? { courseId } : undefined);
      console.log('[useAssignments] API Response:', response);
      
      // Handle paginated response: { data: [...], meta: {...} }
      const data = (response as any)?.data || response;
      let assignmentsArray = Array.isArray(data) ? data : Array.isArray(response) ? response : [];
      
      // Normalize field names: handle both 'id' and 'assignmentId'
      assignmentsArray = assignmentsArray.map((assignment: any) => ({
        ...assignment,
        id: assignment.id || assignment.assignmentId || String(assignment.assignment_id || ''),
      }));
      
      console.log('[useAssignments] Extracted data:', data);
      console.log('[useAssignments] Is Array?', Array.isArray(assignmentsArray));
      console.log('[useAssignments] Assignments array length:', assignmentsArray.length);
      setAssignments(assignmentsArray);

      // Fetch submission status for each assignment
      const submissionMap = new Map<string, AssignmentSubmission | null>();
      await Promise.all(
        assignmentsArray.map(async (assignment) => {
          try {
            const submission = await StudentAssignmentService.getMySubmission(assignment.id);
            submissionMap.set(assignment.id, submission);
          } catch (err) {
            console.warn(`[useAssignments] Failed to fetch submission for ${assignment.id}:`, err);
            submissionMap.set(assignment.id, null);
          }
        })
      );
      setSubmissions(submissionMap);
      console.log('[useAssignments] Fetch complete, total assignments:', assignmentsArray.length);
    } catch (err) {
      console.error('[useAssignments] Error:', err);
      const message = err instanceof Error ? err.message : 'Failed to load assignments';
      setError(message);
      setAssignments([]); // Set empty array on error
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  // Combine assignments with their submissions
  const assignmentsWithSubmissions: AssignmentWithSubmission[] = useMemo(() => {
    return assignments.map((assignment) => ({
      ...assignment,
      submission: submissions.get(assignment.id),
    }));
  }, [assignments, submissions]);

  // Filter and sort assignments
  const filteredAssignments = useMemo(() => {
    let result = [...assignmentsWithSubmissions];

    // Filter by status
    if (filters.status !== 'all') {
      result = result.filter((a) => {
        const status = getSubmissionStatus(a.submission);
        return status === filters.status;
      });
    }

    // Filter by search
    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(search) ||
          a.course?.name?.toLowerCase().includes(search) ||
          a.course?.code?.toLowerCase().includes(search)
      );
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (filters.sortBy) {
        case 'dueDate':
          const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
          const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
          comparison = dateA - dateB;
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'course':
          comparison = (a.course?.name || '').localeCompare(b.course?.name || '');
          break;
        case 'status':
          comparison = getSubmissionStatus(a.submission).localeCompare(
            getSubmissionStatus(b.submission)
          );
          break;
      }
      return filters.sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [assignmentsWithSubmissions, filters]);

  // Calculate statistics
  const stats: AssignmentStats = useMemo(() => {
    const total = assignments.length;
    const pending = assignmentsWithSubmissions.filter(
      (a) => getSubmissionStatus(a.submission) === 'pending'
    ).length;
    const submitted = assignmentsWithSubmissions.filter(
      (a) => getSubmissionStatus(a.submission) === 'submitted'
    ).length;
    const graded = assignmentsWithSubmissions.filter(
      (a) => getSubmissionStatus(a.submission) === 'graded'
    ).length;

    const gradedAssignments = assignmentsWithSubmissions.filter(
      (a) => a.submission?.score !== undefined
    );
    const totalPoints = assignments.reduce((sum, a) => sum + (parseFloat(a.maxScore) || 0), 0);
    const earnedPoints = gradedAssignments.reduce(
      (sum, a) => sum + (parseFloat(a.submission!.score!) || 0),
      0
    );

    const averageScore =
      gradedAssignments.length > 0
        ? gradedAssignments.reduce((sum, a) => {
            const score = parseFloat(a.submission!.score!) || 0;
            const max = parseFloat(a.maxScore) || 1;
            return sum + (score / max) * 100;
          }, 0) / gradedAssignments.length
        : null;

    return { total, pending, submitted, graded, averageScore, totalPoints, earnedPoints };
  }, [assignments, assignmentsWithSubmissions]);

  // Update filters
  const updateFilters = useCallback((updates: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  }, []);

  // Refresh submission for a specific assignment
  const refreshSubmission = useCallback(async (assignmentId: string) => {
    try {
      const submission = await StudentAssignmentService.getMySubmission(assignmentId);
      setSubmissions((prev) => new Map(prev).set(assignmentId, submission));
    } catch {
      // Ignore errors, keep existing submission
    }
  }, []);

  return {
    assignments: filteredAssignments,
    allAssignments: assignmentsWithSubmissions,
    stats,
    loading,
    error,
    filters,
    updateFilters,
    refetch: fetchAssignments,
    refreshSubmission,
  };
}

/**
 * Hook for a single assignment view
 */
export function useAssignment(assignmentId: string) {
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submission, setSubmission] = useState<AssignmentSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('[useAssignment] Fetching assignment:', assignmentId);
      
      // Fetch assignment first
      const assignmentResponse = await StudentAssignmentService.getById(assignmentId);
      console.log('[useAssignment] Assignment response:', assignmentResponse);
      
      // Handle possible paginated response for single assignment
      const assignmentData = (assignmentResponse as any)?.data || assignmentResponse;
      
      // Normalize field names: handle both 'id' and 'assignmentId'
      const normalizedAssignment = {
        ...assignmentData,
        id: (assignmentData as any).id || (assignmentData as any).assignmentId || assignmentId,
      };
      
      console.log('[useAssignment] Normalized assignment:', normalizedAssignment);
      setAssignment(normalizedAssignment as Assignment);
      
      // Fetch submission separately (don't fail if it doesn't exist)
      try {
        const submissionData = await StudentAssignmentService.getMySubmission(assignmentId);
        console.log('[useAssignment] Submission:', submissionData);
        setSubmission(submissionData);
      } catch (submissionErr) {
        console.log('[useAssignment] No submission found (this is OK)');
        setSubmission(null);
      }
    } catch (err) {
      console.error('[useAssignment] Error fetching assignment:', err);
      const message = err instanceof Error ? err.message : 'Failed to load assignment';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const refreshSubmission = useCallback(async () => {
    try {
      const submissionData = await StudentAssignmentService.getMySubmission(assignmentId);
      setSubmission(submissionData);
    } catch {
      // Ignore
    }
  }, [assignmentId]);

  return {
    assignment,
    submission,
    loading,
    error,
    refetch: fetch,
    refreshSubmission,
  };
}

/**
 * Hook for local storage draft management
 */
export function useDraftStorage(assignmentId: string) {
  const key = `assignment-draft-${assignmentId}`;

  const getDraft = useCallback((): string => {
    try {
      return localStorage.getItem(key) || '';
    } catch {
      return '';
    }
  }, [key]);

  const saveDraft = useCallback(
    (text: string) => {
      try {
        if (text) {
          localStorage.setItem(key, text);
        } else {
          localStorage.removeItem(key);
        }
      } catch {
        // Ignore storage errors
      }
    },
    [key]
  );

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore
    }
  }, [key]);

  return { getDraft, saveDraft, clearDraft };
}

/**
 * Hook for file validation
 */
export function useFileValidation(maxFileSize?: number, allowedFileTypes?: string[]) {
  const validateFile = useCallback(
    (file: File): { valid: boolean; error?: string } => {
      // Check file size
      if (maxFileSize && file.size > maxFileSize) {
        const maxMB = (maxFileSize / (1024 * 1024)).toFixed(1);
        return { valid: false, error: `File size exceeds ${maxMB}MB limit` };
      }

      // Check file type
      if (allowedFileTypes && allowedFileTypes.length > 0) {
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (!ext || !allowedFileTypes.includes(ext)) {
          return {
            valid: false,
            error: `File type not allowed. Accepted: ${allowedFileTypes.join(', ')}`,
          };
        }
      }

      return { valid: true };
    },
    [maxFileSize, allowedFileTypes]
  );

  return { validateFile };
}

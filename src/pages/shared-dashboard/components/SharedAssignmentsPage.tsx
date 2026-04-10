import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ThemeProvider as InstructorThemeProvider, useTheme } from '../../instructor-dashboard/contexts/ThemeContext';
import { LanguageProvider as InstructorLanguageProvider } from '../../instructor-dashboard/contexts/LanguageContext';
import { CustomDropdown } from '../../instructor-dashboard/components/CustomDropdown';
import { SelectedSectionSummary } from '../../instructor-dashboard/components/SelectedSectionSummary';
import { ConfirmDialog } from '../../instructor-dashboard/components/ConfirmDialog';
import {
  AssignmentListPage,
  AssignmentCreateEdit,
  SubmissionListView,
  GradingPanel,
  type AssignmentFormData,
} from '../../instructor-dashboard/components/instructor-assignments';
import {
  AssignmentService,
  type Assignment,
  type AssignmentSubmission,
} from '../../../services/api/assignmentService';
import { EnrollmentService } from '../../../services/api/enrollmentService';

interface SharedAssignmentsPageProps {
  role?: 'INSTRUCTOR' | 'TA';
}

const normalizeAssignments = (payload: unknown): Assignment[] => {
  if (Array.isArray(payload)) return payload as Assignment[];

  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj.data)) return obj.data as Assignment[];

    if (obj.data && typeof obj.data === 'object') {
      const nested = obj.data as Record<string, unknown>;
      if (Array.isArray(nested.data)) return nested.data as Assignment[];
    }
  }

  return [];
};

function SharedAssignmentsPageContent({ role = 'INSTRUCTOR' }: SharedAssignmentsPageProps) {
  const queryClient = useQueryClient();
  const { isDark } = useTheme() as any;

  const [activeSectionId, setActiveSectionId] = useState<string>('');
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [selectedAssignmentForSubmissions, setSelectedAssignmentForSubmissions] =
    useState<Assignment | null>(null);
  const [selectedSubmissionForGrading, setSelectedSubmissionForGrading] =
    useState<AssignmentSubmission | null>(null);
  const [assignmentToDelete, setAssignmentToDelete] = useState<string | null>(null);

  const { data: teachingCourses = [] } = useQuery<any[]>({
    queryKey: ['shared-teaching-courses'],
    queryFn: () => EnrollmentService.getTeachingCourses(),
  });

  const sectionOptions = useMemo(
    () =>
      (teachingCourses || []).map((course: any) => ({
        value: String(course.section?.id || course.sectionId),
        label: `${course.course?.code || 'COURSE'} - ${course.course?.name || 'Untitled'} (Sec ${course.section?.sectionNumber || course.sectionNumber || ''})`,
      })),
    [teachingCourses]
  );

  useEffect(() => {
    if (!activeSectionId && sectionOptions.length > 0) {
      setActiveSectionId(sectionOptions[0].value);
    }
  }, [activeSectionId, sectionOptions]);

  const selectedSection = useMemo(() => {
    if (!activeSectionId) return null;
    const liveSection =
      (teachingCourses || []).find(
        (s: any) => String(s.section?.id || s.sectionId || s.id) === activeSectionId
      ) || null;
    if (!liveSection) return null;

    const sectionNumber =
      liveSection.section?.sectionNumber ||
      liveSection.sectionNumber ||
      liveSection.sectionLabel ||
      liveSection.section?.id ||
      activeSectionId;

    return {
      courseCode: liveSection.course?.code || liveSection.courseCode || 'N/A',
      courseName: liveSection.course?.name || liveSection.courseName || 'Unknown Course',
      sectionLabel: `Sec ${sectionNumber}`,
      schedule: liveSection.schedule || liveSection.section?.schedule || 'TBD',
      capacity: Number(liveSection.section?.maxCapacity ?? liveSection.capacity ?? 0),
      enrolled: Number(liveSection.section?.currentEnrollment ?? liveSection.enrolledCount ?? 0),
    };
  }, [activeSectionId, teachingCourses]);

  const selectedCourseId = useMemo(() => {
    const selectedCourse = (teachingCourses || []).find(
      (course: any) => String(course.section?.id || course.sectionId) === activeSectionId
    );
    return selectedCourse ? String(selectedCourse.courseId ?? selectedCourse.course?.id) : '';
  }, [activeSectionId, teachingCourses]);

  const {
    data: assignmentsLive,
    isLoading: isLoadingAssignments,
  } = useQuery<unknown>({
    queryKey: ['shared-course-assignments', activeSectionId],
    queryFn: async () => {
      if (!activeSectionId) return [];
      return AssignmentService.getAll({ courseId: activeSectionId });
    },
    enabled: !!activeSectionId,
  });

  const assignmentsList = useMemo(() => normalizeAssignments(assignmentsLive), [assignmentsLive]);

  const {
    data: assignmentSubmissions = [],
    isLoading: isLoadingAssignmentSubmissions,
  } = useQuery<AssignmentSubmission[]>({
    queryKey: ['shared-assignment-submissions', selectedAssignmentForSubmissions?.id],
    queryFn: () => AssignmentService.getSubmissions(selectedAssignmentForSubmissions!.id),
    enabled: !!selectedAssignmentForSubmissions?.id,
  });

  const saveAssignmentMutation = useMutation({
    mutationFn: async (data: AssignmentFormData) => {
      const payload = {
        title: data.title,
        description: data.description || '',
        instructions: data.instructions || '',
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
        courseId: Number(selectedCourseId || activeSectionId),
        status: data.status,
        submissionType: data.submissionType,
        maxScore: data.maxScore,
        weight: data.weight,
      };

      if (data.id) {
        return AssignmentService.update(data.id, payload as any);
      }
      return AssignmentService.create(payload as any);
    },
    onSuccess: async () => {
      toast.success('Assignment saved successfully');
      await queryClient.invalidateQueries({ queryKey: ['shared-course-assignments', activeSectionId] });
      setIsAssignmentModalOpen(false);
      setEditingAssignment(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save assignment');
    },
  });

  const gradeSubmissionMutation = useMutation({
    mutationFn: async ({ submissionId, score, feedback }: { submissionId: string; score: number; feedback: string }) => {
      if (!selectedAssignmentForSubmissions?.id) throw new Error('No assignment selected.');
      return AssignmentService.gradeSubmission(selectedAssignmentForSubmissions.id, submissionId, score, feedback);
    },
    onSuccess: async () => {
      toast.success('Grade saved successfully');
      await queryClient.invalidateQueries({
        queryKey: ['shared-assignment-submissions', selectedAssignmentForSubmissions?.id],
      });
      setSelectedSubmissionForGrading(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save grade');
    },
  });

  const handleCreateAssignment = () => {
    setEditingAssignment(null);
    setIsAssignmentModalOpen(true);
  };

  const handleEditAssignment = async (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setIsAssignmentModalOpen(true);
    try {
      const fullAssignment = await AssignmentService.getById(assignment.id);
      setEditingAssignment(fullAssignment);
    } catch {
      // Keep modal usable with list data if fetching details fails.
    }
  };

  const handleDeleteAssignment = (id: string) => {
    setAssignmentToDelete(id);
  };

  const handleConfirmDeleteAssignment = async () => {
    if (!assignmentToDelete) return;
    try {
      await AssignmentService.delete(assignmentToDelete);
      toast.success('Assignment deleted successfully');
      await queryClient.invalidateQueries({ queryKey: ['shared-course-assignments', activeSectionId] });
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete assignment');
    }
    setAssignmentToDelete(null);
  };

  const handleAssignmentStatusChange = async (id: string, newStatus: Assignment['status']) => {
    try {
      await AssignmentService.changeStatus(id, newStatus);
      toast.success(`Assignment ${newStatus} successfully`);
      await queryClient.invalidateQueries({ queryKey: ['shared-course-assignments', activeSectionId] });
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update assignment status');
    }
  };

  const handleUploadInstructions = async (assignmentId: string, file: File) => {
    await AssignmentService.uploadInstructions(assignmentId, file);
    toast.success('Instructions uploaded successfully');
  };

  return (
    <div className="space-y-6" data-role={role}>
      <div>
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Assignments
        </h2>
        <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
          Create, publish, and grade assignments across teaching sections
        </p>
      </div>

      <div className="max-w-xs">
        <CustomDropdown
          label="Select Section"
          options={sectionOptions}
          value={activeSectionId || sectionOptions[0]?.value || ''}
          onChange={setActiveSectionId}
        />
      </div>

      <SelectedSectionSummary section={selectedSection as any} />

      <AssignmentListPage
        assignments={assignmentsList}
        onEdit={handleEditAssignment}
        onDelete={handleDeleteAssignment}
        onCreate={handleCreateAssignment}
        onStatusChange={handleAssignmentStatusChange}
        onViewSubmissions={setSelectedAssignmentForSubmissions}
        loading={isLoadingAssignments}
      />

      {selectedAssignmentForSubmissions && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Submissions: {selectedAssignmentForSubmissions.title}
            </h3>
            <button
              onClick={() => setSelectedAssignmentForSubmissions(null)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                isDark
                  ? 'border-white/10 text-slate-300 hover:bg-white/10'
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Hide Submissions
            </button>
          </div>

          <SubmissionListView
            submissions={assignmentSubmissions}
            maxScore={Number(selectedAssignmentForSubmissions.maxScore) || 100}
            onGrade={setSelectedSubmissionForGrading}
            onViewSubmission={setSelectedSubmissionForGrading}
            loading={isLoadingAssignmentSubmissions}
          />
        </div>
      )}

      <AssignmentCreateEdit
        open={isAssignmentModalOpen}
        assignment={editingAssignment}
        courseId={String(selectedCourseId || activeSectionId || '')}
        onClose={() => {
          setIsAssignmentModalOpen(false);
          setEditingAssignment(null);
        }}
        onSave={(data) => saveAssignmentMutation.mutateAsync(data)}
        onUploadInstructions={handleUploadInstructions}
      />

      <GradingPanel
        submission={selectedSubmissionForGrading}
        maxScore={
          selectedAssignmentForSubmissions
            ? Number(selectedAssignmentForSubmissions.maxScore) || 100
            : 100
        }
        latePenalty={selectedAssignmentForSubmissions?.latePenalty}
        onClose={() => setSelectedSubmissionForGrading(null)}
        onSave={async (submissionId, score, feedback) => {
          await gradeSubmissionMutation.mutateAsync({ submissionId, score, feedback });
        }}
      />

      <ConfirmDialog
        open={assignmentToDelete !== null}
        title="Delete Assignment"
        message="Are you sure you want to delete this assignment? This action cannot be undone."
        onConfirm={handleConfirmDeleteAssignment}
        onCancel={() => setAssignmentToDelete(null)}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}

export function SharedAssignmentsPage({ role = 'INSTRUCTOR' }: SharedAssignmentsPageProps) {
  return (
    <InstructorThemeProvider>
      <InstructorLanguageProvider>
        <SharedAssignmentsPageContent role={role} />
      </InstructorLanguageProvider>
    </InstructorThemeProvider>
  );
}

export default SharedAssignmentsPage;

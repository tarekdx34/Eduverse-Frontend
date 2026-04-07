import { ApiClient } from '../../../../services/api/client';
import type {
  Assignment,
  AssignmentSubmission,
  TextSubmissionPayload,
  LinkSubmissionPayload,
  FileIdSubmissionPayload,
} from './types';

/**
 * Student Assignment Service
 * Handles all assignment-related API calls for students
 */
export const StudentAssignmentService = {
  /**
   * Get all assignments for the current student
   * @param params - Optional filters (courseId)
   */
  async getAll(params?: { courseId?: string }): Promise<Assignment[]> {
    return ApiClient.get<Assignment[]>('/assignments', { params });
  },

  /**
   * Get a single assignment by ID
   * @param id - Assignment ID
   */
  async getById(id: string): Promise<Assignment> {
    return ApiClient.get<Assignment>(`/assignments/${id}`);
  },

  /**
   * Get the current student's submission for an assignment
   * @param assignmentId - Assignment ID
   * @returns Submission or null if not submitted
   */
  async getMySubmission(assignmentId: string): Promise<AssignmentSubmission | null> {
    try {
      return await ApiClient.get<AssignmentSubmission>(
        `/assignments/${assignmentId}/submissions/my`
      );
    } catch (error: unknown) {
      // 404 means no submission exists
      if (
        error instanceof Error &&
        (error.message?.includes('404') ||
          (error as { response?: { status?: number } }).response?.status === 404)
      ) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Submit assignment with text content
   * @param assignmentId - Assignment ID
   * @param text - Submission text
   */
  async submitText(assignmentId: string, text: string): Promise<AssignmentSubmission> {
    const payload: TextSubmissionPayload = { submissionText: text };
    return ApiClient.post<AssignmentSubmission>(`/assignments/${assignmentId}/submit`, payload);
  },

  /**
   * Submit assignment with a link
   * @param assignmentId - Assignment ID
   * @param link - Submission URL
   */
  async submitLink(assignmentId: string, link: string): Promise<AssignmentSubmission> {
    const payload: LinkSubmissionPayload = { submissionLink: link };
    return ApiClient.post<AssignmentSubmission>(`/assignments/${assignmentId}/submit`, payload);
  },

  /**
   * Submit assignment with a file ID (after upload)
   * @param assignmentId - Assignment ID
   * @param fileId - Drive file ID
   */
  async submitWithFileId(assignmentId: string, fileId: number): Promise<AssignmentSubmission> {
    const payload: FileIdSubmissionPayload = { fileId };
    return ApiClient.post<AssignmentSubmission>(`/assignments/${assignmentId}/submit`, payload);
  },

  /**
   * Upload a file and submit in one step
   * @param assignmentId - Assignment ID
   * @param file - File to upload
   * @param submissionText - Optional additional text
   */
  async submitFile(
    assignmentId: string,
    file: File,
    submissionText?: string
  ): Promise<AssignmentSubmission> {
    const formData = new FormData();
    formData.append('file', file);
    if (submissionText) {
      formData.append('submissionText', submissionText);
    }
    // Don't set Content-Type header - let browser set it with boundary
    return ApiClient.post<AssignmentSubmission>(`/assignments/${assignmentId}/submit`, formData);
  },

  /**
   * Upload a submission file to Google Drive (separate step)
   * @param assignmentId - Assignment ID
   * @param file - File to upload
   * @returns Object with fileId
   */
  async uploadSubmissionFile(assignmentId: string, file: File): Promise<{ fileId: number }> {
    const formData = new FormData();
    formData.append('file', file);
    // Don't set Content-Type header - let browser set it with boundary
    const response = await ApiClient.post<any>(
      `/assignments/${assignmentId}/submissions/upload`,
      formData
    );
    const fileId = response?.driveFile?.driveFileId || response?.driveFile?.id || response?.fileId || response?.id;
    return { fileId };
  },
};

export default StudentAssignmentService;

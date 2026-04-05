import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as AssignmentService from '../assignmentService';
import api from '../../../lib/axios';

// Mock axios
vi.mock('../../../lib/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('AssignmentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should fetch all assignments', async () => {
      const mockAssignments = [
        {
          id: 1,
          title: 'Assignment 1',
          description: 'Test assignment',
          status: 'published',
        },
      ];
      vi.mocked(api.get).mockResolvedValue({ data: mockAssignments });

      const result = await AssignmentService.getAll();

      expect(api.get).toHaveBeenCalledWith('/assignments');
      expect(result).toEqual(mockAssignments);
    });

    it('should handle errors', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('Network error'));

      await expect(AssignmentService.getAll()).rejects.toThrow('Network error');
    });
  });

  describe('getById', () => {
    it('should fetch assignment by id', async () => {
      const mockAssignment = {
        id: 1,
        title: 'Assignment 1',
        description: 'Test assignment',
      };
      vi.mocked(api.get).mockResolvedValue({ data: mockAssignment });

      const result = await AssignmentService.getById(1);

      expect(api.get).toHaveBeenCalledWith('/assignments/1');
      expect(result).toEqual(mockAssignment);
    });
  });

  describe('create', () => {
    it('should create a new assignment', async () => {
      const newAssignment = {
        title: 'New Assignment',
        description: 'Description',
        dueDate: '2026-12-31',
        maxScore: '100',
        courseId: 1,
      };
      const mockResponse = { id: 1, ...newAssignment };
      vi.mocked(api.post).mockResolvedValue({ data: mockResponse });

      const result = await AssignmentService.create(newAssignment);

      expect(api.post).toHaveBeenCalledWith('/assignments', newAssignment);
      expect(result).toEqual(mockResponse);
    });

    it('should handle validation errors', async () => {
      const invalidAssignment = { title: '' };
      vi.mocked(api.post).mockRejectedValue({
        response: { data: { message: 'Title is required' } },
      });

      await expect(
        AssignmentService.create(invalidAssignment as any)
      ).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update an assignment', async () => {
      const updateData = { title: 'Updated Title' };
      const mockResponse = { id: 1, ...updateData };
      vi.mocked(api.put).mockResolvedValue({ data: mockResponse });

      const result = await AssignmentService.update(1, updateData);

      expect(api.put).toHaveBeenCalledWith('/assignments/1', updateData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteAssignment', () => {
    it('should delete an assignment', async () => {
      vi.mocked(api.delete).mockResolvedValue({ data: { success: true } });

      await AssignmentService.deleteAssignment(1);

      expect(api.delete).toHaveBeenCalledWith('/assignments/1');
    });
  });

  describe('changeStatus', () => {
    it('should change assignment status', async () => {
      const mockResponse = { id: 1, status: 'published' };
      vi.mocked(api.patch).mockResolvedValue({ data: mockResponse });

      const result = await AssignmentService.changeStatus(1, 'published');

      expect(api.patch).toHaveBeenCalledWith('/assignments/1/status', {
        status: 'published',
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle invalid status', async () => {
      vi.mocked(api.patch).mockRejectedValue({
        response: { data: { message: 'Invalid status' } },
      });

      await expect(
        AssignmentService.changeStatus(1, 'invalid' as any)
      ).rejects.toThrow();
    });
  });

  describe('uploadInstructions', () => {
    it('should upload instruction file', async () => {
      const file = new File(['content'], 'instructions.pdf', {
        type: 'application/pdf',
      });
      const mockResponse = {
        id: 1,
        instructionFile: 'instructions.pdf',
        instructionFileId: 'file123',
      };
      vi.mocked(api.post).mockResolvedValue({ data: mockResponse });

      const result = await AssignmentService.uploadInstructions(1, file);

      expect(api.post).toHaveBeenCalledWith(
        '/assignments/1/instructions',
        expect.any(FormData),
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle upload errors', async () => {
      const file = new File(['content'], 'large-file.pdf', {
        type: 'application/pdf',
      });
      vi.mocked(api.post).mockRejectedValue({
        response: { data: { message: 'File too large' } },
      });

      await expect(
        AssignmentService.uploadInstructions(1, file)
      ).rejects.toThrow();
    });
  });

  describe('getSubmissions', () => {
    it('should fetch all submissions for an assignment', async () => {
      const mockSubmissions = [
        {
          id: 1,
          studentId: 1,
          assignmentId: 1,
          submissionText: 'My submission',
          grade: '90',
        },
      ];
      vi.mocked(api.get).mockResolvedValue({ data: mockSubmissions });

      const result = await AssignmentService.getSubmissions(1);

      expect(api.get).toHaveBeenCalledWith('/assignments/1/submissions');
      expect(result).toEqual(mockSubmissions);
    });
  });

  describe('gradeSubmission', () => {
    it('should grade a submission', async () => {
      const gradeData = {
        grade: '85',
        feedback: 'Good work!',
      };
      const mockResponse = { id: 1, ...gradeData };
      vi.mocked(api.patch).mockResolvedValue({ data: mockResponse });

      const result = await AssignmentService.gradeSubmission(1, 1, gradeData);

      expect(api.patch).toHaveBeenCalledWith(
        '/assignments/1/submissions/1/grade',
        gradeData
      );
      expect(result).toEqual(mockResponse);
    });

    it('should validate grade bounds', async () => {
      const invalidGrade = { grade: '150', feedback: 'Invalid' };
      vi.mocked(api.patch).mockRejectedValue({
        response: { data: { message: 'Grade exceeds maximum' } },
      });

      await expect(
        AssignmentService.gradeSubmission(1, 1, invalidGrade)
      ).rejects.toThrow();
    });
  });

  describe('uploadSubmissionFile', () => {
    it('should upload a submission file', async () => {
      const file = new File(['content'], 'homework.pdf', {
        type: 'application/pdf',
      });
      const mockResponse = {
        id: 1,
        submissionFile: 'homework.pdf',
        submissionFileId: 'file456',
      };
      vi.mocked(api.post).mockResolvedValue({ data: mockResponse });

      const result = await AssignmentService.uploadSubmissionFile(1, file);

      expect(api.post).toHaveBeenCalledWith(
        '/assignments/1/submissions/upload',
        expect.any(FormData),
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('submitText', () => {
    it('should submit text submission', async () => {
      const text = 'This is my answer to the assignment.';
      const mockResponse = {
        id: 1,
        submissionText: text,
        submittedAt: '2026-04-05T14:30:00Z',
      };
      vi.mocked(api.post).mockResolvedValue({ data: mockResponse });

      const result = await AssignmentService.submitText(1, text);

      expect(api.post).toHaveBeenCalledWith('/assignments/1/submissions', {
        submissionType: 'text',
        submissionText: text,
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle empty text', async () => {
      vi.mocked(api.post).mockRejectedValue({
        response: { data: { message: 'Submission text is required' } },
      });

      await expect(AssignmentService.submitText(1, '')).rejects.toThrow();
    });
  });

  describe('submitLink', () => {
    it('should submit link submission', async () => {
      const link = 'https://github.com/user/project';
      const mockResponse = {
        id: 1,
        submissionLink: link,
        submittedAt: '2026-04-05T14:30:00Z',
      };
      vi.mocked(api.post).mockResolvedValue({ data: mockResponse });

      const result = await AssignmentService.submitLink(1, link);

      expect(api.post).toHaveBeenCalledWith('/assignments/1/submissions', {
        submissionType: 'link',
        submissionLink: link,
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle invalid URL', async () => {
      vi.mocked(api.post).mockRejectedValue({
        response: { data: { message: 'Invalid URL format' } },
      });

      await expect(
        AssignmentService.submitLink(1, 'not-a-url')
      ).rejects.toThrow();
    });
  });

  describe('submitWithFileId', () => {
    it('should submit with Google Drive file ID', async () => {
      const fileId = 'drive-file-123';
      const mockResponse = {
        id: 1,
        submissionFileId: fileId,
        submittedAt: '2026-04-05T14:30:00Z',
      };
      vi.mocked(api.post).mockResolvedValue({ data: mockResponse });

      const result = await AssignmentService.submitWithFileId(1, fileId);

      expect(api.post).toHaveBeenCalledWith('/assignments/1/submissions', {
        submissionType: 'file',
        fileId: fileId,
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getMySubmission', () => {
    it('should fetch student own submission', async () => {
      const mockSubmission = {
        id: 1,
        studentId: 1,
        assignmentId: 1,
        submissionText: 'My work',
        grade: '95',
      };
      vi.mocked(api.get).mockResolvedValue({ data: mockSubmission });

      const result = await AssignmentService.getMySubmission(1);

      expect(api.get).toHaveBeenCalledWith('/assignments/1/my-submission');
      expect(result).toEqual(mockSubmission);
    });

    it('should handle no submission found', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: null });

      const result = await AssignmentService.getMySubmission(1);

      expect(result).toBeNull();
    });
  });
});

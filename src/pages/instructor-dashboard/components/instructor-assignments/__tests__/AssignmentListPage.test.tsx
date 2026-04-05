import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../../../../../test/test-utils';
import { AssignmentListPage } from '../AssignmentListPage';
import * as AssignmentService from '../../../../../../services/api/assignmentService';

vi.mock('../../../../../../services/api/assignmentService');

const mockAssignments = [
  {
    id: 1,
    title: 'Assignment 1',
    description: 'Test description',
    status: 'published' as const,
    dueDate: '2026-12-31T23:59:59Z',
    maxScore: '100',
    weight: '10',
    submissionType: 'any' as const,
    courseId: 1,
  },
  {
    id: 2,
    title: 'Assignment 2',
    description: 'Draft assignment',
    status: 'draft' as const,
    dueDate: '2026-12-25T23:59:59Z',
    maxScore: '50',
    weight: '5',
    submissionType: 'file' as const,
    courseId: 1,
  },
];

describe('AssignmentListPage', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnViewSubmissions = vi.fn();
  const mockOnChangeStatus = vi.fn();
  const mockOnUploadInstructions = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render assignment list', () => {
    render(
      <AssignmentListPage
        assignments={mockAssignments}
        loading={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onViewSubmissions={mockOnViewSubmissions}
        onChangeStatus={mockOnChangeStatus}
        onUploadInstructions={mockOnUploadInstructions}
      />
    );

    expect(screen.getByText('Assignment 1')).toBeInTheDocument();
    expect(screen.getByText('Assignment 2')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    render(
      <AssignmentListPage
        assignments={[]}
        loading={true}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onViewSubmissions={mockOnViewSubmissions}
        onChangeStatus={mockOnChangeStatus}
        onUploadInstructions={mockOnUploadInstructions}
      />
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should show empty state when no assignments', () => {
    render(
      <AssignmentListPage
        assignments={[]}
        loading={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onViewSubmissions={mockOnViewSubmissions}
        onChangeStatus={mockOnChangeStatus}
        onUploadInstructions={mockOnUploadInstructions}
      />
    );

    expect(screen.getByText(/no assignments/i)).toBeInTheDocument();
  });

  it('should call onEdit when edit button clicked', () => {
    render(
      <AssignmentListPage
        assignments={mockAssignments}
        loading={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onViewSubmissions={mockOnViewSubmissions}
        onChangeStatus={mockOnChangeStatus}
        onUploadInstructions={mockOnUploadInstructions}
      />
    );

    const editButtons = screen.getAllByText(/edit/i);
    fireEvent.click(editButtons[0]);

    expect(mockOnEdit).toHaveBeenCalledWith(mockAssignments[0]);
  });
});

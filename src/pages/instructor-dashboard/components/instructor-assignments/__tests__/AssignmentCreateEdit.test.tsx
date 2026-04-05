import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../../../../../test/test-utils';
import { AssignmentCreateEdit } from '../AssignmentCreateEdit';

describe('AssignmentCreateEdit', () => {
  const mockOnSave = vi.fn();
  const mockOnClose = vi.fn();
  const mockOnUploadInstructions = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render create form when no assignment provided', () => {
    render(
      <AssignmentCreateEdit
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        onUploadInstructions={mockOnUploadInstructions}
      />
    );

    expect(screen.getByText(/create assignment/i)).toBeInTheDocument();
  });

  it('should render edit form when assignment provided', () => {
    const assignment = {
      id: 1,
      title: 'Test Assignment',
      description: 'Test description',
      status: 'draft' as const,
      dueDate: '2026-12-31T23:59:59Z',
      maxScore: '100',
      weight: '10',
      submissionType: 'any' as const,
      courseId: 1,
    };

    render(
      <AssignmentCreateEdit
        open={true}
        assignment={assignment}
        onClose={mockOnClose}
        onSave={mockOnSave}
        onUploadInstructions={mockOnUploadInstructions}
      />
    );

    expect(screen.getByText(/edit assignment/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Assignment')).toBeInTheDocument();
  });

  it('should call onClose when cancel clicked', () => {
    render(
      <AssignmentCreateEdit
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        onUploadInstructions={mockOnUploadInstructions}
      />
    );

    const cancelButton = screen.getByText(/cancel/i);
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });
});

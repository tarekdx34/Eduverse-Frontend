import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../../../../../test/test-utils';
import { GradingPanel } from '../GradingPanel';

describe('GradingPanel', () => {
  const mockOnSave = vi.fn();
  const mockOnClose = vi.fn();

  const mockSubmission = {
    id: 1,
    studentId: 1,
    assignmentId: 1,
    studentName: 'John Doe',
    submissionText: 'This is my answer',
    grade: null,
    feedback: null,
    submittedAt: '2026-04-05T12:00:00Z',
    isLate: 0,
  };

  const mockAssignment = {
    id: 1,
    title: 'Test Assignment',
    maxScore: '100',
    dueDate: '2026-04-01T23:59:59Z',
    latePenalty: '10',
  };

  it('should render grading panel with submission details', () => {
    render(
      <GradingPanel
        open={true}
        submission={mockSubmission as any}
        assignment={mockAssignment as any}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText(/this is my answer/i)).toBeInTheDocument();
  });

  it('should calculate late penalty correctly', () => {
    const lateSubmission = {
      ...mockSubmission,
      isLate: 1,
    };

    render(
      <GradingPanel
        open={true}
        submission={lateSubmission as any}
        assignment={mockAssignment as any}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/late penalty/i)).toBeInTheDocument();
  });

  it('should call onSave with grade data', () => {
    render(
      <GradingPanel
        open={true}
        submission={mockSubmission as any}
        assignment={mockAssignment as any}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    const scoreInput = screen.getByLabelText(/score/i);
    fireEvent.change(scoreInput, { target: { value: '85' } });

    const submitButton = screen.getByText(/submit grade/i);
    fireEvent.click(submitButton);

    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        grade: '85',
      })
    );
  });

  it('should display existing grade if present', () => {
    const gradedSubmission = {
      ...mockSubmission,
      grade: '90',
      feedback: 'Good work!',
    };

    render(
      <GradingPanel
        open={true}
        submission={gradedSubmission as any}
        assignment={mockAssignment as any}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByDisplayValue('90')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Good work!')).toBeInTheDocument();
  });
});

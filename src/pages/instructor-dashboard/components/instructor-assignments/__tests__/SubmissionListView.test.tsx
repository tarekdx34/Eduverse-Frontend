import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../../../../../test/test-utils';
import { SubmissionListView } from '../SubmissionListView';

const mockSubmissions = [
  {
    id: 1,
    studentId: 1,
    assignmentId: 1,
    studentName: 'John Doe',
    submissionText: 'My answer',
    grade: '90',
    submittedAt: '2026-04-01T12:00:00Z',
    isLate: 0,
  },
  {
    id: 2,
    studentId: 2,
    assignmentId: 1,
    studentName: 'Jane Smith',
    submissionText: 'My submission',
    grade: null,
    submittedAt: '2026-04-02T14:00:00Z',
    isLate: 1,
  },
];

describe('SubmissionListView', () => {
  const mockOnGrade = vi.fn();

  it('should render submissions list', () => {
    render(
      <SubmissionListView
        submissions={mockSubmissions}
        assignment={{ id: 1, title: 'Test', maxScore: '100' } as any}
        onGrade={mockOnGrade}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('should show empty state when no submissions', () => {
    render(
      <SubmissionListView
        submissions={[]}
        assignment={{ id: 1, title: 'Test', maxScore: '100' } as any}
        onGrade={mockOnGrade}
      />
    );

    expect(screen.getByText(/no submissions/i)).toBeInTheDocument();
  });

  it('should display late badge for late submissions', () => {
    render(
      <SubmissionListView
        submissions={mockSubmissions}
        assignment={{ id: 1, title: 'Test', maxScore: '100' } as any}
        onGrade={mockOnGrade}
      />
    );

    expect(screen.getByText(/late/i)).toBeInTheDocument();
  });
});

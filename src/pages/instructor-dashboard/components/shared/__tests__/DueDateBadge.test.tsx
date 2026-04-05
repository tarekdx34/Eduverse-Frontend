import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '../../../../../test/test-utils';
import { DueDateBadge } from '../DueDateBadge';

describe('DueDateBadge', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-05T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render future due date with countdown', () => {
    const futureDate = '2026-04-10T23:59:59Z';
    render(<DueDateBadge dueDate={futureDate} />);
    expect(screen.getByText(/Due in \d+ day/)).toBeInTheDocument();
  });

  it('should show urgent status when due within 24 hours', () => {
    const urgentDate = '2026-04-06T11:00:00Z';
    const { container } = render(<DueDateBadge dueDate={urgentDate} />);
    const badge = container.querySelector('.bg-orange-100');
    expect(badge).toBeInTheDocument();
  });

  it('should show overdue status for past dates', () => {
    const pastDate = '2026-04-01T23:59:59Z';
    render(<DueDateBadge dueDate={pastDate} />);
    expect(screen.getByText(/Overdue/)).toBeInTheDocument();
  });

  it('should apply red styling for overdue assignments', () => {
    const pastDate = '2026-04-01T12:00:00Z';
    const { container } = render(<DueDateBadge dueDate={pastDate} />);
    const badge = container.querySelector('.bg-red-100');
    expect(badge).toBeInTheDocument();
  });

  it('should format date correctly', () => {
    const date = '2026-12-25T23:59:59Z';
    render(<DueDateBadge dueDate={date} />);
    expect(screen.getByText(/Dec|12/)).toBeInTheDocument();
  });

  it('should handle null due date gracefully', () => {
    render(<DueDateBadge dueDate={null as any} />);
    expect(screen.getByText(/No due date/)).toBeInTheDocument();
  });

  it('should show correct countdown for hours', () => {
    const hoursDate = '2026-04-05T15:30:00Z';
    render(<DueDateBadge dueDate={hoursDate} />);
    expect(screen.getByText(/Due in \d+ hour/)).toBeInTheDocument();
  });

  it('should have accessible text', () => {
    const date = '2026-04-10T23:59:59Z';
    render(<DueDateBadge dueDate={date} />);
    const badge = screen.getByText(/Due in \d+ day/);
    expect(badge).toBeVisible();
  });
});

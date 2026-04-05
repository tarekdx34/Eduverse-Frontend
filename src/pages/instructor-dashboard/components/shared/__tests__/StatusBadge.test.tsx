import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../../../test/test-utils';
import { StatusBadge } from '../StatusBadge';

describe('StatusBadge', () => {
  it('should render draft status', () => {
    render(<StatusBadge status="draft" />);
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  it('should render published status', () => {
    render(<StatusBadge status="published" />);
    expect(screen.getByText('Published')).toBeInTheDocument();
  });

  it('should render closed status', () => {
    render(<StatusBadge status="closed" />);
    expect(screen.getByText('Closed')).toBeInTheDocument();
  });

  it('should render archived status', () => {
    render(<StatusBadge status="archived" />);
    expect(screen.getByText('Archived')).toBeInTheDocument();
  });

  it('should apply correct CSS classes for draft', () => {
    const { container } = render(<StatusBadge status="draft" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('bg-amber-100');
    expect(badge.className).toContain('text-amber-700');
  });

  it('should apply correct CSS classes for published', () => {
    const { container } = render(<StatusBadge status="published" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('bg-green-100');
    expect(badge.className).toContain('text-green-700');
  });

  it('should apply correct CSS classes for closed', () => {
    const { container } = render(<StatusBadge status="closed" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('bg-gray-100');
    expect(badge.className).toContain('text-gray-700');
  });

  it('should apply correct CSS classes for archived', () => {
    const { container } = render(<StatusBadge status="archived" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('bg-slate-100');
    expect(badge.className).toContain('text-slate-600');
  });

  it('should have accessible text', () => {
    render(<StatusBadge status="published" />);
    const badge = screen.getByText('Published');
    expect(badge).toBeVisible();
  });
});

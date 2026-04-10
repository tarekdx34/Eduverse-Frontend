/**
 * Labs Module - Instructor Dashboard
 * 
 * Modular lab management components following the QuizzesPage pattern.
 * Provides full CRUD for labs, instruction management, submissions,
 * grading, TA materials, and attendance tracking.
 */

// Main dashboard component
export { LabsDashboard } from './LabsDashboard';
export type { LabsDashboardProps } from './LabsDashboard';

// Core components
export { LabList } from './LabList';
export { LabCreate } from './LabCreate';
export { LabEdit } from './LabEdit';
export { LabDetail } from './LabDetail';

// Instruction management
export { InstructionEditor } from './InstructionEditor';

// TA materials

// Submissions and grading
export { SubmissionList } from './SubmissionList';
export { GradingPanel } from './GradingPanel';

// Attendance
export { AttendanceSheet } from './AttendanceSheet';

// Shared components
export { LabStatusBadge } from './shared/LabStatusBadge';
export { InstructionCard } from './shared/InstructionCard';
export { AttendanceBadge } from './shared/AttendanceBadge';

// Hooks
export { useLabs } from './hooks/useLabs';
export { useLabAttendance } from './hooks/useLabAttendance';

// Types
export * from './types';

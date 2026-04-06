// Main assignments module barrel export
export { AssignmentsPage } from './AssignmentsPage';
export { AssignmentList } from './AssignmentList';
export { AssignmentCard } from './AssignmentCard';
export { AssignmentView } from './AssignmentView';
export { SubmissionForm } from './SubmissionForm';
export { MySubmission } from './MySubmission';
export { TextSubmission } from './TextSubmission';
export { FileUpload } from './FileUpload';
export { LinkSubmission } from './LinkSubmission';
export { DriveFileSelector } from './DriveFileSelector';

// Shared components
export * from './shared';

// Hooks
export * from './hooks/useAssignments';

// Types
export * from './types';

// Service
export { StudentAssignmentService } from './assignmentService';

// Default export
export { AssignmentsPage as default } from './AssignmentsPage';

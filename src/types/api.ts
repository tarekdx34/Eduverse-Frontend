/**
 * Centralized API Types for EduVerse Dashboard
 * Aligns with backend entities and data-model.md specifications
 */

// ============================================================================
// COURSE & ENROLLMENT
// ============================================================================

export interface Course {
  id: string;
  code: string;
  title: string;
  description?: string;
  instructorId: number;
  departmentId: string;
  semester: string;
  year: number;
  credits: number;
  maxStudents?: number;
  status: 'active' | 'archived' | 'draft';
  createdAt: string;
  updatedAt: string;
}

export interface CourseEnrollment {
  id: string;
  courseId: string;
  userId: number;
  enrollmentDate: string;
  role: 'student' | 'instructor' | 'ta';
  status: 'active' | 'dropped' | 'completed';
  course?: Course;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// ASSIGNMENTS & SUBMISSIONS
// ============================================================================

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  dueDate?: string;
  maxScore: string;
  weight: string;
  status: 'draft' | 'published' | 'closed';
  submissionType: 'text' | 'file' | 'link' | 'any';
  latePenalty?: number;
  course?: Course;
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  userId: number;
  submissionText?: string;
  fileId?: number;
  submissionStatus: 'pending' | 'submitted' | 'graded';
  submittedAt?: string;
  isLate?: boolean;
  score?: string;
  feedback?: string;
  gradedBy?: number;
  gradedAt?: string;
}

// ============================================================================
// QUIZZES, QUESTIONS & ATTEMPTS
// ============================================================================

export interface Quiz {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  quizType: 'practice' | 'graded';
  timeLimit?: number;
  maxAttempts: number;
  maxScore: string;
  passingScore?: string;
  status: 'draft' | 'published' | 'closed';
  showAnswersAfter: 'never' | 'submission' | 'grading' | 'due_date';
  shuffleQuestions: boolean;
  availableFrom?: string;
  availableUntil?: string;
  questions?: QuizQuestion[];
  createdAt: string;
  updatedAt: string;
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  questionType: 'mcq' | 'true_false' | 'short_answer' | 'essay' | 'matching';
  questionText: string;
  points: string;
  order: number;
  options?: QuestionOption[];
  correctAnswer?: string;
  explanation?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface QuestionOption {
  id: string;
  questionId: string;
  optionText: string;
  order: number;
  isCorrect?: boolean;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: number;
  status: 'in_progress' | 'submitted' | 'graded' | 'expired';
  startedAt: string;
  submittedAt?: string;
  expiresAt?: string;
  score?: string;
  answers?: AttemptAnswer[];
  autoGradedScore?: string;
  manualGradedScore?: string;
}

export interface AttemptAnswer {
  id: string;
  attemptId: string;
  questionId: string;
  answer?: string;
  selectedOptions?: string[];
  isCorrect?: boolean;
  score?: string;
  feedback?: string;
  savedAt: string;
}

// ============================================================================
// LABS & INSTRUCTIONS
// ============================================================================

export interface Lab {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  dueDate?: string;
  maxScore: string;
  status: 'draft' | 'published' | 'closed';
  instructions?: LabInstruction[];
  estimatedDuration?: number;
  equipmentRequired?: string;
  safetyNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LabInstruction {
  id: string;
  labId: string;
  order: number;
  content: string;
  fileId?: number;
}

export interface LabSubmission {
  id: string;
  labId: string;
  userId: number;
  submissionText?: string;
  fileId?: number;
  submissionStatus: 'pending' | 'submitted' | 'graded';
  submittedAt?: string;
  isLate?: boolean;
  score?: string;
  feedback?: string;
  gradedBy?: number;
  gradedAt?: string;
}

// ============================================================================
// USER & AUTH
// ============================================================================

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role:
    | 'student'
    | 'instructor'
    | 'admin'
    | 'ta'
    | 'teaching_assistant'
    | 'it_admin'
    | 'department_head';
  profilePicture?: string;
  phoneNumber?: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// ============================================================================
// GRADES & STATISTICS
// ============================================================================

export interface GradeData {
  semesterGpa: string;
  cumulativeGpa: string;
  assignmentGrades?: AssignmentGrade[];
  quizGrades?: QuizGrade[];
  labGrades?: LabGrade[];
}

export interface AssignmentGrade {
  assignmentId: string;
  score?: string;
  maxScore: string;
  submissionStatus: 'pending' | 'submitted' | 'graded';
}

export interface QuizGrade {
  quizId: string;
  attemptId?: string;
  score?: string;
  maxScore: string;
  attemptCount: number;
}

export interface LabGrade {
  labId: string;
  score?: string;
  maxScore: string;
  submissionStatus: 'pending' | 'submitted' | 'graded';
}

// ============================================================================
// ANALYTICS
// ============================================================================

export interface SubmissionAnalytics {
  totalSubmissions: number;
  submittedCount: number;
  pendingCount: number;
  gradedCount: number;
  averageScore?: string;
  averageGrade?: string;
}

export interface QuizAnalytics {
  totalAttempts: number;
  completedAttempts: number;
  averageScore?: string;
  passRate?: string;
  averageTimeSpent?: number;
}

export interface AssignmentAnalytics extends SubmissionAnalytics {
  assignmentId: string;
}

// ============================================================================
// SCHEDULE & ATTENDANCE
// ============================================================================

export interface WeeklySchedule {
  weekStart: string;
  weekEnd: string;
  days: ScheduleDay[];
}

export interface ScheduleDay {
  date: string;
  dayOfWeek: string;
  sessions: ScheduleSession[];
}

export interface ScheduleSession {
  id: string;
  courseId: string;
  type: 'lecture' | 'lab' | 'tutorial' | 'office_hours';
  startTime: string;
  endTime: string;
  location?: string;
  instructor?: User;
}

// ============================================================================
// PAGINATION & API RESPONSE
// ============================================================================

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

// ============================================================================
// FILE UPLOAD
// ============================================================================

export interface FileUpload {
  id: number;
  name: string;
  size: number;
  mimeType: string;
  url: string;
  uploadedBy: number;
  uploadedAt: string;
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export interface Notification {
  id: string;
  userId: number;
  type: 'assignment' | 'quiz' | 'lab' | 'grade' | 'announcement' | 'system';
  title: string;
  message: string;
  relatedId?: string;
  isRead: boolean;
  createdAt: string;
}

// ============================================================================
// DISCUSSION & CHAT
// ============================================================================

export interface DiscussionForum {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface DiscussionThread {
  id: string;
  forumId: string;
  title: string;
  content: string;
  createdBy: number;
  isPinned: boolean;
  isLocked: boolean;
  replyCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DiscussionReply {
  id: string;
  threadId: string;
  content: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: number;
  content: string;
  attachmentId?: number;
  isRead: boolean;
  createdAt: string;
}

// ============================================================================
// ANNOUNCEMENT
// ============================================================================

export interface Announcement {
  id: string;
  courseId: string;
  title: string;
  content: string;
  createdBy: number;
  priority: 'low' | 'medium' | 'high';
  publishedAt: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isAssignment(obj: unknown): obj is Assignment {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'courseId' in obj &&
    'title' in obj &&
    'maxScore' in obj
  );
}

export function isQuiz(obj: unknown): obj is Quiz {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'courseId' in obj &&
    'title' in obj &&
    'maxAttempts' in obj
  );
}

export function isLab(obj: unknown): obj is Lab {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'courseId' in obj &&
    'title' in obj &&
    'status' in obj &&
    'instructions' in obj
  );
}

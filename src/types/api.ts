// ─── Auth & Users ─────────────────────────────────────────────
export interface User {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  phone?: string;
  profilePictureUrl?: string | null;
  campusId?: string | null;
  departmentId?: number;
  programId?: number;
  roles: string[];
  status: string;
  emailVerified?: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions?: Permission[];
}

export interface Permission {
  id: number;
  name: string;
  module: string;
  description?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  campusId?: string;
}

// ─── Campus & Organization ───────────────────────────────────
export interface Campus {
  id: number;
  name: string;
  code: string;
  address?: string;
  city?: string;
  country?: string;
  isActive: boolean;
  departments?: Department[];
}

export interface Department {
  id: number;
  name: string;
  code: string;
  campusId: number;
  headOfDepartment?: string;
  programs?: Program[];
}

export interface Program {
  id: number;
  name: string;
  code: string;
  departmentId: number;
  totalCredits: number;
  degreeType: string;
}

export interface Semester {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  registrationStart?: string;
  registrationEnd?: string;
}

// ─── Courses & Sections ──────────────────────────────────────
export interface Course {
  id: number;
  code: string;
  name: string;
  description?: string;
  credits: number;
  departmentId: number;
  level?: number;
  status: string;
  sections?: CourseSection[];
  prerequisites?: CoursePrerequisite[];
}

export interface CourseSection {
  id: number;
  courseId: number;
  sectionNumber: string;
  semesterId: number;
  instructorId?: number;
  maxCapacity: number;
  currentEnrollment: number;
  status: string;
  schedules?: CourseSchedule[];
}

export interface CourseSchedule {
  id: number;
  sectionId: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room?: string;
  building?: string;
}

export interface CoursePrerequisite {
  id: number;
  courseId: number;
  prerequisiteCourseId: number;
  prerequisiteCourse?: Course;
}

// ─── Enrollments ─────────────────────────────────────────────
export interface Enrollment {
  id: number;
  studentId: number;
  sectionId: number;
  status: string;
  enrollmentDate: string;
  grade?: string;
  section?: CourseSection;
  course?: Course;
}

// ─── Assignments & Submissions ───────────────────────────────
export interface Assignment {
  id: number;
  title: string;
  description?: string;
  courseId: number;
  sectionId?: number;
  dueDate: string;
  totalPoints: number;
  type: string;
  status: string;
  allowLateSubmission: boolean;
  maxFileSize?: number;
  createdBy: number;
  createdAt: string;
}

export interface Submission {
  id: number;
  assignmentId: number;
  studentId: number;
  content?: string;
  fileUrl?: string;
  submittedAt: string;
  grade?: number;
  feedback?: string;
  status: string;
  gradedBy?: number;
  gradedAt?: string;
}

// ─── Grades & GPA ────────────────────────────────────────────
export interface Grade {
  id: number;
  studentId: number;
  courseId: number;
  sectionId: number;
  semesterId: number;
  letterGrade?: string;
  numericGrade?: number;
  points?: number;
  status: string;
}

export interface GPA {
  studentId: number;
  semesterGPA: number;
  cumulativeGPA: number;
  totalCredits: number;
  totalPoints: number;
  semesterBreakdown: {
    semesterId: number;
    semesterName: string;
    gpa: number;
    credits: number;
  }[];
}

export interface Transcript {
  studentId: number;
  studentName: string;
  programName: string;
  entries: TranscriptEntry[];
  cumulativeGPA: number;
  totalCredits: number;
}

export interface TranscriptEntry {
  semesterName: string;
  courseCode: string;
  courseName: string;
  credits: number;
  grade: string;
  points: number;
}

export interface GradeDistribution {
  courseId: number;
  distribution: { grade: string; count: number; percentage: number }[];
  average: number;
  median: number;
}

// ─── Quizzes ─────────────────────────────────────────────────
export interface Quiz {
  id: number;
  title: string;
  description?: string;
  courseId: number;
  sectionId?: number;
  duration: number;
  totalPoints: number;
  startDate: string;
  endDate: string;
  maxAttempts: number;
  shuffleQuestions: boolean;
  showResults: boolean;
  status: string;
  questions?: QuizQuestion[];
}

export interface QuizQuestion {
  id: number;
  quizId: number;
  questionText: string;
  type: string;
  points: number;
  order: number;
  options?: QuizOption[];
  correctAnswer?: string;
}

export interface QuizOption {
  id: number;
  text: string;
  isCorrect: boolean;
}

export interface QuizAttempt {
  id: number;
  quizId: number;
  studentId: number;
  startedAt: string;
  submittedAt?: string;
  score?: number;
  status: string;
  answers?: QuizAnswer[];
}

export interface QuizAnswer {
  questionId: number;
  answer: string;
  isCorrect?: boolean;
  pointsAwarded?: number;
}

export interface QuizStatistics {
  quizId: number;
  totalAttempts: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  questionAnalysis: {
    questionId: number;
    correctPercentage: number;
    averagePoints: number;
  }[];
}

// ─── Labs ────────────────────────────────────────────────────
export interface Lab {
  id: number;
  title: string;
  description?: string;
  courseId: number;
  sectionId?: number;
  dueDate: string;
  totalPoints: number;
  status: string;
  instructions?: LabInstruction[];
}

export interface LabInstruction {
  id: number;
  labId: number;
  stepNumber: number;
  content: string;
  type: string;
}

export interface LabSubmission {
  id: number;
  labId: number;
  studentId: number;
  content?: string;
  fileUrl?: string;
  submittedAt: string;
  grade?: number;
  feedback?: string;
  status: string;
}

// ─── Attendance ──────────────────────────────────────────────
export interface AttendanceSession {
  id: number;
  sectionId: number;
  date: string;
  type: string;
  status: string;
  createdBy: number;
  records?: AttendanceRecord[];
}

export interface AttendanceRecord {
  id: number;
  sessionId: number;
  studentId: number;
  status: string;
  checkInTime?: string;
  notes?: string;
}

export interface AttendanceSummary {
  sectionId: number;
  totalSessions: number;
  students: {
    studentId: number;
    studentName: string;
    present: number;
    absent: number;
    late: number;
    excused: number;
    attendanceRate: number;
  }[];
}

// ─── Messaging ───────────────────────────────────────────────
export interface Conversation {
  id: number;
  participants: ConversationParticipant[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationParticipant {
  userId: number;
  user: User;
  joinedAt: string;
}

export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  sender?: User;
  content: string;
  type: string;
  fileUrl?: string;
  isRead: boolean;
  createdAt: string;
}

// ─── Notifications ───────────────────────────────────────────
export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  category: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  categories: Record<string, { email: boolean; push: boolean; inApp: boolean }>;
}

// ─── Discussions ─────────────────────────────────────────────
export interface DiscussionThread {
  id: number;
  title: string;
  content: string;
  authorId: number;
  author?: User;
  courseId?: number;
  isPinned: boolean;
  isLocked: boolean;
  replyCount: number;
  replies?: DiscussionReply[];
  createdAt: string;
  updatedAt: string;
}

export interface DiscussionReply {
  id: number;
  threadId: number;
  content: string;
  authorId: number;
  author?: User;
  isAnswer: boolean;
  isEndorsed: boolean;
  parentReplyId?: number;
  createdAt: string;
}

// ─── Files ───────────────────────────────────────────────────
export interface FileItem {
  id: number;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  folderId?: number;
  uploadedBy: number;
  createdAt: string;
  versions?: FileVersion[];
}

export interface FileVersion {
  id: number;
  fileId: number;
  versionNumber: number;
  path: string;
  size: number;
  createdAt: string;
}

export interface Folder {
  id: number;
  name: string;
  parentId?: number;
  createdBy: number;
  children?: Folder[];
  files?: FileItem[];
}

// ─── Rubrics ─────────────────────────────────────────────────
export interface Rubric {
  id: number;
  name: string;
  description?: string;
  courseId: number;
  criteria: RubricCriterion[];
}

export interface RubricCriterion {
  id: number;
  name: string;
  description: string;
  maxPoints: number;
  levels: { label: string; points: number; description: string }[];
}

// ─── Pagination & API Wrappers ───────────────────────────────
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  data: T;
  message: string;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
}

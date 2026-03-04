# Backend ↔ Frontend Integration Plan

> **Objective**: Connect the EduVerse React frontend (100% mock/hardcoded data) to the existing NestJS backend (15 modules, 130+ API endpoints, 2 sprints completed).

---

## Table of Contents

1. [Current State Assessment](#1-current-state-assessment)
2. [Architecture Overview](#2-architecture-overview)
3. [Phase 0 — Foundation](#3-phase-0--foundation)
4. [Phase 1 — Core Academic](#4-phase-1--core-academic)
5. [Phase 2 — Assessments & Grading](#5-phase-2--assessments--grading)
6. [Phase 3 — Communication](#6-phase-3--communication)
7. [Phase 4 — Administration](#7-phase-4--administration)
8. [Phase 5 — System & Polish](#8-phase-5--system--polish)
9. [Complete Endpoint Catalog](#9-complete-endpoint-catalog)
10. [File Creation Checklist](#10-file-creation-checklist)
11. [Integration Pattern Reference](#11-integration-pattern-reference)
12. [Dependency Graph](#12-dependency-graph)

---

## 1. Current State Assessment

### Backend (NestJS — D:\Graduation Project\Backend\eduverse-backend)

| Property | Value |
|----------|-------|
| Framework | NestJS v11 + TypeScript |
| ORM | TypeORM v0.3 |
| Database | MySQL — `eduverse_db` on localhost:3306 |
| Port | 8081 |
| Swagger | `http://localhost:8081/api-docs` |
| Auth | JWT (1h access token, 7d refresh token, bcrypt) |
| Roles | `STUDENT`, `INSTRUCTOR`, `TA`, `ADMIN`, `IT_ADMIN` |
| Modules | 15 modules, 22 controllers, 130+ endpoints |
| Entities | 48 TypeORM entities |
| Seed Data | 5 roles + 6 permissions (no users/courses seeded) |
| CORS | Currently: `http://localhost:8081` (**NEEDS FIX**) |

### Frontend (React/Vite — D:\Graduation Project\Frontend\eduverse)

| Property | Value |
|----------|-------|
| Framework | React + Vite 7.2.5 + Tailwind CSS |
| Language | TypeScript (`.tsx` components) |
| API Client | `src/services/api/client.ts` — Fetch-based `ApiClient` class |
| Auth | **MOCK ONLY** — hardcoded credentials in `authService.ts` |
| Proxy | Vite dev proxy: `/api` → `http://localhost:8081` |
| Data | 100% hardcoded constants in each dashboard's `constants.ts` |
| State | No React Query/SWR, no domain services, no auth context |
| Dashboards | 5 (Student, Instructor, Admin, TA, IT Admin) |

### What Already Works

- ✅ `ApiClient` class with Bearer auth from localStorage
- ✅ Vite dev proxy configured (`/api` → `http://localhost:8081`)
- ✅ Token storage keys defined (`accessToken`, `refreshToken`, `user`)
- ✅ Error handling with CORS diagnostics in `ApiClient`

### What's Missing

- ❌ Real auth integration (login/register/refresh)
- ❌ Auth context (no global user state, no protected routes)
- ❌ TypeScript types matching backend entities
- ❌ Reusable data-fetching hook
- ❌ Any domain service files (only mock `authService.ts`)
- ❌ Loading/error states in components
- ❌ Socket.io client for real-time features

---

## 2. Architecture Overview

### Request Flow

```
Browser → Vite Dev Proxy (/api/*) → NestJS (localhost:8081)
         ↓                            ↓
     React Component              JWT Validation
         ↓                            ↓
     useApi Hook                  Controller
         ↓                            ↓
     Service File                 Service Layer
         ↓                            ↓
     ApiClient.get/post()         TypeORM → MySQL
```

### File Structure (After Integration)

```
src/
├── types/
│   └── api.ts                          # Shared TypeScript interfaces (all entities)
│
├── hooks/
│   └── useApi.ts                       # Reusable data-fetching hook
│
├── contexts/
│   └── AuthContext.tsx                  # Global auth state + role-based guards
│
├── services/
│   ├── api/
│   │   ├── client.ts                   # ← EXISTS (ApiClient class)
│   │   ├── config.ts                   # ← EXISTS (API_BASE_URL, token keys)
│   │   ├── authService.ts              # ← EXISTS (must replace mock with real)
│   │   ├── courseService.ts            # NEW — courses, sections, schedules
│   │   ├── enrollmentService.ts        # NEW — enrollment operations
│   │   ├── semesterService.ts          # NEW — semester data
│   │   ├── assignmentService.ts        # NEW — assignments & submissions
│   │   ├── gradeService.ts             # NEW — grades, GPA, transcripts
│   │   ├── quizService.ts              # NEW — quizzes & attempts
│   │   ├── labService.ts               # NEW — labs & submissions
│   │   ├── messagingService.ts         # NEW — chat & conversations
│   │   ├── notificationService.ts      # NEW — notifications & preferences
│   │   ├── discussionService.ts        # NEW — forum threads & replies
│   │   ├── userService.ts              # NEW — user management (admin)
│   │   ├── attendanceService.ts        # NEW — attendance tracking
│   │   ├── campusService.ts            # NEW — campus, departments, programs
│   │   └── fileService.ts              # NEW — file upload/download
│   │
│   └── socket.ts                       # NEW — Socket.io client
│
└── pages/
    ├── auth/LoginPage.tsx              # ← EXISTS (wire to real auth)
    ├── student-dashboard/
    │   ├── constants.ts                # Replace mock data with service calls
    │   └── components/*.tsx            # Add useApi hooks
    ├── instructor-dashboard/           # Same pattern
    ├── admin-dashboard/                # Same pattern
    ├── ta-dashboard/                   # Same pattern
    └── it-admin-dashboard/             # Same pattern
```

### Integration Pattern (Per Component)

```typescript
// ═══════════════════════════════════════════════
// BEFORE: Hardcoded mock data
// ═══════════════════════════════════════════════
import { MOCK_COURSES } from '../constants';

export default function CoursesPage() {
  return (
    <div>
      {MOCK_COURSES.map(course => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════
// AFTER: Real API data with loading/error states
// ═══════════════════════════════════════════════
import { useApi } from '../../../hooks/useApi';
import { courseService } from '../../../services/api/courseService';
import { MOCK_COURSES } from '../constants'; // fallback

export default function CoursesPage() {
  const { data: courses, loading, error } = useApi(
    () => courseService.listCourses(),
    [] // dependency array
  );

  if (loading) return <CoursesPageSkeleton />;
  if (error) return <ErrorMessage error={error} onRetry={refetch} />;

  // Use real data, fall back to mock if empty
  const displayCourses = courses?.length ? courses : MOCK_COURSES;

  return (
    <div>
      {displayCourses.map(course => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
```

---

## 3. Phase 0 — Foundation

> **Must complete before any other phase.** All other phases depend on this.

### 3.0 — Fix CORS Configuration

**Problem**: Backend `.env` has `CORS_ORIGIN=http://localhost:8081` but frontend runs on port 5173/5174.

**Solution** (choose one):
1. **Option A (Recommended)**: Rely on Vite proxy — all frontend API calls use `/api/...` prefix, Vite proxies to `http://localhost:8081`. No CORS issues since browser sees same-origin requests.
2. **Option B**: Update backend `.env`:
   ```
   CORS_ORIGIN=http://localhost:5173,http://localhost:5174,http://localhost:3000
   ```

**Action**: Verify that `main.ts` in the backend reads `CORS_ORIGIN` and passes it to `app.enableCors()`. If it splits on comma, Option B works. Otherwise use Option A.

**File**: `D:\Graduation Project\Backend\eduverse-backend\.env`

---

### 3.1 — Create Shared TypeScript Types

**File**: `src/types/api.ts` (NEW)

Define TypeScript interfaces matching **all backend entities**. These types are used by every service file and component.

```typescript
// ─── Auth & Users ─────────────────────────────────────────────
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  profilePictureUrl?: string;
  campusId?: number;
  departmentId?: number;
  programId?: number;
  roles: Role[];
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: number;
  name: string; // 'STUDENT' | 'INSTRUCTOR' | 'TA' | 'ADMIN' | 'IT_ADMIN'
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
  campusId?: number;
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
  level: number;
  status: 'active' | 'inactive';
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
  status: 'open' | 'closed' | 'waitlisted';
  schedules?: CourseSchedule[];
}

export interface CourseSchedule {
  id: number;
  sectionId: number;
  dayOfWeek: string; // 'MONDAY' | 'TUESDAY' | ...
  startTime: string; // 'HH:mm'
  endTime: string;   // 'HH:mm'
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
  status: 'enrolled' | 'waitlisted' | 'dropped' | 'completed';
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
  type: 'homework' | 'project' | 'paper' | 'other';
  status: 'draft' | 'published' | 'closed';
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
  status: 'submitted' | 'graded' | 'returned' | 'late';
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
  status: 'provisional' | 'finalized';
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
  duration: number; // minutes
  totalPoints: number;
  startDate: string;
  endDate: string;
  maxAttempts: number;
  shuffleQuestions: boolean;
  showResults: boolean;
  status: 'draft' | 'published' | 'closed';
  questions?: QuizQuestion[];
}

export interface QuizQuestion {
  id: number;
  quizId: number;
  questionText: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
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
  status: 'in_progress' | 'submitted' | 'graded';
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
  status: 'draft' | 'published' | 'closed';
  instructions?: LabInstruction[];
}

export interface LabInstruction {
  id: number;
  labId: number;
  stepNumber: number;
  content: string;
  type: 'text' | 'code' | 'image';
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
  status: 'submitted' | 'graded' | 'returned';
}

// ─── Attendance ──────────────────────────────────────────────
export interface AttendanceSession {
  id: number;
  sectionId: number;
  date: string;
  type: 'lecture' | 'lab' | 'tutorial';
  status: 'open' | 'closed';
  createdBy: number;
  records?: AttendanceRecord[];
}

export interface AttendanceRecord {
  id: number;
  sessionId: number;
  studentId: number;
  status: 'present' | 'absent' | 'late' | 'excused';
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
  type: 'text' | 'file' | 'image';
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
  type: 'info' | 'warning' | 'success' | 'error';
  category: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  categories: {
    [key: string]: { email: boolean; push: boolean; inApp: boolean };
  };
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

// ─── Pagination ──────────────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ─── API Response Wrappers ───────────────────────────────────
export interface ApiResponse<T> {
  data: T;
  message: string;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
}
```

---

### 3.2 — Create useApi Data-Fetching Hook

**File**: `src/hooks/useApi.ts` (NEW)

This hook wraps `ApiClient` calls and provides `{ data, loading, error, refetch }` to every component.

```typescript
import { useState, useEffect, useCallback, useRef } from 'react';

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useApi<T>(
  fetcher: () => Promise<T>,
  deps: any[] = [],
  options?: { immediate?: boolean }
): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const fetcherRef = useRef(fetcher);

  fetcherRef.current = fetcher;

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetcherRef.current();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    if (options?.immediate === false) return;
    execute();
  }, [execute]);

  return { data, loading, error, refetch: execute };
}

// Mutation hook for POST/PUT/DELETE operations
export function useMutation<TData, TVariables>(
  mutator: (variables: TVariables) => Promise<TData>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<TData | null>(null);

  const mutate = useCallback(async (variables: TVariables) => {
    try {
      setLoading(true);
      setError(null);
      const result = await mutator(variables);
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [mutator]);

  return { mutate, loading, error, data };
}
```

---

### 3.3 — Replace Mock Auth with Real API

**File**: `src/services/api/authService.ts` (MODIFY — replace mock implementation)

```typescript
import { ApiClient } from './client';
import { API_CONFIG } from './config';
import type { LoginRequest, LoginResponse, RegisterRequest, User } from '../../types/api';

class AuthService {
  // ─── Login ─────────────────────────────────────────────────
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await ApiClient.post<LoginResponse>('/auth/login', credentials);

    // Store tokens and user in localStorage
    localStorage.setItem(API_CONFIG.tokenKey, response.accessToken);
    localStorage.setItem(API_CONFIG.refreshTokenKey, response.refreshToken);
    localStorage.setItem(API_CONFIG.userKey, JSON.stringify(response.user));

    return response;
  }

  // ─── Register ──────────────────────────────────────────────
  async register(data: RegisterRequest): Promise<LoginResponse> {
    const response = await ApiClient.post<LoginResponse>('/auth/register', data);

    localStorage.setItem(API_CONFIG.tokenKey, response.accessToken);
    localStorage.setItem(API_CONFIG.refreshTokenKey, response.refreshToken);
    localStorage.setItem(API_CONFIG.userKey, JSON.stringify(response.user));

    return response;
  }

  // ─── Logout ────────────────────────────────────────────────
  async logout(): Promise<void> {
    try {
      await ApiClient.post('/auth/logout', {});
    } catch {
      // Logout even if the API call fails
    } finally {
      localStorage.removeItem(API_CONFIG.tokenKey);
      localStorage.removeItem(API_CONFIG.refreshTokenKey);
      localStorage.removeItem(API_CONFIG.userKey);
    }
  }

  // ─── Refresh Token ─────────────────────────────────────────
  async refreshToken(): Promise<{ accessToken: string }> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token available');

    const response = await ApiClient.post<{ accessToken: string }>(
      '/auth/refresh-token',
      { refreshToken }
    );

    localStorage.setItem(API_CONFIG.tokenKey, response.accessToken);
    return response;
  }

  // ─── Get Current User from API ─────────────────────────────
  async getCurrentUser(): Promise<User> {
    return ApiClient.get<User>('/auth/me');
  }

  // ─── Forgot Password ──────────────────────────────────────
  async forgotPassword(email: string): Promise<void> {
    await ApiClient.post('/auth/forgot-password', { email });
  }

  // ─── Reset Password ───────────────────────────────────────
  async resetPassword(token: string, newPassword: string): Promise<void> {
    await ApiClient.post('/auth/reset-password', { token, newPassword });
  }

  // ─── Local Helpers ─────────────────────────────────────────
  isAuthenticated(): boolean {
    return !!localStorage.getItem(API_CONFIG.tokenKey);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(API_CONFIG.tokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(API_CONFIG.refreshTokenKey);
  }

  getStoredUser(): User | null {
    const userStr = localStorage.getItem(API_CONFIG.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  getUserRole(): string | null {
    const user = this.getStoredUser();
    return user?.roles?.[0]?.name || null;
  }
}

export const authService = new AuthService();
```

---

### 3.4 — Create Auth Context

**File**: `src/contexts/AuthContext.tsx` (NEW)

```typescript
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/api/authService';
import type { User, LoginRequest, RegisterRequest } from '../types/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(authService.getStoredUser());
  const [loading, setLoading] = useState(true);

  // Verify token on mount
  useEffect(() => {
    const verifyAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
          localStorage.setItem('user', JSON.stringify(currentUser));
        } catch {
          // Token expired or invalid
          await authService.logout();
          setUser(null);
        }
      }
      setLoading(false);
    };
    verifyAuth();
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    const response = await authService.login(credentials);
    setUser(response.user);
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    const response = await authService.register(data);
    setUser(response.user);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  const hasRole = useCallback((role: string) => {
    return user?.roles?.some(r => r.name === role) ?? false;
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      refreshUser,
      hasRole
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
```

---

### 3.5 — Update Login Page

**File**: `src/pages/auth/LoginPage.tsx` (MODIFY)

**Changes**:
- Import `useAuth` from `AuthContext`
- Replace mock login call with `auth.login({ email, password })`
- Navigate based on user role after login:
  - `STUDENT` → `/studentdashboard`
  - `INSTRUCTOR` → `/instructordashboard`
  - `ADMIN` → `/admindashboard`
  - `TA` → `/tadashboard`
  - `IT_ADMIN` → `/itadmindashboard`
- Add registration form toggle
- Add forgot password flow
- Show API error messages (invalid credentials, account locked, etc.)

---

### 3.6 — Add AuthProvider to App

**File**: `src/App.jsx` (MODIFY)

**Changes**:
- Wrap `<Routes>` with `<AuthProvider>`
- Add `<ProtectedRoute>` component that checks `useAuth().isAuthenticated`
- Add role-based route guards:
  ```jsx
  <Route path="/studentdashboard/*"
    element={<ProtectedRoute role="STUDENT"><StudentDashboard /></ProtectedRoute>}
  />
  ```
- Redirect unauthenticated users to `/login`

---

## 4. Phase 1 — Core Academic

> **Dependencies**: Phase 0 (auth, types, hooks) must be complete.

### 4.1 — Course Service

**File**: `src/services/api/courseService.ts` (NEW)

```typescript
import { ApiClient } from './client';
import type { Course, CourseSection, CourseSchedule, CoursePrerequisite, PaginatedResponse } from '../../types/api';

export const courseService = {
  // ─── Courses ────────────────────────────────────────────
  listCourses: (params?: { page?: number; limit?: number }) =>
    ApiClient.get<PaginatedResponse<Course>>('/courses', params),

  getCourse: (id: number) =>
    ApiClient.get<Course>(`/courses/${id}`),

  getCoursesByDepartment: (deptId: number) =>
    ApiClient.get<Course[]>(`/courses/department/${deptId}`),

  createCourse: (data: Partial<Course>) =>
    ApiClient.post<Course>('/courses', data),

  updateCourse: (id: number, data: Partial<Course>) =>
    ApiClient.put<Course>(`/courses/${id}`, data),

  deleteCourse: (id: number) =>
    ApiClient.delete(`/courses/${id}`),

  // ─── Prerequisites ──────────────────────────────────────
  getPrerequisites: (courseId: number) =>
    ApiClient.get<CoursePrerequisite[]>(`/courses/${courseId}/prerequisites`),

  addPrerequisite: (courseId: number, prereqCourseId: number) =>
    ApiClient.post(`/courses/${courseId}/prerequisites`, { prerequisiteCourseId: prereqCourseId }),

  removePrerequisite: (courseId: number, prereqId: number) =>
    ApiClient.delete(`/courses/${courseId}/prerequisites/${prereqId}`),

  // ─── Sections ───────────────────────────────────────────
  getSectionsByCourse: (courseId: number) =>
    ApiClient.get<CourseSection[]>(`/courses/course/${courseId}`),

  getSection: (id: number) =>
    ApiClient.get<CourseSection>(`/courses/${id}`),

  createSection: (data: Partial<CourseSection>) =>
    ApiClient.post<CourseSection>('/courses', data),

  updateSection: (id: number, data: Partial<CourseSection>) =>
    ApiClient.put<CourseSection>(`/courses/${id}`, data),

  // ─── Schedules ──────────────────────────────────────────
  getSchedulesBySection: (sectionId: number) =>
    ApiClient.get<CourseSchedule[]>(`/courses/section/${sectionId}`),

  createSchedule: (sectionId: number, data: Partial<CourseSchedule>) =>
    ApiClient.post<CourseSchedule>(`/courses/section/${sectionId}`, data),

  deleteSchedule: (id: number) =>
    ApiClient.delete(`/courses/${id}`),
};
```

### Frontend Components to Update:

| Component | Current Data Source | Replace With |
|-----------|-------------------|--------------|
| StudentDashboard > ClassTab | `ENROLLED_COURSES` constant | `enrollmentService.getMyEnrolledCourses()` |
| StudentDashboard > CourseRegistration | `AVAILABLE_COURSES` constant | `enrollmentService.getAvailableCourses()` |
| StudentDashboard > ClassSchedule | `SCHEDULE_DATA` constant | `courseService.getSchedulesBySection()` |
| InstructorDashboard > CoursesPage | `SECTIONS` constant | `courseService.listCourses()` filtered by instructor |
| AdminDashboard > CourseManagementPage | Mock course list | `courseService.listCourses()` with CRUD |

---

### 4.2 — Enrollment Service

**File**: `src/services/api/enrollmentService.ts` (NEW)

```typescript
import { ApiClient } from './client';
import type { Enrollment, Course, PaginatedResponse } from '../../types/api';

export const enrollmentService = {
  // Student endpoints
  getMyEnrolledCourses: () =>
    ApiClient.get<Enrollment[]>('/enrollments/my-courses'),

  getAvailableCourses: () =>
    ApiClient.get<Course[]>('/enrollments/available'),

  registerForCourse: (sectionId: number) =>
    ApiClient.post<Enrollment>('/enrollments/register', { sectionId }),

  dropCourse: (enrollmentId: number) =>
    ApiClient.delete(`/enrollments/${enrollmentId}`),

  // Instructor/Admin endpoints
  getSectionStudents: (sectionId: number) =>
    ApiClient.get<Enrollment[]>(`/enrollments/section/${sectionId}/students`),

  getSectionWaitlist: (sectionId: number) =>
    ApiClient.get<Enrollment[]>(`/enrollments/section/${sectionId}/waitlist`),

  getCourseEnrollments: (courseId: number) =>
    ApiClient.get<Enrollment[]>(`/enrollments/course/${courseId}/list`),

  updateEnrollmentStatus: (enrollmentId: number, status: string) =>
    ApiClient.post(`/enrollments/${enrollmentId}/status`, { status }),
};
```

---

### 4.3 — Semester Service

**File**: `src/services/api/semesterService.ts` (NEW)

```typescript
import { ApiClient } from './client';
import type { Semester } from '../../types/api';

export const semesterService = {
  listSemesters: () =>
    ApiClient.get<Semester[]>('/admin/campus'),

  getCurrentSemester: () =>
    ApiClient.get<Semester>('/admin/campus/current'),

  createSemester: (data: Partial<Semester>) =>
    ApiClient.post<Semester>('/admin/campus', data),

  updateSemester: (id: number, data: Partial<Semester>) =>
    ApiClient.put<Semester>(`/admin/campus/${id}`, data),

  deleteSemester: (id: number) =>
    ApiClient.delete(`/admin/campus/${id}`),
};
```

---

## 5. Phase 2 — Assessments & Grading

> **Dependencies**: Phase 1 (courses must exist to reference).

### 5.1 — Assignment Service

**File**: `src/services/api/assignmentService.ts` (NEW)

```typescript
import { ApiClient } from './client';
import type { Assignment, Submission, PaginatedResponse } from '../../types/api';

export const assignmentService = {
  // List & Get
  listAssignments: (params?: { courseId?: number; status?: string }) =>
    ApiClient.get<Assignment[]>('/assignments', params),

  getAssignment: (id: number) =>
    ApiClient.get<Assignment>(`/assignments/${id}`),

  // Instructor CRUD
  createAssignment: (data: Partial<Assignment>) =>
    ApiClient.post<Assignment>('/assignments', data),

  updateAssignment: (id: number, data: Partial<Assignment>) =>
    ApiClient.put<Assignment>(`/assignments/${id}`, data),

  deleteAssignment: (id: number) =>
    ApiClient.delete(`/assignments/${id}`),

  changeStatus: (id: number, status: string) =>
    ApiClient.put(`/assignments/${id}/status`, { status }),

  // Student submissions
  submitAssignment: (assignmentId: number, data: { content?: string; file?: File }) =>
    ApiClient.post<Submission>(`/assignments/${assignmentId}/submit`, data),

  getMySubmission: (assignmentId: number) =>
    ApiClient.get<Submission>(`/assignments/${assignmentId}/submissions/my`),

  // Instructor/TA grading
  listSubmissions: (assignmentId: number) =>
    ApiClient.get<Submission[]>(`/assignments/${assignmentId}/submissions`),

  gradeSubmission: (assignmentId: number, submissionId: number, data: { grade: number; feedback?: string }) =>
    ApiClient.put(`/assignments/${assignmentId}/submissions/${submissionId}/grade`, data),
};
```

---

### 5.2 — Grade Service

**File**: `src/services/api/gradeService.ts` (NEW)

```typescript
import { ApiClient } from './client';
import type { Grade, GPA, Transcript, GradeDistribution, Rubric, PaginatedResponse } from '../../types/api';

export const gradeService = {
  // Student endpoints
  getMyGrades: () =>
    ApiClient.get<Grade[]>('/grades/my'),

  getTranscript: (studentId: number) =>
    ApiClient.get<Transcript>(`/grades/transcript/${studentId}`),

  getGPA: (studentId: number) =>
    ApiClient.get<GPA>(`/grades/gpa/${studentId}`),

  // Instructor/TA endpoints
  listAllGrades: (params?: { courseId?: number }) =>
    ApiClient.get<Grade[]>('/grades', params),

  getDistribution: (courseId: number) =>
    ApiClient.get<GradeDistribution>(`/grades/distribution/${courseId}`),

  updateGrade: (gradeId: number, data: { numericGrade?: number; letterGrade?: string }) =>
    ApiClient.put<Grade>(`/grades/${gradeId}`, data),

  finalizeGrade: (gradeId: number) =>
    ApiClient.put(`/grades/${gradeId}/finalize`, {}),

  // Rubrics
  listRubrics: () =>
    ApiClient.get<Rubric[]>('/grades'),

  createRubric: (data: Partial<Rubric>) =>
    ApiClient.post<Rubric>('/grades', data),

  updateRubric: (id: number, data: Partial<Rubric>) =>
    ApiClient.put<Rubric>(`/grades/${id}`, data),

  deleteRubric: (id: number) =>
    ApiClient.delete(`/grades/${id}`),
};
```

### Frontend Components to Update:

| Component | Current Data Source | Replace With |
|-----------|-------------------|--------------|
| StudentDashboard > GradesTranscript | `GRADES_DATA` constant | `gradeService.getMyGrades()` + `gradeService.getTranscript()` |
| StudentDashboard > GpaChart | Hardcoded GPA data | `gradeService.getGPA(studentId)` |
| StudentDashboard > Assignments | `ASSIGNMENTS` constant | `assignmentService.listAssignments()` |
| InstructorDashboard > AssignmentsList | `ASSIGNMENTS` constant | `assignmentService.listAssignments()` |
| InstructorDashboard > GradesTable | Mock grade data | `gradeService.listAllGrades()` + `gradeService.getDistribution()` |
| TADashboard > GradingPage | Mock submissions | `assignmentService.listSubmissions()` |

---

### 5.3 — Quiz Service

**File**: `src/services/api/quizService.ts` (NEW)

```typescript
import { ApiClient } from './client';
import type { Quiz, QuizQuestion, QuizAttempt, QuizStatistics } from '../../types/api';

export const quizService = {
  // CRUD
  listQuizzes: (params?: { courseId?: number; status?: string }) =>
    ApiClient.get<Quiz[]>('/quizzes', params),

  getQuiz: (id: number) =>
    ApiClient.get<Quiz>(`/quizzes/${id}`),

  createQuiz: (data: Partial<Quiz>) =>
    ApiClient.post<Quiz>('/quizzes', data),

  updateQuiz: (id: number, data: Partial<Quiz>) =>
    ApiClient.put<Quiz>(`/quizzes/${id}`, data),

  deleteQuiz: (id: number) =>
    ApiClient.delete(`/quizzes/${id}`),

  // Questions
  addQuestion: (quizId: number, data: Partial<QuizQuestion>) =>
    ApiClient.post<QuizQuestion>(`/quizzes/${quizId}/questions`, data),

  updateQuestion: (quizId: number, questionId: number, data: Partial<QuizQuestion>) =>
    ApiClient.put(`/quizzes/${quizId}/questions/${questionId}`, data),

  deleteQuestion: (quizId: number, questionId: number) =>
    ApiClient.delete(`/quizzes/${quizId}/questions/${questionId}`),

  reorderQuestions: (quizId: number, questionIds: number[]) =>
    ApiClient.put(`/quizzes/${quizId}/questions/reorder`, { questionIds }),

  // Student attempts
  startAttempt: (quizId: number) =>
    ApiClient.post<QuizAttempt>(`/quizzes/${quizId}/attempts/start`, {}),

  submitAttempt: (attemptId: number, answers: { questionId: number; answer: string }[]) =>
    ApiClient.post(`/quizzes/attempts/${attemptId}/submit`, { answers }),

  getMyAttempts: () =>
    ApiClient.get<QuizAttempt[]>('/quizzes/my-attempts'),

  getAttemptResult: (attemptId: number) =>
    ApiClient.get<QuizAttempt>(`/quizzes/attempts/${attemptId}`),

  // Instructor
  getQuizStatistics: (quizId: number) =>
    ApiClient.get<QuizStatistics>(`/quizzes/${quizId}/statistics`),

  getStudentProgress: (courseId: number) =>
    ApiClient.get(`/quizzes/progress/course/${courseId}`),

  getDifficultyLevels: () =>
    ApiClient.get('/quizzes/difficulty-levels'),

  findAttempts: (params?: { quizId?: number }) =>
    ApiClient.get<QuizAttempt[]>('/quizzes/attempts', params),

  gradeAttempt: (attemptId: number, grades: { questionId: number; points: number }[]) =>
    ApiClient.post(`/quizzes/attempts/${attemptId}/grade`, { grades }),

  getPendingGrading: (attemptId: number) =>
    ApiClient.get(`/quizzes/attempts/${attemptId}/pending-grading`),
};
```

---

### 5.4 — Lab Service

**File**: `src/services/api/labService.ts` (NEW)

```typescript
import { ApiClient } from './client';
import type { Lab, LabInstruction, LabSubmission } from '../../types/api';

export const labService = {
  listLabs: (params?: { courseId?: number }) =>
    ApiClient.get<Lab[]>('/labs', params),

  getLab: (id: number) =>
    ApiClient.get<Lab>(`/labs/${id}`),

  createLab: (data: Partial<Lab>) =>
    ApiClient.post<Lab>('/labs', data),

  updateLab: (id: number, data: Partial<Lab>) =>
    ApiClient.put<Lab>(`/labs/${id}`, data),

  deleteLab: (id: number) =>
    ApiClient.delete(`/labs/${id}`),

  // Instructions
  getInstructions: (labId: number) =>
    ApiClient.get<LabInstruction[]>(`/labs/${labId}/instructions`),

  addInstruction: (labId: number, data: Partial<LabInstruction>) =>
    ApiClient.post(`/labs/${labId}/instructions`, data),

  // Submissions
  submitLab: (labId: number, data: { content?: string; file?: File }) =>
    ApiClient.post<LabSubmission>(`/labs/${labId}/submit`, data),

  getMySubmission: (labId: number) =>
    ApiClient.get<LabSubmission>(`/labs/${labId}/submissions/my`),

  listSubmissions: (labId: number) =>
    ApiClient.get<LabSubmission[]>(`/labs/${labId}/submissions`),

  gradeSubmission: (labId: number, submissionId: number, data: { grade: number; feedback?: string }) =>
    ApiClient.put(`/labs/${labId}/submissions/${submissionId}/grade`, data),

  // Lab Attendance
  markLabAttendance: (labId: number, records: { studentId: number; status: string }[]) =>
    ApiClient.post(`/labs/${labId}/attendance`, { records }),

  getLabAttendance: (labId: number) =>
    ApiClient.get(`/labs/${labId}/attendance`),
};
```

---

## 6. Phase 3 — Communication

> **Dependencies**: Phase 0 (auth context needed for sender identity). Can run in parallel with Phase 2.

### 6.1 — Messaging Service

**File**: `src/services/api/messagingService.ts` (NEW)

```typescript
import { ApiClient } from './client';
import type { Conversation, Message } from '../../types/api';

export const messagingService = {
  // Conversations
  listConversations: () =>
    ApiClient.get<Conversation[]>('/messaging/conversations'),

  startConversation: (participantIds: number[]) =>
    ApiClient.post<Conversation>('/messaging/conversations', { participantIds }),

  // Messages
  getMessages: (conversationId: number, params?: { page?: number; limit?: number }) =>
    ApiClient.get<Message[]>(`/messaging/conversations/${conversationId}`, params),

  sendMessage: (conversationId: number, data: { content: string; type?: string }) =>
    ApiClient.post<Message>(`/messaging/conversations/${conversationId}`, data),

  markAsRead: (messageId: number) =>
    ApiClient.put(`/messaging/${messageId}/read`, {}),

  deleteForMe: (messageId: number) =>
    ApiClient.delete(`/messaging/${messageId}`),

  deleteForEveryone: (messageId: number) =>
    ApiClient.delete(`/messaging/${messageId}/everyone`),

  // Utility
  getUnreadCount: () =>
    ApiClient.get<{ count: number }>('/messaging/unread-count'),

  searchMessages: (query: string) =>
    ApiClient.get<Message[]>('/messaging/search', { q: query }),

  getOnlineUsers: () =>
    ApiClient.get<{ userId: number; isOnline: boolean }[]>('/messaging/online-users'),
};
```

### Frontend Component Updates:

**All dashboards** use `MessagingChat` (shared or student-local):
- Replace `DEFAULT_CONVERSATIONS` and `DEFAULT_MESSAGES` constants with `messagingService.listConversations()` and `messagingService.getMessages()`
- Replace local `startNewChatByEmail()` with `messagingService.startConversation([userId])`
- Add `messagingService.sendMessage()` for real message sending
- Add `messagingService.getUnreadCount()` for badge counts
- Wire the "new chat by email" feature to first search users by email via `userService.searchUsers()`, then `startConversation()`

---

### 6.2 — Notification Service

**File**: `src/services/api/notificationService.ts` (NEW)

```typescript
import { ApiClient } from './client';
import type { Notification, NotificationPreferences } from '../../types/api';

export const notificationService = {
  list: (params?: { page?: number; limit?: number }) =>
    ApiClient.get<Notification[]>('/notifications', params),

  getUnreadCount: () =>
    ApiClient.get<{ count: number }>('/notifications/unread-count'),

  markAsRead: (id: number) =>
    ApiClient.put(`/notifications/${id}/read`, {}),

  markAllAsRead: () =>
    ApiClient.put('/notifications/read-all', {}),

  delete: (id: number) =>
    ApiClient.delete(`/notifications/${id}`),

  clearAll: () =>
    ApiClient.delete('/notifications/clear-all'),

  // Preferences
  getPreferences: () =>
    ApiClient.get<NotificationPreferences>('/notifications/preferences'),

  updatePreferences: (prefs: Partial<NotificationPreferences>) =>
    ApiClient.put('/notifications/preferences', prefs),

  // Admin: Send notification
  send: (data: { userId: number; title: string; message: string; type: string }) =>
    ApiClient.post('/notifications/send', data),
};
```

---

### 6.3 — Discussion Service

**File**: `src/services/api/discussionService.ts` (NEW)

```typescript
import { ApiClient } from './client';
import type { DiscussionThread, DiscussionReply } from '../../types/api';

export const discussionService = {
  listThreads: (params?: { courseId?: number }) =>
    ApiClient.get<DiscussionThread[]>('/discussions', params),

  getThread: (id: number) =>
    ApiClient.get<DiscussionThread>(`/discussions/${id}`),

  createThread: (data: { title: string; content: string; courseId?: number }) =>
    ApiClient.post<DiscussionThread>('/discussions', data),

  updateThread: (id: number, data: { title?: string; content?: string }) =>
    ApiClient.put<DiscussionThread>(`/discussions/${id}`, data),

  deleteThread: (id: number) =>
    ApiClient.delete(`/discussions/${id}`),

  // Replies
  addReply: (threadId: number, data: { content: string; parentReplyId?: number }) =>
    ApiClient.post<DiscussionReply>(`/discussions/${threadId}/reply`, data),

  // Moderation
  togglePin: (threadId: number) =>
    ApiClient.put(`/discussions/${threadId}/pin`, {}),

  toggleLock: (threadId: number) =>
    ApiClient.put(`/discussions/${threadId}/lock`, {}),

  markAnswer: (replyId: number) =>
    ApiClient.put(`/discussions/replies/${replyId}/mark-answer`, {}),

  endorseReply: (replyId: number) =>
    ApiClient.put(`/discussions/replies/${replyId}/endorse`, {}),
};
```

---

## 7. Phase 4 — Administration

> **Dependencies**: Phase 0 (auth). Can run in parallel with Phases 2-3.

### 7.1 — User Management Service

**File**: `src/services/api/userService.ts` (NEW)

```typescript
import { ApiClient } from './client';
import type { User, Role, Permission, PaginatedResponse } from '../../types/api';

export const userService = {
  // Users
  listUsers: (params?: { page?: number; limit?: number; role?: string }) =>
    ApiClient.get<PaginatedResponse<User>>('/admin/users', params),

  getUser: (id: number) =>
    ApiClient.get<User>(`/admin/users/${id}`),

  updateUser: (id: number, data: Partial<User>) =>
    ApiClient.put<User>(`/admin/users/${id}`, data),

  deleteUser: (id: number) =>
    ApiClient.delete(`/admin/users/${id}`),

  updateUserStatus: (id: number, status: string) =>
    ApiClient.put(`/admin/users/${id}/status`, { status }),

  searchUsers: (query: string) =>
    ApiClient.get<User[]>('/admin/users/search', { q: query }),

  // Roles
  assignRole: (userId: number, roleId: number) =>
    ApiClient.post(`/admin/users/${userId}/roles`, { roleId }),

  removeRole: (userId: number, roleId: number) =>
    ApiClient.delete(`/admin/users/${userId}/roles/${roleId}`),

  getUserPermissions: (userId: number) =>
    ApiClient.get<Permission[]>(`/admin/users/${userId}/permissions`),

  // Role CRUD
  listRoles: () =>
    ApiClient.get<Role[]>('/admin/roles'),

  getRole: (id: number) =>
    ApiClient.get<Role>(`/admin/roles/${id}`),

  createRole: (data: Partial<Role>) =>
    ApiClient.post<Role>('/admin/roles', data),

  updateRole: (id: number, data: Partial<Role>) =>
    ApiClient.put<Role>(`/admin/roles/${id}`, data),

  deleteRole: (id: number) =>
    ApiClient.delete(`/admin/roles/${id}`),

  addPermissionToRole: (roleId: number, permissionId: number) =>
    ApiClient.post(`/admin/roles/${roleId}/permissions`, { permissionId }),

  removePermissionFromRole: (roleId: number, permissionId: number) =>
    ApiClient.delete(`/admin/roles/${roleId}/permissions/${permissionId}`),

  // Permission CRUD
  listPermissions: () =>
    ApiClient.get<Permission[]>('/admin/permissions'),

  getPermissionsByModule: (module: string) =>
    ApiClient.get<Permission[]>(`/admin/permissions/module/${module}`),

  createPermission: (data: Partial<Permission>) =>
    ApiClient.post<Permission>('/admin/permissions', data),

  updatePermission: (id: number, data: Partial<Permission>) =>
    ApiClient.put<Permission>(`/admin/permissions/${id}`, data),

  deletePermission: (id: number) =>
    ApiClient.delete(`/admin/permissions/${id}`),
};
```

### Frontend Component Updates:

| Component | Current Data Source | Replace With |
|-----------|-------------------|--------------|
| AdminDashboard > StudentManagementPage | 240 mock users | `userService.listUsers({ role: 'STUDENT' })` |
| AdminDashboard > DashboardOverview | Mock stats | `userService.listUsers()` for counts |
| ITAdmin > UserManagementPage | Mock user list | `userService.listUsers()` with full CRUD |
| ITAdmin > RoleManagementPage | Mock roles | `userService.listRoles()` with CRUD |

---

### 7.2 — Attendance Service

**File**: `src/services/api/attendanceService.ts` (NEW)

```typescript
import { ApiClient } from './client';
import type { AttendanceSession, AttendanceRecord, AttendanceSummary } from '../../types/api';

export const attendanceService = {
  // Sessions
  createSession: (data: { sectionId: number; date: string; type: string }) =>
    ApiClient.post<AttendanceSession>('/attendance/sessions', data),

  listSessions: (params?: { sectionId?: number }) =>
    ApiClient.get<AttendanceSession[]>('/attendance/sessions', params),

  getSession: (id: number) =>
    ApiClient.get<AttendanceSession>(`/attendance/sessions/${id}`),

  updateSession: (id: number, data: Partial<AttendanceSession>) =>
    ApiClient.put(`/attendance/sessions/${id}`, data),

  deleteSession: (id: number) =>
    ApiClient.delete(`/attendance/sessions/${id}`),

  closeSession: (id: number) =>
    ApiClient.put(`/attendance/sessions/${id}/close`, {}),

  getSessionRecords: (sessionId: number) =>
    ApiClient.get<AttendanceRecord[]>(`/attendance/sessions/${sessionId}/records`),

  // Records
  markAttendance: (data: { sessionId: number; studentId: number; status: string }) =>
    ApiClient.post<AttendanceRecord>('/attendance/records', data),

  batchMarkAttendance: (data: { sessionId: number; records: { studentId: number; status: string }[] }) =>
    ApiClient.post('/attendance/records/batch', data),

  updateRecord: (id: number, data: { status: string; notes?: string }) =>
    ApiClient.put(`/attendance/records/${id}`, data),

  // Student view
  getMyAttendance: (params?: { courseId?: number }) =>
    ApiClient.get('/attendance/my', params),

  getStudentAttendance: (studentId: number) =>
    ApiClient.get(`/attendance/by-student/${studentId}`),

  // Reports
  getCourseAttendance: (courseId: number) =>
    ApiClient.get(`/attendance/by-course/${courseId}`),

  getSectionSummary: (sectionId: number) =>
    ApiClient.get<AttendanceSummary>(`/attendance/summary/${sectionId}`),

  getWeeklyTrends: (sectionId: number) =>
    ApiClient.get(`/attendance/trends/${sectionId}`),

  getSectionReport: (sectionId: number) =>
    ApiClient.get(`/attendance/report/${sectionId}`),

  // Import/Export
  importFromExcel: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return ApiClient.post('/attendance/import-excel', formData);
  },

  exportToExcel: (sessionId: number) =>
    ApiClient.get(`/attendance/export-excel/${sessionId}`, {}, { responseType: 'blob' }),

  exportSectionToExcel: (sectionId: number) =>
    ApiClient.get(`/attendance/export-excel/section/${sectionId}`, {}, { responseType: 'blob' }),

  // AI Photo
  uploadAIPhoto: (sessionId: number, photo: File) => {
    const formData = new FormData();
    formData.append('photo', photo);
    formData.append('sessionId', String(sessionId));
    return ApiClient.post('/attendance/ai-photo', formData);
  },

  getAIProcessingResult: (processingId: string) =>
    ApiClient.get(`/attendance/ai-photo/${processingId}`),
};
```

---

### 7.3 — Campus Service

**File**: `src/services/api/campusService.ts` (NEW)

```typescript
import { ApiClient } from './client';
import type { Campus, Department, Program } from '../../types/api';

export const campusService = {
  // Campuses
  listCampuses: () =>
    ApiClient.get<Campus[]>('/admin/campus'),

  getCampus: (id: number) =>
    ApiClient.get<Campus>(`/admin/campus/${id}`),

  createCampus: (data: Partial<Campus>) =>
    ApiClient.post<Campus>('/admin/campus', data),

  updateCampus: (id: number, data: Partial<Campus>) =>
    ApiClient.put<Campus>(`/admin/campus/${id}`, data),

  deleteCampus: (id: number) =>
    ApiClient.delete(`/admin/campus/${id}`),

  // Departments
  getDepartments: (campusId: number) =>
    ApiClient.get<Department[]>(`/admin/campus/campuses/${campusId}/departments`),

  getDepartment: (id: number) =>
    ApiClient.get<Department>(`/admin/campus/departments/${id}`),

  createDepartment: (data: Partial<Department>) =>
    ApiClient.post<Department>('/admin/campus/departments', data),

  updateDepartment: (id: number, data: Partial<Department>) =>
    ApiClient.put<Department>(`/admin/campus/departments/${id}`, data),

  deleteDepartment: (id: number) =>
    ApiClient.delete(`/admin/campus/departments/${id}`),

  // Programs
  getPrograms: (deptId: number) =>
    ApiClient.get<Program[]>(`/admin/campus/departments/${deptId}/programs`),

  getProgram: (id: number) =>
    ApiClient.get<Program>(`/admin/campus/programs/${id}`),

  createProgram: (data: Partial<Program>) =>
    ApiClient.post<Program>('/admin/campus/programs', data),

  updateProgram: (id: number, data: Partial<Program>) =>
    ApiClient.put<Program>(`/admin/campus/programs/${id}`, data),

  deleteProgram: (id: number) =>
    ApiClient.delete(`/admin/campus/programs/${id}`),
};
```

---

### 7.4 — File Service

**File**: `src/services/api/fileService.ts` (NEW)

```typescript
import { ApiClient } from './client';
import type { FileItem, FileVersion, Folder } from '../../types/api';

export const fileService = {
  // Upload
  uploadFile: (file: File, folderId?: number) => {
    const formData = new FormData();
    formData.append('file', file);
    if (folderId) formData.append('folderId', String(folderId));
    return ApiClient.post<FileItem>('/files/upload', formData);
  },

  // Search & Browse
  searchFiles: (query: string) =>
    ApiClient.get<FileItem[]>('/files/search', { q: query }),

  getRecentFiles: () =>
    ApiClient.get<FileItem[]>('/files/recent'),

  getSharedFiles: () =>
    ApiClient.get<FileItem[]>('/files/shared'),

  // File operations
  getFile: (fileId: number) =>
    ApiClient.get<FileItem>(`/files/${fileId}`),

  downloadFile: (fileId: number) =>
    ApiClient.get(`/files/${fileId}/download`, {}, { responseType: 'blob' }),

  updateFile: (fileId: number, data: Partial<FileItem>) =>
    ApiClient.put(`/files/${fileId}`, data),

  deleteFile: (fileId: number) =>
    ApiClient.delete(`/files/${fileId}`),

  // Versions
  createVersion: (fileId: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return ApiClient.post<FileVersion>(`/files/${fileId}/versions`, formData);
  },

  getVersions: (fileId: number) =>
    ApiClient.get<FileVersion[]>(`/files/${fileId}/versions`),

  downloadVersion: (fileId: number, versionId: number) =>
    ApiClient.get(`/files/${fileId}/versions/${versionId}/download`, {}, { responseType: 'blob' }),

  // Permissions
  getPermissions: (fileId: number) =>
    ApiClient.get(`/files/${fileId}/permissions`),

  grantPermission: (fileId: number, data: { userId: number; permission: string }) =>
    ApiClient.post(`/files/${fileId}/permissions`, data),

  revokePermission: (fileId: number, permissionId: number) =>
    ApiClient.delete(`/files/${fileId}/permissions/${permissionId}`),

  // Folders
  createFolder: (data: { name: string; parentId?: number }) =>
    ApiClient.post<Folder>('/files', data),

  getFolder: (folderId: number) =>
    ApiClient.get<Folder>(`/files/${folderId}`),

  getFolderChildren: (folderId: number) =>
    ApiClient.get(`/files/${folderId}/children`),

  getFolderTree: (folderId: number) =>
    ApiClient.get(`/files/${folderId}/tree`),

  updateFolder: (folderId: number, data: { name: string }) =>
    ApiClient.put(`/files/${folderId}`, data),

  deleteFolder: (folderId: number) =>
    ApiClient.delete(`/files/${folderId}`),
};
```

---

## 8. Phase 5 — System & Polish

> **Dependencies**: All other phases for maximum test coverage.

### 8.1 — Socket.io Real-Time Integration

**File**: `src/services/socket.ts` (NEW)

```typescript
import { io, Socket } from 'socket.io-client';
import { authService } from './api/authService';

class SocketService {
  private socket: Socket | null = null;

  connect() {
    const token = authService.getAccessToken();
    if (!token) return;

    this.socket = io('http://localhost:8081', {
      auth: { token },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  // Messaging events
  onNewMessage(callback: (message: any) => void) {
    this.socket?.on('newMessage', callback);
  }

  onMessageRead(callback: (data: { messageId: number; userId: number }) => void) {
    this.socket?.on('messageRead', callback);
  }

  onUserOnline(callback: (data: { userId: number }) => void) {
    this.socket?.on('userOnline', callback);
  }

  onUserOffline(callback: (data: { userId: number }) => void) {
    this.socket?.on('userOffline', callback);
  }

  // Notification events
  onNotification(callback: (notification: any) => void) {
    this.socket?.on('notification', callback);
  }

  // Clean up specific listener
  off(event: string) {
    this.socket?.off(event);
  }
}

export const socketService = new SocketService();
```

**Install dependency**:
```bash
npm install socket.io-client
```

---

### 8.2 — Token Refresh Interceptor

**File**: `src/services/api/client.ts` (MODIFY)

Add a 401 interceptor to the existing `ApiClient.request()` method:

```typescript
// In the catch block of request():
if (response.status === 401) {
  // Try to refresh the token
  try {
    const { accessToken } = await authService.refreshToken();
    // Retry the original request with new token
    headers['Authorization'] = `Bearer ${accessToken}`;
    const retryResponse = await fetch(url, { method, headers, body });
    // ... handle retry response
  } catch {
    // Refresh failed — redirect to login
    authService.logout();
    window.location.href = '/login';
  }
}
```

---

### 8.3 — Error Handling & Loading States

**Create reusable components**:

| Component | Purpose |
|-----------|---------|
| `src/components/shared/LoadingSkeleton.tsx` | Skeleton placeholder for loading states |
| `src/components/shared/ErrorMessage.tsx` | Error display with retry button |
| `src/components/shared/ErrorBoundary.tsx` | React error boundary (catches render errors) |
| `src/components/shared/Toast.tsx` | Toast notification for API success/error feedback |

**Update `useApi` hook**:
- Add retry logic (configurable retry count, exponential backoff)
- Add `onSuccess` and `onError` callbacks
- Add `initialData` option for SSR/fallback

---

## 9. Complete Endpoint Catalog

### Auth Controller (`api/auth`) — 7 endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `POST` | `/api/auth/register` | Register new user | Public |
| `POST` | `/api/auth/login` | Login | Public |
| `POST` | `/api/auth/logout` | Logout | Authenticated |
| `POST` | `/api/auth/refresh-token` | Refresh JWT | Authenticated |
| `POST` | `/api/auth/forgot-password` | Request password reset | Public |
| `POST` | `/api/auth/reset-password` | Reset password with token | Public |
| `GET` | `/api/auth/me` | Get current user | Authenticated |

### User Management Controller (`api/admin`) — 21 endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `GET` | `/api/admin/users` | List all users | Authenticated |
| `GET` | `/api/admin/users/search` | Search users | Authenticated |
| `GET` | `/api/admin/users/:id` | Get user by ID | Authenticated |
| `PUT` | `/api/admin/users/:id` | Update user | Authenticated |
| `DELETE` | `/api/admin/users/:id` | Delete user | Authenticated |
| `PUT` | `/api/admin/users/:id/status` | Update user status | Authenticated |
| `POST` | `/api/admin/users/:id/roles` | Assign role | Authenticated |
| `DELETE` | `/api/admin/users/:id/roles/:roleId` | Remove role | Authenticated |
| `GET` | `/api/admin/users/:id/permissions` | Get user permissions | Authenticated |
| `GET` | `/api/admin/roles` | List all roles | Authenticated |
| `GET` | `/api/admin/roles/:id` | Get role | Authenticated |
| `POST` | `/api/admin/roles` | Create role | Authenticated |
| `PUT` | `/api/admin/roles/:id` | Update role | Authenticated |
| `DELETE` | `/api/admin/roles/:id` | Delete role | Authenticated |
| `POST` | `/api/admin/roles/:id/permissions` | Add permission to role | Authenticated |
| `DELETE` | `/api/admin/roles/:id/permissions/:permId` | Remove permission | Authenticated |
| `GET` | `/api/admin/permissions` | List all permissions | Authenticated |
| `GET` | `/api/admin/permissions/module/:module` | Permissions by module | Authenticated |
| `POST` | `/api/admin/permissions` | Create permission | Authenticated |
| `PUT` | `/api/admin/permissions/:id` | Update permission | Authenticated |
| `DELETE` | `/api/admin/permissions/:id` | Delete permission | Authenticated |

### Campus Controller (`api/admin/campus`) — 17 endpoints

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| `GET` | `/api/admin/campus` | List campuses | Any |
| `POST` | `/api/admin/campus` | Create campus | IT_ADMIN, ADMIN |
| `GET` | `/api/admin/campus/:id` | Get campus | Any |
| `PUT` | `/api/admin/campus/:id` | Update campus | IT_ADMIN, ADMIN |
| `DELETE` | `/api/admin/campus/:id` | Delete campus | IT_ADMIN, ADMIN |
| `GET` | `/api/admin/campus/campuses/:campusId/departments` | List departments | Any |
| `POST` | `/api/admin/campus/departments` | Create department | IT_ADMIN, ADMIN |
| `GET` | `/api/admin/campus/departments/:id` | Get department | Any |
| `PUT` | `/api/admin/campus/departments/:id` | Update department | IT_ADMIN, ADMIN |
| `DELETE` | `/api/admin/campus/departments/:id` | Delete department | IT_ADMIN, ADMIN |
| `GET` | `/api/admin/campus/departments/:deptId/programs` | List programs | Any |
| `POST` | `/api/admin/campus/programs` | Create program | IT_ADMIN, ADMIN |
| `GET` | `/api/admin/campus/programs/:id` | Get program | Any |
| `PUT` | `/api/admin/campus/programs/:id` | Update program | IT_ADMIN, ADMIN |
| `DELETE` | `/api/admin/campus/programs/:id` | Delete program | IT_ADMIN, ADMIN |
| `GET` | `/api/admin/campus/current` | Current semester | Any |
| `POST/PUT/DELETE` | `/api/admin/campus` (semester) | Semester CRUD | IT_ADMIN, ADMIN |

### Courses Controller (`api/courses`) — 14 endpoints

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| `GET` | `/api/courses` | List all courses | Any |
| `GET` | `/api/courses/department/:deptId` | Courses by department | Any |
| `GET` | `/api/courses/:id` | Get course | Any |
| `POST` | `/api/courses` | Create course | Any |
| `PATCH` | `/api/courses/:id` | Update course | Any |
| `DELETE` | `/api/courses/:id` | Delete course | Any |
| `GET` | `/api/courses/:id/prerequisites` | Get prerequisites | Any |
| `POST` | `/api/courses/:id/prerequisites` | Add prerequisite | Any |
| `DELETE` | `/api/courses/:id/prerequisites/:prereqId` | Remove prerequisite | Any |
| `GET` | `/api/courses/course/:courseId` | Sections by course | Any |
| `POST` | `/api/courses` (section) | Create section | Any |
| `PATCH` | `/api/courses/:id` (section) | Update section | Any |
| `GET` | `/api/courses/section/:sectionId` | Schedules by section | Any |
| `POST` | `/api/courses/section/:sectionId` (schedule) | Create schedule | Any |

### Enrollments Controller (`api/enrollments`) — 9 endpoints

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| `GET` | `/api/enrollments/my-courses` | My enrolled courses | STUDENT |
| `GET` | `/api/enrollments/available` | Available courses | STUDENT |
| `POST` | `/api/enrollments/register` | Register for course | STUDENT |
| `GET` | `/api/enrollments/:id` | Get enrollment | Any |
| `DELETE` | `/api/enrollments/:id` | Drop course | Any |
| `GET` | `/api/enrollments/course/:courseId/list` | Course enrollments | INSTRUCTOR, ADMIN |
| `GET` | `/api/enrollments/section/:sectionId/students` | Section students | INSTRUCTOR, ADMIN |
| `GET` | `/api/enrollments/section/:sectionId/waitlist` | Section waitlist | INSTRUCTOR, ADMIN |
| `POST` | `/api/enrollments/:id/status` | Update enrollment status | ADMIN |

### Assignments Controller (`api/assignments`) — 10 endpoints

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| `GET` | `/api/assignments` | List assignments | Any |
| `POST` | `/api/assignments` | Create assignment | INSTRUCTOR, ADMIN |
| `GET` | `/api/assignments/:id` | Get assignment | Any |
| `PATCH` | `/api/assignments/:id` | Update assignment | INSTRUCTOR, ADMIN |
| `DELETE` | `/api/assignments/:id` | Delete assignment | INSTRUCTOR, ADMIN |
| `PATCH` | `/api/assignments/:id/status` | Change status | INSTRUCTOR, ADMIN |
| `POST` | `/api/assignments/:id/submit` | Submit assignment | STUDENT |
| `GET` | `/api/assignments/:id/submissions/my` | My submission | STUDENT |
| `GET` | `/api/assignments/:id/submissions` | List submissions | INSTRUCTOR, TA, ADMIN |
| `PATCH` | `/api/assignments/:id/submissions/:subId/grade` | Grade submission | INSTRUCTOR, TA |

### Grades Controller (`api/grades`) — 11 endpoints

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| `GET` | `/api/grades` | List all grades | INSTRUCTOR, TA, ADMIN |
| `GET` | `/api/grades/my` | My grades | STUDENT |
| `GET` | `/api/grades/transcript/:studentId` | Student transcript | STUDENT, ADMIN |
| `GET` | `/api/grades/gpa/:studentId` | Calculate GPA | STUDENT, ADMIN |
| `GET` | `/api/grades/distribution/:courseId` | Grade distribution | INSTRUCTOR, TA, ADMIN |
| `PUT` | `/api/grades/:id` | Update grade | INSTRUCTOR, TA |
| `PATCH` | `/api/grades/:id/finalize` | Finalize grade | INSTRUCTOR |
| `GET` | `/api/grades` (rubrics) | List rubrics | INSTRUCTOR, TA |
| `POST` | `/api/grades` (rubric) | Create rubric | INSTRUCTOR |
| `PUT` | `/api/grades/:id` (rubric) | Update rubric | INSTRUCTOR |
| `DELETE` | `/api/grades/:id` (rubric) | Delete rubric | INSTRUCTOR |

### Quizzes Controller (`api/quizzes`) — 19 endpoints

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| `POST` | `/api/quizzes` | Create quiz | INSTRUCTOR, TA, ADMIN |
| `GET` | `/api/quizzes` | List quizzes | All roles |
| `GET` | `/api/quizzes/difficulty-levels` | Difficulty levels | INSTRUCTOR, TA, ADMIN |
| `GET` | `/api/quizzes/my-attempts` | My attempts | STUDENT |
| `GET` | `/api/quizzes/attempts` | List attempts | INSTRUCTOR, TA, ADMIN |
| `GET` | `/api/quizzes/:id` | Get quiz | All roles |
| `PUT` | `/api/quizzes/:id` | Update quiz | INSTRUCTOR, TA, ADMIN |
| `DELETE` | `/api/quizzes/:id` | Delete quiz | INSTRUCTOR, ADMIN |
| `POST` | `/api/quizzes/:quizId/questions` | Add question | INSTRUCTOR, TA, ADMIN |
| `PUT` | `/api/quizzes/:quizId/questions/reorder` | Reorder questions | INSTRUCTOR, TA, ADMIN |
| `PUT` | `/api/quizzes/:quizId/questions/:questionId` | Update question | INSTRUCTOR, TA, ADMIN |
| `DELETE` | `/api/quizzes/:quizId/questions/:questionId` | Delete question | INSTRUCTOR, TA, ADMIN |
| `POST` | `/api/quizzes/:quizId/attempts/start` | Start attempt | STUDENT |
| `POST` | `/api/quizzes/attempts/:attemptId/submit` | Submit attempt | STUDENT |
| `GET` | `/api/quizzes/attempts/:attemptId` | Get result | All roles |
| `POST` | `/api/quizzes/attempts/:attemptId/grade` | Manual grade | INSTRUCTOR, TA, ADMIN |
| `GET` | `/api/quizzes/attempts/:attemptId/pending-grading` | Needs grading | INSTRUCTOR, TA, ADMIN |
| `GET` | `/api/quizzes/:quizId/statistics` | Quiz statistics | INSTRUCTOR, TA, ADMIN |
| `GET` | `/api/quizzes/progress/course/:courseId` | Student progress | STUDENT |

### Labs Controller (`api/labs`) — 13 endpoints

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| `GET` | `/api/labs` | List labs | Any |
| `POST` | `/api/labs` | Create lab | INSTRUCTOR, TA, ADMIN, IT_ADMIN |
| `GET` | `/api/labs/:id` | Get lab | Any |
| `PUT` | `/api/labs/:id` | Update lab | INSTRUCTOR, TA, ADMIN, IT_ADMIN |
| `DELETE` | `/api/labs/:id` | Delete lab | INSTRUCTOR, ADMIN, IT_ADMIN |
| `GET` | `/api/labs/:id/instructions` | Get instructions | Any |
| `POST` | `/api/labs/:id/instructions` | Add instruction | INSTRUCTOR, TA, ADMIN, IT_ADMIN |
| `POST` | `/api/labs/:id/submit` | Submit lab | STUDENT |
| `GET` | `/api/labs/:id/submissions` | List submissions | INSTRUCTOR, TA, ADMIN, IT_ADMIN |
| `GET` | `/api/labs/:id/submissions/my` | My submission | STUDENT |
| `PATCH` | `/api/labs/:id/submissions/:subId/grade` | Grade submission | INSTRUCTOR, TA, ADMIN, IT_ADMIN |
| `POST` | `/api/labs/:id/attendance` | Mark attendance | INSTRUCTOR, TA, ADMIN, IT_ADMIN |
| `GET` | `/api/labs/:id/attendance` | Get attendance | INSTRUCTOR, TA, ADMIN, IT_ADMIN |

### Attendance Controller (`attendance`) — 21 endpoints

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| `POST` | `/attendance/sessions` | Create session | INSTRUCTOR, TA, ADMIN |
| `GET` | `/attendance/sessions` | List sessions | INSTRUCTOR, TA, ADMIN |
| `GET` | `/attendance/sessions/:id` | Get session | INSTRUCTOR, TA, ADMIN |
| `PUT` | `/attendance/sessions/:id` | Update session | INSTRUCTOR, TA, ADMIN |
| `DELETE` | `/attendance/sessions/:id` | Delete session | INSTRUCTOR, ADMIN |
| `PATCH` | `/attendance/sessions/:id/close` | Close session | INSTRUCTOR, TA, ADMIN |
| `GET` | `/attendance/sessions/:id/records` | Session records | INSTRUCTOR, TA, ADMIN |
| `POST` | `/attendance/records` | Mark attendance | INSTRUCTOR, TA, ADMIN |
| `POST` | `/attendance/records/batch` | Batch mark | INSTRUCTOR, TA, ADMIN |
| `PUT` | `/attendance/records/:id` | Update record | INSTRUCTOR, TA, ADMIN |
| `GET` | `/attendance/my` | My attendance | STUDENT |
| `GET` | `/attendance/by-student/:studentId` | Student attendance | STUDENT, INSTRUCTOR, TA, ADMIN |
| `GET` | `/attendance/by-course/:courseId` | Course attendance | INSTRUCTOR, TA, ADMIN |
| `GET` | `/attendance/summary/:sectionId` | Section summary | INSTRUCTOR, TA, ADMIN |
| `GET` | `/attendance/trends/:sectionId` | Weekly trends | INSTRUCTOR, TA, ADMIN |
| `GET` | `/attendance/report/:sectionId` | Section report | INSTRUCTOR, TA, ADMIN |
| `POST` | `/attendance/import-excel` | Import Excel | INSTRUCTOR, TA, ADMIN |
| `GET` | `/attendance/export-excel/:sessionId` | Export session | INSTRUCTOR, TA, ADMIN |
| `GET` | `/attendance/export-excel/section/:sectionId` | Export section | INSTRUCTOR, TA, ADMIN |
| `POST` | `/attendance/ai-photo` | AI photo upload | INSTRUCTOR, TA, ADMIN |
| `GET` | `/attendance/ai-photo/:processingId` | AI result | INSTRUCTOR, TA, ADMIN |

### Messaging Controller (`api/messaging`) — 10 endpoints

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| `GET` | `/api/messaging/conversations` | List conversations | Any |
| `POST` | `/api/messaging/conversations` | Start conversation | Any |
| `GET` | `/api/messaging/conversations/:id` | Get messages | Any |
| `POST` | `/api/messaging/conversations/:id` | Send message | Any |
| `PATCH` | `/api/messaging/:id/read` | Mark as read | Any |
| `DELETE` | `/api/messaging/:id` | Delete for me | Any |
| `DELETE` | `/api/messaging/:id/everyone` | Delete for all | Any |
| `GET` | `/api/messaging/unread-count` | Unread count | Any |
| `GET` | `/api/messaging/search` | Search messages | Any |
| `GET` | `/api/messaging/online-users` | Online users | Any |

### Notifications Controller (`api/notifications`) — 9 endpoints

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| `GET` | `/api/notifications` | List notifications | Any |
| `GET` | `/api/notifications/unread-count` | Unread count | Any |
| `PATCH` | `/api/notifications/read-all` | Mark all read | Any |
| `DELETE` | `/api/notifications/clear-all` | Clear all | Any |
| `GET` | `/api/notifications/preferences` | Get preferences | Any |
| `PUT` | `/api/notifications/preferences` | Update preferences | Any |
| `PATCH` | `/api/notifications/:id/read` | Mark read | Any |
| `DELETE` | `/api/notifications/:id` | Delete | Any |
| `POST` | `/api/notifications/send` | Send notification | ADMIN, IT_ADMIN |

### Discussions Controller (`api/discussions`) — 10 endpoints

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| `GET` | `/api/discussions` | List threads | Any |
| `POST` | `/api/discussions` | Create thread | Any |
| `GET` | `/api/discussions/:id` | Thread with replies | Any |
| `PUT` | `/api/discussions/:id` | Update thread | Any |
| `DELETE` | `/api/discussions/:id` | Delete thread | INSTRUCTOR, ADMIN, IT_ADMIN |
| `POST` | `/api/discussions/:id/reply` | Add reply | Any |
| `PATCH` | `/api/discussions/:id/pin` | Toggle pin | INSTRUCTOR, TA, ADMIN, IT_ADMIN |
| `PATCH` | `/api/discussions/:id/lock` | Toggle lock | INSTRUCTOR, TA, ADMIN, IT_ADMIN |
| `PATCH` | `/api/discussions/replies/:replyId/mark-answer` | Mark answer | INSTRUCTOR, TA, ADMIN, IT_ADMIN |
| `PATCH` | `/api/discussions/replies/:replyId/endorse` | Endorse reply | INSTRUCTOR, TA, ADMIN, IT_ADMIN |

### Files Controller (`api/files`) — 20 endpoints

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| `POST` | `/api/files/upload` | Upload file | Any |
| `GET` | `/api/files/search` | Search files | Any |
| `GET` | `/api/files/recent` | Recent files | Any |
| `GET` | `/api/files/shared` | Shared files | Any |
| `GET` | `/api/files/:fileId` | Get file | Any |
| `GET` | `/api/files/:fileId/download` | Download file | Any |
| `PUT` | `/api/files/:fileId` | Update file | Any |
| `DELETE` | `/api/files/:fileId` | Delete file | Any |
| `POST` | `/api/files/:fileId/versions` | Create version | Any |
| `GET` | `/api/files/:fileId/versions` | File versions | Any |
| `GET` | `/api/files/:fileId/versions/:versionId/download` | Download version | Any |
| `GET` | `/api/files/:fileId/permissions` | File permissions | Any |
| `POST` | `/api/files/:fileId/permissions` | Grant permission | Any |
| `DELETE` | `/api/files/:fileId/permissions/:permissionId` | Revoke permission | Any |
| `POST` | `/api/files` (folder) | Create folder | Any |
| `GET` | `/api/files/:folderId` (folder) | Get folder | Any |
| `GET` | `/api/files/:folderId/children` | Folder children | Any |
| `GET` | `/api/files/:folderId/tree` | Folder tree | Any |
| `PUT` | `/api/files/:folderId` (folder) | Update folder | Any |
| `DELETE` | `/api/files/:folderId` (folder) | Delete folder | Any |

### YouTube Controller (`api/youtube`) — 3 endpoints

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| `GET` | `/api/youtube/auth` | Get OAuth URL | Any |
| `GET` | `/api/youtube/callback` | OAuth callback | Any |
| `POST` | `/api/youtube/upload` | Upload video | Any |

---

**Grand Total: 195 endpoints across 22 controllers**

---

## 10. File Creation Checklist

### New Files (17 files)

| # | File Path | Phase | Description |
|---|-----------|-------|-------------|
| 1 | `src/types/api.ts` | 0 | All TypeScript interfaces (~400 lines) |
| 2 | `src/hooks/useApi.ts` | 0 | Data-fetching hook + useMutation (~80 lines) |
| 3 | `src/contexts/AuthContext.tsx` | 0 | Auth provider + useAuth hook (~100 lines) |
| 4 | `src/services/api/courseService.ts` | 1 | Courses, sections, schedules |
| 5 | `src/services/api/enrollmentService.ts` | 1 | Enrollment operations |
| 6 | `src/services/api/semesterService.ts` | 1 | Semester data |
| 7 | `src/services/api/assignmentService.ts` | 2 | Assignments & submissions |
| 8 | `src/services/api/gradeService.ts` | 2 | Grades, GPA, transcripts, rubrics |
| 9 | `src/services/api/quizService.ts` | 2 | Quizzes, questions, attempts |
| 10 | `src/services/api/labService.ts` | 2 | Labs, instructions, submissions |
| 11 | `src/services/api/messagingService.ts` | 3 | Conversations & messages |
| 12 | `src/services/api/notificationService.ts` | 3 | Notifications & preferences |
| 13 | `src/services/api/discussionService.ts` | 3 | Discussion threads & replies |
| 14 | `src/services/api/userService.ts` | 4 | User management (admin) |
| 15 | `src/services/api/attendanceService.ts` | 4 | Attendance tracking |
| 16 | `src/services/api/campusService.ts` | 4 | Campus, departments, programs |
| 17 | `src/services/api/fileService.ts` | 4 | File upload/download/folders |

### Files to Modify

| # | File Path | Phase | Changes |
|---|-----------|-------|---------|
| 1 | `src/services/api/authService.ts` | 0 | Replace mock with real API calls |
| 2 | `src/services/api/client.ts` | 5 | Add 401 refresh interceptor |
| 3 | `src/App.jsx` | 0 | Add AuthProvider, protected routes |
| 4 | `src/pages/auth/LoginPage.tsx` | 0 | Wire to real auth |
| 5 | Student dashboard components | 1-3 | Replace constants with useApi hooks |
| 6 | Instructor dashboard components | 1-3 | Replace constants with useApi hooks |
| 7 | Admin dashboard components | 1-4 | Replace constants with useApi hooks |
| 8 | TA dashboard components | 1-3 | Replace constants with useApi hooks |
| 9 | IT Admin dashboard components | 4-5 | Replace constants with useApi hooks |

### Install Dependencies

```bash
npm install socket.io-client
```

---

## 11. Integration Pattern Reference

### Pattern A: Read-Only Data (Lists, Details)

```typescript
// In component:
import { useApi } from '../../../hooks/useApi';
import { courseService } from '../../../services/api/courseService';

function CoursesPage() {
  const { data, loading, error, refetch } = useApi(
    () => courseService.listCourses(),
    []
  );

  if (loading) return <Skeleton />;
  if (error) return <ErrorMessage error={error} onRetry={refetch} />;
  return <CourseList courses={data} />;
}
```

### Pattern B: CRUD Operations (Create/Update/Delete)

```typescript
import { useMutation } from '../../../hooks/useApi';
import { courseService } from '../../../services/api/courseService';

function CreateCourseForm() {
  const { mutate: createCourse, loading } = useMutation(courseService.createCourse);

  const handleSubmit = async (formData) => {
    try {
      await createCourse(formData);
      toast.success('Course created!');
      refetchCourses(); // trigger list refresh
    } catch (err) {
      toast.error(err.message);
    }
  };
}
```

### Pattern C: Keeping Mock Fallback

```typescript
import { MOCK_COURSES } from '../constants';

function CoursesPage() {
  const { data, loading } = useApi(() => courseService.listCourses());
  const courses = data?.length ? data : MOCK_COURSES;
  // ...
}
```

### Pattern D: Role-Based Conditional Rendering

```typescript
import { useAuth } from '../../../contexts/AuthContext';

function GradingSection() {
  const { hasRole } = useAuth();

  if (!hasRole('INSTRUCTOR') && !hasRole('TA')) return null;

  return <GradingTable />;
}
```

---

## 12. Dependency Graph

```
Phase 0 ──────────────────────────────────── MUST COMPLETE FIRST
  │
  ├─ 0.0 Fix CORS
  ├─ 0.1 Create types/api.ts
  ├─ 0.2 Create hooks/useApi.ts
  ├─ 0.3 Replace authService.ts (mock → real)
  ├─ 0.4 Create AuthContext.tsx
  ├─ 0.5 Wire LoginPage
  └─ 0.6 Add AuthProvider to App.jsx
  │
  ▼
Phase 1 (Core Academic) ────────────── DEPENDS ON Phase 0
  │
  ├─ 1.1 courseService.ts
  ├─ 1.2 enrollmentService.ts
  ├─ 1.3 semesterService.ts
  └─ 1.4 Update dashboard components
  │
  ▼
Phase 2 (Assessments) ──────────────── DEPENDS ON Phase 1
  │  (courses must exist)
  ├─ 2.1 assignmentService.ts
  ├─ 2.2 gradeService.ts
  ├─ 2.3 quizService.ts
  ├─ 2.4 labService.ts
  └─ 2.5 Update assessment components
  │
  │  ┌──────────────────────────────── CAN PARALLEL with Phase 2
  ▼  ▼
Phase 3 (Communication) ────────────── DEPENDS ON Phase 0
  │
  ├─ 3.1 messagingService.ts
  ├─ 3.2 notificationService.ts
  ├─ 3.3 discussionService.ts
  └─ 3.4 Update chat/notification components
  │
  │  ┌──────────────────────────────── CAN PARALLEL with Phase 2-3
  ▼  ▼
Phase 4 (Administration) ───────────── DEPENDS ON Phase 0
  │
  ├─ 4.1 userService.ts
  ├─ 4.2 attendanceService.ts
  ├─ 4.3 campusService.ts
  ├─ 4.4 fileService.ts
  └─ 4.5 Update admin components
  │
  ▼
Phase 5 (System & Polish) ──────────── DEPENDS ON ALL
  │
  ├─ 5.1 Socket.io integration
  ├─ 5.2 Token refresh interceptor
  └─ 5.3 Error handling + loading states
```

---

## Quick Start Guide

1. **Start the backend**:
   ```bash
   cd "D:\Graduation Project\Backend\eduverse-backend"
   npm run start:dev
   ```

2. **Verify Swagger**: Open `http://localhost:8081/api-docs`

3. **Register a test user** via Swagger or curl:
   ```bash
   curl -X POST http://localhost:8081/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@edu.com","password":"Test123!","firstName":"Test","lastName":"User"}'
   ```

4. **Start the frontend**:
   ```bash
   cd "D:\Graduation Project\Frontend\eduverse"
   npm run dev
   ```

5. **Begin Phase 0 implementation** following the steps in this document.

---

*Last updated: Session 032b00a6*
*Backend location: D:\Graduation Project\Backend\eduverse-backend*
*Frontend location: D:\Graduation Project\Frontend\eduverse*

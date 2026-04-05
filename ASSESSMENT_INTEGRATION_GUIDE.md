# Assessment Integration Guide

> Common patterns and shared components for integrating Quizzes, Assignments, and Labs in the EduVerse frontend.

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [Common API Patterns](#common-api-patterns)
4. [File Upload Integration](#file-upload-integration)
5. [Grading Integration](#grading-integration)
6. [State Management](#state-management)
7. [Shared Components](#shared-components)
8. [Error Handling](#error-handling)
9. [Real-time Features](#real-time-features)

---

## Overview

All three assessment modules (Quizzes, Assignments, Labs) share common patterns:

| Feature | Quizzes | Assignments | Labs |
|---------|---------|-------------|------|
| Status workflow | ✅ draft→published→closed→archived | ✅ | ✅ |
| File attachments | ❌ (planned) | ✅ Google Drive | ✅ Google Drive |
| Auto-grading | ✅ MCQ/TF | ❌ | ❌ |
| Manual grading | ✅ Essay | ✅ | ✅ |
| Grades table integration | ✅ | ✅ | ✅ |
| Due dates | ✅ availableUntil | ✅ dueDate | ✅ dueDate |
| Late handling | ❌ | ✅ latePenalty % | ✅ isLate flag |
| Attendance | ❌ | ❌ | ✅ |

---

## Authentication & Authorization

### JWT Token Usage

All API requests require a Bearer token:

```typescript
// api/client.ts
const API_BASE = 'http://localhost:8081';

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (response.status === 401) {
    // Token expired - redirect to login
    localStorage.removeItem('accessToken');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
}
```

### Login Flow

```typescript
// POST /api/auth/login
interface LoginDto {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface LoginResponse {
  accessToken: string;
}

const login = async (credentials: LoginDto): Promise<void> => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error('Invalid credentials');
  }

  const { accessToken } = await response.json();
  localStorage.setItem('accessToken', accessToken);
};
```

### Role-Based UI

```typescript
// hooks/useAuth.ts
interface User {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  roles: Array<{ roleName: string }>;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);

  const hasRole = (role: string) => {
    return user?.roles.some(r => r.roleName === role) ?? false;
  };

  const isInstructor = hasRole('instructor');
  const isStudent = hasRole('student');
  const isTA = hasRole('teaching_assistant');
  const isAdmin = hasRole('admin') || hasRole('it_admin');

  const canManageAssessments = isInstructor || isTA || isAdmin;
  const canGrade = isInstructor || isTA;
  const canSubmit = isStudent;

  return { user, hasRole, isInstructor, isStudent, isTA, canManageAssessments, canGrade, canSubmit };
}
```

---

## Common API Patterns

### Pagination

All list endpoints support pagination:

```typescript
interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Usage
const getQuizzes = async (page = 1, limit = 10): Promise<PaginatedResponse<Quiz>> => {
  return apiRequest(`/api/quizzes?page=${page}&limit=${limit}`);
};
```

### Filtering

Common query parameters:

| Parameter | Description | Example |
|-----------|-------------|---------|
| `courseId` | Filter by course | `?courseId=1` |
| `status` | Filter by status | `?status=published` |
| `page` | Page number | `?page=2` |
| `limit` | Items per page | `?limit=20` |
| `search` | Search text | `?search=midterm` |

### Status Change Pattern

All modules use the same status change pattern:

```typescript
type AssessmentStatus = 'draft' | 'published' | 'closed' | 'archived';

const changeStatus = async (
  type: 'quizzes' | 'assignments' | 'labs',
  id: number,
  status: AssessmentStatus
): Promise<void> => {
  await apiRequest(`/api/${type}/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
};
```

---

## File Upload Integration

### Google Drive Integration

The backend uses Google Drive for file storage. Two-step upload process:

```typescript
// Step 1: Upload file to Drive
interface UploadResponse {
  fileId: number;
  fileName: string;
  webViewLink: string;
}

const uploadFile = async (
  type: 'assignments' | 'labs',
  id: number,
  file: File,
  purpose: 'instructions' | 'submissions' | 'ta-materials'
): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const endpoint = purpose === 'instructions'
    ? `/api/${type}/${id}/instructions/upload`
    : purpose === 'ta-materials'
    ? `/api/${type}/${id}/ta-materials/upload`
    : `/api/${type}/${id}/submissions/upload`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    },
    body: formData,
  });

  return response.json();
};

// Step 2: Submit with file ID
const submitWithFile = async (
  type: 'assignments' | 'labs',
  id: number,
  fileId: number
): Promise<void> => {
  await apiRequest(`/api/${type}/${id}/submit`, {
    method: 'POST',
    body: JSON.stringify({ fileId }),
  });
};
```

### File Upload Component

```typescript
// components/FileUploader.tsx
import { useState, useCallback } from 'react';

interface FileUploaderProps {
  type: 'assignments' | 'labs';
  id: number;
  purpose: 'instructions' | 'submissions' | 'ta-materials';
  accept?: string;
  maxSize?: number;  // bytes
  onUpload: (fileId: number, fileName: string) => void;
  onError: (error: string) => void;
}

export function FileUploader({
  type,
  id,
  purpose,
  accept = '*/*',
  maxSize = 10 * 1024 * 1024,  // 10MB default
  onUpload,
  onError,
}: FileUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFile = useCallback(async (file: File) => {
    // Validate size
    if (file.size > maxSize) {
      onError(`File too large. Max size: ${formatBytes(maxSize)}`);
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const result = await uploadFile(type, id, file, purpose);
      onUpload(result.fileId, result.fileName);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, [type, id, purpose, maxSize, onUpload, onError]);

  return (
    <div className="file-uploader">
      <input
        type="file"
        accept={accept}
        disabled={uploading}
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      {uploading && (
        <div className="progress-bar">
          <div className="progress" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
```

---

## Grading Integration

### Central Grades Table

All grades are now stored in the central `grades` table. When you grade a submission, the backend automatically:

1. Saves score/feedback to the submission record
2. Creates/updates a `Grade` record in the grades table
3. Calculates percentage and letter grade

```typescript
// Grade is automatically created when grading:
// - Quiz: After auto-grading or manual grading
// - Assignment: When calling PATCH /grade
// - Lab: When calling PATCH /grade

interface Grade {
  gradeId: number;
  userId: number;
  courseId: number;
  gradeType: 'assignment' | 'quiz' | 'lab' | 'exam' | 'final';
  assignmentId?: number;
  quizId?: number;
  labId?: number;
  score: number;
  maxScore: number;
  percentage: number;
  letterGrade: string;
  feedback?: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Viewing Grades

```typescript
// GET /api/grades/my - Student's grades
const getMyGrades = async (): Promise<PaginatedResponse<Grade>> => {
  return apiRequest('/api/grades/my');
};

// GET /api/grades?courseId=X - Course grades (instructor)
const getCourseGrades = async (courseId: number): Promise<PaginatedResponse<Grade>> => {
  return apiRequest(`/api/grades?courseId=${courseId}`);
};

// GET /api/grades/transcript/:studentId - Student transcript
const getTranscript = async (studentId: number): Promise<Transcript> => {
  return apiRequest(`/api/grades/transcript/${studentId}`);
};

// GET /api/grades/gpa/:studentId - GPA calculation
const getGPA = async (studentId: number): Promise<GpaResult> => {
  return apiRequest(`/api/grades/gpa/${studentId}`);
};
```

---

## State Management

### Recommended Store Structure (Zustand)

```typescript
// stores/assessmentStore.ts
import { create } from 'zustand';

interface AssessmentStore {
  // Quizzes
  quizzes: Quiz[];
  loadingQuizzes: boolean;
  fetchQuizzes: (courseId?: number) => Promise<void>;
  
  // Assignments
  assignments: Assignment[];
  loadingAssignments: boolean;
  fetchAssignments: (courseId?: number) => Promise<void>;
  
  // Labs
  labs: Lab[];
  loadingLabs: boolean;
  fetchLabs: (courseId?: number) => Promise<void>;
  
  // Common
  currentCourseId: number | null;
  setCourseId: (id: number) => void;
}

export const useAssessmentStore = create<AssessmentStore>((set, get) => ({
  // Quizzes
  quizzes: [],
  loadingQuizzes: false,
  fetchQuizzes: async (courseId) => {
    set({ loadingQuizzes: true });
    const cid = courseId || get().currentCourseId;
    const { data } = await apiRequest<PaginatedResponse<Quiz>>(
      `/api/quizzes${cid ? `?courseId=${cid}` : ''}`
    );
    set({ quizzes: data, loadingQuizzes: false });
  },
  
  // Assignments
  assignments: [],
  loadingAssignments: false,
  fetchAssignments: async (courseId) => {
    set({ loadingAssignments: true });
    const cid = courseId || get().currentCourseId;
    const { data } = await apiRequest<PaginatedResponse<Assignment>>(
      `/api/assignments${cid ? `?courseId=${cid}` : ''}`
    );
    set({ assignments: data, loadingAssignments: false });
  },
  
  // Labs
  labs: [],
  loadingLabs: false,
  fetchLabs: async (courseId) => {
    set({ loadingLabs: true });
    const cid = courseId || get().currentCourseId;
    const { data } = await apiRequest<PaginatedResponse<Lab>>(
      `/api/labs${cid ? `?courseId=${cid}` : ''}`
    );
    set({ labs: data, loadingLabs: false });
  },
  
  // Common
  currentCourseId: null,
  setCourseId: (id) => set({ currentCourseId: id }),
}));
```

### Caching Strategy

```typescript
// hooks/useAssessmentCache.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Quizzes
export function useQuizzes(courseId?: number) {
  return useQuery({
    queryKey: ['quizzes', courseId],
    queryFn: () => apiRequest<PaginatedResponse<Quiz>>(
      `/api/quizzes${courseId ? `?courseId=${courseId}` : ''}`
    ),
    staleTime: 5 * 60 * 1000,  // 5 minutes
  });
}

// Single Quiz
export function useQuiz(id: number) {
  return useQuery({
    queryKey: ['quiz', id],
    queryFn: () => apiRequest<Quiz>(`/api/quizzes/${id}`),
  });
}

// Create Quiz
export function useCreateQuiz() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateQuizDto) => 
      apiRequest<Quiz>('/api/quizzes', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
  });
}

// Update Quiz Status
export function useChangeQuizStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      apiRequest<Quiz>(`/api/quizzes/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['quiz', id] });
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
  });
}
```

---

## Shared Components

### Status Badge

```typescript
// components/StatusBadge.tsx
type Status = 'draft' | 'published' | 'closed' | 'archived';

const statusColors: Record<Status, string> = {
  draft: 'bg-gray-500',
  published: 'bg-green-500',
  closed: 'bg-yellow-500',
  archived: 'bg-red-500',
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`px-2 py-1 rounded text-white text-sm ${statusColors[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
```

### Due Date Display

```typescript
// components/DueDate.tsx
import { formatDistanceToNow, isPast, isToday, isTomorrow } from 'date-fns';

interface DueDateProps {
  date: Date;
  showCountdown?: boolean;
}

export function DueDate({ date, showCountdown = true }: DueDateProps) {
  const due = new Date(date);
  const overdue = isPast(due);
  const today = isToday(due);
  const tomorrow = isTomorrow(due);

  let label: string;
  let className: string;

  if (overdue) {
    label = 'Overdue';
    className = 'text-red-600 font-bold';
  } else if (today) {
    label = 'Due Today';
    className = 'text-orange-600 font-bold';
  } else if (tomorrow) {
    label = 'Due Tomorrow';
    className = 'text-yellow-600';
  } else {
    label = showCountdown
      ? `Due ${formatDistanceToNow(due, { addSuffix: true })}`
      : due.toLocaleDateString();
    className = 'text-gray-600';
  }

  return (
    <span className={className} title={due.toLocaleString()}>
      {label}
    </span>
  );
}
```

### Grade Display

```typescript
// components/GradeDisplay.tsx
interface GradeDisplayProps {
  score: number;
  maxScore: number;
  percentage?: number;
  letterGrade?: string;
  showLetter?: boolean;
}

export function GradeDisplay({
  score,
  maxScore,
  percentage,
  letterGrade,
  showLetter = true,
}: GradeDisplayProps) {
  const pct = percentage ?? (score / maxScore) * 100;
  const letter = letterGrade ?? getLetterGrade(pct);

  const getColor = () => {
    if (pct >= 90) return 'text-green-600';
    if (pct >= 80) return 'text-blue-600';
    if (pct >= 70) return 'text-yellow-600';
    if (pct >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className={`grade-display ${getColor()}`}>
      <span className="score">{score} / {maxScore}</span>
      <span className="percentage">({pct.toFixed(1)}%)</span>
      {showLetter && <span className="letter">{letter}</span>}
    </div>
  );
}

function getLetterGrade(percentage: number): string {
  if (percentage >= 97) return 'A+';
  if (percentage >= 93) return 'A';
  if (percentage >= 90) return 'A-';
  if (percentage >= 87) return 'B+';
  if (percentage >= 83) return 'B';
  if (percentage >= 80) return 'B-';
  if (percentage >= 77) return 'C+';
  if (percentage >= 73) return 'C';
  if (percentage >= 70) return 'C-';
  if (percentage >= 67) return 'D+';
  if (percentage >= 63) return 'D';
  if (percentage >= 60) return 'D-';
  return 'F';
}
```

### Loading Skeleton

```typescript
// components/AssessmentSkeleton.tsx
export function AssessmentCardSkeleton() {
  return (
    <div className="assessment-card skeleton">
      <div className="skeleton-line title" />
      <div className="skeleton-line description" />
      <div className="skeleton-line meta" />
    </div>
  );
}

export function AssessmentListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="assessment-list">
      {Array.from({ length: count }).map((_, i) => (
        <AssessmentCardSkeleton key={i} />
      ))}
    </div>
  );
}
```

---

## Error Handling

### Common Error Codes

| Status | Meaning | Action |
|--------|---------|--------|
| 400 | Bad Request | Show validation errors |
| 401 | Unauthorized | Redirect to login |
| 403 | Forbidden | Show "access denied" |
| 404 | Not Found | Show "not found" page |
| 409 | Conflict | Show conflict message |
| 500 | Server Error | Show generic error |

### Error Boundary

```typescript
// components/ErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Error caught:', error, info);
    // Log to monitoring service
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-fallback">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### API Error Hook

```typescript
// hooks/useApiError.ts
import { useState, useCallback } from 'react';

interface ApiError {
  message: string;
  statusCode: number;
  field?: string;
}

export function useApiError() {
  const [error, setError] = useState<ApiError | null>(null);

  const handleError = useCallback((err: unknown) => {
    if (err instanceof Response) {
      err.json().then(data => {
        setError({
          message: data.message || 'An error occurred',
          statusCode: err.status,
          field: data.field,
        });
      });
    } else if (err instanceof Error) {
      setError({
        message: err.message,
        statusCode: 500,
      });
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { error, handleError, clearError };
}
```

---

## Real-time Features

### Quiz Timer WebSocket (Future)

```typescript
// For quiz timers, consider WebSocket connection for:
// - Server-authoritative timer
// - Auto-submit on timeout
// - Sync across devices

interface TimerMessage {
  type: 'TICK' | 'EXPIRED' | 'SYNC';
  attemptId: number;
  remainingSeconds: number;
}

// Example WebSocket setup (to be implemented)
const connectQuizTimer = (attemptId: number, onMessage: (msg: TimerMessage) => void) => {
  const ws = new WebSocket(`ws://localhost:8081/quiz-timer/${attemptId}`);
  
  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    onMessage(message);
  };

  return () => ws.close();
};
```

### Notifications

```typescript
// Poll for notifications (WebSocket integration planned)
const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const poll = setInterval(async () => {
      const data = await apiRequest<Notification[]>('/api/notifications/unread');
      setNotifications(data);
    }, 30000);  // Poll every 30 seconds

    return () => clearInterval(poll);
  }, []);

  return notifications;
};
```

---

## Quick Reference

### Endpoint Summary

| Module | Base URL | CRUD | Submit | Grade | Status |
|--------|----------|------|--------|-------|--------|
| Quizzes | `/api/quizzes` | ✅ | POST `/attempts/start` | POST `/attempts/:id/grade` | PATCH `/:id/status` |
| Assignments | `/api/assignments` | ✅ | POST `/:id/submit` | PATCH `/:id/submissions/:subId/grade` | PATCH `/:id/status` |
| Labs | `/api/labs` | ✅ | POST `/:id/submit` | PATCH `/:id/submissions/:subId/grade` | PATCH `/:id/status` |

### Status Values

All three modules use the same status values:
- `draft` - Not visible to students
- `published` - Available to students
- `closed` - No longer accepting submissions
- `archived` - Hidden from all views

### Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin.tarek@example.com | SecureP@ss123 |
| Instructor | instructor.tarek@example.com | SecureP@ss123 |
| TA | ta.tarek@example.com | SecureP@ss123 |
| Student | student.tarek@example.com | SecureP@ss123 |

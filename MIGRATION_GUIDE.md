# API Migration Guide — EduVerse Frontend

## Overview

This document lists every tab/component that was migrated from hardcoded mock data to real backend API calls on the `api-integration` branch.

## Prerequisites

- Backend running at `http://localhost:8081`
- Vite dev server running (`npm run dev`) — proxies `/api` to backend
- Valid user accounts for each role (student, instructor, admin, ta, it-admin)

---

## Student Dashboard

| Tab / Component | API Service Used | What Changed | How to Test |
|---|---|---|---|
| **Classes** | `courseService.listCourses()` | Fetches enrolled courses from API | Login as student → Classes tab shows enrolled courses |
| **Assignments** | `assignmentService.listAssignments()` | Assignments fetched per course | Select a course → Assignments tab lists real assignments |
| **Grades & Transcript** | `gradeService.getGrades()` | GPA and grade data from API | Grades tab shows actual grades; PDF export works |
| **Attendance** | `attendanceService.getAttendance()` | Attendance records from API | Attendance tab shows real check-in history |
| **Course Registration** | `enrollmentService`, `courseService` | Browse/enroll/drop via API | Registration tab → search courses → enroll/drop |
| **Class Schedule** | `courseService.listCourses()` | Schedule derived from enrolled courses | Schedule tab shows weekly timetable |
| **Quiz Taking** | `quizService.listQuizzes()` | Available quizzes from API | Quiz tab lists quizzes, can attempt them |
| **Lab Instructions** | `labService.listLabs()` | Lab data from API | Lab tab shows instructions for enrolled labs |
| **Notifications** | `notificationService.list()` | Notifications from API | Bell icon / Notifications tab shows real alerts |
| **Course Community** | `discussionService.listThreads()` | Discussion threads from API | Community tab shows threads, can post/reply |
| **Smart Todo** | `assignmentService.listAssignments()` | Deadlines from real assignments | Todo widget shows upcoming due dates |
| **Messaging** | `messagingService` | Conversations/messages from API | Chat tab shows real conversations |
| **Profile** | `useAuth()` context | User data from JWT/auth context | Profile tab shows logged-in user info |

### Tabs that remain mock (no backend endpoint):
- Payment History, Gamification, AI Features

---

## Instructor Dashboard

| Tab / Component | API Service Used | What Changed | How to Test |
|---|---|---|---|
| **Courses** | `courseService.listCourses()` | Instructor's courses from API | Login as instructor → Courses tab |
| **Roster** | `enrollmentService.listEnrollments()` | Students per section from API | Select a section → Roster shows enrolled students |
| **Assignments** | `assignmentService` | CRUD via API (create/edit/delete) | Create assignment → appears in list → edit/delete works |
| **Grades** | `gradeService` | Grades per section from API + save | View/edit grades → changes persist to backend |
| **Attendance** | `attendanceService` | Attendance per section from API | Mark attendance → saves to backend |
| **Quizzes** | `quizService` | Quiz CRUD via API | Create/edit/publish quizzes → persisted |
| **Profile** | `useAuth()` | User info from auth context | Profile shows instructor info |

### Tabs that remain mock:
- AI Attendance, Analytics (partial), Dashboard Stats, Upcoming Classes, Pending Tasks, Recent Activity

---

## Admin Dashboard

| Tab / Component | API Service Used | What Changed | How to Test |
|---|---|---|---|
| **Course Management** | `courseService` | Courses CRUD via API | Add/edit/delete courses → changes persist |
| **Student Management** | `userService.listUsers()` | Student list from API | Student list shows real registered users |
| **Profile** | `useAuth()` | User info from auth context | Profile shows admin info |

### Tabs that remain mock:
- Support Tickets, Audit Logs, Gamification Settings, Calendar, Enrollment Periods, Notification Templates, Analytics, Dashboard Stats

---

## TA Dashboard

| Tab / Component | API Service Used | What Changed | How to Test |
|---|---|---|---|
| **Courses** | `courseService.listCourses()` | TA's courses from API | Login as TA → Courses tab |
| **Labs** | `labService.listLabs()` | Lab sessions from API | Labs tab shows assigned lab sessions |
| **Profile** | `useAuth()` | User info from auth context | Profile shows TA info |

### Tabs that remain mock:
- Dashboard Stats, Recent Activity, Upcoming Labs

---

## IT Admin Dashboard

| Tab / Component | API Service Used | What Changed | How to Test |
|---|---|---|---|
| **Multi-Campus** | `campusService` | Campus CRUD via API | Add/edit/delete campuses → changes persist |
| **Profile** | `useAuth()` | User info from auth context | Profile shows IT admin info |

### Tabs that remain mock:
- Everything except Campuses (system config, monitoring, etc.)

---

## Cross-Cutting Features

| Component | API Service Used | What Changed |
|---|---|---|
| **Messaging (shared)** | `messagingService` | All dashboards' chat uses real API |
| **Messaging (student)** | `messagingService` | Student-specific chat layout uses real API |
| **Auth** | `authService` | Login/register/logout via API with JWT tokens |

---

## Error Handling

All migrated components include:
- **Loading skeletons** while data is being fetched
- **Error messages** with retry button when API calls fail
- **Toast notifications** (Sonner) for:
  - API fetch failures (`toast.error`)
  - Successful CRUD operations (`toast.success`)
  - Failed CRUD operations (`toast.error`)

---

## Architecture

```
src/
├── services/api/          # 14 API service files (one per domain)
├── hooks/useApi.ts        # useApi() and useMutation() hooks
├── types/api.ts           # TypeScript interfaces for API responses
├── context/AuthContext.tsx # JWT auth with token refresh
└── components/shared/     # LoadingSkeleton, ErrorMessage, ErrorBoundary
```

### API Call Pattern
```tsx
import { useApi } from '../../hooks/useApi';
import { courseService } from '../../services/api/courseService';
import { toast } from 'sonner';

const { data, loading, error, refetch } = useApi(() => courseService.listCourses(), []);

useEffect(() => { if (error) toast.error('Failed to load courses'); }, [error]);

if (loading) return <LoadingSkeleton variant="card" count={3} />;
if (error) return <ErrorMessage error={error} onRetry={refetch} />;
```

---

## Branch Info

- **Branch**: `api-integration`
- **Base**: `finalize-v2` at commit `b423bd3`
- **Commits**: 7 commits on top of base

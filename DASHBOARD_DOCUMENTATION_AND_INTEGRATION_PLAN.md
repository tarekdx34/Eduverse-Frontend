git # EduVerse Frontend - Complete Dashboard Documentation & Integration Plan

**Document Version:** 1.0  
**Date:** February 5, 2026  
**Author:** Development Team

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Dashboard Architecture Overview](#2-dashboard-architecture-overview)
3. [Student Dashboard Analysis](#3-student-dashboard-analysis)
4. [Instructor Dashboard Analysis](#4-instructor-dashboard-analysis)
5. [Admin Dashboard Analysis](#5-admin-dashboard-analysis)
6. [IT Admin Dashboard Analysis](#6-it-admin-dashboard-analysis)
7. [Shared Components Catalog](#7-shared-components-catalog)
8. [Enhancement Plan for User Experience](#8-enhancement-plan-for-user-experience)
9. [Backend Integration Plan](#9-backend-integration-plan)
10. [API Specifications](#10-api-specifications)
11. [Implementation Roadmap](#11-implementation-roadmap)

---

## 1. Executive Summary

EduVerse is a comprehensive Learning Management System (LMS) with four distinct dashboards serving different user roles:

| Dashboard | Primary Users | Key Purpose |
|-----------|--------------|-------------|
| **Student** | Students | Course management, grades, assignments, AI learning tools |
| **Instructor** | Professors/TAs | Course teaching, grading, attendance, student management |
| **Admin** | University Staff | User management, course administration, analytics |
| **IT Admin** | IT Department | Infrastructure, security, integrations, AI services |

### Technology Stack
- **Framework:** React 18 with TypeScript
- **Routing:** React Router v6
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Build Tool:** Vite
- **State Management:** React Context API (Theme, Language)

---

## 2. Dashboard Architecture Overview

### 2.1 Common Architecture Pattern

All four dashboards follow a consistent architecture:

```
dashboard/
├── [Dashboard].tsx          # Main dashboard component
├── index.ts                 # Export file
├── constants.ts             # Mock data & configurations
├── contexts/
│   ├── ThemeContext.tsx     # Dark/Light mode
│   └── LanguageContext.tsx  # i18n (English/Arabic)
└── components/
    ├── Sidebar.tsx          # Navigation sidebar
    ├── Header.tsx           # Top header with profile
    ├── StatsCard.tsx        # Statistics display card
    └── [Feature]Page.tsx    # Feature-specific pages
```

### 2.2 Shared Features Across All Dashboards

| Feature | Description |
|---------|-------------|
| **Theme Support** | Dark/Light mode with persistence |
| **RTL Support** | Arabic language with RTL layout |
| **Responsive Design** | Mobile-friendly layouts |
| **URL-based Routing** | Deep linking support |
| **Consistent Styling** | Tailwind CSS design system |

---

## 3. Student Dashboard Analysis

### 3.1 Overview
**Route:** `/studentdashboard/:tab/:id?`  
**Theme Color:** Blue/Indigo

### 3.2 Navigation Tabs (17 Tabs)

| Tab ID | Label | Icon | Component | Description |
|--------|-------|------|-----------|-------------|
| `dashboard` | Dashboard | LayoutGrid | StatsCard, GpaChart, DailySchedule | Main overview |
| `myclass` | My Class | BookOpen | ClassTab | Enrolled courses list |
| `registration` | Registration | GraduationCap | CourseRegistration | Course enrollment |
| `community` | Community | Users | CourseCommunity | Course discussions |
| `schedule` | Schedule | Calendar | ClassSchedule | Weekly timetable |
| `assignments` | Assignments | CheckSquare | Assignments | Assignment management |
| `labs` | Lab Sessions | Beaker | LabInstructions | Lab work |
| `grades` | Grades | FileText | GradesTranscript | Grade viewing |
| `attendance` | Attendance | BarChart3 | AttendanceOverview | Attendance tracking |
| `analytics` | Analytics | PieChart | ProgressAnalytics | Learning analytics |
| `todo` | Todo List | ListChecks | SmartTodoReminder | Task management |
| `ai` | AI Features | Sparkles | AIFeatures | AI learning tools |
| `gamification` | Achievements | Trophy | Gamification | Badges & rewards |
| `notifications` | Notifications | Bell | NotificationCenter | Alerts |
| `payments` | Payments | CreditCard | PaymentHistory | Tuition & fees |
| `chat` | Chat | MessageCircle | MessagingChat | Messaging |
| `settings` | Settings | Settings | SettingsPreferences | Preferences |

### 3.3 Components Breakdown

#### Core Components (7)
| Component | File | Purpose |
|-----------|------|---------|
| Sidebar | `Sidebar.tsx` | Left navigation with tabs |
| Header | `Header.tsx` | Top bar with search, notifications, profile |
| StatsCard | `StatsCard.tsx` | Metric display with progress |
| GpaChart | `GpaChart.tsx` | GPA trend visualization |
| DailySchedule | `DailySchedule.tsx` | Today's classes |
| WeeklySchedule | `WeeklySchedule.tsx` | Full week view |
| GlobalSearch | `GlobalSearch.tsx` | Universal search |

#### Academic Components (8)
| Component | File | Purpose |
|-----------|------|---------|
| ClassTab | `ClassTab.tsx` | Course cards grid |
| CourseRegistration | `CourseRegistration.tsx` | Add/drop courses |
| GradesTranscript | `GradesTranscript.tsx` | Academic records |
| Assignments | `Assignments.tsx` | Assignment list & details |
| AssignmentDetails | `AssignmentDetails.tsx` | Single assignment view |
| AcademicCalendar | `AcademicCalendar.tsx` | Academic events |
| ClassSchedule | `ClassSchedule.tsx` | Course timetable |
| PaymentHistory | `PaymentHistory.tsx` | Financial records |

#### Engagement Components (6)
| Component | File | Purpose |
|-----------|------|---------|
| AttendanceOverview | `AttendanceOverview.tsx` | Attendance stats |
| SmartTodoReminder | `SmartTodoReminder.tsx` | AI-powered tasks |
| Gamification | `Gamification.tsx` | Points, badges, leaderboard |
| NotificationCenter | `NotificationCenter.tsx` | Alert management |
| CourseCommunity | `CourseCommunity.tsx` | Discussion forums |
| MessagingChat | `MessagingChat.tsx` | Direct messaging |

#### AI Features Components (9)
| Component | File | Purpose |
|-----------|------|---------|
| AIFeatures | `AIFeatures.tsx` | AI features hub |
| ChatbotContent | `ChatbotContent.tsx` | AI tutor chatbot |
| SummarizerContent | `SummarizerContent.tsx` | Text summarization |
| FlashcardsContent | `FlashcardsContent.tsx` | AI flashcard generator |
| QuizContent | `QuizContent.tsx` | AI quiz generator |
| RecommendationContent | `RecommendationContent.tsx` | Course recommendations |
| VoiceContent | `VoiceContent.tsx` | Voice-to-text |
| ImageToTextContent | `ImageToTextContent.tsx` | OCR for notes |
| FeedbackContent | `FeedbackContent.tsx` | AI writing feedback |

#### Additional Components (3)
| Component | File | Purpose |
|-----------|------|---------|
| LabInstructions | `LabInstructions.tsx` | Lab session details |
| ProgressAnalytics | `ProgressAnalytics.tsx` | Learning insights |
| SettingsPreferences | `SettingsPreferences.tsx` | User preferences |

#### Pages (1)
| Page | File | Purpose |
|------|------|---------|
| CourseView | `pages/CourseView.tsx` | Detailed course view |

### 3.4 Data Constants
```typescript
// constants.ts exports:
- GPA_DATA: GPA history by semester
- SCHEDULE_DATA: Daily class schedule
- COURSES_DATA: Enrolled courses
- ASSIGNMENTS_DATA: Assignment list
- GRADES_DATA: Grade records
- ATTENDANCE_DATA: Attendance records
- NOTIFICATIONS_DATA: Notification list
- PAYMENTS_DATA: Payment history
```

---

## 4. Instructor Dashboard Analysis

### 4.1 Overview
**Route:** `/instructordashboard/:tab/:id?`  
**Theme Color:** Indigo/Purple

### 4.2 Navigation Tabs (14 Tabs)

| Tab ID | Label | Icon | Component | Description |
|--------|-------|------|-----------|-------------|
| `dashboard` | Dashboard | LayoutGrid | ModernDashboard | Overview & stats |
| `courses` | Courses | BookOpen | CoursesPage | Course management |
| `roster` | Roster | Users | RosterTable | Student lists |
| `waitlist` | Waitlist | UserCheck | WaitlistTable | Pending enrollments |
| `grades` | Grades | FileText | GradesTable | Grade entry |
| `assignments` | Assignments | CheckSquare | AssignmentsList | Assignment creation |
| `labs` | Labs | Beaker | LabsPage | Lab management |
| `quizzes` | Quizzes | ClipboardList | QuizzesPage | Quiz creation |
| `schedule` | Schedule | CalendarDays | SchedulePage | Teaching schedule |
| `analytics` | Analytics | BarChart3 | AnalyticsPage | Performance analytics |
| `ai-tools` | AI Tools | Brain | AIToolsPage | AI teaching tools |
| `attendance` | Attendance | Calendar | AttendanceTable | Attendance marking |
| `communication` | Communication | MessageCircle | CommunicationPage | Student messaging |
| `settings` | Settings | Settings | SettingsPage | Preferences |

### 4.3 Components Breakdown

#### Core Components (4)
| Component | File | Purpose |
|-----------|------|---------|
| Sidebar | `Sidebar.tsx` | Navigation |
| Header | `Header.tsx` | Top bar |
| StatsCard | `StatsCard.tsx` | Metrics |
| ModernDashboard | `ModernDashboard.tsx` | Dashboard overview |

#### Data Tables (5)
| Component | File | Purpose |
|-----------|------|---------|
| RosterTable | `RosterTable.tsx` | Student roster |
| WaitlistTable | `WaitlistTable.tsx` | Waitlist management |
| GradesTable | `GradesTable.tsx` | Grade entry/edit |
| AttendanceTable | `AttendanceTable.tsx` | Attendance records |
| AssignmentsList | `AssignmentsList.tsx` | Assignment management |

#### Modals (6)
| Component | File | Purpose |
|-----------|------|---------|
| StudentEditModal | `StudentEditModal.tsx` | Edit student info |
| AssignmentModal | `AssignmentModal.tsx` | Create/edit assignment |
| GradeModal | `GradeModal.tsx` | Grade entry |
| AttendanceModal | `AttendanceModal.tsx` | Mark attendance |
| MessageModal | `MessageModal.tsx` | Compose message |
| ConfirmDialog | `ConfirmDialog.tsx` | Action confirmation |

#### Feature Pages (8)
| Component | File | Purpose |
|-----------|------|---------|
| CoursesPage | `CoursesPage.tsx` | Course CRUD |
| LabsPage | `LabsPage.tsx` | Lab management |
| QuizzesPage | `QuizzesPage.tsx` | Quiz builder |
| SchedulePage | `SchedulePage.tsx` | Schedule view |
| AnalyticsPage | `AnalyticsPage.tsx` | Reports |
| AIToolsPage | `AIToolsPage.tsx` | AI features |
| CommunicationPage | `CommunicationPage.tsx` | Messaging |
| SettingsPage | `SettingsPage.tsx` | Settings |

#### AI Features (5)
| Component | File | Purpose |
|-----------|------|---------|
| AIAttendanceContainer | `attendance/AIAttendanceContainer.tsx` | AI attendance hub |
| AIAttendanceUpload | `attendance/AIAttendanceUpload.tsx` | Photo upload |
| AIAttendanceResults | `attendance/AIAttendanceResults.tsx` | Detection results |
| AIAttendanceHistory | `attendance/AIAttendanceHistory.tsx` | Past records |
| shared/ | `shared/` | Common AI utilities |

#### Utility Components (7)
| Component | File | Purpose |
|-----------|------|---------|
| SelectedSectionSummary | `SelectedSectionSummary.tsx` | Section info |
| MetricCard | `MetricCard.tsx` | Analytics metric |
| PerformanceChart | `PerformanceChart.tsx` | Performance graph |
| TrendChart | `TrendChart.tsx` | Trend visualization |
| StudentListCard | `StudentListCard.tsx` | Student card |
| ActivityFeed | `ActivityFeed.tsx` | Recent activities |
| CustomDropdown | `CustomDropdown.tsx` | Select component |

---

## 5. Admin Dashboard Analysis

### 5.1 Overview
**Route:** `/admindashboard/:tab/:id?`  
**Theme Color:** Red/Orange

### 5.2 Navigation Tabs (9 Tabs)

| Tab ID | Label | Icon | Component | Description |
|--------|-------|------|-----------|-------------|
| `dashboard` | Dashboard | LayoutGrid | DashboardOverview | Admin overview |
| `users` | User Management | Users | UserManagementPage | User CRUD |
| `courses` | Course Management | BookOpen | CourseManagementPage | Course admin |
| `departments` | Departments | Building2 | DepartmentManagementPage | Department admin |
| `calendar` | Academic Calendar | Calendar | AcademicCalendarPage | Calendar events |
| `analytics` | Analytics & Reports | BarChart3 | AnalyticsReportsPage | System analytics |
| `communication` | Communication | MessageSquare | CommunicationPage | Broadcasts |
| `feedback` | Feedback & Support | HeadphonesIcon | FeedbackSupportPage | Support tickets |
| `config` | System Config | Settings | SystemConfigPage | System settings |

### 5.3 Components Breakdown

#### Core Components (3)
| Component | File | Purpose |
|-----------|------|---------|
| Sidebar | `Sidebar.tsx` | Navigation |
| Header | `Header.tsx` | Top bar |
| StatsCard | `StatsCard.tsx` | Dashboard metrics |

#### Page Components (9)
| Component | File | Purpose |
|-----------|------|---------|
| DashboardOverview | `DashboardOverview.tsx` | Admin home |
| UserManagementPage | `UserManagementPage.tsx` | User CRUD |
| CourseManagementPage | `CourseManagementPage.tsx` | Course admin |
| DepartmentManagementPage | `DepartmentManagementPage.tsx` | Departments |
| AcademicCalendarPage | `AcademicCalendarPage.tsx` | Calendar |
| AnalyticsReportsPage | `AnalyticsReportsPage.tsx` | Reports |
| CommunicationPage | `CommunicationPage.tsx` | Announcements |
| FeedbackSupportPage | `FeedbackSupportPage.tsx` | Support |
| SystemConfigPage | `SystemConfigPage.tsx` | Configuration |

### 5.4 Data Constants
```typescript
// constants.ts exports:
- DASHBOARD_STATS: Overview metrics
- USERS: User list
- COURSES: Course list
- DEPARTMENTS: Department list
- CALENDAR_EVENTS: Academic events
- ANALYTICS: Analytics data
- NOTIFICATION_TEMPLATES: Message templates
- SUPPORT_TICKETS: Support requests
- AUDIT_LOGS: System logs
- GAMIFICATION_SETTINGS: Game settings
- API_INTEGRATIONS: External integrations
- RECENT_ACTIVITY: Activity feed
```

---

## 6. IT Admin Dashboard Analysis

### 6.1 Overview
**Route:** `/itadmindashboard/:tab/:id?`  
**Theme Color:** Cyan/Blue

### 6.2 Navigation Tabs (8 Tabs)

| Tab ID | Label | Icon | Component | Description |
|--------|-------|------|-----------|-------------|
| `dashboard` | Dashboard | LayoutGrid | DashboardOverview | IT overview |
| `config` | System Config | Settings | SystemConfigPage | Server settings |
| `integrations` | Integrations & APIs | Wifi | IntegrationsPage | API management |
| `database` | Database | Database | DatabasePage | Backup & restore |
| `monitoring` | Monitoring | Activity | MonitoringPage | Server health |
| `security` | Security | Shield | SecurityPage | Security events |
| `ai` | AI Management | Brain | AIManagementPage | AI services |
| `campus` | Multi-Campus | Building2 | MultiCampusPage | Campus config |

### 6.3 Components Breakdown

#### Core Components (3)
| Component | File | Purpose |
|-----------|------|---------|
| Sidebar | `Sidebar.tsx` | Navigation (cyan theme) |
| Header | `Header.tsx` | Top bar |
| StatsCard | `StatsCard.tsx` | IT metrics |

#### Page Components (8)
| Component | File | Purpose |
|-----------|------|---------|
| DashboardOverview | `DashboardOverview.tsx` | Server status, quick actions |
| SystemConfigPage | `SystemConfigPage.tsx` | System settings, branding |
| IntegrationsPage | `IntegrationsPage.tsx` | API keys, usage monitoring |
| DatabasePage | `DatabasePage.tsx` | Backup scheduling, restore |
| MonitoringPage | `MonitoringPage.tsx` | CPU, memory, health checks |
| SecurityPage | `SecurityPage.tsx` | SSL, access logs, events |
| AIManagementPage | `AIManagementPage.tsx` | AI model config, costs |
| MultiCampusPage | `MultiCampusPage.tsx` | Campus management |

### 6.4 Data Constants
```typescript
// constants.ts exports:
- IT_DASHBOARD_STATS: Uptime, requests, sessions
- SERVER_STATUS: Server health data
- API_INTEGRATIONS: OpenAI, Gemini, AWS configs
- DATABASE_BACKUPS: Backup schedules
- SECURITY_EVENTS: Security alerts
- SSL_CERTIFICATES: Certificate status
- AI_MODELS: AI service configs
- CAMPUSES: Campus configurations
- SYSTEM_SETTINGS: Rate limits, timeouts
- BRANDING_SETTINGS: Theme colors, logos
- PERFORMANCE_METRICS: Response times, errors
- RECENT_IT_ACTIVITY: IT action logs
```

---

## 7. Shared Components Catalog

### 7.1 Components That Can Be Unified

| Component | Used In | Recommendation |
|-----------|---------|----------------|
| Sidebar | All 4 | Create shared base with theme variants |
| Header | All 4 | Create shared component with role-based features |
| StatsCard | All 4 | Already similar, can be fully shared |
| ThemeContext | All 4 | Consolidate into global context |
| LanguageContext | All 4 | Consolidate with global i18n solution |

### 7.2 Recommended Shared Component Library

```
src/components/shared/
├── layout/
│   ├── DashboardLayout.tsx      # Common layout wrapper
│   ├── Sidebar.tsx              # Configurable sidebar
│   └── Header.tsx               # Configurable header
├── cards/
│   ├── StatsCard.tsx            # Metric display
│   ├── MetricCard.tsx           # Simple metric
│   └── ActionCard.tsx           # Quick action card
├── data-display/
│   ├── DataTable.tsx            # Generic data table
│   ├── StatusBadge.tsx          # Status indicators
│   └── ProgressBar.tsx          # Progress visualization
├── modals/
│   ├── Modal.tsx                # Base modal
│   ├── ConfirmDialog.tsx        # Confirmation
│   └── FormModal.tsx            # Form wrapper
├── forms/
│   ├── Input.tsx                # Text input
│   ├── Select.tsx               # Dropdown
│   └── Toggle.tsx               # Toggle switch
└── feedback/
    ├── Toast.tsx                # Notifications
    ├── Loading.tsx              # Loading states
    └── EmptyState.tsx           # Empty content
```

---

## 8. Enhancement Plan for User Experience

### 8.1 Priority 1: Visual Consistency & Polish

#### 8.1.1 Design System Improvements
| Enhancement | Impact | Effort |
|-------------|--------|--------|
| Unified color palette across dashboards | High | Medium |
| Consistent spacing (8px grid system) | High | Low |
| Standardized border radius (8px, 12px, 16px) | Medium | Low |
| Shadow elevation system (sm, md, lg, xl) | Medium | Low |
| Typography scale (heading, body, caption) | High | Medium |

#### 8.1.2 Animation & Micro-interactions
```css
/* Recommended transitions */
- Page transitions: fade-in (200ms)
- Card hover: scale(1.02) + shadow
- Button click: scale(0.98)
- Modal: slide-up + fade (300ms)
- Toast: slide-in-right (250ms)
- Sidebar: slide (300ms)
```

#### 8.1.3 Loading States
| Current | Enhancement |
|---------|-------------|
| No loading indicators | Skeleton screens |
| Instant page changes | Page transition animations |
| Form submit no feedback | Button loading states |
| Data fetch no indication | Shimmer effects |

### 8.2 Priority 2: Student-Focused Enhancements

#### 8.2.1 Dashboard Improvements
| Feature | Description | User Benefit |
|---------|-------------|--------------|
| **Quick Actions Card** | "Continue Learning", "Next Assignment", "Upcoming Class" | Reduce clicks to common actions |
| **Progress Ring** | Visual semester progress | Motivation |
| **Deadline Widget** | Countdown to next deadline | Time management |
| **AI Assistant Bubble** | Floating AI chat button | Easy access to help |
| **Study Streak** | Daily login/study tracking | Gamification engagement |

#### 8.2.2 My Class Page
| Enhancement | Implementation |
|-------------|----------------|
| Course card thumbnails | Add course image/icon |
| Progress indicators | Show completion % |
| Quick actions | "View Materials", "Go to Assignment" |
| Filter by semester | Dropdown filter |
| Drag-drop reordering | Personalized layout |

#### 8.2.3 Grades Page
| Enhancement | Implementation |
|-------------|----------------|
| Grade trend chart | Line chart per course |
| GPA calculator | "What-if" scenarios |
| Grade distribution | Histogram visualization |
| Performance alerts | Below-average warnings |
| Export transcript | PDF generation |

#### 8.2.4 AI Features Enhancement
| Feature | Current | Enhanced |
|---------|---------|----------|
| Chatbot | Basic Q&A | Context-aware with course materials |
| Summarizer | Manual paste | Direct from course materials |
| Flashcards | Manual creation | Auto-generate from lecture notes |
| Quiz | Basic generation | Adaptive difficulty |
| Recommendations | Course suggestions | Personalized learning paths |

### 8.3 Priority 3: Performance Optimizations

#### 8.3.1 Code Splitting
```javascript
// Implement lazy loading for each dashboard
const StudentDashboard = lazy(() => import('./student-dashboard'));
const InstructorDashboard = lazy(() => import('./instructor-dashboard'));
const AdminDashboard = lazy(() => import('./admin-dashboard'));
const ITAdminDashboard = lazy(() => import('./it-admin-dashboard'));

// Lazy load feature pages
const AIFeatures = lazy(() => import('./components/AIFeatures'));
const Analytics = lazy(() => import('./components/Analytics'));
```

#### 8.3.2 Caching Strategy
| Data Type | Cache Duration | Strategy |
|-----------|---------------|----------|
| User profile | Session | Context + localStorage |
| Course list | 5 minutes | SWR/React Query |
| Notifications | 30 seconds | Real-time + polling |
| Static content | 1 hour | Service Worker |
| AI responses | Request-based | No cache |

#### 8.3.3 Bundle Size Reduction
| Action | Expected Savings |
|--------|------------------|
| Tree shake Lucide icons | ~50KB |
| Lazy load charts | ~100KB |
| Code split dashboards | ~200KB each |
| Remove unused Tailwind | ~30KB |

### 8.4 Priority 4: Accessibility Improvements

| Requirement | Implementation |
|-------------|----------------|
| Keyboard navigation | Focus management, tab order |
| Screen reader support | ARIA labels, roles |
| Color contrast | WCAG AA compliance |
| Focus indicators | Visible focus rings |
| Reduced motion | `prefers-reduced-motion` |
| Text scaling | Relative units (rem) |

### 8.5 Priority 5: Mobile Responsiveness

#### Current State Analysis
| Dashboard | Mobile Support | Issues |
|-----------|---------------|--------|
| Student | Partial | Sidebar overlap |
| Instructor | Partial | Tables overflow |
| Admin | Minimal | Layout breaks |
| IT Admin | Minimal | Not optimized |

#### Enhancement Plan
1. **Responsive Sidebar**: Drawer pattern for mobile
2. **Table Responsiveness**: Card view for mobile
3. **Touch Interactions**: Swipe gestures
4. **Bottom Navigation**: Mobile tab bar
5. **Pull-to-Refresh**: Native feel

---

## 9. Backend Integration Plan

### 9.1 Integration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
├─────────────────────────────────────────────────────────────┤
│  API Service Layer (axios/fetch)                            │
│  ├── authService.ts                                         │
│  ├── studentService.ts                                      │
│  ├── instructorService.ts                                   │
│  ├── adminService.ts                                        │
│  ├── itAdminService.ts                                      │
│  └── aiService.ts                                           │
├─────────────────────────────────────────────────────────────┤
│  State Management (React Query / SWR)                       │
│  ├── useAuth()                                              │
│  ├── useCourses()                                           │
│  ├── useGrades()                                            │
│  └── useNotifications()                                     │
├─────────────────────────────────────────────────────────────┤
│                    API Gateway / Backend                     │
│                    (NestJS / Express)                        │
└─────────────────────────────────────────────────────────────┘
```

### 9.2 Authentication Flow

```
1. User visits /login
2. Enters credentials
3. POST /api/auth/login
4. Receives JWT tokens (access + refresh)
5. Store tokens (httpOnly cookies or secure storage)
6. Attach Bearer token to all requests
7. On 401, use refresh token
8. On refresh failure, redirect to login
```

### 9.3 API Client Setup

```typescript
// src/services/api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try refresh token
      const refreshed = await refreshToken();
      if (refreshed) {
        return apiClient(error.config);
      }
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

---

## 10. API Specifications

### 10.1 Authentication APIs

#### POST /api/auth/login
```json
// Request
{
  "email": "student@university.edu",
  "password": "password123"
}

// Response
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "student@university.edu",
    "name": "John Doe",
    "role": "student",
    "avatar": "url"
  }
}
```

#### POST /api/auth/refresh
```json
// Request
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}

// Response
{
  "accessToken": "new-access-token",
  "refreshToken": "new-refresh-token"
}
```

#### POST /api/auth/logout
```json
// Response
{ "message": "Logged out successfully" }
```

#### GET /api/auth/me
```json
// Response
{
  "id": "uuid",
  "email": "student@university.edu",
  "name": "John Doe",
  "role": "student",
  "avatar": "url",
  "preferences": { ... }
}
```

---

### 10.2 Student APIs

#### GET /api/students/dashboard
```json
// Response
{
  "stats": {
    "creditsCompleted": 120,
    "totalCredits": 144,
    "gpa": 3.75,
    "activeCourses": 5,
    "pendingAssignments": 3
  },
  "upcomingClasses": [ ... ],
  "recentGrades": [ ... ],
  "notifications": [ ... ]
}
```

#### GET /api/students/courses
```json
// Query params: ?semester=2025-spring&status=active
// Response
{
  "courses": [
    {
      "id": "course-uuid",
      "code": "CS101",
      "name": "Introduction to Programming",
      "instructor": "Dr. Smith",
      "schedule": "MWF 10:00-11:00",
      "room": "Building A, Room 101",
      "credits": 3,
      "progress": 65,
      "grade": "A-"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5
  }
}
```

#### GET /api/students/courses/:courseId
```json
// Response
{
  "id": "course-uuid",
  "code": "CS101",
  "name": "Introduction to Programming",
  "description": "...",
  "instructor": { ... },
  "syllabus": "url",
  "materials": [ ... ],
  "assignments": [ ... ],
  "grades": [ ... ],
  "announcements": [ ... ]
}
```

#### GET /api/students/assignments
```json
// Query params: ?status=pending&courseId=xxx
// Response
{
  "assignments": [
    {
      "id": "assignment-uuid",
      "courseId": "course-uuid",
      "courseName": "CS101",
      "title": "Homework 3",
      "description": "...",
      "dueDate": "2026-02-15T23:59:00Z",
      "points": 100,
      "status": "pending", // pending, submitted, graded
      "submittedAt": null,
      "grade": null,
      "attachments": [ ... ]
    }
  ]
}
```

#### POST /api/students/assignments/:id/submit
```json
// Request (multipart/form-data)
{
  "content": "Submission text",
  "files": [File objects]
}

// Response
{
  "id": "submission-uuid",
  "submittedAt": "2026-02-10T14:30:00Z",
  "status": "submitted"
}
```

#### GET /api/students/grades
```json
// Query params: ?courseId=xxx&semester=2025-spring
// Response
{
  "grades": [
    {
      "id": "grade-uuid",
      "courseId": "course-uuid",
      "courseName": "CS101",
      "courseCode": "CS101",
      "credits": 3,
      "grade": "A-",
      "gradePoints": 3.7,
      "semester": "2025-spring",
      "components": [
        { "name": "Midterm", "score": 88, "weight": 30 },
        { "name": "Final", "score": 92, "weight": 40 },
        { "name": "Assignments", "score": 95, "weight": 30 }
      ]
    }
  ],
  "summary": {
    "semesterGPA": 3.75,
    "cumulativeGPA": 3.68,
    "totalCredits": 120,
    "completedCredits": 105
  }
}
```

#### GET /api/students/schedule
```json
// Query params: ?week=2026-02-03
// Response
{
  "schedule": [
    {
      "id": "schedule-uuid",
      "courseId": "course-uuid",
      "courseName": "CS101",
      "courseCode": "CS101",
      "instructor": "Dr. Smith",
      "dayOfWeek": 1, // Monday=1
      "startTime": "10:00",
      "endTime": "11:00",
      "room": "Building A, Room 101",
      "type": "lecture" // lecture, lab, tutorial
    }
  ]
}
```

#### GET /api/students/attendance
```json
// Query params: ?courseId=xxx
// Response
{
  "attendance": [
    {
      "courseId": "course-uuid",
      "courseName": "CS101",
      "totalClasses": 30,
      "attended": 27,
      "absent": 2,
      "excused": 1,
      "percentage": 90,
      "sessions": [
        {
          "date": "2026-02-05",
          "status": "present",
          "notes": null
        }
      ]
    }
  ]
}
```

#### GET /api/students/gpa-history
```json
// Response
{
  "history": [
    { "semester": "2024-fall", "gpa": 3.5 },
    { "semester": "2025-spring", "gpa": 3.65 },
    { "semester": "2025-fall", "gpa": 3.75 }
  ]
}
```

#### GET /api/students/notifications
```json
// Query params: ?unread=true&limit=20
// Response
{
  "notifications": [
    {
      "id": "notification-uuid",
      "type": "assignment", // assignment, grade, announcement, message
      "title": "New Assignment Posted",
      "message": "CS101 - Homework 4 is now available",
      "read": false,
      "createdAt": "2026-02-05T10:00:00Z",
      "link": "/studentdashboard/assignments/xxx"
    }
  ],
  "unreadCount": 5
}
```

#### PATCH /api/students/notifications/:id/read
```json
// Response
{ "success": true }
```

#### GET /api/students/payments
```json
// Response
{
  "currentBalance": 5000,
  "dueDate": "2026-03-01",
  "payments": [
    {
      "id": "payment-uuid",
      "description": "Spring 2026 Tuition",
      "amount": 15000,
      "status": "paid",
      "paidAt": "2026-01-15",
      "method": "credit_card"
    }
  ]
}
```

---

### 10.3 Instructor APIs

#### GET /api/instructors/dashboard
```json
// Response
{
  "stats": {
    "totalStudents": 150,
    "activeCourses": 4,
    "pendingGrading": 25,
    "upcomingClasses": 3
  },
  "sections": [ ... ],
  "upcomingClasses": [ ... ],
  "pendingTasks": [ ... ],
  "recentActivity": [ ... ]
}
```

#### GET /api/instructors/courses
```json
// Response
{
  "courses": [
    {
      "id": "course-uuid",
      "code": "CS101",
      "name": "Introduction to Programming",
      "semester": "2026-spring",
      "sections": [
        {
          "id": "section-uuid",
          "label": "Section A",
          "schedule": "MWF 10:00-11:00",
          "room": "Room 101",
          "enrolled": 35,
          "capacity": 40
        }
      ],
      "status": "active"
    }
  ]
}
```

#### POST /api/instructors/courses
```json
// Request
{
  "code": "CS201",
  "name": "Data Structures",
  "description": "...",
  "credits": 3,
  "prerequisites": ["CS101"],
  "sections": [
    {
      "label": "Section A",
      "schedule": "TTh 14:00-15:30",
      "room": "Room 201",
      "capacity": 40
    }
  ]
}
```

#### GET /api/instructors/sections/:sectionId/roster
```json
// Response
{
  "students": [
    {
      "id": "student-uuid",
      "name": "John Doe",
      "email": "john@university.edu",
      "status": "enrolled", // enrolled, auditing, withdrawn
      "grade": "A-",
      "attendance": 95
    }
  ]
}
```

#### GET /api/instructors/sections/:sectionId/waitlist
```json
// Response
{
  "waitlist": [
    {
      "id": "waitlist-uuid",
      "student": { ... },
      "requestedAt": "2026-01-15T10:00:00Z",
      "position": 1,
      "status": "pending"
    }
  ]
}
```

#### POST /api/instructors/sections/:sectionId/waitlist/:id/approve
```json
// Response
{ "success": true, "message": "Student enrolled" }
```

#### GET /api/instructors/sections/:sectionId/grades
```json
// Response
{
  "gradeItems": [
    { "id": "item-uuid", "name": "Midterm", "maxPoints": 100, "weight": 30 },
    { "id": "item-uuid", "name": "Final", "maxPoints": 100, "weight": 40 }
  ],
  "studentGrades": [
    {
      "studentId": "student-uuid",
      "studentName": "John Doe",
      "grades": [
        { "itemId": "item-uuid", "score": 88 },
        { "itemId": "item-uuid", "score": 92 }
      ],
      "totalGrade": "A-"
    }
  ]
}
```

#### POST /api/instructors/sections/:sectionId/grades
```json
// Request
{
  "studentId": "student-uuid",
  "itemId": "item-uuid",
  "score": 88,
  "feedback": "Good work!"
}
```

#### GET /api/instructors/sections/:sectionId/assignments
```json
// Response
{
  "assignments": [
    {
      "id": "assignment-uuid",
      "title": "Homework 3",
      "description": "...",
      "dueDate": "2026-02-15T23:59:00Z",
      "points": 100,
      "status": "open", // draft, open, closed
      "submissions": 25,
      "totalStudents": 35
    }
  ]
}
```

#### POST /api/instructors/assignments
```json
// Request
{
  "sectionId": "section-uuid",
  "title": "Homework 4",
  "description": "...",
  "dueDate": "2026-02-20T23:59:00Z",
  "points": 100,
  "allowLateSubmission": true,
  "attachments": [ ... ]
}
```

#### GET /api/instructors/assignments/:id/submissions
```json
// Response
{
  "submissions": [
    {
      "id": "submission-uuid",
      "student": { ... },
      "submittedAt": "2026-02-14T20:00:00Z",
      "status": "submitted", // submitted, graded, late
      "grade": null,
      "files": [ ... ]
    }
  ]
}
```

#### POST /api/instructors/submissions/:id/grade
```json
// Request
{
  "grade": 85,
  "feedback": "Good work, but..."
}
```

#### GET /api/instructors/sections/:sectionId/attendance
```json
// Response
{
  "sessions": [
    {
      "id": "session-uuid",
      "date": "2026-02-05",
      "type": "lecture",
      "attendance": [
        { "studentId": "student-uuid", "status": "present" },
        { "studentId": "student-uuid", "status": "absent" }
      ]
    }
  ]
}
```

#### POST /api/instructors/sections/:sectionId/attendance
```json
// Request
{
  "date": "2026-02-05",
  "type": "lecture",
  "attendance": [
    { "studentId": "student-uuid", "status": "present" },
    { "studentId": "student-uuid", "status": "absent" }
  ]
}
```

#### POST /api/instructors/attendance/ai-detect
```json
// Request (multipart/form-data)
{
  "sectionId": "section-uuid",
  "date": "2026-02-05",
  "image": [File]
}

// Response
{
  "detected": [
    { "studentId": "student-uuid", "name": "John Doe", "confidence": 0.95 },
    { "studentId": "student-uuid", "name": "Jane Smith", "confidence": 0.88 }
  ],
  "unrecognized": 2,
  "totalInImage": 30
}
```

#### GET /api/instructors/analytics
```json
// Query params: ?courseId=xxx&metric=grades
// Response
{
  "gradeDistribution": {
    "A": 10, "B": 15, "C": 8, "D": 2, "F": 0
  },
  "attendanceTrend": [ ... ],
  "assignmentCompletion": [ ... ],
  "studentPerformance": [ ... ]
}
```

---

### 10.4 Admin APIs

#### GET /api/admin/dashboard
```json
// Response
{
  "stats": {
    "totalUsers": 15000,
    "totalCourses": 500,
    "totalDepartments": 25,
    "activeStudents": 12000
  },
  "recentActivity": [ ... ],
  "systemHealth": { ... }
}
```

#### GET /api/admin/users
```json
// Query params: ?role=student&status=active&search=john&page=1&limit=20
// Response
{
  "users": [
    {
      "id": "user-uuid",
      "name": "John Doe",
      "email": "john@university.edu",
      "role": "student",
      "status": "active",
      "department": "Computer Science",
      "createdAt": "2024-09-01",
      "lastActive": "2026-02-05T10:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

#### POST /api/admin/users
```json
// Request
{
  "name": "Jane Smith",
  "email": "jane@university.edu",
  "role": "student",
  "department": "Computer Science",
  "sendInvite": true
}
```

#### PUT /api/admin/users/:id
```json
// Request
{
  "name": "Jane Smith",
  "role": "instructor",
  "status": "active"
}
```

#### DELETE /api/admin/users/:id
```json
// Response
{ "success": true }
```

#### GET /api/admin/courses
```json
// Query params: ?department=xxx&semester=2026-spring&status=active
// Response
{
  "courses": [ ... ],
  "pagination": { ... }
}
```

#### POST /api/admin/courses
```json
// Request
{
  "code": "CS101",
  "name": "Introduction to Programming",
  "department": "Computer Science",
  "credits": 3,
  "instructorId": "instructor-uuid"
}
```

#### GET /api/admin/departments
```json
// Response
{
  "departments": [
    {
      "id": "dept-uuid",
      "name": "Computer Science",
      "head": "Dr. Smith",
      "courses": 50,
      "students": 2000,
      "instructors": 30
    }
  ]
}
```

#### GET /api/admin/calendar
```json
// Query params: ?year=2026&type=academic
// Response
{
  "events": [
    {
      "id": "event-uuid",
      "title": "Spring Semester Start",
      "date": "2026-02-01",
      "type": "semesterStart",
      "description": "..."
    }
  ]
}
```

#### GET /api/admin/analytics
```json
// Query params: ?type=enrollment&period=semester
// Response
{
  "enrollmentTrend": [ ... ],
  "departmentStats": [ ... ],
  "coursePopularity": [ ... ],
  "userGrowth": [ ... ]
}
```

#### GET /api/admin/support-tickets
```json
// Response
{
  "tickets": [
    {
      "id": "ticket-uuid",
      "user": { ... },
      "subject": "Cannot access course materials",
      "status": "open",
      "priority": "high",
      "createdAt": "2026-02-05T10:00:00Z"
    }
  ]
}
```

#### GET /api/admin/audit-logs
```json
// Query params: ?action=user_created&from=2026-02-01
// Response
{
  "logs": [
    {
      "id": "log-uuid",
      "action": "user_created",
      "actor": { ... },
      "target": { ... },
      "details": { ... },
      "timestamp": "2026-02-05T10:00:00Z",
      "ip": "192.168.1.1"
    }
  ]
}
```

---

### 10.5 IT Admin APIs

#### GET /api/it-admin/dashboard
```json
// Response
{
  "stats": {
    "serverUptime": "99.9%",
    "apiRequestsPerMin": 12450,
    "activeSessions": 2847,
    "storageUsed": "78.5 TB"
  },
  "serverStatus": [ ... ],
  "recentActivity": [ ... ]
}
```

#### GET /api/it-admin/servers
```json
// Response
{
  "servers": [
    {
      "id": "server-uuid",
      "name": "Production Server 1",
      "status": "healthy",
      "cpu": 45,
      "memory": 62,
      "disk": 75,
      "uptime": "99.99%",
      "location": "US-East"
    }
  ]
}
```

#### POST /api/it-admin/servers/:id/restart
```json
// Response
{ "success": true, "message": "Server restart initiated" }
```

#### GET /api/it-admin/integrations
```json
// Response
{
  "integrations": [
    {
      "id": "integration-uuid",
      "name": "OpenAI GPT-4",
      "type": "AI",
      "status": "active",
      "usage": 85000,
      "limit": 100000,
      "cost": "$425.00"
    }
  ]
}
```

#### PUT /api/it-admin/integrations/:id
```json
// Request
{
  "apiKey": "new-api-key",
  "status": "active",
  "limit": 150000
}
```

#### GET /api/it-admin/backups
```json
// Response
{
  "backups": [
    {
      "id": "backup-uuid",
      "name": "Daily Backup",
      "schedule": "Every day at 2:00 AM",
      "lastRun": "2026-02-05T02:00:00Z",
      "status": "completed",
      "size": "45.2 GB"
    }
  ]
}
```

#### POST /api/it-admin/backups/run
```json
// Request
{
  "type": "full" // full, incremental, differential
}

// Response
{ "success": true, "jobId": "job-uuid" }
```

#### POST /api/it-admin/backups/:id/restore
```json
// Response
{ "success": true, "message": "Restore initiated" }
```

#### GET /api/it-admin/security/events
```json
// Query params: ?severity=high&from=2026-02-01
// Response
{
  "events": [
    {
      "id": "event-uuid",
      "type": "warning",
      "message": "Multiple failed login attempts from IP 192.168.1.100",
      "severity": "medium",
      "timestamp": "2026-02-05T13:15:00Z"
    }
  ]
}
```

#### GET /api/it-admin/security/certificates
```json
// Response
{
  "certificates": [
    {
      "id": "cert-uuid",
      "domain": "*.eduverse.com",
      "issuer": "Let's Encrypt",
      "validFrom": "2026-01-01",
      "validTo": "2026-04-01",
      "status": "valid"
    }
  ]
}
```

#### POST /api/it-admin/security/certificates/:id/renew
```json
// Response
{ "success": true, "newValidTo": "2026-07-01" }
```

#### GET /api/it-admin/ai/models
```json
// Response
{
  "models": [
    {
      "id": "model-uuid",
      "name": "GPT-4 Turbo",
      "provider": "OpenAI",
      "status": "active",
      "purpose": "Content Generation",
      "costPerRequest": 0.005,
      "monthlyUsage": 45000
    }
  ]
}
```

#### PUT /api/it-admin/ai/models/:id
```json
// Request
{
  "status": "active",
  "rateLimit": 1000
}
```

#### GET /api/it-admin/campuses
```json
// Response
{
  "campuses": [
    {
      "id": "campus-uuid",
      "name": "Main Campus",
      "domain": "main.eduverse.com",
      "students": 15000,
      "instructors": 450,
      "storage": "25.5 TB",
      "status": "active"
    }
  ]
}
```

#### GET /api/it-admin/settings
```json
// Response
{
  "system": {
    "sessionTimeout": 30,
    "maxLoginAttempts": 5,
    "rateLimitPerMinute": 100,
    "maintenanceMode": false
  },
  "branding": {
    "primaryColor": "#ef4444",
    "companyName": "EduVerse",
    "supportEmail": "support@eduverse.com"
  }
}
```

#### PUT /api/it-admin/settings
```json
// Request
{
  "system": { ... },
  "branding": { ... }
}
```

---

### 10.6 AI Service APIs

#### POST /api/ai/chat
```json
// Request
{
  "message": "Explain recursion in programming",
  "context": {
    "courseId": "course-uuid",
    "topic": "Data Structures"
  },
  "history": [ ... ]
}

// Response (streaming)
{
  "response": "Recursion is a programming technique where...",
  "citations": [ ... ]
}
```

#### POST /api/ai/summarize
```json
// Request
{
  "text": "Long lecture content...",
  "length": "medium", // short, medium, long
  "format": "bullets" // bullets, paragraph
}

// Response
{
  "summary": "...",
  "keyPoints": [ ... ]
}
```

#### POST /api/ai/generate-flashcards
```json
// Request
{
  "content": "Lecture notes...",
  "count": 10,
  "difficulty": "medium"
}

// Response
{
  "flashcards": [
    { "front": "What is...", "back": "..." }
  ]
}
```

#### POST /api/ai/generate-quiz
```json
// Request
{
  "content": "Study material...",
  "questionCount": 10,
  "questionTypes": ["multiple_choice", "true_false"],
  "difficulty": "medium"
}

// Response
{
  "questions": [
    {
      "type": "multiple_choice",
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "answer": "B",
      "explanation": "..."
    }
  ]
}
```

#### POST /api/ai/recommendations
```json
// Request
{
  "studentId": "student-uuid",
  "type": "courses" // courses, materials, study-plan
}

// Response
{
  "recommendations": [
    {
      "id": "course-uuid",
      "name": "Advanced Algorithms",
      "reason": "Based on your strong performance in Data Structures...",
      "matchScore": 0.92
    }
  ]
}
```

#### POST /api/ai/feedback
```json
// Request
{
  "content": "Student's essay or code...",
  "type": "essay", // essay, code, report
  "criteria": ["grammar", "structure", "content"]
}

// Response
{
  "feedback": {
    "overall": "Good work with room for improvement...",
    "scores": {
      "grammar": 85,
      "structure": 78,
      "content": 90
    },
    "suggestions": [ ... ]
  }
}
```

---

## 11. Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
| Task | Priority | Effort |
|------|----------|--------|
| Set up API client with interceptors | Critical | 2 days |
| Implement authentication flow | Critical | 3 days |
| Create shared service layer | High | 2 days |
| Set up React Query for caching | High | 1 day |
| Replace mock data with API calls (auth) | Critical | 2 days |

### Phase 2: Student Dashboard Integration (Weeks 3-4)
| Task | Priority | Effort |
|------|----------|--------|
| Dashboard overview API | High | 1 day |
| Courses list and details | High | 2 days |
| Assignments submission | High | 2 days |
| Grades viewing | High | 1 day |
| Schedule display | Medium | 1 day |
| Attendance viewing | Medium | 1 day |
| Notifications real-time | Medium | 2 days |

### Phase 3: Instructor Dashboard Integration (Weeks 5-6)
| Task | Priority | Effort |
|------|----------|--------|
| Course management | High | 2 days |
| Student roster management | High | 2 days |
| Grade entry system | High | 2 days |
| Assignment creation | High | 2 days |
| Attendance marking (manual) | High | 1 day |
| AI attendance integration | Medium | 3 days |
| Analytics dashboard | Medium | 2 days |

### Phase 4: Admin Dashboard Integration (Weeks 7-8)
| Task | Priority | Effort |
|------|----------|--------|
| User management CRUD | High | 3 days |
| Course administration | High | 2 days |
| Department management | Medium | 2 days |
| Analytics and reports | Medium | 2 days |
| Support ticket system | Medium | 2 days |
| Audit logging | Low | 1 day |

### Phase 5: IT Admin Dashboard Integration (Weeks 9-10)
| Task | Priority | Effort |
|------|----------|--------|
| Server monitoring APIs | High | 2 days |
| Integration management | High | 2 days |
| Backup system | High | 2 days |
| Security monitoring | High | 2 days |
| AI service management | Medium | 2 days |
| Multi-campus support | Low | 2 days |

### Phase 6: AI Services Integration (Weeks 11-12)
| Task | Priority | Effort |
|------|----------|--------|
| Chatbot integration | High | 3 days |
| Summarization service | High | 2 days |
| Flashcard generation | Medium | 2 days |
| Quiz generation | Medium | 2 days |
| Recommendations engine | Medium | 2 days |
| Writing feedback | Low | 2 days |

### Phase 7: Polish & Testing (Weeks 13-14)
| Task | Priority | Effort |
|------|----------|--------|
| Error handling improvements | High | 2 days |
| Loading state refinements | High | 2 days |
| Performance optimization | High | 2 days |
| Accessibility audit | Medium | 2 days |
| End-to-end testing | High | 3 days |
| Documentation update | Medium | 2 days |

---

## Appendix A: Environment Variables

```env
# API Configuration
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000

# AI Services
VITE_OPENAI_API_KEY=sk-...
VITE_GEMINI_API_KEY=...

# Feature Flags
VITE_ENABLE_AI_FEATURES=true
VITE_ENABLE_REAL_TIME=true

# Analytics
VITE_GA_TRACKING_ID=GA-...
```

---

## Appendix B: Error Codes

| Code | Description | User Message |
|------|-------------|--------------|
| AUTH_001 | Invalid credentials | "Invalid email or password" |
| AUTH_002 | Token expired | "Session expired. Please login again" |
| AUTH_003 | Insufficient permissions | "You don't have permission to access this" |
| COURSE_001 | Course not found | "Course not found" |
| COURSE_002 | Enrollment closed | "Enrollment for this course is closed" |
| GRADE_001 | Grade submission failed | "Failed to submit grade" |
| AI_001 | AI service unavailable | "AI service is temporarily unavailable" |
| AI_002 | Rate limit exceeded | "Please wait before making another request" |

---

## Appendix C: WebSocket Events

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `notification:new` | Server→Client | Notification object | New notification |
| `message:new` | Server→Client | Message object | New chat message |
| `grade:updated` | Server→Client | Grade object | Grade changed |
| `attendance:marked` | Server→Client | Attendance object | Attendance recorded |
| `user:typing` | Bidirectional | { chatId, userId } | User typing indicator |

---

**End of Document**

*This document should be updated as the project evolves. Last updated: February 5, 2026*

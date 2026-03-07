# EduVerse Frontend Dashboard Guide

> **Purpose:** This document is a complete reference for building frontend dashboards that connect to the EduVerse NestJS backend. It covers every role's dashboard, tabs, components, API endpoints, data flows, WebSocket events, and file handling. A frontend developer (or AI agent) should be able to build the entire UI from this document alone.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Authentication Flow](#2-authentication-flow)
3. [Role Definitions & Routing](#3-role-definitions--routing)
4. [Student Dashboard](#4-student-dashboard)
5. [Instructor Dashboard](#5-instructor-dashboard)
6. [Admin / IT Admin Dashboard](#6-admin--it-admin-dashboard)
7. [TA Dashboard](#7-ta-dashboard)
8. [Shared Components](#8-shared-components)
9. [File Storage & Upload/Download](#9-file-storage--uploaddownload)
10. [YouTube Video Integration](#10-youtube-video-integration)
11. [WebSocket Real-Time Messaging](#11-websocket-real-time-messaging)
12. [Notification System](#12-notification-system)
13. [Complete API Endpoint Reference](#13-complete-api-endpoint-reference)
14. [Data Relationships & Linking](#14-data-relationships--linking)
15. [Frontend Implementation Notes](#15-frontend-implementation-notes)

---

## 1. System Overview

| Item | Value |
|------|-------|
| **Backend Framework** | NestJS (Node.js + TypeScript) |
| **Database** | MySQL (MariaDB) via TypeORM |
| **Auth** | JWT (Bearer token) — access + refresh tokens |
| **Real-time** | WebSocket via Socket.IO (namespace: `/messaging`) |
| **File Storage** | Filesystem (`./uploads/files/`) — DB stores metadata only |
| **Video** | YouTube Data API v3 — upload via backend, embed URL stored in DB |
| **Base API URL** | `http://localhost:3000` (configurable) |

### API Request Pattern

```
Headers:
  Authorization: Bearer <access_token>
  Content-Type: application/json
```

All protected endpoints require the `Authorization` header. Public endpoints (login, register) do not.

---

## 2. Authentication Flow

### 2.1 Login

```
POST /api/auth/login
Body: { "email": "user@example.com", "password": "password123", "rememberMe": true }
Response: {
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJhbG...",
  "user": { "userId": 1, "email": "...", "firstName": "...", "lastName": "...", "roles": [...] }
}
```

- Store `accessToken` in memory or sessionStorage
- Store `refreshToken` in httpOnly cookie or localStorage
- Access token expires in ~15 minutes
- `rememberMe: true` extends refresh token to 30 days (vs 7 days)

### 2.2 Register

```
POST /api/auth/register
Body: {
  "email": "user@example.com",
  "password": "Password123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",     // optional
  "campusId": 1               // optional
}
Response: { "accessToken": "...", "refreshToken": "...", "user": {...} }
```

**Note:** Email verification is currently BYPASSED — users are auto-verified on registration.
Default role: STUDENT.

### 2.3 Token Refresh

```
POST /api/auth/refresh-token
Body: { "refreshToken": "eyJhbG..." }
Response: { "accessToken": "new_token..." }
```

Call this when a 401 is returned. If refresh also fails → redirect to login.

### 2.4 Get Current User

```
GET /api/auth/me
Response: {
  "userId": 1,
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "...",
  "profilePictureUrl": "...",
  "campusId": 1,
  "status": "active",
  "roles": [{ "roleId": 1, "roleName": "student" }],
  "lastLoginAt": "2024-01-15T..."
}
```

Use this on app load to determine which dashboard to render.

### 2.5 Logout

```
POST /api/auth/logout
(No body — uses JWT from header)
```

### 2.6 Password Reset

```
POST /api/auth/forgot-password
Body: { "email": "user@example.com" }

POST /api/auth/reset-password
Body: { "token": "reset_token_from_email", "newPassword": "NewPass123!" }
```

---

## 3. Role Definitions & Routing

| Role | Value in API | Dashboard |
|------|-------------|-----------|
| STUDENT | `student` | Student Dashboard |
| INSTRUCTOR | `instructor` | Instructor Dashboard |
| TA | `teaching_assistant` | TA Dashboard (subset of Instructor) |
| ADMIN | `admin` | Admin Dashboard |
| IT_ADMIN | `it_admin` | Admin Dashboard (+ system config) |
| DEPARTMENT_HEAD | `department_head` | Admin Dashboard (limited) |

### Route Guard Logic

```javascript
// After login or GET /api/auth/me, check user.roles[0].roleName:
switch (primaryRole) {
  case 'student':              → '/student/dashboard'
  case 'instructor':           → '/instructor/dashboard'
  case 'teaching_assistant':   → '/ta/dashboard'
  case 'admin':
  case 'it_admin':             → '/admin/dashboard'
  case 'department_head':      → '/admin/dashboard'  // limited view
}
```

---

## 4. Student Dashboard

### 4.1 Overview / Home Tab

**Purpose:** At-a-glance summary of the student's academic status.

| Component | API Endpoint | Description |
|-----------|-------------|-------------|
| Enrolled Courses Card | `GET /api/enrollments/my-courses` | List of current courses with section info |
| Today's Schedule | `GET /api/schedule/my/daily` | Today's classes, labs, exams |
| Weekly Schedule | `GET /api/schedule/my/weekly` | Full week calendar view |
| Unread Notifications Badge | `GET /api/notifications/unread-count` | Number on bell icon |
| Recent Announcements | `GET /api/announcements` | Latest announcements (filtered to student's courses) |
| GPA Summary | `GET /api/grades/gpa/:studentId` | Current GPA calculation |

**Data Linking:**
- `GET /api/enrollments/my-courses` returns `sectionId`, `courseId` — use these to fetch course-specific data
- Each enrolled course links to a Course Detail page

### 4.2 My Courses Tab

**Purpose:** Detailed view of each enrolled course with materials, assignments, quizzes.

```
GET /api/enrollments/my-courses
Response: [{
  "enrollmentId": 1,
  "sectionId": 5,
  "status": "enrolled",
  "course": { "courseId": 10, "name": "Data Structures", "code": "CS201" },
  "section": { "sectionId": 5, "sectionNumber": "001" }
}]
```

**For each course, show a sub-page with these tabs:**

#### 4.2.1 Course Materials Sub-tab

```
GET /api/courses/:courseId/materials
Response: [{
  "materialId": 1,
  "title": "Week 1 - Introduction",
  "materialType": "video" | "document" | "link" | "file",
  "externalUrl": "https://youtube.com/embed/...",  // for videos
  "fileId": 42,                                      // for documents
  "weekNumber": 1,
  "orderIndex": 1,
  "isVisible": true
}]
```

- **Video materials:** Show embedded YouTube player using `externalUrl`
  - Or call `GET /api/courses/:courseId/materials/:id/embed` for iframe HTML
- **File materials:** Show download button
  - `GET /api/courses/:courseId/materials/:id/download` → file stream
- **Documents:** Link to file viewer or download

#### 4.2.2 Course Structure Sub-tab

```
GET /api/courses/:courseId/structure
Response: [{
  "id": 1,
  "title": "Week 1",
  "weekNumber": 1,
  "description": "Introduction to...",
  "materials": [...],   // linked materials
  "lab": { "labId": 3, "title": "Lab 1" }  // linked lab if any
}]
```

Shows the weekly structure with linked materials and labs.

#### 4.2.3 Assignments Sub-tab

```
GET /api/assignments?courseId=:courseId
Response: [{
  "assignmentId": 1,
  "title": "HW1 - Arrays",
  "dueDate": "2024-02-15T23:59:00",
  "maxScore": 100,
  "status": "published",
  "weight": 0.1
}]
```

**For each assignment:**
- View details: `GET /api/assignments/:id`
- Submit: `POST /api/assignments/:id/submit` (multipart form with file)
- View my submission: `GET /api/assignments/:id/submissions/my`

#### 4.2.4 Quizzes Sub-tab

```
GET /quizzes?courseId=:courseId
Response: [{
  "quizId": 1,
  "title": "Quiz 1",
  "quizType": "multiple_choice",
  "timeLimitMinutes": 30,
  "maxAttempts": 2,
  "availableFrom": "...",
  "availableUntil": "..."
}]
```

**Quiz flow:**
1. View quiz: `GET /quizzes/:id` (shows questions if within availability window)
2. Start attempt: `POST /quizzes/:quizId/attempts/start` → returns `attemptId`
3. Submit: `POST /quizzes/attempts/:attemptId/submit` with answers
4. View result: `GET /quizzes/attempts/:attemptId`
5. View all my attempts: `GET /quizzes/my-attempts`

#### 4.2.5 Labs Sub-tab

```
GET /api/labs?courseId=:courseId
Response: [{
  "labId": 1,
  "title": "Lab 1 - Setup",
  "labNumber": 1,
  "dueDate": "2024-02-20T...",
  "maxScore": 50
}]
```

**Lab flow:**
- View instructions: `GET /api/labs/:id/instructions`
- Submit: `POST /api/labs/:id/submit` (text + optional file)
- View my submission: `GET /api/labs/:id/submissions/my`

#### 4.2.6 Discussions Sub-tab

```
GET /api/discussions?courseId=:courseId
Response: [{
  "threadId": 1,
  "title": "Question about arrays",
  "isPinned": false,
  "isLocked": false,
  "replyCount": 5,
  "createdAt": "..."
}]
```

- View thread: `GET /api/discussions/:id`
- Reply: `POST /api/discussions/:id/reply`

### 4.3 Grades Tab

```
GET /api/grades/my
Response: [{
  "gradeId": 1,
  "courseId": 10,
  "gradeType": "assignment" | "quiz" | "lab" | "midterm" | "final",
  "score": 85,
  "maxScore": 100,
  "letterGrade": "A",
  "feedback": "Good work!",
  "courseName": "Data Structures"
}]
```

**Sub-components:**
- Grade breakdown by course (group by courseId)
- Transcript view: `GET /api/grades/transcript/:studentId`
- GPA: `GET /api/grades/gpa/:studentId`

### 4.4 Schedule / Calendar Tab

| Component | Endpoint |
|-----------|---------|
| Daily view | `GET /api/schedule/my/daily` |
| Weekly view | `GET /api/schedule/my/weekly` |
| Date range | `GET /api/schedule/range?startDate=...&endDate=...` |
| Academic calendar | `GET /api/schedule/academic` |
| Personal events | `GET /api/calendar/events` |
| Create event | `POST /api/calendar/events` |
| Calendar integrations | `GET /api/calendar/integrations` |

### 4.5 Attendance Tab

```
GET /attendance/my
Response: [{
  "recordId": 1,
  "sessionDate": "2024-02-10",
  "status": "present" | "absent" | "late" | "excused",
  "courseName": "Data Structures",
  "sectionId": 5
}]
```

### 4.6 Announcements Tab

```
GET /api/announcements
// Returns announcements for student's enrolled courses
Response: [{
  "announcementId": 1,
  "title": "Midterm Date Changed",
  "content": "...",
  "isPinned": true,
  "courseId": 10,
  "authorName": "Dr. Smith",
  "createdAt": "..."
}]
```

### 4.7 Community / Forums Tab

```
GET /api/community/categories   → Forum categories
GET /api/community/posts         → Community posts
GET /api/community/posts/:id     → Post detail with comments
POST /api/community/posts        → Create post
POST /api/community/posts/:id/comment → Add comment
POST /api/community/posts/:id/react   → Toggle reaction
```

### 4.8 Messaging Tab

See [Section 11: WebSocket Real-Time Messaging](#11-websocket-real-time-messaging)

```
GET /api/messages/conversations           → List conversations
POST /api/messages/conversations          → Start new conversation
GET /api/messages/conversations/:id       → Get messages
POST /api/messages/conversations/:id      → Send message
GET /api/messages/unread-count            → Unread badge count
GET /api/messages/search?query=...        → Search messages
```

### 4.9 Files Tab

```
GET /api/files/recent     → Recent files
GET /api/files/shared     → Files shared with me
GET /api/files/search     → Search files
POST /api/files/upload    → Upload file (multipart)
```

### 4.10 Notifications (Bell Icon — All Pages)

```
GET /api/notifications              → List notifications
GET /api/notifications/unread-count → Badge count
PATCH /api/notifications/:id/read   → Mark as read
PATCH /api/notifications/read-all   → Mark all read
```

### 4.11 Profile & Settings

```
GET /api/auth/me                    → Current profile
GET /api/notifications/preferences  → Notification settings
PUT /api/notifications/preferences  → Update settings
```

---

## 5. Instructor Dashboard

### 5.1 Overview / Home Tab

| Component | API Endpoint | Description |
|-----------|-------------|-------------|
| My Courses (Teaching) | `GET /api/enrollments/course-instructors` | Courses I teach |
| Today's Schedule | `GET /api/schedule/my/daily` | Today's classes |
| Pending Submissions | `GET /api/assignments/:id/submissions` | Submissions to grade |
| Recent Announcements | `GET /api/announcements` | My announcements |
| Unread Messages | `GET /api/messages/unread-count` | Message badge |

### 5.2 Course Management Tab

**For each course the instructor teaches:**

#### 5.2.1 Materials Management

```
GET    /api/courses/:courseId/materials           → List materials
POST   /api/courses/:courseId/materials           → Create material (file upload)
POST   /api/courses/:courseId/materials/video     → Upload video to YouTube
PUT    /api/courses/:courseId/materials/:id        → Update material
DELETE /api/courses/:courseId/materials/:id        → Delete material
PATCH  /api/courses/:courseId/materials/:id/visibility → Toggle visibility
```

**Video Upload Flow:**
```
POST /api/courses/:courseId/materials/video
Content-Type: multipart/form-data
Body: {
  file: <video_file>,
  title: "Lecture 1 - Introduction",
  description: "Week 1 lecture",
  weekNumber: 1
}
Response: {
  "materialId": 15,
  "externalUrl": "https://www.youtube.com/embed/VIDEO_ID",
  "title": "Lecture 1 - Introduction",
  "materialType": "video"
}
```

The backend:
1. Receives the video file via multer
2. Calls YouTube Data API to upload
3. Gets back YouTube video ID + URL
4. Stores the embed URL in `course_materials.external_url`
5. Returns the material with the embed URL

**File Upload Flow:**
```
POST /api/courses/:courseId/materials
Content-Type: multipart/form-data
Body: {
  file: <pdf_or_doc>,
  title: "Lecture Notes Week 1",
  materialType: "document",
  weekNumber: 1
}
```

The backend:
1. Saves file to `./uploads/files/{uuid}-{filename}`
2. Creates a `files` DB record (metadata: path, size, MIME type)
3. Creates a `course_materials` record linking to the file
4. Returns the material with `fileId`

#### 5.2.2 Course Structure Management

```
GET    /api/courses/:courseId/structure           → View structure
POST   /api/courses/:courseId/structure           → Add week/section
PUT    /api/courses/:courseId/structure/:id        → Edit week/section
DELETE /api/courses/:courseId/structure/:id        → Remove
PATCH  /api/courses/:courseId/structure/reorder    → Reorder items
```

#### 5.2.3 Assignment Management

```
POST   /api/assignments                          → Create assignment
PATCH  /api/assignments/:id                      → Update assignment
DELETE /api/assignments/:id                      → Delete (soft)
PATCH  /api/assignments/:id/status               → Publish/close/archive
GET    /api/assignments/:id/submissions          → View all submissions
PATCH  /api/assignments/:id/submissions/:subId/grade → Grade submission
```

**Create Assignment:**
```json
POST /api/assignments
{
  "courseId": 10,
  "title": "Homework 1",
  "description": "...",
  "instructions": "...",
  "maxScore": 100,
  "weight": 0.1,
  "dueDate": "2024-02-15T23:59:00",
  "availableFrom": "2024-02-01T00:00:00"
}
```

**Grade Submission:**
```json
PATCH /api/assignments/:id/submissions/:subId/grade
{
  "score": 85,
  "feedback": "Good work!",
  "letterGrade": "A"
}
```

#### 5.2.4 Quiz Management

```
POST   /quizzes                                  → Create quiz
PUT    /quizzes/:id                              → Update quiz
DELETE /quizzes/:id                              → Delete quiz
POST   /quizzes/:quizId/questions                → Add question
PUT    /quizzes/:quizId/questions/:qId           → Edit question
DELETE /quizzes/:quizId/questions/:qId           → Delete question
PUT    /quizzes/:quizId/questions/reorder        → Reorder questions
GET    /quizzes/attempts                         → View all attempts
POST   /quizzes/attempts/:attemptId/grade        → Grade attempt
GET    /quizzes/:quizId/statistics               → Quiz analytics
GET    /quizzes/progress/course/:courseId         → Course progress
```

**Create Quiz:**
```json
POST /quizzes
{
  "courseId": 10,
  "title": "Quiz 1",
  "quizType": "multiple_choice",
  "timeLimitMinutes": 30,
  "maxAttempts": 2,
  "passingScore": 60,
  "weight": 0.05,
  "availableFrom": "2024-02-10T...",
  "availableUntil": "2024-02-12T..."
}
```

**Add Question:**
```json
POST /quizzes/:quizId/questions
{
  "questionText": "What is a linked list?",
  "questionType": "multiple_choice",
  "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
  "correctAnswer": "A",
  "explanation": "A linked list is...",
  "points": 10,
  "orderIndex": 1
}
```

#### 5.2.5 Lab Management

```
POST   /api/labs                                 → Create lab
PUT    /api/labs/:id                             → Update lab
DELETE /api/labs/:id                             → Delete lab
POST   /api/labs/:id/instructions                → Add instruction step
GET    /api/labs/:id/submissions                 → View submissions
PATCH  /api/labs/:id/submissions/:subId/grade    → Grade submission
POST   /api/labs/:id/attendance                  → Mark attendance
GET    /api/labs/:id/attendance                  → View attendance
```

#### 5.2.6 Discussion Management

```
GET    /api/discussions?courseId=:id              → Course discussions
POST   /api/discussions                          → Create thread
DELETE /api/discussions/:id                      → Delete thread
PATCH  /api/discussions/:id/pin                  → Pin/unpin
PATCH  /api/discussions/:id/lock                 → Lock/unlock
PATCH  /api/discussions/replies/:replyId/mark-answer → Mark as answer
PATCH  /api/discussions/replies/:replyId/endorse     → Endorse reply
```

### 5.3 Grades Management Tab

```
GET    /api/grades?courseId=:id                   → List all grades for course
PUT    /api/grades/:id                           → Update grade
PATCH  /api/grades/:id/finalize                  → Finalize/publish grade
GET    /api/grades/distribution/:courseId         → Grade distribution chart
```

**Rubrics:**
```
GET    /api/rubrics?courseId=:id                  → List rubrics
POST   /api/rubrics                              → Create rubric
PUT    /api/rubrics/:id                          → Update rubric
DELETE /api/rubrics/:id                          → Delete rubric
```

### 5.4 Attendance Management Tab

```
POST   /attendance/sessions                      → Create session
GET    /attendance/sessions?sectionId=:id         → List sessions
GET    /attendance/sessions/:id                  → Session details
PUT    /attendance/sessions/:id                  → Update session
PATCH  /attendance/sessions/:id/close            → Close session
POST   /attendance/records                       → Mark single student
POST   /attendance/records/batch                 → Batch mark
GET    /attendance/summary/:sectionId            → Section summary
GET    /attendance/trends/:sectionId             → Trends chart data
GET    /attendance/report/:sectionId             → Generate report
POST   /attendance/import-excel                  → Import from Excel
GET    /attendance/export-excel/:sessionId        → Export to Excel
POST   /attendance/ai-photo                      → AI photo attendance
GET    /attendance/ai-photo/:processingId         → AI processing status
```

### 5.5 Student List Tab

```
GET /api/enrollments/section/:sectionId/students  → List enrolled students
GET /api/enrollments/section/:sectionId/waitlist   → View waitlist
GET /attendance/by-student/:studentId             → Student attendance record
GET /api/grades?studentId=:id&courseId=:id        → Student grades
```

### 5.6 Announcements Tab

```
GET    /api/announcements                        → List my announcements
POST   /api/announcements                        → Create announcement
PUT    /api/announcements/:id                    → Update
DELETE /api/announcements/:id                    → Delete
PATCH  /api/announcements/:id/publish            → Publish
PATCH  /api/announcements/:id/schedule           → Schedule for later
PATCH  /api/announcements/:id/pin                → Pin/unpin
GET    /api/announcements/:id/analytics          → View analytics
```

**Create Announcement:**
```json
POST /api/announcements
{
  "title": "Midterm Date Changed",
  "content": "The midterm has been moved to...",
  "courseId": 10,
  "priority": "high",
  "isPinned": false
}
```

### 5.7 Exam Schedule Tab

```
GET    /api/exams/schedule?courseId=:id           → Exam schedules
POST   /api/exams/schedule                       → Create exam schedule
PUT    /api/exams/schedule/:id                   → Update
DELETE /api/exams/schedule/:id                   → Delete
```

### 5.8 Messaging, Notifications, Community, Files, Calendar

Same as Student — see sections 4.7–4.10 and [Section 11](#11-websocket-real-time-messaging).

---

## 6. Admin / IT Admin Dashboard

### 6.1 Overview / Home Tab

| Component | API Endpoint | Description |
|-----------|-------------|-------------|
| Total Users | `GET /api/admin/users` | User count |
| Active Campuses | `GET /api/campuses` | Campus list |
| Current Semester | `GET /api/semesters/current` | Active semester |
| System Notifications | `GET /api/notifications` | Admin notifications |

### 6.2 User Management Tab

```
GET    /api/admin/users                          → List all users (paginated, filterable)
GET    /api/admin/users/:id                      → User details
PUT    /api/admin/users/:id                      → Update user
DELETE /api/admin/users/:id                      → Delete user
PUT    /api/admin/users/:id/status               → Activate/suspend/deactivate user
GET    /api/admin/users/search?query=...         → Search users
POST   /api/admin/users/:id/roles                → Assign role to user
DELETE /api/admin/users/:id/roles/:roleId        → Remove role from user
GET    /api/admin/users/:id/permissions           → View effective permissions
```

**User status values:** `active`, `inactive`, `suspended`

### 6.3 Roles & Permissions Tab (IT_ADMIN only)

```
GET    /api/admin/roles                          → List all roles
GET    /api/admin/roles/:id                      → Role details
POST   /api/admin/roles                          → Create role (IT_ADMIN only)
PUT    /api/admin/roles/:id                      → Update role (IT_ADMIN only)
DELETE /api/admin/roles/:id                      → Delete role (IT_ADMIN only)
POST   /api/admin/roles/:id/permissions          → Add permission to role
DELETE /api/admin/roles/:id/permissions/:permId  → Remove permission
GET    /api/admin/permissions                    → List all permissions
GET    /api/admin/permissions/module/:module      → Permissions by module
POST   /api/admin/permissions                    → Create permission (IT_ADMIN)
PUT    /api/admin/permissions/:id                → Update permission (IT_ADMIN)
DELETE /api/admin/permissions/:id                → Delete permission (IT_ADMIN)
```

### 6.4 Campus Management Tab

```
GET    /api/campuses                             → List campuses
POST   /api/campuses                             → Create campus
PUT    /api/campuses/:id                         → Update campus
DELETE /api/campuses/:id                         → Delete campus

GET    /api/campuses/:campusId/departments       → Departments in campus
POST   /api/departments                          → Create department
GET    /api/departments/:id                      → Department details

GET    /api/departments/:deptId/programs          → Programs in department
POST   /api/programs                             → Create program
GET    /api/programs/:id                         → Program details
```

### 6.5 Semester Management Tab

```
GET    /api/semesters                            → List all semesters
GET    /api/semesters/current                    → Current active semester
POST   /api/semesters                            → Create semester (if endpoint exists)
```

### 6.6 Course & Section Management Tab

```
GET    /api/courses                              → List all courses
GET    /api/courses/department/:deptId            → Courses by department
GET    /api/sections/course/:courseId             → Sections for a course
POST   /api/sections                             → Create section
PATCH  /api/sections/:id                         → Update section
GET    /api/schedules/section/:sectionId          → Section schedules
POST   /api/schedules/section/:sectionId          → Create schedule
DELETE /api/schedules/:id                         → Delete schedule
```

### 6.7 Enrollment Management Tab

```
GET    /api/enrollments/course/:courseId/list     → Course enrollments
GET    /api/enrollments/section/:sectionId/students → Section students
GET    /api/enrollments/section/:sectionId/waitlist → Waitlist
POST   /api/enrollments/:id/status               → Update enrollment status
```

### 6.8 Notifications Management Tab

```
POST   /api/notifications/send                   → Send notification to user(s)
```

**Send Notification:**
```json
POST /api/notifications/send
{
  "userId": 5,           // or array of user IDs
  "title": "Important Notice",
  "body": "Your registration has been approved",
  "notificationType": "system",
  "priority": "high"
}
```

### 6.9 Exam Schedule, Announcements, Community, Grades

Same endpoints as Instructor, with full access.

### 6.10 Community Management

```
GET    /api/community/categories                 → List categories
POST   /api/community/categories                 → Create category
PUT    /api/community/categories/:id             → Update category
DELETE /api/community/categories/:id             → Delete category
```

---

## 7. TA Dashboard

The TA dashboard is a **subset of the Instructor dashboard** with these differences:

| Feature | TA Access | Instructor Access |
|---------|----------|-------------------|
| Create Materials | ✅ | ✅ |
| Delete Materials | ❌ | ✅ |
| Create Assignments | ❌ | ✅ |
| Grade Submissions | ✅ | ✅ |
| Create Quizzes | ✅ | ✅ |
| Delete Quizzes | ❌ | ✅ |
| Manage Attendance | ✅ | ✅ |
| Delete Attendance Sessions | ❌ | ✅ |
| Create Announcements | ✅ | ✅ |
| Delete Announcements | ❌ | ✅ |
| Pin/Lock Discussions | ✅ | ✅ |
| Delete Discussions | ❌ | ✅ |
| View Grade Distribution | ❌ | ✅ |
| Finalize Grades | ❌ | ✅ |
| Create Rubrics | ❌ | ✅ |

**Implementation Note:** TAs see the same dashboard as instructors but with create/delete buttons hidden for restricted features. The backend enforces role checks — the frontend should read the user's role and hide UI elements accordingly.

---

## 8. Shared Components

These components appear across all dashboards:

### 8.1 Navigation Sidebar

```
Student:
├── 🏠 Home / Overview
├── 📚 My Courses
│   └── [Course Detail → Materials, Assignments, Quizzes, Labs, Discussions]
├── 📊 Grades & Transcript
├── 📅 Schedule / Calendar
├── ✅ Attendance
├── 📢 Announcements
├── 💬 Messaging
├── 🏛️ Community
├── 📁 Files
├── 🔔 Notifications (icon in header)
└── 👤 Profile & Settings

Instructor:
├── 🏠 Home / Overview
├── 📚 Course Management
│   └── [Course → Materials, Structure, Assignments, Quizzes, Labs, Discussions]
├── 📊 Grades Management
│   └── [Rubrics]
├── ✅ Attendance Management
├── 👥 Student List
├── 📢 Announcements
├── 📅 Schedule & Exams
├── 💬 Messaging
├── 🏛️ Community
├── 📁 Files
├── 🔔 Notifications (icon in header)
└── 👤 Profile & Settings

Admin:
├── 🏠 Home / Overview
├── 👥 User Management
├── 🔐 Roles & Permissions (IT_ADMIN only)
├── 🏫 Campus Management
│   └── [Departments, Programs]
├── 📅 Semesters
├── 📚 Courses & Sections
├── 📋 Enrollments
├── 📢 Announcements
├── 📊 Grades
├── 🔔 Notifications
├── 🏛️ Community Management
├── 💬 Messaging
└── 👤 Profile & Settings
```

### 8.2 Top Header Bar

| Element | Implementation |
|---------|---------------|
| App Logo | Static |
| Search Bar | `GET /api/files/search`, `GET /api/messages/search` |
| Notification Bell | `GET /api/notifications/unread-count` → dropdown with `GET /api/notifications` |
| User Avatar | From `GET /api/auth/me → profilePictureUrl` |
| User Menu | Logout: `POST /api/auth/logout` |

### 8.3 Notification Dropdown

```
GET /api/notifications?limit=10
→ Show latest 10 notifications
→ Click "View All" → full notifications page
→ Click notification → navigate to related entity
   (use relatedEntityType + relatedEntityId to determine route)
```

**Notification types and navigation:**
| relatedEntityType | Navigate To |
|-------------------|-------------|
| `assignment` | `/courses/:courseId/assignments/:id` |
| `quiz` | `/courses/:courseId/quizzes/:id` |
| `grade` | `/grades` |
| `announcement` | `/announcements/:id` |
| `message` | `/messaging/conversations/:id` |
| `enrollment` | `/my-courses` |

---

## 9. File Storage & Upload/Download

### How Files Are Stored

**Files are stored on the SERVER FILESYSTEM, NOT in the database.**

```
Storage location: ./uploads/files/
Filename format: {uuid}-{sanitized_original_name}
Example: 550e8400-e29b-41d4-a716-446655440000-lecture_notes.pdf
```

**The database stores only metadata:**
```sql
files table:
  file_id          → Primary key
  fileName         → UUID-prefixed name on disk
  originalFileName → Original name shown to user
  filePath         → Relative path: uploads/files/550e8400-...-lecture_notes.pdf
  fileSize         → Size in bytes
  mimeType         → e.g., application/pdf
  fileExtension    → e.g., pdf
  uploadedBy       → User ID (FK)
  folderId         → Optional folder (FK)
  checksum         → File integrity hash
  downloadCount    → Download counter
  status           → active/archived/deleted
```

### Upload Flow

```
POST /api/files/upload
Content-Type: multipart/form-data

Form fields:
  file: <binary file data>
  folderId: 5           // optional
  description: "..."    // optional

Response: {
  "fileId": 42,
  "fileName": "550e8400-...-notes.pdf",
  "originalFileName": "notes.pdf",
  "fileSize": 1048576,
  "mimeType": "application/pdf",
  "fileExtension": "pdf",
  "downloadUrl": "/api/files/42/download"
}
```

**Frontend implementation:**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('folderId', '5');  // optional

const response = await fetch('/api/files/upload', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData  // DO NOT set Content-Type header — browser sets it with boundary
});
```

### Download Flow

```
GET /api/files/:fileId/download
Response: Binary file stream with Content-Disposition header

// Frontend:
window.open(`${API_BASE}/api/files/${fileId}/download`, '_blank');
// Or use fetch + blob for programmatic download
```

### File Versioning

```
POST /api/files/:fileId/versions    → Upload new version
GET  /api/files/:fileId/versions    → List all versions
GET  /api/files/:fileId/versions/:versionId/download → Download specific version
```

### File Sharing / Permissions

```
GET    /api/files/:fileId/permissions                → List permissions
POST   /api/files/:fileId/permissions                → Grant access
DELETE /api/files/:fileId/permissions/:permissionId   → Revoke access
GET    /api/files/shared                             → Files shared with me
```

### Folders

```
POST   /api/files/folders                    → Create folder
GET    /api/files/folders/:folderId          → Get folder
GET    /api/files/folders/:folderId/children  → List contents
GET    /api/files/folders/:folderId/tree      → Get folder tree
PUT    /api/files/folders/:folderId          → Update folder
DELETE /api/files/folders/:folderId          → Delete folder
```

---

## 10. YouTube Video Integration

### How Video Upload Works (End-to-End)

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────────┐     ┌──────────────┐
│  Frontend    │     │   NestJS Backend  │     │  YouTube API     │     │   Database   │
│  (Instructor)│     │  materials.service│     │  Data API v3     │     │              │
└──────┬───────┘     └────────┬─────────┘     └────────┬─────────┘     └──────┬───────┘
       │                      │                         │                      │
       │  1. POST /materials/video                      │                      │
       │  (multipart: file + metadata)                  │                      │
       │─────────────────────>│                         │                      │
       │                      │                         │                      │
       │                      │  2. uploadVideoFromBuffer()                    │
       │                      │  (OAuth2 authenticated)  │                     │
       │                      │────────────────────────>│                      │
       │                      │                         │                      │
       │                      │  3. Returns videoId +   │                      │
       │                      │     embed URL            │                      │
       │                      │<────────────────────────│                      │
       │                      │                         │                      │
       │                      │  4. INSERT course_materials                    │
       │                      │     (external_url = embed URL)                 │
       │                      │───────────────────────────────────────────────>│
       │                      │                         │                      │
       │  5. Response:        │                         │                      │
       │  { materialId, externalUrl, ... }              │                      │
       │<─────────────────────│                         │                      │
       │                      │                         │                      │
       │  6. Render <iframe src={externalUrl} />        │                      │
       │                      │                         │                      │
```

### Frontend Video Upload Component

```javascript
// 1. Upload video
const formData = new FormData();
formData.append('file', videoFile);
formData.append('title', 'Lecture 1 - Introduction');
formData.append('description', 'Week 1 lecture video');
formData.append('weekNumber', '1');

const response = await fetch(`/api/courses/${courseId}/materials/video`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
const material = await response.json();
// material.externalUrl = "https://www.youtube.com/embed/VIDEO_ID"
```

### Frontend Video Player Component

```html
<!-- Option 1: Direct embed using externalUrl from material -->
<iframe
  src="{material.externalUrl}"
  width="800"
  height="450"
  frameborder="0"
  allowfullscreen
></iframe>

<!-- Option 2: Use embed endpoint (returns full HTML) -->
<!-- GET /api/courses/:courseId/materials/:id/embed -->
<!-- Returns: { "embedHtml": "<iframe src='...' ...></iframe>" } -->
```

### YouTube OAuth Setup (One-Time Admin Task)

```
1. GET /youtube/auth → Returns Google OAuth URL
2. Redirect admin to that URL → Google consent screen
3. Google redirects to GET /youtube/callback with auth code
4. Backend exchanges code for access + refresh tokens
5. Stores tokens — future uploads use stored credentials
```

**Important:** YouTube OAuth must be set up before video uploads work. The backend stores YouTube credentials after the OAuth flow.

---

## 11. WebSocket Real-Time Messaging

### Connection Setup

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000/messaging', {
  auth: {
    token: accessToken  // JWT token
  },
  transports: ['websocket']
});

socket.on('connect', () => {
  console.log('Connected to messaging');
});
```

### Events: Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `join_conversation` | `{ conversationId: number }` | Join conversation room |
| `leave_conversation` | `{ conversationId: number }` | Leave room |
| `send_message` | `{ conversationId: number, content: string, messageType?: string }` | Send message |
| `typing` | `{ conversationId: number, isTyping: boolean }` | Typing indicator |
| `mark_read` | `{ conversationId: number }` | Mark as read |
| `delete_message` | `{ messageId: number, forEveryone: boolean }` | Delete message |

### Events: Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `new_message` | `{ message, senderUserId }` | New message in joined conversation |
| `new_message_notification` | `{ conversationId, message, senderUserId }` | Message in non-active conversation |
| `user_typing` | `{ conversationId, userId, isTyping }` | Typing indicator |
| `message_read` | `{ conversationId, userId, readAt }` | Read receipt |
| `message_deleted` | `{ messageId, deletedForEveryone, deletedBy }` | Message deleted |
| `user_status` | `{ userId, isOnline, lastSeen }` | Online/offline status |

### Messaging Flow

```javascript
// 1. Load conversations list (REST)
const conversations = await fetch('/api/messages/conversations', { headers });

// 2. Open a conversation
socket.emit('join_conversation', { conversationId: 5 });
const messages = await fetch(`/api/messages/conversations/5`, { headers });

// 3. Listen for new messages (WebSocket)
socket.on('new_message', (data) => {
  addMessageToUI(data.message);
});

// 4. Send message (WebSocket for real-time, REST as fallback)
socket.emit('send_message', {
  conversationId: 5,
  content: 'Hello!',
  messageType: 'text'
});
// OR
await fetch('/api/messages/conversations/5', {
  method: 'POST',
  headers,
  body: JSON.stringify({ content: 'Hello!' })
});

// 5. Typing indicator
socket.emit('typing', { conversationId: 5, isTyping: true });
setTimeout(() => {
  socket.emit('typing', { conversationId: 5, isTyping: false });
}, 3000);

// 6. Mark as read
socket.emit('mark_read', { conversationId: 5 });

// 7. Leave conversation
socket.on('beforeunload', () => {
  socket.emit('leave_conversation', { conversationId: 5 });
});
```

### Start New Conversation (REST)

```json
POST /api/messages/conversations
{
  "participantIds": [2, 3],
  "content": "Hey, want to study together?",
  "conversationType": "direct"  // or "group"
}
```

### Online Users

```
GET /api/messages/online-users
Response: [1, 5, 12, 34]  // array of online user IDs
```

---

## 12. Notification System

### Current State

Notifications are currently **MANUAL ONLY** — there are no automatic triggers. The admin must manually send notifications via:

```
POST /api/notifications/send
```

### Notification Object Structure

```json
{
  "notificationId": 1,
  "userId": 5,
  "notificationType": "assignment" | "quiz" | "grade" | "announcement" | "system" | "enrollment",
  "title": "New Assignment Posted",
  "body": "HW1 has been posted in Data Structures",
  "relatedEntityType": "assignment",
  "relatedEntityId": 15,
  "priority": "normal" | "high" | "urgent",
  "isRead": false,
  "createdAt": "2024-02-10T..."
}
```

### Frontend Notification Implementation

```javascript
// Poll for unread count every 30 seconds (no WebSocket for notifications)
setInterval(async () => {
  const { count } = await fetch('/api/notifications/unread-count', { headers });
  updateBadge(count);
}, 30000);

// Load notifications
const notifications = await fetch('/api/notifications', { headers });

// Mark as read
await fetch(`/api/notifications/${id}/read`, { method: 'PATCH', headers });

// Mark all as read
await fetch('/api/notifications/read-all', { method: 'PATCH', headers });

// Delete notification
await fetch(`/api/notifications/${id}`, { method: 'DELETE', headers });

// Clear all
await fetch('/api/notifications/clear-all', { method: 'DELETE', headers });
```

### Notification Preferences

```
GET /api/notifications/preferences
Response: {
  "email_notifications": true,
  "push_notifications": true,
  "assignment_notifications": true,
  "quiz_notifications": true,
  "grade_notifications": true,
  "announcement_notifications": true,
  "message_notifications": true
}

PUT /api/notifications/preferences
Body: { same structure with updated values }
```

### What's Missing (Gaps)

| Gap | Description |
|-----|-------------|
| No auto-notifications on assignment creation | Instructor creates assignment → no notification sent to students |
| No auto-notifications on grade posting | Grade is entered → student not notified |
| No auto-notifications on announcements | Announcement published → no notification sent |
| No WebSocket for notifications | Must poll REST API, no real-time push |
| No email sending | Email notification preference exists but no email service implemented |

---

## 13. Complete API Endpoint Reference

### Auth (`/api/auth`)

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| POST | `/register` | Public | — | Register user |
| POST | `/login` | Public | — | Login → tokens |
| POST | `/logout` | JWT | Any | Logout |
| POST | `/refresh-token` | Public | — | Refresh access token |
| POST | `/forgot-password` | Public | — | Request password reset |
| POST | `/reset-password` | Public | — | Reset password |
| GET | `/me` | JWT | Any | Current user profile |

### Admin (`/api/admin`)

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| GET | `/users` | JWT | ADMIN, IT_ADMIN | List users |
| GET | `/users/:id` | JWT | ADMIN, IT_ADMIN | User details |
| PUT | `/users/:id` | JWT | ADMIN, IT_ADMIN | Update user |
| DELETE | `/users/:id` | JWT | ADMIN, IT_ADMIN | Delete user |
| PUT | `/users/:id/status` | JWT | ADMIN, IT_ADMIN | Change user status |
| GET | `/users/search` | JWT | ADMIN, IT_ADMIN | Search users |
| POST | `/users/:id/roles` | JWT | ADMIN, IT_ADMIN | Assign role |
| DELETE | `/users/:id/roles/:roleId` | JWT | ADMIN, IT_ADMIN | Remove role |
| GET | `/users/:id/permissions` | JWT | ADMIN, IT_ADMIN | User permissions |
| GET | `/roles` | JWT | ADMIN, IT_ADMIN | List roles |
| GET | `/roles/:id` | JWT | ADMIN, IT_ADMIN | Role details |
| POST | `/roles` | JWT | IT_ADMIN | Create role |
| PUT | `/roles/:id` | JWT | IT_ADMIN | Update role |
| DELETE | `/roles/:id` | JWT | IT_ADMIN | Delete role |
| POST | `/roles/:id/permissions` | JWT | IT_ADMIN | Add permission |
| DELETE | `/roles/:id/permissions/:permId` | JWT | IT_ADMIN | Remove permission |
| GET | `/permissions` | JWT | ADMIN, IT_ADMIN | List permissions |
| GET | `/permissions/module/:module` | JWT | ADMIN, IT_ADMIN | Permissions by module |
| POST | `/permissions` | JWT | IT_ADMIN | Create permission |
| PUT | `/permissions/:id` | JWT | IT_ADMIN | Update permission |
| DELETE | `/permissions/:id` | JWT | IT_ADMIN | Delete permission |

### Campus (`/api/campuses`, `/api/departments`, `/api/programs`)

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| GET | `/campuses` | JWT | All | List campuses |
| POST | `/campuses` | JWT | ADMIN, IT_ADMIN | Create campus |
| GET | `/campuses/:campusId/departments` | JWT | All | Departments in campus |
| POST | `/departments` | JWT | ADMIN, IT_ADMIN | Create department |
| GET | `/departments/:id` | JWT | All | Department details |
| GET | `/departments/:deptId/programs` | JWT | All | Programs in department |
| POST | `/programs` | JWT | ADMIN, IT_ADMIN | Create program |
| GET | `/programs/:id` | JWT | All | Program details |

### Semesters (`/api/semesters`)

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| GET | `/` | JWT | All | List semesters |
| GET | `/current` | JWT | All | Current semester |

### Courses (`/api/courses`)

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| GET | `/` | Public | — | List all courses |
| GET | `/department/:deptId` | Public | — | Courses by department |

### Sections (`/api/sections`)

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| GET | `/course/:courseId` | Public | — | Sections for course |
| GET | `/:id` | Public | — | Section details |
| POST | `/` | JWT | ADMIN, IT_ADMIN, INSTRUCTOR | Create section |
| PATCH | `/:id` | JWT | ADMIN, IT_ADMIN, INSTRUCTOR | Update section |
| PATCH | `/:id/enrollment` | JWT | ADMIN, IT_ADMIN, INSTRUCTOR | Update enrollment count |

### Schedules (`/api/schedules`)

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| GET | `/section/:sectionId` | Public | — | Schedules for section |
| GET | `/:id` | Public | — | Schedule by ID |
| POST | `/section/:sectionId` | Public* | — | Create schedule |
| DELETE | `/:id` | Public* | — | Delete schedule |

*Note: These say "public" but likely have service-level restrictions.

### Enrollments (`/api/enrollments`)

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| GET | `/my-courses` | JWT | STUDENT | My enrolled courses |
| GET | `/available` | JWT | STUDENT | Available courses |
| POST | `/register` | JWT | STUDENT | Enroll in course |
| GET | `/:id` | JWT | Any | Enrollment details |
| DELETE | `/:id` | JWT | STUDENT, ADMIN | Drop course |
| GET | `/course/:courseId/list` | JWT | INSTRUCTOR, ADMIN | Course enrollments |
| GET | `/section/:sectionId/students` | JWT | INSTRUCTOR, ADMIN | Section students |
| GET | `/section/:sectionId/waitlist` | JWT | INSTRUCTOR, ADMIN | Section waitlist |
| POST | `/:id/status` | JWT | ADMIN | Update enrollment status |

### Materials (`/api/courses/:courseId/materials`)

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| GET | `/` | JWT | Any | List materials |
| POST | `/` | JWT | INSTRUCTOR, TA, ADMIN, IT_ADMIN | Create material |
| POST | `/video` | JWT | INSTRUCTOR, TA, ADMIN, IT_ADMIN | Upload YouTube video |
| GET | `/:id` | JWT | Any | Material details |
| PUT | `/:id` | JWT | INSTRUCTOR, TA, ADMIN, IT_ADMIN | Update material |
| DELETE | `/:id` | JWT | INSTRUCTOR, ADMIN, IT_ADMIN | Delete material |
| PATCH | `/:id/visibility` | JWT | INSTRUCTOR, TA, ADMIN, IT_ADMIN | Toggle visibility |
| GET | `/:id/download` | JWT | Any | Download file |
| GET | `/:id/embed` | JWT | Any | Get YouTube embed HTML |

### Course Structure (`/api/courses/:courseId/structure`)

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| GET | `/` | JWT | Any | Get structure |
| GET | `/:id` | JWT | Any | Structure item |
| POST | `/` | JWT | INSTRUCTOR, ADMIN, IT_ADMIN | Create item |
| PUT | `/:id` | JWT | INSTRUCTOR, ADMIN, IT_ADMIN | Update item |
| DELETE | `/:id` | JWT | INSTRUCTOR, ADMIN, IT_ADMIN | Delete item |
| PATCH | `/reorder` | JWT | INSTRUCTOR, ADMIN, IT_ADMIN | Reorder items |

### Assignments (`/api/assignments`)

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| GET | `/` | JWT | Any | List assignments |
| POST | `/` | JWT | INSTRUCTOR, ADMIN | Create assignment |
| GET | `/:id` | JWT | Any | Assignment details |
| PATCH | `/:id` | JWT | INSTRUCTOR, ADMIN | Update assignment |
| DELETE | `/:id` | JWT | INSTRUCTOR, ADMIN | Delete (soft) |
| PATCH | `/:id/status` | JWT | INSTRUCTOR, ADMIN | Change status |
| POST | `/:id/submit` | JWT | STUDENT | Submit assignment |
| GET | `/:id/submissions/my` | JWT | STUDENT | My submission |
| GET | `/:id/submissions` | JWT | INSTRUCTOR, TA, ADMIN | All submissions |
| PATCH | `/:id/submissions/:subId/grade` | JWT | INSTRUCTOR, TA | Grade submission |

### Quizzes (`/quizzes`)

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| GET | `/` | JWT | All | List quizzes |
| POST | `/` | JWT | INSTRUCTOR, TA, ADMIN | Create quiz |
| GET | `/difficulty-levels` | JWT | INSTRUCTOR, TA, ADMIN | Difficulty levels |
| GET | `/my-attempts` | JWT | STUDENT | My attempts |
| GET | `/attempts` | JWT | INSTRUCTOR, TA, ADMIN | All attempts |
| GET | `/:id` | JWT | All | Quiz with questions |
| PUT | `/:id` | JWT | INSTRUCTOR, TA, ADMIN | Update quiz |
| DELETE | `/:id` | JWT | INSTRUCTOR, ADMIN | Delete quiz |
| POST | `/:quizId/questions` | JWT | INSTRUCTOR, TA, ADMIN | Add question |
| PUT | `/:quizId/questions/reorder` | JWT | INSTRUCTOR, TA, ADMIN | Reorder |
| PUT | `/:quizId/questions/:qId` | JWT | INSTRUCTOR, TA, ADMIN | Edit question |
| DELETE | `/:quizId/questions/:qId` | JWT | INSTRUCTOR, TA, ADMIN | Delete question |
| POST | `/:quizId/attempts/start` | JWT | STUDENT | Start attempt |
| POST | `/attempts/:attemptId/submit` | JWT | STUDENT | Submit quiz |
| GET | `/attempts/:attemptId` | JWT | All | Attempt details |
| POST | `/attempts/:attemptId/grade` | JWT | INSTRUCTOR, TA, ADMIN | Grade attempt |
| GET | `/attempts/:attemptId/pending-grading` | JWT | INSTRUCTOR, TA, ADMIN | Pending items |
| GET | `/:quizId/statistics` | JWT | INSTRUCTOR, TA, ADMIN | Quiz statistics |
| GET | `/progress/course/:courseId` | JWT | INSTRUCTOR, ADMIN | Course progress |

### Labs (`/api/labs`)

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| GET | `/` | JWT | Any | List labs |
| POST | `/` | JWT | INSTRUCTOR, TA, ADMIN, IT_ADMIN | Create lab |
| GET | `/:id` | JWT | Any | Lab details |
| PUT | `/:id` | JWT | INSTRUCTOR, TA, ADMIN, IT_ADMIN | Update lab |
| DELETE | `/:id` | JWT | INSTRUCTOR, ADMIN, IT_ADMIN | Delete lab |
| GET | `/:id/instructions` | JWT | Any | Lab instructions |
| POST | `/:id/instructions` | JWT | INSTRUCTOR, TA, ADMIN, IT_ADMIN | Add instruction |
| POST | `/:id/submit` | JWT | STUDENT | Submit lab |
| GET | `/:id/submissions` | JWT | INSTRUCTOR, TA, ADMIN, IT_ADMIN | All submissions |
| GET | `/:id/submissions/my` | JWT | STUDENT | My submission |
| PATCH | `/:id/submissions/:subId/grade` | JWT | INSTRUCTOR, TA, ADMIN, IT_ADMIN | Grade submission |
| POST | `/:id/attendance` | JWT | INSTRUCTOR, TA, ADMIN, IT_ADMIN | Mark attendance |
| GET | `/:id/attendance` | JWT | INSTRUCTOR, TA, ADMIN, IT_ADMIN | View attendance |

### Grades (`/api/grades`)

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| GET | `/` | JWT | INSTRUCTOR, TA, ADMIN | List grades |
| GET | `/my` | JWT | STUDENT | My grades |
| GET | `/transcript/:studentId` | JWT | STUDENT, ADMIN | Transcript |
| GET | `/gpa/:studentId` | JWT | STUDENT, ADMIN | GPA calculation |
| GET | `/distribution/:courseId` | JWT | INSTRUCTOR, TA, ADMIN | Distribution |
| PUT | `/:id` | JWT | INSTRUCTOR, TA | Update grade |
| PATCH | `/:id/finalize` | JWT | INSTRUCTOR | Finalize grade |

### Rubrics (`/api/rubrics`)

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| GET | `/` | JWT | INSTRUCTOR, TA | List rubrics |
| POST | `/` | JWT | INSTRUCTOR | Create rubric |
| PUT | `/:id` | JWT | INSTRUCTOR | Update rubric |
| DELETE | `/:id` | JWT | INSTRUCTOR | Delete rubric |

### Attendance (`/attendance`)

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| POST | `/sessions` | JWT | INSTRUCTOR, TA, ADMIN | Create session |
| GET | `/sessions` | JWT | INSTRUCTOR, TA, ADMIN | List sessions |
| GET | `/sessions/:id` | JWT | INSTRUCTOR, TA, ADMIN | Session details |
| PUT | `/sessions/:id` | JWT | INSTRUCTOR, TA, ADMIN | Update session |
| DELETE | `/sessions/:id` | JWT | INSTRUCTOR, ADMIN | Delete session |
| PATCH | `/sessions/:id/close` | JWT | INSTRUCTOR, TA, ADMIN | Close session |
| GET | `/sessions/:id/records` | JWT | INSTRUCTOR, TA, ADMIN | Session records |
| POST | `/records` | JWT | INSTRUCTOR, TA, ADMIN | Mark attendance |
| POST | `/records/batch` | JWT | INSTRUCTOR, TA, ADMIN | Batch mark |
| PUT | `/records/:id` | JWT | INSTRUCTOR, TA, ADMIN | Update record |
| GET | `/my` | JWT | STUDENT | My attendance |
| GET | `/by-student/:studentId` | JWT | INSTRUCTOR, TA, ADMIN | Student attendance |
| GET | `/by-course/:courseId` | JWT | INSTRUCTOR, TA, ADMIN | Course attendance |
| GET | `/summary/:sectionId` | JWT | INSTRUCTOR, TA, ADMIN | Section summary |
| GET | `/trends/:sectionId` | JWT | INSTRUCTOR, TA, ADMIN | Trends |
| GET | `/report/:sectionId` | JWT | INSTRUCTOR, TA, ADMIN | Report |
| POST | `/import-excel` | JWT | INSTRUCTOR, ADMIN | Import Excel |
| GET | `/export-excel/:sessionId` | JWT | INSTRUCTOR, TA, ADMIN | Export session |
| GET | `/export-excel/section/:sectionId` | JWT | INSTRUCTOR, TA, ADMIN | Export section |
| POST | `/ai-photo` | JWT | INSTRUCTOR, TA, ADMIN | AI photo |
| GET | `/ai-photo/:processingId` | JWT | INSTRUCTOR, TA, ADMIN | AI status |

### Announcements (`/api/announcements`)

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| GET | `/` | JWT | Any | List (role-filtered) |
| POST | `/` | JWT | INSTRUCTOR, TA, ADMIN, IT_ADMIN | Create |
| GET | `/:id` | JWT | Any | Details |
| PUT | `/:id` | JWT | INSTRUCTOR, TA, ADMIN, IT_ADMIN | Update |
| DELETE | `/:id` | JWT | INSTRUCTOR, ADMIN, IT_ADMIN | Delete |
| PATCH | `/:id/publish` | JWT | INSTRUCTOR, ADMIN, IT_ADMIN | Publish |
| PATCH | `/:id/schedule` | JWT | INSTRUCTOR, ADMIN, IT_ADMIN | Schedule |
| PATCH | `/:id/pin` | JWT | INSTRUCTOR, ADMIN, IT_ADMIN | Pin/unpin |
| GET | `/:id/analytics` | JWT | INSTRUCTOR, ADMIN, IT_ADMIN | Analytics |

### Discussions (`/api/discussions`)

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| GET | `/` | JWT | Any | List threads |
| POST | `/` | JWT | Any | Create thread |
| GET | `/:id` | JWT | Any | Thread + replies |
| PUT | `/:id` | JWT | Any | Update thread |
| DELETE | `/:id` | JWT | INSTRUCTOR, ADMIN, IT_ADMIN | Delete thread |
| POST | `/:id/reply` | JWT | Any | Reply |
| PATCH | `/:id/pin` | JWT | INSTRUCTOR, TA, ADMIN, IT_ADMIN | Pin/unpin |
| PATCH | `/:id/lock` | JWT | INSTRUCTOR, TA, ADMIN, IT_ADMIN | Lock/unlock |
| PATCH | `/replies/:replyId/mark-answer` | JWT | INSTRUCTOR, TA, ADMIN, IT_ADMIN | Mark answer |
| PATCH | `/replies/:replyId/endorse` | JWT | INSTRUCTOR, TA, ADMIN, IT_ADMIN | Endorse |

### Community (`/api/community`)

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| GET | `/categories` | JWT | Any | List categories |
| GET | `/categories/:id` | JWT | Any | Category details |
| POST | `/categories` | JWT | ADMIN, IT_ADMIN | Create category |
| PUT | `/categories/:id` | JWT | ADMIN, IT_ADMIN | Update category |
| DELETE | `/categories/:id` | JWT | ADMIN, IT_ADMIN | Delete category |
| GET | `/posts` | JWT | Any | List posts |
| POST | `/posts` | JWT | Any | Create post |
| GET | `/posts/:id` | JWT | Any | Post + comments |
| PUT | `/posts/:id` | JWT | Owner | Update post |
| DELETE | `/posts/:id` | JWT | Owner, Admin | Delete post |
| POST | `/posts/:id/comment` | JWT | Any | Comment |
| POST | `/posts/:id/react` | JWT | Any | Toggle reaction |
| PATCH | `/posts/:id/pin` | JWT | INSTRUCTOR, ADMIN, IT_ADMIN | Pin |
| PATCH | `/posts/:id/lock` | JWT | INSTRUCTOR, ADMIN, IT_ADMIN | Lock |
| PUT | `/comments/:id` | JWT | Owner | Update comment |
| DELETE | `/comments/:id` | JWT | Owner, Admin | Delete comment |

### Notifications (`/api/notifications`)

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| GET | `/` | JWT | Any | List notifications |
| GET | `/unread-count` | JWT | Any | Unread count |
| PATCH | `/read-all` | JWT | Any | Mark all read |
| DELETE | `/clear-all` | JWT | Any | Clear all |
| GET | `/preferences` | JWT | Any | Preferences |
| PUT | `/preferences` | JWT | Any | Update preferences |
| PATCH | `/:id/read` | JWT | Any | Mark read |
| DELETE | `/:id` | JWT | Any | Delete one |
| POST | `/send` | JWT | ADMIN, IT_ADMIN | Send notification |

### Files (`/api/files`)

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| POST | `/upload` | JWT | Any | Upload file |
| GET | `/search` | JWT | Any | Search files |
| GET | `/recent` | JWT | Any | Recent files |
| GET | `/shared` | JWT | Any | Shared with me |
| GET | `/:fileId` | JWT | Any | File metadata |
| GET | `/:fileId/download` | JWT | Any | Download |
| PUT | `/:fileId` | JWT | Any | Update metadata |
| DELETE | `/:fileId` | JWT | Any | Delete file |
| POST | `/:fileId/versions` | JWT | Any | New version |
| GET | `/:fileId/versions` | JWT | Any | List versions |
| GET | `/:fileId/versions/:versionId/download` | JWT | Any | Download version |
| GET | `/:fileId/permissions` | JWT | Any | File permissions |
| POST | `/:fileId/permissions` | JWT | Any | Grant permission |
| DELETE | `/:fileId/permissions/:permId` | JWT | Any | Revoke |

### Folders (`/api/files/folders`)

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| POST | `/` | JWT | Any | Create folder |
| GET | `/:folderId` | JWT | Any | Get folder |
| GET | `/:folderId/children` | JWT | Any | Folder contents |
| GET | `/:folderId/tree` | JWT | Any | Folder tree |
| PUT | `/:folderId` | JWT | Any | Update folder |
| DELETE | `/:folderId` | JWT | Any | Delete folder |

### Messaging (`/api/messages`)

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| GET | `/conversations` | JWT | Any | List conversations |
| POST | `/conversations` | JWT | Any | Start conversation |
| GET | `/conversations/:id` | JWT | Any | Get messages |
| POST | `/conversations/:id` | JWT | Any | Send message |
| PATCH | `/:id/read` | JWT | Any | Mark read |
| DELETE | `/:id` | JWT | Any | Delete for me |
| DELETE | `/:id/everyone` | JWT | Any | Delete for all |
| GET | `/unread-count` | JWT | Any | Unread count |
| GET | `/search` | JWT | Any | Search messages |
| GET | `/online-users` | JWT | Any | Online users |

### Schedule (`/api/schedule`)

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| GET | `/my/daily` | JWT | Any | Today's schedule |
| GET | `/my/weekly` | JWT | Any | Weekly schedule |
| GET | `/range` | JWT | Any | Date range |
| GET | `/section/:sectionId` | JWT | Any | Section schedule |
| GET | `/academic` | JWT | Any | Academic calendar |

### Exam Schedule (`/api/exams/schedule`)

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| GET | `/` | JWT | Any | List exams |
| GET | `/conflicts` | JWT | ADMIN, IT_ADMIN | Check conflicts |
| GET | `/:id` | JWT | Any | Exam details |
| POST | `/` | JWT | INSTRUCTOR, ADMIN, IT_ADMIN | Create |
| PUT | `/:id` | JWT | INSTRUCTOR, ADMIN, IT_ADMIN | Update |
| DELETE | `/:id` | JWT | INSTRUCTOR, ADMIN, IT_ADMIN | Delete |

### Calendar Events (`/api/calendar/events`)

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| GET | `/` | JWT | Any | List events |
| GET | `/:id` | JWT | Any | Event details |
| POST | `/` | JWT | Any | Create event |
| PUT | `/:id` | JWT | Owner/Admin | Update event |
| DELETE | `/:id` | JWT | Owner/Admin | Delete event |

### Calendar Integrations (`/api/calendar/integrations`)

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| GET | `/` | JWT | Any | List integrations |
| POST | `/connect` | JWT | Any | Connect calendar |
| POST | `/:id/sync` | JWT | Any | Manual sync |
| DELETE | `/:id` | JWT | Any | Disconnect |

### YouTube (`/youtube`)

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| GET | `/auth` | Public | — | Get OAuth URL |
| GET | `/callback` | Public | — | OAuth callback |
| POST | `/upload` | JWT | Any | Direct upload |

---

## 14. Data Relationships & Linking

### How Entities Connect

```
Campus
  └── Department (campusId → campus_id)
       └── Program (departmentId → department_id)
       └── Course (departmentId → department_id)
            └── CourseSection (courseId → course_id)
                 ├── CourseSchedule (sectionId → section_id)
                 ├── CourseEnrollment (sectionId → section_id, userId → user_id)
                 ├── CourseInstructor (sectionId → section_id, userId → user_id)
                 ├── CourseTA (sectionId → section_id, userId → user_id)
                 ├── LectureSectionLab (sectionId → section_id)
                 └── AttendanceSession (sectionId → section_id)
            └── CourseMaterial (courseId → course_id)
                 └── File (fileId → file_id) [optional]
            └── Assignment (courseId → course_id)
                 └── AssignmentSubmission (assignmentId, userId)
            └── Quiz (courseId → course_id)
                 └── QuizQuestion (quizId)
                 └── QuizAttempt (quizId, userId)
                      └── QuizAnswer (attemptId, questionId)
            └── Lab (courseId → course_id)
                 ├── LabInstruction (labId)
                 ├── LabSubmission (labId, userId)
                 └── LabAttendance (labId, userId)
            └── Grade (courseId, userId)
                 ├── links to Assignment (assignmentId)
                 ├── links to Quiz (quizId)
                 └── links to Lab (labId)
            └── Announcement (courseId)
            └── CourseChatThread (courseId → course_id)
                 └── ChatMessage (threadId)
            └── CommunityPost (courseId)
            └── ForumCategory (courseId)

User
  ├── Roles (via user_roles junction)
  ├── CourseEnrollment (as student)
  ├── CourseInstructor (as instructor)
  ├── CourseTA (as TA)
  ├── Grade (as student + as grader)
  ├── AssignmentSubmission (as submitter)
  ├── QuizAttempt (as quiz taker)
  ├── LabSubmission (as submitter)
  ├── AttendanceRecord (as student)
  ├── File (as uploader)
  ├── Message (as sender)
  ├── MessageParticipant (as participant)
  ├── Notification (as recipient)
  ├── Announcement (as author)
  ├── CommunityPost (as author)
  ├── CalendarEvent (as owner)
  └── Session (login sessions)
```

### Key Linking Patterns for Frontend

**1. Student → Their Courses:**
```
GET /api/enrollments/my-courses → returns [{sectionId, courseId, course: {...}}]
Use courseId for all course-specific API calls
```

**2. Instructor → Their Courses:**
```
GET /api/enrollments/course-instructors → returns sections they teach
Use sectionId/courseId for course management
```

**3. Course → All Content:**
```
courseId → GET /api/courses/:courseId/materials (lectures, videos, docs)
courseId → GET /api/assignments?courseId=X (assignments)
courseId → GET /quizzes?courseId=X (quizzes)
courseId → GET /api/labs?courseId=X (labs)
courseId → GET /api/discussions?courseId=X (discussions)
courseId → GET /api/grades?courseId=X (grades)
courseId → GET /api/announcements?courseId=X (announcements)
courseId → GET /api/courses/:courseId/structure (weekly structure)
```

**4. Grade → Source Entity:**
```
grade.gradeType tells you what it's for:
  "assignment" → grade.assignmentId → GET /api/assignments/:id
  "quiz"       → grade.quizId → GET /quizzes/:id
  "lab"        → grade.labId → GET /api/labs/:id
  "midterm"    → standalone grade
  "final"      → standalone grade
```

**5. Material → File or Video:**
```
material.materialType:
  "video"    → material.externalUrl (YouTube embed)
  "document" → material.fileId → GET /api/files/:fileId/download
  "link"     → material.externalUrl (external link)
  "file"     → material.fileId → GET /api/files/:fileId/download
```

**6. Notification → Related Entity:**
```
notification.relatedEntityType + notification.relatedEntityId:
  "assignment"   → navigate to /assignments/:id
  "quiz"         → navigate to /quizzes/:id
  "grade"        → navigate to /grades
  "announcement" → navigate to /announcements/:id
  "message"      → navigate to /messaging
```

---

## 15. Frontend Implementation Notes

### 15.1 Required Libraries

| Library | Purpose |
|---------|---------|
| Axios / Fetch | HTTP client for REST API |
| Socket.IO Client | WebSocket messaging |
| JWT-decode | Decode JWT to get user info/expiry |
| React/Angular/Vue | UI framework |
| Chart.js / Recharts | Grade distribution, attendance trends |
| React-Calendar / FullCalendar | Schedule/calendar views |
| React-Quill / TipTap | Rich text editor (announcements, discussions) |
| Dropzone / react-dropzone | File upload UI |

### 15.2 Error Handling

```javascript
// Standard error response from backend:
{
  "statusCode": 400 | 401 | 403 | 404 | 500,
  "message": "Error description" | ["validation error 1", "validation error 2"],
  "error": "Bad Request" | "Unauthorized" | "Forbidden" | "Not Found"
}

// Handle token expiry:
if (response.status === 401) {
  const refreshResult = await refreshToken();
  if (refreshResult.ok) {
    // Retry original request with new token
  } else {
    // Redirect to login
  }
}
```

### 15.3 Pagination Pattern

Most list endpoints support pagination:
```
GET /api/assignments?page=1&limit=10&courseId=5&status=published
Response: {
  "data": [...],
  "total": 50,
  "page": 1,
  "limit": 10,
  "totalPages": 5
}
```

### 15.4 Role-Based UI Rendering

```javascript
const userRoles = user.roles.map(r => r.roleName);
const isStudent = userRoles.includes('student');
const isInstructor = userRoles.includes('instructor');
const isTA = userRoles.includes('teaching_assistant');
const isAdmin = userRoles.includes('admin') || userRoles.includes('it_admin');

// Hide/show UI elements based on role
{isInstructor && <CreateAssignmentButton />}
{isStudent && <SubmitAssignmentButton />}
{(isInstructor || isTA) && <GradeSubmissionButton />}
```

### 15.5 File Upload Pattern (Multipart)

```javascript
// For all file uploads (assignments, materials, lab submissions):
const formData = new FormData();
formData.append('file', fileInputRef.current.files[0]);
// Add other fields as needed
formData.append('title', 'My Document');

const response = await axios.post(url, formData, {
  headers: {
    'Authorization': `Bearer ${token}`,
    // DO NOT manually set Content-Type — axios/fetch sets it with boundary
  },
  onUploadProgress: (progressEvent) => {
    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
    setUploadProgress(percent);
  }
});
```

### 15.6 Real-Time Updates Strategy

| Feature | Method | Details |
|---------|--------|---------|
| Messaging | WebSocket | Full real-time via Socket.IO |
| Notifications | Polling | `GET /api/notifications/unread-count` every 30s |
| Online status | WebSocket | `user_status` events from messaging gateway |
| Everything else | REST | Fetch on page load, refresh on action |

### 15.7 Known Backend Gaps (Frontend Workarounds)

| Gap | Impact on Frontend | Workaround |
|-----|-------------------|------------|
| No auto-notifications | Students won't know about new assignments/grades | Poll relevant endpoints or show "last updated" timestamps |
| Email verification bypassed | No email confirmation flow needed | Skip verification UI entirely |
| No student progress tracking | Can't show completion percentage | Calculate client-side from grades + submissions |
| No video watch analytics | Can't track who watched lectures | Could implement client-side tracking if needed |
| No course completion workflow | No "complete course" button | Not needed until graduation features are built |
| Calendar not auto-populated | Course schedules don't appear in personal calendar | Frontend could merge schedule + calendar data |
| Notifications not real-time | No WebSocket for notifications | Use polling (30s interval) |

---

*Document generated from EduVerse Backend v0.0.1 codebase analysis. All endpoints verified against source code.*

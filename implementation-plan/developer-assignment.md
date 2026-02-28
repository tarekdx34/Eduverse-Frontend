# Developer Assignment & Sprint Plan

## Overview

This document outlines how all backend implementation work is distributed across **3 developers** working in **parallel sprints**. Each sprint is designed so developers can work independently with minimal blocking dependencies.

### Conventions
- **Dev A** (Backend Developer 1)
- **Dev B** (Backend Developer 2)
- **Dev C** (Backend Developer 3)

### Priority Rules
1. Gamification, Payments, and AI are **last priority**
2. AI module integration is handled by a **separate team** — backend devs only create the integration endpoints/interfaces
3. Tasks & Reminders is separated from Gamification and done earlier
4. All modules follow the standard NestJS pattern: Entities → DTOs → Services → Controllers → Tests

---

## Sprint Overview

| Sprint | Focus | Dev A | Dev B | Dev C |
|--------|-------|-------|-------|-------|
| 1 | Core Academic | Assignments + Grades | Attendance + Quizzes | Labs + Notifications |
| 2 | Communication + Content | Messaging + Discussions | Announcements + Community | Schedule + Course Materials |
| 3 | Analytics + Admin | Analytics + Reports | User Management + Roles & Permissions | Tasks & Reminders + Search |
| 4 | System & IT + Advanced | Security & Audit + System Settings | Monitoring + Backup | Study Groups + Office Hours + Peer Review |
| 5 | Advanced (continued) | Live Sessions + Localization | Support & Feedback + Certificates | Voice & Transcription |
| 6 | Last Priority | Gamification | Payments | AI Integration (external team) |

---

## Sprint 1: Core Academic Operations 🔴 CRITICAL

> **Goal**: Build the foundational academic modules that ALL dashboards depend on.
> **Prerequisite**: Existing Courses, Enrollments, and Auth modules must be stable.
> **Blocking**: Sprint 2 and beyond depend on Sprint 1 completion.

### Dev A: Assignments Module + Grades Module

#### Assignments Module
- **Reference Doc**: [Phase 1 - Section 1.1](./phase-01-core-academic.md)
- **DB Tables**: `assignments`, `assignment_submissions`
- **Entities**: Assignment, AssignmentSubmission
- **Key Endpoints**:
  | Method | Endpoint | Description | Roles |
  |--------|----------|-------------|-------|
  | GET | `/api/assignments` | List assignments (filterable by course, section, status) | ALL |
  | POST | `/api/assignments` | Create assignment | INSTRUCTOR, TA |
  | GET | `/api/assignments/:id` | Get assignment details | ALL |
  | PATCH | `/api/assignments/:id` | Update assignment | INSTRUCTOR, TA |
  | DELETE | `/api/assignments/:id` | Delete assignment | INSTRUCTOR |
  | POST | `/api/assignments/:id/submit` | Submit assignment (file upload) | STUDENT |
  | GET | `/api/assignments/:id/submissions` | List submissions | INSTRUCTOR, TA |
  | GET | `/api/assignments/:id/submissions/my` | Get student's own submission | STUDENT |
  | PATCH | `/api/assignments/:id/submissions/:subId/grade` | Grade submission | INSTRUCTOR, TA |
  | PATCH | `/api/assignments/:id/submissions/:subId/feedback` | Add feedback | INSTRUCTOR, TA |

- **Business Logic**:
  - Validate due dates (cannot submit after deadline unless late submission allowed)
  - File upload integration with existing Files module
  - Auto-calculate submission stats (on time, late, missing)
  - Support different assignment types (individual, group, project)
  - Plagiarism check integration point (future)

- **Files to Create**:
  ```
  src/modules/assignments/
  ├── assignments.module.ts
  ├── entities/
  │   ├── assignment.entity.ts
  │   └── assignment-submission.entity.ts
  ├── dto/
  │   ├── create-assignment.dto.ts
  │   ├── update-assignment.dto.ts
  │   ├── submit-assignment.dto.ts
  │   ├── grade-submission.dto.ts
  │   └── assignment-query.dto.ts
  ├── enums/
  │   ├── assignment-type.enum.ts
  │   └── submission-status.enum.ts
  ├── controllers/
  │   └── assignments.controller.ts
  ├── services/
  │   └── assignments.service.ts
  └── exceptions/
      ├── assignment-not-found.exception.ts
      └── submission-deadline-passed.exception.ts
  ```

#### Grades Module
- **Reference Doc**: [Phase 1 - Section 1.2](./phase-01-core-academic.md)
- **DB Tables**: `grades`, `grade_components`, `rubrics`, `rubric_criteria`
- **Entities**: Grade, GradeComponent, Rubric, RubricCriteria
- **Key Endpoints**:
  | Method | Endpoint | Description | Roles |
  |--------|----------|-------------|-------|
  | GET | `/api/grades` | List grades (filter by student, course, section) | ALL |
  | GET | `/api/grades/my` | Student's own grades | STUDENT |
  | POST | `/api/grades` | Create/update grade | INSTRUCTOR, TA |
  | PUT | `/api/grades/:id` | Update grade | INSTRUCTOR, TA |
  | GET | `/api/grades/transcript/:studentId` | Full transcript | STUDENT, ADMIN |
  | GET | `/api/grades/gpa/:studentId` | GPA calculation | STUDENT, ADMIN |
  | GET | `/api/grades/distribution/:sectionId` | Grade distribution chart data | INSTRUCTOR, ADMIN |
  | GET | `/api/rubrics` | List rubrics | INSTRUCTOR, TA |
  | POST | `/api/rubrics` | Create rubric | INSTRUCTOR |
  | GET | `/api/rubrics/:id` | Get rubric with criteria | ALL |
  | PUT | `/api/rubrics/:id` | Update rubric | INSTRUCTOR |
  | DELETE | `/api/rubrics/:id` | Delete rubric | INSTRUCTOR |

- **Business Logic**:
  - GPA calculation (support different grading scales: 4.0, percentage, letter)
  - Grade component weighting (e.g., assignments 30%, quizzes 20%, final 50%)
  - Auto-calculate final grade from components
  - Grade history/audit trail
  - Transcript generation with cumulative GPA

- **Files to Create**:
  ```
  src/modules/grades/
  ├── grades.module.ts
  ├── entities/
  │   ├── grade.entity.ts
  │   ├── grade-component.entity.ts
  │   ├── rubric.entity.ts
  │   └── rubric-criteria.entity.ts
  ├── dto/
  │   ├── create-grade.dto.ts
  │   ├── update-grade.dto.ts
  │   ├── grade-query.dto.ts
  │   ├── create-rubric.dto.ts
  │   └── transcript-response.dto.ts
  ├── enums/
  │   └── grade-status.enum.ts
  ├── controllers/
  │   ├── grades.controller.ts
  │   └── rubrics.controller.ts
  ├── services/
  │   ├── grades.service.ts
  │   └── rubrics.service.ts
  └── exceptions/
      └── grade-not-found.exception.ts
  ```

---

### Dev B: Attendance Module + Quizzes Module

#### Attendance Module
- **Reference Doc**: [Phase 1 - Section 1.3](./phase-01-core-academic.md)
- **DB Tables**: `attendance_sessions`, `attendance_records`, `attendance_photos`, `ai_attendance_processing`, `face_recognition_data`
- **Entities**: AttendanceSession, AttendanceRecord, AttendancePhoto
- **Key Endpoints**:
  | Method | Endpoint | Description | Roles |
  |--------|----------|-------------|-------|
  | GET | `/api/attendance/sessions` | List attendance sessions | INSTRUCTOR, TA, ADMIN |
  | POST | `/api/attendance/sessions` | Create attendance session | INSTRUCTOR, TA |
  | GET | `/api/attendance/sessions/:id` | Get session with records | INSTRUCTOR, TA |
  | POST | `/api/attendance/records` | Mark attendance (single or batch) | INSTRUCTOR, TA |
  | PUT | `/api/attendance/records/:id` | Update attendance record | INSTRUCTOR, TA |
  | GET | `/api/attendance/by-course/:courseId` | Course attendance summary | INSTRUCTOR, TA, ADMIN |
  | GET | `/api/attendance/by-student/:studentId` | Student attendance summary | STUDENT, INSTRUCTOR, ADMIN |
  | GET | `/api/attendance/my` | Student's own attendance | STUDENT |
  | GET | `/api/attendance/summary` | Overall attendance stats | INSTRUCTOR, ADMIN |
  | POST | `/api/attendance/photos` | Upload attendance photo (for AI) | INSTRUCTOR, TA |
  | GET | `/api/attendance/report/:sectionId` | Attendance report for section | INSTRUCTOR, TA |
  | PATCH | `/api/attendance/sessions/:id/close` | Close attendance session | INSTRUCTOR, TA |

- **Business Logic**:
  - Attendance status: PRESENT, ABSENT, LATE, EXCUSED
  - Auto-close sessions after configured time
  - Calculate attendance percentage per student per course
  - Generate attendance reports (per course, per student, per date range)
  - Support QR code / location-based attendance (future integration point)
  - AI photo attendance processing integration point

- **Files to Create**:
  ```
  src/modules/attendance/
  ├── attendance.module.ts
  ├── entities/
  │   ├── attendance-session.entity.ts
  │   ├── attendance-record.entity.ts
  │   └── attendance-photo.entity.ts
  ├── dto/
  │   ├── create-session.dto.ts
  │   ├── mark-attendance.dto.ts
  │   ├── batch-attendance.dto.ts
  │   ├── attendance-query.dto.ts
  │   └── attendance-summary.dto.ts
  ├── enums/
  │   └── attendance-status.enum.ts
  ├── controllers/
  │   └── attendance.controller.ts
  ├── services/
  │   └── attendance.service.ts
  └── exceptions/
      ├── session-not-found.exception.ts
      └── session-closed.exception.ts
  ```

#### Quizzes Module
- **Reference Doc**: [Phase 1 - Section 1.4](./phase-01-core-academic.md)
- **DB Tables**: `quizzes`, `quiz_questions`, `quiz_attempts`, `quiz_answers`, `quiz_difficulty_levels`
- **Entities**: Quiz, QuizQuestion, QuizAttempt, QuizAnswer, QuizDifficultyLevel
- **Key Endpoints**:
  | Method | Endpoint | Description | Roles |
  |--------|----------|-------------|-------|
  | GET | `/api/quizzes` | List quizzes (by course/section) | ALL |
  | POST | `/api/quizzes` | Create quiz | INSTRUCTOR, TA |
  | GET | `/api/quizzes/:id` | Get quiz details | ALL |
  | PUT | `/api/quizzes/:id` | Update quiz | INSTRUCTOR, TA |
  | DELETE | `/api/quizzes/:id` | Delete quiz | INSTRUCTOR |
  | POST | `/api/quizzes/:id/publish` | Publish quiz | INSTRUCTOR |
  | GET | `/api/quizzes/:id/questions` | Get questions (no answers for students) | ALL |
  | POST | `/api/quizzes/:id/questions` | Add question | INSTRUCTOR, TA |
  | PUT | `/api/quizzes/:id/questions/:qId` | Update question | INSTRUCTOR, TA |
  | DELETE | `/api/quizzes/:id/questions/:qId` | Delete question | INSTRUCTOR, TA |
  | POST | `/api/quizzes/:id/attempt` | Start quiz attempt | STUDENT |
  | POST | `/api/quizzes/:id/submit` | Submit quiz answers | STUDENT |
  | GET | `/api/quizzes/:id/results` | Get quiz results (student's own) | STUDENT |
  | GET | `/api/quizzes/:id/attempts` | List all attempts (stats) | INSTRUCTOR, TA |
  | GET | `/api/quizzes/:id/analytics` | Quiz analytics (avg score, etc.) | INSTRUCTOR, TA |

- **Business Logic**:
  - Question types: MCQ, True/False, Short Answer, Essay, Fill-in-the-blank
  - Auto-grading for MCQ, True/False, Fill-in-the-blank
  - Manual grading queue for Short Answer, Essay
  - Time limits with auto-submit
  - Randomize question order option
  - Attempt limits (e.g., max 3 attempts)
  - Show/hide correct answers after submission (configurable)
  - Difficulty levels for adaptive quizzing (future)

- **Files to Create**:
  ```
  src/modules/quizzes/
  ├── quizzes.module.ts
  ├── entities/
  │   ├── quiz.entity.ts
  │   ├── quiz-question.entity.ts
  │   ├── quiz-attempt.entity.ts
  │   ├── quiz-answer.entity.ts
  │   └── quiz-difficulty-level.entity.ts
  ├── dto/
  │   ├── create-quiz.dto.ts
  │   ├── update-quiz.dto.ts
  │   ├── create-question.dto.ts
  │   ├── submit-quiz.dto.ts
  │   ├── quiz-query.dto.ts
  │   └── quiz-results.dto.ts
  ├── enums/
  │   ├── question-type.enum.ts
  │   ├── quiz-status.enum.ts
  │   └── attempt-status.enum.ts
  ├── controllers/
  │   └── quizzes.controller.ts
  ├── services/
  │   ├── quizzes.service.ts
  │   └── quiz-grading.service.ts
  └── exceptions/
      ├── quiz-not-found.exception.ts
      ├── attempt-limit-reached.exception.ts
      └── quiz-time-expired.exception.ts
  ```

---

### Dev C: Labs Module + Notifications Module

#### Labs Module
- **Reference Doc**: [Phase 1 - Section 1.5](./phase-01-core-academic.md)
- **DB Tables**: `labs`, `lab_submissions`, `lab_instructions`, `lab_attendance`
- **Entities**: Lab, LabSubmission, LabInstruction, LabAttendance
- **Key Endpoints**:
  | Method | Endpoint | Description | Roles |
  |--------|----------|-------------|-------|
  | GET | `/api/labs` | List labs (by course/section) | ALL |
  | POST | `/api/labs` | Create lab | INSTRUCTOR, TA |
  | GET | `/api/labs/:id` | Get lab details | ALL |
  | PUT | `/api/labs/:id` | Update lab | INSTRUCTOR, TA |
  | DELETE | `/api/labs/:id` | Delete lab | INSTRUCTOR |
  | GET | `/api/labs/:id/instructions` | Get lab instructions | ALL |
  | POST | `/api/labs/:id/instructions` | Add/update instructions | INSTRUCTOR, TA |
  | POST | `/api/labs/:id/submit` | Submit lab work | STUDENT |
  | GET | `/api/labs/:id/submissions` | List submissions | INSTRUCTOR, TA |
  | GET | `/api/labs/:id/submissions/my` | Student's own submission | STUDENT |
  | PATCH | `/api/labs/:id/submissions/:subId/grade` | Grade submission | INSTRUCTOR, TA |
  | POST | `/api/labs/:id/attendance` | Mark lab attendance | INSTRUCTOR, TA |
  | GET | `/api/labs/:id/attendance` | Get lab attendance | INSTRUCTOR, TA |
  | GET | `/api/labs/:id/resources` | Get lab resources/files | ALL |
  | POST | `/api/labs/:id/resources` | Upload lab resource | INSTRUCTOR, TA |

- **Business Logic**:
  - Lab types: regular, virtual, practical
  - Lab instructions support markdown/rich text
  - Lab submission with code files upload
  - Lab attendance separate from class attendance
  - Resource files linked to existing Files module
  - Pre-lab and post-lab assessments support

- **Files to Create**:
  ```
  src/modules/labs/
  ├── labs.module.ts
  ├── entities/
  │   ├── lab.entity.ts
  │   ├── lab-submission.entity.ts
  │   ├── lab-instruction.entity.ts
  │   └── lab-attendance.entity.ts
  ├── dto/
  │   ├── create-lab.dto.ts
  │   ├── update-lab.dto.ts
  │   ├── create-instruction.dto.ts
  │   ├── submit-lab.dto.ts
  │   ├── grade-submission.dto.ts
  │   └── lab-query.dto.ts
  ├── enums/
  │   ├── lab-type.enum.ts
  │   └── lab-submission-status.enum.ts
  ├── controllers/
  │   └── labs.controller.ts
  ├── services/
  │   └── labs.service.ts
  └── exceptions/
      └── lab-not-found.exception.ts
  ```

#### Notifications Module
- **Reference Doc**: [Phase 2 - Section 2.1](./phase-02-communication.md)
- **DB Tables**: `notifications`, `notification_preferences`, `scheduled_notifications`
- **Entities**: Notification, NotificationPreference, ScheduledNotification
- **Key Endpoints**:
  | Method | Endpoint | Description | Roles |
  |--------|----------|-------------|-------|
  | GET | `/api/notifications` | List user's notifications (paginated) | ALL |
  | GET | `/api/notifications/unread-count` | Get unread count | ALL |
  | PATCH | `/api/notifications/:id/read` | Mark as read | ALL |
  | PATCH | `/api/notifications/read-all` | Mark all as read | ALL |
  | DELETE | `/api/notifications/:id` | Delete notification | ALL |
  | GET | `/api/notifications/preferences` | Get notification preferences | ALL |
  | PUT | `/api/notifications/preferences` | Update preferences | ALL |

- **Business Logic**:
  - Notification types: ASSIGNMENT, GRADE, ANNOUNCEMENT, MESSAGE, SYSTEM, DEADLINE, ENROLLMENT
  - Real-time delivery via WebSocket (future) or polling
  - Notification preferences per type (email, in-app, push)
  - Scheduled notifications for deadlines
  - Batch create notifications (e.g., notify all students in a course)
  - **IMPORTANT**: Export `NotificationService` for other modules to inject and create notifications

- **Files to Create**:
  ```
  src/modules/notifications/
  ├── notifications.module.ts
  ├── entities/
  │   ├── notification.entity.ts
  │   ├── notification-preference.entity.ts
  │   └── scheduled-notification.entity.ts
  ├── dto/
  │   ├── create-notification.dto.ts
  │   ├── notification-query.dto.ts
  │   └── update-preferences.dto.ts
  ├── enums/
  │   └── notification-type.enum.ts
  ├── controllers/
  │   └── notifications.controller.ts
  ├── services/
  │   └── notifications.service.ts      // EXPORTED for other modules
  └── exceptions/
      └── notification-not-found.exception.ts
  ```

---

## Sprint 2: Communication + Content 🟠 HIGH

> **Goal**: Build all communication features and course content management.
> **Prerequisite**: Sprint 1 Notifications module must be complete (for notification integration).
> **Dependencies**: Messaging and Discussions can use Notifications service.

### Dev A: Messaging Module + Discussions Module

#### Messaging Module
- **Reference Doc**: [Phase 2 - Section 2.2](./phase-02-communication.md)
- **DB Tables**: `messages`, `message_participants`
- **Entities**: Message, MessageParticipant
- **Key Endpoints**:
  | Method | Endpoint | Description | Roles |
  |--------|----------|-------------|-------|
  | GET | `/api/messages/conversations` | List conversations | ALL |
  | GET | `/api/messages/conversations/:id` | Get conversation messages | ALL |
  | POST | `/api/messages` | Send message | ALL |
  | PATCH | `/api/messages/:id/read` | Mark as read | ALL |
  | DELETE | `/api/messages/:id` | Delete message | ALL |
  | GET | `/api/messages/search` | Search messages | ALL |
  | GET | `/api/messages/unread-count` | Unread message count | ALL |

- **Business Logic**:
  - Conversations are between 2+ participants
  - Support text, file attachments (via Files module)
  - Message read receipts
  - Trigger notifications on new message
  - Group messaging support

#### Discussions Module
- **Reference Doc**: [Phase 2 - Section 2.4](./phase-02-communication.md)
- **DB Tables**: `course_chat_threads`, `chat_messages`
- **Entities**: DiscussionThread, DiscussionMessage
- **Key Endpoints**:
  | Method | Endpoint | Description | Roles |
  |--------|----------|-------------|-------|
  | GET | `/api/discussions` | List discussions (by course) | ALL |
  | POST | `/api/discussions` | Create discussion thread | ALL |
  | GET | `/api/discussions/:id` | Get thread with replies | ALL |
  | POST | `/api/discussions/:id/reply` | Post reply | ALL |
  | PATCH | `/api/discussions/:id/pin` | Pin/unpin | INSTRUCTOR, TA |
  | PATCH | `/api/discussions/:id/close` | Close discussion | INSTRUCTOR, TA |
  | PATCH | `/api/discussions/:id/mark-answer` | Mark reply as answer | INSTRUCTOR, TA |
  | DELETE | `/api/discussions/:id` | Delete thread | INSTRUCTOR, ADMIN |

- **Business Logic**:
  - Threaded discussions per course/section
  - Pin important threads
  - Mark best answer
  - Notification on replies to own threads

---

### Dev B: Announcements Module + Community Module

#### Announcements Module
- **Reference Doc**: [Phase 2 - Section 2.3](./phase-02-communication.md)
- **DB Tables**: `announcements` (or uses messages with type annotation)
- **Entities**: Announcement
- **Key Endpoints**:
  | Method | Endpoint | Description | Roles |
  |--------|----------|-------------|-------|
  | GET | `/api/announcements` | List announcements | ALL |
  | POST | `/api/announcements` | Create announcement | INSTRUCTOR, TA, ADMIN |
  | GET | `/api/announcements/:id` | Get announcement | ALL |
  | PUT | `/api/announcements/:id` | Update announcement | INSTRUCTOR, TA, ADMIN |
  | DELETE | `/api/announcements/:id` | Delete announcement | INSTRUCTOR, ADMIN |
  | PATCH | `/api/announcements/:id/publish` | Publish announcement | INSTRUCTOR, ADMIN |
  | PATCH | `/api/announcements/:id/schedule` | Schedule for future | INSTRUCTOR, ADMIN |
  | PATCH | `/api/announcements/:id/pin` | Pin announcement | INSTRUCTOR, ADMIN |

- **Business Logic**:
  - Scope: course-level, department-level, or system-wide
  - Draft → Published → Archived workflow
  - Schedule for future publishing
  - Notify all relevant users on publish
  - Support attachments

#### Community Module
- **Reference Doc**: [Phase 2 - Section 2.5](./phase-02-communication.md)
- **DB Tables**: `community_posts`, `community_post_comments`, `community_post_reactions`, `forum_categories`
- **Entities**: CommunityPost, PostComment, PostReaction, ForumCategory
- **Key Endpoints**:
  | Method | Endpoint | Description | Roles |
  |--------|----------|-------------|-------|
  | GET | `/api/community/posts` | List posts (by category, course) | ALL |
  | POST | `/api/community/posts` | Create post | ALL |
  | GET | `/api/community/posts/:id` | Get post with comments | ALL |
  | PUT | `/api/community/posts/:id` | Update post | OWNER |
  | DELETE | `/api/community/posts/:id` | Delete post | OWNER, ADMIN |
  | POST | `/api/community/posts/:id/comment` | Add comment | ALL |
  | POST | `/api/community/posts/:id/react` | Add/toggle reaction | ALL |
  | PATCH | `/api/community/posts/:id/pin` | Pin post | INSTRUCTOR, ADMIN |
  | GET | `/api/community/categories` | List forum categories | ALL |
  | POST | `/api/community/categories` | Create category | ADMIN |

- **Business Logic**:
  - Post types: question, discussion, resource-share, poll
  - Reactions: like, helpful, insightful
  - Categorized forums per course
  - Moderation capabilities

---

### Dev C: Schedule Module (Enhanced) + Course Materials Module

#### Schedule Module (Enhanced)
- **Reference Doc**: [Phase 3](./phase-03-scheduling.md)
- **DB Tables**: `course_schedules`, `exam_schedules`, `calendar_events`, `calendar_integrations`
- **Entities**: ExamSchedule, CalendarEvent, CalendarIntegration (CourseSchedule already exists)
- **Key Endpoints**:
  | Method | Endpoint | Description | Roles |
  |--------|----------|-------------|-------|
  | GET | `/api/schedule/my/daily` | Today's schedule for current user | ALL |
  | GET | `/api/schedule/my/weekly` | Weekly schedule for current user | ALL |
  | GET | `/api/schedule/section/:sectionId` | Section schedule | ALL |
  | GET | `/api/calendar/events` | Calendar events (date range) | ALL |
  | POST | `/api/calendar/events` | Create calendar event | INSTRUCTOR, ADMIN |
  | PUT | `/api/calendar/events/:id` | Update event | INSTRUCTOR, ADMIN |
  | DELETE | `/api/calendar/events/:id` | Delete event | INSTRUCTOR, ADMIN |
  | GET | `/api/exams/schedule` | Exam schedule | ALL |
  | POST | `/api/exams/schedule` | Create exam schedule | INSTRUCTOR, ADMIN |
  | PUT | `/api/exams/schedule/:id` | Update exam schedule | INSTRUCTOR, ADMIN |
  | DELETE | `/api/exams/schedule/:id` | Delete exam schedule | INSTRUCTOR, ADMIN |
  | GET | `/api/calendar/academic` | Academic calendar | ALL |
  | GET | `/api/calendar/integrations` | External calendar integrations | ALL |
  | POST | `/api/calendar/integrations` | Add integration (Google, Outlook) | ALL |

- **Business Logic**:
  - Aggregate class schedules + exams + events into unified calendar
  - Conflict detection for exams
  - Academic calendar with semester milestones
  - External calendar sync (Google Calendar, Outlook)
  - Daily/weekly view aggregation per user role

#### Course Materials Module
- **Reference Doc**: [Phase 5](./phase-05-materials.md)
- **DB Tables**: `course_materials`, `lecture_sections_labs`
- **Entities**: CourseMaterial, LectureSectionLab
- **Key Endpoints**:
  | Method | Endpoint | Description | Roles |
  |--------|----------|-------------|-------|
  | GET | `/api/courses/:courseId/materials` | List course materials | ALL |
  | POST | `/api/courses/:courseId/materials` | Upload material | INSTRUCTOR, TA |
  | GET | `/api/materials/:id` | Get material details | ALL |
  | PUT | `/api/materials/:id` | Update material metadata | INSTRUCTOR, TA |
  | DELETE | `/api/materials/:id` | Delete material | INSTRUCTOR |
  | PATCH | `/api/materials/:id/visibility` | Toggle visibility | INSTRUCTOR, TA |
  | GET | `/api/materials/:id/download` | Download material | ALL |
  | GET | `/api/courses/:courseId/structure` | Get course content structure (lectures/sections/labs) | ALL |
  | POST | `/api/courses/:courseId/structure` | Create content structure | INSTRUCTOR |
  | PUT | `/api/courses/:courseId/structure/:id` | Update content structure | INSTRUCTOR |

- **Business Logic**:
  - Material types: PDF, video, document, presentation, link
  - Organize by weeks/modules/topics
  - Version tracking via Files module
  - Visibility control (visible/hidden from students)
  - Download tracking for analytics

---

## Sprint 3: Analytics + Administration 🟡 MEDIUM

> **Goal**: Build analytics, user management enhancements, and utility features.
> **Prerequisite**: Sprint 1 data must exist (assignments, grades, attendance) for meaningful analytics.

### Dev A: Analytics Module + Reports Module

#### Analytics Module
- **Reference Doc**: [Phase 4 - Section 4.1](./phase-04-analytics.md)
- **DB Tables**: `course_analytics`, `learning_analytics`, `performance_metrics`, `student_progress`, `weak_topics_analysis`, `activity_logs`
- **Entities**: CourseAnalytics, LearningAnalytics, PerformanceMetrics, StudentProgress, WeakTopicAnalysis, ActivityLog
- **Key Endpoints**:
  | Method | Endpoint | Description | Roles |
  |--------|----------|-------------|-------|
  | GET | `/api/analytics/dashboard` | Dashboard overview stats | ALL |
  | GET | `/api/analytics/courses/:courseId` | Course-level analytics | INSTRUCTOR, TA, ADMIN |
  | GET | `/api/analytics/students/:studentId` | Student analytics | STUDENT, INSTRUCTOR, ADMIN |
  | GET | `/api/analytics/performance` | Performance trends (time series) | ALL |
  | GET | `/api/analytics/engagement` | Engagement metrics | INSTRUCTOR, ADMIN |
  | GET | `/api/analytics/attendance-trends` | Attendance analytics | INSTRUCTOR, ADMIN |
  | GET | `/api/analytics/at-risk-students` | At-risk student identification | INSTRUCTOR, ADMIN |
  | GET | `/api/analytics/grade-distribution` | Grade distribution data | INSTRUCTOR, ADMIN |
  | GET | `/api/analytics/enrollment-trends` | Enrollment analytics | ADMIN |
  | GET | `/api/analytics/course-comparison` | Compare courses | ADMIN |
  | GET | `/api/analytics/weak-topics/:courseId` | Weak topics analysis | INSTRUCTOR, TA |

- **Business Logic**:
  - Real-time aggregation from existing data (grades, attendance, submissions)
  - Periodic snapshot generation (cron job) for historical trends
  - At-risk student detection algorithm (low attendance + low grades + missing submissions)
  - Dashboard stats differ by role (student sees own, instructor sees course, admin sees all)
  - Export data as JSON for frontend chart rendering

#### Reports Module
- **Reference Doc**: [Phase 4 - Section 4.2](./phase-04-analytics.md)
- **DB Tables**: `generated_reports`, `report_templates`, `export_history`
- **Entities**: GeneratedReport, ReportTemplate, ExportHistory
- **Key Endpoints**:
  | Method | Endpoint | Description | Roles |
  |--------|----------|-------------|-------|
  | GET | `/api/reports/templates` | List report templates | INSTRUCTOR, ADMIN |
  | POST | `/api/reports/generate` | Generate report | INSTRUCTOR, ADMIN |
  | GET | `/api/reports/:id` | Get report status/details | INSTRUCTOR, ADMIN |
  | GET | `/api/reports/:id/download` | Download report (PDF/CSV/Excel) | INSTRUCTOR, ADMIN |
  | GET | `/api/reports/history` | Export history | INSTRUCTOR, ADMIN |
  | DELETE | `/api/reports/:id` | Delete report | INSTRUCTOR, ADMIN |

- **Business Logic**:
  - Report types: attendance, grades, enrollment, performance, financial
  - Template-based generation
  - Export formats: PDF, CSV, Excel
  - Async generation for large reports (queue/job system)
  - Store generated reports for re-download

---

### Dev B: User Management (Enhanced) + Roles & Permissions

#### User Management Module (Enhanced)
- **Reference Doc**: [Phase 8 - Section 8.1](./phase-08-user-management.md)
- **NOTE**: The Auth module already has basic user management. This enhances it with:
  - Advanced user search and filtering
  - Bulk user operations (import, status change)
  - User profile enhancements (avatar, bio, social links)
  - User preferences (language, theme, notification settings)
  - User activity tracking

- **Key Additional Endpoints**:
  | Method | Endpoint | Description | Roles |
  |--------|----------|-------------|-------|
  | POST | `/api/admin/users/bulk-import` | Import users from CSV | ADMIN, IT_ADMIN |
  | POST | `/api/admin/users/bulk-status` | Bulk status change | ADMIN, IT_ADMIN |
  | GET | `/api/users/profile` | Get current user profile (full) | ALL |
  | PUT | `/api/users/profile` | Update profile (avatar, bio) | ALL |
  | GET | `/api/users/preferences` | Get user preferences | ALL |
  | PUT | `/api/users/preferences` | Update preferences | ALL |
  | PATCH | `/api/users/password` | Change password | ALL |
  | GET | `/api/admin/users/statistics` | User registration stats | ADMIN, IT_ADMIN |
  | GET | `/api/admin/users/export` | Export user list | ADMIN, IT_ADMIN |

- **Business Logic**:
  - Extend existing Auth module's UserManagementController
  - CSV import with validation and error reporting
  - Profile completeness tracking
  - User preferences stored in DB (language, theme, notification prefs)

#### Roles & Permissions Module (Enhanced)
- **Reference Doc**: [Phase 8 - Section 8.2](./phase-08-user-management.md)
- **NOTE**: Already partially implemented in Auth module. Enhancements:
  - Custom role creation
  - Fine-grained permission management
  - Permission inheritance
  - Role-based dashboard configuration

- **Key Additional Endpoints**:
  | Method | Endpoint | Description | Roles |
  |--------|----------|-------------|-------|
  | GET | `/api/admin/roles/with-users` | Roles with user counts | ADMIN, IT_ADMIN |
  | POST | `/api/admin/roles/custom` | Create custom role | IT_ADMIN |
  | PUT | `/api/admin/roles/:id/permissions/bulk` | Bulk permission update | IT_ADMIN |
  | GET | `/api/admin/permissions/matrix` | Permission matrix view | ADMIN, IT_ADMIN |

---

### Dev C: Tasks & Reminders Module + Search Module

#### Tasks & Reminders Module
- **Reference Doc**: [Phase 6 - Section 6.2](./phase-06-gamification.md)
- **DB Tables**: `student_tasks`, `task_completion`, `deadline_reminders`
- **Entities**: StudentTask, TaskCompletion, DeadlineReminder
- **Key Endpoints**:
  | Method | Endpoint | Description | Roles |
  |--------|----------|-------------|-------|
  | GET | `/api/tasks` | List user's tasks | ALL |
  | POST | `/api/tasks` | Create task | ALL |
  | PATCH | `/api/tasks/:id` | Update task | ALL |
  | PATCH | `/api/tasks/:id/complete` | Mark task complete | ALL |
  | DELETE | `/api/tasks/:id` | Delete task | ALL |
  | GET | `/api/tasks/upcoming` | Upcoming tasks/deadlines | ALL |
  | GET | `/api/reminders` | Get active reminders | ALL |
  | POST | `/api/reminders` | Create reminder | ALL |
  | DELETE | `/api/reminders/:id` | Delete reminder | ALL |

- **Business Logic**:
  - Auto-generate tasks from assignments/quizzes deadlines
  - Custom user-created tasks
  - Priority levels: HIGH, MEDIUM, LOW
  - Due date tracking
  - Integrate with Notifications for deadline reminders
  - Recurring tasks support

#### Search Module
- **Reference Doc**: [Phase 11 - Section 11.6](./phase-11-advanced.md)
- **DB Tables**: `search_history`, `search_index`
- **Entities**: SearchHistory, SearchIndex
- **Key Endpoints**:
  | Method | Endpoint | Description | Roles |
  |--------|----------|-------------|-------|
  | GET | `/api/search` | Global search across entities | ALL |
  | GET | `/api/search/courses` | Search courses | ALL |
  | GET | `/api/search/users` | Search users | ADMIN, INSTRUCTOR |
  | GET | `/api/search/materials` | Search materials | ALL |
  | GET | `/api/search/history` | Search history | ALL |
  | DELETE | `/api/search/history` | Clear search history | ALL |

- **Business Logic**:
  - Full-text search across courses, materials, discussions, announcements
  - Role-based result filtering (students see less than admins)
  - Search history per user
  - Autocomplete suggestions
  - MySQL FULLTEXT index support

---

## Sprint 4: System & IT Administration 🟡 MEDIUM

> **Goal**: Build system administration and advanced features for IT Admin dashboard.
> **Prerequisite**: Sprint 1-2 complete.

### Dev A: Security & Audit Module + System Settings Module

#### Security & Audit Module
- **Reference Doc**: [Phase 9 - Section 9.1](./phase-09-system-admin.md)
- **DB Tables**: `security_logs`, `audit_logs`, `activity_logs`, `login_attempts`
- **Entities**: SecurityLog, AuditLog, ActivityLog
- **Key Endpoints**:
  | Method | Endpoint | Description | Roles |
  |--------|----------|-------------|-------|
  | GET | `/api/security/logs` | Security event logs | ADMIN, IT_ADMIN |
  | GET | `/api/audit/logs` | Audit trail | ADMIN, IT_ADMIN |
  | GET | `/api/activity/logs` | User activity logs | ADMIN, IT_ADMIN |
  | GET | `/api/security/sessions` | Active sessions | ADMIN, IT_ADMIN |
  | DELETE | `/api/security/sessions/:id` | Revoke session | ADMIN, IT_ADMIN |
  | POST | `/api/security/block-ip` | Block IP address | IT_ADMIN |
  | GET | `/api/security/blocked-ips` | List blocked IPs | IT_ADMIN |
  | DELETE | `/api/security/blocked-ips/:id` | Unblock IP | IT_ADMIN |
  | GET | `/api/security/login-attempts` | Failed login attempts | ADMIN, IT_ADMIN |
  | GET | `/api/security/dashboard` | Security dashboard stats | ADMIN, IT_ADMIN |

#### System Settings Module
- **Reference Doc**: [Phase 9 - Section 9.2](./phase-09-system-admin.md)
- **DB Tables**: `system_settings`, `branding_settings`, `api_integrations`, `api_rate_limits`
- **Entities**: SystemSetting, BrandingSetting, ApiIntegration, ApiRateLimit
- **Key Endpoints**:
  | Method | Endpoint | Description | Roles |
  |--------|----------|-------------|-------|
  | GET | `/api/settings` | All system settings | ADMIN, IT_ADMIN |
  | PUT | `/api/settings` | Update settings | ADMIN, IT_ADMIN |
  | GET | `/api/settings/branding` | Branding configuration | ALL |
  | PUT | `/api/settings/branding` | Update branding | ADMIN, IT_ADMIN |
  | GET | `/api/integrations` | API integrations list | ADMIN, IT_ADMIN |
  | POST | `/api/integrations` | Add integration | IT_ADMIN |
  | PUT | `/api/integrations/:id` | Update integration | IT_ADMIN |
  | DELETE | `/api/integrations/:id` | Remove integration | IT_ADMIN |
  | GET | `/api/settings/rate-limits` | Rate limit config | IT_ADMIN |
  | PUT | `/api/settings/rate-limits` | Update rate limits | IT_ADMIN |

---

### Dev B: Monitoring Module + Backup Module

#### Monitoring Module
- **Reference Doc**: [Phase 9 - Section 9.3](./phase-09-system-admin.md)
- **DB Tables**: `server_monitoring`, `system_errors`, `ssl_certificates`
- **Entities**: ServerMonitoring, SystemError, SslCertificate
- **Key Endpoints**:
  | Method | Endpoint | Description | Roles |
  |--------|----------|-------------|-------|
  | GET | `/api/monitoring/servers` | Server status | IT_ADMIN |
  | GET | `/api/monitoring/health` | System health metrics | IT_ADMIN |
  | GET | `/api/monitoring/metrics` | Performance metrics (CPU, RAM, disk) | IT_ADMIN |
  | GET | `/api/errors` | Error logs (paginated, filterable) | IT_ADMIN |
  | PUT | `/api/errors/:id` | Update error status (resolved, ignored) | IT_ADMIN |
  | GET | `/api/errors/:id` | Error details with stack trace | IT_ADMIN |
  | GET | `/api/ssl/certificates` | SSL certificate status | IT_ADMIN |
  | POST | `/api/ssl/certificates` | Add SSL certificate | IT_ADMIN |
  | GET | `/api/monitoring/alerts` | System alerts | IT_ADMIN |
  | POST | `/api/monitoring/alerts` | Create alert rule | IT_ADMIN |
  | PUT | `/api/monitoring/alerts/:id` | Update alert rule | IT_ADMIN |
  | DELETE | `/api/monitoring/alerts/:id` | Delete alert rule | IT_ADMIN |

#### Backup Module
- **Reference Doc**: [Phase 9 - Section 9.4](./phase-09-system-admin.md)
- **DB Tables**: Uses system operations
- **Key Endpoints**:
  | Method | Endpoint | Description | Roles |
  |--------|----------|-------------|-------|
  | GET | `/api/backups` | List backups | ADMIN, IT_ADMIN |
  | POST | `/api/backups` | Create manual backup | ADMIN, IT_ADMIN |
  | POST | `/api/backups/:id/restore` | Restore from backup | IT_ADMIN |
  | DELETE | `/api/backups/:id` | Delete backup | IT_ADMIN |
  | GET | `/api/backups/schedule` | Get backup schedule | ADMIN, IT_ADMIN |
  | PUT | `/api/backups/schedule` | Set backup schedule | IT_ADMIN |
  | GET | `/api/backups/:id/download` | Download backup | IT_ADMIN |
  | GET | `/api/database/status` | Database status | IT_ADMIN |
  | GET | `/api/database/tables` | List tables with sizes | IT_ADMIN |
  | POST | `/api/database/optimize` | Optimize database | IT_ADMIN |

---

### Dev C: Study Groups + Office Hours + Peer Review

#### Study Groups Module
- **Reference Doc**: [Phase 11 - Section 11.1](./phase-11-advanced.md)
- **DB Tables**: `study_groups`, `study_group_members`
- **Entities**: StudyGroup, StudyGroupMember
- **Key Endpoints**:
  | Method | Endpoint | Description | Roles |
  |--------|----------|-------------|-------|
  | GET | `/api/study-groups` | List study groups | ALL |
  | POST | `/api/study-groups` | Create study group | ALL |
  | GET | `/api/study-groups/:id` | Get group details | ALL |
  | PUT | `/api/study-groups/:id` | Update group | OWNER |
  | DELETE | `/api/study-groups/:id` | Delete group | OWNER, ADMIN |
  | POST | `/api/study-groups/:id/join` | Join group | ALL |
  | DELETE | `/api/study-groups/:id/leave` | Leave group | ALL |
  | GET | `/api/study-groups/:id/members` | List members | ALL |

#### Office Hours Module
- **Reference Doc**: [Phase 11 - Section 11.3](./phase-11-advanced.md)
- **DB Tables**: `calendar_events` (with type=office_hours) or new `office_hours` table
- **Entities**: OfficeHour, OfficeHourBooking
- **Key Endpoints**:
  | Method | Endpoint | Description | Roles |
  |--------|----------|-------------|-------|
  | GET | `/api/office-hours` | List office hours | ALL |
  | POST | `/api/office-hours` | Create office hour slot | INSTRUCTOR, TA |
  | PUT | `/api/office-hours/:id` | Update slot | INSTRUCTOR, TA |
  | DELETE | `/api/office-hours/:id` | Delete slot | INSTRUCTOR, TA |
  | POST | `/api/office-hours/:id/book` | Book appointment | STUDENT |
  | DELETE | `/api/office-hours/:id/cancel` | Cancel booking | STUDENT |
  | GET | `/api/office-hours/my-bookings` | Student's bookings | STUDENT |
  | GET | `/api/office-hours/my-schedule` | Instructor/TA schedule | INSTRUCTOR, TA |

#### Peer Review Module
- **Reference Doc**: [Phase 11 - Section 11.2](./phase-11-advanced.md)
- **DB Tables**: `peer_reviews`
- **Entities**: PeerReview
- **Key Endpoints**:
  | Method | Endpoint | Description | Roles |
  |--------|----------|-------------|-------|
  | GET | `/api/peer-reviews` | List peer reviews | ALL |
  | POST | `/api/peer-reviews/assign` | Assign peer reviews | INSTRUCTOR |
  | GET | `/api/peer-reviews/:id` | Get review details | ALL |
  | POST | `/api/peer-reviews/:id/submit` | Submit review | STUDENT |
  | GET | `/api/peer-reviews/pending` | Pending reviews for current user | STUDENT |
  | GET | `/api/peer-reviews/received` | Reviews received | STUDENT |

---

## Sprint 5: Advanced Features (Continued) 🟢 LOWER

> **Goal**: Complete remaining advanced features.
> **Prerequisite**: Sprints 1-4 complete.

### Dev A: Live Sessions + Localization

#### Live Sessions Module
- **DB Tables**: `live_sessions`, `live_session_participants`
- **Endpoints**: CRUD for sessions, join/leave, recording management
- **Integration**: WebSocket for real-time, or link to external tools (Zoom, Teams)

#### Localization Module
- **DB Tables**: `content_translations`, `localization_strings`, `language_preferences`, `theme_preferences`
- **Endpoints**: CRUD translations, user language/theme preferences

### Dev B: Support & Feedback + Certificates

#### Support & Feedback Module
- **DB Tables**: `support_tickets`, `user_feedback`, `feedback_responses`
- **Endpoints**: CRUD tickets, submit feedback, respond to feedback
- **Business Logic**: Ticket priority/status workflow, assignment to staff

#### Certificates Module
- **DB Tables**: `certificates`
- **Endpoints**: Generate, list, download, verify certificates
- **Business Logic**: Auto-generate on course completion, PDF generation, verification QR code

### Dev C: Voice & Transcription Module

#### Voice & Transcription Module
- **DB Tables**: `voice_recordings`, `voice_transcriptions`, `image_text_extractions`
- **Endpoints**: Upload audio/image, get transcription/OCR results
- **Integration**: External speech-to-text API

---

## Sprint 6: Last Priority Modules 🔵 LAST

> **Goal**: Build gamification, payments, and prepare AI integration interfaces.
> **Note**: AI module is built by a separate team. Backend devs only create the integration layer.

### Dev A: Gamification Module

#### Gamification Module
- **Reference Doc**: [Phase 6 - Section 6.1](./phase-06-gamification.md)
- **DB Tables**: `achievements`, `badges`, `user_badges`, `user_levels`, `daily_streaks`, `xp_transactions`, `leaderboards`, `leaderboard_rankings`, `milestone_definitions`, `points_rules`, `rewards`, `reward_redemptions`
- **12 tables, complex module**
- **Key Endpoints**:
  | Method | Endpoint | Description | Roles |
  |--------|----------|-------------|-------|
  | GET | `/api/gamification/achievements` | List achievements | ALL |
  | GET | `/api/gamification/badges` | List badges | ALL |
  | GET | `/api/gamification/badges/my` | Student's earned badges | STUDENT |
  | GET | `/api/gamification/leaderboard` | Get leaderboard | ALL |
  | GET | `/api/gamification/profile` | User gamification profile | ALL |
  | GET | `/api/gamification/profile/:userId` | Specific user profile | ALL |
  | GET | `/api/gamification/streaks` | Daily streaks | ALL |
  | GET | `/api/gamification/rewards` | Available rewards | ALL |
  | POST | `/api/gamification/rewards/:id/redeem` | Redeem reward | STUDENT |
  | GET | `/api/gamification/xp-history` | XP transaction history | ALL |

- **Business Logic**:
  - XP awarded for: attendance, assignment submission, quiz completion, community participation
  - Level progression based on XP thresholds
  - Daily streaks tracking
  - Leaderboard rankings (weekly, monthly, all-time)
  - Achievement unlock conditions (configurable rules)
  - **Export `GamificationService`** for other modules to award XP

### Dev B: Payments Module

#### Payments Module
- **Reference Doc**: [Phase 10 - Section 10.1](./phase-10-payments.md)
- **DB Tables**: May need new payment tables
- **Key Endpoints**:
  | Method | Endpoint | Description | Roles |
  |--------|----------|-------------|-------|
  | GET | `/api/payments/history` | Payment history | STUDENT, ADMIN |
  | GET | `/api/payments/my` | Student's payment history | STUDENT |
  | GET | `/api/payments/revenue` | Revenue dashboard | ADMIN |
  | GET | `/api/payments/transactions` | Transaction list | ADMIN |
  | POST | `/api/payments/initiate` | Initiate payment | STUDENT |
  | POST | `/api/payments/refund/:id` | Process refund | ADMIN |
  | GET | `/api/payments/invoices` | List invoices | STUDENT, ADMIN |
  | GET | `/api/payments/invoices/:id/download` | Download invoice | STUDENT, ADMIN |

### Dev C: AI Integration Interfaces (For External Team)

#### AI Module Integration Layer
- **Reference Doc**: [Phase 7](./phase-07-ai.md)
- **NOTE**: Only build the NestJS module structure and interfaces. The actual AI logic is implemented by the external AI team.
- **What to build**:
  - Entity definitions for all AI tables
  - Controller endpoints (stubbed)
  - Service interfaces/abstract classes
  - DTOs for request/response
  - Configuration for AI provider credentials
- **The external AI team** will implement the actual service logic

---

## Cross-Sprint Dependencies

```
Sprint 1 ──────────────────────────────────────────────────┐
  ├── Assignments ──┐                                      │
  ├── Grades ───────┤                                      │
  ├── Attendance ───┼──→ Sprint 3: Analytics (needs data)  │
  ├── Quizzes ──────┤                                      │
  ├── Labs ─────────┘                                      │
  └── Notifications ──→ Sprint 2: All modules use it       │
                                                           │
Sprint 2 ──────────────────────────────────────────────────┤
  ├── Messaging                                            │
  ├── Discussions                                          │
  ├── Announcements                                        │
  ├── Community                                            │
  ├── Schedule (Enhanced)                                  │
  └── Course Materials                                     │
                                                           │
Sprint 3 ──────────────────────────────────────────────────┤
  ├── Analytics (depends on Sprint 1 data)                 │
  ├── Reports (depends on Analytics)                       │
  ├── User Management (Enhanced)                           │
  ├── Roles & Permissions (Enhanced)                       │
  ├── Tasks & Reminders                                    │
  └── Search                                               │
                                                           │
Sprint 4 ──────────────────────────────────────────────────┤
  ├── Security & Audit                                     │
  ├── System Settings                                      │
  ├── Monitoring                                           │
  ├── Backup                                               │
  ├── Study Groups                                         │
  ├── Office Hours                                         │
  └── Peer Review                                          │
                                                           │
Sprint 5 ──────────────────────────────────────────────────┤
  ├── Live Sessions                                        │
  ├── Localization                                         │
  ├── Support & Feedback                                   │
  ├── Certificates                                         │
  └── Voice & Transcription                                │
                                                           │
Sprint 6 (LAST) ───────────────────────────────────────────┘
  ├── Gamification
  ├── Payments
  └── AI Integration (external team)
```

---

## Shared Modules & Services

These services should be built as **shared/exported** so other modules can inject them:

| Service | Provided By | Used By |
|---------|-------------|---------|
| `NotificationService` | Notifications Module | Assignments, Messaging, Announcements, Grades, Attendance, etc. |
| `GamificationService` | Gamification Module | Assignments, Quizzes, Attendance, Community (for XP awards) |
| `FilesService` | Files Module (existing) | Assignments, Labs, Materials, Messaging |
| `EmailService` | Email Module (existing) | Auth, Notifications, Reminders |
| `CoursesService` | Courses Module (existing) | Materials, Analytics, Schedule, Assignments |
| `EnrollmentsService` | Enrollments Module (existing) | Grades, Analytics, Attendance |

---

## Frontend Coverage Verification ✅

All 5 dashboards are fully covered:

| Dashboard | Components | Coverage |
|-----------|------------|----------|
| **Admin** | 26 components | ✅ 100% — All mapped to existing or planned modules |
| **Instructor** | 40 components | ✅ 100% — All mapped to existing or planned modules |
| **Student** | 28 components | ✅ 100% — All mapped to existing or planned modules |
| **IT Admin** | 19 components | ✅ 100% — All mapped to existing or planned modules |
| **TA** | 20 components | ✅ 100% — All mapped to existing or planned modules |

### Already Covered by Existing Backend Modules
These frontend pages are already served by existing backend modules:
- Course Management pages → Courses module ✅
- Enrollment pages → Enrollments module ✅
- Department/Program pages → Campus module ✅
- Prerequisites pages → Courses module (prerequisites feature) ✅
- Multi-campus pages → Campus module ✅
- Login/Register/Profile → Auth module ✅
- File management → Files module ✅

### See Also
- [Dashboard-to-API Mapping](./dashboard-api-mapping.md) — Complete mapping of every frontend component to backend endpoints

---

## Getting Started Checklist

Before Sprint 1 begins, ensure:
- [ ] Database is set up with all 137 tables from `eduverse_db.sql`
- [ ] Existing modules (Auth, Campus, Courses, Enrollments, Files) are working
- [ ] Each developer has the repo cloned and can run `npm run start:dev`
- [ ] Agree on branch strategy (e.g., `feature/sprint1-assignments`, `feature/sprint1-attendance`)
- [ ] Set up PR review process (each dev reviews one other dev's PRs)

### Branch Naming Convention
```
feature/sprint{N}-{module-name}
Example: feature/sprint1-assignments
         feature/sprint1-attendance
         feature/sprint2-messaging
```

### Module Creation Checklist (for each new module)
1. [ ] Create module folder structure
2. [ ] Define TypeORM entities matching DB tables
3. [ ] Create DTOs with class-validator decorators
4. [ ] Implement service with business logic
5. [ ] Implement controller with Swagger decorators
6. [ ] Register module in `app.module.ts`
7. [ ] Test all endpoints via Postman/Swagger
8. [ ] Add Postman collection to `Documentation/` folder

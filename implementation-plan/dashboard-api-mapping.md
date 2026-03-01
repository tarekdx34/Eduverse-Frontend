# Frontend Dashboard to Backend API Mapping

This document maps every frontend dashboard component to the backend API endpoints it needs.

---

## Admin Dashboard (8 Active Sidebar Tabs)

> **Note**: 18+ component files exist in the Admin dashboard folder but are NOT active in the sidebar. Per project convention, non-sidebar components are considered deleted and not counted.

| Component | Tab | Required Backend Module | Key API Endpoints |
|-----------|-----|------------------------|-------------------|
| DashboardOverview | `dashboard` | Analytics | `GET /api/analytics/dashboard` |
| StudentManagementPage | `students` | User Management + Enrollments | `GET /api/users?role=student`, `POST /api/enrollments` |
| CourseManagementPage | `courses` | Courses (existing) | `GET/POST/PUT/DELETE /api/courses` |
| EnrollmentPeriodPage | `periods` | Enrollments (existing) | `GET/POST/PUT/DELETE /api/enrollment-periods` |
| AcademicCalendarPage | `calendar` | Schedule | `GET /api/calendar/events` |
| CommunicationPage | `communication` | Messaging | `GET/POST /api/messages` |
| MessagingChat | `chat` | Messaging | `GET/POST /api/messages/conversations` |
| DashboardProfileTab | `profile` | User Management | `GET/PUT /api/users/profile` |

---

## Instructor Dashboard (13 Active Sidebar Tabs)

> **Note**: Several components were removed from the sidebar (AnalyticsPage I10, AIToolsPage I10, LabsPage I11, SettingsPage I16, GlobalSearchPage I16, WaitlistTable I16, Materials tab I14, CommunicationPage). Non-sidebar components are considered deleted.

| Component | Tab | Required Backend Module | Key API Endpoints |
|-----------|-----|------------------------|-------------------|
| ModernDashboard | `dashboard` | Analytics | `GET /api/analytics/instructor-dashboard` |
| CoursesPage → CourseDetail | `courses` | Courses (existing) + Assignments + Materials | `GET /api/courses/:id`, `/api/assignments`, `/api/materials` |
| QuizzesPage | `quizzes` | Quizzes | `GET/POST/PUT/DELETE /api/quizzes` |
| AssignmentsList + AssignmentModal | `assignments` | Assignments | `GET/POST/PUT/DELETE /api/assignments` |
| SchedulePage | `schedule` | Schedule | `GET/POST/PUT/DELETE /api/schedule/events` |
| RosterTable | `roster` | Enrollments (existing) | `GET /api/enrollments?sectionId=X` |
| GradesTable + GradeModal | `grades` | Grades | `GET/PUT /api/grades` |
| AttendanceTable + AttendanceModal | `attendance` | Attendance | `GET/POST/PUT /api/attendance/sessions`, `/api/attendance/records` |
| AnnouncementsManager | `announcements` | Announcements | `GET/POST/PUT/DELETE /api/announcements` |
| NotificationsPage | `notifications` | Notifications | `GET /api/notifications`, `PATCH /api/notifications/:id/read` |
| DiscussionPage | `discussion` | Discussions | `GET /api/discussions`, `POST /api/discussions/:id/reply` |
| MessagingChat | `chat` | Messaging | `GET/POST /api/messages/conversations` |
| ProfilePage | `profile` | User Management | `GET/PUT /api/users/profile` |

---

## Student Dashboard (28 Components)

| Component | Required Backend Module | Key API Endpoints |
|-----------|------------------------|-------------------|
| ClassTab | Courses + Enrollments (existing) | `GET /api/courses/enrolled` |
| Assignments | Assignments | `GET /api/assignments` |
| AssignmentDetails | Assignments | `GET /api/assignments/:id`, `POST /api/assignments/:id/submit` |
| GradesTranscript | Grades | `GET /api/grades/transcript/:studentId` |
| GradeAnalysis | Analytics | `GET /api/analytics/student-dashboard/:studentId` |
| GpaChart | Grades | `GET /api/grades/gpa/:studentId` |
| AttendanceOverview | Attendance | `GET /api/attendance/student/:studentId` |
| CourseRegistration | Enrollments (existing) | `GET /api/courses/available`, `POST /api/enrollments` |
| QuizTaking | Quizzes | `GET /api/quizzes`, `POST /api/quizzes/:id/attempt`, `/submit` |
| ClassSchedule | Schedule | `GET /api/schedule/weekly` |
| DailySchedule | Schedule | `GET /api/schedule/daily` |
| WeeklySchedule | Schedule | `GET /api/schedule/weekly` |
| AcademicCalendar | Schedule | `GET /api/calendar/events` |
| MessagingChat | Messaging | `GET /api/messages/conversations`, `POST /api/messages` |
| NotificationCenter | Notifications | `GET /api/notifications`, `PATCH /api/notifications/:id/read` |
| PaymentHistory | Payments | `GET /api/payments/my` |
| Gamification | Gamification | `GET /api/gamification/profile`, `/leaderboard`, `/badges` |
| AIFeatures | AI | `POST /api/ai/summarize`, `/api/ai/flashcards` |
| AINotes | AI | `POST /api/ai/notes/generate`, `GET /api/ai/flashcards` |
| SettingsPreferences | User Management | `GET/PUT /api/users/preferences` |
| CourseCommunity | Community + Discussions | `GET /api/community/posts`, `GET /api/discussions` |
| LabInstructions | Labs | `GET /api/labs/:id`, `POST /api/labs/:id/submit` |
| SmartTodoReminder | Tasks & Reminders | `GET /api/tasks`, `GET /api/reminders` |
| GlobalSearch | Search | `GET /api/search` |

---

## IT Admin Dashboard (15 Active Sidebar Tabs)

> **Note**: AIManagementPage exists as a file but is NOT in the IT Admin sidebar — considered deleted.

| Component | Tab | Required Backend Module | Key API Endpoints |
|-----------|-----|------------------------|-------------------|
| DashboardOverview | `dashboard` | Monitoring + Analytics | `GET /api/monitoring/health`, `/api/analytics/dashboard` |
| UserManagementPage | `users` | User Management | `GET/POST/PUT/DELETE /api/users` |
| RoleManagementPage | `roles` | Roles & Permissions | `GET/PUT /api/roles` |
| SystemConfigPage | `config` | System Settings | `GET/PUT /api/settings` |
| IntegrationsPage | `integrations` | System Settings | `GET/PUT /api/integrations` |
| DatabasePage | `database` | Backup | `GET /api/database/stats`, `POST /api/backups/integrity-check` |
| MonitoringPage | `monitoring` | Monitoring | `GET /api/monitoring/servers`, `/api/monitoring/metrics` |
| SecurityPage | `security` | Security & Audit | `GET /api/security/logs`, `/api/security/threats` |
| SecurityLogsPage | `security-logs` | Security & Audit | `GET /api/security/logs`, `/api/audit/logs` |
| BackupCenterPage | `backup` | Backup | `GET/POST /api/backups`, `PUT /api/backups/schedule` |
| MultiCampusPage | `campus` | Campus (existing) | `GET/POST/PUT/DELETE /api/campuses` |
| AlertsManagementPage | `alerts` | Monitoring | `GET /api/monitoring/alerts` |
| CloudServicesPage | `cloud` | Monitoring | `GET /api/monitoring/servers` (cloud services) |
| ErrorLogsPage | `error-logs` | Monitoring | `GET /api/errors` |
| FeedbackSupportPage | `feedback` | Support & Feedback | `GET /api/support/tickets`, `/api/feedback` |
| MessagingChat | `chat` | Messaging | `GET/POST /api/messages/conversations` |
| DashboardProfileTab | `profile` | User Management | `GET/PUT /api/users/profile` |

---

## TA Dashboard (15 Active Sidebar Tabs)

> **Note**: Several components were removed from the sidebar (OfficeHoursPage T8, AttendancePage standalone T7 — now inside course tab per T4, CommunicationPage T11, UploadMaterialsPage). Non-sidebar components are considered deleted.

| Component | Tab | Required Backend Module | Key API Endpoints |
|-----------|-----|------------------------|-------------------|
| ModernDashboard | `dashboard` | Analytics | `GET /api/analytics/ta-dashboard` |
| AnalyticsPage + StudentPerformancePage | `analytics` | Analytics | `GET /api/analytics/performance`, `/engagement`, `/at-risk-students` |
| CoursesPage | `courses` | Courses (existing) | `GET /api/courses` (TA's assigned courses) |
| LabsPage | `labs` | Labs | `GET/POST/PUT/DELETE /api/labs` |
| QuizzesPage | `quizzes` | Quizzes | `GET/POST/PUT/DELETE /api/quizzes` |
| LabResourcesPage | `lab-resources` | Labs + Materials | `GET /api/labs/:id/instructions`, `/api/materials` |
| GradingPage | `grading` | Grades + Assignments | `GET /api/assignments/:id/submissions`, `PATCH /:subId/grade` |
| StudentPerformancePage | `students` | Analytics | `GET /api/analytics/at-risk-students` |
| SchedulePage | `schedule` | Schedule | `GET /api/schedule/events` |
| AnnouncementsPage | `announcements` | Announcements | `GET/POST /api/announcements` |
| NotificationsPage | `notifications` | Notifications | `GET /api/notifications` |
| DiscussionPage | `discussion` | Discussions | `GET /api/discussions`, `POST /api/discussions/:id/reply` |
| MessagingChat | `chat` | Messaging | `GET/POST /api/messages/conversations` |
| AIAssistantPage | `ai-assistant` | AI | `POST /api/ai/chatbot/conversations`, `POST /api/ai/grade` |
| DashboardProfileTab | `profile` | User Management | `GET/PUT /api/users/profile` |

---

## Summary: Module Usage Across Dashboards

| Backend Module | Admin | Instructor | Student | IT Admin | TA |
|---------------|-------|------------|---------|----------|-----|
| Auth (existing) ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Campus (existing) ✅ | ✅ | | | ✅ | |
| Courses (existing) ✅ | ✅ | ✅ | ✅ | | ✅ |
| Enrollments (existing) ✅ | ✅ | ✅ | ✅ | | |
| Files (existing) ✅ | | ✅ | | | ✅ |
| **Assignments** | ✅ | ✅ | ✅ | | ✅ |
| **Grades** | ✅ | ✅ | ✅ | | ✅ |
| **Attendance** | | ✅ | ✅ | | |
| **Quizzes** | | ✅ | ✅ | | ✅ |
| **Labs** | | | ✅ | | ✅ |
| **Notifications** | | ✅ | ✅ | | ✅ |
| **Messaging** | ✅ | ✅ | ✅ | | ✅ |
| **Announcements** | | ✅ | | | ✅ |
| **Discussions** | | ✅ | ✅ | | ✅ |
| **Community** | | | ✅ | | |
| **Schedule** | ✅ | ✅ | ✅ | | ✅ |
| **Analytics** | ✅ | ✅ | ✅ | | ✅ |
| **Reports** | | | | | |
| **Course Materials** | | | | | ✅ |
| **User Management** | ✅ | ✅ | ✅ | ✅ | |
| **Roles & Permissions** | | | | ✅ | |
| **Gamification** | | | ✅ | | |
| **Tasks & Reminders** | | | ✅ | | |
| **AI** | | | ✅ | | ✅ |
| **Security & Audit** | | | | ✅ | |
| **System Settings** | | | | ✅ | |
| **Monitoring** | | | | ✅ | |
| **Backup** | | | | ✅ | |
| **Payments** | | | ✅ | | |
| **Certificates** | | | ✅ | | |
| **Search** | | | | | |
| **Office Hours** | ✅ | ✅ | | ✅ | |
| **Support & Feedback** | | | | ✅ | |

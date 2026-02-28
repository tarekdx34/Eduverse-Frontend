# Frontend Dashboard to Backend API Mapping

This document maps every frontend dashboard component to the backend API endpoints it needs.

---

## Admin Dashboard (26 Components)

| Component | Required Backend Module | Key API Endpoints |
|-----------|------------------------|-------------------|
| DashboardOverview | Analytics | `GET /api/analytics/dashboard` |
| UserManagementPage | User Management | `GET/POST/PUT/DELETE /api/users` |
| CourseManagementPage | Courses (existing) | `GET/POST/PUT/DELETE /api/courses` |
| DepartmentManagementPage | Campus (existing) | `GET/POST/PUT/DELETE /api/departments` |
| StudentManagementPage | User Management + Enrollments | `GET /api/users?role=student`, `POST /api/enrollments` |
| AttendanceManagementPage | Attendance | `GET /api/attendance/summary`, `/api/attendance/trends` |
| ScheduleManagementPage | Schedule | `GET/POST/PUT/DELETE /api/schedule/events`, `/api/exams` |
| EnrollmentPeriodPage | Enrollments (existing) | `GET/POST/PUT/DELETE /api/enrollment-periods` |
| RoleManagementPage | Roles & Permissions | `GET/PUT /api/roles`, `PUT /api/roles/:id/permissions` |
| AnalyticsReportsPage | Analytics + Reports | `GET /api/analytics/*`, `POST /api/reports/generate` |
| PaymentManagementPage | Payments | `GET /api/payments/revenue`, `/api/payments/transactions` |
| SecurityLogsPage | Security & Audit | `GET /api/security/logs`, `/api/audit/logs` |
| SettingsHubPage | System Settings | `GET/PUT /api/settings` |
| AcademicCalendarPage | Schedule | `GET /api/calendar/events` |
| AdminNotificationsPage | Notifications + Announcements | `POST /api/announcements`, `POST /api/notifications/send` |
| AIInsightsPage | AI | `GET /api/ai/usage-stats` |
| BackupCenterPage | Backup | `GET/POST /api/backups` |
| CommunicationPage | Messaging | `GET/POST /api/messages` |
| ExamSchedulePage | Schedule | `GET/POST /api/exams` |
| FeedbackSupportPage | Support & Feedback | `GET /api/support/tickets`, `/api/feedback` |
| GlobalSearchPage | Search | `GET /api/search` |
| PrerequisitesManagementPage | Courses (existing) | `GET/POST/DELETE /api/courses/:id/prerequisites` |
| StaffAssignmentPage | Enrollments (existing) | `POST /api/course-instructors`, `/api/course-tas` |
| SystemConfigPage | System Settings | `GET/PUT /api/settings` |

---

## Instructor Dashboard (40 Components)

| Component | Required Backend Module | Key API Endpoints |
|-----------|------------------------|-------------------|
| ModernDashboard | Analytics | `GET /api/analytics/instructor-dashboard` |
| CoursesPage | Courses (existing) | `GET/POST/PUT/DELETE /api/courses` |
| CourseDetail | Courses + Materials + Assignments | `GET /api/courses/:id`, `/api/materials`, `/api/assignments` |
| AssignmentsList | Assignments | `GET/POST/PUT/DELETE /api/assignments` |
| AssignmentModal | Assignments | `POST/PUT /api/assignments` |
| GradesTable | Grades | `GET/PUT /api/grades` |
| GradeModal | Grades | `PUT /api/grades/:id` |
| AttendanceTable | Attendance | `GET/POST/PUT /api/attendance/sessions`, `/api/attendance/records` |
| AttendanceModal | Attendance | `POST /api/attendance/sessions/:id/records` |
| QuizzesPage | Quizzes | `GET/POST/PUT/DELETE /api/quizzes` |
| LabsPage | Labs | `GET/POST/PUT/DELETE /api/labs` |
| SchedulePage | Schedule | `GET/POST/PUT/DELETE /api/schedule/events` |
| AnalyticsPage | Analytics | `GET /api/analytics/performance`, `/engagement`, `/attendance` |
| AnnouncementsManager | Announcements | `GET/POST/PUT/DELETE /api/announcements` |
| CommunicationPage | Messaging + Announcements | `GET/POST /api/messages`, `/api/announcements` |
| UploadMaterialsPage | Course Materials | `POST /api/materials/upload`, `GET /api/materials` |
| DiscussionPage | Discussions | `GET /api/discussions`, `POST /api/discussions/:id/reply` |
| ReportsAnalytics | Analytics + Reports | `GET /api/analytics/*`, `POST /api/reports/generate` |
| SettingsPage | User Management | `GET/PUT /api/users/profile`, `/api/users/preferences` |
| NotificationsPage | Notifications | `GET /api/notifications`, `PATCH /api/notifications/:id/read` |
| AIToolsPage | AI | `POST /api/ai/summarize`, `/api/ai/quiz/generate` |
| ProfilePage | User Management | `GET/PUT /api/users/profile` |
| GlobalSearchPage | Search | `GET /api/search` |
| MessagesPanel | Messaging | `GET /api/messages/conversations` |
| RosterTable | Enrollments (existing) | `GET /api/enrollments?sectionId=X` |
| WaitlistTable | Enrollments (existing) | `GET /api/enrollments?status=waitlisted` |

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

## IT Admin Dashboard (19 Components)

| Component | Required Backend Module | Key API Endpoints |
|-----------|------------------------|-------------------|
| DashboardOverview | Monitoring + Analytics | `GET /api/monitoring/health`, `/api/analytics/dashboard` |
| UserManagementPage | User Management | `GET/POST/PUT/DELETE /api/users` |
| SecurityPage | Security & Audit | `GET /api/security/logs`, `/api/security/threats` |
| SecurityLogsPage | Security & Audit | `GET /api/security/logs`, `/api/audit/logs` |
| MonitoringPage | Monitoring | `GET /api/monitoring/servers`, `/api/monitoring/metrics` |
| BackupCenterPage | Backup | `GET/POST /api/backups`, `PUT /api/backups/schedule` |
| SystemConfigPage | System Settings | `GET/PUT /api/settings` |
| DatabasePage | Backup | `GET /api/database/stats`, `POST /api/backups/integrity-check` |
| IntegrationsPage | System Settings | `GET/PUT /api/integrations` |
| AIManagementPage | AI | `GET /api/ai/models`, `GET /api/ai/usage-stats` |
| MultiCampusPage | Campus (existing) | `GET/POST/PUT/DELETE /api/campuses` |
| CloudServicesPage | Monitoring | `GET /api/monitoring/servers` (cloud services) |
| ErrorLogsPage | Monitoring | `GET /api/errors` |
| RoleManagementPage | Roles & Permissions | `GET/PUT /api/roles` |
| AlertsManagementPage | Monitoring | `GET /api/monitoring/alerts` |
| FeedbackSupportPage | Support & Feedback | `GET /api/support/tickets`, `/api/feedback` |

---

## TA Dashboard (20 Components)

| Component | Required Backend Module | Key API Endpoints |
|-----------|------------------------|-------------------|
| ModernDashboard | Analytics | `GET /api/analytics/ta-dashboard` |
| CoursesPage | Courses (existing) | `GET /api/courses` (TA's assigned courses) |
| GradingPage | Grades + Assignments | `GET /api/assignments/:id/submissions`, `PATCH /:subId/grade` |
| AttendancePage | Attendance | `GET/POST /api/attendance/sessions`, `/records` |
| QuizzesPage | Quizzes | `GET/POST/PUT/DELETE /api/quizzes` |
| LabsPage | Labs | `GET/POST/PUT/DELETE /api/labs` |
| DiscussionPage | Discussions | `GET /api/discussions`, `POST /api/discussions/:id/reply` |
| SchedulePage | Schedule | `GET /api/schedule/events` |
| CommunicationPage | Messaging | `GET/POST /api/messages` |
| AnalyticsPage | Analytics | `GET /api/analytics/performance`, `/engagement` |
| OfficeHoursPage | Office Hours | `GET/POST /api/office-hours/slots`, `/appointments` |
| UploadMaterialsPage | Course Materials | `POST /api/materials/upload`, `GET /api/materials` |
| NotificationsPage | Notifications | `GET /api/notifications` |
| AnnouncementsPage | Announcements | `GET/POST /api/announcements` |
| AIAssistantPage | AI | `POST /api/ai/chatbot/conversations`, `POST /api/ai/grade` |
| StudentPerformancePage | Analytics | `GET /api/analytics/at-risk-students` |
| LabResourcesPage | Labs + Materials | `GET /api/labs/:id/instructions`, `/api/materials` |

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
| **Attendance** | ✅ | ✅ | ✅ | | ✅ |
| **Quizzes** | | ✅ | ✅ | | ✅ |
| **Labs** | | ✅ | ✅ | | ✅ |
| **Notifications** | ✅ | ✅ | ✅ | | ✅ |
| **Messaging** | ✅ | ✅ | ✅ | | ✅ |
| **Announcements** | ✅ | ✅ | | | ✅ |
| **Discussions** | | ✅ | ✅ | | ✅ |
| **Community** | | | ✅ | | |
| **Schedule** | ✅ | ✅ | ✅ | | ✅ |
| **Analytics** | ✅ | ✅ | ✅ | | ✅ |
| **Reports** | ✅ | ✅ | | | |
| **Course Materials** | | ✅ | | | ✅ |
| **User Management** | ✅ | ✅ | ✅ | ✅ | |
| **Roles & Permissions** | ✅ | | | ✅ | |
| **Gamification** | | | ✅ | | |
| **Tasks & Reminders** | | | ✅ | | |
| **AI** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Security & Audit** | ✅ | | | ✅ | |
| **System Settings** | ✅ | | | ✅ | |
| **Monitoring** | | | | ✅ | |
| **Backup** | ✅ | | | ✅ | |
| **Payments** | ✅ | | ✅ | | |
| **Certificates** | | | ✅ | | |
| **Search** | ✅ | ✅ | ✅ | | |
| **Office Hours** | | | | | ✅ |
| **Support & Feedback** | ✅ | | | ✅ | |

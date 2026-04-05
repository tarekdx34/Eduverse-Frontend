# Feature Specification: Wire Dashboard Modules

**Feature Branch**: `001-wire-dashboard-modules`  
**Created**: 2026-03-18  
**Status**: Clarified  
**Input**: Wire Labs, Assignments, and Quizzes across Student, Instructor, and TA dashboards to live NestJS backend

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Student Views and Submits Assignments (Priority: P1)

As a student, I need to view my assignments across all enrolled courses, see their status and deadlines, and submit my work (text or file uploads) so that I can complete my coursework on time.

**Why this priority**: Assignments are the primary graded work for most courses. Students cannot progress academically without this functionality.

**Independent Test**: Can be fully tested by logging in as a student, viewing the assignments list, filtering by status, opening an assignment, and submitting work. Delivers core academic workflow value.

**Acceptance Scenarios**:

1. **Given** a student is logged in, **When** they navigate to Assignments, **Then** they see all assignments from enrolled courses with title, course name, due date, and status
2. **Given** an assignment is pending, **When** the student opens it, **Then** they see full instructions, rubric, and submission options
3. **Given** an assignment accepts file uploads, **When** the student attaches a file and submits, **Then** the file is uploaded and submission status changes to "submitted"
4. **Given** an assignment accepts text submissions, **When** the student enters text and submits, **Then** the submission is recorded successfully
5. **Given** a submission is graded, **When** the student views the assignment, **Then** they see their score and instructor feedback
6. **Given** an API error occurs during submission, **When** the upload fails, **Then** a toast notification explains the error and the form retains entered data

---

### User Story 2 - Student Takes Quizzes (Priority: P1)

As a student, I need to view available quizzes, start timed attempts, answer questions, submit my responses, and see my results so that I can complete assessments and track my progress.

**Why this priority**: Quizzes are high-stakes assessments with time constraints. The timer functionality and attempt limits make this critical for academic integrity.

**Independent Test**: Can be fully tested by starting a quiz, answering questions under timer, submitting, and viewing score. Delivers assessment value.

**Acceptance Scenarios**:

1. **Given** a student views the quiz list, **When** quizzes are available, **Then** they see quiz title, course, duration, attempt count remaining, and availability window
2. **Given** a quiz has `timeLimitMinutes` set, **When** the student starts an attempt, **Then** a countdown timer is displayed and enforced
3. **Given** an attempt is in progress, **When** the student answers MCQ questions, **Then** answers are tracked and can be changed before submission
4. **Given** the timer expires, **When** auto-submit triggers, **Then** all answered questions are submitted and the attempt is recorded
5. **Given** a quiz is submitted, **When** `showAnswersAfter` allows, **Then** the student sees their score, correct answers (if allowed), and any feedback
6. **Given** the student has exhausted `maxAttempts`, **When** they try to start a new attempt, **Then** the system prevents it with a clear message

---

### User Story 3 - Student Completes Labs (Priority: P2)

As a student, I need to view lab assignments, read step-by-step instructions, and submit my lab work (reports or files) so that I can complete practical coursework.

**Why this priority**: Labs are essential for hands-on learning but typically less frequent than assignments. Builds on similar submission patterns.

**Independent Test**: Can be fully tested by viewing a lab, reading instructions, and submitting a lab report. Delivers lab workflow value.

**Acceptance Scenarios**:

1. **Given** a student navigates to Labs, **When** labs exist for enrolled courses, **Then** they see lab title, course, due date, and submission status
2. **Given** a lab is selected, **When** it has instructions, **Then** the student sees ordered instruction steps
3. **Given** a lab accepts submissions, **When** the student uploads a file and/or enters text, **Then** the submission is recorded
4. **Given** a lab submission is graded, **When** the student views it, **Then** they see their score and feedback

---

### User Story 4 - Instructor Manages Assignments (Priority: P1)

As an instructor, I need to create, edit, and delete assignments, set due dates and scoring, view all submissions, and grade student work so that I can assess my students effectively.

**Why this priority**: Instructors drive the academic workflow. Without assignment management, students have nothing to submit.

**Independent Test**: Can be fully tested by creating an assignment, viewing submissions, and grading one. Delivers full grading workflow.

**Acceptance Scenarios**:

1. **Given** an instructor is on Assignments page, **When** they click Create, **Then** a modal opens with fields for title, description, due date, max score, submission type, late penalty settings
2. **Given** valid assignment data is entered, **When** the instructor saves, **Then** the assignment is created via API and appears in the list
3. **Given** an assignment exists, **When** the instructor edits it, **Then** the modal pre-fills with current values and saves updates
4. **Given** an assignment has submissions, **When** the instructor clicks View Submissions, **Then** they see a list of all submissions with student name, submission time, and status
5. **Given** a submission is selected, **When** the instructor enters a score and feedback, **Then** the grade is saved and the student can view it
6. **Given** an instructor deletes an assignment, **When** confirmed, **Then** the assignment is soft-deleted and removed from the list

---

### User Story 5 - Instructor Manages Quizzes (Priority: P2)

As an instructor, I need to create quizzes with various question types, set time limits and attempt restrictions, view student attempts, and grade essay/short-answer questions so that I can assess student knowledge.

**Why this priority**: Quizzes require more complex setup (questions, options, correct answers) but share patterns with assignments.

**Independent Test**: Can be fully tested by creating a quiz with questions, viewing attempts, and grading one. Delivers quiz management value.

**Acceptance Scenarios**:

1. **Given** an instructor creates a quiz, **When** they fill in title, course, duration, max attempts, passing score, **Then** the quiz is saved via API
2. **Given** a quiz exists, **When** the instructor adds a question, **Then** they can specify type (MCQ, true/false, short answer, essay), options, correct answer, and points
3. **Given** questions exist, **When** the instructor reorders them, **Then** the new order is saved
4. **Given** students have submitted attempts, **When** the instructor views attempts, **Then** they see student name, score (if auto-graded), status, and time taken
5. **Given** an attempt has essay questions, **When** the instructor grades manually, **Then** they assign points and feedback per question

---

### User Story 6 - Instructor Manages Labs (Priority: P2)

As an instructor, I need to create labs, add instructions, view submissions, and grade student lab work so that I can manage practical coursework.

**Why this priority**: Labs follow similar CRUD patterns but add instruction management complexity.

**Independent Test**: Can be fully tested by creating a lab with instructions, viewing submissions, and grading. Delivers lab management value.

**Acceptance Scenarios**:

1. **Given** an instructor is on Labs page, **When** they create a lab, **Then** they enter title, course, due date, max score, and description
2. **Given** a lab exists, **When** the instructor adds instructions, **Then** instructions appear in order with text and optional file attachments
3. **Given** students have submitted, **When** the instructor views submissions, **Then** they see student name, submission time, and current status
4. **Given** a submission is selected, **When** the instructor grades it, **Then** they can update status (graded/returned/resubmit) and provide feedback

---

### User Story 7 - TA Grades Submissions (Priority: P2)

As a teaching assistant, I need to view assignments, quizzes, and labs for my assigned courses, grade submissions, and provide feedback, but I should not be able to create or delete content.

**Why this priority**: TAs extend instructor capacity for grading but must have restricted permissions to maintain course integrity.

**Independent Test**: Can be fully tested by logging in as TA, viewing submissions for assigned courses, and grading. Verifies role restrictions work.

**Acceptance Scenarios**:

1. **Given** a TA is logged in, **When** they view Assignments, **Then** they see only assignments from their assigned courses
2. **Given** a TA views submissions, **When** a submission is pending grading, **Then** they can assign score and feedback
3. **Given** a TA is on the Quizzes page, **When** viewing the UI, **Then** Create and Delete buttons are hidden or disabled
4. **Given** a TA tries to access an instructor-only endpoint via URL manipulation, **When** the API rejects the request, **Then** an appropriate error message is shown
5. **Given** a TA grades a quiz attempt with essay questions, **When** they submit grades, **Then** the grades are saved successfully

---

### Edge Cases

- What happens when a student submits after the due date? → Late submission flag set, penalty applied if configured
- What happens when a quiz timer expires mid-question? → Auto-submit with all answered questions, unanswered marked as skipped
- What happens when file upload fails due to network error? → Toast notification with retry option, form state preserved
- What happens when a student tries to start a quiz with 0 attempts remaining? → Start button disabled with "No attempts remaining" message
- What happens when an instructor deletes an assignment with existing submissions? → Soft delete, submissions preserved for record-keeping
- What happens when the API returns an empty list? → Display empty state with helpful message (e.g., "No assignments yet")
- How does the system handle concurrent grading by multiple TAs? → Last-write-wins with optimistic locking (backend handles conflicts)

## Requirements _(mandatory)_

### Functional Requirements

**Service Layer**

- **FR-001**: System MUST audit and complete `assignmentService.ts` with all missing methods matching backend endpoints
- **FR-002**: System MUST audit and complete `quizService.ts` with all missing methods matching backend endpoints
- **FR-003**: System MUST audit and complete `labService.ts` with all missing methods matching backend endpoints
- **FR-004**: All API calls MUST use the existing axios client from `src/services/api/client.ts`
- **FR-005**: File uploads MUST use `FormData` with `multipart/form-data` content type

**Student Dashboard**

- **FR-006**: `Assignments.tsx` MUST fetch assignments from API, display loading state, handle errors with toast
- **FR-007**: `AssignmentDetails.tsx` MUST support both text and file submission via API
- **FR-008**: `QuizTaking.tsx` MUST implement timer using quiz's `timeLimitMinutes` field
- **FR-009**: `QuizTaking.tsx` MUST enforce `maxAttempts` limit from API
- **FR-010**: `QuizTaking.tsx` MUST auto-submit when timer expires
- **FR-011**: `LabInstructions.tsx` MUST fetch labs and display instructions in order

**Instructor Dashboard**

- **FR-012**: `AssignmentsList.tsx` MUST fetch assignments from API and support CRUD operations
- **FR-013**: `AssignmentModal.tsx` MUST create/update assignments via API with all required fields
- **FR-014**: `QuizzesPage.tsx` MUST fetch quizzes from API and support full CRUD
- **FR-015**: `QuizzesPage.tsx` MUST support question management (add, edit, delete, reorder)
- **FR-016**: `LabsPage.tsx` MUST fetch labs from API (currently using mock data) and support CRUD
- **FR-017**: All submission views MUST support grading with score and feedback

**TA Dashboard**

- **FR-018**: TA components MUST check user role from `AuthContext` before rendering write operations
- **FR-019**: Create and Delete buttons MUST be hidden when user role is `teaching_assistant`
- **FR-020**: TA MUST only see data for assigned courses (filtered by API or frontend)

**Error Handling**

- **FR-021**: All components MUST show loading skeleton/spinner while fetching data
- **FR-022**: All components MUST display empty state when API returns zero results
- **FR-023**: All API errors MUST trigger toast notifications using Sonner
- **FR-024**: Form data MUST be preserved when submission fails, allowing retry

**Analytics**

- **FR-025**: Instructor assignment view MUST display submission count (submitted/total enrolled)
- **FR-026**: Instructor assignment view MUST display average grade for graded submissions
- **FR-027**: Quiz and Lab views MUST display similar submission/grade statistics

**Accessibility**

- **FR-028**: All interactive elements MUST be keyboard accessible with visible focus indicators
- **FR-029**: All form inputs MUST have associated labels (visible or aria-label)
- **FR-030**: All images and icons MUST have appropriate alt text or aria-hidden
- **FR-031**: Color MUST NOT be the only means of conveying information (e.g., status indicators)

**Internationalization**

- **FR-032**: All user-facing strings MUST use i18n framework (e.g., react-i18next)
- **FR-033**: Layout MUST support RTL text direction via CSS logical properties or RTL-aware components
- **FR-034**: Date/time display MUST use locale-aware formatting

### Key Entities

- **Assignment**: Coursework with due date, submission type (file/text/link), max score, late penalty settings
- **AssignmentSubmission**: Student's submitted work with status (pending/submitted/graded), score, feedback
- **Quiz**: Assessment with duration, attempt limits, question list, answer visibility settings
- **QuizAttempt**: Student's quiz session with timer tracking, answers, auto-graded score
- **QuizQuestion**: Question with type (MCQ/true-false/short-answer/essay), options, correct answer, points
- **Lab**: Practical assignment with ordered instructions, due date, max score
- **LabSubmission**: Student's lab work with status, graded feedback

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Students can view assignments, filter by status, and submit work within 60 seconds of page load
- **SC-002**: Quiz timer accurately tracks remaining time with less than 1 second variance
- **SC-003**: 100% of API calls display appropriate loading states before data arrives
- **SC-004**: 100% of API errors result in user-visible toast notifications
- **SC-005**: Instructors can create an assignment with all fields in under 2 minutes
- **SC-006**: Instructors can grade a submission in under 30 seconds per item
- **SC-007**: TA users see zero Create/Delete buttons on restricted pages
- **SC-008**: Zero hardcoded/mock data remains in production builds for these three modules
- **SC-009**: File uploads up to 10MB complete successfully with progress indication
- **SC-010**: All components render empty states when no data exists
- **SC-011**: Quiz auto-save triggers every 30 seconds with visual confirmation
- **SC-012**: Quiz resume works correctly after browser refresh during active attempt
- **SC-013**: All pages pass WAVE accessibility checker with zero errors
- **SC-014**: All pages are fully navigable using keyboard only (Tab, Enter, Escape)
- **SC-015**: Instructor views display submission count and average grade per assignment/quiz/lab

## Scope Boundaries

### In Scope

- Wiring existing UI components to backend APIs for Assignments, Quizzes, and Labs
- Student, Instructor, and TA dashboard integration
- Minimal analytics: submission counts and average grades per assignment

### Out of Scope

- New UI features beyond existing component structure
- Real-time notifications (WebSocket)
- Advanced analytics dashboards
- Offline support
- Mobile-specific layouts

## Non-Functional Requirements

### Data Volume & Scale

- Small scale deployment: <50 assignments per course, <100 submissions per assignment
- No pagination required; full lists can be loaded in single requests
- Optimize for responsiveness over handling massive datasets

### File Upload Constraints

- **Allowed types**: PDF, DOCX, DOC, ZIP, PNG, JPG, JPEG, GIF, TXT, MD, JS, TS, PY, JAVA, C, CPP, H
- **Maximum size**: 10MB per file
- **Error handling**: Clear user-facing messages for type/size violations before upload attempt
- **Progress**: Upload progress indicator required for files >1MB

### Quiz Timer Behavior

- **Auto-save**: Student answers auto-save every 30 seconds during active attempt
- **Server-side timer**: Backend tracks elapsed time; client timer is display-only
- **Resume support**: If browser closes or network drops, student can resume if attempt session is still valid
- **Expiry**: When server-side timer expires, backend auto-submits with all saved answers

### Accessibility & Localization

- **WCAG 2.1 AA compliance**: Full keyboard navigation, screen reader labels, sufficient color contrast (4.5:1 minimum)
- **RTL support**: Layout must support right-to-left languages
- **i18n framework**: Integrate internationalization framework for future translation (English only for initial release)
- **Focus management**: Modals and dynamic content must manage focus appropriately

## Assumptions

- Backend APIs are stable and match the endpoint documentation discovered during exploration
- Google Drive integration for file uploads is configured and functional on the backend
- The `teaching_assistant` role string is used consistently (not `ta`)
- Toast notifications use the existing Sonner library configured in the app
- The `useApi` hook from `src/hooks/useApi.ts` is available for data fetching patterns
- Course/section filtering for TAs is handled at the API level based on their assignments

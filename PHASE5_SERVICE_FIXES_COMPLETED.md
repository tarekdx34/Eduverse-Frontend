# Phase 5 Service Files - COMPLETED

## Summary of Changes

### 1. quizService.ts - FIXED ✅
- **Changed all endpoints from** /quizzes **to** /api/quizzes
- Updated all interfaces to match backend response shapes:
  - Quiz IDs are now strings
  - maxScore, weight, passingScore are string numbers
  - Added CourseProgress, AttemptResult interfaces
  - questionType supports empty string for legacy questions
- Fixed methods:
  - getAll() returns { data: Quiz[]; total: number }
  - getCourseProgress() added
  - startAttempt() returns attempt with quiz and questions
  - submitAttempt() accepts answer array format
  - All CRUD methods use string IDs

### 2. assignmentService.ts - FIXED ✅
- **Added** /api **prefix to all endpoints**
- Updated interfaces:
  - IDs are strings
  - maxScore, weight are string numbers
  - lateSubmissionAllowed, isLate are 0/1 integers
  - submissionType is 'file' | 'text' | 'both'
- Fixed getMySubmission() to return null on 404
- Added submitText() and submitFile() methods
- gradeSubmission() uses string IDs

### 3. labService.ts - FIXED ✅
- **Added** /api **prefix to all endpoints**
- Updated interfaces:
  - IDs are strings
  - maxScore, weight are string numbers
  - Added proper LabInstruction and LabSubmission shapes
- Fixed getMySubmission() to return null when not found
- submit() method handles FormData with file upload
- gradeSubmission() uses string IDs

### 4. vite.config.js - FIXED ✅
- **Removed** /quizzes proxy rule (no longer needed)
- Only /api and /attendance proxies remain

## Next Steps

Now that services are fixed, the component wiring can proceed:

### Student Dashboard Components:
- [ ] src/pages/student-dashboard/components/Assignments.tsx
- [ ] src/pages/student-dashboard/components/AssignmentDetails.tsx
- [ ] src/pages/student-dashboard/components/QuizTaking.tsx
- [ ] src/pages/student-dashboard/components/LabInstructions.tsx

### Instructor Dashboard Components:
- [ ] src/pages/instructor-dashboard/components/AssignmentsList.tsx
- [ ] src/pages/instructor-dashboard/components/AssignmentModal.tsx
- [ ] src/pages/instructor-dashboard/components/QuizzesPage.tsx

### TA Dashboard Components:
- [ ] src/pages/ta-dashboard/components/GradingPage.tsx
- [ ] src/pages/ta-dashboard/components/QuizzesPage.tsx
- [ ] src/pages/ta-dashboard/components/LabsPage.tsx

## Important Notes for Component Wiring

1. **String IDs**: All IDs from API are strings - convert to numbers in request bodies where needed
2. **String Numbers**: Use Number() or parseFloat() when doing math with maxScore, weight, etc.
3. **Integers as Booleans**: Use === 1 for truthy checks on isLate, randomizeQuestions, etc.
4. **Null Handling**: Check for null on dates, scores, and optional fields
5. **Question Types**: Valid values are 'mcq' | 'true_false' | 'short_answer' | 'essay' | 'matching'
6. **Selected Options**: Must be an array even for single choice: selectedOption: ['answer']
7. **404 Handling**: getMySubmission() returns null - check before accessing properties
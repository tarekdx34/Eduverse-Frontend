# Research: Wire Dashboard Modules

**Feature Branch**: `001-wire-dashboard-modules`  
**Date**: 2026-03-18

## Executive Summary

Research confirms that the EduVerse frontend has a well-established API service layer with comprehensive methods for assignments, quizzes, and labs. The primary work involves replacing mock data in UI components with API calls and adding i18n/accessibility compliance. No major architectural changes required.

---

## 1. API Service Layer Analysis

### Decision: Use Existing Service Architecture
**Rationale**: All three service files (assignmentService, quizService, labService) are fully implemented with CRUD operations, submission handling, and grading support.

### Findings

| Service | Methods | Types Defined | Status |
|---------|---------|---------------|--------|
| `assignmentService.ts` | 10 methods | Assignment, AssignmentSubmission | ✅ Complete |
| `quizService.ts` | 21 methods | Quiz, QuizQuestion, QuizAttempt, + 5 more | ✅ Complete |
| `labService.ts` | 11 methods | Lab, LabInstruction, LabSubmission, + 1 more | ✅ Complete |

### Key Capabilities Already Implemented

**Assignments:**
- `getAll(params?)`, `getById(id)`, `create(data)`, `update(id, data)`, `delete(id)`
- `getMySubmission(assignmentId)`, `submitText()`, `submitFile()` (FormData)
- `getSubmissions(assignmentId)`, `gradeSubmission()`

**Quizzes:**
- Full CRUD + question management (add, update, delete, reorder)
- Attempt flow: `startAttempt()`, `submitAttempt()`, `getAttempt()`, `getMyAttempts()`
- Grading: `gradeAttempt()`, `getPendingGrading()`
- Analytics: `getStatistics()`, `getCourseProgress()`

**Labs:**
- Full CRUD + instruction management
- Submission: `getMySubmission()`, `submit()` (text + file)
- Grading: `getSubmissions()`, `gradeSubmission()`

### Alternatives Considered
- **Create new service layer**: Rejected - existing layer is comprehensive
- **Use TanStack Query directly**: Rejected - useApi hook already wraps it well

---

## 2. Dashboard Component Integration Status

### Decision: Replace Mock Data, Keep Component Structure
**Rationale**: Components are well-structured with proper UI patterns. Only data source needs changing.

### Current State by Component

| Component | Data Source | Integration Work |
|-----------|-------------|------------------|
| **Student: Assignments.tsx** | API + mock fallback | Remove fallback, pure API |
| **Student: AssignmentDetails.tsx** | Hybrid (mock + API) | Remove mock, use AssignmentService |
| **Student: QuizTaking.tsx** | Mock primary | Replace with QuizService, add timer |
| **Student: LabInstructions.tsx** | API | ✅ Already integrated |
| **Instructor: QuizzesPage.tsx** | `MOCK_QUIZZES` array | Replace with QuizService |
| **Instructor: LabsPage.tsx** | Hardcoded data | Wire to LabService |
| **TA: QuizzesPage.tsx** | `MOCK_QUIZZES` | Wire to API, hide create/delete |
| **TA: LabsPage.tsx** | Props-based | Wire parent to LabService |

---

## 3. Quiz Timer Implementation

### Decision: Client Timer with Server-Side Backup + 30s Auto-Save
**Rationale**: Spec requires resume support and server-side time tracking.

### Implementation Pattern

```typescript
// Timer hook pattern
function useQuizTimer(attemptId: string, serverEndTime: Date) {
  const [remaining, setRemaining] = useState(0);
  const [lastSaveTime, setLastSaveTime] = useState(Date.now());
  
  // Sync with server time on mount
  useEffect(() => {
    const serverRemaining = serverEndTime.getTime() - Date.now();
    setRemaining(Math.max(0, serverRemaining));
  }, [serverEndTime]);
  
  // Client-side countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(r => Math.max(0, r - 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  
  // Auto-save every 30 seconds
  useEffect(() => {
    if (Date.now() - lastSaveTime >= 30000) {
      saveAnswers(); // API call
      setLastSaveTime(Date.now());
    }
  }, [remaining]);
  
  return { remaining, isExpired: remaining <= 0 };
}
```

### Key Design Points
- Server tracks authoritative time; client timer is display-only
- Auto-save triggers every 30 seconds via `QuizService.saveProgress()`
- On expiry, client calls `QuizService.submitAttempt()` with saved answers
- Resume: fetch `getAttempt()` to restore saved answers and remaining time

---

## 4. Internationalization (i18n)

### Decision: Install react-i18next, Migrate from Custom LanguageContext
**Rationale**: Custom `t("en", "ar")` pattern doesn't scale. react-i18next is industry standard.

### Migration Plan

**Current State:**
- `LanguageContext.tsx` with binary `'en' | 'ar'` support
- Manual `t(english, arabic)` function calls
- RTL support via `dir` attribute

**Target State:**
```bash
npm install react-i18next i18next i18next-browser-languagedetector
```

**File Structure:**
```
src/locales/
├── en.json          # {"assignments": {"title": "Assignments", ...}}
├── ar.json          # {"assignments": {"title": "المهام", ...}}
└── index.ts         # i18n configuration
```

**Usage Pattern:**
```typescript
import { useTranslation } from 'react-i18next';

function Assignments() {
  const { t } = useTranslation();
  return <h1>{t('assignments.title')}</h1>;
}
```

**RTL Support:**
```typescript
// In i18n config
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
  document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
});
```

---

## 5. Accessibility Compliance

### Decision: WCAG 2.1 AA via Radix UI + Custom ARIA
**Rationale**: Radix UI provides accessibility foundation; custom components need enhancement.

### Audit Findings

| Area | Current State | Required Work |
|------|---------------|---------------|
| Keyboard Navigation | ✅ Radix components | Add to custom file uploads, modals |
| Focus Management | ⚠️ Partial | Add focus trap to modals, return focus |
| ARIA Labels | ⚠️ Partial | Add to form inputs, status indicators |
| Color Contrast | Unknown | Audit with WAVE tool |
| Screen Reader | ⚠️ Partial | Add live regions for status changes |

### Implementation Checklist
1. Add `aria-label` to all form inputs without visible labels
2. Add `role="status"` and `aria-live="polite"` to loading indicators
3. Add `aria-describedby` to link error messages to inputs
4. Ensure focus moves into modal on open, returns on close
5. Add skip navigation link to main content
6. Test with WAVE accessibility checker (SC-013)

---

## 6. File Upload Handling

### Decision: Use Existing FileUploadDropzone + Service Methods
**Rationale**: Component exists with validation; services support FormData.

### Allowed File Types (per spec)
```typescript
const ALLOWED_EXTENSIONS = [
  'pdf', 'docx', 'doc', 'zip',
  'png', 'jpg', 'jpeg', 'gif',
  'txt', 'md', 'js', 'ts', 'py', 'java', 'c', 'cpp', 'h'
];

const MAX_FILE_SIZE_MB = 10;
```

### Integration Points
- `AssignmentService.submitFile(id, file)` - FormData POST
- `LabService.submit(id, text, file)` - Mixed submission
- Progress indicator via `FileUploadDropzone.onProgress`

---

## 7. Analytics Implementation

### Decision: Calculate in Frontend from Existing API Data
**Rationale**: Small scale (<100 submissions) allows client-side calculation.

### Metrics Required (per spec)
1. **Submission Count**: `submitted / total enrolled`
2. **Average Grade**: `sum(grades) / count(graded)`

### Implementation Pattern
```typescript
function useAssignmentAnalytics(assignmentId: string) {
  const { data: submissions } = useApi(
    () => AssignmentService.getSubmissions(assignmentId),
    [assignmentId]
  );
  
  return useMemo(() => {
    if (!submissions) return null;
    
    const submitted = submissions.filter(s => s.submissionStatus !== 'pending').length;
    const graded = submissions.filter(s => s.score != null);
    const avgGrade = graded.length > 0
      ? graded.reduce((sum, s) => sum + parseFloat(s.score), 0) / graded.length
      : null;
    
    return { submitted, total: submissions.length, avgGrade };
  }, [submissions]);
}
```

---

## 8. Role-Based Access Control

### Decision: Check `user.roles` from AuthContext
**Rationale**: AuthContext already provides role detection.

### TA Restrictions
```typescript
// In TA components
const { user } = useAuth();
const isTA = user?.roles.includes('teaching_assistant');

// Hide create/delete buttons
{!isTA && <Button onClick={onCreate}>Create Quiz</Button>}

// Or use dedicated TA components that omit these entirely
```

### Role Strings (from backend)
- `student`
- `instructor`
- `teaching_assistant` (not `ta`)
- `admin`
- `it_admin`
- `department_head`

---

## 9. Type Centralization

### Decision: Create `src/types/api.ts` for Shared Types
**Rationale**: Types are currently scattered across service files.

### Proposed Structure
```typescript
// src/types/api.ts
export interface Assignment { ... }
export interface AssignmentSubmission { ... }
export interface Quiz { ... }
export interface QuizQuestion { ... }
export interface QuizAttempt { ... }
export interface Lab { ... }
export interface LabInstruction { ... }
export interface LabSubmission { ... }

// Shared utility types
export interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}
```

---

## 10. Testing Strategy

### Decision: Add Vitest for Unit Tests (Future Phase)
**Rationale**: No testing configured currently. Out of scope for this feature but documented for follow-up.

### Recommended Setup
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

### Priority Test Areas
1. `useQuizTimer` hook - timer accuracy
2. Service methods - API call structure
3. Role-based rendering - button visibility
4. Form validation - Zod schemas

---

## Summary of Decisions

| Topic | Decision | Key Dependencies |
|-------|----------|------------------|
| API Services | Use existing, fully implemented | None |
| Component Structure | Keep existing, replace data source | None |
| Quiz Timer | Client display + server backup + 30s auto-save | QuizService methods |
| i18n | Install react-i18next | `npm install react-i18next i18next` |
| Accessibility | Radix UI + custom ARIA enhancements | None |
| File Uploads | Use existing FileUploadDropzone | AssignmentService, LabService |
| Analytics | Frontend calculation from API data | useApi, useMemo |
| RBAC | AuthContext role checks | AuthContext.user.roles |
| Types | Centralize in src/types/api.ts | None |
| Testing | Out of scope (recommend Vitest) | Future work |

# Implementation Plan: Wire Dashboard Modules

**Branch**: `001-wire-dashboard-modules` | **Date**: 2026-03-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-wire-dashboard-modules/spec.md`

## Summary

Wire existing Student, Instructor, and TA dashboard components (Assignments, Quizzes, Labs) to the live NestJS backend API. Replace mock data with real API calls, implement proper loading/error states, add quiz timer with auto-save, enforce role-based access controls, integrate i18n framework, and ensure WCAG 2.1 AA accessibility compliance.

**Technical Approach:**
1. Audit and complete API service methods in assignmentService, quizService, labService
2. Replace mock data in dashboard components with `useApi` hook calls
3. Implement quiz timer with 30-second auto-save and server-side tracking
4. Add i18n framework (react-i18next) for internationalization
5. Enhance accessibility with ARIA labels, keyboard navigation, and focus management
6. Add minimal analytics (submission counts, average grades) to instructor views

## Technical Context

**Language/Version**: TypeScript 5.2.0, React 19.2.0  
**Primary Dependencies**: Vite 7.2.5, Axios 1.13.6, TanStack Query 5.90.21, Radix UI, Tailwind CSS 4.x, React Hook Form 7.67.0, Zod 4.1.13, Sonner 2.0.7  
**Storage**: N/A (frontend only - backend uses PostgreSQL)  
**Testing**: None currently configured (recommend adding Vitest)  
**Target Platform**: Web browsers (Chrome, Firefox, Safari, Edge)  
**Project Type**: Single Page Application (React frontend)  
**Performance Goals**: <60s page load with data, <100ms loading state feedback, quiz timer <1s variance  
**Constraints**: Bundle <500KB gzipped, LCP <2.5s on 3G, 10MB file upload limit  
**Scale/Scope**: Small scale (<50 assignments/course, <100 submissions/assignment)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Component Architecture** | ✅ PASS | Using existing Radix UI components, services in `src/services/api/`, hooks for logic |
| **II. API Integration** | ✅ PASS | Using established `useApi` hook, services encapsulate API calls, Sonner for errors |
| **III. Authentication & Authorization** | ✅ PASS | AuthContext exists with role detection, `getDashboardPath()` available |
| **IV. Accessibility (NON-NEGOTIABLE)** | ⚠️ REQUIRES WORK | Need ARIA labels, keyboard nav, focus management - spec requires WCAG 2.1 AA |
| **V. Code Quality** | ✅ PASS | ESLint/Prettier configured, TypeScript in use |
| **VI. User Experience** | ✅ PASS | Loading states via useApi, skeleton loaders available, responsive layouts |

**Constitution Compliance:** All gates pass. Accessibility requires implementation work (not a violation, work is scoped in spec).

## Project Structure

### Documentation (this feature)

```text
specs/001-wire-dashboard-modules/
├── plan.md              # This file
├── research.md          # Phase 0: Technical research findings
├── data-model.md        # Phase 1: Entity definitions & relationships
├── quickstart.md        # Phase 1: Developer setup guide
├── contracts/           # Phase 1: API contract documentation
│   ├── assignments.md
│   ├── quizzes.md
│   └── labs.md
└── tasks.md             # Phase 2: Implementation tasks (speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── ui/                    # Radix UI wrappers (existing)
│   └── shared/                # Shared components (FileUploadDropzone)
├── context/
│   ├── AuthContext.tsx        # Auth state & role detection (existing)
│   └── LanguageContext.tsx    # i18n context (needs react-i18next migration)
├── hooks/
│   └── useApi.ts              # Data fetching hook (existing)
├── locales/
│   ├── en.json                # English translations (NEW)
│   └── ar.json                # Arabic translations (NEW)
├── pages/
│   ├── student-dashboard/
│   │   └── components/
│   │       ├── Assignments.tsx        # Wire to API (MODIFY)
│   │       ├── AssignmentDetails.tsx  # Remove mock data (MODIFY)
│   │       ├── QuizTaking.tsx         # Add timer, auto-save (MODIFY)
│   │       └── LabInstructions.tsx    # Already wired (VERIFY)
│   ├── instructor-dashboard/
│   │   └── components/
│   │       ├── AssignmentsList.tsx    # Wire parent to API (MODIFY)
│   │       ├── AssignmentModal.tsx    # Add Zod validation (MODIFY)
│   │       ├── QuizzesPage.tsx        # Replace MOCK_QUIZZES (MODIFY)
│   │       └── LabsPage.tsx           # Wire to LabService (MODIFY)
│   └── ta-dashboard/
│       └── components/
│           ├── QuizzesPage.tsx        # Replace mock, hide create/delete (MODIFY)
│           └── LabsPage.tsx           # Wire to API (MODIFY)
├── services/api/
│   ├── client.ts              # HTTP client (existing)
│   ├── assignmentService.ts   # Assignment CRUD (existing, verify complete)
│   ├── quizService.ts         # Quiz CRUD (existing, verify complete)
│   └── labService.ts          # Lab CRUD (existing, verify complete)
└── types/
    └── api.ts                 # Centralized API types (NEW)
```

**Structure Decision**: Single React SPA structure. All changes are modifications to existing files or additions within established patterns. No new architectural layers needed.

## Complexity Tracking

> No constitution violations. All work follows established patterns.

---

## Phase 1 Re-evaluation (Post-Design)

| Principle | Pre-Design | Post-Design | Notes |
|-----------|------------|-------------|-------|
| **I. Component Architecture** | ✅ PASS | ✅ PASS | Data model uses existing component patterns |
| **II. API Integration** | ✅ PASS | ✅ PASS | Contracts align with existing service methods |
| **III. Authentication & Authorization** | ✅ PASS | ✅ PASS | Role checks documented in research.md |
| **IV. Accessibility** | ⚠️ WORK | ⚠️ WORK | Implementation tasks will address |
| **V. Code Quality** | ✅ PASS | ✅ PASS | Types centralized in data-model.md |
| **VI. User Experience** | ✅ PASS | ✅ PASS | Timer/auto-save patterns defined |

**Status:** All gates remain compliant. Ready for Phase 2 (task generation).

---

## Generated Artifacts

| Artifact | Path | Description |
|----------|------|-------------|
| **research.md** | `specs/001-wire-dashboard-modules/research.md` | Technical decisions and patterns |
| **data-model.md** | `specs/001-wire-dashboard-modules/data-model.md` | Entity definitions and TypeScript types |
| **contracts/assignments.md** | `specs/001-wire-dashboard-modules/contracts/assignments.md` | Assignment API endpoints |
| **contracts/quizzes.md** | `specs/001-wire-dashboard-modules/contracts/quizzes.md` | Quiz API endpoints |
| **contracts/labs.md** | `specs/001-wire-dashboard-modules/contracts/labs.md` | Lab API endpoints |
| **quickstart.md** | `specs/001-wire-dashboard-modules/quickstart.md` | Developer setup guide |
| **CLAUDE.md** | Repository root | Agent context (auto-updated) |

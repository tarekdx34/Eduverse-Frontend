# Student Course Team Error Analysis

Date: 2026-04-10

## Executive Summary

Your logs show a mix of:

1. Backend authorization errors (main blocker): 403 Forbidden on section instructor/TA endpoints.
2. Frontend integration mismatch (secondary blocker): frontend expects a different response shape than backend returns.
3. Frontend runtime warning: useEffect dependency-size warning (usually a hot-reload/dev-state issue).
4. Non-app informational noise (not real errors): React DevTools/i18next messages and browser-extension runtime.lastError.

Because of the 403 responses, the UI falls back to: No instructor or TA assigned yet.

## Error-by-Error Classification

### 1) GET /api/enrollments/section/:id/instructor returns 403

- Log: Failed to load resource ... 403 (Forbidden)
- Classification: Backend error (authorization/permissions)
- Why:
  - Endpoint is protected with roles ADMIN, INSTRUCTOR, TA.
  - STUDENT role is not allowed.

Evidence:

- [src/modules/enrollments/controllers/enrollments.controller.ts](../Backend/eduverse-backend/src/modules/enrollments/controllers/enrollments.controller.ts#L612)
- [src/modules/enrollments/controllers/enrollments.controller.ts](../Backend/eduverse-backend/src/modules/enrollments/controllers/enrollments.controller.ts#L613)

### 2) GET /api/enrollments/section/:id/tas returns 403

- Log: Failed to load resource ... 403 (Forbidden)
- Classification: Backend error (authorization/permissions)
- Why:
  - Endpoint is protected with roles ADMIN, INSTRUCTOR, TA.
  - STUDENT role is not allowed.

Evidence:

- [src/modules/enrollments/controllers/enrollments.controller.ts](../Backend/eduverse-backend/src/modules/enrollments/controllers/enrollments.controller.ts#L795)
- [src/modules/enrollments/controllers/enrollments.controller.ts](../Backend/eduverse-backend/src/modules/enrollments/controllers/enrollments.controller.ts#L796)

### 3) [API Error] Forbidden resource from client.ts

- Log: client.ts:112 [API Error] Forbidden resource
- Classification: Frontend logging of backend error
- Why:
  - ApiClient is correctly surfacing backend 403 and logging it.
  - This is expected behavior given the denied endpoints.

Evidence:

- [src/services/api/client.ts](src/services/api/client.ts#L112)

### 4) No instructor or TA assigned yet (UI message)

- Classification: Frontend fallback state (triggered by backend denial)
- Why:
  - Staff fetch fails; component catches and sets empty arrays, then shows this message.

Evidence:

- [src/pages/student-dashboard/pages/CourseView.tsx](src/pages/student-dashboard/pages/CourseView.tsx#L231)
- [src/pages/student-dashboard/pages/CourseView.tsx](src/pages/student-dashboard/pages/CourseView.tsx#L798)

### 5) useEffect changed size between renders warning

- Log: The final argument passed to useEffect changed size between renders. Previous: [239] Incoming: [true, 239]
- Classification: Frontend runtime warning
- Most likely cause:
  - Dev hot-reload/state mismatch after code edits, where old and new effect dependency arrays differ.
  - Also possible that one component has conditional hook logic during dev render cycle.
- Impact:
  - Warning-level; can produce unstable behavior in the affected component until full refresh.

Recommended immediate check:

- Hard refresh browser (Ctrl+F5) and restart Vite dev server. If warning persists, inspect all useEffect hooks in currently mounted student dashboard tree.

### 6) Unchecked runtime.lastError: Could not establish connection. Receiving end does not exist.

- Classification: Not backend, not app frontend logic
- Why:
  - Typically emitted by a browser extension content script trying to message a missing listener.

### 7) React DevTools and i18next messages

- Classification: Informational logs only
- Why:
  - Not failures.

## Additional Integration Mismatch (Important)

Even after backend allows students, staff rendering may still be incomplete because response shapes differ.

Current frontend expectation:

- Instructor: id, firstName, lastName, email
- TA: id, firstName, lastName, email

Current backend response shapes:

- Instructor summary endpoint returns:
  - instructorId
  - instructor: userId, fullName, email
- TA summaries endpoint returns array of:
  - userId, fullName, email

Evidence:

- Backend endpoint docs and signatures:
  - [src/modules/enrollments/controllers/enrollments.controller.ts](../Backend/eduverse-backend/src/modules/enrollments/controllers/enrollments.controller.ts#L612)
  - [src/modules/enrollments/controllers/enrollments.controller.ts](../Backend/eduverse-backend/src/modules/enrollments/controllers/enrollments.controller.ts#L795)
- Frontend service typing currently assumes firstName/lastName shape:
  - [src/services/api/enrollmentService.ts](src/services/api/enrollmentService.ts#L62)
  - [src/services/api/enrollmentService.ts](src/services/api/enrollmentService.ts#L124)

## Root Cause Verdict

Primary blocker: Backend permissions (403) on staff summary endpoints for student role.

Secondary blocker: Frontend type/mapper mismatch with backend payload shape.

## Suggested Backend Fix

Option A (recommended): Allow STUDENT role read access for the two summary endpoints only:

- GET /api/enrollments/section/:sectionId/instructor
- GET /api/enrollments/section/:sectionId/tas

Keep write/admin endpoints restricted.

## Suggested Frontend Fix

Normalize backend response shape before rendering:

- instructor.id = instructor?.userId or instructorId
- split fullName to firstName/lastName if needed, or render fullName directly
- ta.id = userId, ta.fullName used directly

## Conclusion

- Yes, the 403 errors are backend authorization errors.
- There is also a frontend integration adjustment needed for response mapping.
- The useEffect warning is frontend-side runtime behavior, usually transient in dev after hot updates.

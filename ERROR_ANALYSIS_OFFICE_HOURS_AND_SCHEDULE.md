# Error Analysis: Office Hours, Departments, Schedule Templates

## 1) `GET /api/office-hours?page=1&limit=10` → 404

- **Type:** Mostly backend contract mismatch (with frontend usage impact)
- **Where used:** `OfficeHoursManagementPage.tsx` → `ScheduleService.getOfficeHours()` (`/office-hours`)
- **Finding:** In `scheduleService.ts`, office-hours APIs are mixed:
  - One style uses `/office-hours/slots` and `/office-hours/my-slots`
  - Another style uses `/office-hours`
- **Likely root cause:** Backend exposes only one route family (commonly `/office-hours/slots`), while admin page calls the other.

### Fix options
1. **Backend fix:** Add `/api/office-hours` list/create routes (plus update/delete) to match frontend.
2. **Frontend fix:** Switch admin office-hours CRUD to `/office-hours/slots` endpoints.
3. **Best long-term:** Standardize one contract and remove duplicate API method styles from `scheduleService.ts`.

---

## 2) `POST /api/office-hours` → 404 (create office hour)

- **Type:** Backend contract mismatch (same family as #1)
- **Where used:** `OfficeHoursManagementPage.tsx` create mutation calls `ScheduleService.createOfficeHour()` (`POST /office-hours`)
- **Likely root cause:** Missing backend route for `POST /api/office-hours` (or route exists under `/office-hours/slots` only).

### Fix options
1. Add backend route `POST /api/office-hours`.
2. Or map frontend create/update/delete to `/office-hours/slots` contract.
3. Keep frontend and backend OpenAPI/Swagger in sync to prevent drift.

---

## 3) `deptError: true` and `/api/departments` failures

- **Type:** Backend endpoint/config issue (frontend fallback is working)
- **Where used:** `CampusEventsManagementPage.tsx`, `ScheduleTemplatesPage.tsx`, via `adminService.getDepartments()` (`/departments`)
- **Finding:** UI falls back to `MOCK_DEPARTMENTS`, so page still renders but with non-live data (`Array(4)`).

### Fix options
1. Ensure backend route exists: `GET /api/departments`.
2. If backend route is different (e.g. `/api/admin/departments`), update `adminService.getDepartments()`.
3. Keep fallback, but show a visible warning banner (“Using mock departments due to API failure”).

---

## 4) `GET /api/schedule-templates...` → 500 and crash on `creator.firstName`

- **Type:** Both backend + frontend
- **Where used:** `ScheduleTemplatesPage.tsx`
- **Crash line:** `template.creator.firstName` / `template.creator.lastName`
- **Finding:** Frontend assumes `creator` is always present. If backend returns template rows without joined creator (or null creator), UI crashes.

### Fix options
1. **Backend:** Always include creator object in response (or guarantee non-null shape).
2. **Frontend defensive fix:** Render safely, e.g.
   - `template.creator?.firstName && template.creator?.lastName ? ... : 'Unknown'`
3. **Best:** Do both (contract guarantee + frontend guard).

---

## 5) “Not all Instructors/TAs appear” when creating office hours

- **Type:** Primarily frontend filtering bug (can also be backend pagination/filtering)
- **Where used:** `OfficeHoursManagementPage.tsx`
- **Finding:** Query uses `adminService.getUsers()` (returns `{ data: any[]; total }`), but filter is applied to `users` directly and checks `u.role` / `u.userType`.
  - In other code, roles are modeled as `u.roles?.[0]?.roleName`.
  - This mismatch can hide valid instructors/TAs.

### Fix options
1. Parse users correctly:
   - `const rows = users?.data ?? []`
2. Filter by normalized roles from `u.roles[].roleName` (with fallback to `u.role`).
3. Ensure server request is role-scoped for completeness:
   - Fetch instructors and TAs explicitly (or `size` large enough, with pagination handling).
4. Remove silent fallback to 4 mock instructors for admin create flow, or at least clearly label mock mode.

---

## 6) Is this frontend or backend?

- **Backend-side or API-contract:** 404/500 on `/office-hours`, `/departments`, `/schedule-templates`
- **Frontend-side:** role filtering logic, unsafe `creator.firstName` access, fallback behavior masking live API failures
- **Final diagnosis:** **Both** sides are involved. Main blockers are API contract mismatch + frontend assumptions.

---

## Recommended order to fix

1. Decide and document one office-hours API contract (`/office-hours` vs `/office-hours/slots`).
2. Align frontend service methods and backend routes to that contract.
3. Fix instructor/TA list mapping (`users.data` + roles normalization).
4. Add null-safe rendering for `template.creator`.
5. Keep fallback data only for dev, with explicit “mock/fallback active” indicator in UI.


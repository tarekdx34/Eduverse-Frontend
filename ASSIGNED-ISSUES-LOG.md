# Assigned issues — change log

Branch: `work/fix-assigned-issues` (work from `main`)

Use this file to record what was done for GitHub issues you own, without relying on issue threads alone.

---

## #10 — Student: Better heading in grading tab (student dashboard)

**Status:** Done (pending PR / merge)

**GitHub:** [Issue #10](https://github.com/tarekdx34/Eduverse-Frontend/issues/10) — “We need a better heading to be visually appealing for student”

**Summary**

- Redesigned the **per-course header** on the student **Grades** tab (`GradesTranscript`): clearer hierarchy, compact rows, softer typography on scores/grades.
- Course header background uses the student **profile theme color** (`ThemeContext` → `primaryHex`) with a **very soft** radial + linear gradient (light/dark), not flat grey.
- Outer **course card** (header + list): stronger visible **border** and light shadow on light mode; clearer border on dark mode.
- Icon tile, header border, divider, and **course average** number tie to the same primary color.

**Files touched**

- `src/pages/student-dashboard/components/GradesTranscript.tsx`
  - `primaryAlpha()` helper for theme-based `rgba` gradients
  - `useTheme()` extended with `primaryHex` for the course header block

**Notes**

- Verify in UI: **Settings / profile color picker** should shift the header wash and accents.
- Next step: commit on `work/fix-assigned-issues`, open PR, link #10.

---

## #9 — Student: Announcement in Course section needs to be wired

**Status:** Done (local changes, pending your review)

**GitHub:** [Issue #9](https://github.com/tarekdx34/Eduverse-Frontend/issues/9)

**Summary**

- Hardened course announcements loading on student course page:
  - Handles API payloads returned as either `Announcement[]` or `{ data: Announcement[] }`.
  - Applies a course-level filter fallback in case backend ignores `courseId` query.
- Fixed student sidebar localization issues:
  - Added missing `profile` and `quizzes` translation keys.
  - Localized sidebar group headers (`Overview`, `Courses`, `Academic`, etc.) for Arabic and English.
  - Updated tab-to-translation mapping to include `profile`.

**Files touched**

- `src/pages/student-dashboard/pages/CourseView.tsx`
- `src/pages/student-dashboard/StudentDashboard.tsx`
- `src/pages/student-dashboard/contexts/LanguageContext.tsx`

---

## #25 — Instructor: Announcement needs to be debugged (modal/form)

**Status:** In progress (modal UX + course targeting fixed)

**GitHub:** [Issue #25](https://github.com/tarekdx34/Eduverse-Frontend/issues/25)

**Summary (current slice)**

- Improved **New Announcement** modal usability:
  - Added placeholders for title and content.
  - Tightened form spacing/alignment between labels, fields, and checkbox.
- Fixed course dropdown source:
  - It now loads options from `EnrollmentService.getTeachingCourses()` (real instructor teaching courses),
  - with fallback to known course IDs from existing announcements.
- This removes dependency on existing announcements for course choices, so dropdown is not stuck on only **Campus-wide**.

**Files touched**

- `src/pages/instructor-dashboard/components/AnnouncementsManager.tsx`

## #7 — Student: Course Progress tracking

**Status:** In progress (backend + frontend wired, DB migration/script added)

**GitHub:** [Issue #7](https://github.com/tarekdx34/Eduverse-Frontend/issues/7)

**Summary (current slice)**

- Added per-student material tracking in backend:
  - New `student_material_views` table/entity records unique `(user, material)` views and counts repeated opens.
  - `trackView` now deduplicates completion tracking while still incrementing global material `viewCount`.
- Wired progress persistence:
  - On each view, backend recomputes `materialsViewed`, `totalMaterials`, and `completionPercentage` for the student/course.
  - Upserts `student_progress` for the active enrollment and updates `last_activity_at`.
- Exposed progress to frontend via `/enrollments/my-courses`:
  - Adds `materialsViewed`, `totalMaterials`, `progressPercentage` to enrollment response.
- Replaced frontend hardcoded progress:
  - `ClassTab` cards now display real `progressPercentage`.
  - `CourseView` sidebar progress card now shows real viewed/total + dynamic progress bar.
- Added DB rollout support:
  - TypeORM migration: `CreateStudentMaterialViewsTable1767000000000`.
  - SQL script: `DB_CHANGES_STUDENT_PROGRESS_TRACKING.sql`.
  - Runner script + npm command: `npm run db:student-progress`.

**Files touched**

- `EduVerse-Backend/src/modules/course-materials/entities/student-material-view.entity.ts`
- `EduVerse-Backend/src/modules/course-materials/entities/index.ts`
- `EduVerse-Backend/src/modules/course-materials/course-materials.module.ts`
- `EduVerse-Backend/src/modules/course-materials/services/materials.service.ts`
- `EduVerse-Backend/src/modules/enrollments/dto/enrollment-response.dto.ts`
- `EduVerse-Backend/src/modules/enrollments/enrollments.module.ts`
- `EduVerse-Backend/src/modules/enrollments/services/enrollments.service.ts`
- `EduVerse-Backend/src/database/migrations/1767000000000-CreateStudentMaterialViewsTable.ts`
- `EduVerse-Backend/DB_CHANGES_STUDENT_PROGRESS_TRACKING.sql`
- `EduVerse-Backend/scripts/run-student-progress-sql.cjs`
- `EduVerse-Backend/package.json`
- `src/services/api/enrollmentService.ts`
- `src/pages/student-dashboard/components/ClassTab.tsx`
- `src/pages/student-dashboard/pages/CourseView.tsx`

<!-- Add new issues below this line -->

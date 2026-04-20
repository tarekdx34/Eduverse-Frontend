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

<!-- Add new issues below this line -->

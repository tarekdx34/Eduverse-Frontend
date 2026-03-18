<!--
=== SYNC IMPACT REPORT ===
Version change: 0.0.0 → 1.0.0 (MAJOR: Initial constitution creation)

Modified principles: N/A (initial creation)

Added sections:
  - Core Principles (6 principles defined)
  - Technology Stack
  - Development Workflow
  - Governance

Removed sections: N/A (initial creation)

Templates requiring updates:
  ✅ plan-template.md - Compatible (Constitution Check section exists)
  ✅ spec-template.md - Compatible (User Scenarios align with UX principle)
  ✅ tasks-template.md - Compatible (Phase structure supports principles)

Follow-up TODOs: None
========================
-->

# EduVerse Constitution

## Core Principles

### I. Component Architecture

All UI features MUST be built using reusable, composable components following these rules:

- Components MUST be self-contained with clearly defined props interfaces
- Radix UI primitives MUST be used as the foundation for accessible UI patterns
- Component composition MUST follow the atomic design pattern (atoms → molecules → organisms → templates → pages)
- Shared components MUST reside in `src/components/ui/` with feature-specific components in their respective page directories
- Components MUST NOT contain business logic; delegate to hooks and services

**Rationale**: A consistent component architecture reduces duplication, improves maintainability, and ensures accessibility compliance across the educational platform.

### II. API Integration

All backend communication MUST follow the established service layer pattern:

- API calls MUST be encapsulated in service files under `src/services/api/`
- The `useApi` hook MUST be used for data fetching with proper loading/error states
- API response shapes MUST be mapped to component-friendly formats using `useMemo`
- Error handling MUST provide user-friendly feedback via toast notifications
- Authentication state MUST flow through `AuthContext` for all protected routes

**Rationale**: Centralized API integration ensures consistent error handling, simplifies backend contract changes, and maintains clear separation between data fetching and presentation.

### III. Authentication & Authorization

Role-based access control MUST be enforced throughout the application:

- Supported roles: `student`, `instructor`, `admin`, `it_admin`, `teaching_assistant`, `department_head`
- Route protection MUST verify user roles before rendering protected content
- Dashboard routing MUST use `getDashboardPath()` from `AuthContext`
- API tokens MUST be stored securely and refreshed transparently
- Unauthorized access attempts MUST redirect to appropriate error or login pages

**Rationale**: Educational platforms handle sensitive student data; strict authorization prevents data leaks and ensures regulatory compliance.

### IV. Accessibility (NON-NEGOTIABLE)

All features MUST meet WCAG 2.1 Level AA compliance:

- Interactive elements MUST be keyboard navigable with visible focus indicators
- Form inputs MUST have associated labels and error announcements
- Color contrast MUST meet minimum ratio requirements (4.5:1 for normal text)
- Dynamic content changes MUST be announced to screen readers via ARIA live regions
- Radix UI primitives MUST be used for complex interactions (dialogs, menus, tooltips)

**Rationale**: Educational tools MUST be accessible to all learners, including those using assistive technologies. Accessibility is a legal and ethical requirement.

### V. Code Quality

All code MUST pass automated quality gates before merge:

- ESLint rules MUST pass with zero errors (`npm run lint`)
- Prettier formatting MUST be applied (`npm run format`)
- TypeScript types SHOULD be used for new components and services
- Code duplication MUST be minimized; extract shared logic to hooks or utilities
- Console statements MUST NOT be committed to production code

**Rationale**: Consistent code quality reduces bugs, improves readability, and simplifies onboarding for new contributors.

### VI. User Experience

All features MUST prioritize responsive, performant user experiences:

- Layouts MUST adapt gracefully to mobile, tablet, and desktop viewports
- Loading states MUST provide visual feedback within 100ms of user action
- Page transitions MUST feel instant; use skeleton loaders for async content
- Form validation MUST be immediate with inline error messages
- Navigation MUST be intuitive with consistent breadcrumbs and visual hierarchy

**Rationale**: Educational engagement depends on a frictionless user experience; slow or confusing interfaces lead to student dropout.

## Technology Stack

The following technology choices are binding for all features:

| Layer | Technology | Version/Notes |
|-------|------------|---------------|
| Framework | React | 19.x with hooks |
| Build | Vite (rolldown) | Fast HMR, ESM-native |
| Styling | Tailwind CSS | 4.x utility-first |
| UI Primitives | Radix UI | Accessible components |
| State | React Context + TanStack Query | Server state caching |
| Routing | React Router | v7.x |
| Forms | React Hook Form + Zod | Schema validation |
| HTTP Client | Axios | Centralized in ApiClient |
| Icons | Lucide React | Consistent iconography |
| Charts | Recharts | Dashboard visualizations |

**Constraints**:
- Bundle size MUST remain under 500KB gzipped for initial load
- Largest Contentful Paint MUST be under 2.5 seconds on 3G
- No jQuery or legacy DOM manipulation libraries

## Development Workflow

All contributions MUST follow this workflow:

1. **Branch**: Create feature branch from `main` using naming convention `<issue>-<feature-name>`
2. **Develop**: Implement following constitution principles; run `npm run lint` frequently
3. **Test**: Verify feature works across supported browsers (Chrome, Firefox, Safari, Edge)
4. **Format**: Run `npm run format` before committing
5. **Commit**: Use conventional commit messages (`feat:`, `fix:`, `docs:`, `refactor:`)
6. **Review**: All PRs require at least one reviewer approval
7. **Merge**: Squash merge to `main`; delete feature branch

**Quality Gates**:
- Lint MUST pass
- Build MUST succeed (`npm run build`)
- No console errors in browser dev tools
- Responsive design verified on mobile viewport

## Governance

This constitution supersedes all informal practices and conflicting documentation.

**Amendment Process**:
1. Propose changes via PR to this document with rationale
2. Team review and discussion required
3. Approval from project lead required for principle changes
4. Version bump follows semantic versioning:
   - MAJOR: Principle removal or redefinition
   - MINOR: New principle or section added
   - PATCH: Clarifications and typo fixes

**Compliance**:
- All PRs MUST be verified against relevant principles before approval
- Complexity beyond constitution guidelines MUST be documented with justification
- Violations MUST be raised and resolved before merge

**Version**: 1.0.0 | **Ratified**: 2026-03-18 | **Last Amended**: 2026-03-18

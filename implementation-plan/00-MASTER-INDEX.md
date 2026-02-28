# EduVerse Backend Implementation Plan - Master Index

## Overview

This documentation contains the complete implementation plan for building out the EduVerse backend to fully support all 5 frontend dashboards (Admin, Instructor, Student, IT Admin, Teaching Assistant).

## Current Backend State

### Completed Modules ✅
| Module | Description | Tables Covered |
|--------|-------------|----------------|
| Auth | Login, register, JWT, roles, permissions, sessions, password reset, email verification, 2FA | users, user_roles, sessions, login_attempts, email_verifications, password_resets, two_factor_auth |
| Campus | Multi-campus, departments, programs, semesters | campuses, departments, programs, semesters |
| Courses | Course catalog, sections, schedules, prerequisites | courses, course_sections, course_schedules, course_prerequisites |
| Enrollments | Student enrollment, grades, drops, retakes, instructor/TA assignments | course_enrollments, course_instructors, course_tas |
| Files | Upload, download, versioning, permissions, folders | files, file_versions, folders, file_permissions |
| Email | Nodemailer for verification/reset emails | (no tables) |
| YouTube | Video upload/management via Google API | (no tables) |

### Technology Stack
- **Framework**: NestJS v11
- **ORM**: TypeORM v0.3
- **Database**: MySQL/MariaDB
- **Auth**: JWT (passport-jwt)
- **Validation**: class-validator + class-transformer
- **API Docs**: Swagger/OpenAPI
- **Email**: Nodemailer

### Database
- **137 tables + 2 views** defined in `eduverse_db.sql`
- Most tables lack corresponding backend modules

## Frontend Dashboards Requiring Backend Support

| Dashboard | Components | Priority Features |
|-----------|------------|-------------------|
| Admin | 26 components | User/course/department management, analytics, enrollment periods, payments, security |
| Instructor | 40 components | Course detail, assignments, grades, quizzes, attendance, labs, discussions, materials |
| Student | 28 components | Enrolled courses, assignments, grades, quizzes, schedule, messaging, gamification, AI |
| IT Admin | 19 components | System monitoring, security, backups, database, integrations, multi-campus |
| TA | 20 components | Grading, attendance, quizzes, labs, discussions, office hours, materials |

## Implementation Phases (Revised Priority Order)

> **Note**: Gamification, Payments, and AI are moved to last phases per team decision. AI will be integrated by a separate team.

| Phase | Title | Modules | Priority | Doc File |
|-------|-------|---------|----------|----------|
| 1 | Core Academic Operations | 5 modules | 🔴 Critical | [Phase 1](./phase-01-core-academic.md) |
| 2 | Communication & Collaboration | 5 modules | 🟠 High | [Phase 2](./phase-02-communication.md) |
| 3 | Scheduling & Calendar | 1 module | 🟠 High | [Phase 3](./phase-03-scheduling.md) |
| 4 | Analytics & Reporting | 2 modules | 🟡 Medium | [Phase 4](./phase-04-analytics.md) |
| 5 | Course Content & Materials | 1 module | 🟡 Medium | [Phase 5](./phase-05-materials.md) |
| 6 | User Management & Admin | 2 modules | 🟡 Medium | [Phase 8](./phase-08-user-management.md) |
| 7 | System & IT Administration | 4 modules | 🟡 Medium | [Phase 9](./phase-09-system-admin.md) |
| 8 | Advanced Features | 7 modules | 🟢 Lower | [Phase 11](./phase-11-advanced.md) |
| 9 | Tasks & Reminders | 1 module | 🟢 Lower | [Phase 6](./phase-06-gamification.md) |
| 10 | Gamification | 1 module | 🔵 Last | [Phase 6](./phase-06-gamification.md) |
| 11 | Payments & Certificates | 2 modules | 🔵 Last | [Phase 10](./phase-10-payments.md) |
| 12 | AI Features (External Team) | 1 module | 🔵 Last | [Phase 7](./phase-07-ai.md) |

**Total: 32 new modules across 12 phases**

## Developer Assignment (3-Developer Parallel Plan)

See **[Developer Assignment & Sprint Plan](./developer-assignment.md)** for the complete breakdown of how all phases are distributed across 3 developers working in parallel.

## Architecture Pattern

Every module follows the standard NestJS pattern:

```
module-name/
├── module-name.module.ts          # Module definition
├── entities/
│   └── entity-name.entity.ts      # TypeORM entities
├── dto/
│   ├── create-entity.dto.ts       # Create DTOs with validation
│   ├── update-entity.dto.ts       # Update DTOs (PartialType)
│   └── entity-response.dto.ts     # Response DTOs
├── enums/
│   └── entity-status.enum.ts      # Enumerations
├── controllers/
│   └── entity.controller.ts       # REST controllers
├── services/
│   └── entity.service.ts          # Business logic
└── exceptions/
    └── entity-not-found.exception.ts  # Custom exceptions
```

## Cross-Cutting Concerns

### Authentication & Authorization
- All endpoints require JWT authentication (`@UseGuards(JwtAuthGuard)`)
- Role-based access via `@Roles()` decorator
- Roles: `STUDENT`, `INSTRUCTOR`, `TA`, `ADMIN`, `IT_ADMIN`

### Pagination
```typescript
interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

### Error Handling
- Custom exceptions extending `HttpException`
- Consistent error response format
- Proper HTTP status codes

### API Response Format
```typescript
// Success
{ data: T, message: string }

// Error
{ statusCode: number, message: string, error: string }

// Paginated
{ data: T[], meta: { total, page, limit, totalPages } }
```

### Localization (Arabic + English)
- All user-facing content supports **Arabic (ar)** and **English (en)**
- Uses centralized `content_translations` table (not separate columns)
- API endpoints accept `Accept-Language` header (`ar` or `en`, default: `en`)
- Entities with translatable fields: courses, assignments, quizzes, announcements, materials, labs, notifications, calendar events
- Non-translatable entities: grades, attendance records, enrollments, files, payments, logs, analytics
- See [Developer Assignment](./developer-assignment.md) for full localization implementation pattern

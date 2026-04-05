# Quickstart: Wire Dashboard Modules

**Feature Branch**: `001-wire-dashboard-modules`  
**Date**: 2026-03-18

## Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+
- Access to backend API at `http://localhost:8081/api`

## Setup

### 1. Clone and Checkout

```bash
git clone <repo-url>
cd eduverse
git checkout 001-wire-dashboard-modules
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Install i18n (New Requirement)

```bash
npm install react-i18next i18next i18next-browser-languagedetector
```

### 4. Environment Setup

Create `.env.local` if not exists:

```env
VITE_API_BASE_URL=http://localhost:8081/api
```

### 5. Start Development Server

```bash
npm run dev
```

App runs at `http://localhost:5173`

---

## Test Accounts

| Role       | Email                        | Password      |
| ---------- | ---------------------------- | ------------- |
| Student    | student.tarek@example.com    | SecureP@ss123 |
| Instructor | instructor.tarek@example.com | SecureP@ss123 |
| TA         | ta.tarek@example.com         | SecureP@ss123 |
| Admin      | admin.tarek@example.com      | SecureP@ss123 |
| IT Admin   | it_admin.tarek@example.com   | SecureP@ss123 |

---

## Key File Locations

### Services (API Layer)

```
src/services/api/
├── client.ts              # HTTP client (Axios + Fetch)
├── assignmentService.ts   # Assignment CRUD + submissions
├── quizService.ts         # Quiz CRUD + attempts + grading
├── labService.ts          # Lab CRUD + submissions
└── authService.ts         # Authentication + role detection
```

### Dashboard Components

**Student:**

```
src/pages/student-dashboard/components/
├── Assignments.tsx        # View & submit assignments
├── AssignmentDetails.tsx  # Assignment detail + submission form
├── QuizTaking.tsx         # Quiz attempt with timer
└── LabInstructions.tsx    # Lab view + submission
```

**Instructor:**

```
src/pages/instructor-dashboard/components/
├── AssignmentsList.tsx    # Assignment list (prop-based)
├── AssignmentModal.tsx    # Create/edit assignment form
├── QuizzesPage.tsx        # Quiz management
└── LabsPage.tsx           # Lab management
```

**TA:**

```
src/pages/ta-dashboard/components/
├── QuizzesPage.tsx        # View quizzes + grade essays
└── LabsPage.tsx           # View + grade labs
```

### Hooks & Context

```
src/hooks/useApi.ts        # Data fetching hook
src/context/AuthContext.tsx # Auth state + role detection
src/context/LanguageContext.tsx # i18n (to be migrated)
```

### Types (To Be Created)

```
src/types/api.ts           # Centralized API type definitions
```

---

## Development Workflow

### 1. Verify Backend Connection

```bash
curl http://localhost:8081/api/health
```

### 2. Login and Test

1. Open `http://localhost:5173`
2. Login with test account
3. Navigate to relevant dashboard

### 3. Check Browser Console

- API calls logged
- Errors shown with stack traces
- Network tab shows request/response

### 4. Run Lint

```bash
npm run lint
```

### 5. Format Code

```bash
npm run format
```

---

## Common Tasks

### Add New API Method

1. Open relevant service file (e.g., `quizService.ts`)
2. Add method using `ApiClient`:

```typescript
static async newMethod(params: ParamType): Promise<ReturnType> {
  return ApiClient.get<ReturnType>('/quizzes/endpoint', { params });
}
```

### Wire Component to API

1. Import service and `useApi`:

```typescript
import { useApi } from '@/hooks/useApi';
import { QuizService } from '@/services/api/quizService';
```

2. Replace mock data:

```typescript
// Before (mock)
const quizzes = MOCK_QUIZZES;

// After (API)
const { data: quizzes, loading, error } = useApi(() => QuizService.getAll(), []);
```

3. Handle loading/error:

```typescript
if (loading) return <Skeleton />;
if (error) {
  toast.error(error);
  return <EmptyState message="Failed to load" />;
}
```

### Add Translation

1. Add key to `src/locales/en.json`:

```json
{
  "assignments": {
    "title": "Assignments",
    "submit": "Submit Assignment"
  }
}
```

2. Add Arabic in `src/locales/ar.json`:

```json
{
  "assignments": {
    "title": "المهام",
    "submit": "إرسال المهمة"
  }
}
```

3. Use in component:

```typescript
import { useTranslation } from 'react-i18next';

function Component() {
  const { t } = useTranslation();
  return <h1>{t('assignments.title')}</h1>;
}
```

### Check Role Access

```typescript
import { useAuth } from '@/context/AuthContext';

function Component() {
  const { user } = useAuth();
  const isTA = user?.roles.includes('teaching_assistant');
  const isInstructor = user?.roles.includes('instructor');

  return (
    <>
      {isInstructor && <Button>Create</Button>}
      {!isTA && <Button>Delete</Button>}
    </>
  );
}
```

---

## Troubleshooting

### API Returns 401

- Token expired - logout and login again
- Check localStorage for `accessToken`

### CORS Errors

- Verify backend is running on port 8081
- Check `vite.config.js` proxy settings

### Component Not Updating

- Check `useApi` dependencies array
- Call `refetch()` after mutations

### Mock Data Still Showing

- Look for `MOCK_*` constants or `defaultXxx` fallbacks
- Remove/replace with API calls

---

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run preview          # Preview production build

# Code Quality
npm run lint             # ESLint check
npm run lint:fix         # Auto-fix lint issues
npm run format           # Prettier format
npm run format:check     # Check formatting

# Type Check
npx tsc --noEmit         # TypeScript validation
```

---

## Next Steps

After this feature is complete:

1. Run `speckit.tasks` to generate implementation tasks
2. Follow task order respecting dependencies
3. Test each dashboard role
4. Run accessibility audit with WAVE
5. Verify all mock data removed

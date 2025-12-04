# Student Dashboard Routes and Structure

## Folder Structure

```
src/pages/student-dashboard/
├── StudentDashboard.tsx (Main component with routing)
├── components/ (All dashboard components)
│   ├── Sidebar.tsx
│   ├── Header.tsx
│   ├── ClassTab.tsx
│   ├── GpaChart.tsx
│   ├── DailySchedule.tsx
│   ├── PaymentHistory.tsx
│   ├── WeeklySchedule.tsx
│   ├── GradesTranscript.tsx
│   ├── Assignments.tsx
│   ├── AcademicCalendar.tsx
│   ├── AIFeatures.tsx
│   ├── MessagingChat.tsx
│   ├── StatsCard.tsx
│   └── index.ts (exports)
├── pages/ (Sub-pages and views)
│   ├── CourseView.tsx (Course details and lessons)
│   └── index.ts (exports)
├── constants.ts (Dashboard data)
└── index.ts (exports)
```

## Complete Route List

### Base Dashboard Route
- **`/studentdashboard`** - Redirects to `/studentdashboard/dashboard`
- **`/dashboard`** - Legacy route (redirects to `/studentdashboard`)

### All Tab Routes

#### 1. Dashboard
- **`/studentdashboard/dashboard`** - Main dashboard view with stats, charts, and overview
  - Stats Cards: Credits, GPA, Active Classes
  - GPA Area Chart with trends
  - Daily Schedule
  - Payment History

#### 2. My Classes
- **`/studentdashboard/myclass`** - List of enrolled courses
  - Course Cards with progress bars
  - Instructor information
  - Schedule details
  - View Course button

#### 3. Course View
- **`/studentdashboard/myclass/:courseId`** - Detailed course view
  - Course header with ratings and metadata
  - Course preview video
  - Tabs: Overview, Notes, Announcements, Reviews
  - **Expandable Sections**:
    - Course Introduction (4 lessons)
    - Core Concepts (8 lessons)
    - Advanced Topics (6 lessons)
    - Final Project & Assessment (3 lessons)
  - Individual Lessons with:
    - Completion status checkbox
    - Type badge (Video, Resource, Quiz)
    - Duration indicator
    - Selection state

#### 4. Schedule
- **`/studentdashboard/schedule`** - Weekly schedule view
  - Calendar grid
  - Event cards with times
  - Course information

#### 5. Assignments
- **`/studentdashboard/assignments`** - Assignment list
  - Assignment cards
  - Due dates
  - Submission status
  - Grade information

#### 6. Calendar
- **`/studentdashboard/calendar`** - Academic calendar
  - Full calendar view
  - Important dates
  - Holiday markers
  - Event details

#### 7. AI Features
- **`/studentdashboard/ai`** - AI-powered learning tools
  - AI assistant interface
  - Smart recommendations
  - Learning analytics

#### 8. Grades
- **`/studentdashboard/grades`** - Grades & Transcript
  - Grade table
  - GPA history
  - Transcript details
  - Subject-wise grades

#### 9. Payments
- **`/studentdashboard/payments`** - Payment History
  - Invoice list
  - Payment status
  - Download receipts
  - Total balance

#### 10. Chat
- **`/studentdashboard/chat`** - Messaging interface
  - Conversation list
  - Chat window
  - Message history
  - Send messages

## Route Parameters

### Tab Parameter
```typescript
:tab = 'dashboard' | 'myclass' | 'schedule' | 'assignments' | 'calendar' | 'ai' | 'grades' | 'payments' | 'chat'
```

### ID Parameter (Currently used for course ID)
```typescript
:id = courseId (string) // e.g., '1', '2', '3', etc.
```

## Route Matching Examples

| URL | View |
|-----|------|
| `/studentdashboard` | Dashboard (default) |
| `/studentdashboard/dashboard` | Dashboard overview |
| `/studentdashboard/myclass` | My Classes list |
| `/studentdashboard/myclass/1` | Course Details (CS101) |
| `/studentdashboard/schedule` | Weekly schedule |
| `/studentdashboard/assignments` | Assignments list |
| `/studentdashboard/calendar` | Academic calendar |
| `/studentdashboard/ai` | AI Features |
| `/studentdashboard/grades` | Grades & Transcript |
| `/studentdashboard/payments` | Payment History |
| `/studentdashboard/chat` | Messaging |

## Navigation Flow

```
App.jsx (Router)
  ↓
StudentDashboard.tsx (Main Layout)
  ├── Sidebar (Navigation)
  │   └── onTabChange → navigate(`/studentdashboard/:tab`)
  │
  ├── ClassTab
  │   └── onViewCourse → navigate(`/studentdashboard/myclass/:courseId`)
  │
  └── CourseView
      └── onBack → navigate(`/studentdashboard/myclass`)
```

## Code Examples

### Navigate to a Tab
```typescript
import { useNavigate } from 'react-router-dom';

function MyComponent() {
  const navigate = useNavigate();
  
  const goToDashboard = () => navigate('/studentdashboard/dashboard');
  const goToClasses = () => navigate('/studentdashboard/myclass');
  const goToSchedule = () => navigate('/studentdashboard/schedule');
}
```

### Navigate to Course View
```typescript
const handleViewCourse = (courseId: string) => {
  navigate(`/studentdashboard/myclass/${courseId}`);
};
```

### Get Current Tab from URL
```typescript
import { useLocation } from 'react-router-dom';

function MyComponent() {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const activeTab = pathSegments[1] || 'dashboard'; // e.g., 'myclass', 'schedule'
  const id = pathSegments[2]; // e.g., courseId if viewing course
}
```

## State Management

### StudentDashboard Component
```typescript
const navigate = useNavigate();
const location = useLocation();
const [sidebarOpen, setSidebarOpen] = useState(true);
const [viewingCourseId, setViewingCourseId] = useState<string | null>(null);

// Derive active tab from URL
const pathSegments = location.pathname.split('/').filter(Boolean);
const activeTab = pathSegments[1] || 'dashboard';
```

## Callback Functions

### Sidebar
- `onTabChange(tabId)` - Navigate to `/studentdashboard/:tab`
- `onToggle()` - Toggle drawer open/close

### ClassTab
- `onViewCourse(courseId)` - Navigate to `/studentdashboard/myclass/:courseId`

### CourseView
- `onBack()` - Navigate back to `/studentdashboard/myclass`

## Query Parameters (Future)

Potential enhancements with query parameters:
```
/studentdashboard/assignments?status=pending&sort=date
/studentdashboard/grades?semester=fall&year=2024
/studentdashboard/payments?year=2024
```

## Protected Routes

All routes under `/studentdashboard` are protected:
- Requires authentication
- If not authenticated, redirects to `/login`
- AuthService.isAuthenticated() is checked in App.jsx

## Backward Compatibility

- Old `/dashboard` route redirects to `/studentdashboard`
- Old `/dashboard/*` routes redirect to `/studentdashboard`
- No breaking changes for bookmarked URLs

## Future Enhancements

1. Add lesson ID routing: `/studentdashboard/myclass/:courseId/lesson/:lessonId`
2. Add assignment detail: `/studentdashboard/assignment/:assignmentId`
3. Add payment detail: `/studentdashboard/payment/:paymentId`
4. Add message thread: `/studentdashboard/chat/:conversationId`
5. Add search params for filters and sorting
6. Add breadcrumb navigation using location
7. Implement lazy loading with React.lazy for each route


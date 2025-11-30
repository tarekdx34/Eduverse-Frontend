# Eduverse Frontend Project Structure

This document outlines the folder structure for the Eduverse frontend application, organized to align with the backend development phases.

## Directory Overview

```
src/
├── assets/                 # Static assets
│   ├── images/            # Image files
│   ├── icons/             # Icon files
│   └── fonts/             # Font files
│
├── components/            # Reusable React components
│   ├── admin/             # Admin dashboard components
│   ├── ai/                # AI features components
│   ├── analytics/         # Analytics dashboard components
│   ├── assignments/       # Assignment components
│   ├── attendance/        # Attendance system components
│   ├── auth/              # Authentication components (login, register, 2FA)
│   ├── calendar/          # Calendar & scheduling components
│   ├── campus/            # Campus structure components
│   ├── community/         # Community & forum components
│   ├── courses/           # Course management components
│   ├── gamification/      # Gamification components (badges, leaderboards)
│   ├── grading/           # Grading system components
│   ├── labs/              # Lab management components
│   ├── messaging/         # Messaging & notification components
│   ├── quizzes/           # Quiz system components
│   └── shared/            # Shared/common components (buttons, modals, etc.)
│
├── context/               # React Context for state management
│
├── hooks/                 # Custom React hooks
│
├── layouts/               # Layout components (header, sidebar, footer)
│
├── middleware/            # Request/response middleware
│
├── pages/                 # Page components (one per route)
│   ├── admin/             # Admin pages
│   ├── ai/                # AI features pages
│   ├── analytics/         # Analytics pages
│   ├── assignments/       # Assignment pages
│   ├── attendance/        # Attendance pages
│   ├── auth/              # Auth pages (login, register, forgot password)
│   ├── calendar/          # Calendar pages
│   ├── campus/            # Campus pages
│   ├── community/         # Community pages
│   ├── courses/           # Course pages
│   ├── gamification/      # Gamification pages
│   ├── grades/            # Grades/GPA pages
│   ├── labs/              # Lab pages
│   ├── messaging/         # Messaging pages
│   ├── profile/           # User profile pages
│   └── quizzes/           # Quiz pages
│
├── services/              # API and utility services
│   ├── api/               # API service functions
│   ├── auth/              # Authentication service
│   └── storage/           # Local storage service
│
├── store/                 # Global state management (Redux, Zustand, etc.)
│
├── styles/                # Global and component styles
│   └── globals.css        # Tailwind CSS imports and globals
│
└── utils/                 # Utility functions
    ├── constants/         # Application constants
    ├── helpers/           # Helper functions
    └── validators/        # Form validation functions
```

## Backend Phases & Frontend Mapping

### Phase 1: Foundation & Core Infrastructure

**Frontend Components:**

- `src/components/auth/` - Login, Register, 2FA
- `src/pages/auth/` - Auth pages
- `src/services/auth/` - Auth service
- `src/context/` - Auth context

### Phase 2: Academic Structure

**Frontend Components:**

- `src/components/courses/` - Course creation, management
- `src/components/campus/` - Campus, department selection
- `src/pages/courses/` - Course listing, enrollment

### Phase 3: File Management System

**Frontend Components:**

- `src/services/storage/` - File upload/download services
- `src/components/shared/` - File manager component

### Phase 4: Course Content & Materials

**Frontend Components:**

- `src/components/courses/` - Material upload, organization
- `src/pages/courses/` - Student dashboard, materials view

### Phase 5: Assignments & Submissions

**Frontend Components:**

- `src/components/assignments/` - Assignment creation, submission
- `src/pages/assignments/` - Assignment listing, student tasks

### Phase 6: Quiz System

**Frontend Components:**

- `src/components/quizzes/` - Quiz builder, quiz taking
- `src/pages/quizzes/` - Quiz pages

### Phase 7: Grading System

**Frontend Components:**

- `src/components/grading/` - Grading interface, rubrics
- `src/pages/grades/` - Grade reports, GPA display

### Phase 8: Lab Management

**Frontend Components:**

- `src/components/labs/` - Lab creation, submissions
- `src/pages/labs/` - Lab pages

### Phase 9: Attendance System

**Frontend Components:**

- `src/components/attendance/` - Attendance marking
- `src/pages/attendance/` - Attendance records

### Phase 10: Communication Systems

**Frontend Components:**

- `src/components/messaging/` - Messaging, announcements, notifications
- `src/pages/messaging/` - Chat, notifications, announcements

### Phase 11: Gamification System

**Frontend Components:**

- `src/components/gamification/` - Badges, leaderboards, XP display
- `src/pages/gamification/` - Gamification dashboard

### Phase 12-13: AI Features

**Frontend Components:**

- `src/components/ai/` - AI assistant, chatbot, study helpers
- `src/pages/ai/` - AI features pages

### Phase 14: Analytics & Progress Tracking

**Frontend Components:**

- `src/components/analytics/` - Charts, metrics
- `src/pages/analytics/` - Analytics dashboard

### Phase 15: Calendar & Task Management

**Frontend Components:**

- `src/components/calendar/` - Calendar, event scheduling
- `src/pages/calendar/` - Calendar view

### Phase 16: Community & Collaboration

**Frontend Components:**

- `src/components/community/` - Forum, study groups
- `src/pages/community/` - Community pages

### Phase 17: Admin & System Management

**Frontend Components:**

- `src/components/admin/` - Admin controls
- `src/pages/admin/` - Admin dashboard

## Key Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check formatting
- `npm run preview` - Preview production build

## Technologies

- **React 19** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Utility-first CSS
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **PostCSS** - CSS transformations

## Getting Started

1. Navigate to the project directory: `cd eduverse`
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Format code: `npm run format`
5. Lint code: `npm run lint:fix`

## Notes

- All component folders are pre-created but empty
- Add components, pages, and services as needed during development
- Follow the backend phase sequence for implementing features
- Use context for state management and hooks for reusable logic
- Keep utilities organized in the utils folder by category

# EduVerse Frontend - Quick Reference Guide

## 📂 Project Structure

```
src/
├── pages/                           # Page-level components
│   ├── home/                        # Landing page
│   ├── auth/LoginPage.tsx          # Login form
│   ├── profile/ProfilePage.tsx     # User profile
│   └── student-dashboard/          # Main dashboard
│
├── components/ui/                   # UI component library
│   └── [40+ shadcn/ui components]
│
├── services/api/
│   ├── authService.ts              # Login/logout logic
│   ├── client.ts                   # HTTP client
│   └── config.ts                   # API configuration
│
├── context/
│   ├── LanguageContext.tsx         # Language state
│   └── ThemeContext.tsx            # Theme state
│
└── [hooks, lib, locales, styles, utils]
```

## 🔑 Key Features

| Feature | Location | Type |
|---------|----------|------|
| Authentication | `pages/auth/LoginPage.tsx` | Public |
| Dashboard | `pages/student-dashboard/StudentDashboard.tsx` | Protected |
| Landing Page | `pages/home/HomePage.tsx` | Public |
| Profile | `pages/profile/ProfilePage.tsx` | Protected |
| AI Features | `pages/student-dashboard/components/AIFeatures/` | Protected |
| API Client | `services/api/client.ts` | Service |

## 🛣️ Routes

```
/                          → HomePage (public)
/login                     → LoginPage (public)
/profile                   → ProfilePage (protected)
/studentdashboard          → StudentDashboard (protected)
/studentdashboard/:tab     → Dashboard with tab (protected)
/studentdashboard/:tab/:id → Course detail (protected)
```

## 🔐 Authentication

**Login Credentials (Mock):**
```
Email: tarekstudent@test.com
Password: 123456
```

**Key Methods:**
```typescript
AuthService.login(credentials)      // Login user
AuthService.logout()                // Logout user
AuthService.isAuthenticated()       // Check auth status
AuthService.getAccessToken()        // Get token
AuthService.getStoredUser()         // Get user data
```

## 📡 API Integration

**Base URL:** `http://localhost:8081`

**Example API Call:**
```typescript
import { ApiClient } from './services/api/client';

// GET request
const users = await ApiClient.get('/users/profile');

// POST request
const result = await ApiClient.post('/auth/login', {
  email: 'user@example.com',
  password: 'password'
});
```

## 🎨 Technology Stack

| Category | Technology |
|----------|-----------|
| Framework | React 19 |
| Build Tool | Vite + Rolldown |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| UI Components | Radix UI + shadcn/ui |
| Routing | React Router v7 |
| Forms | React Hook Form + Zod |
| State | React Context API |
| Charts | Recharts |
| Icons | Lucide React + Font Awesome |

## 🎯 Dashboard Tabs

1. **Dashboard** - Stats, GPA chart, daily schedule
2. **Classes** - Enrolled courses, course details
3. **Calendar** - Academic calendar
4. **Grades** - Transcript, GPA history
5. **Assignments** - Assignment list and status
6. **Payments** - Payment history
7. **AI Features** - 7 AI-powered tools
8. **Chat** - Student-instructor messaging

## 🤖 AI Features (7 Types)

1. **Chatbot** - Conversational learning assistant
2. **Summarizer** - Content summary generator
3. **Quiz Generator** - Practice question creator
4. **Recommendations** - Course suggestions
5. **Voice** - Text-to-speech/speech-to-text
6. **Image-to-Text** - OCR functionality
7. **Feedback** - Personalized learning insights

## 🚀 Development Commands

```bash
npm install           # Install dependencies
npm run dev          # Start dev server (http://localhost:5176)
npm run build        # Build for production
npm run lint         # Run ESLint
npm run lint:fix     # Fix linting issues
npm run format       # Format with Prettier
npm run preview      # Preview production build
npm run mcp          # Start MCP server
```

## 📊 Component Hierarchy

```
App
├── HomePage
│   ├── Header
│   ├── HeroSection
│   ├── AIFeaturesSection
│   ├── UserRolesSection
│   ├── GamificationSection
│   ├── PricingSection
│   ├── TestimonialsSection
│   └── Footer
├── LoginPage
├── ProfilePage
└── StudentDashboard
    ├── Sidebar
    ├── Header
    └── Content (Dynamic Tab)
        ├── StatsCard
        ├── GpaChart
        ├── ClassTab
        ├── GradesTranscript
        ├── Assignments
        ├── AIFeatures
        └── MessagingChat
```

## 🔒 Security Features

- JWT token-based authentication
- Protected routes with auth checks
- Bearer token in API headers
- Input validation with Zod
- Error handling and logging
- localStorage for token storage
- Logout clears all tokens

## 📈 Performance Features

- Vite hot module replacement
- Tree-shaking of unused code
- Code splitting per route
- React.memo for optimization
- useMemo and useCallback
- Lazy loading for AI features
- Minified production builds

## 🎨 Theme & Language

**Theme Context:**
- Dark/Light mode toggle
- Persists in localStorage
- Applies globally instantly
- System preference detection

**Language Context:**
- Multi-language support
- Stored in localStorage
- Easy to add new languages
- Translation strings in locales/

## 🧪 Testing Approach

**Manual Testing:**
- Login flow testing
- Route protection testing
- Dashboard navigation
- Data display verification
- Responsive design testing
- Theme persistence
- Mobile optimization

**Edge Cases:**
- Null user data
- Missing profile picture
- Network errors
- Invalid routes
- Rapid state changes
- Deep linking
- localStorage quota

## 📚 Data Models

**User Model:**
```typescript
interface User {
  userId: number
  email: string
  firstName: string
  lastName: string
  fullName: string
  phone: string
  campusId: string
  status: string
  roles: string[]
  lastLoginAt: string
  createdAt: string
}
```

**Course Model:**
```typescript
interface Course {
  courseId: number
  name: string
  instructor: string
  credits: number
  schedule: {days: string[], startTime: string, endTime: string}
  capacity: number
  enrolled: number
}
```

## 🐛 Debugging Tips

1. **Check API Connection:**
   ```
   Open DevTools → Network tab
   Try API call → Check response
   ```

2. **CORS Errors:**
   ```
   Check backend CORS configuration
   Verify frontend origin in backend
   See ApiClient error messages
   ```

3. **State Issues:**
   ```
   Check React DevTools
   Verify context providers
   Check localStorage values
   ```

4. **Styling Issues:**
   ```
   Verify Tailwind classes applied
   Check theme context
   Inspect element in DevTools
   ```

## 🔗 Important URLs

| Item | URL |
|------|-----|
| Frontend Dev | http://localhost:5176 |
| Backend API | http://localhost:8081 |
| Vite Config | vite.config.js |
| Tailwind Config | tailwind.config.js |
| ESLint Config | .eslintrc.json |
| Prettier Config | .prettierrc.json |

## 📋 File Naming Conventions

**Components:**
- PascalCase: `StudentDashboard.tsx`
- Descriptive names: `GpaChart.tsx`, `ClassTab.tsx`

**Services:**
- camelCase: `authService.ts`, `apiClient.ts`

**Utilities:**
- camelCase: `helpers.ts`, `validators.ts`

**Contexts:**
- PascalCase with Context suffix: `LanguageContext.tsx`

## 🎓 Code Style

- **Functional components** with hooks
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **ESLint + Prettier** for code quality
- **React Router** for routing
- **React Context** for state
- **shadcn/ui** components

## 🔄 Common Workflows

**Adding a New Route:**
```typescript
// 1. Create component in pages/
// 2. Import in App.jsx
// 3. Add Route in Router
// 4. Add to navigation if needed
```

**Adding a Dashboard Tab:**
```typescript
// 1. Create component in pages/student-dashboard/components/
// 2. Import in StudentDashboard.tsx
// 3. Add case in DashboardContent switch
// 4. Add button in Sidebar
```

**Calling API:**
```typescript
// 1. Import ApiClient
// 2. Use ApiClient.get/post/put/delete
// 3. Handle response in useState
// 4. Handle errors
```

## 📞 Team Information

**Frontend Developer:** Tarek Mohamed
**Role:** Full-stack frontend development
**Documentation:** Complete and comprehensive
**Status:** Production-ready
**Last Updated:** December 17, 2025

## 📖 Documentation Files

1. **EduVerse_Frontend_Documentation.md** - Team-level documentation
2. **TarekMohamed_Frontend_Documentation.md** - Individual documentation
3. **DOCUMENTATION_SUMMARY.md** - Overview of all docs
4. **QUICK_REFERENCE.md** - This file
5. **FORMATTING_INSTRUCTIONS.txt** - Word format guide

---

**For detailed information, see the comprehensive documentation files.**

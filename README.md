# EduVerse Frontend

EduVerse is a role-based education platform delivered as SaaS (Software as a Service). This repository contains the web application used by students, instructors, teaching assistants, administrators, and IT admins.

The frontend is built with React + Vite and connects to the EduVerse backend API for authentication, courses, schedules, labs, assignments, quizzes, attendance, grades, notifications, and analytics.

## What EduVerse Solves

EduVerse helps educational organizations run day-to-day academic operations in one platform:

- Learning delivery through courses, assignments, labs, and quizzes
- Academic operations through scheduling, attendance, and grading
- Communication through chat and announcements
- Oversight through role-based dashboards and analytics

## Core Features

- Authentication and role-aware access control
- Student dashboard for course activity, submissions, and progress
- Instructor dashboard for course management, grading, and reports
- Teaching assistant dashboard for labs, submissions, and grading workflows
- Admin and IT admin dashboards for platform operations and oversight
- Course enrollment and learning content flows
- Assignment and quiz workflows
- Lab instruction and submission workflows
- Attendance tracking and schedule management
- Announcement, notification, and messaging integrations
- Multi-language support with i18next
- Theme-aware UI patterns and reusable component architecture

## How This SaaS Works

EduVerse follows a typical multi-role SaaS lifecycle:

1. Organization Setup
Admins and IT admins configure users, courses, and operational settings for the institution.

2. User Access
Users sign in and are routed to role-specific dashboards with only the permissions and tools relevant to their role.

3. Academic Delivery
Instructors and TAs publish course content, assignments, quizzes, and labs. Students interact with these modules and submit work.

4. Operations and Monitoring
Attendance, schedules, notifications, and grading run continuously across the semester.

5. Evaluation and Insights
Grades and analytics help instructors and admins monitor performance, identify bottlenecks, and improve outcomes.

Because it is SaaS, users access EduVerse through the web app without installing desktop software, and updates are delivered centrally through deployments.

## Tech Stack

- React 19
- Vite (rolldown-vite)
- React Router
- React Query
- Axios and Fetch API client wrappers
- Tailwind CSS
- Vitest and Testing Library
- ESLint + Prettier

## Project Structure

Main app code lives in src with feature areas such as:

- src/pages/student-dashboard
- src/pages/instructor-dashboard
- src/pages/ta-dashboard
- src/pages/admin-dashboard
- src/pages/it-admin-dashboard
- src/services/api
- src/components
- src/context

## Getting Started

Prerequisites:

- Node.js 18+
- npm
- EduVerse backend running locally or in a reachable environment

Install dependencies:

npm install

Create your environment file:

- Copy `.env.example` to `.env.local`
- Update `VITE_API_URL` to point at your backend (Hugging Face Space, local backend, etc.)

Start development server:

npm run dev

Build for production:

npm run build

Preview production build:

npm run preview

Run tests:

npm run test

## API and Environment Notes

- Development API requests are proxied from /api to http://localhost:8081 via Vite config.
- The API client uses src/services/api/config.ts and src/services/api/client.ts.
- In development mode, API_BASE_URL is /api.
- In production mode, default API_BASE_URL falls back to http://localhost:8081/api unless overridden in your deployment setup.

For production deployments, configure the backend API endpoint to your live backend domain.

## Available Scripts

- npm run dev: Start Vite dev server
- npm run build: Build production assets
- npm run preview: Preview built assets
- npm run test: Run tests
- npm run test:ui: Run tests with UI
- npm run test:coverage: Run coverage report
- npm run lint: Lint codebase
- npm run lint:fix: Auto-fix lint issues
- npm run format: Format project with Prettier
- npm run format:check: Check formatting
- npm run mcp: Run local MCP server script

## MCP Integration

This repository also includes MCP-related tooling for integration and experimentation.

- Entry script: mcp-server.js
- Project MCP config: mcp-config.json

If you use external API keys for MCP integrations, store them in environment files and do not commit secrets.

## Deployment

EduVerse frontend can be deployed to platforms such as Vercel. Recommended flow:

1. Configure production API URL and required environment variables.
2. Run npm run build locally to validate the artifact.
3. Deploy from main branch.

If build fails in Linux CI or Vercel, verify import path casing matches actual filenames exactly.

## Related Repository

Backend service for EduVerse is in the companion repository under eduverse-backend.

## License

This project is developed as part of the EduVerse platform. Add your preferred license policy here.

import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Toaster } from 'sonner';

import HomePage from './pages/home/HomePage';
import LoginPage from './pages/auth/LoginPage';
import ProfilePage from './pages/profile/ProfilePage';
import { QuickNavigateModal } from './components/QuickNavigateModal';
import { useTheme } from './context/ThemeContext';

// Lazy load dashboard components
const StudentDashboard = lazy(() => import('./pages/student-dashboard/StudentDashboard'));
const InstructorDashboard = lazy(() => import('./pages/instructor-dashboard/InstructorDashboard'));
const AdminDashboard = lazy(() => import('./pages/admin-dashboard/AdminDashboard'));
const ITAdminDashboard = lazy(() => import('./pages/it-admin-dashboard/ITAdminDashboard'));
const TADashboard = lazy(() => import('./pages/ta-dashboard/TADashboard'));

// Placeholder for PageTitle and PageFallback - assuming these are defined elsewhere or will be added
// For the purpose of this edit, we'll define simple versions.
const PageTitle = ({ title, children }) => {
  document.title = title ? `${title} | Eduverse` : 'Eduverse';
  return children;
};

const PageFallback = () => {
  // Check all possible theme storage keys from different dashboards
  const themeKeys = [
    'eduverse-student-theme',
    'eduverse-instructor-theme',
    'eduverse-admin-theme',
    'eduverse-it-admin-theme',
    'eduverse-ta-theme',
    'theme',
  ];

  let savedTheme = null;
  for (const key of themeKeys) {
    const value = localStorage.getItem(key);
    if (value) {
      savedTheme = value;
      break;
    }
  }

  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = savedTheme ? savedTheme === 'dark' : systemDark;

  return (
    <div
      className={`flex items-center justify-center h-screen transition-colors duration-300 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}
    >
      <div className="flex flex-col items-center gap-8">
        {/* Bouncing Dots Animation */}
        <div className="flex gap-2 h-12 items-end">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                isDark ? 'bg-slate-400' : 'bg-slate-500'
              }`}
              style={{
                animation: `bounce 1.4s infinite ease-in-out`,
                animationDelay: `${i * 0.16}s`,
              }}
            />
          ))}
        </div>

        {/* Text */}
        <div className="flex flex-col items-center gap-2">
          <h1
            className={`text-3xl font-bold tracking-tight transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            Eduverse
          </h1>
          <p
            className={`text-sm font-medium transition-colors duration-300 ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            Loading your experience...
          </p>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% {
            transform: translateY(0);
            opacity: 0.7;
          }
          40% {
            transform: translateY(-16px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

function App() {
  const theme = useTheme();
  const isDark = theme && typeof theme === 'object' && 'isDark' in theme ? theme.isDark : false;

  return (
    <Router>
      <Toaster 
        position="top-right" 
        expand={false} 
        richColors 
        theme={isDark ? 'dark' : 'light'}
        toastOptions={{
          style: {
            fontFamily: "'Montserrat', sans-serif",
          },
        }}
      />
      <QuickNavigateModal />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          {/* Home Page - Public */}
          <Route
            path="/"
            element={
              <PageTitle title="Home">
                <HomePage />
              </PageTitle>
            }
          />

          {/* Login Page - Public */}
          <Route
            path="/login"
            element={
              <PageTitle title="Login">
                <LoginPage />
              </PageTitle>
            }
          />

          {/* Profile Page */}
          <Route
            path="/profile"
            element={
              <PageTitle title="Profile">
                <ProfilePage />
              </PageTitle>
            }
          />

          {/* Student Dashboard */}
          <Route
            path="/studentdashboard"
            element={
              <PageTitle title="Student Dashboard">
                <StudentDashboard />
              </PageTitle>
            }
          />
          <Route
            path="/studentdashboard/:tab"
            element={
              <PageTitle title="Student Dashboard">
                <StudentDashboard />
              </PageTitle>
            }
          />
          <Route
            path="/studentdashboard/:tab/:id"
            element={
              <PageTitle title="Student Dashboard">
                <StudentDashboard />
              </PageTitle>
            }
          />

          {/* Instructor Dashboard - Development (no auth protection) */}
          <Route
            path="/instructordashboard"
            element={
              <PageTitle title="Instructor Dashboard">
                <InstructorDashboard />
              </PageTitle>
            }
          />
          <Route
            path="/instructordashboard/:tab"
            element={
              <PageTitle title="Instructor Dashboard">
                <InstructorDashboard />
              </PageTitle>
            }
          />
          <Route
            path="/instructordashboard/:tab/:id"
            element={
              <PageTitle title="Instructor Dashboard">
                <InstructorDashboard />
              </PageTitle>
            }
          />

          {/* Admin Dashboard - Development (no auth protection) */}
          <Route
            path="/admindashboard"
            element={
              <PageTitle title="Admin Dashboard">
                <AdminDashboard />
              </PageTitle>
            }
          />
          <Route
            path="/admindashboard/:tab"
            element={
              <PageTitle title="Admin Dashboard">
                <AdminDashboard />
              </PageTitle>
            }
          />
          <Route
            path="/admindashboard/:tab/:id"
            element={
              <PageTitle title="Admin Dashboard">
                <AdminDashboard />
              </PageTitle>
            }
          />

          {/* IT Admin Dashboard - Development (no auth protection) */}
          <Route
            path="/itadmindashboard"
            element={
              <PageTitle title="IT Admin Dashboard">
                <ITAdminDashboard />
              </PageTitle>
            }
          />
          <Route
            path="/itadmindashboard/:tab"
            element={
              <PageTitle title="IT Admin Dashboard">
                <ITAdminDashboard />
              </PageTitle>
            }
          />
          <Route
            path="/itadmindashboard/:tab/:id"
            element={
              <PageTitle title="IT Admin Dashboard">
                <ITAdminDashboard />
              </PageTitle>
            }
          />

          {/* TA Dashboard - Development (no auth protection) */}
          <Route
            path="/tadashboard"
            element={
              <PageTitle title="TA Dashboard">
                <TADashboard />
              </PageTitle>
            }
          />
          <Route
            path="/tadashboard/:tab"
            element={
              <PageTitle title="TA Dashboard">
                <TADashboard />
              </PageTitle>
            }
          />
          <Route
            path="/tadashboard/:tab/:id"
            element={
              <PageTitle title="TA Dashboard">
                <TADashboard />
              </PageTitle>
            }
          />

          {/* Legacy /dashboard route - redirect to /studentdashboard */}
          <Route path="/dashboard" element={<Navigate to="/studentdashboard" replace />} />
          <Route path="/dashboard/*" element={<Navigate to="/studentdashboard" replace />} />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;

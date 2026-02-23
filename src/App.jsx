import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

import HomePage from './pages/home/HomePage';
import LoginPage from './pages/auth/LoginPage';
import ProfilePage from './pages/profile/ProfilePage';
import { QuickNavigateModal } from './components/QuickNavigateModal';

// Lazy load dashboard components
const StudentDashboard = lazy(() => import('./pages/student-dashboard/StudentDashboard'));
const InstructorDashboard = lazy(() => import('./pages/instructor-dashboard/InstructorDashboard'));
const AdminDashboard = lazy(() => import('./pages/admin-dashboard/AdminDashboard'));
const ITAdminDashboard = lazy(() => import('./pages/it-admin-dashboard/ITAdminDashboard'));
const TADashboard = lazy(() => import('./pages/ta-dashboard/TADashboard'));

// Placeholder for PageTitle and PageFallback - assuming these are defined elsewhere or will be added
// For the purpose of this edit, we'll define simple versions.
const PageTitle = ({ title, children }) => {
  document.title = title ? `${title} | Your App Name` : 'Your App Name';
  return children;
};

const PageFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <Loader2 className="h-8 w-8 animate-spin" />
  </div>
);


function App() {
  return (
    <Router>
      <QuickNavigateModal />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          {/* Home Page - Public */}
          <Route path="/" element={<PageTitle title="Home"><HomePage /></PageTitle>} />

          {/* Login Page - Public */}
          <Route path="/login" element={<PageTitle title="Login"><LoginPage /></PageTitle>} />

          {/* Profile Page */}
          <Route path="/profile" element={<PageTitle title="Profile"><ProfilePage /></PageTitle>} />

          {/* Student Dashboard */}
          <Route path="/studentdashboard" element={<PageTitle title="Student Dashboard"><StudentDashboard /></PageTitle>} />
          <Route path="/studentdashboard/:tab" element={<PageTitle title="Student Dashboard"><StudentDashboard /></PageTitle>} />
          <Route path="/studentdashboard/:tab/:id" element={<PageTitle title="Student Dashboard"><StudentDashboard /></PageTitle>} />

          {/* Instructor Dashboard - Development (no auth protection) */}
          <Route path="/instructordashboard" element={<PageTitle title="Instructor Dashboard"><InstructorDashboard /></PageTitle>} />
          <Route path="/instructordashboard/:tab" element={<PageTitle title="Instructor Dashboard"><InstructorDashboard /></PageTitle>} />
          <Route path="/instructordashboard/:tab/:id" element={<PageTitle title="Instructor Dashboard"><InstructorDashboard /></PageTitle>} />

          {/* Admin Dashboard - Development (no auth protection) */}
          <Route path="/admindashboard" element={<PageTitle title="Admin Dashboard"><AdminDashboard /></PageTitle>} />
          <Route path="/admindashboard/:tab" element={<PageTitle title="Admin Dashboard"><AdminDashboard /></PageTitle>} />
          <Route path="/admindashboard/:tab/:id" element={<PageTitle title="Admin Dashboard"><AdminDashboard /></PageTitle>} />

          {/* IT Admin Dashboard - Development (no auth protection) */}
          <Route path="/itadmindashboard" element={<PageTitle title="IT Admin Dashboard"><ITAdminDashboard /></PageTitle>} />
          <Route path="/itadmindashboard/:tab" element={<PageTitle title="IT Admin Dashboard"><ITAdminDashboard /></PageTitle>} />
          <Route path="/itadmindashboard/:tab/:id" element={<PageTitle title="IT Admin Dashboard"><ITAdminDashboard /></PageTitle>} />

          {/* TA Dashboard - Development (no auth protection) */}
          <Route path="/tadashboard" element={<PageTitle title="TA Dashboard"><TADashboard /></PageTitle>} />
          <Route path="/tadashboard/:tab" element={<PageTitle title="TA Dashboard"><TADashboard /></PageTitle>} />
          <Route path="/tadashboard/:tab/:id" element={<PageTitle title="TA Dashboard"><TADashboard /></PageTitle>} />

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

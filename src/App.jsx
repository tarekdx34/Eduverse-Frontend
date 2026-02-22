import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/home/HomePage';
import LoginPage from './pages/auth/LoginPage';
import ProfilePage from './pages/profile/ProfilePage';
import StudentDashboard from './pages/student-dashboard/StudentDashboard';
import InstructorDashboard from './pages/instructor-dashboard/InstructorDashboard';
import AdminDashboard from './pages/admin-dashboard/AdminDashboard';
import ITAdminDashboard from './pages/it-admin-dashboard/ITAdminDashboard';
import TADashboard from './pages/ta-dashboard/TADashboard';

import { QuickNavigateModal } from './components/QuickNavigateModal';
import { PageTitle } from './components/PageTitle';

function App() {
  return (
    <Router>
      <QuickNavigateModal />
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
    </Router>
  );
}

export default App;

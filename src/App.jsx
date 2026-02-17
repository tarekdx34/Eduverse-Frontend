import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/home/HomePage';
import LoginPage from './pages/auth/LoginPage';
import ProfilePage from './pages/profile/ProfilePage';
import StudentDashboard from './pages/student-dashboard/StudentDashboard';
import InstructorDashboard from './pages/instructor-dashboard/InstructorDashboard';
import AdminDashboard from './pages/admin-dashboard/AdminDashboard';
import ITAdminDashboard from './pages/it-admin-dashboard/ITAdminDashboard';
import TADashboard from './pages/ta-dashboard/TADashboard';
import { AuthService } from './services/api/authService';
import { QuickNavigateModal } from './components/QuickNavigateModal';

function ProtectedRoute({ children }) {
  return AuthService.isAuthenticated() ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <QuickNavigateModal />
      <Routes>
        {/* Home Page - Public */}
        <Route path="/" element={<HomePage />} />

        {/* Login Page - Public */}
        <Route path="/login" element={<LoginPage />} />

        {/* Profile Page - Protected */}
        <Route
          path="/profile"
          element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}
        />

        {/* Student Dashboard - Protected with nested routes */}
        <Route
          path="/studentdashboard"
          element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>}
        />
        <Route
          path="/studentdashboard/:tab"
          element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>}
        />
        <Route
          path="/studentdashboard/:tab/:id"
          element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>}
        />

        {/* Instructor Dashboard - Development (no auth protection) */}
        <Route path="/instructordashboard" element={<InstructorDashboard />} />
        <Route path="/instructordashboard/:tab" element={<InstructorDashboard />} />
        <Route path="/instructordashboard/:tab/:id" element={<InstructorDashboard />} />

        {/* Admin Dashboard - Development (no auth protection) */}
        <Route path="/admindashboard" element={<AdminDashboard />} />
        <Route path="/admindashboard/:tab" element={<AdminDashboard />} />
        <Route path="/admindashboard/:tab/:id" element={<AdminDashboard />} />

        {/* IT Admin Dashboard - Development (no auth protection) */}
        <Route path="/itadmindashboard" element={<ITAdminDashboard />} />
        <Route path="/itadmindashboard/:tab" element={<ITAdminDashboard />} />
        <Route path="/itadmindashboard/:tab/:id" element={<ITAdminDashboard />} />

        {/* TA Dashboard - Development (no auth protection) */}
        <Route path="/tadashboard" element={<TADashboard />} />
        <Route path="/tadashboard/:tab" element={<TADashboard />} />
        <Route path="/tadashboard/:tab/:id" element={<TADashboard />} />

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

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/home/HomePage';
import LoginPage from './pages/auth/LoginPage';
import ProfilePage from './pages/profile/ProfilePage';
import StudentDashboard from './pages/student-dashboard/StudentDashboard';
import InstructorDashboard from './pages/instructor-dashboard/InstructorDashboard';
import { AuthService } from './services/api/authService';

function App() {
  const isAuthenticated = AuthService.isAuthenticated();

  return (
    <Router>
      <Routes>
        {/* Home Page - Public */}
        <Route path="/" element={<HomePage />} />

        {/* Login Page - Public */}
        <Route path="/login" element={<LoginPage />} />

        {/* Profile Page - Protected */}
        <Route
          path="/profile"
          element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />}
        />

        {/* Student Dashboard - Protected with nested routes */}
        <Route
          path="/studentdashboard"
          element={isAuthenticated ? <StudentDashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/studentdashboard/:tab"
          element={isAuthenticated ? <StudentDashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/studentdashboard/:tab/:id"
          element={isAuthenticated ? <StudentDashboard /> : <Navigate to="/login" />}
        />

        {/* Instructor Dashboard - Development (no auth protection) */}
        <Route path="/instructordashboard" element={<InstructorDashboard />} />
        <Route path="/instructordashboard/:tab" element={<InstructorDashboard />} />
        <Route path="/instructordashboard/:tab/:id" element={<InstructorDashboard />} />

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

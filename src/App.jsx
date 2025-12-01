import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/home/HomePage';
import LoginPage from './pages/auth/LoginPage';
import ProfilePage from './pages/profile/ProfilePage';
import { AuthService } from './services/api/authService';
import './App.css';

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

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;

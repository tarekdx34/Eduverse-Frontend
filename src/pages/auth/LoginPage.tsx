import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Globe, Sun, Moon } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { useLanguage } from '../home/contexts/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { AuthService } from '../../services/api/authService';
import backgroundImage from '../../assets/images/pexels-mart-production-8471990.jpg';
import QuickLoginModal from '../../components/dev/QuickLoginModal';
import './LoginPage.css';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isQuickLoginOpen, setIsQuickLoginOpen] = useState(false);
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const isArabic = language === 'ar';
  const { login: authLogin, loginMock } = useAuth();
  const enableDevQuickLogin = import.meta.env.DEV;

  // Handle keyboard shortcut for Quick Login (Ctrl + Shift + Q)
  useEffect(() => {
    if (!enableDevQuickLogin) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'Q') {
        e.preventDefault();
        setIsQuickLoginOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsQuickLoginOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableDevQuickLogin]);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const handleSubmit = async (e?: React.FormEvent, directEmail?: string, directPassword?: string) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    const loginEmail = directEmail || email;
    const loginPassword = directPassword || password;

    try {
      const user = await authLogin(loginEmail, loginPassword);
      // Use the returned user directly — avoids stale React state closure
      navigate(AuthService.getDashboardPath(user));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLoginSelect = (selectedEmail: string, selectedPassword: string) => {
    setEmail(selectedEmail);
    setPassword(selectedPassword);
    setIsQuickLoginOpen(false);
    // Trigger login immediately
    handleSubmit(undefined, selectedEmail, selectedPassword);
  };

  const handleOutlookSignIn = () => {
    // Handle Outlook sign in logic here
    console.log('Outlook sign in');
  };
  const handleLogo = () => {
    navigate('/');
  };

  return (
    <div className="login-page-wrapper">
      {/* Quick Login Modal */}
      {enableDevQuickLogin && (
        <QuickLoginModal
          isOpen={isQuickLoginOpen}
          onClose={() => setIsQuickLoginOpen(false)}
          onSelect={handleQuickLoginSelect}
        />
      )}

      {/* Animated Background Elements */}
      <div className="login-orb login-orb-1" />
      <div className="login-orb login-orb-2" />
      <div className="login-orb login-orb-3" />
      <div className="login-particles">
        <div className="login-particle" />
        <div className="login-particle" />
        <div className="login-particle" />
        <div className="login-particle" />
        <div className="login-particle" />
        <div className="login-particle" />
        <div className="login-particle" />
        <div className="login-particle" />
      </div>

      {/* Main Layout */}
      <div className="min-h-screen flex text-white">
        {/* Top-Right Toggle Buttons */}
        <div className={`fixed top-6 z-50 flex items-center gap-2 anim-logo ${isArabic ? 'left-6' : 'right-6'}`}>
          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="login-toggle-btn"
            title={isArabic ? 'Switch to English' : 'التبديل إلى العربية'}
          >
            <Globe className="w-4 h-4" />
            <span className="text-xs font-bold">{isArabic ? 'EN' : 'AR'}</span>
          </button>
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="login-toggle-btn"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* Left Side - Form Container */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16 login-left-panel anim-panel-left">
          <div className="w-full max-w-md space-y-8">
            {/* Logo */}
            <div className="flex justify-start mb-8 anim-logo">
              <button
                className="flex items-center space-x-3 cursor-pointer group"
                onClick={handleLogo}
              >
                <span className="text-5xl font-bold tracking-tight group-hover:opacity-80 transition-opacity login-logo">
                  {isArabic ? 'إيدوفيرس' : 'Eduverse'}
                </span>
              </button>
            </div>

            {/* Title Area */}
            <div className="space-y-2 anim-title">
              <h1 className="text-4xl font-bold tracking-tight login-heading">
                {isArabic ? 'تسجيل الدخول' : 'Sign In'}
              </h1>
              <p className="text-slate-400 text-sm font-medium login-subtitle">
                {isArabic
                  ? 'مرحباً بعودتك إلى رحلة التعلم الخاصة بك'
                  : 'Welcome back to your learning journey'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6 anim-form">
              {error && (
                <div className="login-error-box px-4 py-3 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-1">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1.5 login-input-group">
                  <label className="login-label">
                    {isArabic ? 'البريد الإلكتروني' : 'Email address'}
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 login-input-icon transition-colors" />
                    <Input
                      type="email"
                      placeholder={isArabic ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-12 h-14 login-glass-input rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5 login-input-group">
                  <div className="flex items-center justify-between">
                    <label className="login-label">{isArabic ? 'كلمة المرور' : 'Password'}</label>
                    <button type="button" className="text-xs font-medium login-forgot-link">
                      {isArabic ? 'هل نسيت كلمة المرور؟' : 'Forgot password?'}
                    </button>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 login-input-icon transition-colors" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder={isArabic ? 'أدخل كلمة المرور' : 'Enter your password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-12 pr-12 h-14 login-glass-input rounded-xl"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-14 rounded-xl text-base font-semibold login-btn-primary"
                disabled={loading}
              >
                <span>
                  {loading
                    ? isArabic
                      ? 'جاري تسجيل الدخول...'
                      : 'Signing in...'
                    : isArabic
                      ? 'تسجيل الدخول'
                      : 'Sign In'}
                </span>
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6 anim-divider">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
                <span className="px-4 login-divider-text">
                  {isArabic ? 'أو المتابعة باستخدام' : 'Or continue with'}
                </span>
              </div>
            </div>

            {/* Social / Outlook Sign In */}
            <button
              onClick={handleOutlookSignIn}
              className="w-full h-14 rounded-xl login-outlook-btn group anim-social"
            >
              <div className="flex items-center justify-center gap-3">
                <svg
                  className="w-5 h-5 transition-transform group-hover:scale-110"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M22 6.5V17.5C22 18.881 20.881 20 19.5 20H4.5C3.119 20 2 18.881 2 17.5V6.5C2 5.119 3.119 4 4.5 4H19.5C20.881 4 22 5.119 22 6.5Z"
                    fill="#0078D4"
                  />
                  <path
                    d="M22 6.5L12 13L2 6.5"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-white font-semibold text-sm">
                  {isArabic ? 'تسجيل الدخول باستخدام Outlook' : 'Sign in with Outlook'}
                </span>
              </div>
            </button>

            {/* Development / Quick Access Buttons */}
            <div className="mt-8 pt-6 border-t login-dev-divider anim-devtools">
              <p className="text-xs text-center login-dev-label mb-4 uppercase tracking-wider">
                {isArabic ? 'وصول سريع (للصيانة)' : 'Quick Access (Dev)'}
              </p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                <button
                  onClick={() => {
                    loginMock('student');
                    navigate('/studentdashboard');
                  }}
                  className="flex items-center justify-center px-3 py-2.5 rounded-full login-chip"
                >
                  <span>Student</span>
                </button>
                <button
                  onClick={() => {
                    loginMock('instructor');
                    navigate('/instructordashboard');
                  }}
                  className="flex items-center justify-center px-3 py-2.5 rounded-full login-chip"
                >
                  <span>Instructor</span>
                </button>
                <button
                  onClick={() => {
                    loginMock('admin');
                    navigate('/admindashboard');
                  }}
                  className="flex items-center justify-center px-3 py-2.5 rounded-full login-chip"
                >
                  <span>Admin</span>
                </button>
                <button
                  onClick={() => {
                    loginMock('it_admin');
                    navigate('/itadmindashboard');
                  }}
                  className="flex items-center justify-center px-3 py-2.5 rounded-full login-chip"
                >
                  <span>IT Admin</span>
                </button>
                <button
                  onClick={() => {
                    loginMock('teaching_assistant');
                    navigate('/tadashboard');
                  }}
                  className="col-span-2 lg:col-span-4 flex items-center justify-center px-3 py-2.5 rounded-full login-chip"
                >
                  <span>Teaching Assistant</span>
                </button>
              </div>
            </div>

            {/* Footer link */}
            <div className="mt-8 text-center text-sm font-medium login-footer-text anim-footer">
              {isArabic ? 'ليس لديك حساب؟' : "Don't have an account?"}{' '}
              <button className="login-footer-link hover:underline transition-all">
                {isArabic ? 'أنشئ حساباً مجانياً' : 'Create one for free'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Side - Hero/Branding */}
        <div className="hidden lg:flex lg:w-1/2 login-right-panel anim-panel-right">
          {/* Animated Background Elements */}
          <div className="login-hero-orb login-hero-orb-1" />
          <div className="login-hero-orb login-hero-orb-2" />
          <div className="login-hero-glow" style={{ top: '30%', left: '40%' }} />

          {/* Background Image With Overlay */}
          <div
            className="login-hero-image"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
          <div className="login-hero-overlay" />

          {/* Content Overlay */}
          <div className="relative z-10 flex flex-col justify-center items-center w-full h-full p-16 text-white text-center">
            <div className="space-y-6 max-w-xl">
              {/* Headline */}
              <h2 className="text-5xl font-bold tracking-tight mb-4 login-hero-heading">
                {isArabic ? 'اكتشف مستقبلك' : 'Discover Your Future'}
              </h2>

              {/* Description */}
              <p className="text-lg login-hero-description leading-relaxed">
                {isArabic
                  ? 'انضم إلى آلاف الطلاب والمحاضرين في نظام إدارة التعلم الأكثر تقدماً. نظام مصمم لتعزيز تجربتك التعليمية.'
                  : 'Join thousands of students and instructors on the most advanced learning management system. Designed to elevate your educational experience.'}
              </p>
            </div>

            {/* Floating Card Mockup */}
            <div className="mt-16 w-full max-w-md login-hero-card p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full login-card-avatar"></div>
                <div className="space-y-2 flex-1 text-left">
                  <div className="h-4 w-1/3 bg-white/20 rounded login-card-line"></div>
                  <div className="h-3 w-1/2 bg-white/10 rounded login-card-line"></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-16 w-full login-card-item rounded-xl border border-white/5 flex items-center px-4 gap-4">
                  <div className="w-8 h-8 rounded-lg login-card-icon"></div>
                  <div className="h-3 w-3/4 bg-white/10 rounded login-card-line"></div>
                </div>
                <div className="h-16 w-full login-card-item rounded-xl border border-white/5 flex items-center px-4 gap-4">
                  <div className="w-8 h-8 rounded-lg login-card-icon"></div>
                  <div className="h-3 w-2/3 bg-white/10 rounded login-card-line"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

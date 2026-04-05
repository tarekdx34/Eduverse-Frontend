import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { useLanguage } from '../home/contexts/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { AuthService } from '../../services/api/authService';
import backgroundImage from '../../assets/images/pexels-mart-production-8471990.jpg';

const login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { login: authLogin, logout: authLogout } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await authLogin(email, password);
      // Use the returned user directly — avoids stale React state closure
      navigate(AuthService.getDashboardPath(user));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOutlookSignIn = () => {
    // Handle Outlook sign in logic here
    console.log('Outlook sign in');
  };
  const handleLogo = () => {
    navigate('/');
  };

  return (
    <div
      className="min-h-screen flex text-slate-900 dark:text-white"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      {/* Left Side - Form Container */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16 bg-background-light dark:bg-background-dark transition-colors duration-300">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="flex justify-start mb-8">
            <button
              className="flex items-center space-x-2 cursor-pointer group"
              onClick={handleLogo}
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/30">
                {isArabic ? 'إ' : 'E'}
              </div>
              <span className="text-2xl font-bold tracking-tight group-hover:opacity-80 transition-opacity">
                {isArabic ? 'إيدوفيرس' : 'Eduverse'}
              </span>
            </button>
          </div>

          {/* Title Area */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              {isArabic ? 'تسجيل الدخول' : 'Sign In'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
              {isArabic
                ? 'مرحباً بعودتك إلى رحلة التعلم الخاصة بك'
                : 'Welcome back to your learning journey'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-1">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {isArabic ? 'البريد الإلكتروني' : 'Email address'}
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors" />
                  <Input
                    type="email"
                    placeholder={isArabic ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 h-12 bg-white dark:bg-card-dark border-gray-200 dark:border-white/10 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white placeholder:text-gray-400 rounded-xl transition-all shadow-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {isArabic ? 'كلمة المرور' : 'Password'}
                  </label>
                  <button
                    type="button"
                    className="text-xs font-medium text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  >
                    {isArabic ? 'هل نسيت كلمة المرور؟' : 'Forgot password?'}
                  </button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={isArabic ? 'أدخل كلمة المرور' : 'Enter your password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 pr-12 h-12 bg-white dark:bg-card-dark border-gray-200 dark:border-white/10 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white placeholder:text-gray-400 rounded-xl transition-all shadow-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-xl text-base font-semibold shadow-md hover:shadow-lg transition-all duration-300 bg-blue-500 hover:bg-blue-600 text-white border-none"
              disabled={loading}
            >
              {loading
                ? isArabic
                  ? 'جاري تسجيل الدخول...'
                  : 'Signing in...'
                : isArabic
                  ? 'تسجيل الدخول'
                  : 'Sign In'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
              <span className="px-4 bg-background-light dark:bg-background-dark text-gray-400">
                {isArabic ? 'أو المتابعة باستخدام' : 'Or continue with'}
              </span>
            </div>
          </div>

          {/* Social / Outlook Sign In */}
          <button
            onClick={handleOutlookSignIn}
            className="w-full h-12 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-card-dark hover:bg-gray-50 dark:hover:bg-white/5 transition-all flex items-center justify-center gap-3 group shadow-sm"
          >
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
            <span className="text-gray-700 dark:text-gray-200 font-semibold text-sm">
              {isArabic ? 'تسجيل الدخول باستخدام Outlook' : 'Sign in with Outlook'}
            </span>
          </button>

          {/* Development / Quick Access Buttons - Grouped nicely */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-white/10">
            <p className="text-xs text-center text-gray-500 font-medium mb-4 uppercase tracking-wider">
              {isArabic ? 'وصول سريع (للصيانة)' : 'Quick Access (Dev)'}
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              <button
                onClick={async () => {
                  await authLogout();
                  navigate('/studentdashboard', { state: { isMock: true } });
                }}
                className="flex items-center justify-center px-2 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-card-dark text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-all text-xs font-semibold"
              >
                Student
              </button>
              <button
                onClick={async () => {
                  await authLogout();
                  navigate('/instructordashboard', { state: { isMock: true } });
                }}
                className="flex items-center justify-center px-2 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-card-dark text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-all text-xs font-semibold"
              >
                Instructor
              </button>
              <button
                onClick={async () => {
                  await authLogout();
                  navigate('/admindashboard', { state: { isMock: true } });
                }}
                className="flex items-center justify-center px-2 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-card-dark text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-all text-xs font-semibold"
              >
                Admin
              </button>
              <button
                onClick={async () => {
                  await authLogout();
                  navigate('/itadmindashboard', { state: { isMock: true } });
                }}
                className="flex items-center justify-center px-2 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-card-dark text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-all text-xs font-semibold"
              >
                IT Admin
              </button>
              <button
                onClick={async () => {
                  await authLogout();
                  navigate('/tadashboard', { state: { isMock: true } });
                }}
                className="col-span-2 lg:col-span-4 flex items-center justify-center px-2 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-card-dark text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-all text-xs font-semibold"
              >
                Teaching Assistant
              </button>
            </div>
          </div>

          {/* Footer link */}
          <div className="mt-8 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
            {isArabic ? 'ليس لديك حساب؟' : "Don't have an account?"}{' '}
            <button className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 hover:underline transition-all font-semibold">
              {isArabic ? 'أنشئ حساباً مجانياً' : 'Create one for free'}
            </button>
          </div>
        </div>
      </div>

      {/* Right Side - Branding Image (Hidden on small screens) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-blue-500 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-white/10 rounded-full blur-3xl opacity-50 mix-blend-overlay"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-400/30 rounded-full blur-3xl opacity-50 mix-blend-overlay"></div>
        </div>

        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center z-0 opacity-40 mix-blend-luminosity p-0 m-0"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />

        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/90 to-[#1e3a8a]/90 z-10" />

        {/* Content Overlay */}
        <div className="relative z-20 flex flex-col justify-center items-center w-full h-full p-16 text-white text-center">
          <div className="space-y-6 max-w-xl">
            <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mx-auto mb-8 border border-white/20 shadow-2xl">
              {isArabic ? (
                <span className="text-4xl font-bold">إ</span>
              ) : (
                <span className="text-4xl font-bold">E</span>
              )}
            </div>
            <h2 className="text-4xl font-bold tracking-tight mb-4">
              {isArabic ? 'اكتشف مستقبلك' : 'Discover Your Future'}
            </h2>
            <p className="text-lg text-white/80 font-medium leading-relaxed">
              {isArabic
                ? 'انضم إلى آلاف الطلاب والمحاضرين في نظام إدارة التعلم الأكثر تقدماً. نظام مصمم لتعزيز تجربتك التعليمية.'
                : 'Join thousands of students and instructors on the most advanced learning management system. Designed to elevate your educational experience.'}
            </p>
          </div>

          {/* Dashboard Preview Graphic / Mockup (Optional abstract UI elements) */}
          <div className="mt-16 w-full max-w-md bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-white/20 animate-pulse"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 w-1/3 bg-white/20 rounded"></div>
                <div className="h-3 w-1/2 bg-white/10 rounded"></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-16 w-full bg-white/5 rounded-xl border border-white/5 flex items-center px-4 gap-4">
                <div className="w-8 h-8 rounded-lg bg-white/10"></div>
                <div className="h-3 w-3/4 bg-white/10 rounded"></div>
              </div>
              <div className="h-16 w-full bg-white/5 rounded-xl border border-white/5 flex items-center px-4 gap-4">
                <div className="w-8 h-8 rounded-lg bg-white/10"></div>
                <div className="h-3 w-2/3 bg-white/10 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default login;

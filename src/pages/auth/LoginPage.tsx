import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { useLanguage } from '../home/contexts/LanguageContext';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await AuthService.login({ email, password });
      navigate('/dashboard');
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
      className="min-h-screen relative overflow-hidden bg-cover bg-center flex items-center justify-center px-4"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        fontFamily: "'Montserrat', sans-serif",
      }}
    >
      {/* Background Overlay with Blur */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-0" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/90 dark:bg-[#16161a]/90 backdrop-blur-xl rounded-[2rem] p-8 sm:p-10 shadow-2xl border border-white/20 dark:border-white/5 transition-all duration-300">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <button
              className="flex items-center space-x-2 cursor-pointer group"
              onClick={handleLogo}
            >
              <span className="text-2xl sm:text-3xl tracking-tight font-bold text-gray-900 dark:text-white group-hover:opacity-80 transition-opacity">
                {isArabic ? 'إيدوفيرس' : 'Eduverse'}
              </span>
            </button>
          </div>

          {/* Title Area */}
          <div className="text-center mb-8 space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              Sign In
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
              Welcome back to your learning journey
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-1">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-13 bg-gray-50/50 dark:bg-white/5 border-transparent dark:border-white/5 focus:border-primary/30 dark:focus:border-white/20 text-gray-900 dark:text-white placeholder:text-gray-400 rounded-2xl transition-all"
                  required
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 pr-12 h-13 bg-gray-50/50 dark:bg-white/5 border-transparent dark:border-white/5 focus:border-primary/30 dark:focus:border-white/20 text-gray-900 dark:text-white placeholder:text-gray-400 rounded-2xl transition-all"
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

            <div className="flex justify-end">
              <button
                type="button"
                className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              className="w-full h-13 rounded-2xl text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
              <span className="px-4 bg-transparent text-gray-400">Or continue with</span>
            </div>
          </div>

          {/* Social / Outlook Sign In */}
          <button
            onClick={handleOutlookSignIn}
            className="w-full h-13 rounded-2xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-3 group"
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
              Sign in with Outlook
            </span>
          </button>

          {/* Development / Quick Access Buttons - Redesigned more subtly */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <button
              onClick={() => navigate('/studentdashboard')}
              className="flex items-center justify-center px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-all text-[11px] font-bold uppercase tracking-wider"
            >
              Student
            </button>
            <button
              onClick={() => navigate('/instructordashboard')}
              className="flex items-center justify-center px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-all text-[11px] font-bold uppercase tracking-wider"
            >
              Instructor
            </button>
            <button
              onClick={() => navigate('/admindashboard')}
              className="flex items-center justify-center px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-all text-[11px] font-bold uppercase tracking-wider"
            >
              Admin
            </button>
            <button
              onClick={() => navigate('/itadmindashboard')}
              className="flex items-center justify-center px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-all text-[11px] font-bold uppercase tracking-wider"
            >
              IT Admin
            </button>
            <button
              onClick={() => navigate('/tadashboard')}
              className="col-span-2 flex items-center justify-center px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-all text-[11px] font-bold uppercase tracking-wider"
            >
              Teaching Assistant
            </button>
          </div>

          {/* Footer link */}
          <div className="mt-8 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
            Don't have an account?{' '}
            <button className="text-primary hover:underline transition-all">
              Create one for free
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default login;

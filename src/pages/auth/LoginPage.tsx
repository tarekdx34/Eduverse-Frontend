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
      // Navigate based on user role
      const role = response.user?.roles?.[0]?.toLowerCase();
      const roleRoutes: Record<string, string> = {
        student: '/studentdashboard',
        instructor: '/instructordashboard',
        admin: '/admindashboard',
        ta: '/tadashboard',
        teaching_assistant: '/tadashboard',
        it_admin: '/itadmindashboard',
      };
      navigate(roleRoutes[role] || '/studentdashboard');
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
      className="min-h-screen relative overflow-hidden bg-cover bg-center"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        fontFamily: "'Montserrat', sans-serif",
      }}
    >
      {/* Login Card */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 bg-black/20">
        <div className="mx-auto w-full max-w-md">
          <div className="bg-white/95 dark:bg-gradient-to-b dark:from-[hsl(220,20%,14%)]/90 dark:to-[hsl(220,20%,10%)]/95 backdrop-blur-md rounded-3xl px-4 sm:px-8 py-8 shadow-xl border border-gray-200/60 dark:border-white/10">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <button
                className="flex items-center space-x-2 flex-shrink-0 cursor-pointer"
                onClick={handleLogo}
              >
                <span className="text-xl sm:text-2xl tracking-tight font-bold text-gray-900 dark:text-white">
                  {isArabic ? 'إيدوفيرس' : 'Eduverse'}
                </span>
              </button>{' '}
            </div>

            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-xl sm:text-2xl font-semibold text-foreground mb-2">
                Sign in with email
              </h1>
              <p className="text-muted-foreground text-sm">
                Access your Eduverse account to manage your learning journey.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 bg-white dark:bg-card border border-gray-300 dark:border-border/50 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-slate-400 rounded-xl"
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12 bg-white dark:bg-card border border-gray-300 dark:border-border/50 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-slate-400 rounded-xl"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-xl text-base font-medium"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Get Started'}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-border/50 border-dashed" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-gradient-to-b dark:from-[hsl(220,20%,14%)]/90 dark:to-[hsl(220,20%,10%)]/95 text-gray-600 dark:text-gray-400">
                  Or sign in with
                </span>
              </div>
            </div>

            {/* Outlook Sign In */}
            <button
              onClick={handleOutlookSignIn}
              className="w-full h-12 rounded-xl border border-gray-300 dark:border-white/10 bg-white hover:bg-gray-50 dark:bg-white/5 dark:hover:bg-white/10 transition-colors flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
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
                <path
                  d="M2 6.5V17.5C2 18.881 3.119 20 4.5 20H19.5C20.881 20 22 18.881 22 17.5V6.5"
                  stroke="#0078D4"
                  strokeWidth="0.5"
                />
              </svg>
              <span className="text-foreground font-medium">Outlook</span>
            </button>

            {/* Development Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <button
                onClick={() => navigate('/studentdashboard')}
                className="h-10 rounded-xl border border-amber-300/80 bg-amber-50/80 hover:bg-amber-100/80 dark:bg-amber-950/40 dark:border-amber-700/50 dark:hover:bg-amber-900/50 transition-colors flex items-center justify-center gap-2 text-amber-700 dark:text-amber-300 text-xs font-medium"
              >
                <span>🚀</span>
                <span>Student</span>
              </button>
              <button
                onClick={() => navigate('/instructordashboard')}
                className="h-10 rounded-xl border border-blue-300/80 bg-blue-50/80 hover:bg-blue-100/80 dark:bg-blue-950/40 dark:border-blue-700/50 dark:hover:bg-blue-900/50 transition-colors flex items-center justify-center gap-2 text-blue-700 dark:text-blue-300 text-xs font-medium"
              >
                <span>👨‍🏫</span>
                <span>Instructor</span>
              </button>
              <button
                onClick={() => navigate('/admindashboard')}
                className="h-10 rounded-xl border border-blue-300/80 bg-blue-50/80 hover:bg-blue-100/80 dark:bg-blue-950/40 dark:border-blue-700/50 dark:hover:bg-blue-900/50 transition-colors flex items-center justify-center gap-2 text-blue-700 dark:text-blue-300 text-xs font-medium"
              >
                <span>🛡️</span>
                <span>Admin</span>
              </button>
              <button
                onClick={() => navigate('/itadmindashboard')}
                className="h-10 rounded-xl border border-blue-300/80 bg-blue-50/80 hover:bg-blue-100/80 dark:bg-blue-950/40 dark:border-blue-700/50 dark:hover:bg-blue-900/50 transition-colors flex items-center justify-center gap-2 text-blue-700 dark:text-blue-300 text-xs font-medium"
              >
                <span>⚙️</span>
                <span>IT Admin</span>
              </button>
              <button
                onClick={() => navigate('/tadashboard')}
                className="col-span-1 sm:col-span-2 h-10 rounded-xl border border-teal-300/80 bg-teal-50/80 hover:bg-teal-100/80 dark:bg-teal-950/40 dark:border-teal-700/50 dark:hover:bg-teal-900/50 transition-colors flex items-center justify-center gap-2 text-teal-700 dark:text-teal-300 text-xs font-medium"
              >
                <span>🎓</span>
                <span>Teaching Assistant</span>
              </button>
            </div>

            {/* Sign up link */}
            <p className="text-center mt-6 text-sm text-muted-foreground">
              Don't have an account?{' '}
              <button className="text-foreground font-medium hover:underline">Sign up</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default login;

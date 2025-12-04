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
      className="min-h-screen relative overflow-hidden bg-cover bg-center"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        fontFamily: "'Montserrat', sans-serif",
      }}
    >
      {/* Login Card */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 bg-black/20">
        <div className="w-full max-w-md">
          <div className="bg-gradient-to-b from-[hsl(200,60%,95%)]/80 to-card/95 backdrop-blur-sm rounded-3xl p-8 shadow-[var(--shadow-card)] border border-white/50">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <button
                className="flex items-center space-x-2 flex-shrink-0 cursor-pointer"
                onClick={handleLogo}
              >
                <span className="text-2xl tracking-tight">
                  {isArabic ? 'إيدوفيرس' : 'Eduverse'}
                </span>
              </button>{' '}
            </div>

            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold text-foreground mb-2">Sign in with email</h1>
              <p className="text-muted-foreground text-sm">
                Access your Eduverse account to manage your learning journey.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
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
                  className="pl-10 h-12 bg-card border-border/50 rounded-xl"
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
                  className="pl-10 pr-10 h-12 bg-card border-border/50 rounded-xl"
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
                <div className="w-full border-t border-border/50 border-dashed" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-transparent text-muted-foreground">Or sign in with</span>
              </div>
            </div>

            {/* Outlook Sign In */}
            <button
              onClick={handleOutlookSignIn}
              className="w-full h-12 rounded-xl border border-border/50 bg-card hover:bg-secondary/50 transition-colors flex items-center justify-center gap-3"
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

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { assets } from '../../lib/assets';
import { AuthService, LoginRequest } from '../../services/api/authService';
import { authTranslations } from '../../locales/auth.translations';

type Language = 'en' | 'ar';
type Theme = 'light' | 'dark';

interface LoginPageProps {
  onLoginSuccess?: () => void;
  onInstructorLogin?: () => void;
}

export default function LoginPage({ onLoginSuccess, onInstructorLogin }: LoginPageProps) {
  const navigate = useNavigate();
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState<Theme>('light');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const t = authTranslations[language];
  const isRTL = language === 'ar';

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'ar' : 'en'));
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const credentials: LoginRequest = { email, password };
      const response = await AuthService.login(credentials);

      console.log('Login successful:', response);

      if (onLoginSuccess) {
        onLoginSuccess();
      }

      // Navigate to profile page
      navigate('/profile');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t.error;
      setError(errorMessage);
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    console.log(`Login with ${provider}`);
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 py-8 ${
        theme === 'dark' ? 'bg-[#121217]' : 'bg-white'
      }`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="w-full max-w-[400px]">
        {/* Panda mascot */}
        <div className="mb-4 px-4">
          <div className="relative h-[120px] w-full rounded-[12px] overflow-hidden">
            <img src={assets.panda} alt="Panda mascot" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Title */}
        <div className="mb-2 px-4">
          <h1
            className={`font-['Lexend','Noto_Sans_Arabic',sans-serif] text-[24px] text-center ${
              theme === 'dark' ? 'text-white' : 'text-[#121712]'
            }`}
          >
            {t.title}
          </h1>
        </div>

        {/* Subtitle */}
        <div className="mb-4 px-4">
          <p
            className={`font-['Lexend','Noto_Sans_Arabic',sans-serif] text-[14px] text-center ${
              theme === 'dark' ? 'text-white' : 'text-[#121712]'
            }`}
          >
            {t.subtitle}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 px-4">
            <div className="bg-red-500/20 border border-red-500/50 rounded-[12px] p-3 text-red-400 text-[12px]">
              {error}
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-3 px-4">
          {/* Email Input */}
          <div>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.email}
              disabled={isLoading}
              className={`w-full h-[56px] rounded-[12px] px-4 font-['Lexend','Noto_Sans_Arabic',sans-serif] ${
                theme === 'dark'
                  ? 'bg-[#1c1c26] text-white placeholder:text-[#638766]'
                  : 'bg-[#f0f5f2] text-[#121712] placeholder:text-[#638766]'
              } ${isRTL ? 'text-right' : 'text-left'} disabled:opacity-50`}
            />
          </div>

          {/* Password Input */}
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.password}
              disabled={isLoading}
              className={`w-full h-[44px] rounded-[12px] px-4 font-['Lexend','Noto_Sans_Arabic',sans-serif] text-[14px] ${
                theme === 'dark'
                  ? 'bg-[#1c1c26] text-white placeholder:text-[#638766]'
                  : 'bg-[#f0f5f2] text-[#121712] placeholder:text-[#638766]'
              } ${isRTL ? 'text-right' : 'text-left'} disabled:opacity-50`}
            />
          </div>

          {/* Forgot Password */}
          <div className="text-center">
            <button
              type="button"
              className="text-[#638766] text-[14px] font-['Lexend','Noto_Sans_Arabic',sans-serif] hover:underline"
            >
              {t.forgotPassword}
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full h-[40px] rounded-[24px] flex items-center justify-center font-['Lexend','Noto_Sans_Arabic',sans-serif] text-[14px] transition-all hover:opacity-90 disabled:opacity-50 ${
              theme === 'dark' ? 'bg-[#5c12ed] text-white' : 'bg-[#1adb2e] text-[#121712]'
            }`}
          >
            {isLoading ? t.loggingIn : t.loginButton}
          </button>

          {/* Social Login Buttons */}
          <div className="space-y-3 pt-4">
            <button
              type="button"
              onClick={() => handleSocialLogin('Google')}
              disabled={isLoading}
              className={`w-full h-[40px] rounded-[20px] flex items-center justify-center gap-2 font-['Lexend','Noto_Sans_Arabic',sans-serif] text-[14px] transition-all hover:opacity-80 disabled:opacity-50 ${
                theme === 'dark' ? 'bg-[#1c1c26] text-white' : 'bg-[#f0f5f2] text-[#121712]'
              }`}
            >
              <img src={assets.google} alt="Google" className="w-[20px] h-[20px]" />
              {t.loginWithGoogle}
            </button>

            <button
              type="button"
              onClick={() => handleSocialLogin('Microsoft')}
              disabled={isLoading}
              className={`w-full h-[40px] rounded-[20px] flex items-center justify-center gap-2 font-['Lexend','Noto_Sans_Arabic',sans-serif] text-[14px] transition-all hover:opacity-80 disabled:opacity-50 ${
                theme === 'dark' ? 'bg-[#1c1c26] text-white' : 'bg-[#f0f5f2] text-[#121712]'
              }`}
            >
              <img src={assets.microsoft} alt="Microsoft" className="w-[20px] h-[20px]" />
              {t.loginWithMicrosoft}
            </button>
          </div>
        </form>

        {/* Language and Theme Toggle */}
        <div className="mt-8 space-y-2">
          <div className="text-center">
            <button
              onClick={toggleLanguage}
              className="text-[#638766] text-[14px] font-['Lexend','Noto_Sans_Arabic',sans-serif] hover:underline"
            >
              {t.languageToggle}
            </button>
          </div>
          <div className="text-center">
            <button onClick={toggleTheme} className="text-[#638766] text-[14px] hover:underline">
              🌞 / 🌚
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

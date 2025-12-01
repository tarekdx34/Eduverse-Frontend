import { useState, useEffect } from 'react';
import { useLanguage } from '../home/contexts/LanguageContext';

function LoginPage() {
  const { t, language, setLanguage } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);

  const isArabic = language === 'ar';
  const dir = isArabic ? 'rtl' : 'ltr';

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className={`relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden ${isDarkMode ? 'dark bg-[#111821]' : 'bg-background-light'}`} dir={dir}>
      {/* Top Navigation */}
      <div className={`absolute top-4 z-20 flex items-center gap-4 ${isArabic ? 'left-4' : 'right-4'}`}>
        <button 
          onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
          className="flex items-center gap-2 rounded-lg border border-transparent px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-base">language</span>
          <span className="font-semibold">{language === 'en' ? 'EN' : 'AR'}</span>
          <span className="text-slate-500">/</span>
          <span>{language === 'en' ? 'AR' : 'EN'}</span>
        </button>
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-transparent text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
        </button>
      </div>

      <div className="flex h-full min-h-screen grow flex-col">
        <div className="flex flex-1">
          <div className="flex w-full flex-col lg:flex-row">
            {/* Left Panel: Branding (hidden on mobile) */}
            <div className="relative hidden w-full flex-col items-center justify-center bg-[#1a2432] p-8 lg:flex lg:w-2/5">
              <div className="absolute inset-0 z-0">
                <img 
                  className="h-full w-full object-cover opacity-20" 
                  alt="Abstract background"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBwjEgo9iDsVuoBloy5u48KNqXFgvyqFPP1ww_nnZ9dtinEd7FNDkRKb8Vg7T8R67W7kITbclZ9efN2M9IT-hTmdaa37OA8D5ANEn6W3-1XDbicat6sr05MI6jacfiD7CFNjJT1OfclffdZelsBgeN-eSiIuqdu0uC4nnL9XKrJdeUiNI-57Z2PCmdjDyzkdmfs9GOyV4MU09HvyX3Tmjr5D7mbSFN_c6298BJDtwxmyfEyWXg3A2wlMFiH5IHWilXqMdI6XF-c7Qc"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111821] via-transparent to-transparent"></div>
              </div>
              <div className="z-10 flex flex-col items-start text-white max-w-[400px]">
                <div className="flex items-center gap-3 pb-8">
                  <span className="material-symbols-outlined text-4xl text-primary">auto_awesome</span>
                  <span className="text-3xl font-bold">Eduverse</span>
                </div>
                <h1 className="text-white text-[32px] font-bold leading-tight text-left pb-3">
                  {t('Welcome Back!', 'مرحباً بعودتك!')}
                </h1>
                <p className="text-slate-300 text-base font-normal leading-normal pb-3">
                  {t('Continue your AI-powered learning journey', 'واصل رحلة التعلم الذكية الخاصة بك')}
                </p>
              </div>
            </div>

            {/* Right Panel: Form */}
            <div className={`flex w-full flex-1 items-center justify-center p-6 sm:p-8 lg:w-3/5 ${isDarkMode ? 'bg-[#111821]' : 'bg-background-light'}`}>
              <div className="layout-content-container flex flex-col w-full max-w-[480px] flex-1">
                {/* Mobile Logo */}
                <div className="flex items-center justify-center gap-3 pb-8 lg:hidden">
                  <span className="material-symbols-outlined text-4xl text-primary">auto_awesome</span>
                  <span className="text-3xl font-bold text-white">Eduverse</span>
                </div>

                <h1 className={`text-[22px] font-bold leading-tight tracking-[-0.015em] text-left pb-3 pt-5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {t('Sign In', 'تسجيل الدخول')}
                </h1>

                <div className="flex w-full flex-col gap-4 py-3">
                  {/* Email Field */}
                  <label className="flex flex-col flex-1">
                    <p className={`text-base font-medium leading-normal pb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {t('Email Address', 'البريد الإلكتروني')}
                    </p>
                    <div className="relative flex w-full flex-1 items-stretch">
                      <span className={`material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>mail</span>
                      <input
                        className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg focus:outline-0 focus:ring-2 focus:ring-primary/50 border h-14 placeholder:text-[#93a9c8] pl-12 pr-4 text-base font-normal leading-normal ${isDarkMode ? 'text-white border-[#344865] bg-[#1a2432] focus:border-primary' : 'text-slate-900 border-slate-300 bg-white focus:border-primary'}`}
                        placeholder={t('Enter your email address', 'أدخل عنوان بريدك الإلكتروني')}
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </label>

                  {/* Password Field */}
                  <label className="flex flex-col flex-1">
                    <p className={`text-base font-medium leading-normal pb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {t('Password', 'كلمة المرور')}
                    </p>
                    <div className="relative flex w-full flex-1 items-stretch">
                      <span className={`material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>lock</span>
                      <input
                        className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg focus:outline-0 focus:ring-2 focus:ring-primary/50 border h-14 placeholder:text-[#93a9c8] pl-12 pr-12 text-base font-normal leading-normal ${isDarkMode ? 'text-white border-[#344865] bg-[#1a2432] focus:border-primary' : 'text-slate-900 border-slate-300 bg-white focus:border-primary'}`}
                        placeholder={t('Enter your password', 'أدخل كلمة المرور الخاصة بك')}
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button 
                        className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${isDarkMode ? 'text-slate-500 hover:text-primary/80' : 'text-slate-400 hover:text-primary'}`}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <span className="material-symbols-outlined">visibility</span>
                      </button>
                    </div>
                  </label>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex flex-wrap items-center justify-between gap-4 py-3">
                  <div className="flex items-center gap-2">
                    <input
                      className={`h-4 w-4 rounded focus:ring-primary/50 ${isDarkMode ? 'border-slate-600 bg-slate-700 text-primary' : 'border-slate-300 bg-white text-primary'}`}
                      id="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <label className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`} htmlFor="remember-me">
                      {t('Remember me', 'تذكرني')}
                    </label>
                  </div>
                  <a className="text-sm font-medium text-primary hover:underline" href="#">
                    {t('Forgot password?', 'نسيت كلمة المرور؟')}
                  </a>
                </div>

                {/* Sign In Button */}
                <button className="flex items-center justify-center rounded-lg text-base font-semibold px-6 py-4 mt-6 bg-[#186adc] text-white hover:bg-[#1557c1] transition-colors duration-200 w-full h-14">
                  {t('Sign In', 'تسجيل الدخول')}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-4 my-6">
                  <hr className={isDarkMode ? 'w-full border-slate-700' : 'w-full border-slate-300'}/>
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{t('OR', 'أو')}</span>
                  <hr className={isDarkMode ? 'w-full border-slate-700' : 'w-full border-slate-300'}/>
                </div>

                {/* Continue with Outlook */}
                <button className={`flex items-center justify-center gap-3 rounded-lg text-base font-semibold px-6 py-4 border transition-colors duration-200 w-full h-14 ${isDarkMode ? 'bg-[#1a2432] text-white border-[#344865] hover:bg-[#2c3a4f]' : 'bg-white text-slate-900 border-slate-300 hover:bg-slate-50'}`}>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 4h8v8H4V4zm10 0h6v8h-6V4zm-10 10h8v6H4v-6zm10 0h6v6h-6v-6z" fill="#0078D4"></path>
                  </svg>
                  {t('Continue with Outlook', 'متابعة مع Outlook')}
                </button>

                {/* Sign Up Link */}
                <p className={`text-center text-sm mt-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {t("Don't have an account?", 'ليس لديك حساب؟')}{' '}
                  <a className="font-semibold text-primary hover:underline" href="#">
                    {t('Sign Up', 'انضم الآن')}
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .material-symbols-outlined {
          font-variation-settings:
            'FILL' 0,
            'wght' 400,
            'GRAD' 0,
            'opsz' 24;
        }

        input[type="checkbox"]:checked {
          background-color: #186adc;
          border-color: #186adc;
        }

        input[type="email"]:focus,
        input[type="password"]:focus {
          border-color: #186adc;
        }
      `}</style>
    </div>
  );
}

export default LoginPage;

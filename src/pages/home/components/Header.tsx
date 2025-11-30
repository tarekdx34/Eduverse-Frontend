import { Button } from '../../../components/ui/button';
import { Menu, GraduationCap, Globe, Sun, Moon } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

export function Header() {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-linear-to-br from-primary to-primary/70 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold">{t('Eduverse', 'إيدوفيرس')}</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <a
              href="#about"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('About', 'حول')}
            </a>
            <a
              href="#features"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('AI Features', 'الميزات الذكية')}
            </a>
            <a
              href="#roles"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('User Roles', 'الأدوار')}
            </a>
            <a
              href="#gamification"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('Gamification', 'التحفيز')}
            </a>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="hidden md:inline-flex"
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleLanguage}
            className="hidden md:inline-flex"
            title={language === 'en' ? 'Switch to Arabic' : 'Switch to English'}
          >
            <Globe className="h-4 w-4" />
            <span className="ml-1 text-xs">{language === 'en' ? 'AR' : 'EN'}</span>
          </Button>
          <Button variant="ghost" className="hidden md:inline-flex">
            {t('Sign In', 'تسجيل الدخول')}
          </Button>
          <Button>{t('Get Started', 'ابدأ الآن')}</Button>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}

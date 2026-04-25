import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { GraduationCap, Globe, Sun, Moon, ChevronDown, Menu, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
export function Header() {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };
  const handlelogin = () => {
    navigate('/login');
  };

  const handleLogo = () => {
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-6 lg:px-8  ">
        <div className="flex h-20 justify-between items-center ">
          {/* Logo - Far Left */}
          <button
            className="flex items-center space-x-2 flex-shrink-0 cursor-pointer"
            onClick={handleLogo}
          >
            <span className="text-2xl tracking-tight">{t('Eduverse', 'إيدوفيرس')}</span>
          </button>

          {/* Center Navigation */}
          <nav className="hidden lg:flex items-center space-x-8 mx-auto">
            <div className="relative group">
              <button className="flex items-center text-sm uppercase tracking-wide text-foreground/80 hover:text-foreground transition-colors">
                {t('Products', 'المنتجات')}
                <ChevronDown className="ml-1 h-3.5 w-3.5" />
              </button>
            </div>
            <a
              href="#pricing"
              className="text-sm uppercase tracking-wide text-foreground/80 hover:text-foreground transition-colors"
            >
              {t('Pricing', 'التسعير')}
            </a>
            <a
              href="#tour"
              className="text-sm uppercase tracking-wide text-foreground/80 hover:text-foreground transition-colors"
            >
              {t('Tour', 'جولة')}
            </a>
            <div className="relative group">
              <button className="flex items-center text-sm uppercase tracking-wide text-foreground/80 hover:text-foreground transition-colors">
                {t('Company', 'الشركة')}
                <ChevronDown className="ml-1 h-3.5 w-3.5" />
              </button>
            </div>
            <div className="relative group">
              <button className="flex items-center text-sm uppercase tracking-wide text-foreground/80 hover:text-foreground transition-colors">
                {t('Resources', 'الموارد')}
                <ChevronDown className="ml-1 h-3.5 w-3.5" />
              </button>
            </div>
          </nav>

          {/* Right Actions - Far Right */}
          <div className="flex items-center space-x-3 flex-shrink-0 ml-auto">
            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLanguage}
              className="hidden md:inline-flex rounded-md"
              title={language === 'en' ? 'Switch to Arabic' : 'Switch to English'}
            >
              <Globe className="h-4 w-4" />
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="hidden md:inline-flex rounded-md"
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>

            {/* Log in Button */}
            <Button
              onClick={handlelogin}
              variant="outline"
              className="hidden lg:inline-flex rounded-md"
            >
              {t('Log in', 'تسجيل الدخول')}
            </Button>

            {/* Mobile Login Button */}
            <Button
              onClick={handlelogin}
              className="lg:hidden rounded-md bg-foreground text-background hover:bg-foreground/90"
            >
              {t('Log in', 'تسجيل الدخول')}
            </Button>

            {/* Desktop Get Started Button */}
            <Button className="hidden lg:inline-flex rounded-md bg-foreground text-background hover:bg-foreground/90">
              {t('Get started', 'ابدأ الآن')}
            </Button>

            {/* Mobile Hamburger Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-md"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-background/95 backdrop-blur-md">
          <nav className="container mx-auto px-6 py-4 flex flex-col space-y-4">
            <button className="flex items-center text-sm uppercase tracking-wide text-foreground/80 hover:text-foreground transition-colors">
              {t('Products', 'المنتجات')}
              <ChevronDown className="ml-1 h-3.5 w-3.5" />
            </button>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm uppercase tracking-wide text-foreground/80 hover:text-foreground transition-colors"
            >
              {t('Pricing', 'التسعير')}
            </a>
            <a
              href="#tour"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm uppercase tracking-wide text-foreground/80 hover:text-foreground transition-colors"
            >
              {t('Tour', 'جولة')}
            </a>
            <button className="flex items-center text-sm uppercase tracking-wide text-foreground/80 hover:text-foreground transition-colors">
              {t('Company', 'الشركة')}
              <ChevronDown className="ml-1 h-3.5 w-3.5" />
            </button>
            <button className="flex items-center text-sm uppercase tracking-wide text-foreground/80 hover:text-foreground transition-colors">
              {t('Resources', 'الموارد')}
              <ChevronDown className="ml-1 h-3.5 w-3.5" />
            </button>
            <div className="flex items-center space-x-3 pt-2 border-t border-border">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleLanguage}
                className="md:hidden rounded-md"
                title={language === 'en' ? 'Switch to Arabic' : 'Switch to English'}
              >
                <Globe className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="md:hidden rounded-md"
                title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              >
                {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>
            </div>
            <Button
              onClick={() => {
                handlelogin();
                setMobileMenuOpen(false);
              }}
              variant="outline"
              className="w-full rounded-md"
            >
              {t('Log in', 'تسجيل الدخول')}
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}

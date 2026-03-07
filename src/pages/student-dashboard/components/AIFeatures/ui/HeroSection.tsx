import { useLanguage } from '../../../contexts/LanguageContext';
import { useTheme } from '../../../contexts/ThemeContext';

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
}

export function HeroSection({ title, subtitle }: HeroSectionProps) {
  const { isRTL } = useLanguage();
  const { isDark, primaryHex } = useTheme() as any;
  const accentColor = primaryHex || '#3b82f6';

  const displayTitle =
    title || (isRTL ? 'عزز تعلمك بالذكاء الاصطناعي' : 'Supercharge Learning with AI');
  const displaySubtitle =
    subtitle ||
    (isRTL
      ? 'احصل على أدوات الذكاء الاصطناعي المتطورة المصممة لتسريع نجاحك الأكاديمي'
      : 'Access cutting-edge AI tools designed to accelerate your academic success and transform how you study.');

  return (
    <div
      className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div>
        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {displayTitle}
        </h1>
        <p className={`text-slate-500 mt-1 font-medium`}>{displaySubtitle}</p>
      </div>
    </div>
  );
}

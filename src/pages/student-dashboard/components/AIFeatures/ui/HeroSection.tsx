import { useLanguage } from '../../../contexts/LanguageContext';
import { useTheme } from '../../../contexts/ThemeContext';

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
}

export function HeroSection({ 
  title,
  subtitle
}: HeroSectionProps) {
  const { isRTL } = useLanguage();
  const { isDark } = useTheme();
  
  const displayTitle = title || (isRTL ? 'عزز تعلمك بالذكاء الاصطناعي' : 'Supercharge Learning with AI');
  const displaySubtitle = subtitle || (isRTL ? 'احصل على أدوات الذكاء الاصطناعي المتطورة المصممة لتسريع نجاحك الأكاديمي' : 'Access cutting-edge AI tools designed to accelerate your academic success and transform how you study.');

  return (
    <section className={`relative rounded-[2.5rem] p-10 mb-8 text-white overflow-hidden min-h-[220px] flex flex-col justify-end ${
      isDark ? 'shadow-2xl shadow-[#7C3AED]/20' : 'shadow-xl shadow-[#7C3AED]/20'
    }`} style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)' }} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="relative z-10 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md mb-4">
          <span className="material-symbols-rounded text-sm">auto_awesome</span>
          <span className="text-xs font-bold uppercase tracking-widest">
            {isRTL ? 'مركز التعلم بالذكاء الاصطناعي' : isDark ? 'Powered by AI Engine 4.0' : 'AI Learning Hub'}
          </span>
        </div>
        <h2 className="text-4xl font-extrabold mb-4 leading-tight">{displayTitle}</h2>
        <p className="text-white/80 text-lg leading-relaxed">{displaySubtitle}</p>
      </div>
      <div className="absolute right-0 top-0 w-1/3 h-full opacity-20 pointer-events-none">
        <span className="material-symbols-rounded text-[200px] absolute -right-10 -top-10 rotate-12">auto_awesome</span>
      </div>
    </section>
  );
}

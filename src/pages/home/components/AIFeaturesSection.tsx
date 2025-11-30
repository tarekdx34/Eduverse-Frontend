import {
  ScanFace,
  FileQuestion,
  Sparkles,
  MessageSquare,
  CheckCheck,
  TrendingUp,
  LineChart,
  CalendarClock,
} from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export function AIFeaturesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { t, language } = useLanguage();

  const aiFeatures = [
    {
      icon: ScanFace,
      title: { en: 'AI Attendance Detection', ar: 'كشف الحضور الذكي' },
      description: {
        en: 'Automatic face recognition for seamless attendance tracking. No more manual check-ins.',
        ar: 'التعرف التلقائي على الوجه لتتبع الحضور بسلاسة. لا مزيد من تسجيل الحضور اليدوي.',
      },
      gradient: 'from-chart-1 to-chart-2',
      bgGradient: 'from-chart-1/10 to-chart-2/10',
    },
    {
      icon: FileQuestion,
      title: { en: 'AI Quiz Generator', ar: 'مولد الاختبارات الذكي' },
      description: {
        en: 'Auto-create quizzes from lecture content with intelligent question generation.',
        ar: 'إنشاء اختبارات تلقائيًا من محتوى المحاضرة مع تول��د أسئلة ذكية.',
      },
      gradient: 'from-chart-2 to-chart-3',
      bgGradient: 'from-chart-2/10 to-chart-3/10',
    },
    {
      icon: Sparkles,
      title: { en: 'AI Summarization', ar: 'التلخيص الذكي' },
      description: {
        en: 'Condense lengthy lectures into concise, digestible summaries instantly.',
        ar: 'تكثيف المحاضرات الطويلة إلى ملخصات موجزة وسهلة الفهم على الفور.',
      },
      gradient: 'from-chart-3 to-chart-4',
      bgGradient: 'from-chart-3/10 to-chart-4/10',
    },
    {
      icon: MessageSquare,
      title: { en: 'AI Chatbot Assistant', ar: 'مساعد الدردشة الذكي' },
      description: {
        en: '24/7 conversational AI help for students and instructors in both languages.',
        ar: 'مساعدة ذكاء اصطناعي محادثة على مدار الساعة للطلاب والمدرسين بكلتا اللغتين.',
      },
      gradient: 'from-chart-4 to-chart-5',
      bgGradient: 'from-chart-4/10 to-chart-5/10',
    },
    {
      icon: CheckCheck,
      title: { en: 'AI Auto-Grading', ar: 'التصحيح التلقائي' },
      description: {
        en: 'Automated assessment with instant feedback and detailed analysis.',
        ar: 'تقييم آلي مع ملاحظات فورية وتحليل مفصل.',
      },
      gradient: 'from-chart-5 to-chart-1',
      bgGradient: 'from-chart-5/10 to-chart-1/10',
    },
    {
      icon: TrendingUp,
      title: { en: 'Smart Recommendations', ar: 'التوصيات الذكية' },
      description: {
        en: "Personalized learning paths tailored to each student's progress and needs.",
        ar: 'مسارات تعليمية مخصصة لكل طالب وفقًا لتقدمه واحتياجاته.',
      },
      gradient: 'from-chart-1 to-chart-3',
      bgGradient: 'from-chart-1/10 to-chart-3/10',
    },
    {
      icon: LineChart,
      title: { en: 'Performance Analytics', ar: 'تحليل الأداء' },
      description: {
        en: 'Deep insights into student progress with actionable data visualization.',
        ar: 'رؤى عميقة في تقدم الطلاب مع تصور بيانات قابل للتنفيذ.',
      },
      gradient: 'from-chart-2 to-chart-4',
      bgGradient: 'from-chart-2/10 to-chart-4/10',
    },
    {
      icon: CalendarClock,
      title: { en: 'Smart Study Planner', ar: 'مخطط الدراسة الذكي' },
      description: {
        en: 'AI-optimized study schedules that adapt to your learning patterns.',
        ar: 'جداول دراسية محسنة بالذكاء الاصطناعي تتكيف مع أنماط التعلم الخاصة بك.',
      },
      gradient: 'from-chart-3 to-chart-5',
      bgGradient: 'from-chart-3/10 to-chart-5/10',
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('animate-fade-in');
            }, index * 100);
          }
        });
      },
      { threshold: 0.1 }
    );

    const cards = sectionRef.current?.querySelectorAll('.feature-card');
    cards?.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  return (
    <section id="features" className="py-20 lg:py-32 bg-background" ref={sectionRef}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl mb-4">
            {t('AI Features', 'الميزات الذكية')}{' '}
            <span className="bg-gradient-to-r from-chart-1 via-chart-2 to-chart-3 bg-clip-text text-transparent">
              {t('Showcase', 'عرض')}
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t(
              'Powered by advanced AI to revolutionize your learning experience',
              'مدعوم بالذكاء الاصطناعي المتقدم لإحداث ثورة في تجربة التعلم الخاصة بك'
            )}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {aiFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="feature-card opacity-0 translate-y-8 transition-all duration-500 group"
              >
                <div
                  className={`relative h-full p-6 bg-gradient-to-br ${feature.bgGradient} border border-border rounded-2xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2`}
                >
                  {/* Icon */}
                  <div
                    className={`mb-6 w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-lg`}
                  >
                    <Icon className="h-8 w-8 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="mb-3">{feature.title[language]}</h3>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description[language]}
                  </p>

                  {/* Hover Gradient Line */}
                  <div
                    className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} rounded-b-2xl transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left`}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .animate-fade-in {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
      `}</style>
    </section>
  );
}

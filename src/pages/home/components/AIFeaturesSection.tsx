import { useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import attandance from '/src/assets/images/attandance.jpg';
import summary from '/src/assets/images/Summary.jpg';
import smartGrading from '/src/assets/images/SmartGrading.jpg';
import recommendation from '/src/assets/images/Recommentation.jpg';
import timePlan from '/src/assets/images/Timeplan.jpg';

export function AIFeaturesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const aiFeatures = [
    {
      title: t('AI Attendance', 'الحضور الذكي'),
      description: t(
        'Never miss a moment with facial recognition that works in seconds. Your face is your key—unlock seamless classroom attendance tracking.',
        'لا تفوت لحظة مع التعرف على الوجه الذي يعمل في ثوانٍ. وجهك هو مفتاحك—فتح تتبع الحضور في الفصل الدراسي بسلاسة.'
      ),
      image: attandance,
      animationType: 'scan',
    },
    {
      title: t('Quiz Generator', 'مولد الاختبارات'),
      description: t(
        'Transform lectures into engaging quizzes instantly. AI crafts questions that challenge your thinking and adapt to your learning speed.',
        'حول المحاضرات إلى اختبارات جذابة على الفور. يصنع الذكاء الاصطناعي أسئلة تطعن تفكيرك وتتكيف مع سرعة التعلم لديك.'
      ),
      image: summary,
      animationType: 'pulse',
    },
    {
      title: t('Auto Grading', 'التصحيح التلقائي'),
      description: t(
        'Get instant feedback on every assignment. AI grades fairly and consistently, giving you detailed insights to improve faster.',
        'احصل على ملاحظات فورية في كل مهمة. يصنف الذكاء الاصطناعي بعدالة واتساق، مما يعطيك رؤى تفصيلية للتحسن بسرعة أكبر.'
      ),
      image: smartGrading,
      animationType: 'check',
    },
    {
      title: t('Smart Recommendation', 'التوصيات الذكية'),
      description: t(
        'Your personal learning guide. AI analyzes your strengths and suggests the perfect next steps to accelerate your growth.',
        'دليلك الشخصي للتعلم. يحلل الذكاء الاصطناعي نقاط قوتك ويقترح الخطوات التالية المثالية لتسريع نموك.'
      ),
      image: recommendation,
      animationType: 'flow',
    },
    {
      title: t('Study Planner', 'مخطط الدراسة'),
      description: t(
        'Study smarter, not harder. AI designs custom schedules that work with your rhythm, maximizing retention without burnout.',
        'ادرس بذكاء أكبر، وليس بجهد أكبر. يصمم الذكاء الاصطناعي جداول مخصصة تعمل مع إيقاعك، مما يزيد من الاحتفاظ دون الإرهاق.'
      ),
      image: timePlan,
      animationType: 'schedule',
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
          }
        });
      },
      { threshold: 0.2 }
    );

    const cards = sectionRef.current?.querySelectorAll('.feature-card');
    cards?.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  return (
    <section id="features" className="bg-background py-20 lg:py-32" ref={sectionRef} style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {t('AI Features', 'الميزات الذكية')}{' '}
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              {t('Showcase', 'عرض')}
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t(
              'Scroll down to explore each AI-powered feature with smooth animations',
              'مرر لأسفل لاستكشاف كل ميزة مدعومة بالذكاء الاصطناعي مع رسوم متحركة سلسة'
            )}
          </p>
        </div>

        <div className="space-y-12 lg:space-y-20">
          {aiFeatures.map((feature, index) => {
            const isImageLeft = index % 2 === 0;
            return (
              <div key={index} className="feature-card opacity-0 translate-y-20">
                <div className="h-auto py-12 lg:py-16 flex items-center justify-center">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center w-full max-w-6xl px-4">
                    {/* Image/Visual Container */}
                    <div className={`flex justify-center order-2 lg:${isImageLeft ? 'order-1' : 'order-2'}`}>
                      <img
                        src={feature.image}
                        alt={feature.title}
                        className={`w-full max-w-xs h-64 lg:h-72 object-cover rounded-3xl transition-transform duration-500 hover:scale-105 shadow-2xl ${
                          feature.animationType === 'scan'
                            ? 'animate-scan-line'
                            : feature.animationType === 'pulse'
                              ? 'animate-pulse'
                              : feature.animationType === 'check'
                                ? 'animate-check-bounce'
                                : feature.animationType === 'flow'
                                  ? 'animate-flow-gradient'
                                  : feature.animationType === 'schedule'
                                    ? 'animate-schedule-slide'
                                    : ''
                        }`}
                      />
                    </div>

                    {/* Content */}
                    <div className={`space-y-6 order-1 lg:${isImageLeft ? 'order-2' : 'order-1'}`}>
                      <div className="space-y-4">
                        <h3 className="text-3xl lg:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                          {feature.title}
                        </h3>
                      </div>

                      <p className="text-base lg:text-lg text-muted-foreground leading-relaxed max-w-lg">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');

        section#features,
        section#features * {
          font-family: 'Montserrat', sans-serif !important;
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(80px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scan-line {
          0%, 100% { clip-path: inset(0 0 100% 0); }
          50% { clip-path: inset(0 0 0 0); }
        }

        @keyframes check-bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        @keyframes flow-gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes schedule-slide {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(10px); }
        }

        .animate-fade-in {
          animation: fade-in-up 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .animate-scan-line {
          animation: scan-line 3s ease-in-out infinite;
        }

        .animate-check-bounce {
          animation: check-bounce 2s ease-in-out infinite;
        }

        .animate-flow-gradient {
          animation: flow-gradient 4s ease-in-out infinite;
        }

        .animate-schedule-slide {
          animation: schedule-slide 2.5s ease-in-out infinite;
        }

        .feature-card {
          transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .feature-card:nth-child(1) {
          animation-delay: 0s;
        }

        .feature-card:nth-child(2) {
          animation-delay: 0.15s;
        }

        .feature-card:nth-child(3) {
          animation-delay: 0.3s;
        }

        .feature-card:nth-child(4) {
          animation-delay: 0.45s;
        }

        .feature-card:nth-child(5) {
          animation-delay: 0.6s;
        }
      `}</style>
    </section>
  );
}

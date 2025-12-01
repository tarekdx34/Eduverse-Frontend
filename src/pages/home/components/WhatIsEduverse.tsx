import { Brain, Laptop, Smartphone, Tablet } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export function WhatIsEduverse() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-slide-in');
          }
        });
      },
      { threshold: 0.2 }
    );

    const elements = sectionRef.current?.querySelectorAll('.slide-in-element');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section id="about" className="py-20 lg:py-32 bg-muted/30" ref={sectionRef}>
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Isometric Device Illustration */}
          <div className="slide-in-element relative h-96 opacity-0 translate-x-[-50px] transition-all duration-700">
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Isometric Devices with AI Brain Connection */}
              <div className="relative w-full h-full max-w-md">
                {/* Central AI Brain */}
                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                  <div className="w-24 h-24 bg-gradient-to-br from-chart-1 to-chart-2 rounded-2xl rotate-12 shadow-2xl flex items-center justify-center">
                    <Brain className="h-12 w-12 text-white" />
                  </div>
                  {/* Pulsing Rings */}
                  <div className="absolute inset-0 rounded-2xl border-2 border-chart-1 animate-ping"></div>
                </div>

                {/* Laptop - Top Left */}
                <div className="absolute top-0 left-8 transform -rotate-12 z-10">
                  <div className="w-32 h-20 bg-card border-2 border-border rounded-lg shadow-xl p-2">
                    <div className="w-full h-full bg-gradient-to-br from-chart-1/20 to-chart-2/20 rounded flex items-center justify-center">
                      <Laptop className="h-8 w-8 text-chart-1" />
                    </div>
                  </div>
                  <div className="w-32 h-1 bg-card border border-border rounded-b-lg"></div>
                </div>

                {/* Tablet - Top Right */}
                <div className="absolute top-8 right-4 transform rotate-6 z-10">
                  <div className="w-24 h-32 bg-card border-2 border-border rounded-xl shadow-xl p-2">
                    <div className="w-full h-full bg-gradient-to-br from-chart-3/20 to-chart-4/20 rounded-lg flex items-center justify-center">
                      <Tablet className="h-10 w-10 text-chart-3" />
                    </div>
                  </div>
                </div>

                {/* Smartphone - Bottom Left */}
                <div className="absolute bottom-12 left-12 transform rotate-12 z-10">
                  <div className="w-16 h-28 bg-card border-2 border-border rounded-2xl shadow-xl p-1">
                    <div className="w-full h-full bg-gradient-to-br from-chart-5/20 to-chart-1/20 rounded-xl flex items-center justify-center">
                      <Smartphone className="h-8 w-8 text-chart-5" />
                    </div>
                  </div>
                </div>

                {/* Another Device - Bottom Right */}
                <div className="absolute bottom-8 right-16 transform -rotate-6 z-10">
                  <div className="w-28 h-20 bg-card border-2 border-border rounded-lg shadow-xl p-2">
                    <div className="w-full h-full bg-gradient-to-br from-chart-2/20 to-chart-3/20 rounded flex items-center justify-center">
                      <Tablet className="h-8 w-8 text-chart-2" />
                    </div>
                  </div>
                </div>

                {/* Connection Lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <defs>
                    <linearGradient id="deviceConnection" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" className="[stop-color:var(--chart-1)]" stopOpacity="0.4" />
                      <stop
                        offset="100%"
                        className="[stop-color:var(--chart-2)]"
                        stopOpacity="0.4"
                      />
                    </linearGradient>
                  </defs>
                  <line
                    x1="30%"
                    y1="20%"
                    x2="50%"
                    y2="50%"
                    stroke="url(#deviceConnection)"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    className="animate-pulse"
                  />
                  <line
                    x1="70%"
                    y1="30%"
                    x2="50%"
                    y2="50%"
                    stroke="url(#deviceConnection)"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    className="animate-pulse"
                    style={{ animationDelay: '0.3s' }}
                  />
                  <line
                    x1="35%"
                    y1="80%"
                    x2="50%"
                    y2="50%"
                    stroke="url(#deviceConnection)"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    className="animate-pulse"
                    style={{ animationDelay: '0.6s' }}
                  />
                  <line
                    x1="68%"
                    y1="75%"
                    x2="50%"
                    y2="50%"
                    stroke="url(#deviceConnection)"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    className="animate-pulse"
                    style={{ animationDelay: '0.9s' }}
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Right - Text Content */}
          <div className="slide-in-element opacity-0 translate-x-[50px]   transition-all duration-700 delay-200">
            <h2 className="text-3xl md:text-4xl lg:text-5xl mb-6">
              {t('What is', 'ما هو')}{' '}
              <span className="bg-gradient-to-r from-chart-1 to-chart-2 bg-clip-text text-transparent">
                {t('Eduverse?', 'إيدوفيرس؟')}
              </span>
            </h2>
            <div className="space-y-4 text-lg text-muted-foreground">
              <p>
                {t(
                  'Eduverse is an intelligent learning management system designed for modern universities, powered by cutting-edge AI technology.',
                  'إيدوفيرس هو نظام إدارة تعلم ذكي مصمم للجامعات الحديثة، مدعوم بأحدث تقنيات الذكاء الاصطناعي.'
                )}
              </p>
              <p>
                {t(
                  'With full bilingual support for Arabic and English, Eduverse transforms traditional education into an engaging, personalized learning experience.',
                  'مع دعم كامل ثنائي اللغة للعربية والإنجليزية، يحول إيدوفيرس التعليم التقليدي إلى تجربة تعليمية جذابة وشخصية.'
                )}
              </p>
              <p>
                {t(
                  'From automated attendance to AI-powered assessments, our platform empowers students, instructors, and administrators to achieve more with less effort.',
                  'من الحضور الآلي إلى التقييمات المدعومة بالذكاء الاصطناعي، تمكن منصتنا الطلاب والمدرسين والإداريين من تحقيق المزيد بجهد أقل.'
                )}
              </p>
              <p className="text-foreground">
                <span className="font-semibold">
                  {t('Experience the future of education today.', 'اختبر مستقبل التعليم اليوم.')}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .animate-slide-in {
          opacity: 1 !important;
          transform: translateX(0) !important;
        }
      `}</style>
    </section>
  );
}

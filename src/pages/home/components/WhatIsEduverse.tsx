import { Brain, Laptop, Smartphone, Tablet } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export function WhatIsEduverse() {
  const { t } = useLanguage();

  return (
    <section id="about" className="py-20 lg:py-32 bg-muted/30">
      {/* Right - Text Content */}
      <div className="flex flex-col lg:flex-col items-center lg:items-center max-w-7xl mx-auto px-6 lg:px-8 gap-12">
        <h2 className="text-3xl md:text-4xl lg:text-5xl mb-6">
          {t('What is', 'ما هو')}{' '}
          <span className="bg-gradient-to-r from-chart-1 to-chart-2 bg-clip-text text-transparent">
            {t('Eduverse?', 'إيدوفيرس؟')}
          </span>
        </h2>
        <div className="space-y-4 text-lg text-muted-foreground items-center lg:items-start max-w-4xl">
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
    </section>
  );
}

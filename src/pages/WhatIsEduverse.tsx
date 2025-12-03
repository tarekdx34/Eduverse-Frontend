import { useContext } from 'react';
import { LanguageContext } from '@/context/LanguageContext';

export default function WhatIsEduverse() {
  const { language } = useContext(LanguageContext);
  const isArabic = language === 'ar';

  const content = {
    en: {
      title: 'What is Eduverse?',
      description:
        'A comprehensive learning management system powered by AI, designed for universities and scalable for multi-institution use. Accessible on web and mobile with seamless synchronization.',
      features: [
        {
          icon: 'neurology',
          title: 'AI-Powered Platform',
          description:
            'Leverage artificial intelligence for personalized learning paths and automated grading.',
        },
        {
          icon: 'school',
          title: 'University Focused',
          description:
            'Built from the ground up to meet the complex needs of higher education institutions.',
        },
        {
          icon: 'sync',
          title: 'Seamless Synchronization',
          description:
            'Access your courses and materials anytime, anywhere, on any device.',
        },
      ],
      imageAlt:
        'An abstract 3D illustration of interconnected nodes and glowing lines, representing AI, connectivity, and collaboration in a virtual space.',
    },
    ar: {
      title: 'ما هي Eduverse؟',
      description:
        'نظام إدارة تعلم شامل مدعوم بالذكاء الاصطناعي، مصمم للجامعات وقابل للتوسع لاستخدام متعدد المؤسسات. يمكن الوصول إليه على الويب والجوال مع مزامنة سلسة.',
      features: [
        {
          icon: 'neurology',
          title: 'منصة مدعومة بالذكاء الاصطناعي',
          description:
            'استفد من الذكاء الاصطناعي لمسارات التعلم الشخصية والتصحيح الآلي.',
        },
        {
          icon: 'school',
          title: 'مركز على الجامعات',
          description:
            'مبني من الصفر لتلبية الاحتياجات المعقدة لمؤسسات التعليم العالي.',
        },
        {
          icon: 'sync',
          title: 'مزامنة سلسة',
          description:
            'يمكنك الوصول إلى دوراتك ومواداك في أي وقت وفي أي مكان على أي جهاز.',
        },
      ],
      imageAlt:
        'رسم توضيحي مجرد ثلاثي الأبعاد لعقد مترابطة وخطوط متوهجة، يمثل الذكاء الاصطناعي والاتصال والتعاون في الفضاء الافتراضي.',
    },
  };

  const currentContent = content[isArabic ? 'ar' : 'en'];

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden bg-background-light dark:bg-background-dark">
      <div className="layout-container flex h-full grow flex-col">
        <main className="flex flex-1 justify-center py-10 md:py-20">
          <div className="layout-content-container flex flex-col w-full max-w-6xl px-4 md:px-8">
            <section className="flex flex-col gap-12 @container">
              <div
                className={`grid grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-16 ${
                  isArabic ? 'flex-row-reverse' : ''
                }`}
              >
                <div className={isArabic ? 'md:col-span-1 md:order-2' : ''}>
                  <div className="flex justify-center">
                    <img
                      className="w-full max-w-md rounded-xl object-cover shadow-lg"
                      alt={currentContent.imageAlt}
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDVMjC_9PY6ElBumTvLZ4w_KugJJ9BC2jJyKltIIhxxn-SarF7Kx2MYN51Rgg6DCRyl9Ez3l77dWEW36p6UZI6eao8mNmS7eJYF15COcUzTqmu0x_acKtu4mgcHMGJKIsHIcfSaCACuBYxRvtL7dfBaGOd13n-Hf_e58dMjj_Nkx0yywKLQ5vcq_90s4R8cUITb1RrPyZwEl1_1QxXrGotiKrz28HAGiRscUo0TnGklpzX4C-XJpYdmvhqCeRCnAuhBWvvugVSsY1o"
                    />
                  </div>
                </div>
                <div
                  className={`flex flex-col items-center gap-6 ${
                    isArabic ? 'md:col-span-1 md:order-1' : ''
                  }`}
                >
                  <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 @[480px]:text-4xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em] max-w-md text-center">
                    {currentContent.title}
                  </h2>
                  <p className="text-base font-normal leading-relaxed text-slate-700 dark:text-slate-300 max-w-md">
                    {currentContent.description}
                  </p>
                  <div className="flex flex-col gap-4 pt-2">
                    {currentContent.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-primary/20">
                          <span
                            className="material-symbols-outlined text-xl"
                            data-icon={feature.icon}
                          >
                            {feature.icon}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                            {feature.title}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

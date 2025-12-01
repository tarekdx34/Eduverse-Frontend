import { Button } from '../../../components/ui/button';
import { useLanguage } from '../contexts/LanguageContext';

export function UserRolesSection() {
  const { t } = useLanguage();

  const roles = [
    {
      name: t('Student', 'الطالب'),
      description: t(
        'Unlock your potential with personalized learning paths, AI study aids, and seamless collaboration tools.',
        'افتح إمكانياتك من خلال مسارات التعلم الشخصية وأدوات الدراسة المدعومة بالذكاء الاصطناعي وأدوات التعاون السلسة.'
      ),
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBA5fHdeEIDY7kh6MlASepCK4A9jYa30Ty2emUxyk6QS5-zgNau7Ny8jDIIjLpr9FKuYIOZVd2Q-JalMiXkfJQDMBBC7EOP-s5K1jGydjv5iv7-fA71x-Wm9mN8bJjXgoICYRFxr0GgfeNN1mc0VfNGn5anwIaUmp2bZNlqUqZxQymLdVTElgjHx6ZAscBCY6ItNhJiMdksa-76L7dedcOlgLl0RHgDosVHVzomnk79qSb4ADLswtpIuB3J3zHVqR7KQ_j-CDbB3s8',
    },
    {
      name: t('Instructor', 'المدرس'),
      description: t(
        'Craft engaging courses effortlessly with AI-powered content creation, automated grading, and insightful analytics.',
        'اصنع دورات جذابة بسهولة باستخدام إنشاء محتوى مدعوم بالذكاء الاصطناعي والتصحيح الآلي والتحليلات الثاقبة.'
      ),
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAEGbYGjneIaOoGv4YzePMYhz9CFPWtkXfY34C6TABiFP6t4YXYQX_wOnQ6YhtInk6HexzZA2pe-uqsbqAcfK1ClXq2IeJqXdamv73Rw_CO6Vf_vAangu4DYSp8ShyH8AU2hvoTAIyaJtKIxQCxbfJkcrFwYJSYWiuMpNU9_5sfmpfmuJ-biV1XApa3fqlPf8Ir303reg_wfbT6CTg2slI6CCjMfwxXX9Ih5W7I_Q9y7Q0gvU5ksZRyNGTUJruoFD30uNxLCic_IOc',
    },
    {
      name: t('Teaching Assistant', 'مساعد التدريس'),
      description: t(
        'Support student success with efficient grading tools, streamlined communication, and powerful support features.',
        'دعم نجاح الطلاب من خلال أدوات التصحيح الفعالة والتواصل المحسّن والميزات الدعم القوية.'
      ),
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCicRmm-YDXhGbNWUiKkAq0ALeUzm276yTTu1OojKZIWVjB7KJ4ne-W_f6YIrnc6ladWx8AXmifFjNe2UvryYyUdIDElQQIV0lp5LaLjunXRX11LnSMZs7bez-xTMrWFuc-8omneEzmA4mxWrghvjFjT_rGXoy7ERxA8qvqxPIrhHteiDmGN2qk7BGUyE9vSMfv8QEkh-mJ4ZWm-V4JIMBw3z7NE1Njd04b30miGfgjORgpjUIBig-97hnjtzXIvFQ0ZyvKP4N5jIU',
    },
    {
      name: t('Administrator', 'المسؤول'),
      description: t(
        'Gain a holistic view of your institution with powerful analytics, simplified workflows, and curriculum management.',
        'احصل على رؤية شاملة لمؤسستك من خلال التحليلات القوية وتبسيط سير العمل وإدارة المناهج.'
      ),
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCcAvdfgCht8sR0kAqDJlohCiYoZGKHaSSTQpC8sa_TUYbUyDfcsxPZ5K5u8MMQwnT336Y2c3aNKSK_RUAqghF8VTyBc5v2GuzE_bPmzPAd46hT_J_03svdGldr1LQPZmtmVxNmlUqtjVtIuKkJFuiNkYQSDCA-uqhTiXM4my2Qe5QTKSMH6zwyNkKaSQrvfQP0kFqYgoLTabjfDnIM1M2xTE6DOFYUlkkiT4Q76U_6hp9xVVGz_yggY9ogQpGS11XTLlp4y1JEGuk',
    },
    {
      name: t('IT Admin', 'مدير تكنولوجيا المعلومات'),
      description: t(
        'Ensure a secure and stable learning environment with seamless integration, robust security, and easy system management.',
        'ضمان بيئة تعلم آمنة واستقرار النظام من خلال التكامل السلس والأمان القوي وإدارة النظام السهلة.'
      ),
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAUHNd1A1aJ2udA8UZldF84GS6LrCcxYo_J_gDvUPkzrQ2_mfBZWYFDXKKL2oDQ2tzv4KpXfhl6Zx15qmE8IcyaazzRanw1-lYiTYB1E9UDWqiiYc3sHwj-iCn5gxHry1AcL_NVcwpl3aUeDt7sZwErI1PzaykYhCoiJvu3BZ0McFe4hSgTAZOb0JXl1Bxh9lkGO-J93ZuzQtLQbY_jvuiv7Dh4DvWneynwDfO1aGf13DZzCjIk4tTUiZv7BxwNHvbIoelDRwEUowI',
    },
  ];

  return (
    <section className="relative flex justify-center py-16 sm:py-24 overflow-hidden">
      <div className="flex flex-col items-center max-w-6xl flex-1 px-4 sm:px-6 lg:px-8">
        <h2 className="text-foreground text-3xl sm:text-4xl font-bold leading-tight tracking-tight text-center max-w-2xl">
          {t('Designed for Everyone in Academia', 'مصمم للجميع في الأوساط الأكاديمية')}
        </h2>
        <p className="text-muted-foreground text-base md:text-lg font-normal leading-normal pt-4 pb-12 text-center max-w-3xl">
          {t(
            'Eduverse is tailored to meet the unique needs of every member of the university community, empowering each role with specialized AI-driven tools.',
            'تم تصميم EduVerse لتلبية الاحتياجات الفريدة لكل عضو في المجتمع الجامعي، مما يمكن كل دور من الأدوات المتخصصة المدعومة بالذكاء الاصطناعي.'
          )}
        </p>

        <div className="w-full flex justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 w-full">
            {roles.map((role, index) => (
              <div
                key={index}
                className="flex flex-col gap-4 rounded-xl bg-card shadow-sm border border-border p-6 text-center items-center group transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-border">
                  <img className="w-full h-full object-cover" src={role.image} alt={role.name} />
                </div>
                <p className="text-foreground text-lg font-bold leading-normal">{role.name}</p>
                <p className="text-muted-foreground text-sm font-normal leading-normal flex-grow">
                  {role.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

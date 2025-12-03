import { Button } from '../../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export function PricingSection() {
  const { t, language } = useLanguage();

  const plans = [
    {
      name: { en: 'Starter', ar: 'المبتدئ' },
      price: { en: 'Free', ar: 'مجاناً' },
      description: {
        en: 'Perfect for small departments testing the platform',
        ar: 'مثالي للأقسام الصغيرة لتجربة المنصة',
      },
      features: {
        en: [
          'Up to 100 students',
          '5 instructors',
          'Basic AI features',
          'Email support',
          'Community access',
        ],
        ar: [
          'حتى 100 طالب',
          '5 مدرسين',
          'ميزات الذكاء الاصطناعي الأساسية',
          'دعم البريد الإلكتروني',
          'الوصول إلى المجتمع',
        ],
      },
      cta: { en: 'Get Started Free', ar: 'ابدأ مجاناً' },
      popular: false,
    },
    {
      name: { en: 'Professional', ar: 'المحترف' },
      price: { en: '$299', ar: '299$' },
      description: { en: 'Best for medium-sized universities', ar: 'الأفضل للجامعات المتوسطة' },
      features: {
        en: [
          'Up to 1,000 students',
          '50 instructors',
          'All AI features',
          'Advanced analytics',
          'Priority support',
          'Custom branding',
          'API access',
        ],
        ar: [
          'حتى 1,000 طالب',
          '50 مدرس',
          'جميع ميزات الذكاء الاصطناعي',
          'تحليلات متقدمة',
          'دعم ذو أولوية',
          'علامة تجارية مخصصة',
          'الوصول إلى API',
        ],
      },
      cta: { en: 'Start Free Trial', ar: 'ابدأ تجربة مجانية' },
      popular: true,
    },
    {
      name: { en: 'Enterprise', ar: 'المؤسسات' },
      price: { en: 'Custom', ar: 'مخصص' },
      description: {
        en: 'For large universities with advanced needs',
        ar: 'للجامعات الكبيرة ذات الاحتياجات المتقدمة',
      },
      features: {
        en: [
          'Unlimited students',
          'Unlimited instructors',
          'Enterprise AI features',
          'Dedicated support',
          'SLA guarantee',
          'Custom integrations',
          'On-premise deployment',
          'Training & onboarding',
        ],
        ar: [
          'طلاب غير محدودين',
          'مدرسين غير محدودين',
          'ميزات الذكاء الاصطناعي للمؤسسات',
          'دعم مخصص',
          'ضمان اتفاقية مستوى الخدمة',
          'تكاملات مخصصة',
          'النشر على الخوادم المحلية',
          'التدريب والإعداد',
        ],
      },
      cta: { en: 'Contact Sales', ar: 'اتصل بالمبيعات' },
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-20 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl tracking-tight mb-4">
            {t('Simple, transparent', 'بسيط وشفاف')}{' '}
            <span className="bg-gradient-to-r from-chart-1 to-chart-2 bg-clip-text text-transparent">
              {t('pricing', 'التسعير')}
            </span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
            {t(
              'Choose the plan that fits your institution size and needs. Start free and scale as you grow.',
              'اختر الخطة التي تناسب حجم مؤسستك واحتياجاتها. ابدأ مجانًا وقم بالتوسع مع نموك.'
            )}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-chart-1 to-chart-2">
                  {t('Most Popular', 'الأكثر شعبية')}
                </Badge>
              )}
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-xl mb-2">{plan.name[language]}</CardTitle>
                <div className="mb-2">
                  <span className="text-3xl font-bold">{plan.price[language]}</span>
                  {plan.price.en !== 'Free' && plan.price.en !== 'Custom' && (
                    <span className="text-muted-foreground">/{t('month', 'شهر')}</span>
                  )}
                </div>
                <CardDescription>{plan.description[language]}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  {plan.features[language].map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant={plan.popular ? 'default' : 'outline'}>
                  {plan.cta[language]}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            {t(
              'All plans include bilingual support (Arabic & English)',
              'جميع الخطط تشمل الدعم ثنائي اللغة (العربية والإنجليزية)'
            )}
          </p>
          <Button variant="link">{t('Compare all features →', 'مقارنة جميع الميزات ←')}</Button>
        </div>
      </div>
    </section>
  );
}

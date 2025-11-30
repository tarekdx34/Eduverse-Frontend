import { Globe, Smartphone, Shield } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";

function CountUpAnimation({ end, suffix, duration = 2000 }: { end: number; suffix: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const countRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;
            let startTime: number | null = null;
            
            const animate = (currentTime: number) => {
              if (!startTime) startTime = currentTime;
              const progress = Math.min((currentTime - startTime) / duration, 1);
              
              setCount(Math.floor(progress * end));
              
              if (progress < 1) {
                requestAnimationFrame(animate);
              }
            };
            
            requestAnimationFrame(animate);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (countRef.current) {
      observer.observe(countRef.current);
    }

    return () => observer.disconnect();
  }, [end, duration]);

  return (
    <div ref={countRef} className="text-4xl md:text-5xl lg:text-6xl bg-gradient-to-r from-chart-1 to-chart-2 bg-clip-text text-transparent">
      {count}{suffix}
    </div>
  );
}

export function BenefitsSection() {
  const { t, language } = useLanguage();
  
  const benefits = [
    {
      icon: Globe,
      title: { en: "Bilingual Support", ar: "دعم ثنائي اللغة" },
      stat: "2",
      suffix: language === "en" ? " Languages" : " لغة",
      description: { en: "Full Arabic & English support for seamless learning", ar: "دعم كامل للعربية والإنجليزية للتعلم السلس" }
    },
    {
      icon: Smartphone,
      title: { en: "Cross-Platform", ar: "متعدد المنصات" },
      stat: "100",
      suffix: "%",
      description: { en: "Access anywhere on web, mobile, and tablet", ar: "الوصول في أي مكان على الويب والجوال والكمبيوتر اللوحي" }
    },
    {
      icon: Shield,
      title: { en: "Secure & Encrypted", ar: "آمن ومشفر" },
      stat: "256",
      suffix: "-bit",
      description: { en: "Bank-level encryption for your data safety", ar: "تشفير على مستوى البنوك لأمان بياناتك" }
    }
  ];

  return (
    <section className="py-20 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl mb-4">
            {t("Platform", "المنصة")}{" "}
            <span className="bg-gradient-to-r from-chart-1 to-chart-2 bg-clip-text text-transparent">
              {t("Benefits", "الفوائد")}
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("Built for modern educational institutions", "مصممة للمؤسسات التعليمية الحديثة")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="text-center group"
              >
                <div className="mb-6 inline-flex p-4 bg-gradient-to-br from-chart-1/10 to-chart-2/10 rounded-2xl border border-border group-hover:scale-110 transition-transform">
                  <Icon className="h-12 w-12 text-chart-1" />
                </div>
                
                <CountUpAnimation 
                  end={parseInt(benefit.stat)} 
                  suffix={benefit.suffix} 
                />
                
                <h3 className="mt-4 mb-3">
                  {benefit.title[language]}
                </h3>
                
                <p className="text-sm text-muted-foreground">
                  {benefit.description[language]}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

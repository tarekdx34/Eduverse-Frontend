import { GraduationCap, BookOpen, Users, UserCog, Settings } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";

export function UserRolesSection() {
  const [flippedCard, setFlippedCard] = useState<number | null>(null);
  const { t, language } = useLanguage();

  const userRoles = [
    {
      icon: GraduationCap,
      title: { en: "Student", ar: "طالب" },
      color: "from-chart-1 to-chart-2",
      bgColor: "from-chart-1/10 to-chart-2/10",
      features: {
        en: ["Access courses", "Submit assignments", "Track progress", "AI assistance"],
        ar: ["الوصول إلى الدورات", "تقديم الواجبات", "تتبع التقدم", "مساعدة الذكاء الاصطناعي"]
      }
    },
    {
      icon: BookOpen,
      title: { en: "Instructor", ar: "مدرس" },
      color: "from-chart-2 to-chart-3",
      bgColor: "from-chart-2/10 to-chart-3/10",
      features: {
        en: ["Create content", "Grade assignments", "Analytics", "AI tools"],
        ar: ["إنشاء المحتوى", "تقييم الواجبات", "التحليلات", "أدوات الذكاء الاصطناعي"]
      }
    },
    {
      icon: Users,
      title: { en: "Teaching Assistant", ar: "مساعد تدريس" },
      color: "from-chart-3 to-chart-4",
      bgColor: "from-chart-3/10 to-chart-4/10",
      features: {
        en: ["Support students", "Grade work", "Monitor classes", "Assist instructors"],
        ar: ["دعم الطلاب", "تقييم العمل", "مراقبة الفصول", "مساعدة المدرسين"]
      }
    },
    {
      icon: UserCog,
      title: { en: "Admin", ar: "مسؤول" },
      color: "from-chart-4 to-chart-5",
      bgColor: "from-chart-4/10 to-chart-5/10",
      features: {
        en: ["Manage users", "Oversee courses", "Reports", "Configure system"],
        ar: ["إدارة المستخدمين", "الإشراف على الدورات", "التقارير", "تكوين النظام"]
      }
    },
    {
      icon: Settings,
      title: { en: "IT Admin", ar: "مسؤول تقني" },
      color: "from-chart-5 to-chart-1",
      bgColor: "from-chart-5/10 to-chart-1/10",
      features: {
        en: ["System config", "Security", "Integrations", "Maintenance"],
        ar: ["تكوين النظام", "الأمان", "التكاملات", "الصيانة"]
      }
    }
  ];

  return (
    <section id="roles" className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl mb-4">
            {t("User", "المستخدم")}{" "}
            <span className="bg-gradient-to-r from-chart-1 to-chart-2 bg-clip-text text-transparent">
              {t("Roles", "الأدوار")}
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("Tailored experiences for every role", "تجارب مخصصة لكل دور")}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6 max-w-6xl mx-auto">
          {userRoles.map((role, index) => {
            const Icon = role.icon;
            const isFlipped = flippedCard === index;
            
            return (
              <div
                key={index}
                className="w-64 h-80 perspective-1000"
                onMouseEnter={() => setFlippedCard(index)}
                onMouseLeave={() => setFlippedCard(null)}
                style={{ perspective: '1000px' }}
              >
                <div 
                  className={`relative w-full h-full transition-transform duration-500 transform-gpu ${
                    isFlipped ? '[transform:rotateY(180deg)]' : ''
                  }`}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Front of Card */}
                  <div 
                    className={`absolute inset-0 w-full h-full bg-gradient-to-br ${role.bgColor} border border-border rounded-2xl p-6 flex flex-col items-center justify-center shadow-lg`}
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <div className={`mb-6 p-6 bg-gradient-to-br ${role.color} rounded-full`}>
                      <Icon className="h-16 w-16 text-white" />
                    </div>
                    <h3 className="mb-2 text-center">
                      {role.title[language]}
                    </h3>
                    <div className="mt-4 text-xs text-muted-foreground">
                      {t("Hover to see details", "مرر للعرض التفاصيل")}
                    </div>
                  </div>

                  {/* Back of Card */}
                  <div 
                    className={`absolute inset-0 w-full h-full bg-gradient-to-br ${role.color} rounded-2xl p-6 shadow-lg [transform:rotateY(180deg)]`}
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <h3 className="mb-4 text-white text-center">
                      {role.title[language]}
                    </h3>
                    <ul className="space-y-3">
                      {role.features[language].map((feature, idx) => (
                        <li key={idx} className="flex items-center text-white text-sm">
                          <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
